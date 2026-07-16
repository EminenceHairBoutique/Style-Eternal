-- ============================================================================
-- Style Eternal — Orders reconciliation
--
-- WHY: The codebase historically carried three incompatible pictures of the
-- `orders` table:
--   1. 20260530120000_admin_panel.sql   → customer_email / total (dollars) /
--      status CHECK (pending|processing|fulfilled|cancelled) / stripe_payment_id
--   2. api/stripe-webhook.js            → email / amount_total (cents) /
--      order_number / stripe_session_id / items JSONB / status = 'paid'
--   3. Readers (AccountDashboard, Admin*) → a mix of both, plus order_items
--      rows that were never written.
-- On a migration-built database the webhook INSERT fails outright (unknown
-- columns + CHECK violation), so orders are never persisted. The live database
-- has been hand-patched, so this migration must converge ANY starting state
-- (fresh, migration-built, or hand-patched prod) to one canonical superset.
--
-- CANONICAL CONVENTIONS after this migration:
--   • amount_total BIGINT (cents) is the money source of truth;
--     subtotal/shipping/tax/total NUMERIC (dollars) are kept in sync for
--     compatibility with the original admin schema.
--   • email is the canonical customer email; customer_email mirrors it.
--   • status ∈ (pending|paid|processing|shipped|fulfilled|cancelled|refunded).
--   • stripe_session_id and order_number are UNIQUE (partial, NULLs allowed
--     for legacy rows).
--
-- Every statement is guarded/idempotent. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- is_admin() helper, re-asserted so this file stands alone even on a drifted
-- database that never ran 20260531025000 (a policy below references it, and
-- CREATE POLICY validates the function exists).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles: loyalty columns (used by the webhook + AccountDashboard, but
-- created by no prior migration)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_points               INT     NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lifetime_spend_cents         BIGINT  NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_purchase_bonus_awarded BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------------------------
-- orders: converge to the superset schema
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number          TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id     TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_payment_id     TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id               UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email                 TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email        TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name         TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS amount_total          BIGINT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency              TEXT DEFAULT 'usd';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items                 JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS consent               JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address      JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal              NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping              NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax                   NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total                 NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status                TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code         TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes                 TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- user_id FK (only if missing; name-stable so re-runs are no-ops)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_user_id_fkey' AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Widen the status CHECK. The original constraint name is unknown on a
-- hand-patched database, so drop every CHECK on orders that references status,
-- then recreate the canonical one.
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','paid','processing','shipped','fulfilled','cancelled','refunded'));

-- Backfill across the two column families (both directions).
UPDATE public.orders SET email = customer_email
  WHERE email IS NULL AND customer_email IS NOT NULL;
UPDATE public.orders SET customer_email = email
  WHERE customer_email IS NULL AND email IS NOT NULL;
UPDATE public.orders SET amount_total = ROUND(total * 100)
  WHERE amount_total IS NULL AND COALESCE(total, 0) > 0;
UPDATE public.orders SET total = amount_total / 100.0
  WHERE COALESCE(total, 0) = 0 AND COALESCE(amount_total, 0) > 0;
UPDATE public.orders SET stripe_payment_id = stripe_payment_intent
  WHERE stripe_payment_id IS NULL AND stripe_payment_intent IS NOT NULL;
UPDATE public.orders SET stripe_payment_intent = stripe_payment_id
  WHERE stripe_payment_intent IS NULL AND stripe_payment_id IS NOT NULL;

-- Uniqueness. Partial indexes tolerate legacy NULLs. If either CREATE fails
-- with a duplicate error, run the RUNBOOK.md pre-check queries to find and
-- merge the duplicate rows first.
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_uidx
  ON public.orders (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_uidx
  ON public.orders (order_number) WHERE order_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_user_idx    ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_email_idx   ON public.orders (email);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON public.orders (created_at DESC);

-- ---------------------------------------------------------------------------
-- Collision-safe order numbers: SE-<seq>. Seed the sequence past any existing
-- SE-<digits> order number so old and new schemes never collide.
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 100001;

SELECT setval(
  'public.order_number_seq',
  GREATEST(
    100001,
    COALESCE(
      (SELECT MAX((regexp_match(order_number, '^SE-(\d+)$'))[1]::BIGINT)
       FROM public.orders
       WHERE order_number ~ '^SE-\d+$'),
      100000
    ) + 1
  ),
  false
);

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'SE-' || nextval('public.order_number_seq')::TEXT;
$$;

REVOKE ALL ON FUNCTION public.next_order_number() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.next_order_number() FROM anon;
REVOKE ALL ON FUNCTION public.next_order_number() FROM authenticated;

-- ---------------------------------------------------------------------------
-- order_items: ensure the table exists with the columns the webhook writes
-- and the dashboards read. product_slug lets us map back to the catalog
-- (and powers the reviews verified-purchase check).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE
);

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_id   UUID;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_slug TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant      TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS quantity     INT NOT NULL DEFAULT 1;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit_price   NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS line_total   NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_slug_idx  ON public.order_items (product_slug);

-- ---------------------------------------------------------------------------
-- Atomic inventory decrement, called by the Stripe webhook after payment.
-- Floors at 0; unknown slugs are a no-op.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_stock(p_slug TEXT, p_qty INT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products
  SET stock = GREATEST(stock - GREATEST(COALESCE(p_qty, 0), 0), 0),
      updated_at = NOW()
  WHERE slug = p_slug;
$$;

REVOKE ALL ON FUNCTION public.decrement_stock(TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrement_stock(TEXT, INT) FROM anon;
REVOKE ALL ON FUNCTION public.decrement_stock(TEXT, INT) FROM authenticated;

-- ---------------------------------------------------------------------------
-- discount_codes: Stripe bridge columns + atomic usage counter.
-- The admin UI creates codes locally; api/admin/discounts.js syncs them to
-- Stripe (coupon + promotion code); the webhook attributes redemptions here.
-- ---------------------------------------------------------------------------
ALTER TABLE public.discount_codes ADD COLUMN IF NOT EXISTS stripe_coupon_id         TEXT;
ALTER TABLE public.discount_codes ADD COLUMN IF NOT EXISTS stripe_promotion_code_id TEXT;
ALTER TABLE public.discount_codes ADD COLUMN IF NOT EXISTS sync_status              TEXT NOT NULL DEFAULT 'unsynced';

CREATE OR REPLACE FUNCTION public.increment_discount_usage(p_promo_id TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.discount_codes
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE stripe_promotion_code_id = p_promo_id;
$$;

REVOKE ALL ON FUNCTION public.increment_discount_usage(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_discount_usage(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.increment_discount_usage(TEXT) FROM authenticated;

-- ---------------------------------------------------------------------------
-- email_signups: written by api/subscribe.js but never created by a
-- migration (it only existed as a LAUNCH_CHECKLIST snippet).
-- Service-role writes; admins read; no anon access.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_signups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  source     TEXT,
  path       TEXT,
  utm        JSONB,
  consent    JSONB,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_signups_created_idx ON public.email_signups (created_at DESC);

ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_signups_admin_all ON public.email_signups;
CREATE POLICY email_signups_admin_all ON public.email_signups
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

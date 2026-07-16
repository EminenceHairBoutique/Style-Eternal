-- ============================================================================
-- Style Eternal — Fulfillment, gift cards / store credit, review media,
-- referrals, and a critical profiles privilege fix.
--
-- ⚠ SECURITY (apply promptly): profiles_self_update (20260530120000) filters
-- ROWS, not COLUMNS — any signed-in user could UPDATE their own row and set
-- is_admin = TRUE (or inflate loyalty_points) through the anon client. RLS
-- cannot restrict columns, and Supabase grants UPDATE on every column to the
-- authenticated role by default. The protect_profile_columns trigger below
-- closes this while preserving legitimate service-role writes (webhook) and
-- admin-panel toggles. RUNBOOK includes a post-check for unexpected admins.
--
-- Everything is guarded/idempotent. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: new columns first (the guard trigger references them)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_credit_cents  BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code       TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id  TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_uidx
  ON public.profiles (referral_code) WHERE referral_code IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 🔒 Privilege guard: non-admin clients may update their own profile row but
-- never its privileged columns. Service-role (webhook) and admins pass.
-- Direct DB access (SQL editor / migrations, no PostgREST JWT) also passes.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role TEXT;
BEGIN
  jwt_role := COALESCE(
    current_setting('request.jwt.claim.role', true),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  );

  -- No PostgREST JWT (SQL editor, migrations) or service role or admin: allow.
  IF jwt_role IS NULL OR jwt_role = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.is_admin                    IS DISTINCT FROM OLD.is_admin
    OR NEW.loyalty_points            IS DISTINCT FROM OLD.loyalty_points
    OR NEW.lifetime_spend_cents      IS DISTINCT FROM OLD.lifetime_spend_cents
    OR NEW.first_purchase_bonus_awarded IS DISTINCT FROM OLD.first_purchase_bonus_awarded
    OR NEW.store_credit_cents        IS DISTINCT FROM OLD.store_credit_cents
    OR NEW.referral_code             IS DISTINCT FROM OLD.referral_code
    OR NEW.stripe_customer_id        IS DISTINCT FROM OLD.stripe_customer_id
    OR NEW.account_tier              IS DISTINCT FROM OLD.account_tier
    OR NEW.partner_status            IS DISTINCT FROM OLD.partner_status
    OR NEW.partner_tier              IS DISTINCT FROM OLD.partner_tier
  THEN
    RAISE EXCEPTION 'Cannot modify protected profile fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_columns ON public.profiles;
CREATE TRIGGER profiles_protect_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- ---------------------------------------------------------------------------
-- Orders: fulfillment tracking
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number  TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_carrier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url     TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at       TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- Returns
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.returns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email       TEXT,
  items       JSONB NOT NULL DEFAULT '[]'::jsonb,
  reason      TEXT,
  status      TEXT NOT NULL DEFAULT 'requested'
                CHECK (status IN ('requested','approved','rejected','received','refunded')),
  admin_notes TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS returns_order_idx  ON public.returns (order_id);
CREATE INDEX IF NOT EXISTS returns_user_idx   ON public.returns (user_id);
CREATE INDEX IF NOT EXISTS returns_status_idx ON public.returns (status);

DROP TRIGGER IF EXISTS returns_set_updated_at ON public.returns;
CREATE TRIGGER returns_set_updated_at
  BEFORE UPDATE ON public.returns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- A customer may open a return only for their own order, and read their own.
DROP POLICY IF EXISTS returns_owner_insert ON public.returns;
CREATE POLICY returns_owner_insert ON public.returns
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS returns_owner_select ON public.returns;
CREATE POLICY returns_owner_select ON public.returns
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS returns_admin_all ON public.returns;
CREATE POLICY returns_admin_all ON public.returns
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Reviews: media attachments (photos / short video), stored in the
-- review-media bucket; entries are {type: 'image'|'video', path}.
-- ---------------------------------------------------------------------------
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-media', 'review-media', TRUE,
  26214400, -- 25MB
  ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/webm']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS review_media_public_read ON storage.objects;
CREATE POLICY review_media_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'review-media');

-- Authenticated users write only inside their own <uid>/ folder.
DROP POLICY IF EXISTS review_media_owner_insert ON storage.objects;
CREATE POLICY review_media_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'review-media'
    AND name LIKE auth.uid()::text || '/%'
  );

DROP POLICY IF EXISTS review_media_owner_delete ON storage.objects;
CREATE POLICY review_media_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'review-media'
    AND name LIKE auth.uid()::text || '/%'
  );

-- ---------------------------------------------------------------------------
-- Gift cards + store credit
-- Codes are secrets: no public/owner SELECT — redemption goes through the
-- SECURITY DEFINER RPC below, admins manage via returns_admin-style policy.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  amount_cents      BIGINT NOT NULL CHECK (amount_cents > 0),
  status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','redeemed','void')),
  purchaser_email   TEXT,
  recipient_email   TEXT,
  order_number      TEXT,
  stripe_session_id TEXT,
  redeemed_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gift_cards_status_idx ON public.gift_cards (status);

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gift_cards_admin_all ON public.gift_cards;
CREATE POLICY gift_cards_admin_all ON public.gift_cards
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Redeem a gift card into the caller's store credit. Row-locked so a code
-- can never be redeemed twice.
CREATE OR REPLACE FUNCTION public.redeem_gift_card(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card public.gift_cards%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sign in to redeem a gift card.');
  END IF;

  SELECT * INTO v_card
  FROM public.gift_cards
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'That code was not recognized.');
  END IF;
  IF v_card.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'This gift card has already been redeemed.');
  END IF;

  UPDATE public.gift_cards
  SET status = 'redeemed', redeemed_by = auth.uid(), redeemed_at = NOW()
  WHERE id = v_card.id;

  UPDATE public.profiles
  SET store_credit_cents = store_credit_cents + v_card.amount_cents
  WHERE id = auth.uid();

  RETURN jsonb_build_object('ok', true, 'amount_cents', v_card.amount_cents);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_gift_card(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_gift_card(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.redeem_gift_card(TEXT) TO authenticated;

-- Deduct store credit after a successful checkout (webhook, service role).
-- Clamps at zero and returns the amount actually deducted.
CREATE OR REPLACE FUNCTION public.deduct_store_credit(p_user UUID, p_amount BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance BIGINT;
  v_deduct  BIGINT;
BEGIN
  SELECT store_credit_cents INTO v_balance
  FROM public.profiles
  WHERE id = p_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_deduct := LEAST(GREATEST(COALESCE(p_amount, 0), 0), COALESCE(v_balance, 0));

  IF v_deduct > 0 THEN
    UPDATE public.profiles
    SET store_credit_cents = store_credit_cents - v_deduct
    WHERE id = p_user;
  END IF;

  RETURN v_deduct;
END;
$$;

REVOKE ALL ON FUNCTION public.deduct_store_credit(UUID, BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.deduct_store_credit(UUID, BIGINT) FROM anon;
REVOKE ALL ON FUNCTION public.deduct_store_credit(UUID, BIGINT) FROM authenticated;

-- Generate (once) and return the caller's referral code.
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_try  INT := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT referral_code INTO v_code FROM public.profiles WHERE id = auth.uid();
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  LOOP
    v_try := v_try + 1;
    v_code := 'SE' || UPPER(SUBSTR(MD5(gen_random_uuid()::text), 1, 6));
    BEGIN
      UPDATE public.profiles SET referral_code = v_code WHERE id = auth.uid();
      RETURN v_code;
    EXCEPTION WHEN unique_violation THEN
      IF v_try > 5 THEN RAISE; END IF;
    END;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_referral_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_referral_code() FROM anon;
GRANT EXECUTE ON FUNCTION public.ensure_referral_code() TO authenticated;

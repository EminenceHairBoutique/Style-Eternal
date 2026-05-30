-- ============================================================================
-- Style Eternal — Admin Panel migration
-- Adds: profiles.is_admin, products, orders, order_items, discount_codes
-- Plus: RLS policies (admin-write, public-read where relevant), storage bucket
-- ============================================================================

-- ---------- profiles ---------------------------------------------------------
-- Mirrors auth.users 1:1, with the extra app-level fields the storefront and
-- admin panel read. Idempotent so re-running this migration is safe.
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  account_tier    TEXT DEFAULT 'customer',
  partner_status  TEXT DEFAULT 'none',
  partner_tier    TEXT,
  is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill any columns the code reads, in case an older profiles table exists.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email          TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_tier   TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_status TEXT DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_tier   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin       BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Auto-create a profile row whenever a new auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill rows for any auth users created before this migration ran.
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- RLS for profiles: a user can read/update their own row; admins can do anything.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_self_read ON public.profiles;
CREATE POLICY profiles_self_read ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- ---------- products ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT DEFAULT '',
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10, 2),
  stock           INT NOT NULL DEFAULT 0,
  category        TEXT,
  variants        JSONB NOT NULL DEFAULT '[]'::jsonb,
  images          JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_active_idx ON public.products (is_active);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);

-- ---------- orders -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email    TEXT,
  customer_name     TEXT,
  shipping_address  JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtotal          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax               NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total             NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'fulfilled', 'cancelled')),
  stripe_payment_id TEXT,
  discount_code     TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON public.orders (created_at DESC);

-- ---------- order_items ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant     TEXT,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  line_total  NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);

-- ---------- discount_codes ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  type            TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value           NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  usage_limit     INT,
  usage_count     INT NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- updated_at trigger ----------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- Row-Level Security
-- ============================================================================
-- Admin check helper: a row is admin-writable when the requester's profile
-- has is_admin=true. We inline the subquery in policies; no SECURITY DEFINER
-- function so this stays auditable.

ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- products: anyone can read active rows; admins can read/write all
DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read ON public.products
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS products_admin_all ON public.products;
CREATE POLICY products_admin_all ON public.products
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- orders: owner can read their own; admins can read/write all
DROP POLICY IF EXISTS orders_owner_read ON public.orders;
CREATE POLICY orders_owner_read ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS orders_admin_all ON public.orders;
CREATE POLICY orders_admin_all ON public.orders
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- order_items: same shape as parent order
DROP POLICY IF EXISTS order_items_owner_read ON public.order_items;
CREATE POLICY order_items_owner_read ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

DROP POLICY IF EXISTS order_items_admin_all ON public.order_items;
CREATE POLICY order_items_admin_all ON public.order_items
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- discount_codes: public can read active+unexpired codes (for checkout validation);
-- admins can read/write all
DROP POLICY IF EXISTS discount_codes_public_read ON public.discount_codes;
CREATE POLICY discount_codes_public_read ON public.discount_codes
  FOR SELECT USING (
    is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())
  );

DROP POLICY IF EXISTS discount_codes_admin_all ON public.discount_codes;
CREATE POLICY discount_codes_admin_all ON public.discount_codes
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- ============================================================================
-- Storage bucket for product images (idempotent)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Public read; admin write
DROP POLICY IF EXISTS product_images_public_read ON storage.objects;
CREATE POLICY product_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS product_images_admin_write ON storage.objects;
CREATE POLICY product_images_admin_write ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

-- ============================================================================
-- Style Eternal — Wishlists, Reviews, Abandoned-checkout recovery
--
-- • wishlists: persistent per-user saved products (guest wishlists live in
--   localStorage and merge in on sign-in). Owner-scoped RLS.
-- • reviews: customer product reviews with admin moderation. A SECURITY
--   DEFINER trigger stamps verified_purchase from real order history at
--   insert time (the client cannot claim it). Public reads approved only.
-- • abandoned_checkouts: written by the Stripe webhook on
--   checkout.session.expired; emailed_at guards single-send recovery email.
--
-- Idempotent. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- wishlists
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_slug)
);

CREATE INDEX IF NOT EXISTS wishlists_user_idx ON public.wishlists (user_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wishlists_owner_select ON public.wishlists;
CREATE POLICY wishlists_owner_select ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS wishlists_owner_insert ON public.wishlists;
CREATE POLICY wishlists_owner_insert ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS wishlists_owner_delete ON public.wishlists;
CREATE POLICY wishlists_owner_delete ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS wishlists_admin_all ON public.wishlists;
CREATE POLICY wishlists_admin_all ON public.wishlists
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug      TEXT NOT NULL,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name       TEXT,
  rating            INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             TEXT,
  body              TEXT,
  verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_slug)
);

CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews (product_slug, status);
CREATE INDEX IF NOT EXISTS reviews_status_idx  ON public.reviews (status);

-- Verified-purchase stamp: server-side truth, not client-claimable.
CREATE OR REPLACE FUNCTION public.stamp_verified_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.verified_purchase := (
    NEW.user_id IS NOT NULL AND EXISTS (
      SELECT 1
      FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      WHERE o.user_id = NEW.user_id
        AND oi.product_slug = NEW.product_slug
        AND o.status IN ('paid','processing','shipped','fulfilled')
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_stamp_verified ON public.reviews;
CREATE TRIGGER reviews_stamp_verified
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.stamp_verified_purchase();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews.
DROP POLICY IF EXISTS reviews_public_read ON public.reviews;
CREATE POLICY reviews_public_read ON public.reviews
  FOR SELECT USING (status = 'approved');

-- Authors can see their own (pending or otherwise), submit as themselves,
-- and delete their own.
DROP POLICY IF EXISTS reviews_owner_select ON public.reviews;
CREATE POLICY reviews_owner_select ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS reviews_owner_insert ON public.reviews;
CREATE POLICY reviews_owner_insert ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS reviews_owner_delete ON public.reviews;
CREATE POLICY reviews_owner_delete ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS reviews_admin_all ON public.reviews;
CREATE POLICY reviews_admin_all ON public.reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- abandoned_checkouts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  email             TEXT,
  items             JSONB,
  amount_total      BIGINT,
  emailed_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS abandoned_checkouts_created_idx
  ON public.abandoned_checkouts (created_at DESC);

ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- Service role writes (bypasses RLS); admins may inspect.
DROP POLICY IF EXISTS abandoned_checkouts_admin_all ON public.abandoned_checkouts;
CREATE POLICY abandoned_checkouts_admin_all ON public.abandoned_checkouts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

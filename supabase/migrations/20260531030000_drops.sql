-- ============================================================================
-- Style Eternal — Admin v2 / Phase 2: Drops manager
-- Curated collections ("drops") with an ordered set of products.
-- ============================================================================

-- ---------- drops -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drops (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  hero_image  TEXT,
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'scheduled', 'live', 'archived')),
  release_at  TIMESTAMPTZ,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS drops_status_idx ON public.drops (status);
CREATE INDEX IF NOT EXISTS drops_sort_idx   ON public.drops (sort_order);

-- ---------- drop_products (join) --------------------------------------------
CREATE TABLE IF NOT EXISTS public.drop_products (
  drop_id    UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (drop_id, product_id)
);

CREATE INDEX IF NOT EXISTS drop_products_drop_idx    ON public.drop_products (drop_id);
CREATE INDEX IF NOT EXISTS drop_products_product_idx ON public.drop_products (product_id);

-- ---------- updated_at trigger ----------------------------------------------
-- set_updated_at() is defined in 20260530120000_admin_panel.sql.
DROP TRIGGER IF EXISTS drops_set_updated_at ON public.drops;
CREATE TRIGGER drops_set_updated_at
  BEFORE UPDATE ON public.drops
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- RLS -------------------------------------------------------------
ALTER TABLE public.drops         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_products ENABLE ROW LEVEL SECURITY;

-- drops: public can read live drops; admins do everything.
DROP POLICY IF EXISTS drops_public_read ON public.drops;
CREATE POLICY drops_public_read ON public.drops
  FOR SELECT USING (status = 'live');

DROP POLICY IF EXISTS drops_admin_all ON public.drops;
CREATE POLICY drops_admin_all ON public.drops
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- drop_products: public can read rows belonging to a live drop; admins all.
DROP POLICY IF EXISTS drop_products_public_read ON public.drop_products;
CREATE POLICY drop_products_public_read ON public.drop_products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.drops d WHERE d.id = drop_id AND d.status = 'live')
  );

DROP POLICY IF EXISTS drop_products_admin_all ON public.drop_products;
CREATE POLICY drop_products_admin_all ON public.drop_products
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

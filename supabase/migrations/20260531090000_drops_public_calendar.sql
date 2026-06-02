-- ============================================================================
-- Style Eternal — Phase 3: public drop calendar
-- Broaden public read so the storefront can show the drop calendar:
-- upcoming (scheduled) and past (archived) drops, not only live ones.
-- Draft drops remain private. (New migration — existing ones untouched.)
-- ============================================================================

DROP POLICY IF EXISTS drops_public_read ON public.drops;
CREATE POLICY drops_public_read ON public.drops
  FOR SELECT USING (status <> 'draft');

-- Products of any non-draft drop become publicly readable so a live or
-- archived drop's detail page can render its grid. (Scheduled teasers simply
-- have no products assigned yet.)
DROP POLICY IF EXISTS drop_products_public_read ON public.drop_products;
CREATE POLICY drop_products_public_read ON public.drop_products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.drops d WHERE d.id = drop_id AND d.status <> 'draft')
  );

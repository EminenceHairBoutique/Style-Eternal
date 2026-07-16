-- ============================================================================
-- Style Eternal — RLS rewrite: admin policies via is_admin()
--
-- WHY: The admin-all policies created in 20260530120000_admin_panel.sql and
-- 20260530130000_missing_tables.sql use an inline
--   EXISTS (SELECT 1 FROM public.profiles …)
-- subquery. On profiles itself that recurses (error 42P17: infinite recursion
-- detected in policy), and the live database was only ever fixed BY HAND.
-- This migration converges every admin policy onto the SECURITY DEFINER
-- helper public.is_admin() (defined in 20260531025000, re-asserted here so
-- this file stands alone), making a fresh `supabase db reset` work and the
-- committed migrations match production intent.
--
-- ALSO: drops discount_codes_public_read. It let any anonymous visitor
-- enumerate every active discount code. Checkout applies Stripe-native
-- promotion codes, and the admin UI reads through discount_codes_admin_all,
-- so nothing legitimate used anonymous read access.
--
-- Idempotent. Safe to re-run.
-- ============================================================================

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
-- 20260530120000_admin_panel.sql policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS products_admin_all ON public.products;
CREATE POLICY products_admin_all ON public.products
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS orders_admin_all ON public.orders;
CREATE POLICY orders_admin_all ON public.orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS order_items_admin_all ON public.order_items;
CREATE POLICY order_items_admin_all ON public.order_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS discount_codes_admin_all ON public.discount_codes;
CREATE POLICY discount_codes_admin_all ON public.discount_codes
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Anonymous discount-code enumeration: closed, no replacement.
DROP POLICY IF EXISTS discount_codes_public_read ON public.discount_codes;

-- Storage: product-images bucket admin write
DROP POLICY IF EXISTS product_images_admin_write ON storage.objects;
CREATE POLICY product_images_admin_write ON storage.objects
  FOR ALL
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- ---------------------------------------------------------------------------
-- 20260530130000_missing_tables.sql policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS rate_limits_admin_all ON public.rate_limits;
CREATE POLICY rate_limits_admin_all ON public.rate_limits
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS loyalty_ledger_admin_all ON public.loyalty_ledger;
CREATE POLICY loyalty_ledger_admin_all ON public.loyalty_ledger
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS sms_signups_admin_all ON public.sms_signups;
CREATE POLICY sms_signups_admin_all ON public.sms_signups
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS partner_applications_admin_all ON public.partner_applications;
CREATE POLICY partner_applications_admin_all ON public.partner_applications
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS concierge_requests_admin_all ON public.concierge_requests;
CREATE POLICY concierge_requests_admin_all ON public.concierge_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS tryon_sessions_admin_all ON public.tryon_sessions;
CREATE POLICY tryon_sessions_admin_all ON public.tryon_sessions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

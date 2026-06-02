-- ============================================================================
-- Style Eternal — is_admin() helper (must precede any RLS policy that calls it)
--
-- Later migrations (20260531030000_drops.sql onward) reference
-- public.is_admin() in their RLS policies, but the function was only ever
-- created by hand in the live database during the admin-auth (42P17) fix —
-- never in a migration. On a fresh `supabase db reset` those migrations would
-- fail. This migration defines it first.
--
-- SECURITY DEFINER (with a pinned search_path) runs the lookup with the
-- function owner's rights, bypassing RLS on profiles. That is what prevents the
-- infinite-recursion error (42P17) when an admin policy *on* profiles needs to
-- check is_admin on profiles. profiles.is_admin is created earlier, in
-- 20260530120000_admin_panel.sql, so the function body validates at CREATE.
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

-- ============================================================================
-- Style Eternal — Admin v2 / Phase 3: Page content CMS
-- A block-based content store for editable storefront pages.
--
-- Block schema (the `blocks` JSONB column is an ordered array of blocks):
--   { id: string, type: string, data: object }
-- where type is one of:
--   'heading'   → { text, level }                 level 1..4
--   'paragraph' → { text }                         text supports basic
--                                                   markdown (**bold**, [a](b))
--   'image'     → { url, alt, caption }
--   'list'      → { style: 'bullet'|'number', items: string[] }
--   'divider'   → {}
--   'accordion' → { items: [{ q, a }] }            used for FAQ
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.page_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key   TEXT NOT NULL UNIQUE,
  title      TEXT,
  blocks     JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at trigger (set_updated_at defined in 20260530120000_admin_panel.sql)
DROP TRIGGER IF EXISTS page_content_set_updated_at ON public.page_content;
CREATE TRIGGER page_content_set_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- RLS -------------------------------------------------------------
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Public can read all CMS pages (content is public by nature).
DROP POLICY IF EXISTS page_content_public_read ON public.page_content;
CREATE POLICY page_content_public_read ON public.page_content
  FOR SELECT USING (TRUE);

-- Only admins can write.
DROP POLICY IF EXISTS page_content_admin_all ON public.page_content;
CREATE POLICY page_content_admin_all ON public.page_content
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- Seed editable pages (empty blocks) ------------------------------
INSERT INTO public.page_content (page_key, title, blocks) VALUES
  ('tos',      'Terms of Service', '[]'::jsonb),
  ('privacy',  'Privacy Policy',   '[]'::jsonb),
  ('about',    'About',            '[]'::jsonb),
  ('faq',      'FAQ',              '[]'::jsonb),
  ('returns',  'Returns',          '[]'::jsonb),
  ('shipping', 'Shipping',         '[]'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

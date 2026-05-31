-- ============================================================================
-- Style Eternal — Admin v2 / Phase 4: Media library + homepage content
-- ============================================================================

-- ---------- media_library ---------------------------------------------------
-- Metadata for images uploaded through the admin Media library. Files live in
-- the existing `product-images` Storage bucket; this table is the index.
CREATE TABLE IF NOT EXISTS public.media_library (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url         TEXT NOT NULL,
  filename    TEXT,
  alt         TEXT,
  size_bytes  INT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS media_library_uploaded_idx ON public.media_library (uploaded_at DESC);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS media_library_public_read ON public.media_library;
CREATE POLICY media_library_public_read ON public.media_library
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS media_library_admin_all ON public.media_library;
CREATE POLICY media_library_admin_all ON public.media_library
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- homepage content row --------------------------------------------
-- Reuses the page_content table (Phase 3). The 'homepage' row stores hero
-- slides as blocks of type 'hero':
--   { id, type: 'hero', data: { image, headline, subtext, ctaLabel, ctaHref } }
INSERT INTO public.page_content (page_key, title, blocks)
VALUES ('homepage', 'Homepage', '[]'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

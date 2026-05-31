-- ============================================================================
-- Style Eternal — Admin v2 / Phase 5: Customer email broadcasts
-- Records of admin-sent marketing emails. Sending happens server-side in
-- api/admin-broadcast.js; recipient emails are never stored per-row here.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_broadcasts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject          TEXT NOT NULL,
  body_html        TEXT NOT NULL,
  recipient_filter TEXT NOT NULL DEFAULT 'all'
                     CHECK (recipient_filter IN ('all', 'customers', 'partners')),
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  sent_count       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS email_broadcasts_created_idx ON public.email_broadcasts (created_at DESC);

ALTER TABLE public.email_broadcasts ENABLE ROW LEVEL SECURITY;

-- Admin only — there is no public read/write of broadcast records.
DROP POLICY IF EXISTS email_broadcasts_admin_all ON public.email_broadcasts;
CREATE POLICY email_broadcasts_admin_all ON public.email_broadcasts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

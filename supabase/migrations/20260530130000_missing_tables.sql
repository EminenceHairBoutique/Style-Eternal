-- ============================================================================
-- Style Eternal — missing tables referenced by /api handlers
-- Generated from an audit of every supabaseServer.from(...) call in /api.
--
-- Tables created here:
--   - rate_limits        (api/_utils/rateLimit.js)
--   - loyalty_ledger     (api/stripe-webhook.js)
--   - sms_signups        (api/sms-verify.js)
--   - partner_applications  (api/partners/*, api/admin/partner-*)
--   - tryon_sessions     (api/atelier/tryon/*)
--   - concierge_requests (api/atelier/tryon/save.js, concierge.js)
--
-- Already-existing tables left untouched: profiles, products, orders,
-- order_items, discount_codes, email_signups.
-- ============================================================================

-- ---------- rate_limits ------------------------------------------------------
-- Distributed rate-limit counters keyed by "<endpoint>:<ip>".
-- Only the service role writes here (handler fails OPEN if RLS blocks).
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT NOT NULL UNIQUE,
  request_count INT NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON public.rate_limits (window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Admin-all only. The handler uses the service role, which bypasses RLS;
-- end users should never read or write this table directly.
DROP POLICY IF EXISTS rate_limits_admin_all ON public.rate_limits;
CREATE POLICY rate_limits_admin_all ON public.rate_limits
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));


-- ---------- loyalty_ledger ---------------------------------------------------
-- Append-only audit trail for loyalty-point adjustments. The webhook writes
-- one row per earned/bonus award.
CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delta              INT NOT NULL,
  reason             TEXT NOT NULL,
  order_number       TEXT,
  stripe_session_id  TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS loyalty_ledger_user_idx          ON public.loyalty_ledger (user_id);
CREATE INDEX IF NOT EXISTS loyalty_ledger_order_idx         ON public.loyalty_ledger (order_number);
CREATE INDEX IF NOT EXISTS loyalty_ledger_stripe_session_idx ON public.loyalty_ledger (stripe_session_id);

ALTER TABLE public.loyalty_ledger ENABLE ROW LEVEL SECURITY;

-- A user can read their own ledger entries.
DROP POLICY IF EXISTS loyalty_ledger_owner_read ON public.loyalty_ledger;
CREATE POLICY loyalty_ledger_owner_read ON public.loyalty_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can do anything.
DROP POLICY IF EXISTS loyalty_ledger_admin_all ON public.loyalty_ledger;
CREATE POLICY loyalty_ledger_admin_all ON public.loyalty_ledger
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));


-- ---------- sms_signups ------------------------------------------------------
-- Captured after a Twilio Verify success. Written from an unauthenticated
-- handler, so the insert policy allows anon.
CREATE TABLE IF NOT EXISTS public.sms_signups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  source      TEXT,
  path        TEXT,
  utm         JSONB,
  consent     JSONB,
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sms_signups_phone_idx   ON public.sms_signups (phone);
CREATE INDEX IF NOT EXISTS sms_signups_created_idx ON public.sms_signups (created_at DESC);

ALTER TABLE public.sms_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (the verify flow runs without a session).
DROP POLICY IF EXISTS sms_signups_anon_insert ON public.sms_signups;
CREATE POLICY sms_signups_anon_insert ON public.sms_signups
  FOR INSERT WITH CHECK (TRUE);

-- Admins can read/update/delete.
DROP POLICY IF EXISTS sms_signups_admin_all ON public.sms_signups;
CREATE POLICY sms_signups_admin_all ON public.sms_signups
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));


-- ---------- partner_applications --------------------------------------------
-- Applications submitted via the partner program form, plus the post-approval
-- directory settings (city, booking_url, specialties, …). Upserted on email.
CREATE TABLE IF NOT EXISTS public.partner_applications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email                TEXT NOT NULL UNIQUE,
  full_name            TEXT,
  phone                TEXT,
  business_name        TEXT,
  website_or_instagram TEXT,
  country              TEXT,
  monthly_volume       TEXT,
  interested_in        TEXT,
  message              TEXT,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'approved', 'rejected')),
  partner_tier         TEXT,
  reviewed_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at          TIMESTAMPTZ,
  notes                TEXT,

  -- Directory fields (populated post-approval via /api/partners/directory-settings).
  city                 TEXT,
  booking_url          TEXT,
  specialties          TEXT[],
  avatar_url           TEXT,
  directory_opt_in     BOOLEAN NOT NULL DEFAULT FALSE,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partner_applications_user_idx    ON public.partner_applications (user_id);
CREATE INDEX IF NOT EXISTS partner_applications_status_idx  ON public.partner_applications (status);
CREATE INDEX IF NOT EXISTS partner_applications_created_idx ON public.partner_applications (created_at DESC);

-- Keep updated_at fresh (uses the trigger function from the admin_panel migration).
DROP TRIGGER IF EXISTS partner_applications_set_updated_at ON public.partner_applications;
CREATE TRIGGER partner_applications_set_updated_at
  BEFORE UPDATE ON public.partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous or authenticated) can submit an application.
DROP POLICY IF EXISTS partner_applications_anon_insert ON public.partner_applications;
CREATE POLICY partner_applications_anon_insert ON public.partner_applications
  FOR INSERT WITH CHECK (TRUE);

-- An applicant can read their own row (matched by user_id when logged in).
DROP POLICY IF EXISTS partner_applications_owner_read ON public.partner_applications;
CREATE POLICY partner_applications_owner_read ON public.partner_applications
  FOR SELECT USING (auth.uid() = user_id);

-- An applicant can update their own row (used for directory settings post-approval).
DROP POLICY IF EXISTS partner_applications_owner_update ON public.partner_applications;
CREATE POLICY partner_applications_owner_update ON public.partner_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can do anything.
DROP POLICY IF EXISTS partner_applications_admin_all ON public.partner_applications;
CREATE POLICY partner_applications_admin_all ON public.partner_applications
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));


-- ---------- concierge_requests ----------------------------------------------
-- Structured concierge follow-up records. Inserted by tryon/save.js and
-- tryon/concierge.js; both allow anonymous callers.
-- (Created BEFORE tryon_sessions so the tryon_sessions.concierge_id FK resolves.)
CREATE TABLE IF NOT EXISTS public.concierge_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email      TEXT,
  type       TEXT NOT NULL,
  payload    JSONB NOT NULL DEFAULT '{}'::jsonb,
  status     TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS concierge_requests_user_idx    ON public.concierge_requests (user_id);
CREATE INDEX IF NOT EXISTS concierge_requests_status_idx  ON public.concierge_requests (status);
CREATE INDEX IF NOT EXISTS concierge_requests_created_idx ON public.concierge_requests (created_at DESC);

ALTER TABLE public.concierge_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a concierge request (try-on can be anonymous).
DROP POLICY IF EXISTS concierge_requests_anon_insert ON public.concierge_requests;
CREATE POLICY concierge_requests_anon_insert ON public.concierge_requests
  FOR INSERT WITH CHECK (TRUE);

-- A user can read their own concierge requests.
DROP POLICY IF EXISTS concierge_requests_owner_read ON public.concierge_requests;
CREATE POLICY concierge_requests_owner_read ON public.concierge_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can do anything.
DROP POLICY IF EXISTS concierge_requests_admin_all ON public.concierge_requests;
CREATE POLICY concierge_requests_admin_all ON public.concierge_requests
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));


-- ---------- tryon_sessions --------------------------------------------------
-- Atelier Mirror try-on records. Anonymous sessions are allowed (user_id NULL).
-- Status flow: created -> saved -> sent_to_concierge.
CREATE TABLE IF NOT EXISTS public.tryon_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id    TEXT NOT NULL,
  product_name  TEXT,
  overlay_key   TEXT,
  adjustments   JSONB,
  result_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'created'
                  CHECK (status IN ('created', 'saved', 'sent_to_concierge')),
  concierge_id  UUID REFERENCES public.concierge_requests(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tryon_sessions_user_idx       ON public.tryon_sessions (user_id);
CREATE INDEX IF NOT EXISTS tryon_sessions_product_idx    ON public.tryon_sessions (product_id);
CREATE INDEX IF NOT EXISTS tryon_sessions_status_idx     ON public.tryon_sessions (status);
CREATE INDEX IF NOT EXISTS tryon_sessions_concierge_idx  ON public.tryon_sessions (concierge_id);
CREATE INDEX IF NOT EXISTS tryon_sessions_created_idx    ON public.tryon_sessions (created_at DESC);

DROP TRIGGER IF EXISTS tryon_sessions_set_updated_at ON public.tryon_sessions;
CREATE TRIGGER tryon_sessions_set_updated_at
  BEFORE UPDATE ON public.tryon_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tryon_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can create a try-on session (anonymous flow supported).
DROP POLICY IF EXISTS tryon_sessions_anon_insert ON public.tryon_sessions;
CREATE POLICY tryon_sessions_anon_insert ON public.tryon_sessions
  FOR INSERT WITH CHECK (TRUE);

-- A signed-in user can read their own sessions.
DROP POLICY IF EXISTS tryon_sessions_owner_read ON public.tryon_sessions;
CREATE POLICY tryon_sessions_owner_read ON public.tryon_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- A signed-in user can update their own sessions (save flow).
DROP POLICY IF EXISTS tryon_sessions_owner_update ON public.tryon_sessions;
CREATE POLICY tryon_sessions_owner_update ON public.tryon_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can do anything.
DROP POLICY IF EXISTS tryon_sessions_admin_all ON public.tryon_sessions;
CREATE POLICY tryon_sessions_admin_all ON public.tryon_sessions
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

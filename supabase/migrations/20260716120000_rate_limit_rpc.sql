-- ============================================================================
-- Style Eternal — Atomic rate limiter
--
-- WHY: api/_utils/rateLimit.js previously did a read-then-write against
-- rate_limits, which leaks requests under concurrency (two serverless
-- invocations both read count=4, both write count=5). This RPC makes the
-- check-and-increment a single atomic UPSERT. The window resets lazily: when
-- the stored window_start is older than the window, the counter restarts at 1.
--
-- Called by the service-role client only. Idempotent. Safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT NOT NULL UNIQUE,
  request_count INT NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key TEXT, p_max INT, p_window_ms INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO public.rate_limits AS rl (key, request_count, window_start)
  VALUES (p_key, 1, NOW())
  ON CONFLICT (key) DO UPDATE SET
    request_count = CASE
      WHEN rl.window_start < NOW() - make_interval(secs => p_window_ms / 1000.0)
        THEN 1
      ELSE rl.request_count + 1
    END,
    window_start = CASE
      WHEN rl.window_start < NOW() - make_interval(secs => p_window_ms / 1000.0)
        THEN NOW()
      ELSE rl.window_start
    END
  RETURNING rl.request_count INTO v_count;

  RETURN v_count <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rate_limit_hit(TEXT, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION public.rate_limit_hit(TEXT, INT, INT) FROM authenticated;

-- Housekeeping: allow cheap cleanup of stale windows (cron or manual).
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON public.rate_limits (window_start);

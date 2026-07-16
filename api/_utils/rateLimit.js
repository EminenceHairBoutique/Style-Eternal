/**
 * api/_utils/rateLimit.js
 * Distributed rate limiting for Vercel serverless API endpoints.
 *
 * Backed by the atomic `rate_limit_hit()` Postgres RPC
 * (20260716120000_rate_limit_rpc.sql) so the check-and-increment is a single
 * upsert — no read-then-write race between concurrent invocations.
 *
 * Failure semantics:
 *  - RPC missing (migrations not applied yet): always fail OPEN. This is the
 *    bootstrap grace period — deploying code before SQL must not brick the
 *    endpoints that depend on this helper.
 *  - Any other error: fail OPEN by default, or fail CLOSED (503) when the
 *    endpoint opts in via `failClosed: true`. Use failClosed for endpoints
 *    where abuse costs real money (AI calls, SMS) and a rare false 503 is the
 *    better trade.
 *
 * Usage:
 *   const allowed = await checkRateLimit(req, res, { endpoint: "ai", max: 20, windowMs: 60_000, failClosed: true });
 *   if (!allowed) return; // 429/503 already sent
 */

import { supabaseServer } from "../../lib/supabaseServer.js";

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 10;
const MAX_ENDPOINT_LENGTH = 64;

/**
 * Client IP for rate-limit keying. Header precedence matters for security:
 * `x-forwarded-for` is client-appendable — an attacker can prepend arbitrary
 * addresses to rotate their key — so we prefer platform-set headers and take
 * the RIGHTMOST forwarded hop (the one added by our edge) as the fallback.
 */
export function getClientIp(req) {
  const headers = req.headers || {};

  // Set by Vercel's edge, not spoofable by the client.
  const vercel = headers["x-vercel-forwarded-for"];
  if (vercel) return String(vercel).split(",")[0].trim();

  const real = headers["x-real-ip"];
  if (real) return String(real).trim();

  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    const hops = String(forwarded).split(",").map((s) => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }

  return (
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "unknown"
  );
}

const isMissingFunction = (error) => {
  const msg = String(error?.message || "");
  return (
    error?.code === "PGRST202" || // PostgREST: function not found
    /could not find the function|does not exist/i.test(msg)
  );
};

export async function checkRateLimit(req, res, options = {}) {
  const max = Number(options.max ?? DEFAULT_MAX);
  const windowMs = Number(options.windowMs ?? DEFAULT_WINDOW_MS);
  const endpoint = String(options.endpoint || "api").slice(0, MAX_ENDPOINT_LENGTH);
  const failClosed = Boolean(options.failClosed);

  const key = `${endpoint}:${getClientIp(req)}`;

  try {
    const { data, error } = await supabaseServer.rpc("rate_limit_hit", {
      p_key: key,
      p_max: max,
      p_window_ms: windowMs,
    });

    if (error) {
      if (isMissingFunction(error)) return true; // bootstrap grace
      console.warn("rate_limit_hit error:", error.message);
      if (failClosed) {
        res.status(503).json({ error: "Service temporarily unavailable. Please try again shortly." });
        return false;
      }
      return true;
    }

    if (data === false) {
      res.status(429).json({
        error: "Too many requests. Please wait a moment and try again.",
      });
      return false;
    }

    return true;
  } catch (err) {
    console.warn("rate limit exception:", err?.message || err);
    if (failClosed) {
      res.status(503).json({ error: "Service temporarily unavailable. Please try again shortly." });
      return false;
    }
    return true;
  }
}

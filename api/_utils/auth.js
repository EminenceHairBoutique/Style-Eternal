/**
 * api/_utils/auth.js
 * Centralized server-side authentication for Vercel serverless functions.
 *
 * Admin model: profiles.is_admin — the same source of truth the admin SPA's
 * RLS policies use (public.is_admin()). The old ADMIN_EMAILS env allowlist is
 * retired: it was a second, divergent admin model, and its VITE_-prefixed
 * fallback risked shipping the allowlist to browsers.
 *
 * Usage:
 *   const user = await requireAdmin(req, res);
 *   if (!user) return; // response already sent
 */

import { supabaseServer } from "../../lib/supabaseServer.js";

function getBearerToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth) return null;
  const tokenMatch = String(auth).match(/^Bearer\s+(.+)$/i);
  return tokenMatch ? tokenMatch[1] : null;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

/**
 * Resolve the Supabase user from the Authorization header.
 * Returns null if no token or token is invalid.
 */
export async function getUserFromReq(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error) return null;
    return data?.user || null;
  } catch {
    return null;
  }
}

/**
 * Require a valid authenticated Supabase user.
 * On failure: sends 401 and returns null.
 */
export async function requireUser(req, res) {
  const user = await getUserFromReq(req);
  if (!user) {
    json(res, 401, { error: "Unauthorized" });
    return null;
  }
  return user;
}

/**
 * Require the caller to be an admin (profiles.is_admin = true).
 * On failure: sends 401 or 403 and returns null. Fails closed.
 */
export async function requireAdmin(req, res) {
  const user = await getUserFromReq(req);
  if (!user) {
    json(res, 401, { error: "Unauthorized" });
    return null;
  }

  try {
    const { data: profile, error } = await supabaseServer
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile?.is_admin) {
      json(res, 403, { error: "Forbidden" });
      return null;
    }
  } catch {
    json(res, 403, { error: "Forbidden" });
    return null;
  }

  return user;
}

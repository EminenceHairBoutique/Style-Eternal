import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

// Static env allowlist. Baked in at build time; changing requires a redeploy.
const ADMIN_ALLOW = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/**
 * Guards the admin panel. Reads from UserContext — no extra supabase.auth.*
 * calls, which avoids competing for the auth token Web Lock that
 * signInWithPassword also needs.
 *
 * The one complication with UserContext: after a fresh login, navigate("/admin")
 * fires before UserContext's onAuthStateChange handler finishes its async
 * fetchAccountAccess → setUser call. AdminRoute can briefly see
 * user=null / loading=false and redirect. We handle this with a 700ms grace
 * period: if user is null after loading=false, we wait before redirecting to
 * give UserContext time to settle.
 *
 * Access is granted if:
 *   1. Email is in VITE_ADMIN_EMAILS  (no DB check, fastest path), OR
 *   2. profiles.is_admin = true for the signed-in user
 */
export default function AdminRoute({ children, redirectTo = "/admin/login" }) {
  const { user, loading } = useUser();
  const location = useLocation();

  // Have we waited long enough to trust that user=null is real (not transient)?
  const [graceDone, setGraceDone] = useState(false);
  const graceTimer = useRef(null);

  // null = not checked yet / checking; true/false = result
  const [profileAdmin, setProfileAdmin] = useState(null);

  // ── Grace period ───────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(graceTimer.current);

    if (loading) {
      // UserContext is initialising — reset.
      setGraceDone(false);
      return;
    }

    if (user) {
      // User is present; no need to wait.
      setGraceDone(true);
      return;
    }

    // user=null + loading=false — could be a fresh login race.
    // Wait 700ms before treating as "definitely not logged in".
    graceTimer.current = setTimeout(() => setGraceDone(true), 700);
    return () => clearTimeout(graceTimer.current);
  }, [user, loading]);

  // ── Profile check ─────────────────────────────────────────────────────────
  const email = String(user?.email || "").toLowerCase();
  const allowlisted = !!email && ADMIN_ALLOW.includes(email);

  useEffect(() => {
    // Reset whenever user changes.
    setProfileAdmin(null);

    if (!user?.id || allowlisted || !supabase) return;

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (error) console.error("[AdminRoute] profiles lookup failed:", error);
        if (!cancelled) setProfileAdmin(!!data?.is_admin);
      } catch (err) {
        console.error("[AdminRoute] profiles lookup exception:", err);
        if (!cancelled) setProfileAdmin(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id, allowlisted]);

  // ── Render logic ──────────────────────────────────────────────────────────
  // Still waiting for UserContext or grace period.
  if (loading || !graceDone) return null;

  // Grace period elapsed; still no user.
  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  // Allowlist path — no DB check needed.
  if (allowlisted) return children;

  // Waiting for the profiles query.
  if (profileAdmin === null) return null;

  if (!profileAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

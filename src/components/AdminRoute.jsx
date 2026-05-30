import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Static env allowlist — preserved so existing AdminPartners flow keeps
// working without requiring an is_admin migration to be applied.
const ADMIN_ALLOW = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Wait for an authenticated Supabase session to materialize. Right after
// signInWithPassword resolves, supabase-js has the token but the session
// object can briefly read as null on a fresh subscribe. Retry a few times
// before giving up so we don't redirect a freshly-logged-in admin home.
async function waitForSession(maxAttempts = 3, delayMs = 300) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) return data.session;
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}

/**
 * Guards the admin panel. Access is granted if EITHER the user's email is
 * in VITE_ADMIN_EMAILS, OR profiles.is_admin = true for the logged-in user.
 *
 * Bypasses UserContext on purpose: that context has its own loading state
 * which can race with a freshly issued session. We pull the session straight
 * from supabase-js and gate on the profile lookup explicitly.
 */
export default function AdminRoute({ children, redirectTo = "/admin/login" }) {
  const location = useLocation();
  // status: 'checking' | 'allowed' | 'no-session' | 'not-admin'
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!supabase) {
        if (!cancelled) setStatus("no-session");
        return;
      }

      const session = await waitForSession();
      if (cancelled) return;

      if (!session?.user) {
        setStatus("no-session");
        return;
      }

      const email = String(session.user.email || "").toLowerCase();
      if (email && ADMIN_ALLOW.includes(email)) {
        setStatus("allowed");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("[AdminRoute] profiles lookup failed:", error);
        setStatus("not-admin");
        return;
      }

      if (data?.is_admin) {
        setStatus("allowed");
      } else {
        // Null row OR is_admin=false — treat the same. RLS misconfig will
        // surface here as null, so redirect to login rather than home so the
        // user can sign in again (or with a different account).
        setStatus("not-admin");
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run when the route changes so a fresh login navigation re-evaluates.
  }, [location.pathname]);

  if (status === "checking") return null;
  if (status === "no-session" || status === "not-admin") {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }
  return children;
}

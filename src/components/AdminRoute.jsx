import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Static env allowlist — a user whose email is here is admin regardless of the
// profiles table. Baked in at BUILD time by Vite, so changing VITE_ADMIN_EMAILS
// requires a redeploy to take effect.
const ADMIN_ALLOW = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/**
 * Guards the admin panel.
 *
 * Self-contained on purpose — it does NOT read UserContext. UserContext updates
 * its `user` asynchronously via onAuthStateChange + a follow-up profiles fetch,
 * which races with the client-side navigate("/admin") that AdminLogin fires on
 * success. That race made the guard see user=null on the first render and bounce
 * a freshly-logged-in admin back to the login page.
 *
 * Instead we subscribe to supabase.auth.onAuthStateChange directly. supabase-js
 * emits an INITIAL_SESSION event the moment we subscribe, carrying the current
 * session (or null). We evaluate access from that. No getSession() polling loop
 * (that previously caused auth-lock contention / "Lock broken by steal" errors).
 *
 * Access is granted if EITHER the email is in VITE_ADMIN_EMAILS, OR
 * profiles.is_admin = true for the signed-in user.
 */
export default function AdminRoute({ children, redirectTo = "/admin/login" }) {
  const location = useLocation();
  // "checking" → still resolving | "allowed" → render | "denied" → redirect
  const [status, setStatus] = useState("checking");
  const settled = useRef(false);

  useEffect(() => {
    let cancelled = false;
    settled.current = false;

    if (!supabase) {
      setStatus("denied");
      return () => {};
    }

    const decide = (next) => {
      if (cancelled) return;
      settled.current = true;
      setStatus(next);
    };

    const evaluate = async (session) => {
      const sessionUser = session?.user;
      if (!sessionUser) {
        decide("denied");
        return;
      }

      // Allowlist short-circuit — no DB round-trip needed.
      const email = String(sessionUser.email || "").toLowerCase();
      if (email && ADMIN_ALLOW.includes(email)) {
        decide("allowed");
        return;
      }

      // Reacting to an auth event means supabase-js already holds the token,
      // so this query is authenticated. RLS returns this user's own row.
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", sessionUser.id)
          .maybeSingle();

        if (error) {
          // Surfaces RLS misconfig (e.g. 42P17 recursion) in the console
          // instead of failing silently.
          console.error("[AdminRoute] profiles lookup failed:", error);
          decide("denied");
          return;
        }
        decide(data?.is_admin ? "allowed" : "denied");
      } catch (err) {
        console.error("[AdminRoute] profiles lookup exception:", err);
        decide("denied");
      }
    };

    // Fires INITIAL_SESSION immediately with the current session, then again on
    // SIGNED_IN / TOKEN_REFRESHED / SIGNED_OUT. Each re-evaluates access.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      evaluate(session);
    });

    // Backstop: a single getSession() (NOT a loop) in case INITIAL_SESSION is
    // somehow missed, so we never hang on "checking" forever.
    supabase.auth.getSession().then(({ data }) => {
      if (!settled.current) evaluate(data?.session ?? null);
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, [location.pathname]);

  if (status === "checking") return null;
  if (status === "denied") {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }
  return children;
}

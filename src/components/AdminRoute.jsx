import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

// Static env allowlist — preserved so existing AdminPartners flow keeps working
// without requiring an is_admin migration to be applied.
const ADMIN_ALLOW = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Access is granted if EITHER the user's email is in VITE_ADMIN_EMAILS,
// OR profiles.is_admin = true for the logged-in user.
export default function AdminRoute({ children, redirectTo = "/account" }) {
  const { user, loading } = useUser();
  const location = useLocation();
  const [profileAdmin, setProfileAdmin] = useState(null); // null = checking, bool = result

  const email = String(user?.email || "").toLowerCase();
  const allowlisted = !!email && ADMIN_ALLOW.includes(email);

  useEffect(() => {
    let cancelled = false;
    // Allowlisted users skip the profile check; no Supabase round-trip needed.
    if (!user?.id || allowlisted || !supabase) {
      setProfileAdmin(false);
      return () => {};
    }
    (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();
        if (!cancelled) setProfileAdmin(!!data?.is_admin);
      } catch {
        if (!cancelled) setProfileAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, allowlisted]);

  if (loading) return null;
  if (!user) return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;

  // Still resolving profile lookup — show nothing rather than flicker a redirect.
  if (!allowlisted && profileAdmin === null) return null;

  if (!allowlisted && !profileAdmin) return <Navigate to="/" replace />;

  return children;
}

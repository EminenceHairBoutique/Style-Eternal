/**
 * AdminLogin — standalone login page for /admin/login
 *
 * Flow (race-free, no auth-lock contention):
 * 1. signInWithPassword stores the session.
 * 2. supabase-js fires onAuthStateChange (SIGNED_IN) — handled by UserContext,
 *    which owns the single auth subscription. UserContext fetches the profile
 *    (including is_admin) and updates `user`.
 * 3. The effect below reacts to `user`:
 *      - user.isAdmin === true  → navigate to /admin
 *      - logged in but not admin → show an inline error
 *
 * We deliberately do NOT call supabase.auth.getSession() in a polling loop after
 * sign-in. Repeated getSession() calls compete for the auth token Web Lock and
 * produced "Lock was not released within 5000ms" failures. Reacting to
 * UserContext (one subscription) is both simpler and lock-safe.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import "./admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // True only between a successful sign-in and UserContext confirming the
  // profile. Lets us tell "non-admin who just logged in" apart from
  // "non-admin merely viewing the login page".
  const awaitingAuth = useRef(false);
  const safetyTimer = useRef(null);

  const from = location.state?.from || "/admin";

  // React to UserContext resolving the signed-in user. Covers both a fresh
  // login and an existing admin session on page refresh.
  useEffect(() => {
    if (loading) return;

    if (user?.isAdmin) {
      clearTimeout(safetyTimer.current);
      awaitingAuth.current = false;
      navigate(from, { replace: true });
      return;
    }

    // Signed in but not an admin — only surface this if a login was just made.
    if (user && !user.isAdmin && awaitingAuth.current) {
      clearTimeout(safetyTimer.current);
      awaitingAuth.current = false;
      setError("This account doesn't have admin access.");
      setSubmitting(false);
    }
  }, [loading, user, from, navigate]);

  // Clean up the safety timer on unmount.
  useEffect(() => () => clearTimeout(safetyTimer.current), []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured. Check environment variables.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) throw signInErr;

      // Success. Do NOT navigate here and do NOT poll getSession(). UserContext's
      // onAuthStateChange will fetch the profile and update `user`; the effect
      // above then navigates (admin) or shows an error (non-admin).
      awaitingAuth.current = true;

      // Safety net: if the profile never resolves, re-enable the form so the
      // button doesn't sit on "Signing in…" forever. Single timer, no polling.
      clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => {
        if (awaitingAuth.current) {
          awaitingAuth.current = false;
          setSubmitting(false);
          setError("Sign-in is taking longer than expected. Please try again.");
        }
      }, 8000);
    } catch (err) {
      setError(err.message || "Sign-in failed. Check your credentials.");
      setSubmitting(false);
    }
  };

  // NOTE: we deliberately do NOT return null while loading.
  // Hiding the form caused a blank page when supabase-js's getSession()
  // hung waiting for the auth lock (orphaned from previous sessions).
  // The redirect effect above handles the already-logged-in-admin case
  // once loading resolves — the form is visible immediately and replaced
  // by the redirect if/when it fires.

  return (
    <div
      className="admin-root"
      style={{
        background: "#0f0f0f",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          background: "#1a1a1a",
          border: "0.5px solid #2a2a2a",
          padding: "2.5rem 2rem",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              fontFamily: "'Oswald Variable', 'Oswald', sans-serif",
              fontSize: "1.05rem",
              letterSpacing: "0.3em",
              color: "#f0f0f0",
              fontWeight: 500,
            }}
          >
            STYLE ETERNAL
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              color: "#c9a96e",
              textTransform: "uppercase",
            }}
          >
            Admin
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
          <label htmlFor="admin-email" style={labelStyle}>Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
          <label htmlFor="admin-password" style={labelStyle}>Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              color: "#ffb0b0",
              background: "rgba(196, 48, 48, 0.1)",
              border: "0.5px solid #c43030",
              padding: "0.6rem 0.75rem",
              fontSize: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            background: submitting ? "#a08050" : "#c9a96e",
            color: "#0f0f0f",
            border: "none",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: submitting ? "wait" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const labelStyle = {
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#8a8a8a",
  fontWeight: 600,
};

const inputStyle = {
  background: "#0f0f0f",
  border: "0.5px solid #2a2a2a",
  color: "#f0f0f0",
  padding: "0.65rem 0.75rem",
  fontSize: "0.9rem",
  width: "100%",
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured — VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // signInWithPassword resolves with the session in its result — no need to
      // poll getSession() afterwards (that risks supabase-js auth-lock contention).
      // Race against a 15s timeout so a paused/unreachable project fails visibly
      // instead of leaving the button stuck on "Signing in…".
      const { data, error: signInErr } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Sign-in timed out. The Supabase project may be paused — open the Supabase dashboard to resume it, then try again."
                )
              ),
            15_000
          )
        ),
      ]);

      if (signInErr) throw signInErr;
      if (!data?.session) {
        throw new Error("Signed in but no session was returned. Please try again.");
      }

      // Session is confirmed present. AdminRoute will independently pick it up
      // via onAuthStateChange, so a plain navigate is safe and race-free.
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("[AdminLogin] sign-in failed:", err);
      setError(err.message || "Sign-in failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

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
              fontFamily: "'Oswald', sans-serif",
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
          <label htmlFor="admin-email" style={labelStyle}>
            Email
          </label>
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
          <label htmlFor="admin-password" style={labelStyle}>
            Password
          </label>
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
            background: "#c9a96e",
            color: "#0f0f0f",
            border: "none",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: submitting ? "wait" : "pointer",
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

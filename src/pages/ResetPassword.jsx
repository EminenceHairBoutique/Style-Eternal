// src/pages/ResetPassword.jsx — Style Eternal
// Landing page for Supabase password-recovery links
// (auth.resetPasswordForEmail redirects here with a recovery session).

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useUser();
  const [ready, setReady] = useState(false); // recovery session detected
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;

    // Supabase parses the recovery token from the URL and emits
    // PASSWORD_RECOVERY (or an already-active session on remount).
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setStatus("saving");
    try {
      await updatePassword(password);
      setStatus("done");
      setTimeout(() => navigate("/account"), 2500);
    } catch (err) {
      setStatus("idle");
      setError(err?.message || "Could not update your password. Try the link from your email again.");
    }
  };

  return (
    <>
      <SEO title="Reset Password — Style Eternal" noindex={true} />

      <div className="bg-se-black text-se-bone min-h-[70vh] pt-32 pb-24">
        <div className="max-w-md mx-auto px-6">
          <p className="text-overline mb-3">Account</p>
          <h1 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] tracking-[0.06em] mb-8">
            RESET PASSWORD
          </h1>

          {status === "done" ? (
            <div className="border border-se-gold/30 bg-se-charcoal p-8 text-center">
              <CheckCircle2 className="w-7 h-7 text-se-gold mx-auto mb-3" />
              <p className="text-[14px]">Password updated.</p>
              <p className="text-[12px] text-se-steel font-accent mt-1">
                Taking you to your account…
              </p>
            </div>
          ) : !ready ? (
            <div className="border border-white/5 bg-se-charcoal p-8">
              <p className="text-[13px] text-se-bone/60 leading-relaxed">
                Open the password-reset link from your email to continue. If you
                landed here without one, request a new link from the{" "}
                <Link to="/account" className="text-se-gold underline underline-offset-2">
                  sign-in page
                </Link>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="border border-white/5 bg-se-charcoal p-8 space-y-5">
              <label className="block">
                <span className="text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60">
                  New password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="mt-2 w-full bg-se-black border border-white/10 px-4 py-3 text-[14px] text-se-bone focus:outline-none focus:border-se-gold/60"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60">
                  Confirm password
                </span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="mt-2 w-full bg-se-black border border-white/10 px-4 py-3 text-[14px] text-se-bone focus:outline-none focus:border-se-gold/60"
                />
              </label>

              {error && (
                <p className="text-[12px] text-se-red-bright font-accent" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "saving"}
                className={`btn-primary w-full ${status === "saving" ? "opacity-70 cursor-wait" : ""}`}
              >
                {status === "saving" ? "Saving…" : "Update Password"}
              </button>

              <p className="flex items-center justify-center gap-2 text-[10px] text-se-steel font-accent">
                <Lock className="w-3 h-3" /> Encrypted via Supabase Auth
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

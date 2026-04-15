import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Star } from "lucide-react";
import AccountDashboard from "../components/account/AccountDashboard";
import SEO from "../components/SEO";

const TabButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-accent transition border-b-2
      ${active ? "text-se-bone border-se-gold" : "text-se-steel border-transparent hover:text-se-bone"}`}
  >
    {children}
  </button>
);

const Input = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-[11px] font-accent tracking-[0.1em] uppercase text-se-steel mb-2">{label}</span>
    <input
      {...props}
      className="w-full px-4 py-3 border border-white/10 bg-se-asphalt text-se-bone
                 focus:outline-none focus:ring-1 focus:ring-se-gold/50 focus:border-se-gold/30 text-sm font-body"
    />
  </label>
);

export default function Account() {
  const [tab, setTab] = useState("signin");
  const [showOAuthConsent, setShowOAuthConsent] = useState(false);

  const { user, login, register, loginWithGoogle } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !showOAuthConsent) navigate("/account");
  }, [user, showOAuthConsent, navigate]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({ email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* Logged-in dashboard */
  if (user && !showOAuthConsent) {
    return (
      <>
        <SEO title="My Account — Style Eternal" description="Manage your Style Eternal account, orders, and rewards." />
        <AccountDashboard />
      </>
    );
  }

  /* Auth UI */
  return (
    <>
      <SEO title="Sign In — Style Eternal" description="Access your Style Eternal account." />

      <div className="bg-se-black text-se-bone min-h-screen pt-28 pb-24">
        <div className="max-w-md mx-auto px-6">
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="mb-10 text-center"
          >
            <Star size={24} className="mx-auto text-se-gold mb-4" />
            <p className="section-eyebrow mb-3">Account</p>
            <h1 className="font-display text-[clamp(2rem,5vw,3rem)] tracking-[0.04em] mb-3">
              WELCOME
            </h1>
            <p className="text-[13px] text-se-bone/40 font-accent">Sign in to access your orders, rewards, and exclusive drops.</p>
          </Motion.div>

          <div className="flex justify-center gap-6 mb-8">
            <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
              Sign In
            </TabButton>
            <TabButton active={tab === "create"} onClick={() => setTab("create")}>
              Create Account
            </TabButton>
          </div>

          <div className="auth-panel p-8 space-y-5">
            {tab === "signin" && (
              <>
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <button onClick={handleLogin} disabled={loading} className="btn-primary w-full" type="button">
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={async () => { await loginWithGoogle(); setShowOAuthConsent(true); }}
                  className="btn-outline w-full"
                >
                  Continue with Google
                </button>
              </>
            )}

            {tab === "create" && (
              <>
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                <button onClick={handleRegister} disabled={loading} className="btn-primary w-full" type="button">
                  {loading ? "Creating..." : "Create Account"}
                </button>

                <button
                  type="button"
                  onClick={async () => { await loginWithGoogle(); setShowOAuthConsent(true); }}
                  className="btn-outline w-full"
                >
                  Continue with Google
                </button>
              </>
            )}

            {error && (
              <p className="text-[12px] text-red-400 text-center pt-1">{error}</p>
            )}

            <p className="text-[10px] text-se-steel font-accent text-center leading-relaxed pt-2">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-se-bone/50 underline underline-offset-2">Terms</Link>,{" "}
              <Link to="/privacy" className="text-se-bone/50 underline underline-offset-2">Privacy Policy</Link>, and{" "}
              <Link to="/returns" className="text-se-bone/50 underline underline-offset-2">Returns Policy</Link>.
            </p>
          </div>

          {showOAuthConsent && (
            <div className="mt-6 text-center space-y-3">
              <p className="text-[11px] text-se-steel font-accent">
                By continuing, you agree to our{" "}
                <Link to="/terms" className="text-se-bone/50 underline underline-offset-2">Terms</Link>,{" "}
                <Link to="/privacy" className="text-se-bone/50 underline underline-offset-2">Privacy Policy</Link>, and{" "}
                <Link to="/returns" className="text-se-bone/50 underline underline-offset-2">Returns Policy</Link>.
              </p>
              <button className="btn-primary" onClick={() => navigate("/account")} type="button">
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

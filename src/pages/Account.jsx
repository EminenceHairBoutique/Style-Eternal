import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
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

  const { user, login, register, loginWithGoogle, loginWithApple } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/account");
  }, [user, navigate]);

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
  if (user) {
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
          <div className="mb-8 text-center">
            <p className="text-overline mb-3">Account</p>
            <h1 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] tracking-[0.06em]">
              WELCOME
            </h1>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
              Sign In
            </TabButton>
            <TabButton active={tab === "create"} onClick={() => setTab("create")}>
              Create Account
            </TabButton>
          </div>

          <div className="border border-white/10 bg-se-charcoal p-8 space-y-5">
            {tab === "signin" && (
              <>
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <button onClick={handleLogin} disabled={loading} className="btn-primary w-full" type="button">
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setError("");
                    setLoading(true);
                    try {
                      await loginWithGoogle();
                    } catch (err) {
                      setError(err.message || "Google sign-in failed. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="btn-outline w-full"
                >
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setError("");
                    setLoading(true);
                    try {
                      await loginWithApple();
                    } catch (err) {
                      setError(err.message || "Apple sign-in failed. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <svg width="15" height="15" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-167.2-143.5S50 239.2 118.1 162.9c64.1-71.7 163.5-120.3 255.2-120.3 87.5 0 158.3 56.6 212.8 56.6 54.5 0 139.7-59.8 238.4-59.8 38.2 0 137.9 3.2 213.4 97.4zm-494.1-65.4c-55.7 0-113.5 38.2-148.4 100.4-30.7 55.7-50.8 129.1-50.8 196.5 0 90 33.3 173.1 90.7 230.1 50.3 50.8 107.7 76.6 165.1 76.6 55.7 0 109.1-33.3 152-33.3 43.4 0 95.6 33.3 151.9 33.3 57.9 0 117.1-26.4 168.5-78.6 62.2-60.4 91.1-142 91.7-143.8-3.2-1.3-177.9-72.5-177.9-270.3 0-172.4 141.9-248.9 149.5-254.1-82.3-116.9-210.4-121.5-251.5-121.5-85.5 0-164.7 56-191.8 64.5z"/>
                  </svg>
                  Continue with Apple
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
                  onClick={async () => {
                    setError("");
                    setLoading(true);
                    try {
                      await loginWithGoogle();
                    } catch (err) {
                      setError(err.message || "Google sign-in failed. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="btn-outline w-full"
                >
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setError("");
                    setLoading(true);
                    try {
                      await loginWithApple();
                    } catch (err) {
                      setError(err.message || "Apple sign-in failed. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <svg width="15" height="15" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-167.2-143.5S50 239.2 118.1 162.9c64.1-71.7 163.5-120.3 255.2-120.3 87.5 0 158.3 56.6 212.8 56.6 54.5 0 139.7-59.8 238.4-59.8 38.2 0 137.9 3.2 213.4 97.4zm-494.1-65.4c-55.7 0-113.5 38.2-148.4 100.4-30.7 55.7-50.8 129.1-50.8 196.5 0 90 33.3 173.1 90.7 230.1 50.3 50.8 107.7 76.6 165.1 76.6 55.7 0 109.1-33.3 152-33.3 43.4 0 95.6 33.3 151.9 33.3 57.9 0 117.1-26.4 168.5-78.6 62.2-60.4 91.1-142 91.7-143.8-3.2-1.3-177.9-72.5-177.9-270.3 0-172.4 141.9-248.9 149.5-254.1-82.3-116.9-210.4-121.5-251.5-121.5-85.5 0-164.7 56-191.8 64.5z"/>
                  </svg>
                  Continue with Apple
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

        </div>
      </div>
    </>
  );
}

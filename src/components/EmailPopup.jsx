import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { subscribeEmail } from "../utils/subscribe";
import useFocusTrap from "../hooks/useFocusTrap";

const STORAGE_KEY = "se_email_popup_dismissed";
const CONSENT_KEY = "se_cookie_consent";

export default function EmailPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const trapRef = useFocusTrap(visible);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
  };

  // Dismiss on Escape key
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const DELAY = 45000; // 45 seconds after consent resolved
    let timer;

    const startTimer = () => {
      timer = setTimeout(() => {
        // Skip if user already verified via SMS discount flow
        try {
          if (localStorage.getItem("se_sms_verified") === "true") return;
        } catch { /* ignore */ }
        setVisible(true);
      }, DELAY);
    };

    try {
      if (localStorage.getItem(CONSENT_KEY)) {
        startTimer();
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }

    const onConsent = () => startTimer();
    window.addEventListener("se_consent_resolved", onConsent, { once: true });

    return () => {
      window.removeEventListener("se_consent_resolved", onConsent);
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    try {
      setStatus("loading");
      await subscribeEmail({ email, source: "email_popup" });
      setStatus("success");
      try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
      setTimeout(() => setVisible(false), 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <div ref={trapRef} className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} aria-hidden="true" />
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Email signup"
            className="relative bg-se-charcoal border border-white/10 p-8 md:p-10 max-w-md w-full mx-4 shadow-2xl"
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute top-4 right-4 text-se-steel hover:text-se-bone transition"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-3">
              Stay Connected
            </p>
            <h2 className="font-display text-[28px] md:text-[32px] tracking-[0.04em] leading-[1] mb-4">
              JOIN THE ARCHIVE
            </h2>
            <p className="text-[14px] text-se-bone/50 leading-relaxed mb-6">
              First access to every drop. Editorial updates. No noise.
            </p>

            {status === "success" ? (
              <p className="text-[13px] text-se-gold font-accent text-center py-4">
                Welcome to the archive.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3.5 bg-se-black/50 border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition"
                  required
                />
                <button type="submit" className="btn-primary px-6 py-3.5 text-[10px]">
                  {status === "loading" ? "..." : "Subscribe"}
                </button>
              </form>
            )}

            {status === "error" && (
              <p className="text-[12px] text-red-400 mt-3 font-accent text-center">
                Something went wrong. Try again.
              </p>
            )}
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

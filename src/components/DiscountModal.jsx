import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import useFocusTrap from "../hooks/useFocusTrap";

const STORAGE_KEY = "se_cookie_consent";

export default function DiscountModal({ user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const trapRef = useFocusTrap(open);

  const dismiss = () => {
    setOpen(false);
    try { window.dispatchEvent(new Event("se_discount_dismissed")); } catch { /* ignore */ }
  };

  // Dismiss on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (user) return;
    if (location.pathname.includes("checkout")) return;
    if (sessionStorage.getItem("se_discount_seen")) return;
    if (localStorage.getItem("se_sms_verified") === "true") return;

    const DELAY = 30000; // 30 seconds after consent resolved
    let timer;

    const startTimer = () => {
      timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("se_discount_seen", "true");
      }, DELAY);
    };

    // If consent already stored (returning visitor), start immediately
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        startTimer();
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }

    // First visit: wait for consent banner dismissal
    const onConsent = () => startTimer();
    window.addEventListener("se_consent_resolved", onConsent, { once: true });

    return () => {
      window.removeEventListener("se_consent_resolved", onConsent);
      clearTimeout(timer);
    };
  }, [user, location.pathname]);

  return (
    <AnimatePresence>
      {open && (
        <div ref={trapRef} className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} aria-hidden="true" />
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Exclusive discount offer"
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
              Exclusive Offer
            </p>
            <h2 className="font-display text-[28px] md:text-[32px] tracking-[0.04em] leading-[1] mb-4">
              GET 10% OFF
            </h2>
            <p className="text-[14px] text-se-bone/50 leading-relaxed mb-6">
              Join the inner circle. Get early access to drops, exclusive offers,
              and 10% off your first order.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={dismiss} className="btn-primary w-full" type="button">
                Maybe Later
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// src/pages/Checkout.jsx — Style Eternal
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, AlertTriangle, Truck, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import SEO from "../components/SEO";
import { trackBeginCheckout } from "../utils/track";
import { formatMoney as money, formatMoneyCents } from "../utils/format";

const CONSENT_VERSION = "v1.0";
const REFERRAL_KEY = "se_referral";
const DEFAULT_PREORDER_LEAD_DAYS = 21;

function readReferralCode() {
  try {
    const raw = window?.localStorage?.getItem?.(REFERRAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.code || null;
  } catch { return null; }
}

/** Modal for mixed cart (preorder + domestic) */
function MixedCartModal({ onCheckoutDomestic, onCheckoutPreorder, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-se-charcoal border border-white/10 max-w-md w-full p-8 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-se-gold" />
        </div>

        <h2 className="font-display text-[18px] tracking-[0.08em] mb-3">MIXED CART</h2>

        <p className="text-[13px] text-se-bone/50 leading-relaxed mb-6">
          Your cart contains <strong className="text-se-bone">standard</strong> and{" "}
          <strong className="text-se-bone">pre-order</strong> items. These ship separately.
          Please checkout each group individually.
        </p>

        <div className="space-y-3">
          <button onClick={onCheckoutDomestic} className="btn-primary w-full" type="button">
            Checkout Standard Items
          </button>
          <button onClick={onCheckoutPreorder} className="btn-outline w-full flex items-center justify-center gap-2" type="button">
            <Truck className="w-4 h-4" /> Checkout Pre-Order Items
          </button>
          <button onClick={onClose} className="w-full py-2 text-[11px] text-se-steel hover:text-se-bone transition font-accent" type="button">
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}

async function buildAndRedirectCheckout({ items, user, filterFn, onError, useStoreCredit }) {
  try {
    const filteredItems = filterFn ? items.filter(filterFn) : items;
    const filteredTotal = filteredItems.reduce(
      (s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0
    );

    try {
      window.localStorage.setItem("se_checkout_snapshot", JSON.stringify({
        items: filteredItems, total: filteredTotal, currency: "USD", timestamp: Date.now(),
      }));
    } catch { /* ignore */ }

    trackBeginCheckout({ items: filteredItems, value: filteredTotal });

    // Store credit requires a verified identity server-side.
    const headers = { "Content-Type": "application/json" };
    if (useStoreCredit && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch { /* proceed without credit */ }
    }

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers,
      body: JSON.stringify({
        items: filteredItems.map((i) => ({
          id: i.id,
          slug: i.slug,
          name: i.name,
          image: i.image,
          quantity: Number(i.quantity) || 1,
          size: i.size ?? null,
          colorway: i.colorway ?? null,
          isPreorder: Boolean(i.isPreorder),
          shipsFrom: i.shipsFrom ?? "Domestic",
          leadTimeDays: i.leadTimeDays ?? null,
        })),
        userId: user?.id || null,
        customerEmail: user?.email || null,
        referralCode: readReferralCode() || undefined,
        consentVersion: CONSENT_VERSION,
        useStoreCredit: Boolean(useStoreCredit),
      }),
    });

    if (!res.ok) {
      let message = "Checkout is temporarily unavailable. Please try again.";
      try {
        const errBody = await res.json();
        if (errBody?.error) message = errBody.error;
      } catch { /* non-JSON error body */ }
      throw new Error(message);
    }

    const data = await res.json();
    if (!data?.url) throw new Error("Stripe checkout URL missing");
    window.location.assign(data.url);
  } catch (err) {
    console.error("Checkout error:", err);
    if (onError) onError(err);
  }
}

export default function Checkout() {
  const { items = [], total = 0 } = useCart();
  const { user } = useUser();

  const [showMixedModal, setShowMixedModal] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [storeCreditCents, setStoreCreditCents] = useState(0);
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  const rootRef = useRef(null);

  // Available store credit for signed-in customers (gift cards redeem here).
  useEffect(() => {
    if (!user?.id || !supabase) {
      setStoreCreditCents(0);
      setUseStoreCredit(false);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("store_credit_cents")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const cents = Number(data?.store_credit_cents || 0);
        setStoreCreditCents(cents);
        if (cents > 0) setUseStoreCredit(true);
      })
      .catch(() => { /* column may not exist pre-RUNBOOK */ });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const hasPreorder = items.some((i) => i.isPreorder);
  const hasDomestic = items.some((i) => !i.isPreorder);
  const isMixed = hasPreorder && hasDomestic;

  const onError = (err) => {
    setRedirecting(false);
    setCheckoutError(err?.message || "Payment system temporarily unavailable. Please refresh and try again.");
  };

  const applyCredit = useStoreCredit && storeCreditCents > 0;

  async function handleCheckout() {
    if (redirecting) return;
    setCheckoutError(null);
    if (isMixed) { setShowMixedModal(true); return; }
    setRedirecting(true);
    await buildAndRedirectCheckout({ items, user, onError, useStoreCredit: applyCredit });
  }

  async function handleCheckoutDomestic() {
    if (redirecting) return;
    setShowMixedModal(false);
    setCheckoutError(null);
    setRedirecting(true);
    await buildAndRedirectCheckout({ items, user, filterFn: (i) => !i.isPreorder, onError, useStoreCredit: applyCredit });
  }

  async function handleCheckoutPreorder() {
    if (redirecting) return;
    setShowMixedModal(false);
    setCheckoutError(null);
    setRedirecting(true);
    await buildAndRedirectCheckout({ items, user, filterFn: (i) => i.isPreorder, onError, useStoreCredit: applyCredit });
  }

  return (
    <>
      <SEO title="Secure Checkout — Style Eternal" description="Encrypted checkout." />

      {showMixedModal && (
        <MixedCartModal
          onCheckoutDomestic={handleCheckoutDomestic}
          onCheckoutPreorder={handleCheckoutPreorder}
          onClose={() => setShowMixedModal(false)}
        />
      )}

      <div className="bg-se-black text-se-bone min-h-screen pt-28 pb-24">
        <div ref={rootRef} tabIndex={-1} className="content-wide grid lg:grid-cols-12 gap-12 outline-none">
          {/* Left — Info */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-[10px] text-se-steel font-accent mb-4">
              <span className="text-se-bone">Cart</span>
              <span>→</span>
              <span className="text-se-bone">Checkout</span>
              <span>→</span>
              <span>Payment</span>
            </div>

            <h1 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] mb-6">
              CHECKOUT
            </h1>

            <div className="flex items-center gap-2 text-[11px] text-se-steel font-accent mb-8">
              <Lock className="w-4 h-4" />
              Secure & encrypted checkout
            </div>

            {isMixed && (
              <div className="mb-6 border border-se-gold/30 bg-se-charcoal p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-se-gold shrink-0 mt-0.5" />
                <div className="text-[13px] text-se-bone/70">
                  <p className="font-medium mb-1">Mixed cart — separate checkout required</p>
                  <p className="text-[11px] text-se-bone/40">
                    Your cart contains standard + pre-order items. You'll checkout each group separately.
                  </p>
                </div>
              </div>
            )}

            <div className="border border-white/5 bg-se-charcoal p-6 space-y-3">
              <p className="text-[13px] text-se-bone/50">
                You will be securely redirected to Stripe to complete your purchase.
                Apple Pay, Google Pay and all major cards accepted.
              </p>
              <p className="text-[11px] text-se-steel font-accent">
                Shipping address and delivery options are collected at payment.
              </p>
            </div>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 border border-white/5 bg-se-charcoal p-6">
              <h2 className="font-display text-[14px] tracking-[0.12em] mb-6">ORDER SUMMARY</h2>

              {items.length === 0 ? (
                <p className="text-[13px] text-se-steel">Your bag is empty.</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.cartKey || `${item.id}::${item.variant || ""}`} className="flex gap-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-20 h-24 object-cover bg-se-asphalt border border-white/5" />
                      ) : (
                        <div className="w-20 h-24 bg-se-asphalt border border-white/5 flex items-center justify-center">
                          <span className="font-display text-[10px] tracking-[0.2em] text-se-steel">SE</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-accent truncate">{item.name}</p>
                        <p className="text-[11px] text-se-steel mt-1">
                          {item.size && `Size ${item.size}`}
                          {item.colorway && ` · ${item.colorway}`}
                          {` · Qty ${item.quantity}`}
                        </p>
                        {item.isPreorder && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-se-gold font-accent">
                            <Truck className="w-3 h-3" />
                            Pre-Order · {item.leadTimeDays ?? DEFAULT_PREORDER_LEAD_DAYS} days
                          </div>
                        )}
                      </div>

                      <p className="text-[13px] font-accent">{money(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-white/[0.06] mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-[13px] font-accent">
                  <span className="text-se-bone/60">Subtotal</span>
                  <span>{money(total)}</span>
                </div>

                {storeCreditCents > 0 && (
                  <div className="flex items-center justify-between gap-3 text-[13px] font-accent">
                    <label className="flex items-center gap-2 cursor-pointer text-se-bone/60">
                      <input
                        type="checkbox"
                        checked={useStoreCredit}
                        onChange={(e) => setUseStoreCredit(e.target.checked)}
                        className="accent-[#C4A35A]"
                      />
                      Store credit ({formatMoneyCents(storeCreditCents)})
                    </label>
                    {applyCredit && (
                      <span className="text-se-gold">
                        −{formatMoneyCents(Math.min(storeCreditCents, Math.round(total * 100)))}
                      </span>
                    )}
                  </div>
                )}
                {applyCredit && (
                  <p className="text-[10px] text-se-steel font-accent">
                    Promo codes can't be combined with store credit.
                  </p>
                )}

                <div className="flex justify-between text-[13px] font-accent">
                  <span className="text-se-bone/60">Shipping</span>
                  <span className="text-se-steel">At checkout</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between text-[15px] font-accent font-medium">
                  <span>Total</span>
                  <span>
                    {applyCredit
                      ? formatMoneyCents(Math.max(0, Math.round(total * 100) - storeCreditCents))
                      : money(total)}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[10px] text-se-steel font-accent text-center leading-relaxed">
                By completing your purchase you agree to our{" "}
                <Link to="/terms" className="text-se-bone/50 underline underline-offset-2">Terms</Link>,{" "}
                <Link to="/privacy" className="text-se-bone/50 underline underline-offset-2">Privacy Policy</Link>, and{" "}
                <Link to="/returns" className="text-se-bone/50 underline underline-offset-2">Returns Policy</Link>.
              </p>

              {checkoutError && (
                <p className="mt-3 text-[11px] text-se-red-bright text-center font-accent">{checkoutError}</p>
              )}

              <button
                disabled={!items || items.length === 0 || redirecting}
                onClick={handleCheckout}
                aria-busy={redirecting}
                className={`mt-6 w-full ${!items || items.length === 0 ? "btn-outline opacity-50 cursor-not-allowed" : "btn-primary"} ${redirecting ? "opacity-70 cursor-wait" : ""}`}
                type="button"
              >
                {redirecting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Redirecting to secure payment…
                  </span>
                ) : (
                  "Continue to Payment"
                )}
              </button>

              <div className="mt-4 text-[10px] text-se-steel font-accent space-y-1">
                <p>Free shipping on orders over $150</p>
                <p>Standard shipping: 5–7 business days</p>
                {hasPreorder && <p className="text-se-gold">Pre-order items: 14–21 business days</p>}
              </div>

              <Link to="/shop" onClick={() => {}} className="block text-center text-[11px] text-se-steel hover:text-se-bone transition font-accent mt-6">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// src/pages/Success.jsx — Style Eternal
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Clock, Truck, PenLine } from "lucide-react";
import SEO from "../components/SEO";
import { useCart } from "../context/CartContext";
import { trackPurchase } from "../utils/track";

const DEFAULT_PREORDER_LEAD_TIME_RANGE = "14–21 business days";

export default function Success() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isPreorder, setIsPreorder] = useState(false);
  const [leadTimeDays, setLeadTimeDays] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    try {
      const snapRaw = window.localStorage.getItem("se_checkout_snapshot");
      const snap = snapRaw ? JSON.parse(snapRaw) : null;
      const items = Array.isArray(snap?.items) ? snap.items : [];
      const hasPreorder = items.some((i) => i.isPreorder);
      setIsPreorder(hasPreorder);
      if (hasPreorder && items.length > 0) {
        const leads = items.map((i) => Number(i.leadTimeDays || 0)).filter((n) => n > 0);
        const maxLead = leads.length > 0 ? Math.max(...leads) : 0;
        setLeadTimeDays(maxLead > 0 ? maxLead : null);
      }
    } catch { /* ignore */ }

    try {
      const lastTracked = window.localStorage.getItem("se_purchase_tracked_session");
      if (lastTracked !== sessionId) {
        const snapRaw = window.localStorage.getItem("se_checkout_snapshot");
        const snap = snapRaw ? JSON.parse(snapRaw) : null;
        const value = snap && typeof snap.total !== "undefined" ? Number(snap.total) : undefined;
        const items = Array.isArray(snap?.items) ? snap.items : [];
        trackPurchase({ transaction_id: sessionId, value, items });
        window.localStorage.setItem("se_purchase_tracked_session", sessionId);
        window.localStorage.removeItem("se_checkout_snapshot");
      }
    } catch { /* ignore */ }

    clearCart();
  }, [sessionId, clearCart]);

  return (
    <>
      <SEO title="Order Confirmed — Style Eternal" description="Your order has been placed." />

      <div className="bg-se-black text-se-bone min-h-[70vh] pt-32 pb-24">
        <div className="content-wide text-center">
          <p className="text-overline mb-4">Checkout</p>
          <h1 className="font-display text-[clamp(2rem,5vw,3rem)] tracking-[0.04em] mb-6">
            ORDER CONFIRMED
          </h1>
          <p className="text-[15px] text-se-bone/50 max-w-md mx-auto mb-6">
            Thank you for shopping with <strong className="text-se-bone">Style Eternal</strong>.
          </p>

          {isPreorder ? (
            <div className="max-w-md mx-auto mb-10 space-y-4">
              <div className="border border-se-gold/30 bg-se-charcoal p-6 text-left space-y-4">
                <p className="text-[12px] font-accent tracking-[0.15em] uppercase text-se-gold text-center">
                  Pre-Order Confirmation
                </p>

                <div className="flex items-center gap-3 text-[13px] text-se-bone/70">
                  <Clock className="w-4 h-4 shrink-0 text-se-gold" />
                  <div>
                    <p className="font-medium">
                      Estimated dispatch: {leadTimeDays ? `${leadTimeDays} business days` : DEFAULT_PREORDER_LEAD_TIME_RANGE}
                    </p>
                    <p className="text-[11px] text-se-bone/40 mt-0.5">
                      Your order enters the production queue immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13px] text-se-bone/70">
                  <Truck className="w-4 h-4 shrink-0 text-se-gold" />
                  <div>
                    <p className="font-medium">Tracking sent when shipped</p>
                    <p className="text-[11px] text-se-bone/40 mt-0.5">
                      A tracking number will be emailed once your order ships.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-se-steel font-accent">
                Pre-order sales are final. No returns or exchanges. Confirmation email incoming.
              </p>
            </div>
          ) : (
            <p className="text-[15px] text-se-bone/40 max-w-md mx-auto mb-10">
              Your payment was successful. A confirmation email has been sent with your order details.
            </p>
          )}

          {sessionId && (
            <p className="text-[10px] tracking-[0.2em] uppercase text-se-steel font-accent mb-10">
              Session · {sessionId.slice(-8)}
            </p>
          )}

          <div className="flex justify-center gap-4">
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
            <Link to="/account" className="btn-outline">View Orders</Link>
          </div>
        </div>
      </div>
    </>
  );
}

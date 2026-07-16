// src/components/FreeShippingMeter.jsx — Style Eternal
// Thin progress meter toward the free-shipping threshold. Reads the same
// threshold the server charges against (VITE_FREE_SHIPPING_THRESHOLD dollars,
// default 150 = FREE_SHIPPING_THRESHOLD_CENTS 15000).

import React from "react";
import { formatMoney } from "../utils/format";

const THRESHOLD = Number(import.meta.env?.VITE_FREE_SHIPPING_THRESHOLD || 150);

export default function FreeShippingMeter({ subtotal = 0, className = "" }) {
  if (!THRESHOLD || THRESHOLD <= 0) return null;

  const remaining = Math.max(0, THRESHOLD - Number(subtotal || 0));
  const progress = Math.min(1, Number(subtotal || 0) / THRESHOLD);
  const unlocked = remaining <= 0;

  return (
    <div className={className} aria-live="polite">
      <p className="text-[10px] font-accent tracking-[0.14em] uppercase text-se-bone/60">
        {unlocked ? (
          <span className="text-se-gold">Free shipping unlocked</span>
        ) : (
          <>
            <span className="text-se-bone">{formatMoney(remaining)}</span> away from
            free shipping
          </>
        )}
      </p>
      <div
        className="mt-2 h-[2px] bg-white/10 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress toward free shipping"
      >
        <div
          className="h-full bg-se-gold transition-[width] duration-500 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

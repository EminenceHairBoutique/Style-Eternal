// src/utils/pricing.js
//
// Checkout-side pricing adjustments.
// This helper handles any custom-request surcharges at checkout time.

export function applyCustomPricing({
  basePrice,
  isCustom,
  customNotes,
} = {}) {
  let total = Number(basePrice || 0);
  if (!Number.isFinite(total) || total < 0) total = 0;

  const breakdown = [];

  if (isCustom && String(customNotes || "").trim()) {
    breakdown.push(
      "Custom request noted (concierge will confirm any additional pricing if needed)."
    );
  }

  return {
    price: Math.round(total),
    breakdown,
  };
}

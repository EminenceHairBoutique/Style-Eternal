// Loyalty logic (shared by UI + webhook)
//
// Philosophy:
// - Simple, transparent earn rate
// - One-time first-purchase bonus
// - Tier is based on lifetime spend (auto-calculated)

export const LOYALTY = {
  pointsPerDollar: 1, // $1 = 1 point
  firstPurchaseBonusPoints: 200,
  // Spend thresholds are in cents
  tiers: [
    {
      name: "Foundation",
      minSpendCents: 0,
      perks: ["Member-only drops", "Birthday surprise"],
    },
    {
      name: "Established",
      minSpendCents: 50_000,
      perks: ["Early access", "Priority restock alerts"],
    },
    {
      name: "Permanent",
      minSpendCents: 150_000,
      perks: ["VIP support", "Exclusive offers"],
    },
    {
      name: "Eternal",
      minSpendCents: 350_000,
      perks: ["Private styling perks", "Top-tier VIP treatment"],
    },
  ],
};

export function pointsForPurchaseCents(amountCents) {
  const cents = Number(amountCents || 0);
  if (!Number.isFinite(cents) || cents <= 0) return 0;
  const dollars = Math.floor(cents / 100);
  return Math.max(0, dollars * LOYALTY.pointsPerDollar);
}

export function tierForSpendCents(lifetimeSpendCents) {
  const spend = Math.max(0, Number(lifetimeSpendCents || 0));
  const tiers = [...LOYALTY.tiers].sort((a, b) => a.minSpendCents - b.minSpendCents);

  let current = tiers[0];
  for (const t of tiers) {
    if (spend >= t.minSpendCents) current = t;
  }
  return current;
}

export function nextTierInfo(lifetimeSpendCents) {
  const spend = Math.max(0, Number(lifetimeSpendCents || 0));
  const tiers = [...LOYALTY.tiers].sort((a, b) => a.minSpendCents - b.minSpendCents);
  const current = tierForSpendCents(spend);

  const idx = tiers.findIndex((t) => t.name === current.name);
  const next = idx >= 0 ? tiers[idx + 1] : null;

  if (!next) {
    return {
      current,
      next: null,
      progress: 1,
      remainingCents: 0,
    };
  }

  const span = Math.max(1, next.minSpendCents - current.minSpendCents);
  const into = Math.max(0, spend - current.minSpendCents);
  const progress = Math.min(1, into / span);
  const remainingCents = Math.max(0, next.minSpendCents - spend);

  return { current, next, progress, remainingCents };
}

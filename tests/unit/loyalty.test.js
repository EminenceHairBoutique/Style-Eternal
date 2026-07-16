import { describe, it, expect } from "vitest";
import {
  LOYALTY,
  pointsForPurchaseCents,
  tierForSpendCents,
  nextTierInfo,
} from "../../src/utils/loyalty.js";

describe("pointsForPurchaseCents", () => {
  it("awards one point per whole dollar", () => {
    expect(pointsForPurchaseCents(15000)).toBe(150);
    expect(pointsForPurchaseCents(15099)).toBe(150); // cents floor, never round up
  });

  it("returns 0 for zero, negative, or invalid amounts", () => {
    expect(pointsForPurchaseCents(0)).toBe(0);
    expect(pointsForPurchaseCents(-500)).toBe(0);
    expect(pointsForPurchaseCents(NaN)).toBe(0);
    expect(pointsForPurchaseCents(undefined)).toBe(0);
  });
});

describe("tierForSpendCents", () => {
  it("maps spend to the highest qualifying tier", () => {
    expect(tierForSpendCents(0).name).toBe("Foundation");
    expect(tierForSpendCents(49_999).name).toBe("Foundation");
    expect(tierForSpendCents(50_000).name).toBe("Established");
    expect(tierForSpendCents(150_000).name).toBe("Permanent");
    expect(tierForSpendCents(999_999).name).toBe("Eternal");
  });
});

describe("nextTierInfo", () => {
  it("reports progress toward the next tier", () => {
    const info = nextTierInfo(25_000); // halfway from Foundation to Established
    expect(info.current.name).toBe("Foundation");
    expect(info.next.name).toBe("Established");
    expect(info.progress).toBeCloseTo(0.5);
    expect(info.remainingCents).toBe(25_000);
  });

  it("caps at the top tier with progress 1", () => {
    const info = nextTierInfo(1_000_000);
    expect(info.current.name).toBe("Eternal");
    expect(info.next).toBeNull();
    expect(info.progress).toBe(1);
    expect(info.remainingCents).toBe(0);
  });

  it("tier thresholds are strictly increasing (config sanity)", () => {
    const mins = LOYALTY.tiers.map((t) => t.minSpendCents);
    const sorted = [...mins].sort((a, b) => a - b);
    expect(mins).toEqual(sorted);
    expect(new Set(mins).size).toBe(mins.length);
  });
});

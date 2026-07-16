import { describe, it, expect } from "vitest";
import {
  getStartingPrice,
  filterByCategory,
  filterByCollection,
  filterByStatus,
  filterBySize,
  sortProducts,
  searchProducts,
} from "../../src/utils/productFiltering.js";

const P = [
  { name: "Alpha Tee", category: "tees", collectionSlug: "core", price: 65, sizes: ["S", "M"], releaseStatus: "available", isNew: true, tags: ["heavyweight"] },
  { name: "Bravo Hoodie", category: "hoodies", collectionSlug: "core", price: 145, sizes: ["M", "L"], releaseStatus: "available", limited: true },
  { name: "Charlie Cap", category: "headwear", collectionSlug: "extras", price: 40, sizes: ["OS"], releaseStatus: "coming-soon" },
  { name: "Delta Jacket", category: "outerwear", collectionSlug: "extras", price: 250, sizes: ["L"], releaseStatus: "sold-out", colorway: "Washed Black" },
];

describe("filters", () => {
  it("filterByCategory / filterByCollection pass through when empty", () => {
    expect(filterByCategory(P, "")).toHaveLength(4);
    expect(filterByCategory(P, "tees").map((p) => p.name)).toEqual(["Alpha Tee"]);
    expect(filterByCollection(P, "extras")).toHaveLength(2);
  });

  it("filterByStatus handles the special new/limited pseudo-statuses", () => {
    expect(filterByStatus(P, "new").map((p) => p.name)).toEqual(["Alpha Tee"]);
    expect(filterByStatus(P, "limited").map((p) => p.name)).toEqual(["Bravo Hoodie"]);
    expect(filterByStatus(P, "sold-out").map((p) => p.name)).toEqual(["Delta Jacket"]);
  });

  it("filterBySize matches size arrays", () => {
    expect(filterBySize(P, "M").map((p) => p.name)).toEqual(["Alpha Tee", "Bravo Hoodie"]);
  });
});

describe("sortProducts", () => {
  it("sorts by price in both directions without mutating input", () => {
    const asc = sortProducts(P, "price-asc").map((p) => p.price);
    expect(asc).toEqual([40, 65, 145, 250]);
    const desc = sortProducts(P, "price-desc").map((p) => p.price);
    expect(desc).toEqual([250, 145, 65, 40]);
    expect(P[0].name).toBe("Alpha Tee"); // original untouched
  });

  it("name-asc sorts alphabetically", () => {
    expect(sortProducts(P, "name-asc")[0].name).toBe("Alpha Tee");
  });
});

describe("searchProducts", () => {
  it("matches across name, colorway, and tags, case-insensitively", () => {
    expect(searchProducts(P, "HEAVYWEIGHT").map((p) => p.name)).toEqual(["Alpha Tee"]);
    expect(searchProducts(P, "washed").map((p) => p.name)).toEqual(["Delta Jacket"]);
    expect(searchProducts(P, "")).toHaveLength(4);
  });
});

describe("getStartingPrice", () => {
  it("reads price with fallbacks", () => {
    expect(getStartingPrice({ price: 10 })).toBe(10);
    expect(getStartingPrice({ basePrice: 20 })).toBe(20);
    expect(getStartingPrice({})).toBe(0);
  });
});

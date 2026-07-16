// src/utils/productFiltering.js
// Style Eternal — Product filtering and pricing helpers for apparel.

/**
 * Returns the starting price for a product.
 * For apparel, price is a flat number on each product.
 */
export const getStartingPrice = (p) => {
  return Number(p.price ?? p.basePrice ?? p.fromPrice ?? 0);
};

/**
 * Filter products by category slug.
 */
export const filterByCategory = (products, category) => {
  if (!category) return products;
  return products.filter((p) => p.category === category);
};

/**
 * Filter products by collection slug.
 */
export const filterByCollection = (products, collectionSlug) => {
  if (!collectionSlug) return products;
  return products.filter((p) => p.collectionSlug === collectionSlug);
};

/**
 * Filter products by release status.
 */
export const filterByStatus = (products, status) => {
  if (!status) return products;
  if (status === "new") return products.filter((p) => p.isNew);
  if (status === "limited") return products.filter((p) => p.limited && p.releaseStatus === "available");
  if (status === "preorder") return products.filter((p) => p.releaseStatus === "preorder");
  return products.filter((p) => p.releaseStatus === status);
};

/**
 * Filter products by fit.
 */
export const filterByFit = (products, fit) => {
  if (!fit) return products;
  return products.filter((p) => p.fit === fit);
};

/**
 * Filter products by size availability.
 */
export const filterBySize = (products, size) => {
  if (!size) return products;
  return products.filter((p) => Array.isArray(p.sizes) && p.sizes.includes(size));
};

/**
 * Availability rank — purchasable products always sort before teasers.
 * 0 = buy now (available/preorder), 1 = coming soon, 2 = sold out/archive.
 */
export const availabilityRank = (p) => {
  const status = p?.releaseStatus || "available";
  if (status === "available" || status === "preorder") return 0;
  if (status === "coming-soon") return 1;
  return 2;
};

/**
 * Sort products. Every mode uses availability as the primary key so a grid
 * never leads with pieces nobody can buy.
 */
export const sortProducts = (products, sortKey) => {
  const sorted = [...products];
  const byAvailability = (a, b) => availabilityRank(a) - availabilityRank(b);

  switch (sortKey) {
    case "price-asc":
      return sorted.sort(
        (a, b) => byAvailability(a, b) || getStartingPrice(a) - getStartingPrice(b)
      );
    case "price-desc":
      return sorted.sort(
        (a, b) => byAvailability(a, b) || getStartingPrice(b) - getStartingPrice(a)
      );
    case "newest":
      return sorted.sort(
        (a, b) => byAvailability(a, b) || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      );
    case "name-asc":
      return sorted.sort(
        (a, b) => byAvailability(a, b) || (a.name || "").localeCompare(b.name || "")
      );
    default:
      return sorted.sort(byAvailability);
  }
};

/**
 * Search products by query string.
 */
export const searchProducts = (products, query) => {
  if (!query) return products;
  const q = query.toLowerCase().trim();
  return products.filter((p) => {
    const haystack = [
      p.name,
      p.displayName,
      p.collection,
      p.category,
      p.colorway,
      p.description,
      ...(p.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
};

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
 * Sort products.
 */
export const sortProducts = (products, sortKey) => {
  const sorted = [...products];
  switch (sortKey) {
    case "price-asc":
      return sorted.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
    case "price-desc":
      return sorted.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
    case "newest":
      return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    case "name-asc":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    default:
      return sorted;
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

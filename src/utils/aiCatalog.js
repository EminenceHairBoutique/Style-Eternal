import { products } from "../data/products";

/**
 * Build a compact catalog for AI context — only the fields the model needs to
 * recommend and link products. Excludes coming-soon/archive items and trims to
 * keep the request payload small. Used by StylistChat and AI search.
 */
export function buildAiCatalog(limit = 120) {
  return products
    .filter((p) => p.releaseStatus !== "coming-soon" && p.releaseStatus !== "archive")
    .slice(0, limit)
    .map((p) => ({
      slug: p.slug,
      name: p.displayName || p.name,
      category: p.category,
      collection: p.collection,
      price: p.price,
      fit: p.fit,
      description: p.description,
    }));
}

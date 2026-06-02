/**
 * useProductOverlay — storefront price/stock overlay.
 *
 * The storefront renders the rich hardcoded catalog (src/data/products.js) for
 * all content (stories, images, sizes, collections, filtering). This hook pulls
 * the commerce fields (price, compare_at_price, stock, is_active) from the
 * Supabase `products` table — the same table the admin price editor writes to —
 * and exposes them by slug. Components overlay these onto the hardcoded product
 * so admin edits show live, while everything else stays hardcoded.
 *
 * One fetch per page session, shared across all components via a module cache.
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

let cache = null;           // Map<slug, { price, comparePrice, stock, isActive }>
let inflight = null;        // de-dupe concurrent first fetches
const subscribers = new Set();

function notify() {
  subscribers.forEach((cb) => cb());
}

export async function loadOverlay() {
  if (cache) return cache;
  if (inflight) return inflight;
  if (!supabase) {
    cache = new Map();
    return cache;
  }
  inflight = (async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("slug, price, compare_at_price, stock, is_active");
      const map = new Map();
      if (!error && Array.isArray(data)) {
        for (const r of data) {
          if (!r.slug) continue;
          map.set(r.slug, {
            price: r.price != null ? Number(r.price) : null,
            comparePrice: r.compare_at_price != null ? Number(r.compare_at_price) : null,
            stock: r.stock != null ? Number(r.stock) : null,
            isActive: r.is_active !== false,
          });
        }
      }
      cache = map;
      notify();
      return cache;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * Returns the overlay record for a single slug, or null if none / not loaded.
 * Triggers the shared fetch on first use.
 */
export function useProductPrice(slug) {
  const [, force] = useState(0);

  useEffect(() => {
    let active = true;
    const rerender = () => active && force((n) => n + 1);
    subscribers.add(rerender);
    loadOverlay();
    return () => {
      active = false;
      subscribers.delete(rerender);
    };
  }, []);

  if (!cache || !slug) return null;
  return cache.get(slug) || null;
}

/**
 * Merge the overlay onto a hardcoded product object. Overrides `price` and
 * `comparePrice` when a DB row exists for the product's slug; leaves all other
 * (rich) fields untouched.
 */
export function applyOverlay(product, overlay) {
  if (!product || !overlay) return product;
  return {
    ...product,
    price: overlay.price != null ? overlay.price : product.price,
    comparePrice: overlay.comparePrice != null ? overlay.comparePrice : product.comparePrice,
  };
}

/**
 * contentCache.js
 * ---------------------------------------------------------------------------
 * Source-of-truth: Supabase `page_content` table.
 *
 * Strategy: fetch a page's content once, cache it in memory, and only refetch
 * when the row's `updated_at` changes. The storefront stays fast (no DB call
 * on every render) while still picking up admin edits quickly.
 *
 * How freshness works:
 *  - The first call to getContent(pageKey) fetches the full row and caches it.
 *  - Subsequent calls return the cached copy immediately.
 *  - To force a refresh after an admin save, call invalidateContent(pageKey)
 *    (the admin editor calls this after writing). The next getContent() then
 *    refetches.
 *  - Optionally, pass { revalidate: true } to getContent to do a lightweight
 *    `updated_at`-only check and refetch only if the server copy is newer.
 *
 * Tables expected (created by the Phase 3 migration):
 *   page_content(page_key TEXT UNIQUE, title TEXT, blocks JSONB, updated_at TIMESTAMPTZ)
 * ---------------------------------------------------------------------------
 */
import { supabase } from "./supabaseClient";

/** In-memory cache: pageKey -> { row, fetchedAt } */
const cache = new Map();

/** In-flight requests: pageKey -> Promise (dedupes concurrent fetches) */
const inflight = new Map();

/**
 * Internal: fetch the full row from Supabase.
 * Returns the row object or null if not found.
 */
async function fetchRow(pageKey) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase
    .from("page_content")
    .select("page_key, title, blocks, updated_at")
    .eq("page_key", pageKey)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

/**
 * Internal: fetch ONLY the updated_at for a cheap freshness check.
 */
async function fetchUpdatedAt(pageKey) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("page_content")
    .select("updated_at")
    .eq("page_key", pageKey)
    .maybeSingle();
  if (error) throw error;
  return data?.updated_at || null;
}

/**
 * getContent(pageKey, options)
 * ---------------------------------------------------------------------------
 * Returns the cached row for a page, fetching it if not cached.
 *
 * @param {string} pageKey            e.g. "tos", "about", "homepage"
 * @param {object} [options]
 * @param {boolean} [options.revalidate=false]  If true and a cached copy
 *        exists, do a cheap updated_at check and refetch only if stale.
 * @returns {Promise<object|null>}    The row { page_key, title, blocks, updated_at }
 */
export async function getContent(pageKey, options = {}) {
  const { revalidate = false } = options;

  // Return cached copy if present and not explicitly revalidating.
  if (cache.has(pageKey) && !revalidate) {
    return cache.get(pageKey).row;
  }

  // If revalidating and we have a cached copy, only refetch when stale.
  if (cache.has(pageKey) && revalidate) {
    try {
      const serverUpdatedAt = await fetchUpdatedAt(pageKey);
      const cachedRow = cache.get(pageKey).row;
      const cachedUpdatedAt = cachedRow?.updated_at || null;
      if (serverUpdatedAt && serverUpdatedAt === cachedUpdatedAt) {
        // Server hasn't changed — keep cache.
        return cachedRow;
      }
      // else fall through to full refetch below
    } catch {
      // If the cheap check fails, fall back to returning the cached copy
      // rather than throwing — stale content is better than a crash.
      return cache.get(pageKey).row;
    }
  }

  // Dedupe concurrent fetches for the same key.
  if (inflight.has(pageKey)) {
    return inflight.get(pageKey);
  }

  const promise = (async () => {
    try {
      const row = await fetchRow(pageKey);
      cache.set(pageKey, { row, fetchedAt: Date.now() });
      return row;
    } finally {
      inflight.delete(pageKey);
    }
  })();

  inflight.set(pageKey, promise);
  return promise;
}

/**
 * invalidateContent(pageKey)
 * ---------------------------------------------------------------------------
 * Clears a single page (or all pages) from the cache. Call this from the admin
 * editor right after a successful save so the storefront picks up changes.
 *
 * @param {string} [pageKey]  If omitted, clears the entire cache.
 */
export function invalidateContent(pageKey) {
  if (pageKey == null) {
    cache.clear();
    return;
  }
  cache.delete(pageKey);
}

/**
 * primeContent(pageKey, row)
 * ---------------------------------------------------------------------------
 * Optional: seed the cache directly (e.g. after an admin save you already have
 * the fresh row, so you can avoid an extra round-trip).
 */
export function primeContent(pageKey, row) {
  if (!pageKey || !row) return;
  cache.set(pageKey, { row, fetchedAt: Date.now() });
}

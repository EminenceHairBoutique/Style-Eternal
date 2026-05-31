/**
 * usePageContent.js
 * ---------------------------------------------------------------------------
 * React hook that wraps contentCache.getContent for use in storefront pages.
 *
 * Usage:
 *   const { content, loading, error, refetch } = usePageContent("tos");
 *   // content = { page_key, title, blocks, updated_at } | null
 *   // pass content.blocks to <BlockRenderer />
 *
 * - Fetches on mount (and whenever pageKey changes).
 * - `revalidate` option does a cheap updated_at check against the cache.
 * - `refetch()` forces a fresh fetch (bypasses cache).
 * ---------------------------------------------------------------------------
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { getContent, invalidateContent } from "../lib/contentCache";

export function usePageContent(pageKey, { revalidate = true } = {}) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track mounted state so we never setState after unmount.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (forceFresh = false) => {
      if (!pageKey) return;
      setLoading(true);
      setError(null);
      try {
        if (forceFresh) invalidateContent(pageKey);
        const row = await getContent(pageKey, { revalidate });
        if (mountedRef.current) setContent(row);
      } catch (err) {
        if (mountedRef.current) {
          setError(err?.message || "Failed to load content.");
          setContent(null);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [pageKey, revalidate]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const refetch = useCallback(() => load(true), [load]);

  return { content, loading, error, refetch };
}

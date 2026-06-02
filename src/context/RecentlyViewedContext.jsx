import { createContext, useCallback, useContext, useState } from "react";

/**
 * RecentlyViewedContext — tracks the last few product slugs a visitor opened,
 * in memory only (NOT localStorage). Clears on tab close, which keeps it
 * privacy-light and avoids stale cross-session data.
 */
const RecentlyViewedContext = createContext({
  recentSlugs: [],
  addSlug: () => {},
});

const MAX_RECENT = 4;

export function RecentlyViewedProvider({ children }) {
  const [recentSlugs, setRecentSlugs] = useState([]);

  // Push a slug to the front, de-duplicated, capped at MAX_RECENT.
  const addSlug = useCallback((slug) => {
    if (!slug) return;
    setRecentSlugs((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)];
      return next.slice(0, MAX_RECENT);
    });
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ recentSlugs, addSlug }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}

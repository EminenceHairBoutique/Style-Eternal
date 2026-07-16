// src/context/WishlistContext.jsx — Style Eternal
// Persistent wishlist, keyed by product slug.
//
// Guests: localStorage ("se_wishlist"). Signed-in: the `wishlists` table
// (owner-scoped RLS). On sign-in the guest list merges into the account
// (upsert, ignore duplicates) and local storage is cleared, so hearts
// survive refreshes and follow the customer across devices.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "./UserContext";

const STORAGE_KEY = "se_wishlist";
const WishlistContext = createContext(null);

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeLocal(slugs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch { /* ignore */ }
}

export function WishlistProvider({ children }) {
  const { user } = useUser();
  const [slugs, setSlugs] = useState(() => readLocal());
  const [loading, setLoading] = useState(false);
  const mergedForUser = useRef(null);

  const userId = user?.id || null;

  // Sign-in: merge the guest list into the account, then load the account list.
  useEffect(() => {
    if (!userId || !supabase) {
      // Signed out → back to the local list.
      mergedForUser.current = null;
      setSlugs(readLocal());
      return;
    }
    if (mergedForUser.current === userId) return;
    mergedForUser.current = userId;

    let active = true;
    (async () => {
      setLoading(true);
      try {
        const guest = readLocal();
        if (guest.length) {
          await supabase
            .from("wishlists")
            .upsert(
              guest.map((product_slug) => ({ user_id: userId, product_slug })),
              { onConflict: "user_id,product_slug", ignoreDuplicates: true }
            );
          writeLocal([]);
        }

        const { data, error } = await supabase
          .from("wishlists")
          .select("product_slug")
          .eq("user_id", userId);

        if (!active) return;
        if (!error && Array.isArray(data)) {
          setSlugs(data.map((r) => r.product_slug).filter(Boolean));
        }
      } catch { /* table may not exist yet — local list still works */ }
      finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const has = useCallback((slug) => slugs.includes(slug), [slugs]);

  const toggle = useCallback(
    (slug) => {
      if (!slug) return;
      const adding = !slugs.includes(slug);

      // Optimistic update either way.
      setSlugs((prev) => (adding ? [...prev, slug] : prev.filter((s) => s !== slug)));

      if (userId && supabase) {
        (async () => {
          try {
            if (adding) {
              await supabase
                .from("wishlists")
                .upsert(
                  [{ user_id: userId, product_slug: slug }],
                  { onConflict: "user_id,product_slug", ignoreDuplicates: true }
                );
            } else {
              await supabase
                .from("wishlists")
                .delete()
                .eq("user_id", userId)
                .eq("product_slug", slug);
            }
          } catch { /* optimistic state stands; next load reconciles */ }
        })();
      } else {
        writeLocal(adding ? [...readLocal(), slug] : readLocal().filter((s) => s !== slug));
      }
    },
    [slugs, userId]
  );

  const value = useMemo(
    () => ({ slugs, has, toggle, count: slugs.length, loading }),
    [slugs, has, toggle, loading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}

/**
 * useDrops — storefront hook for live drops.
 *
 * Reads drops with status = 'live' (RLS also enforces this) ordered by
 * sort_order, each with its assigned products. Returns { drops, loading,
 * error }. A single drop can be fetched by slug with useDrop(slug).
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const SELECT =
  "id, name, slug, description, hero_image, status, release_at, sort_order, " +
  "drop_products(sort_order, products(id, name, slug, price, images, is_active))";

function normalize(row) {
  const products = (row.drop_products || [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((dp) => dp.products)
    .filter(Boolean);
  return { ...row, products };
}

export function useDrops() {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error: err } = await supabase
        .from("drops")
        .select(SELECT)
        .eq("status", "live")
        .order("sort_order", { ascending: true });
      if (!active) return;
      if (err) setError(err.message);
      else setDrops((data || []).map(normalize));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { drops, loading, error };
}

export function useDrop(slug) {
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!supabase || !slug) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error: err } = await supabase
        .from("drops")
        .select(SELECT)
        .eq("slug", slug)
        .neq("status", "draft")
        .maybeSingle();
      if (!active) return;
      if (err) setError(err.message);
      else setDrop(data ? normalize(data) : null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  return { drop, loading, error };
}

/**
 * useAllDrops — every non-draft drop (scheduled / live / archived) for the
 * public drop calendar, ordered by release date (soonest first).
 */
export function useAllDrops() {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error: err } = await supabase
        .from("drops")
        .select(SELECT)
        .neq("status", "draft")
        .order("release_at", { ascending: true, nullsFirst: false });
      if (!active) return;
      if (err) setError(err.message);
      else setDrops((data || []).map(normalize));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { drops, loading, error };
}

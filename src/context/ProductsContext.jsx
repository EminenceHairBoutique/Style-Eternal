import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as catalog } from "../data/products";
import { loadOverlay } from "../hooks/useProductOverlay";

/**
 * ProductsContext — single shared source of the storefront catalog.
 *
 * The catalog itself is the rich hardcoded data (instant, no fetch), so the
 * grid renders immediately — there is never a long skeleton flash. On app
 * mount we load the Supabase price/stock overlay once (shared with
 * useProductOverlay's module cache, so ProductCard doesn't double-fetch) and
 * merge price / compareprice / stock onto each product by slug.
 *
 * `loading` is only true until that first overlay load resolves; consumers can
 * show a brief skeleton on true first load if they want, but the products are
 * already available regardless.
 */
const ProductsContext = createContext({ products: catalog, loading: false });

export function ProductsProvider({ children }) {
  const [overlay, setOverlay] = useState(null); // Map<slug, {...}> | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadOverlay()
      .then((map) => {
        if (!active) return;
        setOverlay(map);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const products = useMemo(() => {
    if (!overlay || overlay.size === 0) return catalog;
    return catalog.map((p) => {
      const o = overlay.get(p.slug);
      if (!o) return p;
      return {
        ...p,
        price: o.price != null ? o.price : p.price,
        comparePrice: o.comparePrice != null ? o.comparePrice : p.comparePrice,
        liveStock: o.stock,
      };
    });
  }, [overlay]);

  const value = useMemo(() => ({ products, loading }), [products, loading]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  return useContext(ProductsContext);
}

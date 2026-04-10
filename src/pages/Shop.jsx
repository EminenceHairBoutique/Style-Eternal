// src/pages/Shop.jsx — Style Eternal
import React, { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion as Motion } from "framer-motion";

import {
  products,
  categories,
  collections,
} from "../data/products";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

const SORT_OPTIONS = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
];

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

export default function Shop() {
  const { category: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read params
  const filterParam = searchParams.get("filter") || "";
  const collectionParam = searchParams.get("collection") || "";
  const sortParam = searchParams.get("sort") || "featured";
  const sizeParam = searchParams.get("size") || "";

  // Category from route
  const activeCategory = categories.find((c) => c.slug === categorySlug) || null;

  // Filter + Sort
  const filtered = useMemo(() => {
    let result = [...products];

    // Special filters
    if (filterParam === "new") result = result.filter((p) => p.isNew);
    if (filterParam === "limited") result = result.filter((p) => p.limited && p.releaseStatus === "available");

    // Category filter
    if (activeCategory) result = result.filter((p) => p.category === activeCategory.slug);

    // Collection filter
    if (collectionParam) result = result.filter((p) => p.collectionSlug === collectionParam);

    // Size filter
    if (sizeParam) result = result.filter((p) => p.sizes?.includes(sizeParam));

    // Sort
    switch (sortParam) {
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        // featured: new first, then limited, then available, then archive
        result.sort((a, b) => {
          if (a.isNew !== b.isNew) return b.isNew ? 1 : -1;
          if (a.limited !== b.limited) return b.limited ? 1 : -1;
          return 0;
        });
    }

    return result;
  }, [filterParam, activeCategory, collectionParam, sortParam, sizeParam]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = filterParam || collectionParam || sizeParam;

  // Page title
  const pageTitle = activeCategory
    ? activeCategory.label
    : filterParam === "new"
    ? "New Arrivals"
    : filterParam === "limited"
    ? "Limited"
    : "Shop All";

  return (
    <>
      <SEO
        title={`${pageTitle} — Style Eternal`}
        description="Shop premium streetwear from Style Eternal. Tees, hoodies, outerwear, and accessories rooted in Newark."
      />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Header */}
        <section className="pt-28 pb-8 md:pt-36 md:pb-12 border-b border-white/5">
          <div className="content-wide">
            <p className="text-overline mb-2">Style Eternal</p>
            <h1 className="font-display text-[clamp(2rem,6vw,4rem)] leading-[0.9] tracking-[0.04em]">
              {pageTitle.toUpperCase()}
            </h1>
            {filterParam === "new" && (
              <p className="text-[14px] text-se-bone/40 mt-3 max-w-lg">
                The latest additions. Fresh from the studio.
              </p>
            )}
          </div>
        </section>

        {/* Category Tabs + Filter Bar */}
        <div className="border-b border-white/5 sticky top-0 z-30 bg-se-black/95 backdrop-blur-sm">
          <div className="content-wide py-4">
            {/* Category Row */}
            <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
              <Link
                to="/shop"
                className={`text-[11px] font-accent uppercase tracking-[0.2em] whitespace-nowrap transition ${
                  !activeCategory && !filterParam ? "text-se-bone" : "text-se-steel hover:text-se-bone"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/shop/${cat.slug}`}
                  className={`text-[11px] font-accent uppercase tracking-[0.2em] whitespace-nowrap transition ${
                    activeCategory?.slug === cat.slug ? "text-se-bone" : "text-se-steel hover:text-se-bone"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* Sort / Filter Controls */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="flex items-center gap-2 text-[11px] font-accent uppercase tracking-[0.18em] text-se-steel hover:text-se-bone transition"
                  type="button"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-1.5 h-1.5 rounded-full bg-se-gold" />
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] font-accent uppercase tracking-[0.18em] text-se-steel hover:text-se-bone transition"
                    type="button"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-se-steel font-accent">{filtered.length} pieces</span>
                <select
                  value={sortParam}
                  onChange={(e) => updateParam("sort", e.target.value === "featured" ? "" : e.target.value)}
                  className="bg-transparent text-[11px] font-accent uppercase tracking-[0.15em] text-se-bone border-none focus:outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key} className="bg-se-charcoal">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="border-b border-white/5 bg-se-charcoal">
            <div className="content-wide py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Collection filter */}
                <div>
                  <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-3">Collection</p>
                  <div className="flex flex-wrap gap-2">
                    {collections.map((col) => (
                      <button
                        key={col.slug}
                        onClick={() => updateParam("collection", collectionParam === col.slug ? "" : col.slug)}
                        className={`text-[10px] font-accent uppercase tracking-[0.15em] px-3 py-1.5 border transition ${
                          collectionParam === col.slug
                            ? "border-se-bone text-se-bone"
                            : "border-white/10 text-se-steel hover:text-se-bone hover:border-white/20"
                        }`}
                        type="button"
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size filter */}
                <div>
                  <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map((size) => (
                      <button
                        key={size}
                        onClick={() => updateParam("size", sizeParam === size ? "" : size)}
                        className={`text-[11px] font-accent w-10 h-10 flex items-center justify-center border transition ${
                          sizeParam === size
                            ? "border-se-bone text-se-bone"
                            : "border-white/10 text-se-steel hover:text-se-bone hover:border-white/20"
                        }`}
                        type="button"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick filters */}
                <div>
                  <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-3">Quick Filter</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "new", label: "New Arrivals" },
                      { key: "limited", label: "Limited" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => updateParam("filter", filterParam === f.key ? "" : f.key)}
                        className={`text-[10px] font-accent uppercase tracking-[0.15em] px-3 py-1.5 border transition ${
                          filterParam === f.key
                            ? "border-se-bone text-se-bone"
                            : "border-white/10 text-se-steel hover:text-se-bone hover:border-white/20"
                        }`}
                        type="button"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <section className="section-pad">
          <div className="content-wide">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((product, i) => (
                  <Motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4), ease: [0.2, 0, 0, 1] }}
                  >
                    <ProductCard product={product} />
                  </Motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="font-display text-[20px] tracking-[0.1em] text-se-steel mb-4">
                  NO PIECES FOUND
                </p>
                <p className="text-[14px] text-se-bone/30 mb-8">
                  Try adjusting your filters or browse all pieces.
                </p>
                <Link to="/shop" className="btn-outline">
                  Shop All
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

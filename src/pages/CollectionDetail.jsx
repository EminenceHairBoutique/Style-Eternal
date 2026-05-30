// src/pages/CollectionDetail.jsx — Style Eternal
import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { motion as Motion } from "framer-motion";

import { collections, products, categories } from "../data/products";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

const SORT_OPTIONS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
];

export default function CollectionDetail() {
  const { slug } = useParams();
  const [sortKey, setSortKey] = useState("featured");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Find collection
  const collection = collections.find((c) => c.slug === slug);

  // Get products
  const collectionProducts = useMemo(() => {
    let result = products.filter((p) => p.collectionSlug === slug);

    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }

    switch (sortKey) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        result.sort((a, b) => {
          if (a.isNew !== b.isNew) return b.isNew ? 1 : -1;
          if (a.limited !== b.limited) return b.limited ? 1 : -1;
          return 0;
        });
    }
    return result;
  }, [slug, sortKey, categoryFilter]);

  // Available categories for this collection
  const availableCategories = useMemo(() => {
    const cats = new Set(products.filter((p) => p.collectionSlug === slug).map((p) => p.category));
    return categories.filter((c) => cats.has(c.slug));
  }, [slug]);

  if (!collection) {
    return (
      <div className="bg-se-black text-se-bone min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-[28px] tracking-[0.1em] mb-4">COLLECTION NOT FOUND</h1>
          <Link to="/collections" className="btn-outline">
            View All Collections
          </Link>
        </div>
      </div>
    );
  }

  const siteUrl = import.meta?.env?.VITE_SITE_URL || "https://www.shopstyleeternal.com";
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Collections", item: `${siteUrl}/collections` },
          { "@type": "ListItem", position: 3, name: collection.name },
        ],
      },
    ],
  };

  return (
    <>
      <SEO
        title={`${collection.name} — Style Eternal`}
        description={collection.description}
        jsonLd={collectionJsonLd}
      />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Hero */}
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
          {/* Background image */}
          {collection.image && (
            <>
              <div className="absolute inset-0">
                <img
                  src={collection.image}
                  alt=""
                  className="h-full w-full object-cover opacity-20"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-se-black/60 via-se-black/80 to-se-black" />
            </>
          )}

          <div className="relative content-wide">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-[11px] font-accent uppercase tracking-[0.18em] text-se-steel hover:text-se-bone transition mb-8"
            >
              <ArrowLeft size={14} />
              All Collections
            </Link>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            >
              <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-4">
                {collection.season}
              </p>
              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-[0.04em] mb-4">
                {collection.name.toUpperCase()}
              </h1>
              <p className="text-[13px] text-se-bone/50 font-accent mb-2 italic">
                {collection.tagline}
              </p>
              <p className="text-[15px] text-se-bone/40 leading-relaxed max-w-xl">
                {collection.description}
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="border-y border-white/5 bg-se-black/95 backdrop-blur-sm sticky top-0 z-30">
          <div className="content-wide py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-x-auto">
              <button
                onClick={() => setCategoryFilter("")}
                className={`text-[11px] font-accent uppercase tracking-[0.18em] whitespace-nowrap transition ${
                  !categoryFilter ? "text-se-bone" : "text-se-steel hover:text-se-bone"
                }`}
                type="button"
              >
                All ({products.filter((p) => p.collectionSlug === slug).length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategoryFilter(categoryFilter === cat.slug ? "" : cat.slug)}
                  className={`text-[11px] font-accent uppercase tracking-[0.18em] whitespace-nowrap transition ${
                    categoryFilter === cat.slug ? "text-se-bone" : "text-se-steel hover:text-se-bone"
                  }`}
                  type="button"
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
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

        {/* Product Grid */}
        <section className="section-pad">
          <div className="content-wide">
            {collectionProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {collectionProducts.map((product, i) => (
                  <Motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: [0.2, 0, 0, 1] }}
                  >
                    <ProductCard product={product} />
                  </Motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-display text-[18px] tracking-[0.1em] text-se-steel mb-4">
                  NO PIECES IN THIS CATEGORY
                </p>
                <button
                  onClick={() => setCategoryFilter("")}
                  className="btn-outline"
                  type="button"
                >
                  View All
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Other Collections */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <h2 className="font-display text-[20px] tracking-[0.1em] mb-8">
              MORE COLLECTIONS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {collections
                .filter((c) => c.slug !== slug)
                .slice(0, 3)
                .map((col) => (
                  <Link
                    key={col.slug}
                    to={`/collections/${col.slug}`}
                    className="group block relative aspect-[16/10] bg-se-charcoal border border-white/5 hover:border-white/15 overflow-hidden transition-all duration-300"
                  >
                    {col.image && (
                      <img
                        src={col.image}
                        alt={col.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-se-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-1">
                        {col.season}
                      </p>
                      <h3 className="font-display text-[18px] tracking-[0.06em]">
                        {col.name.toUpperCase()}
                      </h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

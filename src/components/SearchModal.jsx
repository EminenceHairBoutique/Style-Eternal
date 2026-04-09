import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { products } from "../data/products";
import { resolveProductImages } from "../utils/productMedia";
import { norm } from "../utils/strings";

export default function SearchModal({ open, onClose }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const results = useMemo(() => {
    const needle = norm(q);
    if (!needle) return [];

    return products
      .map((p) => {
        const hay = norm(
          `${p.name} ${p.category} ${p.collection} ${p.collectionSlug} ${p.colorway} ${p.drop} ${p.garmentType} ${p.fabric}`
        );
        if (!hay.includes(needle)) return null;
        const nameHay = norm(p.name);
        const score = nameHay.includes(needle) ? 3 : 1;
        return { p, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.p);
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <Motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute left-1/2 top-20 w-[min(960px,92vw)] -translate-x-1/2 bg-se-charcoal border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
              <Search className="w-4 h-4 text-se-steel" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tees, hoodies, drops, collections..."
                className="flex-1 bg-transparent outline-none text-sm text-se-bone placeholder:text-se-steel font-body"
              />
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-white/5 transition"
                aria-label="Close search"
              >
                <X className="w-5 h-5 text-se-bone" />
              </button>
            </div>

            <div className="px-6 py-5">
              {!q ? (
                <div className="grid md:grid-cols-3 gap-4">
                  <QuickLink title="Tees" href="/shop/tees" subtitle="Heavyweight cuts" onClick={onClose} />
                  <QuickLink title="Hoodies" href="/shop/hoodies" subtitle="Premium fleece" onClick={onClose} />
                  <QuickLink title="New Drops" href="/drops" subtitle="Latest releases" onClick={onClose} />
                </div>
              ) : results.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-se-bone/70">No matches found.</p>
                  <p className="mt-2 text-[11px] text-se-steel font-accent">
                    Try searching by category, collection, or colorway.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      onClick={onClose}
                      className="group border border-white/5 bg-se-asphalt hover:bg-se-concrete transition overflow-hidden"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-se-asphalt">
                        {resolveProductImages(p)?.[0] ? (
                          <img
                            src={resolveProductImages(p)[0]}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-[14px] tracking-[0.2em] text-se-steel">SE</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-se-steel font-accent">
                          {p.category}
                          {p.colorway ? ` · ${p.colorway}` : ""}
                        </p>
                        <p className="mt-1 text-[13px] text-se-bone font-accent">{p.name}</p>
                        {p.collection && (
                          <p className="mt-1 text-[11px] text-se-steel">{p.collection}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 pb-5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-se-steel font-accent">
                Try "hoodie", "north ward", "essential", or "black".
              </p>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

function QuickLink({ title, subtitle, href, onClick }) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className="border border-white/5 bg-se-asphalt hover:bg-se-concrete transition p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.15em] text-se-steel font-accent">{title}</p>
      <p className="mt-2 text-[13px] text-se-bone">{subtitle}</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-se-gold font-accent">
        Explore
      </p>
    </Link>
  );
}

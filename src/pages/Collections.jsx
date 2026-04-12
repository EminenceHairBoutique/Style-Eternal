// src/pages/Collections.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { collections, getProductsByCollection } from "../data/products";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

export default function Collections() {
  return (
    <>
      <SEO
        title="Collections — Style Eternal"
        description="Explore every collection from Style Eternal. North Ward, Iron Bound, Essentials, Legacy, Graphics, and the Archive."
      />

      <div className="bg-se-black text-se-bone">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="section-eyebrow mb-4">Explore</p>
              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-[0.04em] mb-6">
                COLLECTIONS
              </h1>
              <p className="text-[15px] md:text-[17px] text-se-bone/50 max-w-lg leading-relaxed mb-3">
                Each collection is rooted in a place, a moment, or a principle.
                Browse the full universe.
              </p>
              <p className="text-[12px] font-accent text-se-steel tracking-[0.15em]">
                {collections.length} collections · {collections.reduce((sum, c) => sum + getProductsByCollection(c.slug).length, 0)} pieces
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Collection Grid */}
        <section className="section-pad">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-6">
              {collections.map((col, i) => {
                const count = getProductsByCollection(col.slug).length;
                const isFirst = i === 0;
                return (
                  <Motion.div
                    key={col.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.2, 0, 0, 1] }}
                  >
                    <Link
                      to={`/collections/${col.slug}`}
                      className={`group block relative overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-300 ${isFirst ? "md:col-span-2" : ""}`}
                    >
                      {/* Image Area */}
                      <div className={`${isFirst ? "aspect-[21/9]" : "aspect-[16/10]"} bg-se-charcoal overflow-hidden relative`}>
                        {col.image ? (
                          <img
                            src={col.image}
                            alt={col.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-se-charcoal to-se-asphalt">
                            <span className="font-display text-[32px] tracking-[0.15em] text-se-steel/15">
                              {col.name.toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-se-black/80 via-se-black/20 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent">
                              {col.season}
                            </span>
                            {col.slug === "archive" && (
                              <span className="badge badge-archive text-[8px]">Archive</span>
                            )}
                          </div>
                          <h2 className="font-display text-[24px] md:text-[32px] tracking-[0.06em] mb-1">
                            {col.name.toUpperCase()}
                          </h2>
                          <p className="text-[12px] text-se-bone/50 font-accent">
                            {col.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Bottom bar */}
                      <div className="flex items-center justify-between px-6 py-4 bg-se-charcoal border-t border-white/5">
                        <p className="text-[11px] text-se-bone/40 font-accent">
                          {count} {count === 1 ? "piece" : "pieces"}
                        </p>
                        <span className="flex items-center gap-1 text-[10px] font-accent uppercase tracking-[0.2em] text-se-bone/30 group-hover:text-se-bone/70 transition">
                          Explore <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  </Motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Shop All CTA */}
        <section className="pb-20 md:pb-28">
          <div className="content-wide text-center">
            <Motion.div {...fadeUp}>
              <p className="section-eyebrow mb-4">The Full Archive</p>
              <div className="divider-gold mb-8 mx-auto w-16" />
              <h2 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] tracking-[0.06em] mb-4">
                SEE EVERYTHING
              </h2>
              <p className="text-[14px] text-se-bone/40 mb-8 max-w-sm mx-auto">
                Every piece. Every collection. Every drop — in one place.
              </p>
              <Link to="/shop" className="btn-primary">
                Shop All Pieces
              </Link>
            </Motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

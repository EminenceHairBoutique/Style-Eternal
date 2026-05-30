// src/pages/Lookbook.jsx — Style Eternal Lookbook

import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { collections, products } from "../data/products";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

export default function Lookbook() {
  const featuredCollections = collections.filter((c) => c.slug !== "archive");

  return (
    <>
      <SEO
        title="Lookbook — Style Eternal"
        description="Editorial lookbook by Style Eternal. Premium streetwear styled with intention. See the full vision."
      />

      <div className="bg-se-black text-se-bone">
        {/* Hero */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide text-center">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">Editorial</p>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] tracking-[0.06em] leading-[0.95] mb-6">
                LOOKBOOK
              </h1>
              <p className="text-[15px] text-se-bone/40 max-w-lg mx-auto leading-relaxed">
                Pieces styled with intention. Each collection tells a story —
                from concept to concrete.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Collection Spreads */}
        {featuredCollections.map((col, idx) => {
          const colProducts = products
            .filter((p) => p.collectionSlug === col.slug && p.releaseStatus !== "sold-out")
            .slice(0, 3);

          return (
            <section
              key={col.slug}
              className="section-pad border-b border-white/5"
            >
              <div className="content-wide">
                <Motion.div {...fadeUp} className="mb-10">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-2">
                    {col.season}
                  </p>
                  <h2 className="font-display text-[clamp(1.5rem,4vw,3rem)] tracking-[0.06em] mb-3">
                    {col.name.toUpperCase()}
                  </h2>
                  <p className="text-[14px] text-se-bone/40 max-w-xl leading-relaxed">
                    {col.description}
                  </p>
                </Motion.div>

                {/* Editorial grid — asymmetric */}
                <div
                  className={`grid gap-4 ${
                    idx % 2 === 0
                      ? "md:grid-cols-[2fr_1fr]"
                      : "md:grid-cols-[1fr_2fr]"
                  }`}
                >
                  {/* Large hero image slot */}
                  <Motion.div
                    {...fadeUp}
                    className={`aspect-[4/5] bg-se-charcoal overflow-hidden border border-white/5 ${
                      idx % 2 !== 0 ? "md:order-2" : ""
                    }`}
                  >
                    {colProducts[0] ? (
                      <Link to={`/products/${colProducts[0].slug}`} className="block h-full w-full relative group">
                        <img
                          src={`${colProducts[0].imageFolder}/01.webp`}
                          alt={colProducts[0].displayName}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-se-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-5">
                          <span className="font-accent text-[10px] tracking-[0.2em] uppercase text-se-bone/60">
                            {colProducts[0].displayName}
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-se-charcoal to-se-asphalt">
                        <span className="font-display text-[24px] tracking-[0.2em] text-se-steel/20">
                          {col.name.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Motion.div>

                  {/* Stacked secondary images */}
                  <div className="grid gap-4">
                    {colProducts.slice(1, 3).map((p) => (
                      <Motion.div
                        key={p.id}
                        {...fadeUp}
                        className="aspect-[16/9] bg-se-charcoal overflow-hidden border border-white/5"
                      >
                        <Link to={`/products/${p.slug}`} className="block h-full w-full relative group">
                          <img
                            src={`${p.imageFolder}/01.webp`}
                            alt={p.displayName}
                            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-se-black/50 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <span className="font-accent text-[9px] tracking-[0.18em] uppercase text-se-bone/50">
                              {p.displayName}
                            </span>
                          </div>
                        </Link>
                      </Motion.div>
                    ))}
                    {colProducts.length < 3 && (
                      <div className="aspect-[16/9] bg-se-charcoal border border-white/5 flex items-center justify-center">
                        <span className="text-[11px] text-se-steel/30 font-accent uppercase tracking-[0.2em]">
                          More Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    to={`/collections/${col.slug}`}
                    className="inline-flex items-center gap-2 text-[11px] font-accent uppercase tracking-[0.2em] text-se-bone/40 hover:text-se-bone transition"
                  >
                    Shop {col.name} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

        {/* Editorial statement */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
              <div className="divider-gold mb-10 mx-auto w-24" />
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.1] tracking-[0.04em] mb-6">
                EVERY PIECE<br />TELLS A STORY
              </h2>
              <p className="text-[15px] text-se-bone/40 leading-relaxed max-w-lg mx-auto mb-10">
                Style Eternal is more than clothes. It&apos;s a record of where we come from
                and where we&apos;re going. Each drop is designed with a narrative —
                rooted in the real, built for the forever.
              </p>
              <Link to="/shop" className="btn-primary">
                Shop All
              </Link>
            </Motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

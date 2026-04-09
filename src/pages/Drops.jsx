// src/pages/Drops.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getProductsByDrop } from "../data/products";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

const drops = [
  {
    id: "drop-03",
    name: "Drop 03: Love Never Dies",
    slug: "love-never-dies",
    tagline: "Some things outlast everything.",
    season: "SS26",
    description:
      "Five pieces. A skeleton tee, two heavyweight hoodies, a statement graphic, and an all-over long sleeve. The realest thing we've made. Love Never Dies.",
    status: "Available Now",
    image: "/assets/products/love-never-dies-tee/01.jpg",
  },
  {
    id: "drop-01",
    name: "Drop 01: North Ward",
    slug: "north-ward",
    tagline: "Where it started.",
    season: "SS26",
    description:
      "The inaugural collection. Heavyweight garments, washed finishes, and graphics pulled from the streets of Newark's North Ward. Every piece carries the texture of brick and iron.",
    status: "Available Now",
    image: "/assets/collections/north-ward-hero.jpg",
  },
  {
    id: "drop-02",
    name: "Drop 02: Iron Bound",
    slug: "iron-bound",
    tagline: "Old world. New uniform.",
    season: "SS26",
    description:
      "Named for the Ironbound District. Where immigrant grit meets modern streetwear. Garment-washed pieces with utility-driven details.",
    status: "Available Now",
    image: "/assets/collections/iron-bound-hero.jpg",
  },
  {
    id: "capsule-legacy",
    name: "Capsule: Legacy",
    slug: "legacy",
    tagline: "Built, not inherited.",
    season: "FW25",
    description:
      "Limited capsule of premium pieces. Varsity jackets in wool and leather. Fitted caps. Statement items that define the top tier.",
    status: "Limited",
    image: "/assets/collections/legacy-hero.jpg",
  },
];

export default function Drops() {
  return (
    <>
      <SEO
        title="Drops — Style Eternal"
        description="Every release. Every season. Browse current and upcoming drops from Style Eternal."
      />

      <div className="bg-se-black text-se-bone">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">Releases</p>
              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-[0.04em] mb-6">
                DROPS
              </h1>
              <p className="text-[15px] md:text-[17px] text-se-bone/50 max-w-lg leading-relaxed">
                Every collection tells a story. Every drop has a window.
                Once it closes, it moves to the archive.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Drop List */}
        <section className="section-pad">
          <div className="content-wide space-y-0">
            {drops.map((drop, i) => {
              const count = getProductsByDrop(drop.id).length;
              return (
                <Motion.article
                  key={drop.id}
                  {...fadeUp}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                  className="border-b border-white/5 py-12 md:py-20"
                >
                  <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                    {/* Image */}
                    <Link to={`/collections/${drop.slug}`} className="block">
                      <div className="aspect-[4/5] bg-se-charcoal overflow-hidden group">
                        {drop.image ? (
                          <img
                            src={drop.image}
                            alt={drop.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-se-charcoal to-se-asphalt">
                            <span className="font-display text-[28px] tracking-[0.15em] text-se-steel/20">
                              {drop.name.split(":")[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Copy */}
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent">
                          {drop.season}
                        </span>
                        <span className={`text-[9px] tracking-[0.2em] uppercase font-accent px-2 py-1 ${
                          drop.status === "Limited"
                            ? "badge-limited"
                            : "border border-white/10 text-se-bone/60"
                        }`}>
                          {drop.status}
                        </span>
                      </div>

                      <h2 className="font-display text-[clamp(1.5rem,4vw,2.8rem)] leading-[1] tracking-[0.04em] mb-2">
                        {drop.name.toUpperCase()}
                      </h2>
                      <p className="text-[14px] text-se-gold/80 font-accent mb-6">
                        {drop.tagline}
                      </p>
                      <p className="text-[15px] text-se-bone/50 leading-relaxed mb-4 max-w-md">
                        {drop.description}
                      </p>
                      <p className="text-[12px] text-se-steel font-accent mb-8">
                        {count} {count === 1 ? "piece" : "pieces"}
                      </p>

                      <Link to={`/collections/${drop.slug}`} className="btn-primary">
                        Explore Drop <ArrowRight size={14} className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </Motion.article>
              );
            })}
          </div>
        </section>

        {/* Upcoming / Archive CTA */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-6">
              <Motion.div {...fadeUp} className="p-8 md:p-12 border border-white/5 bg-se-charcoal">
                <p className="text-overline mb-3">Coming Soon</p>
                <h3 className="font-display text-[24px] md:text-[30px] tracking-[0.06em] mb-4">
                  DROP 04
                </h3>
                <p className="text-[14px] text-se-bone/40 leading-relaxed mb-6">
                  Sign up for first access. Details dropping soon.
                </p>
                <Link to="/#newsletter" className="btn-outline text-[10px]">
                  Get Notified
                </Link>
              </Motion.div>

              <Motion.div {...fadeUp} className="p-8 md:p-12 border border-white/5 bg-se-charcoal">
                <p className="text-overline mb-3">Past Releases</p>
                <h3 className="font-display text-[24px] md:text-[30px] tracking-[0.06em] mb-4">
                  THE ARCHIVE
                </h3>
                <p className="text-[14px] text-se-bone/40 leading-relaxed mb-6">
                  Previous drops preserved. Once sold out, they live here.
                </p>
                <Link to="/collections/archive" className="btn-outline text-[10px]">
                  View Archive
                </Link>
              </Motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// src/pages/Drops.jsx — Style Eternal
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DROPS_ROADMAP } from "../data/products";
import SEO from "../components/SEO";
import { subscribeEmail } from "../utils/subscribe";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

const drops = [
  {
    id: "drop-01",
    name: "Drop 01: Love Never Dies",
    slug: "love-never-dies",
    tagline: "Some things outlast everything.",
    season: "SS26",
    pieces: 5,
    description:
      "Five pieces. A skeleton tee, two heavyweight hoodies, a statement graphic, and an all-over long sleeve. The realest thing we've made. Love Never Dies.",
    status: "available",
    image: "/assets/products/love-never-dies-tee/01.jpg",
  },
  {
    id: "drop-02",
    name: "Drop 02: Eternal Flame",
    slug: "eternal-flame",
    tagline: "Heat that never fades.",
    season: "FW26",
    pieces: 4,
    description:
      "Four pieces forged in fire. Heavy fabrics, warm tones, and graphics that burn slow. Eternal Flame arrives Fall/Winter 2026.",
    status: "coming-soon",
    image: null,
  },
];

export default function Drops() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    try {
      setStatus("loading");
      await subscribeEmail({ email, source: "drops_page" });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

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
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Drop List */}
        <section className="section-pad">
          <div className="content-wide space-y-0">
            {drops.map((drop, i) => {
              const isComingSoon = drop.status === "coming-soon";
              return (
                <Motion.article
                  key={drop.id}
                  {...fadeUp}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                  className={`border-b border-white/5 py-12 md:py-20 ${isComingSoon ? "opacity-50" : ""}`}
                >
                  <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                    {/* Image */}
                    <div className="block">
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
                    </div>

                    {/* Copy */}
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent">
                          {drop.season}
                        </span>
                        <span className="text-[9px] tracking-[0.2em] uppercase font-accent px-2 py-1 border border-white/10 text-se-bone/60">
                          {isComingSoon ? "Coming Soon" : "Available Now"}
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
                        {drop.pieces} {drop.pieces === 1 ? "piece" : "pieces"}
                      </p>

                      {!isComingSoon && (
                        <Link to={`/collections/${drop.slug}`} className="btn-primary">
                          Explore Drop <ArrowRight size={14} className="ml-2" />
                        </Link>
                      )}
                    </div>
                  </div>
                </Motion.article>
              );
            })}
          </div>
        </section>

        {/* The Roadmap */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12 md:mb-16">
              <p className="text-overline mb-4">The Vision</p>
              <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] tracking-[0.06em]">
                THE ROADMAP
              </h2>
            </Motion.div>

            {/* Mobile: vertical timeline */}
            <div className="md:hidden space-y-0">
              {DROPS_ROADMAP.map((entry, i) => (
                <Motion.div
                  key={entry.number}
                  {...fadeUp}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.2, 0, 0, 1] }}
                  className={`flex items-start gap-5 py-5 border-b border-white/5 ${
                    entry.status === "future" ? "opacity-30" : ""
                  }`}
                >
                  {/* Status dot + line */}
                  <div className="flex flex-col items-center pt-1">
                    {entry.status === "available" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-se-gold" />
                    ) : entry.status === "coming-soon" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-se-steel animate-pulse" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-se-steel/30" />
                    )}
                  </div>
                  {/* Info */}
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-se-gold font-accent">
                      Drop {entry.number}
                    </p>
                    <p className="font-display text-[18px] tracking-[0.04em] leading-tight mt-1">
                      {entry.title.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-se-steel font-accent mt-1">
                      {entry.season}
                    </p>
                  </div>
                </Motion.div>
              ))}
            </div>

            {/* Desktop: horizontal timeline */}
            <div className="hidden md:block overflow-x-auto">
              <div className="flex items-start min-w-max">
                {DROPS_ROADMAP.map((entry, i) => (
                  <Motion.div
                    key={entry.number}
                    {...fadeUp}
                    transition={{ duration: 0.7, delay: i * 0.06, ease: [0.2, 0, 0, 1] }}
                    className={`flex flex-col items-center text-center w-[120px] shrink-0 ${
                      entry.status === "future" ? "opacity-30" : ""
                    }`}
                  >
                    {/* Dot */}
                    {entry.status === "available" ? (
                      <span className="w-3 h-3 rounded-full bg-se-gold" />
                    ) : entry.status === "coming-soon" ? (
                      <span className="w-3 h-3 rounded-full bg-se-steel animate-pulse" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-se-steel/30" />
                    )}
                    {/* Connecting line */}
                    {i < DROPS_ROADMAP.length - 1 && (
                      <div className="w-full h-px bg-white/5 -mt-1.5 mb-1.5 translate-x-[60px]" />
                    )}
                    {/* Label */}
                    <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mt-3">
                      Drop {entry.number}
                    </p>
                    <p className="font-display text-[13px] tracking-[0.04em] leading-tight mt-1 px-1">
                      {entry.title.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-se-steel font-accent mt-1">
                      {entry.season}
                    </p>
                  </Motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Subscribe for Drop Alerts */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
              <p className="text-overline mb-4">Stay in the Loop</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] mb-4">
                SUBSCRIBE FOR DROP ALERTS
              </h2>
              <p className="text-[14px] text-se-bone/40 mb-8 max-w-md mx-auto">
                First access. Release dates. No noise.
              </p>

              <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3.5 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition"
                  required
                />
                <button type="submit" className="btn-primary px-6 py-3.5 text-[10px]">
                  {status === "success" ? "Subscribed" : "Subscribe"}
                </button>
              </form>

              {status === "success" && (
                <p className="text-[12px] text-se-gold mt-4 font-accent">You&apos;re on the list.</p>
              )}
              {status === "error" && (
                <p className="text-[12px] text-se-red-bright mt-4 font-accent">Something went wrong. Try again.</p>
              )}
            </Motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

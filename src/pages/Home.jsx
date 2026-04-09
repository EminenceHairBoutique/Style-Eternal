// src/pages/Home.jsx — Style Eternal Homepage

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { collections, getNewArrivals, getLimitedProducts } from "../data/products";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { subscribeEmail } from "../utils/subscribe";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
};

export default function Home() {
  const newArrivals = getNewArrivals().slice(0, 8);
  const limitedPieces = getLimitedProducts().slice(0, 4);
  const featuredCollections = collections.filter(c => c.slug !== "archive").slice(0, 4);

  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState("idle");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || subStatus === "loading") return;
    try {
      setSubStatus("loading");
      await subscribeEmail({ email, source: "home_hero" });
      setSubStatus("success");
      setEmail("");
    } catch {
      setSubStatus("error");
    }
  };

  return (
    <>
      <SEO
        title="Style Eternal — Born in Newark"
        description="Premium streetwear rooted in Newark's North Ward. Pieces with weight. Style that outlives trends."
      />

      <div className="bg-se-black text-se-bone">

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: MOSAIC HERO
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ height: "100dvh", minHeight: 680 }}>

          {/* ── MOSAIC GRID ── */}
          <div
            className="grid gap-[2px] bg-se-black"
            style={{
              height: "calc(100dvh - 52px)",
              minHeight: 628,
              gridTemplateColumns: "42% 1fr 1fr",
              gridTemplateRows: "1fr 1fr",
            }}
          >

            {/* ── PANEL 1: Left — editorial cityscape (full height) ── */}
            <div className="row-span-2 relative overflow-hidden group" style={{ background: "linear-gradient(135deg, #1C1205 0%, #0A0806 50%, #0A0A0A 100%)" }}>
              {/* Editorial photo — full opacity, no suppression */}
              <img
                src="/assets/editorial/hero-cityscape.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              {/* Bottom scrim only — for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-se-black/80 via-se-black/10 to-transparent" />
              {/* Subtle left-edge shadow */}
              <div className="absolute inset-0 bg-gradient-to-r from-se-black/25 to-transparent" />
              {/* Grain */}
              <div className="grain-overlay absolute inset-0 opacity-35" />

              {/* Content — anchored bottom-left */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
                <Motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.2, 0, 0, 1] }}
                >
                  <h1
                    className="font-display text-se-bone leading-[0.88] tracking-[0.02em] mb-5"
                    style={{ fontSize: "clamp(3.2rem, 9vw, 8.5rem)" }}
                  >
                    STYLE<br />ETERNAL
                  </h1>

                  <p className="font-accent text-[9px] md:text-[10px] tracking-[0.28em] uppercase text-se-bone/50 mb-2 leading-relaxed">
                    NEWARK, NEW JERSEY<br className="md:hidden" /> <span className="hidden md:inline">— </span>NORTH WARD
                  </p>

                  <div className="divider-gold w-12 mb-5" />

                  <p className="font-accent text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-se-bone/60 leading-[1.8] mb-8">
                    STYLE IS MEMORY.<br />LEGACY IS FOREVER.
                  </p>

                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 border border-se-bone/30 px-5 py-3 text-[9px] font-accent tracking-[0.22em] uppercase text-se-bone/80 hover:border-se-bone/70 hover:text-se-bone transition duration-300"
                  >
                    EXPLORE THE COLLECTION
                    <ArrowRight size={11} />
                  </Link>
                </Motion.div>

                <p className="font-accent text-[8px] tracking-[0.2em] uppercase text-se-bone/25 mt-8">
                  EST. 2021
                </p>
              </div>
            </div>

            {/* ── PANEL 2: Top-mid — SE Worldwide (product) ── */}
            <div className="relative overflow-hidden bg-se-charcoal group">
              <img
                src="/assets/products/se-worldwide-longsleeve/01.jpg"
                alt="SE Worldwide Long Sleeve"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ filter: "brightness(0.55) contrast(1.25) grayscale(15%)" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              {/* Dark vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-se-black/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-se-black/30 via-transparent to-transparent" />
              {/* Product label */}
              <Link
                to="/products/se-worldwide-longsleeve"
                className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <span className="font-accent text-[9px] tracking-[0.2em] uppercase text-se-bone/60">SE Worldwide</span>
                <ChevronRight size={12} className="text-se-bone/40" />
              </Link>
            </div>

            {/* ── PANEL 3: Top-right — North Ward editorial ── */}
            <div className="relative overflow-hidden bg-[#110A04] group">
              {/* Editorial photo slot */}
              <img
                src="/assets/editorial/north-ward-street.jpg"
                alt="North Ward, Newark"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-70 transition-transform duration-700 group-hover:scale-[1.03]"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              {/* Amber city-light atmosphere */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2A1A06]/70 via-transparent to-se-black/80" />
              <div className="absolute inset-0 bg-gradient-to-t from-se-black/80 to-transparent" />
              <div className="grain-overlay absolute inset-0 opacity-40" />

              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                <p
                  className="font-display text-se-bone/70 leading-[0.9] tracking-[0.08em]"
                  style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.8rem)" }}
                >
                  NORTH<br />WARD
                </p>
                <p className="font-accent text-[8px] tracking-[0.2em] uppercase text-se-gold/60 mt-2">
                  Newark, NJ
                </p>
              </div>
            </div>

            {/* ── PANEL 4: Bottom-mid — Love Never Dies tee (product) ── */}
            <div className="relative overflow-hidden bg-se-charcoal group">
              <img
                src="/assets/products/love-never-dies-tee/01.jpg"
                alt="Love Never Dies Tee"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ filter: "brightness(0.55) contrast(1.3) grayscale(10%)" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-se-black/70 via-transparent to-transparent" />
              {/* Product label */}
              <Link
                to="/products/love-never-dies-tee"
                className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex items-end justify-between"
              >
                <div>
                  <span className="block font-accent text-[8px] tracking-[0.2em] uppercase text-se-gold/70">Drop 03</span>
                  <span className="block font-accent text-[9px] tracking-[0.15em] uppercase text-se-bone/50 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Love Never Dies Tee</span>
                </div>
                <ChevronRight size={12} className="text-se-bone/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            {/* ── PANEL 5: Bottom-right — Quote ── */}
            <div className="relative overflow-hidden bg-[#0F0C08] flex items-center justify-center p-6 md:p-8">
              {/* Editorial photo slot (optional hand/detail shot) */}
              <img
                src="/assets/editorial/hero-detail.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              {/* Dark overlay — enough to read quote, light enough to see image */}
              <div className="absolute inset-0 bg-se-black/55" />
              <div className="grain-overlay absolute inset-0 opacity-30" />

              <Motion.blockquote
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="relative z-10 text-center"
              >
                <p
                  className="font-display text-se-bone/80 leading-[1.25] tracking-[0.08em]"
                  style={{ fontSize: "clamp(0.85rem, 2vw, 1.35rem)" }}
                >
                  THE CITY<br />MAKES YOU.<br />
                  THE STRUGGLE<br />SHAPES YOU.<br />
                  THE STYLE<br />REMAINS.
                </p>
                <p
                  className="font-signature text-se-gold/70 mt-5"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
                >
                  Style Eternal
                </p>
              </Motion.blockquote>
            </div>

          </div>{/* end mosaic grid */}

          {/* ── BOTTOM NAV BAR ── */}
          <div className="h-[52px] border-t border-white/8 grid grid-cols-3 divide-x divide-white/8 bg-se-black">
            {[
              { label: "New Arrivals", to: "/shop?filter=new" },
              { label: "Drop 03",      to: "/collections/love-never-dies" },
              { label: "Editorial",    to: "/editorial" },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-center font-accent text-[9px] tracking-[0.28em] uppercase text-se-bone/40 hover:text-se-bone hover:bg-white/3 transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </div>

        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: NEW ARRIVALS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="section-pad">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <p className="text-overline mb-2">Just Dropped</p>
                <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                  NEW ARRIVALS
                </h2>
              </div>
              <Link
                to="/shop?filter=new"
                className="hidden md:flex items-center gap-2 text-[11px] font-accent uppercase tracking-[0.2em] text-se-bone/50 hover:text-se-bone transition"
              >
                View All <ArrowRight size={14} />
              </Link>
            </Motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product, i) => (
                <Motion.div
                  key={product.id}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.2, 0, 0, 1] }}
                >
                  <ProductCard product={product} />
                </Motion.div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link to="/shop?filter=new" className="btn-outline text-[10px]">
                View All New Arrivals
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: FEATURED DROP
        ═══════════════════════════════════════════════════════════════ */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-0 md:gap-12 items-center">
              {/* Image */}
              <Motion.div {...fadeUp} className="aspect-[4/5] bg-se-asphalt overflow-hidden mb-8 md:mb-0">
                <img
                  src="/assets/products/love-never-dies-tee/01.jpg"
                  alt="Drop 03: Love Never Dies"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.classList.add("flex", "items-center", "justify-center", "bg-gradient-to-br", "from-se-charcoal", "to-se-asphalt");
                    e.target.parentElement.innerHTML = '<span class="font-display text-[32px] tracking-[0.2em] text-se-steel/30">DROP 03</span>';
                  }}
                />
              </Motion.div>

              {/* Copy */}
              <Motion.div {...fadeUp} className="md:pl-4">
                <p className="text-overline mb-4">Drop 03 — SS26</p>
                <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[0.04em] mb-6">
                  LOVE<br />NEVER<br />DIES
                </h2>
                <p className="text-[15px] text-se-bone/50 leading-relaxed mb-4 max-w-md">
                  Five pieces. Skeleton graphics. All-over flames. A statement hoodie that says what
                  needs to be said. Love that outlasts everything.
                </p>
                <p className="text-[15px] text-se-bone/50 leading-relaxed mb-8 max-w-md">
                  Washed black tee. Heavyweight hoodies. All-over print long sleeve.
                  Once it's gone, it's gone.
                </p>
                <Link to="/collections/love-never-dies" className="btn-primary">
                  Explore Drop 03
                </Link>
              </Motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4: CATEGORY GATEWAY
        ═══════════════════════════════════════════════════════════════ */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-10 md:mb-14">
              <p className="text-overline mb-2">Shop By Category</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                THE LINEUP
              </h2>
            </Motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Tees", href: "/shop/tees", desc: "Heavyweight. Oversized." },
                { label: "Hoodies", href: "/shop/hoodies", desc: "French terry. Year-round." },
                { label: "Outerwear", href: "/shop/outerwear", desc: "Statement pieces." },
                { label: "Bottoms", href: "/shop/bottoms", desc: "Sweats. Cargos." },
              ].map((cat, i) => (
                <Motion.div
                  key={cat.label}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                >
                  <Link
                    to={cat.href}
                    className="group block aspect-[4/5] bg-se-charcoal border border-white/5 hover:border-white/15 relative overflow-hidden transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-se-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <h3 className="font-display text-[20px] md:text-[24px] tracking-[0.08em] mb-1">
                        {cat.label.toUpperCase()}
                      </h3>
                      <p className="text-[11px] text-se-bone/40 font-accent">{cat.desc}</p>
                      <div className="mt-3 flex items-center gap-1 text-[10px] text-se-bone/30 group-hover:text-se-bone/60 transition font-accent uppercase tracking-[0.2em]">
                        Shop <ChevronRight size={12} />
                      </div>
                    </div>
                  </Link>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5: BRAND MANIFESTO
        ═══════════════════════════════════════════════════════════════ */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
              <div className="divider-gold mb-10 mx-auto w-24" />
              <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-[1.05] tracking-[0.04em] mb-8">
                STYLE IS NOT WHAT YOU WEAR.
                <br />
                IT'S WHAT YOU SURVIVE IN.
              </h2>
              <p className="text-[15px] md:text-[17px] text-se-bone/40 leading-relaxed mb-4 max-w-xl mx-auto">
                Born in Newark's North Ward, Style Eternal is a record of where we come from. Every stitch holds a story.
                Every piece is made to endure — like the people who wear them.
              </p>
              <p className="text-[15px] md:text-[17px] text-se-bone/40 leading-relaxed mb-10 max-w-xl mx-auto">
                We don't chase trends. We outlast them.
              </p>
              <Link to="/about" className="btn-outline">
                Read Our Story
              </Link>
            </Motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6: LIMITED / CAPSULE HIGHLIGHTS
        ═══════════════════════════════════════════════════════════════ */}
        {limitedPieces.length > 0 && (
          <section className="section-pad border-t border-white/5">
            <div className="content-wide">
              <Motion.div {...fadeUp} className="flex items-end justify-between mb-10 md:mb-14">
                <div>
                  <p className="text-overline mb-2">Limited Release</p>
                  <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                    WHILE THEY LAST
                  </h2>
                </div>
                <Link
                  to="/shop?filter=limited"
                  className="hidden md:flex items-center gap-2 text-[11px] font-accent uppercase tracking-[0.2em] text-se-bone/50 hover:text-se-bone transition"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </Motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {limitedPieces.map((product, i) => (
                  <Motion.div
                    key={product.id}
                    {...stagger}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.2, 0, 0, 1] }}
                  >
                    <ProductCard product={product} />
                  </Motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 7: COLLECTIONS STRIP
        ═══════════════════════════════════════════════════════════════ */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-10 md:mb-14">
              <p className="text-overline mb-2">Explore</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                COLLECTIONS
              </h2>
            </Motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {featuredCollections.map((col, i) => (
                <Motion.div
                  key={col.slug}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                >
                  <Link
                    to={`/collections/${col.slug}`}
                    className="group block relative aspect-[16/9] bg-se-charcoal border border-white/5 hover:border-white/15 overflow-hidden transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-se-black/70 to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 z-20">
                      <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-2">
                        {col.season}
                      </p>
                      <h3 className="font-display text-[24px] md:text-[32px] tracking-[0.06em] mb-1">
                        {col.name.toUpperCase()}
                      </h3>
                      <p className="text-[12px] text-se-bone/40 font-accent">{col.tagline}</p>
                    </div>
                  </Link>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 8: NEWARK / NORTH WARD STORY
        ═══════════════════════════════════════════════════════════════ */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <Motion.div {...fadeUp}>
                <p className="text-overline mb-4">Newark, NJ — North Ward</p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-[1] tracking-[0.04em] mb-6">
                  WHERE THE<br />CONCRETE<br />SPEAKS
                </h2>
                <p className="text-[15px] text-se-bone/50 leading-relaxed mb-4 max-w-md">
                  The North Ward is brick and iron. Corner stores with steel gates.
                  Wet pavement under sodium lights. Basements where the music started.
                  Stoops where the conversations never ended.
                </p>
                <p className="text-[15px] text-se-bone/50 leading-relaxed mb-8 max-w-md">
                  Style Eternal is a product of that texture. We build clothes the way
                  the neighborhood builds character — heavy, deliberate, and built to
                  endure whatever comes next.
                </p>
                <Link to="/community" className="btn-outline">
                  Explore Community
                </Link>
              </Motion.div>

              <Motion.div {...fadeUp} className="aspect-[4/5] bg-se-asphalt">
                <div className="h-full w-full bg-gradient-to-t from-se-charcoal to-se-asphalt flex items-center justify-center">
                  <span className="font-display text-[28px] tracking-[0.15em] text-se-steel/20">NORTH WARD</span>
                </div>
              </Motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 9: NEWSLETTER / SMS CAPTURE
        ═══════════════════════════════════════════════════════════════ */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
              <p className="text-overline mb-4">Stay Connected</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] mb-4">
                JOIN THE ARCHIVE
              </h2>
              <p className="text-[14px] text-se-bone/40 mb-8 max-w-md mx-auto">
                First access to every drop. Editorial updates. Community invites.
                We don't send noise.
              </p>

              <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSubStatus("idle"); }}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3.5 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition"
                  required
                />
                <button type="submit" className="btn-primary px-6 py-3.5 text-[10px]">
                  {subStatus === "success" ? "Joined" : "Subscribe"}
                </button>
              </form>

              {subStatus === "success" && (
                <p className="text-[12px] text-se-gold mt-4 font-accent">Welcome to the archive.</p>
              )}
              {subStatus === "error" && (
                <p className="text-[12px] text-se-red-bright mt-4 font-accent">Something went wrong. Try again.</p>
              )}
            </Motion.div>
          </div>
        </section>

      </div>
    </>
  );
}

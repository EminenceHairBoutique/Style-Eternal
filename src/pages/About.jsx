// src/pages/About.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

export default function About() {
  return (
    <>
      <SEO
        title="About — Style Eternal"
        description="Style Eternal builds premium heavyweight streetwear rooted in permanence, emotional design, and quality construction."
      />

      <div className="bg-se-black text-se-bone">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-3xl">
              <p className="text-overline mb-4">Our Story</p>
              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-[0.04em] mb-8">
                THE STORY
              </h1>
              <p className="text-[17px] md:text-[19px] text-se-bone/60 leading-relaxed max-w-xl">
                Style Eternal didn&apos;t start with a business plan. It started with
                a feeling — that what you wear carries weight, and the right piece
                can make you feel permanent in a world that forgets fast.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Origin Story */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Motion.div {...fadeUp}>
                <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-6">
                  New Jersey
                </p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-[1] tracking-[0.04em] mb-8">
                  WHERE WE<br />STARTED
                </h2>
                <div className="space-y-4 text-[15px] text-se-bone/50 leading-relaxed">
                  <p>
                    We came up in New Jersey — concrete, cold mornings, corner-store
                    runs. Style wasn&apos;t optional where we&apos;re from. It was how you
                    told the world you still gave a damn. That energy is the
                    foundation of everything we build.
                  </p>
                </div>
              </Motion.div>

              <Motion.div {...fadeUp} className="aspect-[4/5] bg-se-asphalt">
                <div className="h-full w-full bg-gradient-to-t from-se-charcoal to-se-asphalt flex items-center justify-center">
                  <span className="font-display text-[28px] tracking-[0.15em] text-se-steel/15">
                    ORIGINS
                  </span>
                </div>
              </Motion.div>
            </div>
          </div>
        </section>

        {/* The Craft */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
              <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-6">
                What We Make
              </p>
              <div className="divider-gold mb-10 mx-auto w-24" />
              <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-[1.1] tracking-[0.04em] mb-8">
                THE CRAFT
              </h2>
              <div className="space-y-4 text-[15px] md:text-[17px] text-se-bone/50 leading-relaxed max-w-xl mx-auto">
                <p>
                  280gsm tees. 400gsm hoodies. Every piece starts with fabric
                  that has real weight — because cheap material falls apart and
                  we don&apos;t make disposable clothing.
                </p>
                <p>
                  We garment-wash for character, screen-print for durability,
                  and cut oversized because that&apos;s how streetwear actually
                  lives on a body. No shortcuts on construction. No compromises
                  on feel.
                </p>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Founder Vision */}
        <section className="border-b border-white/5 bg-gradient-to-b from-se-black to-se-charcoal/30">
          <div className="content-wide py-20 md:py-28">
            <Motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
              <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-8">
                Founder&apos;s Note
              </p>
              <blockquote className="font-display text-[clamp(1.2rem,3vw,1.8rem)] leading-[1.3] tracking-[0.04em] text-se-bone/70 mb-8">
                &ldquo;I didn&apos;t start this brand to follow the industry. I started it
                because the streets I grew up on deserve a label that takes them
                seriously. Every piece we make carries that weight.&rdquo;
              </blockquote>
              <div className="divider-gold w-12 mx-auto mb-4" />
              <p className="text-[11px] font-accent tracking-[0.2em] uppercase text-se-steel">
                — Chino, Founder
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12">
              <p className="text-overline mb-2">What We Build On</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                THE STANDARD
              </h2>
            </Motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Heavyweight Materials",
                  text: "280–400gsm fabrics. French terry. Combed cotton. Canvas. Nothing lightweight. Nothing disposable.",
                },
                {
                  title: "Built-In Character",
                  text: "Garment-washed finishes. Distressed treatments. Every piece feels broken in, not brand new.",
                },
                {
                  title: "Real Graphics",
                  text: "Screen-printed and embroidered. Every design references a place, a memory, or a principle.",
                },
                {
                  title: "Intentional Fit",
                  text: "Oversized and relaxed cuts that honor how streetwear actually moves on a body.",
                },
              ].map((val, i) => (
                <Motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                  className="border border-white/5 bg-se-charcoal p-7"
                >
                  <h3 className="font-display text-[14px] tracking-[0.12em] mb-4">
                    {val.title.toUpperCase()}
                  </h3>
                  <p className="text-[13px] text-se-bone/40 leading-relaxed">
                    {val.text}
                  </p>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Vision */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Motion.div {...fadeUp} className="order-2 md:order-1 aspect-[4/5] bg-se-asphalt">
                <div className="h-full w-full bg-gradient-to-br from-se-charcoal to-se-asphalt flex items-center justify-center">
                  <span className="font-display text-[28px] tracking-[0.15em] text-se-steel/15">
                    ETERNAL
                  </span>
                </div>
              </Motion.div>

              <Motion.div {...fadeUp} className="order-1 md:order-2">
                <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-6">
                  Beyond Geography
                </p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-[1] tracking-[0.04em] mb-8">
                  THE VISION
                </h2>
                <div className="space-y-4 text-[15px] text-se-bone/50 leading-relaxed">
                  <p>
                    Style Eternal is built on permanence over trend. We design
                    pieces that carry emotional weight — graphics rooted in love,
                    death, and rebirth. The symbols mean something. The work
                    outlasts the season.
                  </p>
                  <p>
                    This isn&apos;t fast fashion with a streetwear skin. Every
                    collection is a statement about what deserves to endure. We
                    make clothes for people who feel something when they get
                    dressed.
                  </p>
                </div>
              </Motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad">
          <div className="content-wide text-center">
            <Motion.div {...fadeUp}>
              <div className="divider-gold mb-10 mx-auto w-16" />
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.08em] mb-6">
                SEE THE WORK
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/shop" className="btn-primary">
                  Shop All
                </Link>
                <Link to="/collections" className="btn-outline">
                  View Collections
                </Link>
              </div>
            </Motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

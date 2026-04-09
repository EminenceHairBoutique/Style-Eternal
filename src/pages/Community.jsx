// src/pages/Community.jsx — Style Eternal
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import SEO from "../components/SEO";
import { subscribeEmail } from "../utils/subscribe";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

export default function Community() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    try {
      setStatus("loading");
      await subscribeEmail({ email, source: "community_page" });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <SEO
        title="Community — Style Eternal"
        description="Newark roots. North Ward culture. The community behind Style Eternal."
      />

      <div className="bg-se-black text-se-bone">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">Newark, NJ — North Ward</p>
              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-[0.04em] mb-6">
                COMMUNITY
              </h1>
              <p className="text-[15px] md:text-[17px] text-se-bone/50 max-w-lg leading-relaxed">
                Style Eternal is a product of place. Newark's North Ward.
                The culture, the concrete, the people who built something from nothing.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Newark Story */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Motion.div {...fadeUp}>
                <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-6">
                  Origin Story
                </p>
                <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-[1] tracking-[0.04em] mb-8">
                  THE NORTH WARD<br />MADE US
                </h2>
                <div className="space-y-4 text-[15px] text-se-bone/50 leading-relaxed max-w-md">
                  <p>
                    The North Ward is brick rowhouses and steel gates. Corner stores
                    that stayed open late. Basements where the music started. Stoops
                    where conversations turned into plans.
                  </p>
                  <p>
                    It's a neighborhood that teaches you to carry yourself with intention.
                    To dress like you mean it. To build things that last, because nothing
                    was ever handed to you.
                  </p>
                  <p>
                    Style Eternal grew out of that texture. Not fashion for fashion's sake,
                    but clothes as armor. As identity. As a record of where you've been and
                    a statement about where you're going.
                  </p>
                </div>
              </Motion.div>

              <Motion.div {...fadeUp} className="aspect-[4/5] bg-se-asphalt">
                <div className="h-full w-full bg-gradient-to-t from-se-charcoal to-se-asphalt flex items-center justify-center">
                  <span className="font-display text-[28px] tracking-[0.15em] text-se-steel/15">
                    NORTH WARD
                  </span>
                </div>
              </Motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12">
              <p className="text-overline mb-2">What We Stand On</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                PRINCIPLES
              </h2>
            </Motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Permanence Over Trend",
                  text: "We build pieces that outlast seasons. No chasing hype. No fast fashion math. If it doesn't hold up after fifty wears, we don't ship it.",
                },
                {
                  title: "Place Over Algorithm",
                  text: "Every collection is rooted in a real place. A real neighborhood. Real texture. We don't design in a vacuum — we design from the ground up.",
                },
                {
                  title: "Presence Over Noise",
                  text: "Style Eternal is for people who don't need to explain their taste. The clothes speak. The quality speaks. That's enough.",
                },
              ].map((val, i) => (
                <Motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                  className="border border-white/5 bg-se-charcoal p-8"
                >
                  <h3 className="font-display text-[16px] tracking-[0.1em] mb-4">
                    {val.title.toUpperCase()}
                  </h3>
                  <p className="text-[14px] text-se-bone/40 leading-relaxed">
                    {val.text}
                  </p>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Culture section */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Motion.div {...fadeUp} className="order-2 md:order-1 aspect-[4/5] bg-se-asphalt">
                <div className="h-full w-full bg-gradient-to-br from-se-charcoal to-se-asphalt flex items-center justify-center">
                  <span className="font-display text-[28px] tracking-[0.15em] text-se-steel/15">
                    CULTURE
                  </span>
                </div>
              </Motion.div>

              <Motion.div {...fadeUp} className="order-1 md:order-2">
                <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-6">
                  Beyond Clothes
                </p>
                <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-[1] tracking-[0.04em] mb-8">
                  STYLE AS<br />IDENTITY
                </h2>
                <div className="space-y-4 text-[15px] text-se-bone/50 leading-relaxed max-w-md">
                  <p>
                    In the neighborhoods we come from, style was never optional.
                    It was how you told the world you were here. How you showed you
                    weren't defeated by the circumstances.
                  </p>
                  <p>
                    A fresh fit on a Monday morning wasn't vanity — it was a declaration.
                    Style Eternal carries that energy forward. Every piece is a statement
                    that you take yourself seriously.
                  </p>
                </div>
              </Motion.div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="section-pad">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
              <p className="text-overline mb-4">Join the Community</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] mb-4">
                JOIN THE ARCHIVE
              </h2>
              <p className="text-[14px] text-se-bone/40 mb-8 max-w-md mx-auto">
                Drop alerts. Editorial features. Community events. No noise.
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
                  {status === "success" ? "Joined" : "Subscribe"}
                </button>
              </form>

              {status === "success" && (
                <p className="text-[12px] text-se-gold mt-4 font-accent">Welcome to the archive.</p>
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

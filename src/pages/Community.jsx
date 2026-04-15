// src/pages/Community.jsx — Style Eternal
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Instagram, Twitter, Mail } from "lucide-react";
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
  const [joinEmail, setJoinEmail] = useState("");
  const [joinStatus, setJoinStatus] = useState("idle");

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

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinEmail.trim() || joinStatus === "loading") return;
    try {
      setJoinStatus("loading");
      await subscribeEmail({ email: joinEmail, source: "community_join" });
      setJoinStatus("success");
      setJoinEmail("");
    } catch {
      setJoinStatus("error");
    }
  };

  return (
    <>
      <SEO
        title="Community — Style Eternal"
        description="New Jersey roots. The community behind Style Eternal — EST. 2021."
      />

      <div className="bg-se-black text-se-bone">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">New Jersey — EST. 2021</p>
              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-[0.04em] mb-6">
                COMMUNITY
              </h1>
              <p className="text-[15px] md:text-[17px] text-se-bone/50 max-w-lg leading-relaxed">
                Style Eternal is a product of place. New Jersey grit, culture, and
                the people who built something from nothing. EST. 2021.
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
                  Origin Story
                </p>
                <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-[1] tracking-[0.04em] mb-8">
                  WHERE WE<br />STARTED
                </h2>
                <div className="text-[15px] text-se-bone/50 leading-relaxed max-w-md">
                  <p>
                    Style Eternal grew out of New Jersey — the neighborhoods that teach
                    you to carry yourself with intention, to dress like you mean it, and
                    to build things that last. Not fashion for fashion&apos;s sake, but
                    clothes as identity, as a record of where you&apos;ve been and a
                    statement about where you&apos;re going.
                  </p>
                </div>
              </Motion.div>

              <Motion.div {...fadeUp} className="aspect-[4/5] bg-se-asphalt">
                <div className="h-full w-full bg-gradient-to-t from-se-charcoal to-se-asphalt flex items-center justify-center">
                  <span className="font-display text-[28px] tracking-[0.15em] text-se-steel/15">
                    EST. 2021
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

        {/* Featured Looks */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12">
              <p className="text-overline mb-2">Community Picks</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                FEATURED LOOKS
              </h2>
            </Motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Drop 001", tag: "Archive" },
                { label: "Drop 002", tag: "Limited" },
                { label: "Drop 003", tag: "Coming Soon" },
              ].map((card, i) => (
                <Motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                  className="border border-white/5 bg-se-charcoal overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-gradient-to-b from-se-asphalt to-se-charcoal flex items-center justify-center">
                    <span className="font-display text-[20px] tracking-[0.15em] text-se-steel/15">
                      {card.label.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <span className="font-display text-[13px] tracking-[0.1em]">
                      {card.label.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-accent tracking-[0.15em] uppercase text-se-gold">
                      {card.tag}
                    </span>
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Join the Community */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
              <p className="text-overline mb-4">Stay Connected</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] mb-4">
                JOIN THE COMMUNITY
              </h2>
              <p className="text-[14px] text-se-bone/40 mb-8 max-w-md mx-auto">
                Drop alerts. Editorial features. Community events. Be the first to know.
              </p>

              <form onSubmit={handleJoin} className="flex max-w-md mx-auto gap-0 mb-8">
                <input
                  type="email"
                  value={joinEmail}
                  onChange={(e) => { setJoinEmail(e.target.value); setJoinStatus("idle"); }}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3.5 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition"
                  required
                />
                <button type="submit" className="btn-primary px-6 py-3.5 text-[10px]">
                  {joinStatus === "success" ? "Joined" : "Subscribe"}
                </button>
              </form>

              {joinStatus === "success" && (
                <p className="text-[12px] text-se-gold mb-6 font-accent">Welcome to the community.</p>
              )}
              {joinStatus === "error" && (
                <p className="text-[12px] text-se-red-bright mb-6 font-accent">Something went wrong. Try again.</p>
              )}

              <div className="flex items-center justify-center gap-6">
                <a href="https://instagram.com/styleeternal" target="_blank" rel="noopener noreferrer" className="text-se-steel hover:text-se-bone transition" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://twitter.com/styleeternal" target="_blank" rel="noopener noreferrer" className="text-se-steel hover:text-se-bone transition" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="mailto:info@styleeternal.com" className="text-se-steel hover:text-se-bone transition" aria-label="Email">
                  <Mail size={20} />
                </a>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="section-pad">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
              <p className="text-overline mb-4">Never Miss a Drop</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] mb-4">
                JOIN THE ARCHIVE
              </h2>
              <p className="text-[14px] text-se-bone/40 mb-8 max-w-md mx-auto">
                Subscribe for early access, exclusive content, and drop notifications. No spam.
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

// src/pages/Drops.jsx — Style Eternal
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DROPS_ROADMAP } from "../data/products";
import SEO from "../components/SEO";
import { subscribeEmail } from "../utils/subscribe";
import { useAllDrops } from "../hooks/useDrops";
import Countdown from "../components/Countdown";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

// Hardcoded showcase — fallback shown only when no CMS drops exist.
const drops = [
  {
    id: "drop-01",
    name: "Drop 01: Love Never Dies",
    slug: "love-never-dies",
    tagline: "Some things outlast everything.",
    season: "SS26",
    pieces: 5,
    description:
      "Five pieces. A skeleton tee, three heavyweight hoodies, and an all-over long sleeve. The realest thing we've made. Love Never Dies.",
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

/* ---- helpers ---- */
function DropPlaceholder({ name }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-se-charcoal to-se-asphalt">
      <span className="font-display text-[24px] tracking-[0.15em] text-se-steel/20 px-3 text-center">
        {String(name || "").split(":")[0]}
      </span>
    </div>
  );
}

function NotifyDrop({ slug }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || state === "loading") return;
    try {
      setState("loading");
      await subscribeEmail({ email, source: `drop:${slug}` });
      setState("success");
      setEmail("");
    } catch {
      setState("error");
    }
  };
  if (state === "success") {
    return <p className="text-[13px] text-se-gold font-accent tracking-[0.05em]">You&apos;re on the list.</p>;
  }
  return (
    <form onSubmit={onSubmit} className="flex max-w-xs gap-0">
      <label htmlFor={`notify-${slug}`} className="sr-only">Email address</label>
      <input
        id={`notify-${slug}`}
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
        placeholder="your@email.com"
        className="flex-1 px-3.5 py-2.5 bg-se-charcoal border border-white/10 text-se-bone text-[12px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition"
      />
      <button type="submit" disabled={state === "loading"} className="btn-primary px-4 py-2.5 text-[10px]">
        {state === "loading" ? "…" : "Notify Me"}
      </button>
      {state === "error" && <span role="alert" className="sr-only">Something went wrong.</span>}
    </form>
  );
}

export default function Drops() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  // Drop calendar from the CMS. Categorize into live / upcoming / archived.
  const { drops: allDrops } = useAllDrops();
  const hasDbDrops = allDrops && allDrops.length > 0;
  const liveDrops = useMemo(() => allDrops.filter((d) => d.status === "live"), [allDrops]);
  const upcomingDrops = useMemo(
    () =>
      allDrops
        .filter((d) => d.status === "scheduled")
        .sort((a, b) => new Date(a.release_at || 0) - new Date(b.release_at || 0)),
    [allDrops]
  );
  const archivedDrops = useMemo(() => allDrops.filter((d) => d.status === "archived"), [allDrops]);

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

        {/* ===== Drop Calendar (CMS) or hardcoded showcase ===== */}
        {hasDbDrops ? (
          <>
            {/* LIVE NOW */}
            {liveDrops.length > 0 && (
              <section className="section-pad">
                <div className="content-wide">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="w-2 h-2 rounded-full bg-se-gold animate-pulse" />
                    <h2 className="font-display text-xl tracking-[0.2em]">LIVE NOW</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveDrops.map((d) => (
                      <Link key={d.id} to={`/drops/${d.slug}`} className="group block">
                        <div className="relative aspect-[4/5] bg-se-charcoal overflow-hidden rounded-sm">
                          {d.hero_image ? (
                            <img
                              src={d.hero_image}
                              alt={d.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                          ) : (
                            <DropPlaceholder name={d.name} />
                          )}
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-se-black/60 backdrop-blur-sm border border-se-gold/40 text-[9px] tracking-[0.2em] uppercase text-se-gold font-accent">
                            <span className="w-1 h-1 rounded-full bg-se-gold animate-pulse" /> Live Now
                          </span>
                        </div>
                        <h3 className="font-display text-lg tracking-[0.06em] mt-4 group-hover:text-se-gold transition-colors">
                          {d.name.toUpperCase()}
                        </h3>
                        <p className="text-[12px] text-se-steel font-accent mt-1">
                          {d.products?.length || 0} {(d.products?.length || 0) === 1 ? "piece" : "pieces"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* UPCOMING — countdown + notify */}
            {upcomingDrops.length > 0 && (
              <section className="section-pad border-t border-white/5">
                <div className="content-wide">
                  <h2 className="font-display text-xl tracking-[0.2em] mb-8">UPCOMING</h2>
                  <div className="space-y-6">
                    {upcomingDrops.map((d) => {
                      const future = d.release_at && new Date(d.release_at).getTime() > Date.now();
                      return (
                        <div
                          key={d.id}
                          className="grid md:grid-cols-[260px_1fr] gap-6 md:gap-10 items-center border border-white/5 bg-se-charcoal/30 p-5 rounded-sm"
                        >
                          <Link to={`/drops/${d.slug}`} className="block aspect-[4/3] md:aspect-[4/5] bg-se-charcoal overflow-hidden rounded-sm">
                            {d.hero_image ? (
                              <img src={d.hero_image} alt={d.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <DropPlaceholder name={d.name} />
                            )}
                          </Link>
                          <div>
                            <Link to={`/drops/${d.slug}`}>
                              <h3 className="font-display text-2xl tracking-[0.06em] mb-2 hover:text-se-gold transition-colors">
                                {d.name.toUpperCase()}
                              </h3>
                            </Link>
                            {d.description && (
                              <p className="text-[14px] text-se-bone/50 mb-5 max-w-md leading-relaxed">{d.description}</p>
                            )}
                            {future ? (
                              <>
                                <p className="text-overline mb-2">Drops In</p>
                                <Countdown target={d.release_at} className="mb-5" />
                                <NotifyDrop slug={d.slug} />
                              </>
                            ) : (
                              <p className="text-[12px] text-se-gold font-accent tracking-[0.12em] uppercase">
                                Dropping soon
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* THE ARCHIVE */}
            {archivedDrops.length > 0 && (
              <section className="section-pad border-t border-white/5">
                <div className="content-wide">
                  <h2 className="font-display text-xl tracking-[0.2em] mb-8">THE ARCHIVE</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {archivedDrops.map((d) => (
                      <Link
                        key={d.id}
                        to={`/drops/${d.slug}`}
                        className="group block opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <div className="aspect-[4/5] bg-se-charcoal overflow-hidden rounded-sm">
                          {d.hero_image ? (
                            <img
                              src={d.hero_image}
                              alt={d.name}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <DropPlaceholder name={d.name} />
                          )}
                        </div>
                        <h3 className="font-display text-sm tracking-[0.06em] mt-3">{d.name.toUpperCase()}</h3>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          /* Fallback hardcoded showcase */
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
                            <DropPlaceholder name={drop.name} />
                          )}
                        </div>
                      </div>
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
                        <p className="text-[14px] text-se-gold/80 font-accent mb-6">{drop.tagline}</p>
                        <p className="text-[15px] text-se-bone/50 leading-relaxed mb-4 max-w-md">{drop.description}</p>
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
        )}

        {/* The Roadmap */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12 md:mb-16">
              <p className="text-overline mb-4">The Vision</p>
              <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] tracking-[0.06em]">THE ROADMAP</h2>
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
                  <div className="flex flex-col items-center pt-1">
                    {entry.status === "available" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-se-gold" />
                    ) : entry.status === "coming-soon" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-se-steel animate-pulse" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-se-steel/30" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-se-gold font-accent">
                      Drop {entry.number}
                    </p>
                    <p className="font-display text-[18px] tracking-[0.04em] leading-tight mt-1">
                      {entry.title.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-se-steel font-accent mt-1">{entry.season}</p>
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
                    {entry.status === "available" ? (
                      <span className="w-3 h-3 rounded-full bg-se-gold" />
                    ) : entry.status === "coming-soon" ? (
                      <span className="w-3 h-3 rounded-full bg-se-steel animate-pulse" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-se-steel/30" />
                    )}
                    {i < DROPS_ROADMAP.length - 1 && (
                      <div className="w-full h-px bg-white/5 -mt-1.5 mb-1.5 translate-x-[60px]" />
                    )}
                    <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mt-3">
                      Drop {entry.number}
                    </p>
                    <p className="font-display text-[13px] tracking-[0.04em] leading-tight mt-1 px-1">
                      {entry.title.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-se-steel font-accent mt-1">{entry.season}</p>
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

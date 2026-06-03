// src/pages/DropDetail.jsx — Style Eternal (focused drop page)
import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { products as catalog } from "../data/products";
import { useDrop } from "../hooks/useDrops";
import { subscribeEmail } from "../utils/subscribe";
import ProductCard from "../components/ProductCard";
import Countdown from "../components/Countdown";
import SEO from "../components/SEO";

function NotifyForm({ slug }) {
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
    <form onSubmit={onSubmit} className="flex max-w-sm gap-0">
      <label htmlFor="drop-notify" className="sr-only">Email address</label>
      <input
        id="drop-notify"
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
        placeholder="your@email.com"
        className="flex-1 px-4 py-3 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition"
      />
      <button type="submit" disabled={state === "loading"} className="btn-primary px-5 py-3 text-[10px]">
        {state === "loading" ? "…" : "Notify Me"}
      </button>
      {state === "error" && (
        <span className="sr-only" role="alert">Something went wrong. Please try again.</span>
      )}
    </form>
  );
}

export default function DropDetail() {
  const { slug } = useParams();
  const { drop, loading, error } = useDrop(slug);

  // Map the drop's Supabase products onto the rich hardcoded catalog by slug
  // so cards render with full display data; fall back to the DB row.
  const dropProducts = useMemo(() => {
    if (!drop?.products) return [];
    return drop.products.map((p) => catalog.find((c) => c.slug === p.slug) || p);
  }, [drop]);

  /* ---- loading ---- */
  if (loading) {
    return (
      <div className="bg-se-black min-h-screen pt-32">
        <div className="content-wide animate-pulse">
          <div className="h-[40vh] bg-se-charcoal rounded-sm mb-8" />
          <div className="h-8 w-1/2 bg-se-charcoal rounded-sm mb-4" />
          <div className="h-4 w-2/3 bg-se-charcoal rounded-sm" />
        </div>
      </div>
    );
  }

  /* ---- not found ---- */
  if (error || !drop) {
    return (
      <div className="min-h-screen bg-se-black flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-display text-3xl text-se-bone tracking-wider">DROP NOT FOUND</h1>
        <p className="text-se-steel font-body text-sm">This drop isn&apos;t available right now.</p>
        <Link to="/drops" className="btn-primary px-8 py-3 text-[11px] tracking-[0.2em]">ALL DROPS</Link>
      </div>
    );
  }

  const isLive = drop.status === "live";
  const isScheduled = drop.status === "scheduled";
  const isArchived = drop.status === "archived";
  const releaseFuture = drop.release_at && new Date(drop.release_at).getTime() > Date.now();

  return (
    <>
      <SEO
        title={`${drop.name} — Style Eternal`}
        description={drop.description || `${drop.name} — a Style Eternal drop.`}
        image={drop.hero_image}
      />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Breadcrumb */}
        <Breadcrumbs
          className="content-wide pt-6 pb-2"
          items={[
            { label: "Home", to: "/" },
            { label: "Drops", to: "/drops" },
            { label: drop.name },
          ]}
        />

        {/* Hero */}
        <section className="content-wide pt-4 pb-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
              className="aspect-[4/5] bg-se-charcoal overflow-hidden rounded-sm"
            >
              {drop.hero_image ? (
                <img src={drop.hero_image} alt={drop.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-se-charcoal to-se-asphalt">
                  <span className="font-display text-[28px] tracking-[0.15em] text-se-steel/20">{drop.name}</span>
                </div>
              )}
            </Motion.div>

            <div>
              {isLive && (
                <span className="inline-flex items-center gap-2 mb-4 text-[10px] font-accent tracking-[0.25em] uppercase text-se-gold">
                  <span className="w-1.5 h-1.5 rounded-full bg-se-gold animate-pulse" /> Live Now
                </span>
              )}
              {isArchived && (
                <span className="inline-block mb-4 text-[10px] font-accent tracking-[0.25em] uppercase text-se-steel">
                  Archive
                </span>
              )}
              <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[0.04em] mb-5">
                {drop.name.toUpperCase()}
              </h1>
              {drop.description && (
                <p className="text-[15px] text-se-bone/55 leading-relaxed max-w-md mb-8">{drop.description}</p>
              )}

              {isScheduled && releaseFuture && (
                <div className="mb-8">
                  <p className="text-overline mb-3">Drops In</p>
                  <Countdown target={drop.release_at} className="mb-6" />
                  <p className="text-[13px] text-se-bone/50 mb-3">Be first in line when it goes live.</p>
                  <NotifyForm slug={drop.slug} />
                </div>
              )}

              {drop.release_at && !isScheduled && (
                <p className="text-[12px] text-se-steel font-accent tracking-[0.08em]">
                  {isLive ? "Released " : "Released "}
                  {new Date(drop.release_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Products grid */}
        {dropProducts.length > 0 ? (
          <section className="section-pad border-t border-white/5">
            <div className="content-wide">
              <h2 className="font-display text-xl tracking-[0.2em] text-se-bone mb-8">THE PIECES</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {dropProducts.map((p) => (
                  <ProductCard key={p.id || p.slug} product={p} />
                ))}
              </div>
            </div>
          </section>
        ) : isScheduled ? (
          <section className="section-pad border-t border-white/5">
            <div className="content-wide text-center">
              <p className="font-display text-[18px] tracking-[0.1em] text-se-steel mb-2">PIECES REVEALED AT LAUNCH</p>
              <p className="text-[14px] text-se-bone/40">The lineup drops when the timer hits zero.</p>
            </div>
          </section>
        ) : null}

        {/* Back link */}
        <div className="content-wide pb-20">
          <Link to="/drops" className="inline-flex items-center gap-2 text-[12px] font-accent tracking-[0.15em] uppercase text-se-steel hover:text-se-bone transition-colors">
            All Drops <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}

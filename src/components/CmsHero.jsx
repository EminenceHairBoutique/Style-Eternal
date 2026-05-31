/**
 * CmsHero — storefront hero driven by homepage CMS hero slides.
 * Renders the first slide as a full-bleed hero; if multiple slides exist they
 * auto-rotate. Used by Home.jsx in place of the hardcoded mosaic hero when an
 * admin has configured homepage hero content.
 *
 * Each slide: { data: { image, headline, subtext, ctaLabel, ctaHref } }
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";

export default function CmsHero({ slides = [] }) {
  const [idx, setIdx] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const slide = slides[idx]?.data || {};

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 680 }}>
      <div className="absolute inset-0">
        {slide.image ? (
          <img src={slide.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-center" />
        ) : (
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1C1205 0%, #0A0806 50%, #0A0A0A 100%)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.55) 60%, rgba(10,10,10,0.85) 100%)" }} />
      </div>

      <div className="relative content-wide flex flex-col justify-center" style={{ minHeight: 680 }}>
        <Motion.div
          key={idx}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          className="max-w-2xl py-24"
        >
          {slide.headline && (
            <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] tracking-[0.04em] text-se-bone mb-5">
              {slide.headline}
            </h1>
          )}
          {slide.subtext && (
            <p className="text-[15px] md:text-[18px] text-se-bone/60 max-w-lg leading-relaxed mb-8">
              {slide.subtext}
            </p>
          )}
          {slide.ctaLabel && slide.ctaHref && (
            <Link to={slide.ctaHref} className="btn-primary">
              {slide.ctaLabel}
            </Link>
          )}
        </Motion.div>

        {count > 1 && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIdx(i)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === idx ? 24 : 8, background: i === idx ? "#C4A35A" : "rgba(232,228,222,0.4)" }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

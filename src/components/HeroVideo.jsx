// src/components/HeroVideo.jsx — Style Eternal
//
// The brand film is a large asset, so the section paints instantly with a
// lightweight poster (the LCP element) and mounts the <video> only after the
// window has loaded and the browser is idle — the film never competes with
// first paint. Users with reduced-motion or Save-Data preferences keep the
// still poster.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import SmartImage from "./SmartImage";

const VIDEO_SRC = "/assets/video/brand-promo-ss26.mp4";
const POSTER_SRC = "/assets/video/brand-promo-poster.webp";

function prefersStill() {
  if (typeof window === "undefined") return true;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const saveData = navigator.connection?.saveData;
  return Boolean(reducedMotion || saveData);
}

const HeroVideo = () => {
  const [videoError, setVideoError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (prefersStill()) return;

    let idleId = null;
    const start = () => {
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 800));
      idleId = idle(() => setShowVideo(true));
    };

    if (document.readyState === "complete") start();
    else {
      window.addEventListener("load", start, { once: true });
    }

    return () => {
      window.removeEventListener("load", start);
      if (idleId != null && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
    };
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ height: "clamp(50vh, 60vh, 720px)" }}>
      {/* Poster paints immediately; the film fades in over it when ready. */}
      <div className="absolute inset-0 bg-gradient-to-br from-se-black via-se-charcoal to-se-asphalt">
        <SmartImage
          src={POSTER_SRC}
          alt=""
          aria-hidden="true"
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {showVideo && !videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          onError={() => setVideoError(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-se-black/90 via-se-black/50 to-se-black/20" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <Motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
          className="text-overline text-se-gold mb-4"
        >
          SS26
        </Motion.p>

        <Motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.2, 0, 0, 1] }}
          className="font-display text-[clamp(2.5rem,7vw,5rem)] tracking-[0.08em] text-se-bone leading-none mb-3"
        >
          STYLE ETERNAL
        </Motion.h2>

        <Motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.2, 0, 0, 1] }}
          className="font-accent text-[14px] tracking-[0.25em] text-se-bone/60 uppercase mb-10"
        >
          SS26 — Love Never Dies
        </Motion.p>

        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.2, 0, 0, 1] }}
        >
          <Link
            to="/collections/love-never-dies"
            className="btn-primary px-10 py-4 text-[10px] tracking-[0.25em]"
          >
            Shop Drop 01
          </Link>
        </Motion.div>
      </div>
    </section>
  );
};

export default HeroVideo;

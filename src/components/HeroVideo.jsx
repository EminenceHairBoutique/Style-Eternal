// src/components/HeroVideo.jsx — Style Eternal
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";

const VIDEO_SRC = "/assets/video/brand-promo-ss26.mp4";

const HeroVideo = () => {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative overflow-hidden" style={{ height: "clamp(50vh, 60vh, 720px)" }}>
      {/* Video or gradient fallback */}
      {!videoError ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-se-black via-se-charcoal to-se-asphalt" />
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

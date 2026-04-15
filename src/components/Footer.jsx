// src/components/Footer.jsx — Style Eternal

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND, SOCIAL } from "../config/brand";
import { subscribeEmail } from "../utils/subscribe";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    try {
      setStatus("loading");
      await subscribeEmail({ email, source: "footer_newsletter" });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-se-charcoal border-t border-white/5 mt-0">
      {/* Newsletter Strip */}
      <div className="border-b border-white/5">
        <div className="content-wide py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-[22px] md:text-[28px] text-se-bone tracking-[0.08em] mb-2">
              JOIN THE ARCHIVE
            </h3>
            <p className="text-[13px] text-se-steel max-w-md">
              Early access to drops. Editorial updates. Community invites.
              No spam. Unsubscribe anytime.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
              placeholder="your@email.com"
              className="flex-1 md:w-[280px] px-4 py-3 bg-se-asphalt border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary px-6 py-3 text-[10px]"
            >
              {status === "loading" ? "..." : status === "success" ? "Joined" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="content-wide py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Shop */}
          <div>
            <p className="text-label text-se-steel mb-5">Shop</p>
            <div className="space-y-3 text-[13px]">
              <Link to="/shop?filter=new" className="block text-se-bone/60 hover:text-se-bone transition">New Arrivals</Link>
              <Link to="/shop/tees" className="block text-se-bone/60 hover:text-se-bone transition">Tees</Link>
              <Link to="/shop/hoodies" className="block text-se-bone/60 hover:text-se-bone transition">Hoodies</Link>
              <Link to="/shop/outerwear" className="block text-se-bone/60 hover:text-se-bone transition">Outerwear</Link>
              <Link to="/shop/bottoms" className="block text-se-bone/60 hover:text-se-bone transition">Bottoms</Link>
              <Link to="/shop/headwear" className="block text-se-bone/60 hover:text-se-bone transition">Headwear</Link>
              <Link to="/shop/accessories" className="block text-se-bone/60 hover:text-se-bone transition">Accessories</Link>
            </div>
          </div>

          {/* Collections */}
          <div>
            <p className="text-label text-se-steel mb-5">Collections</p>
            <div className="space-y-3 text-[13px]">
              <Link to="/collections/north-ward" className="block text-se-bone/60 hover:text-se-bone transition">North Ward</Link>
              <Link to="/collections/iron-bound" className="block text-se-bone/60 hover:text-se-bone transition">Iron Bound</Link>
              <Link to="/collections/essentials" className="block text-se-bone/60 hover:text-se-bone transition">Essentials</Link>
              <Link to="/collections/legacy" className="block text-se-bone/60 hover:text-se-bone transition">Legacy</Link>
              <Link to="/collections/archive" className="block text-se-bone/60 hover:text-se-bone transition">Archive</Link>
              <Link to="/drops" className="block text-se-bone/60 hover:text-se-bone transition">All Drops</Link>
            </div>
          </div>

          {/* Brand */}
          <div>
            <p className="text-label text-se-steel mb-5">Brand</p>
            <div className="space-y-3 text-[13px]">
              <Link to="/about" className="block text-se-bone/60 hover:text-se-bone transition">Our Story</Link>
              <Link to="/editorial" className="block text-se-bone/60 hover:text-se-bone transition">Editorial</Link>
              <Link to="/lookbook" className="block text-se-bone/60 hover:text-se-bone transition">Lookbook</Link>
              <Link to="/community" className="block text-se-bone/60 hover:text-se-bone transition">Community</Link>
              <Link to="/rewards" className="block text-se-bone/60 hover:text-se-bone transition">Rewards</Link>
              <Link to="/contact" className="block text-se-bone/60 hover:text-se-bone transition">Contact</Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <p className="text-label text-se-steel mb-5">Help</p>
            <div className="space-y-3 text-[13px]">
              <Link to="/faqs" className="block text-se-bone/60 hover:text-se-bone transition">FAQ</Link>
              <Link to="/shipping" className="block text-se-bone/60 hover:text-se-bone transition">Shipping</Link>
              <Link to="/returns" className="block text-se-bone/60 hover:text-se-bone transition">Returns &amp; Exchanges</Link>
              <Link to="/size-guide" className="block text-se-bone/60 hover:text-se-bone transition">Size Guide</Link>
              <a href={`mailto:${BRAND.supportEmail}`} className="block text-se-bone/60 hover:text-se-bone transition">{BRAND.supportEmail}</a>
              <Link to="/account" className="block text-se-bone/60 hover:text-se-bone transition">My Account</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Statement */}
      <div className="border-t border-white/[0.04]">
        <div className="content-wide py-8 text-center">
          <p className="font-display text-[clamp(1rem,2.5vw,1.4rem)] tracking-[0.12em] text-se-bone/[0.08] leading-tight">
            STYLE IS MEMORY. LEGACY IS FOREVER.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="content-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand mark */}
          <div className="flex items-center gap-4">
            <span className="font-display text-[14px] tracking-[0.15em] text-se-bone/50">
              STYLE ETERNAL
            </span>
            <span className="text-[10px] text-se-steel tracking-[0.15em] uppercase">
              {BRAND.origin}
            </span>
          </div>

          {/* Legal */}
          <div className="flex flex-wrap gap-6 text-[11px] text-se-steel">
            <Link to="/privacy" className="hover:text-se-bone/60 transition">Privacy</Link>
            <Link to="/privacy-choices" className="hover:text-se-bone/60 transition">Your Choices</Link>
            <Link to="/terms" className="hover:text-se-bone/60 transition">Terms</Link>
            <Link to="/returns" className="hover:text-se-bone/60 transition">Returns</Link>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-se-steel">
            &copy; {new Date().getFullYear()} {BRAND.fullName}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

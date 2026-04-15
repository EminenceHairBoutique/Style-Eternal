// src/components/Footer.jsx — Style Eternal

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Shield, Truck, RotateCcw, Award } from "lucide-react";
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

      {/* Trust Guarantees */}
      <div className="border-b border-white/5">
        <div className="content-wide py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over $150" },
            { icon: RotateCcw, title: "30-Day Returns", desc: "Hassle-free exchanges" },
            { icon: Shield, title: "Secure Checkout", desc: "SSL encrypted payments" },
            { icon: Award, title: "Premium Quality", desc: "300gsm+ heavyweight" },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <ItemIcon size={16} className="text-se-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-accent tracking-[0.1em] uppercase text-se-bone/70">{item.title}</p>
                  <p className="text-[10px] text-se-steel mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
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
              <Link to="/collections/love-never-dies" className="block text-se-bone/60 hover:text-se-bone transition">Love Never Dies</Link>
              <Link to="/collections/eternal-flame" className="block text-se-bone/60 hover:text-se-bone transition">Eternal Flame</Link>
              <Link to="/collections/essentials" className="block text-se-bone/60 hover:text-se-bone transition">Essentials</Link>
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
              <Link to="/client-services" className="block text-se-bone/60 hover:text-se-bone transition">Contact</Link>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <p className="text-label text-se-steel mb-5">Customer Care</p>
            <div className="space-y-3 text-[13px]">
              <Link to="/client-services" className="block text-se-bone/60 hover:text-se-bone transition">Client Services</Link>
              <Link to="/faqs" className="block text-se-bone/60 hover:text-se-bone transition">FAQ</Link>
              <Link to="/shipping" className="block text-se-bone/60 hover:text-se-bone transition">Shipping</Link>
              <Link to="/returns" className="block text-se-bone/60 hover:text-se-bone transition">Returns & Exchanges</Link>
              <Link to="/size-guide" className="block text-se-bone/60 hover:text-se-bone transition">Size Guide</Link>
              <Link to="/account" className="block text-se-bone/60 hover:text-se-bone transition">My Account</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Social & Payment */}
      <div className="border-t border-white/5">
        <div className="content-wide py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social */}
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-accent tracking-[0.25em] uppercase text-se-steel">Follow</span>
            {[
              { icon: Instagram, href: SOCIAL.instagram || "#", label: "Instagram" },
              { icon: Youtube, href: SOCIAL.youtube || "#", label: "YouTube" },
            ].map((item) => {
              const SocialIcon = item.icon;
              return (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-full transition" aria-label={item.label}>
                  <SocialIcon size={16} className="text-se-bone/40 hover:text-se-bone transition" />
                </a>
              );
            })}
          </div>

          {/* Payment methods text */}
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-accent tracking-[0.2em] uppercase text-se-steel/50">We Accept</span>
            {["Visa", "Mastercard", "Amex", "Apple Pay"].map((method) => (
              <span key={method} className="text-[9px] font-accent tracking-[0.1em] text-se-steel/40">{method}</span>
            ))}
          </div>
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

          {/* Brand Statement */}
          <p className="text-[9px] font-accent tracking-[0.2em] uppercase text-se-steel/50 hidden md:block">
            Love is Eternal. Style is Eternal.
          </p>

          {/* Legal */}
          <div className="flex flex-wrap gap-6 text-[11px] text-se-steel">
            <Link to="/privacy" className="hover:text-se-bone/60 transition">Privacy</Link>
            <Link to="/privacy-choices" className="hover:text-se-bone/60 transition">Your Choices</Link>
            <Link to="/terms" className="hover:text-se-bone/60 transition">Terms</Link>
            <Link to="/returns" className="hover:text-se-bone/60 transition">Returns</Link>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-se-steel">
            &copy; {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

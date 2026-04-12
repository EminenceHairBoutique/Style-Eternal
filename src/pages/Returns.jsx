// src/pages/Returns.jsx — Style Eternal (Pass 2)
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Truck, RotateCcw, Shield, Clock, AlertCircle } from "lucide-react";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, ease: [0.2, 0, 0, 1] },
};

export default function Returns() {
  return (
    <>
      <SEO title="Shipping & Returns — Style Eternal" description="Shipping rates, delivery times, and return policy for Style Eternal." />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-12 md:pt-40 md:pb-20 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="section-eyebrow mb-4">Policy</p>
              <h1 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] tracking-[0.04em] mb-4">
                SHIPPING &<br />RETURNS
              </h1>
              <p className="text-[15px] text-se-bone/40 max-w-lg">
                We want you to love what you wear. If something isn&apos;t right, we&apos;ll make it right.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Shipping Guarantees */}
        <section className="border-b border-white/5">
          <div className="content-wide py-10 md:py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: "Free Shipping", desc: "Orders over $150" },
                { icon: Clock, title: "5\u20137 Days", desc: "Standard delivery" },
                { icon: RotateCcw, title: "30-Day Returns", desc: "No questions asked" },
                { icon: Shield, title: "Secure Checkout", desc: "SSL encrypted" },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.title} className="guarantee-card">
                    <ItemIcon size={20} className="text-se-gold mb-3" />
                    <p className="text-[12px] font-accent tracking-[0.1em] uppercase text-se-bone/80 mb-1">{item.title}</p>
                    <p className="text-[11px] text-se-steel">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Shipping Details */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-8">SHIPPING</h2>

              <div className="border border-white/5 bg-se-charcoal overflow-hidden mb-8">
                <div className="grid grid-cols-3 gap-0 text-[11px] font-accent tracking-[0.1em] uppercase text-se-steel border-b border-white/5">
                  <div className="px-5 py-3">Method</div>
                  <div className="px-5 py-3">Delivery</div>
                  <div className="px-5 py-3">Cost</div>
                </div>
                {[
                  { method: "Standard", delivery: "5\u20137 business days", cost: "Free over $150" },
                  { method: "Expedited", delivery: "2\u20133 business days", cost: "$12.00" },
                  { method: "Overnight", delivery: "Next business day", cost: "$25.00" },
                ].map(({ method, delivery, cost }) => (
                  <div key={method} className="grid grid-cols-3 gap-0 border-b border-white/5 last:border-0">
                    <div className="px-5 py-4 text-[13px] text-se-bone/70 font-accent">{method}</div>
                    <div className="px-5 py-4 text-[13px] text-se-bone/50 font-accent">{delivery}</div>
                    <div className="px-5 py-4 text-[13px] text-se-bone/50 font-accent">{cost}</div>
                  </div>
                ))}
              </div>

              <p className="text-[13px] text-se-bone/40 leading-relaxed">
                All orders ship from Newark, NJ. You&apos;ll receive tracking info via email once your order ships.
                Currently US shipping only — international is coming soon.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Return Process */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-4">RETURN PROCESS</h2>
              <p className="text-[14px] text-se-bone/40 mb-10 max-w-lg">
                Returns accepted within <strong className="text-se-bone/60">30 days</strong> of delivery.
                Items must be unworn, unaltered, with original tags attached.
              </p>

              <div className="space-y-8">
                {[
                  { step: "1", title: "Contact Us", desc: "Email info@styleeternal.com with your order number and reason for return." },
                  { step: "2", title: "Get Your Label", desc: "We\u2019ll send a prepaid return label within 24 hours." },
                  { step: "3", title: "Ship It Back", desc: "Pack the item in its original packaging and drop it off at any carrier location." },
                  { step: "4", title: "Get Refunded", desc: "Refund processed within 5\u20137 business days after we receive and inspect the item." },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="timeline-step" data-step={step}>
                    <h3 className="text-[14px] font-accent font-medium text-se-bone/80 mb-1">{title}</h3>
                    <p className="text-[13px] text-se-bone/40 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Exchanges */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-4">EXCHANGES</h2>
              <p className="text-[14px] text-se-bone/40 leading-relaxed mb-4 max-w-lg">
                Want a different size or colorway? Contact us and we&apos;ll swap it out, subject to availability.
                First exchange is free — no extra shipping charges.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Exceptions */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle size={18} className="text-se-gold mt-0.5 shrink-0" />
                <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em]">EXCEPTIONS</h2>
              </div>
              <div className="border border-white/5 bg-se-charcoal p-6 space-y-3">
                {[
                  { label: "Final Sale items", note: "Not eligible for returns or exchanges." },
                  { label: "Limited / Sold Out pieces", note: "Non-returnable once purchased." },
                  { label: "Pre-orders", note: "May have different return windows \u2014 check the product page." },
                  { label: "Damaged or incorrect orders", note: "Contact us immediately with photos \u2014 we\u2019ll make it right." },
                ].map(({ label, note }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="mt-[7px] w-1.5 h-1.5 bg-se-gold shrink-0" />
                    <p className="text-[13px] text-se-bone/50 leading-relaxed">
                      <strong className="text-se-bone/70">{label}</strong> — {note}
                    </p>
                  </div>
                ))}
              </div>
            </Motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="content-wide text-center">
            <p className="section-eyebrow mb-4">Questions?</p>
            <h2 className="font-display text-[20px] md:text-[26px] tracking-[0.06em] mb-6">WE&apos;RE HERE TO HELP</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-primary">Contact Support</Link>
              <Link to="/faqs" className="btn-outline">View FAQs</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

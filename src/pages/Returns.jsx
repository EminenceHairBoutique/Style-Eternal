// src/pages/Returns.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { RotateCcw, Shield, Clock, AlertCircle, Mail, Tag, PackageCheck, Camera } from "lucide-react";
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
      <SEO
        title="Returns & Exchanges — Style Eternal"
        description="Returns, exchanges, and refund policy for Style Eternal streetwear. 30-day return window, free first exchange, and hassle-free process."
      />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-12 md:pt-40 md:pb-20 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="section-eyebrow mb-4">Policy</p>
              <h1 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] tracking-[0.04em] mb-4">
                RETURNS &<br />EXCHANGES
              </h1>
              <p className="text-[15px] text-se-bone/40 max-w-lg">
                We stand behind everything we make. If something isn&apos;t right, we&apos;ll make it right — no hassle, no runaround.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Policy Highlights */}
        <section className="border-b border-white/5">
          <div className="content-wide py-10 md:py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Clock, title: "30-Day Window", desc: "From delivery date" },
                { icon: RotateCcw, title: "Free First Exchange", desc: "Size or color swap" },
                { icon: Shield, title: "Full Refund", desc: "Original payment method" },
                { icon: PackageCheck, title: "5\u20137 Days", desc: "Refund processing time" },
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

        {/* Return Eligibility */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-4">RETURN ELIGIBILITY</h2>
              <p className="text-[14px] text-se-bone/40 leading-relaxed mb-6 max-w-lg">
                We accept returns within <strong className="text-se-bone/60">30 days of delivery</strong>. To qualify, items must meet all of the following conditions:
              </p>
              <div className="border border-white/5 bg-se-charcoal p-6 space-y-3">
                {[
                  "Unworn and unwashed",
                  "Unaltered — no tailoring, hemming, or modifications",
                  "All original tags still attached",
                  "Original packaging preferred (branded bag, tissue wrap, etc.)",
                ].map((condition) => (
                  <div key={condition} className="flex items-start gap-3">
                    <span className="mt-[7px] w-1.5 h-1.5 bg-se-gold shrink-0" />
                    <p className="text-[13px] text-se-bone/50 leading-relaxed">{condition}</p>
                  </div>
                ))}
              </div>
            </Motion.div>
          </div>
        </section>

        {/* How to Initiate */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-4">HOW TO START A RETURN</h2>
              <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3 max-w-lg">
                <p>
                  Email us at{" "}
                  <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                    info@styleeternal.com
                  </a>{" "}
                  with your <strong className="text-se-bone/70">order number</strong> and <strong className="text-se-bone/70">reason for return</strong>. Our team will respond within 24 hours with a prepaid return shipping label.
                </p>
                <p>
                  Pack the item securely — original packaging is preferred but not required — and drop it off at any carrier location. Once we receive and inspect the item, your refund will be processed within <strong className="text-se-bone/70">5&ndash;7 business days</strong> to your original payment method.
                </p>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Visual Timeline */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-10">RETURN PROCESS</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                {[
                  { step: "1", icon: Mail, title: "Email Us", desc: "Send your order number and reason to info@styleeternal.com." },
                  { step: "2", icon: Tag, title: "Receive Label", desc: "We\u2019ll send a prepaid return label within 24 hours." },
                  { step: "3", icon: PackageCheck, title: "Ship Back", desc: "Pack the item and drop it off at any carrier location." },
                  { step: "4", icon: Shield, title: "Refund Processed", desc: "Refund issued within 5\u20137 business days after inspection." },
                ].map((item, i) => {
                  const StepIcon = item.icon;
                  return (
                  <Motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                    className="border border-white/5 bg-se-charcoal p-6 text-center"
                  >
                    <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center border border-se-gold/30 text-se-gold text-[12px] font-accent tracking-wider">
                      {item.step}
                    </div>
                    <StepIcon size={18} className="text-se-gold mx-auto mb-3" />
                    <h3 className="text-[13px] font-accent font-medium text-se-bone/80 tracking-[0.08em] uppercase mb-2">{item.title}</h3>
                    <p className="text-[12px] text-se-bone/40 leading-relaxed">{item.desc}</p>
                  </Motion.div>
                  );
                })}
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Refund Details */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-4">REFUND DETAILS</h2>
              <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3 max-w-lg">
                <p>
                  Refunds are issued to your <strong className="text-se-bone/70">original payment method</strong> within <strong className="text-se-bone/70">5&ndash;7 business days</strong> after we receive and inspect the returned item. Please allow an additional 3&ndash;5 business days for the refund to appear on your statement, depending on your bank or card issuer.
                </p>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Exchanges */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-4">EXCHANGES</h2>
              <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3 max-w-lg">
                <p>
                  Need a different size or colorway? Email us at{" "}
                  <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                    info@styleeternal.com
                  </a>{" "}
                  with your order number and the size or color you&apos;d like instead. We&apos;ll check availability and arrange the swap.
                </p>
                <p>
                  Your <strong className="text-se-bone/70">first exchange is free</strong> — no extra shipping charges. Subsequent exchanges are subject to standard return shipping costs.
                </p>
                <p className="text-[13px] text-se-bone/40">
                  Exchanges are subject to availability. If your desired item is out of stock, we&apos;ll issue a full refund instead.
                </p>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Shipping Costs */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em] mb-4">RETURN SHIPPING</h2>
              <div className="border border-white/5 bg-se-charcoal overflow-hidden">
                <div className="grid grid-cols-2 gap-0 text-[11px] font-accent tracking-[0.1em] uppercase text-se-steel border-b border-white/5">
                  <div className="px-5 py-3">Location</div>
                  <div className="px-5 py-3">Shipping Cost</div>
                </div>
                {[
                  { location: "Domestic (US)", cost: "Prepaid label provided" },
                  { location: "International", cost: "Customer pays return shipping" },
                ].map(({ location, cost }) => (
                  <div key={location} className="grid grid-cols-2 gap-0 border-b border-white/5 last:border-0">
                    <div className="px-5 py-4 text-[13px] text-se-bone/70 font-accent">{location}</div>
                    <div className="px-5 py-4 text-[13px] text-se-bone/50 font-accent">{cost}</div>
                  </div>
                ))}
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Damaged / Incorrect Orders */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <div className="flex items-start gap-3 mb-6">
                <Camera size={18} className="text-se-gold mt-0.5 shrink-0" />
                <h2 className="font-display text-[18px] md:text-[22px] tracking-[0.08em]">DAMAGED OR INCORRECT ORDERS</h2>
              </div>
              <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3 max-w-lg">
                <p>
                  Received a damaged or incorrect item? <Link to="/client-services" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">Contact us</Link> immediately with your order number and <strong className="text-se-bone/70">photos of the issue</strong>. We&apos;ll arrange a full replacement or refund — no return needed in most cases.
                </p>
                <p className="text-[13px] text-se-bone/40">
                  Please report any issues within 48 hours of delivery for fastest resolution.
                </p>
              </div>
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
                  { label: "Final Sale items", note: "Not eligible for returns or exchanges. All sales are final." },
                  { label: "Limited Edition / Sold Out pieces", note: "Non-returnable once purchased due to limited availability." },
                  { label: "Pre-order items", note: "May have different return windows — check the product page for specific terms." },
                  { label: "Custom or made-to-order items", note: "Non-returnable. Custom pieces are final sale." },
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
              <Link to="/client-services" className="btn-primary">Contact Support</Link>
              <Link to="/faqs" className="btn-outline">View FAQs</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

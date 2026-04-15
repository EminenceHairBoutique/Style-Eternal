// src/pages/Shipping.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Truck, Clock, Globe, ShieldCheck } from "lucide-react";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

export default function Shipping() {
  return (
    <>
      <SEO
        title="Shipping — Style Eternal"
        description="Shipping information, delivery times, and policies for Style Eternal orders."
      />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">Policy</p>
              <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em] mb-4">
                SHIPPING
              </h1>
              <p className="text-[15px] text-se-bone/40 max-w-md">
                Every order is handled with care. Packed, sealed, and shipped with care.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Shipping Options */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12">
              <p className="text-overline mb-2">Domestic</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                SHIPPING OPTIONS
              </h2>
            </Motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: Truck,
                  title: "Standard Shipping",
                  time: "5–7 Business Days",
                  price: "Free on orders over $150",
                  priceSub: "$8.95 for orders under $150",
                },
                {
                  icon: Clock,
                  title: "Expedited Shipping",
                  time: "2–3 Business Days",
                  price: "$14.95",
                  priceSub: "Available at checkout",
                },
                {
                  icon: ShieldCheck,
                  title: "Priority Shipping",
                  time: "1–2 Business Days",
                  price: "$24.95",
                  priceSub: "Signature required on delivery",
                },
              ].map((option, i) => {
                const OptionIcon = option.icon;
                return (
                  <Motion.div
                    key={option.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                    className="border border-white/5 bg-se-charcoal p-7"
                  >
                    <OptionIcon className="w-5 h-5 text-se-gold mb-4" />
                    <h3 className="font-display text-[14px] tracking-[0.12em] mb-2">
                      {option.title.toUpperCase()}
                    </h3>
                    <p className="text-[13px] text-se-bone/70 font-accent mb-1">
                      {option.time}
                    </p>
                    <p className="text-[14px] text-se-bone font-accent font-medium mb-1">
                      {option.price}
                    </p>
                    <p className="text-[11px] text-se-steel font-accent">
                      {option.priceSub}
                    </p>
                  </Motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl space-y-10">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">
                ORDER PROCESSING
              </h2>
              <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3">
                <p>
                  Orders are processed within <strong className="text-se-bone/70">1–2 business days</strong>.
                  You will receive a confirmation email with tracking information once your order ships.
                </p>
                <p>
                  Orders placed after 2:00 PM EST or on weekends/holidays will begin processing
                  the next business day.
                </p>
              </div>
            </Motion.div>

            <div className="divider" />

            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">
                TRACKING YOUR ORDER
              </h2>
              <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3">
                <p>
                  Once your order ships, you will receive an email with a tracking number
                  and a link to track your package.
                </p>
                <p>
                  You can also check order status from your{" "}
                  <Link to="/account" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                    account page
                  </Link>.
                </p>
              </div>
            </Motion.div>

            <div className="divider" />

            <Motion.div {...fadeUp}>
              <div className="flex items-start gap-4">
                <Globe className="w-5 h-5 text-se-gold mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">
                    INTERNATIONAL SHIPPING
                  </h2>
                  <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3">
                    <p>
                      Style Eternal currently ships within the <strong className="text-se-bone/70">United States only</strong>.
                    </p>
                    <p>
                      International shipping is coming soon. Sign up for our newsletter to be the
                      first to know when we expand.
                    </p>
                  </div>
                </div>
              </div>
            </Motion.div>

            <div className="divider" />

            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">
                PACKAGING
              </h2>
              <p className="text-[14px] text-se-bone/50 leading-relaxed">
                Every order is packed in custom branded packaging. Tissue-wrapped, sealed,
                and shipped in reinforced mailers or boxes to ensure your pieces arrive in
                pristine condition.
              </p>
            </Motion.div>

            <div className="divider" />

            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">
                LOST OR DAMAGED PACKAGES
              </h2>
              <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3">
                <p>
                  If your package is lost, stolen, or arrives damaged,{" "}
                  <Link to="/contact" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                    contact us
                  </Link>{" "}
                  immediately with your order number. We&apos;ll investigate and make it right.
                </p>
              </div>
            </Motion.div>

            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <Link to="/returns" className="btn-outline mr-4">Returns Policy</Link>
              <Link to="/contact" className="btn-outline">Contact Support</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

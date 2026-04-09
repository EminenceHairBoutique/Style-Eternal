// src/pages/Terms.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function Terms() {
  return (
    <>
      <SEO title="Terms & Conditions — Style Eternal" description="Terms and conditions for Style Eternal." />

      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <p className="text-overline mb-4">Legal</p>
            <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em]">
              TERMS & CONDITIONS
            </h1>
            <p className="text-[12px] text-se-steel font-accent mt-3">Last updated: March 2026</p>
          </div>
        </section>

        <section className="section-pad">
          <div className="content-wrap max-w-3xl space-y-10 text-[14px] text-se-bone/50 leading-relaxed">
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">GENERAL</h2>
              <p>
                By accessing and using styleeternal.com, you agree to be bound by these terms and conditions.
                Style Eternal reserves the right to update these terms at any time.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">ORDERS & PAYMENT</h2>
              <p>
                All prices are listed in USD. We accept major credit cards and other payment methods
                as displayed at checkout. Orders are subject to availability and confirmation.
                We reserve the right to cancel orders at our discretion.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">SHIPPING</h2>
              <p>
                Standard shipping is 5–7 business days within the US. Expedited options may be available.
                Style Eternal is not responsible for delays caused by carriers or customs.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">RETURNS</h2>
              <p>
                See our <Link to="/returns" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">Returns & Exchanges</Link> page for our full return policy.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">INTELLECTUAL PROPERTY</h2>
              <p>
                All content on this site — including designs, graphics, text, images, and brand marks —
                is the property of Style Eternal and may not be reproduced without written permission.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">LIMITATION OF LIABILITY</h2>
              <p>
                Style Eternal shall not be liable for any indirect, incidental, or consequential damages
                arising from the use of this site or the purchase of products.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">CONTACT</h2>
              <p>
                For questions about these terms, contact us at{" "}
                <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  info@styleeternal.com
                </a>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

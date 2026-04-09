// src/pages/Returns.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function Returns() {
  return (
    <>
      <SEO title="Returns & Exchanges — Style Eternal" description="Returns and exchanges policy for Style Eternal." />

      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <p className="text-overline mb-4">Policy</p>
            <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em]">
              RETURNS & EXCHANGES
            </h1>
          </div>
        </section>

        <section className="section-pad">
          <div className="content-wrap max-w-3xl space-y-10">
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">RETURN POLICY</h2>
              <div className="text-[14px] text-se-bone/50 leading-relaxed space-y-3">
                <p>
                  We accept returns on unworn, unaltered items with original tags attached within
                  <strong className="text-se-bone/70"> 30 days</strong> of delivery.
                </p>
                <p>Items must be in original condition — no wear, no wash, no alterations.</p>
              </div>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">HOW TO RETURN</h2>
              <ol className="text-[14px] text-se-bone/50 leading-relaxed space-y-2 list-decimal list-inside">
                <li>Email <span className="text-se-bone/70">info@styleeternal.com</span> with your order number and reason for return.</li>
                <li>We'll send you a prepaid return label within 24 hours.</li>
                <li>Ship the item back in its original packaging.</li>
                <li>Refund will be processed within 5–7 business days after we receive the item.</li>
              </ol>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">EXCHANGES</h2>
              <p className="text-[14px] text-se-bone/50 leading-relaxed">
                Want a different size or colorway? Contact us and we'll swap it out, subject to availability.
                Exchanges are free for the first swap.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">EXCEPTIONS</h2>
              <ul className="text-[14px] text-se-bone/50 leading-relaxed space-y-2 list-disc list-inside">
                <li><strong className="text-se-bone/70">Final Sale items</strong> are not eligible for returns or exchanges.</li>
                <li><strong className="text-se-bone/70">Limited / Sold Out</strong> pieces are non-returnable once purchased.</li>
                <li><strong className="text-se-bone/70">Pre-orders</strong> may have different return windows — check the product page.</li>
              </ul>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4">DAMAGED OR INCORRECT ORDERS</h2>
              <p className="text-[14px] text-se-bone/50 leading-relaxed">
                If your order arrives damaged or incorrect, contact us immediately at
                info@styleeternal.com with photos. We'll make it right.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <Link to="/contact" className="btn-outline">Contact Support</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

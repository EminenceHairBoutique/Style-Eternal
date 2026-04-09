// src/pages/Privacy.jsx — Style Eternal
import React from "react";
import SEO from "../components/SEO";

export default function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy — Style Eternal" description="Privacy policy for Style Eternal." />

      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <p className="text-overline mb-4">Legal</p>
            <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em]">
              PRIVACY POLICY
            </h1>
            <p className="text-[12px] text-se-steel font-accent mt-3">Last updated: March 2026</p>
          </div>
        </section>

        <section className="section-pad">
          <div className="content-wrap max-w-3xl space-y-10 text-[14px] text-se-bone/50 leading-relaxed">
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">OVERVIEW</h2>
              <p>
                Style Eternal respects your privacy. This policy explains how we collect, use, and protect
                your personal information when you visit styleeternal.com or make a purchase.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">INFORMATION WE COLLECT</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Name, email, and shipping address when you place an order</li>
                <li>Payment information (processed securely via Stripe — we do not store card details)</li>
                <li>Email address when you subscribe to our newsletter</li>
                <li>Usage data and cookies for analytics and site improvement</li>
              </ul>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">HOW WE USE YOUR INFORMATION</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>To process and fulfill your orders</li>
                <li>To send order confirmations and shipping updates</li>
                <li>To send marketing emails (only with your consent)</li>
                <li>To improve our website and shopping experience</li>
              </ul>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">DATA SECURITY</h2>
              <p>
                We use industry-standard security measures including SSL encryption and secure payment
                processing through Stripe. We do not sell your personal information to third parties.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">YOUR RIGHTS</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data at any time.
                Contact us at info@styleeternal.com.
              </p>
            </div>

            <div className="divider" />

            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">COOKIES</h2>
              <p>
                We use cookies for essential site functionality, analytics, and to remember your preferences.
                You can manage cookie preferences in your browser settings.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

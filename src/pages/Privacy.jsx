// src/pages/Privacy.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, ease: [0.2, 0, 0, 1] },
};

export default function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy — Style Eternal" description="How Style Eternal collects, uses, and protects your personal information when you visit shopstyleeternal.com." />

      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">Legal</p>
              <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em]">
                PRIVACY POLICY
              </h1>
              <p className="text-[12px] text-se-steel font-accent mt-3">Last updated: April 2026</p>
            </Motion.div>
          </div>
        </section>

        <section className="section-pad">
          <div className="content-wrap max-w-3xl space-y-10 text-[14px] text-se-bone/50 leading-relaxed">

            {/* 1 — Overview */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">1. OVERVIEW</h2>
              <p>
                Style Eternal LLC (&ldquo;Style Eternal,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
                or &ldquo;our&rdquo;) respects your privacy and is committed to protecting the personal
                information you share with us. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you visit shopstyleeternal.com (the &ldquo;Site&rdquo;),
                create an account, make a purchase, or interact with us. By using the Site, you consent to
                the practices described in this policy.
              </p>
            </div>

            <div className="divider" />

            {/* 2 — Information We Collect */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">2. INFORMATION WE COLLECT</h2>

              <p className="mb-3 text-se-bone/70 font-accent text-[12px] tracking-[0.1em] uppercase">
                Information You Provide
              </p>
              <ul className="space-y-2 list-disc list-inside mb-4">
                <li>
                  <strong className="text-se-bone/70">Account &amp; order information:</strong> name,
                  email address, shipping address, and phone number when you create an account or place
                  an order.
                </li>
                <li>
                  <strong className="text-se-bone/70">Payment information:</strong> credit/debit card
                  details are collected and processed directly by Stripe. Style Eternal does not store,
                  access, or retain your full card number, expiration date, or CVV.
                </li>
                <li>
                  <strong className="text-se-bone/70">Newsletter subscription:</strong> email address
                  when you opt in to marketing communications.
                </li>
                <li>
                  <strong className="text-se-bone/70">Customer communications:</strong> any information
                  you provide when contacting customer support or submitting reviews.
                </li>
              </ul>

              <p className="mb-3 text-se-bone/70 font-accent text-[12px] tracking-[0.1em] uppercase">
                Information Collected Automatically
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-se-bone/70">Usage data:</strong> pages visited, time spent on
                  pages, referral URLs, browser type, operating system, and device information.
                </li>
                <li>
                  <strong className="text-se-bone/70">Cookies &amp; similar technologies:</strong> we
                  use cookies to operate the Site, analyze traffic, and deliver relevant content. See
                  Section 5 for details.
                </li>
                <li>
                  <strong className="text-se-bone/70">IP address:</strong> collected automatically by
                  our hosting provider for security and analytics purposes.
                </li>
              </ul>
            </div>

            <div className="divider" />

            {/* 3 — How We Use Your Information */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">3. HOW WE USE YOUR INFORMATION</h2>
              <p className="mb-3">We use the information we collect for the following purposes:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-se-bone/70">Order fulfillment:</strong> processing, shipping,
                  and delivering your orders; sending order confirmations, shipping updates, and delivery
                  notifications.
                </li>
                <li>
                  <strong className="text-se-bone/70">Account management:</strong> creating and
                  maintaining your account, authenticating logins, and managing your profile.
                </li>
                <li>
                  <strong className="text-se-bone/70">Marketing communications:</strong> sending
                  promotional emails, product announcements, and exclusive offers — only with your
                  explicit consent. You may unsubscribe at any time.
                </li>
                <li>
                  <strong className="text-se-bone/70">Site improvement:</strong> analyzing usage
                  patterns to improve the shopping experience, site performance, and product offerings.
                </li>
                <li>
                  <strong className="text-se-bone/70">Fraud prevention &amp; security:</strong>{" "}
                  detecting and preventing fraudulent transactions, unauthorized access, and other
                  illegal activities.
                </li>
                <li>
                  <strong className="text-se-bone/70">Legal compliance:</strong> fulfilling legal
                  obligations and responding to lawful requests from public authorities.
                </li>
              </ul>
            </div>

            <div className="divider" />

            {/* 4 — Information Sharing */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">4. INFORMATION SHARING</h2>
              <p className="mb-3">
                Style Eternal does <strong className="text-se-bone/70">not</strong> sell, rent, or trade
                your personal information to third parties. We share your data only with the following
                trusted service providers who assist us in operating the Site and fulfilling orders:
              </p>
              <ul className="space-y-2 list-disc list-inside mb-3">
                <li>
                  <strong className="text-se-bone/70">Stripe</strong> — payment processing. Stripe
                  processes your payment information in accordance with their own privacy policy.
                </li>
                <li>
                  <strong className="text-se-bone/70">Resend</strong> — transactional and marketing
                  email delivery.
                </li>
                <li>
                  <strong className="text-se-bone/70">Vercel</strong> — website hosting and serverless
                  function execution.
                </li>
                <li>
                  <strong className="text-se-bone/70">Supabase</strong> — database and authentication
                  infrastructure.
                </li>
              </ul>
              <p>
                Each service provider is contractually obligated to protect your information and use it
                only for the specific services they provide to us. We may also disclose information when
                required by law, to respond to legal process, or to protect the rights, property, or safety
                of Style Eternal and its customers.
              </p>
            </div>

            <div className="divider" />

            {/* 5 — Cookies */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">5. COOKIES &amp; TRACKING TECHNOLOGIES</h2>
              <p className="mb-3">
                We use cookies and similar technologies to enhance your experience on the Site. The cookies
                we use fall into the following categories:
              </p>
              <ul className="space-y-2 list-disc list-inside mb-3">
                <li>
                  <strong className="text-se-bone/70">Necessary cookies</strong> (always active) —
                  essential for Site functionality, including authentication, cart persistence, and
                  security features. These cannot be disabled.
                </li>
                <li>
                  <strong className="text-se-bone/70">Analytics cookies</strong> (with consent) —
                  Google Analytics 4 (GA4) is used to understand how visitors interact with the Site.
                  These cookies are only activated with your consent.
                </li>
                <li>
                  <strong className="text-se-bone/70">Marketing cookies</strong> (with consent) — Meta
                  Pixel may be used to measure the effectiveness of advertising campaigns. These cookies
                  are only activated with your consent.
                </li>
              </ul>
              <p className="mb-3">
                We honor Global Privacy Control (GPC) and Do Not Track (DNT) signals sent by your browser.
                When a GPC or DNT signal is detected, analytics and marketing cookies are not loaded.
              </p>
              <p>
                You can manage your cookie preferences at any time through our{" "}
                <Link to="/privacy-choices" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  Privacy Choices
                </Link>{" "}
                page or through your browser settings.
              </p>
            </div>

            <div className="divider" />

            {/* 6 — Data Security */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">6. DATA SECURITY</h2>
              <p className="mb-3">
                We implement industry-standard security measures to protect your personal information,
                including:
              </p>
              <ul className="space-y-2 list-disc list-inside mb-3">
                <li>SSL/TLS encryption for all data transmitted between your browser and the Site.</li>
                <li>Secure payment processing through Stripe — no sensitive payment data is stored on our servers.</li>
                <li>Database-level encryption and access controls through Supabase.</li>
                <li>No storage of passwords in plaintext; all credentials are securely hashed.</li>
              </ul>
              <p>
                While we strive to protect your information, no method of transmission over the Internet or
                electronic storage is 100% secure. We cannot guarantee absolute security but are committed
                to promptly addressing any breach in accordance with applicable law.
              </p>
            </div>

            <div className="divider" />

            {/* 7 — Data Retention */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">7. DATA RETENTION</h2>
              <p className="mb-3">
                We retain your personal information only for as long as necessary to fulfill the purposes
                for which it was collected, including:
              </p>
              <ul className="space-y-2 list-disc list-inside mb-3">
                <li>
                  <strong className="text-se-bone/70">Account data:</strong> retained for the lifetime
                  of your account. You may request deletion at any time.
                </li>
                <li>
                  <strong className="text-se-bone/70">Order records:</strong> retained for a minimum of
                  five (5) years for tax, legal, and dispute-resolution purposes.
                </li>
                <li>
                  <strong className="text-se-bone/70">Marketing preferences:</strong> retained until you
                  unsubscribe or request deletion.
                </li>
                <li>
                  <strong className="text-se-bone/70">Usage &amp; analytics data:</strong> aggregated
                  and anonymized data may be retained indefinitely for statistical analysis.
                </li>
              </ul>
              <p>
                When personal data is no longer needed, it is securely deleted or anonymized.
              </p>
            </div>

            <div className="divider" />

            {/* 8 — Your Rights */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">8. YOUR RIGHTS</h2>
              <p className="mb-3">
                Depending on your location, you may have the following rights regarding your personal
                information:
              </p>
              <ul className="space-y-2 list-disc list-inside mb-3">
                <li>
                  <strong className="text-se-bone/70">Right to access:</strong> request a copy of the
                  personal data we hold about you.
                </li>
                <li>
                  <strong className="text-se-bone/70">Right to correction:</strong> request that we
                  update or correct inaccurate information.
                </li>
                <li>
                  <strong className="text-se-bone/70">Right to deletion:</strong> request that we
                  delete your personal data, subject to legal retention requirements.
                </li>
                <li>
                  <strong className="text-se-bone/70">Right to opt out:</strong> opt out of marketing
                  communications at any time by clicking the &ldquo;unsubscribe&rdquo; link in any
                  marketing email or contacting us directly.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  info@styleeternal.com
                </a>.
                We will respond to your request within thirty (30) days.
              </p>
            </div>

            <div className="divider" />

            {/* 9 — Children's Privacy */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">9. CHILDREN&apos;S PRIVACY</h2>
              <p>
                The Site is not intended for children under the age of thirteen (13). We do not knowingly
                collect personal information from children under 13. If we become aware that we have
                inadvertently collected information from a child under 13, we will take steps to delete
                that information as promptly as possible. If you believe a child under 13 has provided us
                with personal information, please contact us at{" "}
                <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  info@styleeternal.com
                </a>.
              </p>
            </div>

            <div className="divider" />

            {/* 10 — California / CCPA Rights */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">10. CALIFORNIA PRIVACY RIGHTS (CCPA)</h2>
              <p className="mb-3">
                If you are a California resident, the California Consumer Privacy Act (CCPA) grants you
                additional rights regarding your personal information:
              </p>
              <ul className="space-y-2 list-disc list-inside mb-3">
                <li>
                  <strong className="text-se-bone/70">Right to know:</strong> you may request that we
                  disclose the categories and specific pieces of personal information we have collected
                  about you, the categories of sources, the business purpose for collection, and the
                  categories of third parties with whom we share it.
                </li>
                <li>
                  <strong className="text-se-bone/70">Right to delete:</strong> you may request deletion
                  of your personal information, subject to certain exceptions under the CCPA.
                </li>
                <li>
                  <strong className="text-se-bone/70">Right to non-discrimination:</strong> we will not
                  discriminate against you for exercising any of your CCPA rights.
                </li>
                <li>
                  <strong className="text-se-bone/70">No sale of personal information:</strong> Style
                  Eternal does not sell personal information as defined by the CCPA.
                </li>
              </ul>
              <p>
                To submit a CCPA request, email us at{" "}
                <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  info@styleeternal.com
                </a>{" "}
                with the subject line &ldquo;CCPA Request.&rdquo; We may ask you to verify your identity
                before processing your request.
              </p>
            </div>

            <div className="divider" />

            {/* 11 — Changes to This Policy */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">11. CHANGES TO THIS POLICY</h2>
              <p>
                Style Eternal reserves the right to update this Privacy Policy at any time. When we make
                changes, we will revise the &ldquo;Last updated&rdquo; date at the top of this page. For
                material changes, we may also notify you via email or a prominent notice on the Site.
                Your continued use of the Site after any changes constitutes your acceptance of the revised
                policy. We encourage you to review this Privacy Policy periodically.
              </p>
            </div>

            <div className="divider" />

            {/* 12 — Contact */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">12. CONTACT</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or the way
                we handle your personal information, please contact us at{" "}
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

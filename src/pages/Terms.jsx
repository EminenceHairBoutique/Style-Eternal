// src/pages/Terms.jsx — Style Eternal
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

export default function Terms() {
  return (
    <>
      <SEO title="Terms & Conditions — Style Eternal" description="Terms and conditions governing your use of styleeternal.com and all purchases from Style Eternal." />

      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">Legal</p>
              <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em]">
                TERMS & CONDITIONS
              </h1>
              <p className="text-[12px] text-se-steel font-accent mt-3">Last updated: April 2026</p>
            </Motion.div>
          </div>
        </section>

        <section className="section-pad">
          <div className="content-wrap max-w-3xl space-y-10 text-[14px] text-se-bone/50 leading-relaxed">

            {/* 1 — Acceptance of Terms */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">1. ACCEPTANCE OF TERMS</h2>
              <p>
                Welcome to styleeternal.com (the &ldquo;Site&rdquo;), operated by Style Eternal LLC
                (&ldquo;Style Eternal,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
                By accessing or using the Site, creating an account, or placing an order, you agree to be
                bound by these Terms &amp; Conditions (&ldquo;Terms&rdquo;). If you do not agree with any
                part of these Terms, you must not use the Site.
              </p>
            </div>

            <div className="divider" />

            {/* 2 — Eligibility */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">2. ELIGIBILITY</h2>
              <p>
                You must be at least eighteen (18) years of age to use this Site or make a purchase. If you
                are between thirteen (13) and seventeen (17) years old, you may use the Site only with the
                involvement and consent of a parent or legal guardian who agrees to be bound by these Terms.
                By using the Site, you represent and warrant that you meet these eligibility requirements.
              </p>
            </div>

            <div className="divider" />

            {/* 3 — Account Responsibilities */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">3. ACCOUNT RESPONSIBILITIES</h2>
              <p className="mb-3">
                When you create an account on the Site, you are responsible for maintaining the confidentiality
                of your login credentials and for all activity that occurs under your account. You agree to:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Update your account information promptly if it changes.</li>
                <li>Notify us immediately at{" "}
                  <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                    info@styleeternal.com
                  </a>{" "}
                  if you suspect unauthorized access to your account.
                </li>
                <li>Not share your account credentials with any third party.</li>
              </ul>
              <p className="mt-3">
                Style Eternal reserves the right to suspend or terminate accounts that violate these Terms
                or that we reasonably believe have been compromised.
              </p>
            </div>

            <div className="divider" />

            {/* 4 — Product Descriptions & Pricing */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">4. PRODUCT DESCRIPTIONS & PRICING</h2>
              <p className="mb-3">
                We make every effort to display our products and their colors, materials, and dimensions as
                accurately as possible. However, the actual appearance of items may vary slightly from images
                on the Site due to differences in monitors and display settings.
              </p>
              <p>
                All prices are listed in United States Dollars (USD) and are subject to change without notice.
                Prices do not include applicable taxes or shipping fees, which are calculated at checkout.
                In the event of a pricing error, Style Eternal reserves the right to cancel any orders placed
                at the incorrect price and will notify you promptly. A price listed on the Site does not
                constitute a binding offer until the order has been confirmed.
              </p>
            </div>

            <div className="divider" />

            {/* 5 — Order Acceptance & Cancellation */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">5. ORDER ACCEPTANCE & CANCELLATION</h2>
              <p className="mb-3">
                Placing an order on the Site constitutes an offer to purchase. All orders are subject to
                acceptance by Style Eternal. We may, at our sole discretion, refuse or cancel any order
                for any reason, including but not limited to:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Product unavailability or inventory errors.</li>
                <li>Pricing or descriptive errors on the Site.</li>
                <li>Suspected fraudulent or unauthorized activity.</li>
                <li>Orders that exceed reasonable personal-use quantities.</li>
              </ul>
              <p className="mt-3">
                If your order is cancelled after payment has been processed, a full refund will be issued to
                your original payment method. You may request cancellation of an order before it has shipped
                by contacting us at{" "}
                <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  info@styleeternal.com
                </a>.
                Once an order has shipped, it cannot be cancelled and must be handled through our returns process.
              </p>
            </div>

            <div className="divider" />

            {/* 6 — Payment Terms */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">6. PAYMENT TERMS</h2>
              <p className="mb-3">
                All payments are processed securely through Stripe, a PCI-DSS Level 1 certified payment
                processor. Style Eternal does not store, process, or have access to your full credit card
                number, expiration date, or CVV. We accept major credit cards, debit cards, and other payment
                methods as displayed at checkout.
              </p>
              <p>
                By submitting an order, you represent that you are authorized to use the selected payment
                method and that the billing information you provide is accurate. You agree to pay the total
                amount of your order, including product price, applicable taxes, and shipping fees. If your
                payment method is declined or cannot be verified, we reserve the right to cancel your order.
              </p>
            </div>

            <div className="divider" />

            {/* 7 — Shipping */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">7. SHIPPING</h2>
              <p className="mb-3">
                Style Eternal currently ships to addresses within the United States only. Orders are processed
                within one (1) to three (3) business days after payment confirmation. Estimated delivery times
                are provided at checkout and begin after the order has been processed and shipped.
              </p>
              <p className="mb-3">
                Shipping times are estimates and are not guaranteed. Style Eternal is not responsible for
                delays caused by shipping carriers, weather events, customs processing, or other circumstances
                beyond our control. Risk of loss and title to products pass to you upon delivery to the carrier.
              </p>
              <p>
                If your order arrives damaged or with missing items, please contact us within seven (7) days
                of delivery at{" "}
                <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  info@styleeternal.com
                </a>{" "}
                with photos of the damage and your order number.
              </p>
            </div>

            <div className="divider" />

            {/* 8 — Returns & Exchanges */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">8. RETURNS & EXCHANGES</h2>
              <p className="mb-3">
                We offer a thirty (30) day return policy from the date of delivery. To be eligible for a
                return, items must be unworn, unwashed, free of odors and pet dander, and in their original
                condition with all tags attached. Items must be returned in the original packaging where
                provided.
              </p>
              <p className="mb-3">
                The following items are <strong className="text-se-bone/70">not eligible</strong> for return or exchange:
              </p>
              <ul className="space-y-2 list-disc list-inside mb-3">
                <li>Limited-edition or collaboration pieces.</li>
                <li>Items marked as &ldquo;Final Sale.&rdquo;</li>
                <li>Gift cards.</li>
                <li>Items that have been worn, altered, or damaged by the customer.</li>
              </ul>
              <p>
                For full details and to initiate a return, please visit our{" "}
                <Link to="/returns" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  Returns &amp; Exchanges
                </Link>{" "}
                page. Return shipping costs are the responsibility of the customer unless the return is due to
                a Style Eternal error (e.g., incorrect or defective item).
              </p>
            </div>

            <div className="divider" />

            {/* 9 — Intellectual Property */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">9. INTELLECTUAL PROPERTY</h2>
              <p className="mb-3">
                All content on the Site — including but not limited to designs, graphics, illustrations,
                photographs, text, logos, brand marks, product names, slogans, and the overall look and feel
                of the Site — is the exclusive property of Style Eternal LLC or its licensors and is protected
                by United States and international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works from, publicly display,
                or otherwise use any of our intellectual property without prior written permission from
                Style Eternal. Unauthorized use may result in legal action.
              </p>
            </div>

            <div className="divider" />

            {/* 10 — User-Generated Content */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">10. USER-GENERATED CONTENT</h2>
              <p className="mb-3">
                By submitting any content to the Site — including reviews, photos, comments, or social media
                posts tagged with our brand — you grant Style Eternal a non-exclusive, worldwide, royalty-free,
                perpetual, irrevocable license to use, reproduce, modify, publish, translate, distribute,
                and display such content in any media for marketing and promotional purposes.
              </p>
              <p>
                You represent that you own or have the necessary rights to the content you submit and that
                it does not infringe on the intellectual property rights, privacy rights, or any other rights
                of any third party. Style Eternal reserves the right to remove any user-generated content
                at our sole discretion.
              </p>
            </div>

            <div className="divider" />

            {/* 11 — Limitation of Liability */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">11. LIMITATION OF LIABILITY</h2>
              <p className="mb-3">
                To the fullest extent permitted by applicable law, Style Eternal, its officers, directors,
                employees, agents, and affiliates shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages — including but not limited to loss of profits, data, or
                goodwill — arising out of or in connection with your use of the Site, your inability to use
                the Site, or any products purchased through the Site, regardless of the theory of liability.
              </p>
              <p>
                In no event shall Style Eternal&rsquo;s total liability exceed the amount you paid for the
                specific product or order giving rise to the claim. Some jurisdictions do not allow the
                exclusion or limitation of certain damages; in such jurisdictions, our liability shall be
                limited to the greatest extent permitted by law.
              </p>
            </div>

            <div className="divider" />

            {/* 12 — Indemnification */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">12. INDEMNIFICATION</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Style Eternal, its officers, directors,
                employees, agents, and affiliates from and against any and all claims, liabilities, damages,
                losses, costs, and expenses (including reasonable attorneys&rsquo; fees) arising out of or
                related to your use of the Site, your violation of these Terms, your violation of any
                applicable law, or your infringement of any third-party rights.
              </p>
            </div>

            <div className="divider" />

            {/* 13 — Governing Law */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">13. GOVERNING LAW</h2>
              <p>
                These Terms and any disputes arising out of or related to them or the Site shall be governed
                by and construed in accordance with the laws of the State of New Jersey, United States,
                without regard to its conflict-of-law principles. You consent to the exclusive jurisdiction
                and venue of the state and federal courts located in the State of New Jersey for the
                resolution of any such disputes.
              </p>
            </div>

            <div className="divider" />

            {/* 14 — Dispute Resolution */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">14. DISPUTE RESOLUTION</h2>
              <p className="mb-3">
                Before initiating any formal legal proceedings, you agree to first contact us at{" "}
                <a href="mailto:info@styleeternal.com" className="text-se-bone/70 underline underline-offset-4 hover:text-se-bone transition">
                  info@styleeternal.com
                </a>{" "}
                and attempt to resolve the dispute informally for at least thirty (30) days. If the dispute
                cannot be resolved informally, either party may pursue resolution through binding arbitration
                administered under the rules of the American Arbitration Association, conducted in the State
                of New Jersey.
              </p>
              <p>
                You agree that any arbitration or legal proceeding shall be conducted on an individual basis
                and not as a class action, class arbitration, or any other representative proceeding. You
                waive any right to participate in a class action lawsuit or class-wide arbitration against
                Style Eternal.
              </p>
            </div>

            <div className="divider" />

            {/* 15 — Severability */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">15. SEVERABILITY</h2>
              <p>
                If any provision of these Terms is found by a court of competent jurisdiction to be invalid,
                illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
                The invalid or unenforceable provision shall be modified to the minimum extent necessary to
                make it valid and enforceable while preserving the original intent of the provision.
              </p>
            </div>

            <div className="divider" />

            {/* 16 — Modifications to Terms */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">16. MODIFICATIONS TO TERMS</h2>
              <p>
                Style Eternal reserves the right to update or modify these Terms at any time without prior
                notice. Changes become effective immediately upon posting to the Site. The &ldquo;Last
                updated&rdquo; date at the top of this page reflects when the Terms were most recently revised.
                Your continued use of the Site after any changes constitutes your acceptance of the revised
                Terms. We encourage you to review these Terms periodically.
              </p>
            </div>

            <div className="divider" />

            {/* 17 — Contact */}
            <div>
              <h2 className="font-display text-[16px] tracking-[0.12em] mb-4 text-se-bone/80">17. CONTACT</h2>
              <p>
                If you have any questions, concerns, or requests regarding these Terms &amp; Conditions,
                please contact us at{" "}
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

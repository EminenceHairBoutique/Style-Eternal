/**
 * generate-content-seed.mjs
 * One-time generator: converts the hardcoded storefront page content into the
 * CMS block format and emits an idempotent SQL seed for page_content.
 *
 * Run: node scripts/generate-content-seed.mjs
 * Output: supabase/migrations/<timestamp>_seed_page_content.sql
 *
 * The blocks here are transcribed faithfully from the hardcoded JSX in
 * src/pages/{Faqs,Terms,Privacy,About,Returns,Shipping}.jsx. Emphasis that was
 * <strong> becomes **bold**; internal links become [text](/path). Emails are
 * kept as plain text (BlockRenderer only linkifies http(s)/relative URLs).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

// Block builder with stable per-page ids.
function builder(pageKey) {
  let i = 0;
  const id = () => `${pageKey}-${i++}`;
  return {
    h: (text, level = 2) => ({ id: id(), type: "heading", data: { text, level } }),
    p: (text) => ({ id: id(), type: "paragraph", data: { text } }),
    ul: (items) => ({ id: id(), type: "list", data: { style: "bullet", items } }),
    hr: () => ({ id: id(), type: "divider", data: {} }),
    acc: (items) => ({ id: id(), type: "accordion", data: { items } }),
  };
}

/* ───────────────────────── FAQ ───────────────────────── */
const FAQS = [
  { category: "Orders & Shipping", items: [
    { q: "How long does shipping take?", a: "Standard shipping is 5–7 business days. Expedited shipping delivers in 2–3 business days, and priority shipping arrives within 1–2 business days. Expedited and priority options are available at checkout." },
    { q: "Do you ship internationally?", a: "Not yet — but we're working on it. International shipping is coming soon. Sign up for our newsletter to be the first to know when it launches." },
    { q: "How do I track my order?", a: "You'll receive a tracking email with carrier details as soon as your order ships. You can also check order status anytime from your account dashboard." },
    { q: "Can I change or cancel my order?", a: "Orders are processed quickly. Contact us within 1 hour of placing your order at info@styleeternal.com and we'll do our best to accommodate changes or cancellations." },
    { q: "How long does processing take?", a: "Orders are processed within 1–3 business days before shipping. During high-volume drops, processing may take an additional day." },
    { q: "Is there a free shipping threshold?", a: "Yes — free standard shipping on all orders over $150. No codes needed, it's applied automatically at checkout." },
  ]},
  { category: "Products", items: [
    { q: "What sizes do you carry and how do they fit?", a: "Tops run S through XXL. Bottoms run 28–38. Most pieces are cut in an oversized or relaxed fit — that's the Style Eternal signature. Check the fit note on each product page. When in doubt, size down for a less relaxed silhouette." },
    { q: "Are your garments pre-shrunk?", a: "All garment-washed pieces are pre-shrunk. Follow the care instructions on the label to maintain the intended fit and feel over time." },
    { q: "What does 'Limited' mean?", a: "Limited pieces are produced in intentionally small quantities. Once they sell out, they're gone — no restocks. They move to the Archive as a permanent record of the drop." },
    { q: "What fabric weights do you use?", a: "Our tees are 280gsm+ heavyweight cotton. Hoodies and outerwear are 400gsm+ French terry or fleece. We don't do thin basics — everything has real substance." },
    { q: "How should I care for printed pieces?", a: "Turn the garment inside out and wash cold on a gentle cycle. Hang dry or tumble dry on low heat. Avoid ironing directly on prints to preserve the design." },
  ]},
  { category: "Returns & Exchanges", items: [
    { q: "What is your return policy?", a: "We accept returns on unworn items with tags attached within 30 days of delivery. Items must be in original condition — no wear, wash, or alterations." },
    { q: "How do I initiate a return?", a: "Email info@styleeternal.com with your order number and reason for the return. We'll send you a prepaid return label within 24 hours." },
    { q: "How do exchanges work?", a: "Contact us and we'll help you swap sizes or colorways, subject to availability. Your first exchange on any order is free." },
    { q: "What if my item arrives damaged?", a: "Contact us at info@styleeternal.com with photos of the damage. We'll arrange a full replacement or refund — no need to return the damaged item." },
    { q: "How long until I receive my refund?", a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. Your original payment method will be credited." },
  ]},
  { category: "Drops & Collections", items: [
    { q: "When is the next drop?", a: "Drop dates are announced through our newsletter and social channels first. Subscribe to get notified before anything goes live." },
    { q: "How do I get notified about new releases?", a: "Sign up for the Style Eternal newsletter at shopstyleeternal.com. Subscribers always get early access and first notice on upcoming drops." },
    { q: "Will sold-out items ever restock?", a: "Limited drops don't restock — that's what makes them limited. Once they sell out, they move to the Archive as a permanent record. Core collection items may be replenished." },
    { q: "What is the Archive?", a: "The Archive is a record of every past release. It preserves the history of each collection and drop, even after items have sold out." },
  ]},
  { category: "Account & Rewards", items: [
    { q: "How do I join the rewards program?", a: "Create an account on shopstyleeternal.com and you're automatically enrolled. No extra steps — start earning from your first purchase." },
    { q: "How do reward tiers work?", a: "There are four tiers based on total spend: Foundation, Established, Permanent, and Eternal. Each tier unlocks better perks, from early access to exclusive drops." },
    { q: "Do my points expire?", a: "No — your points never expire. They stay in your account as long as it's active." },
    { q: "How do I earn points?", a: "You earn 1 point for every dollar spent. Points accrue automatically with each completed order." },
  ]},
  { category: "Brand", items: [
    { q: "Where is Style Eternal based?", a: "New Jersey. Every piece is designed here. It's where we come from and it shows in everything we make." },
    { q: "Do you do collaborations?", a: "We're open to the right partnerships — artists, makers, and community voices that align with our values. Reach out via the contact page." },
    { q: "What does EST. 2021 mean?", a: "2021 is the year Style Eternal was founded. It marks the beginning of the brand and everything we've built since." },
  ]},
];

function faqBlocks() {
  const b = builder("faq");
  const out = [];
  for (const cat of FAQS) {
    out.push(b.h(cat.category, 2));
    out.push(b.acc(cat.items.map((it) => ({ q: it.q, a: it.a }))));
  }
  return out;
}

/* ───────────────────────── TOS ───────────────────────── */
function tosBlocks() {
  const b = builder("tos");
  const o = [];
  o.push(b.h("1. ACCEPTANCE OF TERMS"));
  o.push(b.p("Welcome to shopstyleeternal.com (the “Site”), operated by Style Eternal LLC (“Style Eternal,” “we,” “us,” or “our”). By accessing or using the Site, creating an account, or placing an order, you agree to be bound by these Terms & Conditions (“Terms”). If you do not agree with any part of these Terms, you must not use the Site."));
  o.push(b.h("2. ELIGIBILITY"));
  o.push(b.p("You must be at least eighteen (18) years of age to use this Site or make a purchase. If you are between thirteen (13) and seventeen (17) years old, you may use the Site only with the involvement and consent of a parent or legal guardian who agrees to be bound by these Terms. By using the Site, you represent and warrant that you meet these eligibility requirements."));
  o.push(b.h("3. ACCOUNT RESPONSIBILITIES"));
  o.push(b.p("When you create an account on the Site, you are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to:"));
  o.push(b.ul([
    "Provide accurate, current, and complete information during registration.",
    "Update your account information promptly if it changes.",
    "Notify us immediately at info@styleeternal.com if you suspect unauthorized access to your account.",
    "Not share your account credentials with any third party.",
  ]));
  o.push(b.p("Style Eternal reserves the right to suspend or terminate accounts that violate these Terms or that we reasonably believe have been compromised."));
  o.push(b.h("4. PRODUCT DESCRIPTIONS & PRICING"));
  o.push(b.p("We make every effort to display our products and their colors, materials, and dimensions as accurately as possible. However, the actual appearance of items may vary slightly from images on the Site due to differences in monitors and display settings."));
  o.push(b.p("All prices are listed in United States Dollars (USD) and are subject to change without notice. Prices do not include applicable taxes or shipping fees, which are calculated at checkout. In the event of a pricing error, Style Eternal reserves the right to cancel any orders placed at the incorrect price and will notify you promptly. A price listed on the Site does not constitute a binding offer until the order has been confirmed."));
  o.push(b.h("5. ORDER ACCEPTANCE & CANCELLATION"));
  o.push(b.p("Placing an order on the Site constitutes an offer to purchase. All orders are subject to acceptance by Style Eternal. We may, at our sole discretion, refuse or cancel any order for any reason, including but not limited to:"));
  o.push(b.ul([
    "Product unavailability or inventory errors.",
    "Pricing or descriptive errors on the Site.",
    "Suspected fraudulent or unauthorized activity.",
    "Orders that exceed reasonable personal-use quantities.",
  ]));
  o.push(b.p("If your order is cancelled after payment has been processed, a full refund will be issued to your original payment method. You may request cancellation of an order before it has shipped by contacting us at info@styleeternal.com. Once an order has shipped, it cannot be cancelled and must be handled through our returns process."));
  o.push(b.h("6. PAYMENT TERMS"));
  o.push(b.p("All payments are processed securely through Stripe, a PCI-DSS Level 1 certified payment processor. Style Eternal does not store, process, or have access to your full credit card number, expiration date, or CVV. We accept major credit cards, debit cards, and other payment methods as displayed at checkout."));
  o.push(b.p("By submitting an order, you represent that you are authorized to use the selected payment method and that the billing information you provide is accurate. You agree to pay the total amount of your order, including product price, applicable taxes, and shipping fees. If your payment method is declined or cannot be verified, we reserve the right to cancel your order."));
  o.push(b.h("7. SHIPPING"));
  o.push(b.p("Style Eternal currently ships to addresses within the United States only. Orders are processed within one (1) to three (3) business days after payment confirmation. Estimated delivery times are provided at checkout and begin after the order has been processed and shipped."));
  o.push(b.p("Shipping times are estimates and are not guaranteed. Style Eternal is not responsible for delays caused by shipping carriers, weather events, customs processing, or other circumstances beyond our control. Risk of loss and title to products pass to you upon delivery to the carrier."));
  o.push(b.p("If your order arrives damaged or with missing items, please contact us within seven (7) days of delivery at info@styleeternal.com with photos of the damage and your order number."));
  o.push(b.h("8. RETURNS & EXCHANGES"));
  o.push(b.p("We offer a thirty (30) day return policy from the date of delivery. To be eligible for a return, items must be unworn, unwashed, free of odors and pet hair, and in their original condition with all tags attached. Items must be returned in the original packaging where provided."));
  o.push(b.p("The following items are **not eligible** for return or exchange:"));
  o.push(b.ul([
    "Limited-edition or collaboration pieces.",
    "Items marked as “Final Sale.”",
    "Gift cards.",
    "Items that have been worn, altered, or damaged by the customer.",
  ]));
  o.push(b.p("For full details and to initiate a return, please visit our [Returns & Exchanges](/returns) page. Return shipping costs are the responsibility of the customer unless the return is due to a Style Eternal error (e.g., incorrect or defective item)."));
  o.push(b.h("9. INTELLECTUAL PROPERTY"));
  o.push(b.p("All content on the Site — including but not limited to designs, graphics, illustrations, photographs, text, logos, brand marks, product names, slogans, and the overall look and feel of the Site — is the exclusive property of Style Eternal LLC or its licensors and is protected by United States and international copyright, trademark, and other intellectual property laws."));
  o.push(b.p("You may not reproduce, distribute, modify, create derivative works from, publicly display, or otherwise use any of our intellectual property without prior written permission from Style Eternal. Unauthorized use may result in legal action."));
  o.push(b.h("10. USER-GENERATED CONTENT"));
  o.push(b.p("By submitting any content to the Site — including reviews, photos, comments, or social media posts tagged with our brand — you grant Style Eternal a non-exclusive, worldwide, royalty-free, perpetual, irrevocable license to use, reproduce, modify, publish, translate, distribute, and display such content in any media for marketing and promotional purposes."));
  o.push(b.p("You represent that you own or have the necessary rights to the content you submit and that it does not infringe on the intellectual property rights, privacy rights, or any other rights of any third party. Style Eternal reserves the right to remove any user-generated content at our sole discretion."));
  o.push(b.h("11. LIMITATION OF LIABILITY"));
  o.push(b.p("To the fullest extent permitted by applicable law, Style Eternal, its officers, directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to loss of profits, data, or goodwill — arising out of or in connection with your use of the Site, your inability to use the Site, or any products purchased through the Site, regardless of the theory of liability."));
  o.push(b.p("In no event shall Style Eternal's total liability exceed the amount you paid for the specific product or order giving rise to the claim. Some jurisdictions do not allow the exclusion or limitation of certain damages; in such jurisdictions, our liability shall be limited to the greatest extent permitted by law."));
  o.push(b.h("12. INDEMNIFICATION"));
  o.push(b.p("You agree to indemnify, defend, and hold harmless Style Eternal, its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to your use of the Site, your violation of these Terms, your violation of any applicable law, or your infringement of any third-party rights."));
  o.push(b.h("13. GOVERNING LAW"));
  o.push(b.p("These Terms and any disputes arising out of or related to them or the Site shall be governed by and construed in accordance with the laws of the State of New Jersey, United States, without regard to its conflict-of-law principles. You consent to the exclusive jurisdiction and venue of the state and federal courts located in the State of New Jersey for the resolution of any such disputes."));
  o.push(b.h("14. DISPUTE RESOLUTION"));
  o.push(b.p("Before initiating any formal legal proceedings, you agree to first contact us at info@styleeternal.com and attempt to resolve the dispute informally for at least thirty (30) days. If the dispute cannot be resolved informally, either party may pursue resolution through binding arbitration administered under the rules of the American Arbitration Association, conducted in the State of New Jersey."));
  o.push(b.p("You agree that any arbitration or legal proceeding shall be conducted on an individual basis and not as a class action, class arbitration, or any other representative proceeding. You waive any right to participate in a class action lawsuit or class-wide arbitration against Style Eternal."));
  o.push(b.h("15. SEVERABILITY"));
  o.push(b.p("If any provision of these Terms is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent of the provision."));
  o.push(b.h("16. MODIFICATIONS TO TERMS"));
  o.push(b.p("Style Eternal reserves the right to update or modify these Terms at any time without prior notice. Changes become effective immediately upon posting to the Site. The “Last updated” date at the top of this page reflects when the Terms were most recently revised. Your continued use of the Site after any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically."));
  o.push(b.h("17. CONTACT"));
  o.push(b.p("If you have any questions, concerns, or requests regarding these Terms & Conditions, please contact us at info@styleeternal.com."));
  return o;
}

/* ───────────────────────── PRIVACY ───────────────────────── */
function privacyBlocks() {
  const b = builder("privacy");
  const o = [];
  o.push(b.h("1. OVERVIEW"));
  o.push(b.p("Style Eternal LLC (“Style Eternal,” “we,” “us,” or “our”) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit shopstyleeternal.com (the “Site”), create an account, make a purchase, or interact with us. By using the Site, you consent to the practices described in this policy."));
  o.push(b.h("2. INFORMATION WE COLLECT"));
  o.push(b.p("**Information You Provide**"));
  o.push(b.ul([
    "**Account & order information:** name, email address, shipping address, and phone number when you create an account or place an order.",
    "**Payment information:** credit/debit card details are collected and processed directly by Stripe. Style Eternal does not store, access, or retain your full card number, expiration date, or CVV.",
    "**Newsletter subscription:** email address when you opt in to marketing communications.",
    "**Customer communications:** any information you provide when contacting customer support or submitting reviews.",
  ]));
  o.push(b.p("**Information Collected Automatically**"));
  o.push(b.ul([
    "**Usage data:** pages visited, time spent on pages, referral URLs, browser type, operating system, and device information.",
    "**Cookies & similar technologies:** we use cookies to operate the Site, analyze traffic, and deliver relevant content. See Section 5 for details.",
    "**IP address:** collected automatically by our hosting provider for security and analytics purposes.",
  ]));
  o.push(b.h("3. HOW WE USE YOUR INFORMATION"));
  o.push(b.p("We use the information we collect for the following purposes:"));
  o.push(b.ul([
    "**Order fulfillment:** processing, shipping, and delivering your orders; sending order confirmations, shipping updates, and delivery notifications.",
    "**Account management:** creating and maintaining your account, authenticating logins, and managing your profile.",
    "**Marketing communications:** sending promotional emails, product announcements, and exclusive offers — only with your explicit consent. You may unsubscribe at any time.",
    "**Site improvement:** analyzing usage patterns to improve the shopping experience, site performance, and product offerings.",
    "**Fraud prevention & security:** detecting and preventing fraudulent transactions, unauthorized access, and other illegal activities.",
    "**Legal compliance:** fulfilling legal obligations and responding to lawful requests from public authorities.",
  ]));
  o.push(b.h("4. INFORMATION SHARING"));
  o.push(b.p("Style Eternal does **not** sell, rent, or trade your personal information to third parties. We share your data only with the following trusted service providers who assist us in operating the Site and fulfilling orders:"));
  o.push(b.ul([
    "**Stripe** — payment processing. Stripe processes your payment information in accordance with their own privacy policy.",
    "**Resend** — transactional and marketing email delivery.",
    "**Vercel** — website hosting and serverless function execution.",
    "**Supabase** — database and authentication infrastructure.",
  ]));
  o.push(b.p("Each service provider is contractually obligated to protect your information and use it only for the specific services they provide to us. We may also disclose information when required by law, to respond to legal process, or to protect the rights, property, or safety of Style Eternal and its customers."));
  o.push(b.h("5. COOKIES & TRACKING TECHNOLOGIES"));
  o.push(b.p("We use cookies and similar technologies to enhance your experience on the Site. The cookies we use fall into the following categories:"));
  o.push(b.ul([
    "**Necessary cookies** (always active) — essential for Site functionality, including authentication, cart persistence, and security features. These cannot be disabled.",
    "**Analytics cookies** (with consent) — Google Analytics 4 (GA4) is used to understand how visitors interact with the Site. These cookies are only activated with your consent.",
    "**Marketing cookies** (with consent) — Meta Pixel may be used to measure the effectiveness of advertising campaigns. These cookies are only activated with your consent.",
  ]));
  o.push(b.p("We honor Global Privacy Control (GPC) and Do Not Track (DNT) signals sent by your browser. When a GPC or DNT signal is detected, analytics and marketing cookies are not loaded."));
  o.push(b.p("You can manage your cookie preferences at any time through our [Privacy Choices](/privacy-choices) page or through your browser settings."));
  o.push(b.h("6. DATA SECURITY"));
  o.push(b.p("We implement industry-standard security measures to protect your personal information, including:"));
  o.push(b.ul([
    "SSL/TLS encryption for all data transmitted between your browser and the Site.",
    "Secure payment processing through Stripe — no sensitive payment data is stored on our servers.",
    "Database-level encryption and access controls through Supabase.",
    "No storage of passwords in plaintext; all credentials are securely hashed.",
  ]));
  o.push(b.p("While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to promptly addressing any breach in accordance with applicable law."));
  o.push(b.h("7. DATA RETENTION"));
  o.push(b.p("We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including:"));
  o.push(b.ul([
    "**Account data:** retained for the lifetime of your account. You may request deletion at any time.",
    "**Order records:** retained for a minimum of five (5) years for tax, legal, and dispute-resolution purposes.",
    "**Marketing preferences:** retained until you unsubscribe or request deletion.",
    "**Usage & analytics data:** aggregated and anonymized data may be retained indefinitely for statistical analysis.",
  ]));
  o.push(b.p("When personal data is no longer needed, it is securely deleted or anonymized."));
  o.push(b.h("8. YOUR RIGHTS"));
  o.push(b.p("Depending on your location, you may have the following rights regarding your personal information:"));
  o.push(b.ul([
    "**Right to access:** request a copy of the personal data we hold about you.",
    "**Right to correction:** request that we update or correct inaccurate information.",
    "**Right to deletion:** request that we delete your personal data, subject to legal retention requirements.",
    "**Right to opt out:** opt out of marketing communications at any time by clicking the “unsubscribe” link in any marketing email or contacting us directly.",
  ]));
  o.push(b.p("To exercise any of these rights, please contact us at info@styleeternal.com. We will respond to your request within thirty (30) days."));
  o.push(b.h("9. CHILDREN'S PRIVACY"));
  o.push(b.p("The Site is not intended for children under the age of thirteen (13). We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected information from a child under 13, we will take steps to delete that information as promptly as possible. If you believe a child under 13 has provided us with personal information, please contact us at info@styleeternal.com."));
  o.push(b.h("10. CALIFORNIA PRIVACY RIGHTS (CCPA)"));
  o.push(b.p("If you are a California resident, the California Consumer Privacy Act (CCPA) grants you additional rights regarding your personal information:"));
  o.push(b.ul([
    "**Right to know:** you may request that we disclose the categories and specific pieces of personal information we have collected about you, the categories of sources, the business purpose for collection, and the categories of third parties with whom we share it.",
    "**Right to delete:** you may request deletion of your personal information, subject to certain exceptions under the CCPA.",
    "**Right to non-discrimination:** we will not discriminate against you for exercising any of your CCPA rights.",
    "**No sale of personal information:** Style Eternal does not sell personal information as defined by the CCPA.",
  ]));
  o.push(b.p("To submit a CCPA request, email us at info@styleeternal.com with the subject line “CCPA Request.” We may ask you to verify your identity before processing your request."));
  o.push(b.h("11. CHANGES TO THIS POLICY"));
  o.push(b.p("Style Eternal reserves the right to update this Privacy Policy at any time. When we make changes, we will revise the “Last updated” date at the top of this page. For material changes, we may also notify you via email or a prominent notice on the Site. Your continued use of the Site after any changes constitutes your acceptance of the revised policy. We encourage you to review this Privacy Policy periodically."));
  o.push(b.h("12. CONTACT"));
  o.push(b.p("If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your personal information, please contact us at info@styleeternal.com."));
  return o;
}

/* ───────────────────────── ABOUT ───────────────────────── */
function aboutBlocks() {
  const b = builder("about");
  const o = [];
  o.push(b.h("THE STORY"));
  o.push(b.p("Style Eternal didn't start with a business plan. It started with a feeling — that what you wear carries weight, and the right piece can make you feel permanent in a world that forgets fast."));
  o.push(b.h("WHERE WE STARTED"));
  o.push(b.p("We came up in New Jersey — concrete, cold mornings, corner-store runs. Style wasn't optional where we're from. It was how you told the world you still gave a damn. That energy is the foundation of everything we build."));
  o.push(b.h("THE CRAFT"));
  o.push(b.p("280gsm tees. 400gsm hoodies. Every piece starts with fabric that has real weight — because cheap material falls apart and we don't make disposable clothing."));
  o.push(b.p("We garment-wash for character, screen-print for durability, and cut oversized because that's how streetwear actually lives on a body. No shortcuts on construction. No compromises on feel."));
  o.push(b.h("FOUNDER'S NOTE"));
  o.push(b.p("“I didn't start this brand to follow the industry. I started it because the streets I grew up on deserve a label that takes them seriously. Every piece we make carries that weight.” — Chino, Founder"));
  o.push(b.h("THE STANDARD"));
  o.push(b.p("**Heavyweight Materials** — 280–400gsm fabrics. French terry. Combed cotton. Canvas. Nothing lightweight. Nothing disposable."));
  o.push(b.p("**Built-In Character** — Garment-washed finishes. Distressed treatments. Every piece feels broken in, not brand new."));
  o.push(b.p("**Real Graphics** — Screen-printed and embroidered. Every design references a place, a memory, or a principle."));
  o.push(b.p("**Intentional Fit** — Oversized and relaxed cuts that honor how streetwear actually moves on a body."));
  o.push(b.h("THE VISION"));
  o.push(b.p("Style Eternal is built on permanence over trend. We design pieces that carry emotional weight — graphics rooted in love, death, and rebirth. The symbols mean something. The work outlasts the season."));
  o.push(b.p("This isn't fast fashion with a streetwear skin. Every collection is a statement about what deserves to endure. We make clothes for people who feel something when they get dressed."));
  return o;
}

/* ───────────────────────── RETURNS ───────────────────────── */
function returnsBlocks() {
  const b = builder("returns");
  const o = [];
  o.push(b.p("We stand behind everything we make. If something isn't right, we'll make it right — no hassle, no runaround."));
  o.push(b.h("AT A GLANCE"));
  o.push(b.ul([
    "**30-Day Window** — from delivery date.",
    "**Free First Exchange** — size or color swap.",
    "**Full Refund** — to original payment method.",
    "**5–7 Days** — refund processing time.",
  ]));
  o.push(b.h("RETURN ELIGIBILITY"));
  o.push(b.p("We accept returns within **30 days of delivery**. To qualify, items must meet all of the following conditions:"));
  o.push(b.ul([
    "Unworn and unwashed.",
    "Unaltered — no tailoring, hemming, or modifications.",
    "All original tags still attached.",
    "Original packaging preferred (branded bag, tissue wrap, etc.).",
  ]));
  o.push(b.h("HOW TO START A RETURN"));
  o.push(b.p("Email us at info@styleeternal.com with your **order number** and **reason for return**. Our team will respond within 24 hours with a prepaid return shipping label."));
  o.push(b.p("Pack the item securely — original packaging is preferred but not required — and drop it off at any carrier location. Once we receive and inspect the item, your refund will be processed within **5–7 business days** to your original payment method."));
  o.push(b.h("RETURN PROCESS"));
  o.push(b.ul([
    "**Email Us** — send your order number and reason to info@styleeternal.com.",
    "**Receive Label** — we'll send a prepaid return label within 24 hours.",
    "**Ship Back** — pack the item and drop it off at any carrier location.",
    "**Refund Processed** — refund issued within 5–7 business days after inspection.",
  ]));
  o.push(b.h("REFUND DETAILS"));
  o.push(b.p("Refunds are issued to your **original payment method** within **5–7 business days** after we receive and inspect the returned item. Please allow an additional 3–5 business days for the refund to appear on your statement, depending on your bank or card issuer."));
  o.push(b.h("EXCHANGES"));
  o.push(b.p("Need a different size or colorway? Email us at info@styleeternal.com with your order number and the size or color you'd like instead. We'll check availability and arrange the swap."));
  o.push(b.p("Your **first exchange is free** — no extra shipping charges. Subsequent exchanges are subject to standard return shipping costs."));
  o.push(b.p("Exchanges are subject to availability. If your desired item is out of stock, we'll issue a full refund instead."));
  o.push(b.h("RETURN SHIPPING"));
  o.push(b.ul([
    "**Domestic (US)** — prepaid label provided.",
    "**International** — customer pays return shipping.",
  ]));
  o.push(b.h("DAMAGED OR INCORRECT ORDERS"));
  o.push(b.p("Received a damaged or incorrect item? [Contact us](/client-services) immediately with your order number and **photos of the issue**. We'll arrange a full replacement or refund — no return needed in most cases."));
  o.push(b.p("Please report any issues within 48 hours of delivery for fastest resolution."));
  o.push(b.h("EXCEPTIONS"));
  o.push(b.ul([
    "**Final Sale items** — not eligible for returns or exchanges. All sales are final.",
    "**Limited Edition / Sold Out pieces** — non-returnable once purchased due to limited availability.",
    "**Pre-order items** — may have different return windows; check the product page for specific terms.",
    "**Custom or made-to-order items** — non-returnable. Custom pieces are final sale.",
  ]));
  return o;
}

/* ───────────────────────── SHIPPING ───────────────────────── */
function shippingBlocks() {
  const b = builder("shipping");
  const o = [];
  o.push(b.p("Every order is handled with care — custom packed, sealed, and shipped to your door. Currently shipping within the United States only."));
  o.push(b.h("SHIPPING OPTIONS"));
  o.push(b.ul([
    "**Standard Shipping** — 5–7 business days. Free on orders over $150 ($8.95 for orders under $150).",
    "**Expedited Shipping** — 2–3 business days. $14.95, available at checkout.",
    "**Priority Shipping** — 1–2 business days. $24.95, signature required on delivery.",
  ]));
  o.push(b.h("ORDER PROCESSING"));
  o.push(b.p("Orders are processed within **1–3 business days**. You will receive a confirmation email with tracking information once your order ships."));
  o.push(b.p("Orders placed after **2:00 PM EST** or on weekends and holidays will begin processing the next business day."));
  o.push(b.h("TRACKING YOUR ORDER"));
  o.push(b.p("Once your order ships, you will receive an email with a **tracking number** and a link to follow your package in real time."));
  o.push(b.p("You can also check order status anytime from your [account page](/account)."));
  o.push(b.h("PACKAGING"));
  o.push(b.p("Every order is packed in custom branded packaging — tissue-wrapped, sealed, and shipped in reinforced mailers or boxes to ensure your pieces arrive in pristine condition."));
  o.push(b.h("PRE-ORDERS"));
  o.push(b.p("Pre-order items ship within the lead time stated on the product page. You will receive a shipping confirmation with tracking once your pre-order item is dispatched."));
  o.push(b.p("If your order contains both in-stock and pre-order items, they may ship separately at no additional cost."));
  o.push(b.h("P.O. BOXES"));
  o.push(b.p("We do ship to P.O. boxes — however, only **standard shipping** is available for P.O. box addresses. Expedited and priority shipping require a physical street address."));
  o.push(b.h("INTERNATIONAL SHIPPING"));
  o.push(b.p("Style Eternal currently ships within the **United States only**. International shipping is coming soon. Sign up for our newsletter to be the first to know when we expand."));
  o.push(b.h("LOST OR DAMAGED PACKAGES"));
  o.push(b.p("If your package is lost, stolen, or arrives damaged, [contact us](/client-services) immediately with your order number. We'll open an investigation and work to resolve the issue as quickly as possible — whether that means reshipping your order or issuing a full refund."));
  return o;
}

/* ───────────────────────── EMIT SQL ───────────────────────── */
const PAGES = [
  { page_key: "faq", title: "FAQ", blocks: faqBlocks() },
  { page_key: "tos", title: "Terms of Service", blocks: tosBlocks() },
  { page_key: "privacy", title: "Privacy Policy", blocks: privacyBlocks() },
  { page_key: "about", title: "About", blocks: aboutBlocks() },
  { page_key: "returns", title: "Returns", blocks: returnsBlocks() },
  { page_key: "shipping", title: "Shipping", blocks: shippingBlocks() },
];

const sqlEsc = (s) => String(s).replace(/'/g, "''");

const lines = [];
lines.push("-- ============================================================================");
lines.push("-- Style Eternal — Seed page_content from existing hardcoded storefront copy");
lines.push("-- Generated by scripts/generate-content-seed.mjs — do not edit by hand.");
lines.push("--");
lines.push("-- Idempotent + non-destructive: ON CONFLICT (page_key) DO NOTHING means this");
lines.push("-- never overwrites content an admin has already edited. The seeded rows make");
lines.push("-- the CMS editors open pre-populated with what's currently on the live site.");
lines.push("-- ============================================================================");
lines.push("");
for (const pg of PAGES) {
  const json = sqlEsc(JSON.stringify(pg.blocks));
  lines.push(`-- ${pg.page_key} (${pg.blocks.length} blocks)`);
  lines.push("INSERT INTO public.page_content (page_key, title, blocks, updated_at)");
  lines.push(`VALUES ('${pg.page_key}', '${sqlEsc(pg.title)}', '${json}'::jsonb, NOW())`);
  lines.push("ON CONFLICT (page_key) DO NOTHING;");
  lines.push("");
}

const ts = "20260531070000";
const outDir = join(repoRoot, "supabase", "migrations");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${ts}_seed_page_content.sql`);
writeFileSync(outPath, lines.join("\n"), "utf8");

const totalBlocks = PAGES.reduce((n, p) => n + p.blocks.length, 0);
console.log(`Wrote ${outPath}`);
console.log(`Pages: ${PAGES.length}, total blocks: ${totalBlocks}`);
for (const p of PAGES) console.log(`  ${p.page_key.padEnd(10)} ${p.blocks.length} blocks`);

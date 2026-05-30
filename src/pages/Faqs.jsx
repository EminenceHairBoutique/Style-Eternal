// src/pages/Faqs.jsx — Style Eternal
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ChevronDown, Search, MessageCircle, Mail, HelpCircle } from "lucide-react";
import SEO from "../components/SEO";

const CATEGORY_ICONS = {
  "Orders & Shipping": "📦",
  "Products": "🏷️",
  "Returns & Exchanges": "↩️",
  "Drops & Collections": "🔥",
  "Account & Rewards": "⭐",
  "Brand": "✦",
};

const FAQS = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How long does shipping take?", a: "Standard shipping is 5–7 business days. Expedited shipping delivers in 2–3 business days, and priority shipping arrives within 1–2 business days. Expedited and priority options are available at checkout." },
      { q: "Do you ship internationally?", a: "Not yet — but we're working on it. International shipping is coming soon. Sign up for our newsletter to be the first to know when it launches." },
      { q: "How do I track my order?", a: "You'll receive a tracking email with carrier details as soon as your order ships. You can also check order status anytime from your account dashboard." },
      { q: "Can I change or cancel my order?", a: "Orders are processed quickly. Contact us within 1 hour of placing your order at info@styleeternal.com and we'll do our best to accommodate changes or cancellations." },
      { q: "How long does processing take?", a: "Orders are processed within 1–3 business days before shipping. During high-volume drops, processing may take an additional day." },
      { q: "Is there a free shipping threshold?", a: "Yes — free standard shipping on all orders over $150. No codes needed, it's applied automatically at checkout." },
    ],
  },
  {
    category: "Products",
    items: [
      { q: "What sizes do you carry and how do they fit?", a: "Tops run S through XXL. Bottoms run 28–38. Most pieces are cut in an oversized or relaxed fit — that's the Style Eternal signature. Check the fit note on each product page. When in doubt, size down for a less relaxed silhouette." },
      { q: "Are your garments pre-shrunk?", a: "All garment-washed pieces are pre-shrunk. Follow the care instructions on the label to maintain the intended fit and feel over time." },
      { q: "What does 'Limited' mean?", a: "Limited pieces are produced in intentionally small quantities. Once they sell out, they're gone — no restocks. They move to the Archive as a permanent record of the drop." },
      { q: "What fabric weights do you use?", a: "Our tees are 280gsm+ heavyweight cotton. Hoodies and outerwear are 400gsm+ French terry or fleece. We don't do thin basics — everything has real substance." },
      { q: "How should I care for printed pieces?", a: "Turn the garment inside out and wash cold on a gentle cycle. Hang dry or tumble dry on low heat. Avoid ironing directly on prints to preserve the design." },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      { q: "What is your return policy?", a: "We accept returns on unworn items with tags attached within 30 days of delivery. Items must be in original condition — no wear, wash, or alterations." },
      { q: "How do I initiate a return?", a: "Email info@styleeternal.com with your order number and reason for the return. We'll send you a prepaid return label within 24 hours." },
      { q: "How do exchanges work?", a: "Contact us and we'll help you swap sizes or colorways, subject to availability. Your first exchange on any order is free." },
      { q: "What if my item arrives damaged?", a: "Contact us at info@styleeternal.com with photos of the damage. We'll arrange a full replacement or refund — no need to return the damaged item." },
      { q: "How long until I receive my refund?", a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. Your original payment method will be credited." },
    ],
  },
  {
    category: "Drops & Collections",
    items: [
      { q: "When is the next drop?", a: "Drop dates are announced through our newsletter and social channels first. Subscribe to get notified before anything goes live." },
      { q: "How do I get notified about new releases?", a: "Sign up for the Style Eternal newsletter at shopstyleeternal.com. Subscribers always get early access and first notice on upcoming drops." },
      { q: "Will sold-out items ever restock?", a: "Limited drops don't restock — that's what makes them limited. Once they sell out, they move to the Archive as a permanent record. Core collection items may be replenished." },
      { q: "What is the Archive?", a: "The Archive is a record of every past release. It preserves the history of each collection and drop, even after items have sold out." },
    ],
  },
  {
    category: "Account & Rewards",
    items: [
      { q: "How do I join the rewards program?", a: "Create an account on shopstyleeternal.com and you're automatically enrolled. No extra steps — start earning from your first purchase." },
      { q: "How do reward tiers work?", a: "There are four tiers based on total spend: Foundation, Established, Permanent, and Eternal. Each tier unlocks better perks, from early access to exclusive drops." },
      { q: "Do my points expire?", a: "No — your points never expire. They stay in your account as long as it's active." },
      { q: "How do I earn points?", a: "You earn 1 point for every dollar spent. Points accrue automatically with each completed order." },
    ],
  },
  {
    category: "Brand",
    items: [
      { q: "Where is Style Eternal based?", a: "New Jersey. Every piece is designed here. It's where we come from and it shows in everything we make." },
      { q: "Do you do collaborations?", a: "We're open to the right partnerships — artists, makers, and community voices that align with our values. Reach out via the contact page." },
      { q: "What does EST. 2021 mean?", a: "2021 is the year Style Eternal was founded. It marks the beginning of the brand and everything we've built since." },
    ],
  },
];

function FaqItem({ q, a, isOpen, onToggle, index }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 md:py-6 text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-4">
          <span className="text-[11px] font-accent text-se-steel/40 mt-0.5 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          <span className={`text-[14px] md:text-[15px] font-accent transition-colors duration-200 ${isOpen ? "text-se-bone" : "text-se-bone/70 group-hover:text-se-bone"}`}>{q}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-se-steel transition-transform duration-300 ${isOpen ? "rotate-180 text-se-gold" : ""}`}
        />
      </button>
      <div
        style={{ height: isOpen ? height : 0 }}
        className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
      >
        <div ref={contentRef} className="pb-6 pl-9 pr-4">
          <p className="text-[13px] md:text-[14px] text-se-bone/50 leading-[1.75]">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faqs() {
  const [openId, setOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = FAQS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        !searchQuery ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0);

  const totalQuestions = FAQS.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <>
      <SEO title="FAQs — Style Eternal" description="Frequently asked questions about Style Eternal orders, products, returns, and more." />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-12 md:pt-40 md:pb-20 border-b border-white/5">
          <div className="content-wide">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            >
              <p className="section-eyebrow mb-4">Support</p>
              <h1 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] tracking-[0.04em] mb-4">
                HOW CAN WE<br />HELP?
              </h1>
              <p className="text-[15px] text-se-bone/40 max-w-lg mb-8">
                {totalQuestions} answers to the most common questions. Can&apos;t find yours?{" "}
                <Link to="/client-services" className="text-se-bone/60 underline underline-offset-4 hover:text-se-bone transition">Talk to us</Link>.
              </p>

              {/* Search */}
              <div className="relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-se-steel" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-11 pr-4 py-3.5 bg-se-charcoal border border-white/8 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold/50 transition"
                />
              </div>
            </Motion.div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="section-pad">
          <div className="content-wrap max-w-3xl">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16">
                <HelpCircle size={32} className="mx-auto text-se-steel/30 mb-4" />
                <p className="text-[15px] text-se-bone/40 mb-2">No results for &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-[13px] text-se-steel">Try a different search or <Link to="/client-services" className="text-se-bone/60 underline underline-offset-4">contact us</Link>.</p>
              </div>
            ) : (
              filteredFaqs.map((section, si) => (
                <Motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: si * 0.05, ease: [0.2, 0, 0, 1] }}
                  className="mb-14 last:mb-0"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[16px]">{CATEGORY_ICONS[section.category] || "•"}</span>
                    <h2 className="font-display text-[15px] md:text-[16px] tracking-[0.12em] text-se-bone/80">
                      {section.category.toUpperCase()}
                    </h2>
                    <span className="text-[10px] font-accent text-se-steel/50 ml-auto">{section.items.length}</span>
                  </div>
                  {section.items.map((item, i) => {
                    const id = `${section.category}-${i}`;
                    return (
                      <FaqItem
                        key={id}
                        q={item.q}
                        a={item.a}
                        index={i}
                        isOpen={openId === id}
                        onToggle={() => setOpenId(openId === id ? null : id)}
                      />
                    );
                  })}
                </Motion.div>
              ))
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="pb-20 md:pb-28 border-t border-white/5">
          <div className="content-wide pt-16">
            <div className="max-w-2xl mx-auto text-center">
              <p className="section-eyebrow mb-4">Need More Help?</p>
              <h2 className="font-display text-[22px] md:text-[28px] tracking-[0.06em] mb-4">
                WE&apos;RE HERE FOR YOU
              </h2>
              <p className="text-[14px] text-se-bone/40 mb-8 max-w-md mx-auto">
                Our team responds within 24 hours. For urgent order issues, include your order number.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/client-services" className="btn-primary inline-flex items-center gap-2">
                  <MessageCircle size={14} /> Contact Support
                </Link>
                <a href="mailto:info@styleeternal.com" className="btn-outline inline-flex items-center gap-2">
                  <Mail size={14} /> Email Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// src/pages/Faqs.jsx — Style Eternal
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion as Motion } from "framer-motion";
import SEO from "../components/SEO";

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-[14px] text-se-bone font-accent">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-se-steel transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-5 text-[13px] text-se-bone/50 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

const FAQS = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How long does shipping take?", a: "Standard shipping is 5–7 business days within the US. Expedited options available at checkout." },
      { q: "Do you ship internationally?", a: "Not currently. US shipping only at this time. International is coming." },
      { q: "Can I change or cancel my order?", a: "Orders are processed quickly. Contact us within 1 hour of placing your order and we'll do our best to accommodate changes." },
      { q: "How do I track my order?", a: "You'll receive a tracking email once your order ships. You can also check your account page for status updates." },
    ],
  },
  {
    category: "Products",
    items: [
      { q: "What sizes do you carry?", a: "Most pieces run S through XXL. Bottoms run 28–38. Check individual product pages for size charts and fit notes." },
      { q: "How do your pieces fit?", a: "Most of our pieces are oversized or relaxed fit. Check the fit note and size chart on each product page for specifics." },
      { q: "Are your garments pre-shrunk?", a: "All garment-washed pieces are pre-shrunk. Follow the care instructions to maintain the fit." },
      { q: "What does 'limited' mean?", a: "Limited pieces are produced in small quantities. Once they sell out, they move to the archive and are not restocked." },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      { q: "What is your return policy?", a: "We accept returns on unworn items with tags attached within 30 days. See our Returns page for full details." },
      { q: "How do I start a return?", a: "Email us at info@styleeternal.com with your order number and reason. We'll send you a return label." },
      { q: "Do you offer exchanges?", a: "Yes. Contact us and we'll help you swap sizes or colorways, subject to availability." },
    ],
  },
  {
    category: "Brand & Community",
    items: [
      { q: "Where is Style Eternal based?", a: "Newark, New Jersey — the North Ward." },
      { q: "When is the next drop?", a: "Sign up for our newsletter for first access to drop announcements and release dates." },
      { q: "Do you do collaborations?", a: "We're open to the right partnerships. Reach out via our contact page." },
    ],
  },
];

export default function Faqs() {
  const [openId, setOpenId] = useState(null);

  return (
    <>
      <SEO title="FAQs — Style Eternal" description="Frequently asked questions about Style Eternal orders, products, returns, and more." />

      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <p className="text-overline mb-4">Support</p>
            <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em] mb-4">
              FREQUENTLY ASKED<br />QUESTIONS
            </h1>
            <p className="text-[15px] text-se-bone/40 max-w-lg">
              Can't find what you need? <Link to="/contact" className="text-se-bone/60 underline underline-offset-4 hover:text-se-bone transition">Contact us</Link>.
            </p>
          </div>
        </section>

        <section className="section-pad">
          <div className="content-wrap max-w-3xl">
            {FAQS.map((section) => (
              <div key={section.category} className="mb-12">
                <h2 className="font-display text-[16px] tracking-[0.12em] mb-6 text-se-bone/80">
                  {section.category.toUpperCase()}
                </h2>
                {section.items.map((item, i) => {
                  const id = `${section.category}-${i}`;
                  return (
                    <FaqItem
                      key={id}
                      q={item.q}
                      a={item.a}
                      open={openId === id}
                      onToggle={() => setOpenId(openId === id ? null : id)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="pb-20 md:pb-28 border-t border-white/5">
          <div className="content-wide text-center pt-16">
            <p className="text-overline mb-3">Still have questions?</p>
            <h2 className="font-display text-[20px] tracking-[0.08em] mb-6">GET IN TOUCH</h2>
            <Link to="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </section>
      </div>
    </>
  );
}

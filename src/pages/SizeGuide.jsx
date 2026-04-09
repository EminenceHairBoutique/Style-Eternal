// src/pages/SizeGuide.jsx — Style Eternal
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Ruler } from "lucide-react";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

const CATEGORIES = [
  {
    key: "tops",
    label: "Tees & Hoodies",
    fit: "Oversized / Relaxed Fit",
    note: "Style Eternal tops run intentionally oversized. For a closer fit, size down one. For a true relaxed silhouette, go true to size.",
    headers: ["Size", "Chest", "Length", "Shoulder"],
    rows: [
      ["S", '42"', '28"', '20"'],
      ["M", '44"', '29"', '21"'],
      ["L", '46"', '30"', '22"'],
      ["XL", '48"', '31"', '23"'],
      ["XXL", '50"', '32"', '24"'],
    ],
  },
  {
    key: "outerwear",
    label: "Outerwear & Jackets",
    fit: "Oversized / Layering Fit",
    note: "Outerwear is cut to accommodate layering. If wearing over a tee, go true to size. For hoodies underneath, size up one.",
    headers: ["Size", "Chest", "Length", "Sleeve"],
    rows: [
      ["S", '44"', '28"', '25"'],
      ["M", '46"', '29"', '26"'],
      ["L", '48"', '30"', '27"'],
      ["XL", '50"', '31"', '28"'],
      ["XXL", '52"', '32"', '29"'],
    ],
  },
  {
    key: "bottoms",
    label: "Bottoms & Sweats",
    fit: "Relaxed / Tapered",
    note: "Bottoms feature an elastic waist with drawcord. Measurements refer to relaxed waist. For a looser fit, size up one.",
    headers: ["Size", "Waist", "Inseam", "Leg Opening"],
    rows: [
      ["S (28-30)", '30"', '30"', '13"'],
      ["M (30-32)", '32"', '31"', '14"'],
      ["L (32-34)", '34"', '31"', '14.5"'],
      ["XL (34-36)", '36"', '32"', '15"'],
      ["XXL (36-38)", '38"', '32"', '15.5"'],
    ],
  },
  {
    key: "headwear",
    label: "Headwear",
    fit: "Adjustable / One Size",
    note: "Most caps feature adjustable straps or snapback closures. Fitted caps are true to size.",
    headers: ["Type", "Circumference", "Crown Height", "Brim"],
    rows: [
      ["Snapback", '22–24"', '4.5"', '2.75"'],
      ["Dad Cap", '21–23"', '4"', '2.5"'],
      ["Fitted", 'Size-specific', '4.5"', '2.75"'],
      ["Beanie", 'One Size', '10"', '—'],
    ],
  },
];

export default function SizeGuide() {
  const [activeCategory, setActiveCategory] = useState("tops");
  const category = CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <>
      <SEO
        title="Size Guide — Style Eternal"
        description="Find your perfect fit. Size charts and fit guides for Style Eternal tees, hoodies, outerwear, bottoms, and headwear."
      />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">Fit & Sizing</p>
              <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em] mb-4">
                SIZE GUIDE
              </h1>
              <p className="text-[15px] text-se-bone/40 max-w-lg">
                All measurements in inches. Every piece is designed with an intentional fit.
                When in doubt, check the notes below.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Category Tabs */}
        <div className="border-b border-white/5 sticky top-0 z-30 bg-se-black/95 backdrop-blur-sm">
          <div className="content-wide py-4">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Size guide categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.key}
                  aria-controls={`panel-${cat.key}`}
                  id={`tab-${cat.key}`}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`text-[11px] font-accent uppercase tracking-[0.2em] whitespace-nowrap transition pb-1 border-b-2 ${
                    activeCategory === cat.key
                      ? "text-se-bone border-se-gold"
                      : "text-se-steel border-transparent hover:text-se-bone"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Size Chart */}
        <section className="section-pad">
          <div className="content-wrap max-w-4xl">
            {category && (
              <Motion.div
                key={category.key}
                role="tabpanel"
                id={`panel-${category.key}`}
                aria-labelledby={`tab-${category.key}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              >
                {/* Fit info */}
                <div className="flex items-start gap-4 mb-8">
                  <Ruler className="w-5 h-5 text-se-gold mt-0.5 shrink-0" />
                  <div>
                    <h2 className="font-display text-[18px] tracking-[0.08em] mb-1">
                      {category.label.toUpperCase()}
                    </h2>
                    <p className="text-[12px] font-accent text-se-gold tracking-[0.1em]">
                      {category.fit}
                    </p>
                  </div>
                </div>

                <p className="text-[14px] text-se-bone/50 leading-relaxed mb-8 max-w-2xl">
                  {category.note}
                </p>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {category.headers.map((header) => (
                          <th
                            key={header}
                            className="text-left text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel py-3 px-4 border-b border-white/10"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {category.rows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-white/[0.04] hover:bg-white/[0.02] transition"
                        >
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className={`py-4 px-4 text-[14px] font-accent ${
                                j === 0 ? "text-se-bone font-medium" : "text-se-bone/60"
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Motion.div>
            )}
          </div>
        </section>

        {/* How to Measure */}
        <section className="section-pad border-t border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp}>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2rem)] tracking-[0.08em] mb-8">
                HOW TO MEASURE
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Chest",
                    text: "Measure around the fullest part of your chest, keeping the tape level under your arms.",
                  },
                  {
                    title: "Length",
                    text: "Measure from the highest point of the shoulder seam down to the bottom hem.",
                  },
                  {
                    title: "Waist",
                    text: "Measure around your natural waistline, keeping the tape comfortably loose.",
                  },
                  {
                    title: "Inseam",
                    text: "Measure from the crotch seam down the inner leg to the bottom of the hem.",
                  },
                ].map((item) => (
                  <div key={item.title} className="border border-white/5 bg-se-charcoal p-5">
                    <h3 className="font-display text-[13px] tracking-[0.12em] mb-2">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="text-[13px] text-se-bone/40 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </Motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 md:pb-28 border-t border-white/5">
          <div className="content-wide text-center pt-16">
            <p className="text-overline mb-3">Need help with sizing?</p>
            <h2 className="font-display text-[20px] tracking-[0.08em] mb-6">
              WE&apos;RE HERE TO HELP
            </h2>
            <Link to="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </section>
      </div>
    </>
  );
}

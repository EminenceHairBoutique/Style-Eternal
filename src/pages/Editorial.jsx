// src/pages/Editorial.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

const entries = [
  {
    id: "lnd-editorial",
    type: "Campaign",
    title: "Love Never Dies — The First Drop",
    date: "Spring 2026",
    excerpt:
      "Five pieces. Skeleton graphics. All-over flames. A statement hoodie that says what needs to be said. The Love Never Dies collection marks the beginning.",
    image: "/assets/products/love-never-dies-tee/01.jpg",
    link: "/collections/love-never-dies",
    cta: "View Collection",
  },
  {
    id: "worldwide-campaign",
    type: "Lookbook",
    title: "Style Eternal SS26 Campaign",
    date: "Spring 2026",
    excerpt:
      "The SE Worldwide Long Sleeve. All-over print. Front crest, back medallion, sleeve stars. From New Jersey to everywhere.",
    image: "/assets/products/se-worldwide-longsleeve/01.jpg",
    link: "/shop",
    cta: "View Lookbook",
  },
  {
    id: "behind-graphics",
    type: "Journal",
    title: "Behind the Graphics",
    date: "2026",
    excerpt:
      "The design language of Style Eternal. Skeletons, flames, halos, love, death. Every graphic carries emotional weight. This is how they're made.",
    image: "/assets/products/forbidden-love-hoodie/01.jpg",
    link: "/about",
    cta: "Read More",
  },
];

export default function Editorial() {
  return (
    <>
      <SEO
        title="Editorial — Style Eternal"
        description="Campaigns, lookbooks, and stories. The cultural world behind Style Eternal."
      />

      <div className="bg-se-black text-se-bone">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="text-overline mb-4">Stories & Campaigns</p>
              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-[0.04em] mb-6">
                EDITORIAL
              </h1>
              <p className="text-[15px] md:text-[17px] text-se-bone/50 max-w-lg leading-relaxed">
                Clothes carry stories. These are ours. Campaigns, lookbooks,
                and reflections from the world of Style Eternal.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Featured Entry */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <Link to={entries[0].link} className="group block">
                <div className="grid md:grid-cols-[1.3fr,1fr] gap-8 md:gap-16 items-center">
                  <div className="aspect-[4/5] bg-se-charcoal overflow-hidden">
                    {entries[0].image ? (
                      <img
                        src={entries[0].image}
                        alt={entries[0].title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-se-charcoal to-se-asphalt">
                        <span className="font-display text-[40px] tracking-[0.1em] text-se-steel/15">
                          SE
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-4">
                      {entries[0].type} — {entries[0].date}
                    </p>
                    <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[0.04em] mb-6">
                      {entries[0].title.toUpperCase()}
                    </h2>
                    <p className="text-[15px] text-se-bone/50 leading-relaxed mb-8 max-w-md">
                      {entries[0].excerpt}
                    </p>
                    <span className="btn-outline inline-flex items-center gap-2">
                      {entries[0].cta} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </Motion.div>
          </div>
        </section>

        {/* Rest of entries */}
        <section className="section-pad">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {entries.slice(1).map((entry, i) => (
                <Motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                >
                  <Link to={entry.link} className="group block">
                    <div className="aspect-[4/5] bg-se-charcoal overflow-hidden mb-5">
                      {entry.image ? (
                        <img
                          src={entry.image}
                          alt={entry.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-se-charcoal to-se-asphalt">
                          <span className="font-display text-[20px] tracking-[0.15em] text-se-steel/15">
                            SE
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[9px] tracking-[0.25em] uppercase text-se-gold font-accent mb-2">
                      {entry.type} — {entry.date}
                    </p>
                    <h3 className="font-display text-[18px] md:text-[22px] tracking-[0.06em] mb-2 group-hover:text-se-bone/80 transition">
                      {entry.title.toUpperCase()}
                    </h3>
                    <p className="text-[13px] text-se-bone/40 leading-relaxed line-clamp-3">
                      {entry.excerpt}
                    </p>
                  </Link>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

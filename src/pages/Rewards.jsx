// src/pages/Rewards.jsx — Style Eternal Loyalty & Rewards
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Crown, Star, Zap, Shield, Gift, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { LOYALTY } from "../utils/loyalty";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
};

/** Presentational config per tier — keyed by tier name from LOYALTY.tiers */
const TIER_PRESENTATION = {
  Foundation: {
    icon: Star,
    description: "Your entry into the archive. Every member starts here.",
    perks: [
      "Access to member-only drops",
      "Birthday surprise each year",
      "Early notifications on new releases",
      "Newsletter with editorial content",
    ],
    accent: "border-se-steel/30",
    iconColor: "text-se-steel",
    bg: "bg-se-charcoal",
  },
  Established: {
    icon: Zap,
    description: "You've proven your commitment. Perks start to unlock.",
    perks: [
      "Everything in Foundation",
      "Early access to all drops (24h before public)",
      "Priority restock alerts",
      "Exclusive seasonal lookbook access",
    ],
    accent: "border-se-bone/20",
    iconColor: "text-se-bone",
    bg: "bg-se-charcoal",
  },
  Permanent: {
    icon: Shield,
    description: "Inner circle. Reserved for those who live the brand.",
    perks: [
      "Everything in Established",
      "VIP concierge support",
      "Exclusive offers and pricing",
      "Priority shipping on all orders",
      "Access to archive re-releases",
    ],
    accent: "border-se-gold/40",
    iconColor: "text-se-gold",
    bg: "bg-se-charcoal",
  },
  Eternal: {
    icon: Crown,
    description: "The highest tier. Reserved for lifetime supporters.",
    perks: [
      "Everything in Permanent",
      "Private styling consultations",
      "First access to collaborations",
      "Complimentary alterations",
      "Invitation to private events",
      "Top-tier VIP treatment",
    ],
    accent: "border-se-gold",
    iconColor: "text-se-gold",
    bg: "bg-gradient-to-br from-se-charcoal to-[#1A1508]",
  },
};

function formatThreshold(cents) {
  const dollars = Math.round(cents / 100);
  return `$${dollars.toLocaleString("en-US")}`;
}

/** Merge source-of-truth tier data from LOYALTY with presentational config */
const TIER_DATA = LOYALTY.tiers.map((tier) => ({
  name: tier.name,
  threshold: formatThreshold(tier.minSpendCents),
  ...TIER_PRESENTATION[tier.name],
}));

export default function Rewards() {
  return (
    <>
      <SEO
        title="Rewards — Style Eternal"
        description="The Eternal Rewards program. Earn points, unlock tiers, and access exclusive perks as a Style Eternal member."
      />

      <div className="bg-se-black text-se-bone">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="max-w-2xl">
              <p className="text-overline mb-4">Membership</p>
              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-[0.04em] mb-6">
                ETERNAL<br />REWARDS
              </h1>
              <p className="text-[15px] md:text-[17px] text-se-bone/50 leading-relaxed max-w-lg">
                Loyalty that reflects how you shop. Earn points on every purchase,
                unlock tiers based on lifetime spend, and access perks reserved for
                the inner circle.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/account" className="btn-primary">
                  Join Now
                </Link>
                <a href="#tiers" className="btn-outline">
                  View Tiers
                </a>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12 md:mb-16">
              <p className="text-overline mb-2">The System</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                HOW IT WORKS
              </h2>
            </Motion.div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  step: "01",
                  title: "Earn Points",
                  description: `Earn ${LOYALTY.pointsPerDollar} point for every $1 spent. Your first purchase earns a ${LOYALTY.firstPurchaseBonusPoints}-point bonus on top.`,
                },
                {
                  step: "02",
                  title: "Unlock Tiers",
                  description:
                    "Your tier is based on lifetime spend. The more you invest in the brand, the higher your access level.",
                },
                {
                  step: "03",
                  title: "Access Perks",
                  description:
                    "Each tier unlocks exclusive benefits — from early drop access to private styling and VIP events.",
                },
              ].map((item, i) => (
                <Motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                  className="border border-white/5 bg-se-charcoal p-8"
                >
                  <span className="text-[11px] font-accent tracking-[0.2em] text-se-gold mb-4 block">
                    {item.step}
                  </span>
                  <h3 className="font-display text-[18px] tracking-[0.08em] mb-4">
                    {item.title.toUpperCase()}
                  </h3>
                  <p className="text-[14px] text-se-bone/40 leading-relaxed">
                    {item.description}
                  </p>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section id="tiers" className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12 md:mb-16 text-center">
              <p className="text-overline mb-2">Progression</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                THE TIERS
              </h2>
              <p className="text-[14px] text-se-bone/40 mt-4 max-w-lg mx-auto">
                Four levels. Each unlocks more access, more exclusivity, more of
                the brand experience.
              </p>
            </Motion.div>

            {/* Visual Tier Progression Bar */}
            <Motion.div {...fadeUp} className="mb-14 hidden md:block">
              <div className="relative max-w-4xl mx-auto">
                <div className="h-[2px] bg-white/[0.06] w-full absolute top-3" />
                <div className="h-[2px] bg-gradient-to-r from-se-steel/30 via-se-bone/20 via-se-gold/40 to-se-gold w-full absolute top-3" />
                <div className="flex justify-between relative">
                  {TIER_DATA.map((tier) => {
                    const TierDotIcon = tier.icon;
                    return (
                      <div key={tier.name} className="flex flex-col items-center" style={{ width: "24%" }}>
                        <div className={`w-6 h-6 rounded-full border ${tier.accent} bg-se-black flex items-center justify-center mb-3`}>
                          <TierDotIcon className={`w-3 h-3 ${tier.iconColor}`} />
                        </div>
                        <span className="text-[10px] font-accent tracking-[0.15em] uppercase text-se-bone/60">
                          {tier.name}
                        </span>
                        <span className="text-[9px] font-accent tracking-[0.1em] text-se-gold/60 mt-0.5">
                          {tier.threshold}+
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {TIER_DATA.map((tier, i) => {
                const TierIcon = tier.icon;
                return (
                  <Motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                    className={`${tier.bg} tier-card-glow border ${tier.accent} p-6 md:p-7 flex flex-col`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <TierIcon className={`w-5 h-5 ${tier.iconColor}`} />
                      <h3 className="font-display text-[16px] tracking-[0.1em]">
                        {tier.name.toUpperCase()}
                      </h3>
                    </div>

                    <p className="text-[11px] font-accent tracking-[0.15em] text-se-gold mb-3">
                      {tier.threshold}+ LIFETIME SPEND
                    </p>

                    <p className="text-[13px] text-se-bone/40 leading-relaxed mb-5">
                      {tier.description}
                    </p>

                    <div className="mt-auto">
                      <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-3">
                        Perks
                      </p>
                      <ul className="space-y-2">
                        {tier.perks.map((perk) => (
                          <li
                            key={perk}
                            className="flex items-start gap-2 text-[12px] text-se-bone/60 leading-relaxed"
                          >
                            <span className="mt-[6px] w-1 h-1 bg-se-gold shrink-0 rounded-full" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Points Breakdown */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Motion.div {...fadeUp}>
                <p className="text-overline mb-4">Earning</p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-[1] tracking-[0.04em] mb-6">
                  POINTS<br />BREAKDOWN
                </h2>
                <div className="space-y-6">
                  {[
                    { label: "Every $1 Spent", value: `${LOYALTY.pointsPerDollar} Point` },
                    { label: "First Purchase Bonus", value: `${LOYALTY.firstPurchaseBonusPoints} Points` },
                    { label: "Account Creation", value: "Instant Foundation Tier" },
                    { label: "Birthday Month", value: "Surprise Reward" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-white/[0.06] pb-4"
                    >
                      <span className="text-[14px] font-accent text-se-bone/70">
                        {item.label}
                      </span>
                      <span className="text-[13px] font-accent text-se-gold tracking-[0.1em]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Motion.div>

              <Motion.div {...fadeUp} className="border border-white/5 bg-se-charcoal p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Gift className="w-5 h-5 text-se-gold" />
                  <h3 className="font-display text-[18px] tracking-[0.08em]">
                    FIRST PURCHASE
                  </h3>
                </div>
                <p className="text-[14px] text-se-bone/50 leading-relaxed mb-6">
                  Create an account and make your first purchase to receive a{" "}
                  <span className="text-se-bone">{LOYALTY.firstPurchaseBonusPoints}-point bonus</span>.
                  Points are automatically credited once your order is confirmed.
                </p>
                <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                  Start Shopping <ArrowRight size={14} />
                </Link>
              </Motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wrap max-w-3xl">
            <Motion.div {...fadeUp} className="mb-10">
              <p className="text-overline mb-2">Common Questions</p>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
                REWARDS FAQ
              </h2>
            </Motion.div>

            <div className="space-y-0">
              {[
                {
                  q: "How do I join the program?",
                  a: "Create a free account. You're automatically enrolled at the Foundation tier. No codes, no forms — just sign up and start earning.",
                },
                {
                  q: "How are tiers calculated?",
                  a: "Tiers are based on your lifetime spend. Every verified purchase counts toward your tier. Once you reach a tier, you stay there.",
                },
                {
                  q: "Do points expire?",
                  a: "Points are earned as a record of your purchases. As long as your account is active, your points and tier remain intact.",
                },
                {
                  q: "Can I redeem points for discounts?",
                  a: "Points currently track your loyalty status and unlock tier-based perks. Redemption features for exclusive product access are in development.",
                },
                {
                  q: "What happens if I return an item?",
                  a: "Points from returned items are adjusted accordingly. Your tier is recalculated based on net lifetime spend.",
                },
              ].map((item) => (
                <div key={item.q} className="border-b border-white/[0.06] py-5">
                  <h3 className="text-[14px] text-se-bone font-accent mb-2">
                    {item.q}
                  </h3>
                  <p className="text-[13px] text-se-bone/40 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad">
          <div className="content-wide text-center">
            <Motion.div {...fadeUp}>
              <div className="divider-gold mb-10 mx-auto w-16" />
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.08em] mb-4">
                JOIN THE INNER CIRCLE
              </h2>
              <p className="text-[14px] text-se-bone/40 mb-8 max-w-md mx-auto">
                Create your account and start earning with your first purchase.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/account" className="btn-primary">
                  Create Account
                </Link>
                <Link to="/shop" className="btn-outline">
                  Shop Now
                </Link>
              </div>
            </Motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

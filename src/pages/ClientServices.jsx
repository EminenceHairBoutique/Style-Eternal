// src/pages/ClientServices.jsx — Style Eternal
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Package,
  RotateCcw,
  Truck,
  Ruler,
  Mail,
  Clock,
  ChevronDown,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import SEO from "../components/SEO";
import { BRAND } from "../config/brand";

/* ─── Animation ──────────────────────────────────────────────────────── */

const ease = [0.2, 0, 0, 1];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, ease },
};

/* ─── Services Data ──────────────────────────────────────────────────── */

const SERVICES = [
  {
    icon: Package,
    title: "Order Assistance",
    description:
      "Questions about an existing order, tracking updates, or changes before shipment — we're here to help.",
    links: [
      { label: "Shipping Information", href: "/shipping" },
      { label: "Track My Order", href: "/account" },
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns & Exchanges",
    description:
      "30-day returns on all unworn items. Free first exchange on any order. No hassle, no runaround.",
    links: [
      { label: "Return Policy", href: "/returns" },
      { label: "Start a Return", href: "#contact" },
    ],
  },
  {
    icon: Ruler,
    title: "Product Guidance",
    description:
      "Not sure about sizing, fit, or fabric weight? Our team can help you find the right piece.",
    links: [
      { label: "Size Guide", href: "/size-guide" },
      { label: "Browse Products", href: "/shop" },
    ],
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    description:
      "Standard, expedited, and priority options available. Free shipping on orders over $150.",
    links: [
      { label: "Shipping Details", href: "/shipping" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
];

/* ─── FAQ Data ───────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Standard shipping is 5–7 business days. Expedited delivers in 2–3 business days, and priority arrives within 1–2 business days.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns on unworn items with tags attached within 30 days of delivery. Your first exchange on any order is free.",
  },
  {
    q: "How do I track my order?",
    a: "You'll receive a tracking email with carrier details as soon as your order ships. You can also check order status anytime from your account dashboard.",
  },
  {
    q: "Can I change or cancel my order after placing it?",
    a: "Orders are processed quickly. Contact us within 1 hour of placing your order and we'll do our best to accommodate changes or cancellations.",
  },
  {
    q: "What sizes do you carry and how do they fit?",
    a: "Tops run S through XXL. Bottoms run 28–38. Most pieces are cut in an oversized or relaxed fit. Check the fit note on each product page, or reach out and we'll help you find the right size.",
  },
  {
    q: "How long until I receive my refund?",
    a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. Your original payment method will be credited.",
  },
  {
    q: "Do you ship internationally?",
    a: "Not yet — but we're working on it. International shipping is coming soon. Subscribe to our newsletter to be the first to know.",
  },
  {
    q: "How do I initiate a return or exchange?",
    a: "Use the contact form below or email us with your order number and reason. We'll send a prepaid return label within 24 hours.",
  },
];

/* ─── Inquiry Types ──────────────────────────────────────────────────── */

const INQUIRY_TYPES = [
  { value: "", label: "Select an inquiry type" },
  { value: "order", label: "Order Question" },
  { value: "return", label: "Return or Exchange" },
  { value: "product", label: "Product Question" },
  { value: "sizing", label: "Sizing & Fit" },
  { value: "shipping", label: "Shipping" },
  { value: "collab", label: "Collaboration" },
  { value: "press", label: "Press Inquiry" },
  { value: "other", label: "Other" },
];

/* ─── FAQ Accordion Item ─────────────────────────────────────────────── */

function FaqItem({ q, a, isOpen, onToggle }) {
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
        <span
          className={`text-[14px] md:text-[15px] font-accent transition-colors duration-200 ${
            isOpen
              ? "text-se-bone"
              : "text-se-bone/70 group-hover:text-se-bone"
          }`}
        >
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-se-steel transition-transform duration-300 ${
            isOpen ? "rotate-180 text-se-gold" : ""
          }`}
        />
      </button>
      <div
        style={{ height: isOpen ? height : 0 }}
        className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
      >
        <div ref={contentRef} className="pb-6 pr-8">
          <p className="text-[13px] md:text-[14px] text-se-bone/50 leading-[1.75]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */

export default function ClientServices() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    inquiryType: "",
    orderNumber: "",
    subject: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});

  const update = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Please enter a valid email address.";
    if (!form.subject.trim()) e.subject = "Please enter a subject.";
    if (!form.message.trim()) e.message = "Please enter your message.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.website) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/client-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          inquiryType: form.inquiryType,
          orderNumber: form.orderNumber.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          website: form.website,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 bg-se-charcoal border border-white/8 text-se-bone text-[13px] font-accent placeholder:text-se-steel/60 focus:outline-none focus:border-se-gold/50 transition";

  const labelClass =
    "text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2";

  return (
    <>
      <SEO
        title="Client Services — Style Eternal"
        description="Order assistance, returns, product guidance, and personalized support from the Style Eternal team. We respond within 24 hours."
      />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="pt-32 pb-14 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="section-eyebrow mb-4">Customer Care</p>
              <h1 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] tracking-[0.04em] mb-5">
                CLIENT
                <br />
                SERVICES
              </h1>
              <p className="text-[15px] text-se-bone/40 max-w-lg leading-relaxed">
                We&apos;re here to assist with orders, product guidance, and
                personalized support. Our team responds within 24 hours.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* ── Services Grid ─────────────────────────────────────────── */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp} className="mb-12">
              <p className="section-eyebrow mb-2">How We Can Help</p>
              <h2 className="font-display text-[clamp(1.3rem,3vw,2rem)] tracking-[0.06em]">
                SERVICE OVERVIEW
              </h2>
            </Motion.div>

            <div className="grid md:grid-cols-2 gap-5">
              {SERVICES.map((service, i) => {
                const ServiceIcon = service.icon;
                return (
                  <Motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.08,
                      ease,
                    }}
                    className="border border-white/5 bg-se-charcoal p-7 md:p-8 group hover:border-white/10 transition-colors duration-300"
                  >
                    <ServiceIcon
                      size={20}
                      className="text-se-gold mb-5"
                    />
                    <h3 className="font-display text-[14px] tracking-[0.12em] mb-3">
                      {service.title.toUpperCase()}
                    </h3>
                    <p className="text-[13px] text-se-bone/50 leading-relaxed mb-5">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {service.links.map((link) => (
                        <Link
                          key={link.label}
                          to={link.href}
                          className="inline-flex items-center gap-1.5 text-[11px] font-accent tracking-[0.1em] uppercase text-se-bone/40 hover:text-se-bone transition-colors duration-200"
                        >
                          {link.label}
                          <ArrowRight size={11} />
                        </Link>
                      ))}
                    </div>
                  </Motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Contact Form ──────────────────────────────────────────── */}
        <section id="contact" className="section-pad border-b border-white/5">
          <div className="content-wide">
            <div className="grid md:grid-cols-[1fr,0.45fr] gap-12 md:gap-16">
              {/* Form Column */}
              <div>
                <Motion.div {...fadeUp} className="mb-10">
                  <p className="section-eyebrow mb-2">Get in Touch</p>
                  <h2 className="font-display text-[clamp(1.3rem,3vw,2rem)] tracking-[0.06em]">
                    SEND A MESSAGE
                  </h2>
                </Motion.div>

                {status === "success" ? (
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 text-center"
                  >
                    <CheckCircle
                      size={36}
                      className="mx-auto text-se-gold mb-6"
                    />
                    <h3 className="font-display text-[22px] tracking-[0.06em] mb-4">
                      MESSAGE RECEIVED
                    </h3>
                    <p className="text-[14px] text-se-bone/50 mb-2 max-w-md mx-auto">
                      Thank you for reaching out. Our team has received your
                      message and will respond within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus("idle");
                        setForm({
                          fullName: "",
                          email: "",
                          inquiryType: "",
                          orderNumber: "",
                          subject: "",
                          message: "",
                          website: "",
                        });
                      }}
                      className="mt-6 text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/40 hover:text-se-bone transition-colors"
                    >
                      Send Another Message
                    </button>
                  </Motion.div>
                ) : (
                  <Motion.form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    noValidate
                  >
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>
                          Full Name{" "}
                          <span className="text-se-red-bright">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={update("fullName")}
                          className={inputClass}
                          autoComplete="name"
                        />
                        {errors.fullName && (
                          <p className="text-[11px] text-se-red-bright mt-1.5 font-accent">
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Email{" "}
                          <span className="text-se-red-bright">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={update("email")}
                          className={inputClass}
                          autoComplete="email"
                        />
                        {errors.email && (
                          <p className="text-[11px] text-se-red-bright mt-1.5 font-accent">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Inquiry Type + Order Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Inquiry Type</label>
                        <select
                          value={form.inquiryType}
                          onChange={update("inquiryType")}
                          className={inputClass}
                        >
                          {INQUIRY_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>
                          Order Number{" "}
                          <span className="text-se-steel/50">
                            (optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={form.orderNumber}
                          onChange={update("orderNumber")}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className={labelClass}>
                        Subject{" "}
                        <span className="text-se-red-bright">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={update("subject")}
                        className={inputClass}
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-se-red-bright mt-1.5 font-accent">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className={labelClass}>
                        Message{" "}
                        <span className="text-se-red-bright">*</span>
                      </label>
                      <textarea
                        value={form.message}
                        onChange={update("message")}
                        rows={5}
                        className={`${inputClass} resize-none`}
                      />
                      {errors.message && (
                        <p className="text-[11px] text-se-red-bright mt-1.5 font-accent">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Honeypot */}
                    <input
                      type="text"
                      value={form.website}
                      onChange={update("website")}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="btn-primary w-full sm:w-auto"
                      >
                        {status === "loading"
                          ? "Sending..."
                          : "Send Message"}
                      </button>
                    </div>

                    {status === "error" && (
                      <p className="text-[12px] text-se-red-bright font-accent">
                        Something went wrong. Please try again or email us
                        directly at{" "}
                        <a
                          href={`mailto:${BRAND.supportEmail}`}
                          className="underline underline-offset-2"
                        >
                          {BRAND.supportEmail}
                        </a>
                        .
                      </p>
                    )}
                  </Motion.form>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Motion.div
                  {...fadeUp}
                  className="border border-white/5 bg-se-charcoal p-6"
                >
                  <div className="flex items-start gap-3 mb-6">
                    <Mail size={16} className="text-se-gold mt-0.5" />
                    <div>
                      <p className={labelClass}>Email</p>
                      <a
                        href={`mailto:${BRAND.supportEmail}`}
                        className="text-[14px] text-se-bone/80 hover:text-se-bone transition"
                      >
                        {BRAND.supportEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-se-gold mt-0.5" />
                    <div>
                      <p className={labelClass}>Response Time</p>
                      <p className="text-[14px] text-se-bone/80">
                        Within 24 hours
                      </p>
                    </div>
                  </div>
                </Motion.div>

                <Motion.div
                  {...fadeUp}
                  className="border border-white/5 bg-se-charcoal p-6"
                >
                  <p className={labelClass}>Quick Links</p>
                  <div className="space-y-3 mt-3 text-[13px]">
                    <Link
                      to="/faqs"
                      className="flex items-center justify-between text-se-bone/50 hover:text-se-bone transition group"
                    >
                      <span>Frequently Asked Questions</span>
                      <ArrowRight
                        size={12}
                        className="text-se-steel group-hover:text-se-bone transition"
                      />
                    </Link>
                    <Link
                      to="/returns"
                      className="flex items-center justify-between text-se-bone/50 hover:text-se-bone transition group"
                    >
                      <span>Returns & Exchanges</span>
                      <ArrowRight
                        size={12}
                        className="text-se-steel group-hover:text-se-bone transition"
                      />
                    </Link>
                    <Link
                      to="/shipping"
                      className="flex items-center justify-between text-se-bone/50 hover:text-se-bone transition group"
                    >
                      <span>Shipping Information</span>
                      <ArrowRight
                        size={12}
                        className="text-se-steel group-hover:text-se-bone transition"
                      />
                    </Link>
                    <Link
                      to="/size-guide"
                      className="flex items-center justify-between text-se-bone/50 hover:text-se-bone transition group"
                    >
                      <span>Size Guide</span>
                      <ArrowRight
                        size={12}
                        className="text-se-steel group-hover:text-se-bone transition"
                      />
                    </Link>
                    <Link
                      to="/account"
                      className="flex items-center justify-between text-se-bone/50 hover:text-se-bone transition group"
                    >
                      <span>Track My Order</span>
                      <ArrowRight
                        size={12}
                        className="text-se-steel group-hover:text-se-bone transition"
                      />
                    </Link>
                  </div>
                </Motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ───────────────────────────────────────────── */}
        <section className="section-pad border-b border-white/5">
          <div className="content-wide">
            <div className="max-w-3xl">
              <Motion.div {...fadeUp} className="mb-10">
                <p className="section-eyebrow mb-2">Common Questions</p>
                <h2 className="font-display text-[clamp(1.3rem,3vw,2rem)] tracking-[0.06em]">
                  FREQUENTLY ASKED
                </h2>
              </Motion.div>

              <div>
                {FAQS.map((faq, i) => (
                  <FaqItem
                    key={i}
                    q={faq.q}
                    a={faq.a}
                    isOpen={openFaq === i}
                    onToggle={() =>
                      setOpenFaq(openFaq === i ? null : i)
                    }
                  />
                ))}
              </div>

              <Motion.div {...fadeUp} className="mt-8">
                <Link
                  to="/faqs"
                  className="inline-flex items-center gap-2 text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/40 hover:text-se-bone transition-colors"
                >
                  View All FAQs
                  <ArrowRight size={12} />
                </Link>
              </Motion.div>
            </div>
          </div>
        </section>

        {/* ── Consultation / Personalized Assistance ────────────────── */}
        <section className="section-pad">
          <div className="content-wide">
            <div className="max-w-2xl mx-auto text-center">
              <Motion.div {...fadeUp}>
                <p className="section-eyebrow mb-4">
                  Personalized Assistance
                </p>
                <h2 className="font-display text-[clamp(1.4rem,4vw,2.2rem)] tracking-[0.06em] mb-5">
                  NEED HELP CHOOSING?
                </h2>
                <p className="text-[14px] text-se-bone/40 leading-relaxed mb-8 max-w-lg mx-auto">
                  Whether it&apos;s sizing, fit, fabric weight, or finding the
                  right piece for a specific look — we&apos;d be happy to help
                  guide your selection. Reach out and our team will provide
                  tailored recommendations.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="#contact" className="btn-primary">
                    Contact Our Team
                  </a>
                  <a
                    href={`mailto:${BRAND.supportEmail}`}
                    className="btn-outline inline-flex items-center gap-2"
                  >
                    <Mail size={14} /> {BRAND.supportEmail}
                  </a>
                </div>
              </Motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

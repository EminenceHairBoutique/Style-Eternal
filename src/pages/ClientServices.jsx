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
  ChevronDown,
  CheckCircle,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import SEO from "../components/SEO";
import { BRAND } from "../config/brand";

/* ─── Animation ──────────────────────────────────────────────────────── */

const ease = [0.2, 0, 0, 1];

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease },
};

/* ─── Services Data ──────────────────────────────────────────────────── */

const SERVICES = [
  {
    icon: Package,
    title: "Order Assistance",
    description:
      "Questions about an existing order, tracking updates, or modifications before shipment.",
    cta: { label: "Shipping Information", href: "/shipping" },
  },
  {
    icon: RotateCcw,
    title: "Returns & Exchanges",
    description:
      "30-day returns on all unworn items. Free first exchange on any order.",
    cta: { label: "Return Policy", href: "/returns" },
  },
  {
    icon: Ruler,
    title: "Product Guidance",
    description:
      "Sizing, fit, fabric weight, and styling direction — we'll help you find the right piece.",
    cta: { label: "Size Guide", href: "/size-guide" },
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    description:
      "Standard, expedited, and priority options. Free shipping on orders over $150.",
    cta: { label: "Shipping Details", href: "/shipping" },
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
  { value: "consultation", label: "Product Consultation" },
  { value: "collab", label: "Collaboration" },
  { value: "press", label: "Press Inquiry" },
  { value: "other", label: "Other" },
];

/* ─── FAQ Accordion Item ─────────────────────────────────────────────── */

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
          <span className="text-[11px] font-accent text-se-steel/40 mt-0.5 tabular-nums select-none">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={`text-[14px] md:text-[15px] font-accent transition-colors duration-200 ${
              isOpen
                ? "text-se-bone"
                : "text-se-bone/70 group-hover:text-se-bone"
            }`}
          >
            {q}
          </span>
        </div>
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
        <div ref={contentRef} className="pb-6 pl-9 pr-8">
          <p className="text-[13px] md:text-[14px] text-se-bone/50 leading-[1.8]">
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
    "w-full px-4 py-3.5 bg-transparent border border-white/[0.08] text-se-bone text-[13px] font-accent placeholder:text-se-steel/50 focus:outline-none focus:border-se-gold/40 transition duration-200";

  const labelClass =
    "text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2.5";

  return (
    <>
      <SEO
        title="Client Services — Style Eternal"
        description="Order assistance, returns, product guidance, and personalized support from the Style Eternal team. We respond within 24 hours."
      />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="pt-32 pb-16 md:pt-44 md:pb-28 border-b border-white/[0.04]">
          <div className="content-wide">
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <p className="section-eyebrow mb-5">Customer Care</p>
              <h1 className="font-display text-[clamp(2.4rem,7vw,5rem)] tracking-[0.04em] leading-[0.95] mb-6">
                CLIENT
                <br />
                SERVICES
              </h1>
              <p className="text-[15px] md:text-[16px] text-se-bone/35 max-w-md leading-[1.7]">
                We&apos;re here to assist with orders, product guidance, and
                personalized support. Our team responds within 24 hours.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* ── Services Grid ─────────────────────────────────────────── */}
        <section className="py-16 md:py-24 border-b border-white/[0.04]">
          <div className="content-wide">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
              {SERVICES.map((service, i) => {
                const ServiceIcon = service.icon;
                return (
                  <Motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.45,
                      delay: i * 0.06,
                      ease,
                    }}
                    className="bg-se-black p-8 md:p-9 flex flex-col"
                  >
                    <ServiceIcon
                      size={18}
                      strokeWidth={1.5}
                      className="text-se-gold mb-6"
                    />
                    <h3 className="font-display text-[13px] tracking-[0.14em] mb-3.5">
                      {service.title.toUpperCase()}
                    </h3>
                    <p className="text-[13px] text-se-bone/40 leading-[1.7] mb-6 flex-1">
                      {service.description}
                    </p>
                    <Link
                      to={service.cta.href}
                      className="inline-flex items-center gap-1.5 text-[10px] font-accent tracking-[0.14em] uppercase text-se-bone/30 hover:text-se-bone transition-colors duration-200"
                    >
                      {service.cta.label}
                      <ArrowRight size={10} />
                    </Link>
                  </Motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Contact Form ──────────────────────────────────────────── */}
        <section id="contact" className="py-16 md:py-28 border-b border-white/[0.04]">
          <div className="content-wide">
            <div className="grid lg:grid-cols-[1fr,320px] gap-16 lg:gap-20">
              {/* Form Column */}
              <div>
                <Motion.div {...fadeUp} className="mb-12">
                  <p className="section-eyebrow mb-3">Get in Touch</p>
                  <h2 className="font-display text-[clamp(1.4rem,3vw,2.2rem)] tracking-[0.06em] mb-4">
                    SEND A MESSAGE
                  </h2>
                  <p className="text-[13px] text-se-bone/30 max-w-lg leading-[1.7]">
                    For order inquiries, product questions, returns, or any
                    other matter — we&apos;re here to help.
                  </p>
                </Motion.div>

                {status === "success" ? (
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="py-20 text-center"
                  >
                    <CheckCircle
                      size={32}
                      strokeWidth={1.5}
                      className="mx-auto text-se-gold mb-7"
                    />
                    <h3 className="font-display text-[20px] tracking-[0.08em] mb-4">
                      MESSAGE RECEIVED
                    </h3>
                    <p className="text-[14px] text-se-bone/40 mb-2 max-w-sm mx-auto leading-[1.7]">
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
                      className="mt-8 text-[10px] font-accent tracking-[0.18em] uppercase text-se-bone/30 hover:text-se-bone transition-colors duration-200"
                    >
                      Send Another Message
                    </button>
                  </Motion.div>
                ) : (
                  <Motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    noValidate
                  >
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass} htmlFor="cs-name">
                          Full Name{" "}
                          <span className="text-se-red-bright/70">*</span>
                        </label>
                        <input
                          id="cs-name"
                          type="text"
                          value={form.fullName}
                          onChange={update("fullName")}
                          className={inputClass}
                          autoComplete="name"
                        />
                        {errors.fullName && (
                          <p className="text-[11px] text-se-red-bright mt-2 font-accent">
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="cs-email">
                          Email{" "}
                          <span className="text-se-red-bright/70">*</span>
                        </label>
                        <input
                          id="cs-email"
                          type="email"
                          value={form.email}
                          onChange={update("email")}
                          className={inputClass}
                          autoComplete="email"
                        />
                        {errors.email && (
                          <p className="text-[11px] text-se-red-bright mt-2 font-accent">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Inquiry Type + Order Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass} htmlFor="cs-inquiry">
                          Inquiry Type
                        </label>
                        <select
                          id="cs-inquiry"
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
                        <label className={labelClass} htmlFor="cs-order">
                          Order Number{" "}
                          <span className="text-se-steel/40">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="cs-order"
                          type="text"
                          value={form.orderNumber}
                          onChange={update("orderNumber")}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className={labelClass} htmlFor="cs-subject">
                        Subject{" "}
                        <span className="text-se-red-bright/70">*</span>
                      </label>
                      <input
                        id="cs-subject"
                        type="text"
                        value={form.subject}
                        onChange={update("subject")}
                        className={inputClass}
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-se-red-bright mt-2 font-accent">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className={labelClass} htmlFor="cs-message">
                        Message{" "}
                        <span className="text-se-red-bright/70">*</span>
                      </label>
                      <textarea
                        id="cs-message"
                        value={form.message}
                        onChange={update("message")}
                        rows={6}
                        className={`${inputClass} resize-none`}
                      />
                      {errors.message && (
                        <p className="text-[11px] text-se-red-bright mt-2 font-accent">
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

                    <div className="pt-3">
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
                      <p className="text-[12px] text-se-red-bright font-accent leading-relaxed">
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
              <Motion.aside
                {...fadeUp}
                className="space-y-8 lg:pt-[72px]"
              >
                {/* Contact Info */}
                <div>
                  <div className="mb-7">
                    <p className={labelClass}>Email</p>
                    <a
                      href={`mailto:${BRAND.supportEmail}`}
                      className="text-[14px] text-se-bone/70 hover:text-se-bone transition-colors duration-200"
                    >
                      {BRAND.supportEmail}
                    </a>
                  </div>
                  <div className="mb-7">
                    <p className={labelClass}>Response Time</p>
                    <p className="text-[14px] text-se-bone/70">
                      Within 24 hours
                    </p>
                  </div>
                  <div>
                    <p className={labelClass}>Based In</p>
                    <p className="text-[14px] text-se-bone/70">
                      {BRAND.origin}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06]" />

                {/* Quick Links */}
                <div>
                  <p className={labelClass}>Quick Links</p>
                  <div className="space-y-3.5 mt-4">
                    {[
                      { label: "Frequently Asked Questions", href: "/faqs" },
                      { label: "Returns & Exchanges", href: "/returns" },
                      { label: "Shipping Information", href: "/shipping" },
                      { label: "Size Guide", href: "/size-guide" },
                      { label: "Track My Order", href: "/account" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="flex items-center justify-between text-[13px] text-se-bone/40 hover:text-se-bone transition-colors duration-200 group"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight
                          size={11}
                          className="text-se-steel/40 group-hover:text-se-bone transition-colors duration-200"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </Motion.aside>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ───────────────────────────────────────────── */}
        <section className="py-16 md:py-28 border-b border-white/[0.04]">
          <div className="content-wide">
            <div className="grid lg:grid-cols-[280px,1fr] gap-12 lg:gap-20">
              {/* Section Header — Sticky on desktop */}
              <Motion.div {...fadeUp} className="lg:sticky lg:top-32 lg:self-start">
                <p className="section-eyebrow mb-3">Common Questions</p>
                <h2 className="font-display text-[clamp(1.3rem,3vw,2rem)] tracking-[0.06em] mb-4">
                  FREQUENTLY
                  <br className="hidden lg:block" />
                  {" "}ASKED
                </h2>
                <p className="text-[13px] text-se-bone/30 leading-[1.7] mb-6">
                  Answers to the most common inquiries. For anything else,{" "}
                  <a href="#contact" className="text-se-bone/50 underline underline-offset-4 decoration-white/10 hover:text-se-bone transition-colors duration-200">
                    reach out directly
                  </a>.
                </p>
                <Link
                  to="/faqs"
                  className="inline-flex items-center gap-2 text-[10px] font-accent tracking-[0.16em] uppercase text-se-bone/30 hover:text-se-bone transition-colors duration-200"
                >
                  View All FAQs
                  <ArrowRight size={10} />
                </Link>
              </Motion.div>

              {/* Accordion */}
              <div className="border-t border-white/[0.06]">
                {FAQS.map((faq, i) => (
                  <FaqItem
                    key={i}
                    q={faq.q}
                    a={faq.a}
                    index={i}
                    isOpen={openFaq === i}
                    onToggle={() =>
                      setOpenFaq(openFaq === i ? null : i)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Consultation / Personalized Assistance ────────────────── */}
        <section className="py-20 md:py-32">
          <div className="content-wide">
            <div className="max-w-xl mx-auto text-center">
              <Motion.div {...fadeUp}>
                <p className="section-eyebrow mb-5">
                  Personalized Assistance
                </p>
                <h2 className="font-display text-[clamp(1.5rem,4vw,2.4rem)] tracking-[0.05em] leading-[1.1] mb-6">
                  NEED HELP
                  <br />
                  CHOOSING?
                </h2>
                <p className="text-[14px] text-se-bone/35 leading-[1.75] mb-10 max-w-md mx-auto">
                  Whether it&apos;s sizing, fit, fabric weight, or finding the
                  right piece for a specific look — we&apos;d be happy to help
                  guide your selection.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="#contact" className="btn-primary">
                    Contact Our Team
                  </a>
                  <a
                    href={`mailto:${BRAND.supportEmail}`}
                    className="btn-outline inline-flex items-center gap-2.5"
                  >
                    <Mail size={13} strokeWidth={1.5} /> {BRAND.supportEmail}
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

// src/pages/Contact.jsx — Style Eternal (Pass 2)
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Mail, MapPin, Clock, MessageCircle, CheckCircle } from "lucide-react";
import SEO from "../components/SEO";
import { BRAND } from "../config/brand";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, ease: [0.2, 0, 0, 1] },
};

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", orderNumber: "", reason: "", message: "", website: "",
  });
  const [status, setStatus] = useState("idle");

  const update = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.website) return; // honeypot
    setStatus("loading");
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <SEO title="Contact — Style Eternal" description="Get in touch with the Style Eternal team. Order questions, returns, collaborations, and more." />

      <div className="bg-se-black text-se-bone min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-12 md:pt-40 md:pb-20 border-b border-white/5">
          <div className="content-wide">
            <Motion.div {...fadeUp}>
              <p className="section-eyebrow mb-4">Concierge</p>
              <h1 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] tracking-[0.04em] mb-4">
                GET IN<br />TOUCH
              </h1>
              <p className="text-[15px] text-se-bone/40 max-w-md">
                Questions about an order, a product, or a partnership? Our team responds within 24 hours.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="section-pad">
          <div className="content-wide">
            <div className="grid md:grid-cols-[1fr,0.55fr] gap-12 md:gap-16">
              {/* Form */}
              {status === "success" ? (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 text-center"
                >
                  <CheckCircle size={40} className="mx-auto text-se-gold mb-6" />
                  <h2 className="font-display text-[26px] tracking-[0.06em] mb-4">MESSAGE RECEIVED</h2>
                  <p className="text-[14px] text-se-bone/40 mb-2">We&apos;ll get back to you within 24 hours.</p>
                  <p className="text-[13px] text-se-steel">Check your email for a confirmation.</p>
                </Motion.div>
              ) : (
                <Motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">First Name</label>
                      <input type="text" value={form.firstName} onChange={update("firstName")} required
                        className="w-full px-4 py-3.5 bg-se-charcoal border border-white/8 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold/50 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Last Name</label>
                      <input type="text" value={form.lastName} onChange={update("lastName")} required
                        className="w-full px-4 py-3.5 bg-se-charcoal border border-white/8 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold/50 transition" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Email</label>
                    <input type="email" value={form.email} onChange={update("email")} required
                      className="w-full px-4 py-3.5 bg-se-charcoal border border-white/8 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold/50 transition" />
                  </div>

                  <div>
                    <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Order Number <span className="text-se-steel/50">(optional)</span></label>
                    <input type="text" value={form.orderNumber} onChange={update("orderNumber")}
                      className="w-full px-4 py-3.5 bg-se-charcoal border border-white/8 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold/50 transition" />
                  </div>

                  <div>
                    <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Reason</label>
                    <select value={form.reason} onChange={update("reason")} required
                      className="w-full px-4 py-3.5 bg-se-charcoal border border-white/8 text-se-bone text-[13px] font-accent focus:outline-none focus:border-se-gold/50 transition">
                      <option value="">Select a reason</option>
                      <option value="order">Order Question</option>
                      <option value="return">Return / Exchange</option>
                      <option value="product">Product Question</option>
                      <option value="sizing">Sizing Help</option>
                      <option value="collab">Collaboration</option>
                      <option value="press">Press Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Message</label>
                    <textarea value={form.message} onChange={update("message")} required rows={5}
                      className="w-full px-4 py-3.5 bg-se-charcoal border border-white/8 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold/50 transition resize-none" />
                  </div>

                  {/* Honeypot */}
                  <input type="text" value={form.website} onChange={update("website")} className="hidden" tabIndex={-1} autoComplete="off" />

                  <button type="submit" disabled={status === "loading"} className="btn-primary w-full md:w-auto">
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </button>

                  {status === "error" && (
                    <p className="text-[12px] text-se-red-bright font-accent">Something went wrong. Please try again.</p>
                  )}
                </Motion.form>
              )}

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="concierge-card">
                  <div className="flex items-start gap-3 mb-5">
                    <Mail size={16} className="text-se-gold mt-0.5" />
                    <div>
                      <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-1">Email</p>
                      <a href={`mailto:${BRAND.supportEmail}`} className="text-[14px] text-se-bone/80 hover:text-se-bone transition">{BRAND.supportEmail}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-5">
                    <MapPin size={16} className="text-se-gold mt-0.5" />
                    <div>
                      <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-1">Based In</p>
                      <p className="text-[14px] text-se-bone/80">{BRAND.origin}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-se-gold mt-0.5" />
                    <div>
                      <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-1">Response Time</p>
                      <p className="text-[14px] text-se-bone/80">Within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="concierge-card">
                  <div className="flex items-start gap-3">
                    <MessageCircle size={16} className="text-se-gold mt-0.5" />
                    <div>
                      <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-2">Quick Links</p>
                      <div className="space-y-2 text-[13px]">
                        <Link to="/faqs" className="block text-se-bone/50 hover:text-se-bone transition">FAQs</Link>
                        <Link to="/returns" className="block text-se-bone/50 hover:text-se-bone transition">Shipping & Returns</Link>
                        <Link to="/account" className="block text-se-bone/50 hover:text-se-bone transition">Track My Order</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

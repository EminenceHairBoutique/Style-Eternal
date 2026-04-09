// src/pages/Contact.jsx — Style Eternal
import React, { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import SEO from "../components/SEO";
import { BRAND } from "../config/brand";

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
      <SEO title="Contact — Style Eternal" description="Get in touch with Style Eternal." />

      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <p className="text-overline mb-4">Support</p>
            <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em] mb-4">
              CONTACT
            </h1>
            <p className="text-[15px] text-se-bone/40 max-w-md">
              Questions about an order, a product, or anything else? We'll get back to you.
            </p>
          </div>
        </section>

        <section className="section-pad">
          <div className="content-wide">
            <div className="grid md:grid-cols-[1fr,0.6fr] gap-12 md:gap-20">
              {/* Form */}
              {status === "success" ? (
                <div className="py-16 text-center">
                  <h2 className="font-display text-[24px] tracking-[0.08em] mb-4">MESSAGE SENT</h2>
                  <p className="text-[14px] text-se-bone/40">We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">First Name</label>
                      <input type="text" value={form.firstName} onChange={update("firstName")} required
                        className="w-full px-4 py-3 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Last Name</label>
                      <input type="text" value={form.lastName} onChange={update("lastName")} required
                        className="w-full px-4 py-3 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Email</label>
                    <input type="email" value={form.email} onChange={update("email")} required
                      className="w-full px-4 py-3 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition" />
                  </div>

                  <div>
                    <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Order Number (optional)</label>
                    <input type="text" value={form.orderNumber} onChange={update("orderNumber")}
                      className="w-full px-4 py-3 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition" />
                  </div>

                  <div>
                    <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Reason</label>
                    <select value={form.reason} onChange={update("reason")} required
                      className="w-full px-4 py-3 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent focus:outline-none focus:border-se-gold transition">
                      <option value="">Select a reason</option>
                      <option value="order">Order question</option>
                      <option value="return">Return / Exchange</option>
                      <option value="product">Product question</option>
                      <option value="collab">Collaboration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel block mb-2">Message</label>
                    <textarea value={form.message} onChange={update("message")} required rows={5}
                      className="w-full px-4 py-3 bg-se-charcoal border border-white/10 text-se-bone text-[13px] font-accent placeholder:text-se-steel focus:outline-none focus:border-se-gold transition resize-none" />
                  </div>

                  {/* Honeypot */}
                  <input type="text" value={form.website} onChange={update("website")} className="hidden" tabIndex={-1} autoComplete="off" />

                  <button type="submit" disabled={status === "loading"} className="btn-primary w-full md:w-auto">
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </button>

                  {status === "error" && (
                    <p className="text-[12px] text-se-red-bright font-accent">Something went wrong. Try again.</p>
                  )}
                </form>
              )}

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="border border-white/5 bg-se-charcoal p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Mail size={16} className="text-se-gold mt-0.5" />
                    <div>
                      <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-1">Email</p>
                      <p className="text-[14px]">{BRAND.supportEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-se-gold mt-0.5" />
                    <div>
                      <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-1">Based In</p>
                      <p className="text-[14px]">{BRAND.origin}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-white/5 bg-se-charcoal p-6">
                  <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-se-steel mb-3">Response Time</p>
                  <p className="text-[14px] text-se-bone/50 leading-relaxed">
                    We respond to all inquiries within 24–48 hours. For urgent order issues, include your order number.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// src/components/FitFinder.jsx — AI size recommendation on the PDP
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import useFocusTrap from "../hooks/useFocusTrap";

export default function FitFinder({ open, onClose, product, onPick }) {
  const [form, setForm] = useState({ height: "", weight: "", fitPref: "regular", knownBrand: "", knownSize: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const trapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setError("");
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fitfinder",
          product: {
            name: product?.displayName || product?.name,
            fit: product?.fit,
            fabric: product?.fabric,
            weight: product?.weight,
            sizes: product?.sizes,
          },
          answers: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fit finder failed");
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label="Find my size"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-se-charcoal border border-white/10 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-se-gold font-accent">AI Fit Finder</p>
            <h3 className="font-display text-[15px] tracking-[0.08em] text-se-bone mt-0.5">FIND MY SIZE</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-se-steel hover:text-se-bone">
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="p-5">
            <p className="text-[11px] tracking-[0.2em] uppercase text-se-steel font-accent mb-2">Recommended size</p>
            <p className="font-display text-4xl text-se-gold tracking-[0.1em] mb-3">{result.size}</p>
            <p className="text-[13px] text-se-bone/60 leading-relaxed mb-5">{result.reasoning}</p>
            <div className="flex gap-2">
              {onPick && (
                <button
                  type="button"
                  onClick={() => { onPick(result.size); onClose(); }}
                  className="btn-primary flex-1 py-2.5 text-[11px] tracking-[0.15em]"
                >
                  Select {result.size}
                </button>
              )}
              <button type="button" onClick={() => setResult(null)} className="btn-outline px-4 py-2.5 text-[11px]">
                Retry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Height">
                <input required value={form.height} onChange={(e) => set("height", e.target.value)} placeholder="5'10&quot;" style={inputStyle} />
              </Field>
              <Field label="Weight">
                <input required value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="170 lb" style={inputStyle} />
              </Field>
            </div>
            <Field label="Preferred fit">
              <select value={form.fitPref} onChange={(e) => set("fitPref", e.target.value)} style={inputStyle}>
                <option value="slim">Slim</option>
                <option value="regular">Regular</option>
                <option value="oversized">Oversized</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="A brand you know">
                <input value={form.knownBrand} onChange={(e) => set("knownBrand", e.target.value)} placeholder="e.g. Nike" style={inputStyle} />
              </Field>
              <Field label="Your size there">
                <input value={form.knownSize} onChange={(e) => set("knownSize", e.target.value)} placeholder="L" style={inputStyle} />
              </Field>
            </div>
            {error && <p className="text-[12px] text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[11px] tracking-[0.15em]">
              {loading ? "Finding your size…" : "Find my size"}
            </button>
            <p className="text-[10px] text-se-steel text-center">AI guidance — not a guarantee. Check the size guide too.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-accent tracking-[0.12em] uppercase text-se-steel mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  background: "#0A0A0A",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#E8E4DE",
  padding: "0.5rem 0.65rem",
  fontSize: "13px",
  borderRadius: "3px",
};

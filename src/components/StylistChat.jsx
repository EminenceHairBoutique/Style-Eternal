// src/components/StylistChat.jsx — Style Eternal AI stylist
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send } from "lucide-react";
import { buildAiCatalog } from "../utils/aiCatalog";
import useFocusTrap from "../hooks/useFocusTrap";

/**
 * Renders assistant text, turning /products/<slug> links into in-app links.
 */
function AssistantText({ text }) {
  const parts = String(text).split(/(\/products\/[a-z0-9-]+)/gi);
  return (
    <>
      {parts.map((part, i) =>
        /^\/products\/[a-z0-9-]+$/i.test(part) ? (
          <Link key={i} to={part} className="text-se-gold underline underline-offset-2">
            view
          </Link>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

export default function StylistChat() {
  const [open, setOpen] = useState(false);
  const trapRef = useFocusTrap(open);
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setError("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stylist", messages: next, products: buildAiCatalog() }),
      });
      if (!res.ok || !res.body) {
        throw new Error((await res.text().catch(() => "")) || "Stylist unavailable");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
       
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setMessages((m) => m.slice(0, -1)); // drop the empty assistant bubble
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open the Style Eternal stylist"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-se-gold"
          style={{ background: "#c9a96e", color: "#0A0A0A" }}
        >
          <MessageCircle size={18} />
          <span className="text-[11px] font-accent font-semibold tracking-[0.12em] uppercase">Stylist</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-label="Style Eternal stylist"
          className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px]"
        >
          <div className="flex flex-col bg-se-charcoal border border-white/10 rounded-t-lg sm:rounded-lg overflow-hidden h-[70vh] sm:h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ background: "#0f0f0f" }}>
              <div>
                <p className="font-display text-[13px] tracking-[0.2em] text-se-bone">STYLE ETERNAL</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-se-gold font-accent">Stylist</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close stylist" className="text-se-steel hover:text-se-bone">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-[13px] text-se-bone/50 leading-relaxed">
                  Ask me anything — what goes with the North Ward tee, how a hoodie fits, or what to wear for a night out.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <span
                    className={`inline-block max-w-[85%] px-3 py-2 rounded-lg text-[13px] leading-relaxed ${
                      m.role === "user" ? "bg-se-bone text-se-black" : "bg-se-asphalt text-se-bone/90"
                    }`}
                  >
                    {m.role === "assistant" ? <AssistantText text={m.content || "…"} /> : m.content}
                  </span>
                </div>
              ))}
              {error && <p className="text-[12px] text-red-400">{error}</p>}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 p-3 border-t border-white/10"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the stylist…"
                aria-label="Message the stylist"
                className="flex-1 bg-se-black border border-white/10 text-se-bone text-[13px] px-3 py-2 rounded focus:outline-none focus:border-se-gold"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                aria-label="Send message"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded disabled:opacity-40"
                style={{ background: "#c9a96e", color: "#0A0A0A" }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

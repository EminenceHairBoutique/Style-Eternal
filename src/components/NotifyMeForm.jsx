// src/components/NotifyMeForm.jsx — Style Eternal
import React, { useState } from "react";
import { subscribeEmail } from "../utils/subscribe";

const NotifyMeForm = ({
  source = "coming_soon_notify",
  productId = "",
  dropId = "",
  placeholder = "your@email.com",
  ctaText = "Notify Me",
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      await subscribeEmail({
        email,
        source,
        ...(productId ? { productId } : {}),
        ...(dropId ? { dropId } : {}),
      });
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong. Try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-se-gold" />
        <p className="text-[12px] font-accent text-se-bone/80">
          You&rsquo;re on the list. We&rsquo;ll notify you first.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${className}`} noValidate>
      <div className="flex gap-0">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={placeholder}
          required
          autoComplete="email"
          className="flex-1 min-w-0 px-4 py-3 bg-se-asphalt border border-white/10 text-se-bone text-[12px] font-accent placeholder:text-se-steel/60 focus:outline-none focus:border-se-gold/50 transition"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-3 bg-se-bone text-se-black text-[10px] font-accent font-semibold tracking-[0.2em] uppercase hover:bg-se-cream transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? "..." : ctaText}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-1 text-[10px] font-accent text-red-400">
          {errorMsg}
        </p>
      )}
    </form>
  );
};

export default NotifyMeForm;

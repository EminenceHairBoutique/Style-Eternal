/**
 * BlockRenderer — renders a CMS `blocks` array (see page_content migration)
 * with storefront styling. Used by Terms, Privacy, About, FAQ, Returns,
 * Shipping, and the homepage hero.
 *
 * Supported block types: heading, paragraph, image, list, divider, accordion.
 * Paragraph/accordion text supports a tiny subset of markdown: **bold** and
 * [label](href). Rendering is escaped first, so raw HTML in content is inert.
 */
import React, { useState } from "react";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Convert a safe subset of markdown to HTML AFTER escaping, so user content
// can never inject arbitrary tags.
function miniMarkdown(text) {
  let html = escapeHtml(text);
  // **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // [label](href) — only http(s) and relative links allowed
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
    const safe = /^(https?:\/\/|\/)/i.test(href) ? href : "#";
    const external = /^https?:\/\//i.test(safe);
    return `<a href="${safe}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""} class="underline underline-offset-2 hover:text-se-gold transition">${label}</a>`;
  });
  return html;
}

function RichText({ text, className }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: miniMarkdown(text) }} />;
}

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[15px] text-se-bone">{q}</span>
        <span className="text-se-gold text-lg leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="pb-4 text-[14px] text-se-bone/50 leading-relaxed">
          <RichText text={a} />
        </div>
      )}
    </div>
  );
}

function Block({ block }) {
  const { type, data = {} } = block;

  switch (type) {
    case "heading": {
      const level = Math.min(Math.max(Number(data.level) || 2, 1), 4);
      const Tag = `h${level}`;
      const sizes = {
        1: "text-[clamp(2rem,5vw,3.2rem)]",
        2: "text-[clamp(1.5rem,4vw,2.2rem)]",
        3: "text-[clamp(1.2rem,3vw,1.6rem)]",
        4: "text-[1.1rem]",
      };
      return (
        <Tag className={`font-display tracking-[0.04em] text-se-bone mt-10 mb-4 ${sizes[level]}`}>
          {data.text}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="text-[15px] text-se-bone/60 leading-relaxed mb-5">
          <RichText text={data.text} />
        </p>
      );
    case "image":
      return (
        <figure className="my-8">
          <img src={data.url} alt={data.alt || ""} className="w-full object-cover" loading="lazy" />
          {data.caption && (
            <figcaption className="text-[12px] text-se-steel mt-2 text-center">{data.caption}</figcaption>
          )}
        </figure>
      );
    case "list": {
      const items = Array.isArray(data.items) ? data.items : [];
      const cls = "text-[15px] text-se-bone/60 leading-relaxed mb-5 ml-5 space-y-1";
      return data.style === "number" ? (
        <ol className={`list-decimal ${cls}`}>
          {items.map((it, i) => <li key={i}><RichText text={it} /></li>)}
        </ol>
      ) : (
        <ul className={`list-disc ${cls}`}>
          {items.map((it, i) => <li key={i}><RichText text={it} /></li>)}
        </ul>
      );
    }
    case "divider":
      return <hr className="border-white/10 my-8" />;
    case "accordion": {
      const items = Array.isArray(data.items) ? data.items : [];
      return (
        <div className="my-6">
          {items.map((it, i) => <AccordionItem key={i} q={it.q} a={it.a} />)}
        </div>
      );
    }
    default:
      return null;
  }
}

export default function BlockRenderer({ blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  return (
    <>
      {blocks.map((b, i) => (
        <Block key={b.id || i} block={b} />
      ))}
    </>
  );
}

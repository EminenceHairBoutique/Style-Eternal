import { Fragment } from "react";
import { Link } from "react-router-dom";

/**
 * Reusable breadcrumb trail with matching BreadcrumbList structured data.
 *
 * items: [{ label, to? }] — every item except the last should have a `to`.
 * The last item renders as the current page (gold, aria-current).
 *
 * Mirrors the inline trail originally built on the PDP so the look is
 * identical site-wide. Emits JSON-LD so each page gains breadcrumb rich
 * results (crawlers read it from the rendered DOM).
 */
export default function Breadcrumbs({ items = [], className = "content-wide pt-6 pb-4" }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://www.shopstyleeternal.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      ...(it.to ? { item: `${origin}${it.to}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-accent tracking-[0.08em]">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${it.label}-${i}`}>
              {i > 0 && (
                <li className="text-se-steel/40" aria-hidden="true">
                  /
                </li>
              )}
              <li>
                {last || !it.to ? (
                  <span
                    aria-current="page"
                    className="text-se-gold truncate max-w-[55vw] sm:max-w-none"
                  >
                    {it.label}
                  </span>
                ) : (
                  <Link
                    to={it.to}
                    className="text-se-steel hover:text-se-bone transition-colors focus-visible:outline-none focus-visible:text-se-bone focus-visible:underline"
                  >
                    {it.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </nav>
  );
}

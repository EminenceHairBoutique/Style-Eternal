/**
 * CmsPageShell — storefront wrapper used when a legal/info page has CMS content.
 * Renders the standard Style Eternal page header + a BlockRenderer body.
 * Pages fall back to their original hardcoded JSX when no blocks exist.
 */
import React from "react";
import SEO from "./SEO";
import BlockRenderer from "./BlockRenderer";
import Breadcrumbs from "./Breadcrumbs";

export default function CmsPageShell({ seoTitle, seoDescription, overline, title, blocks }) {
  return (
    <>
      <SEO title={seoTitle} description={seoDescription} />
      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
          <div className="content-wide">
            <Breadcrumbs
              className="pb-4"
              items={[{ label: "Home", to: "/" }, { label: title }]}
            />
            {overline && <p className="text-overline mb-4">{overline}</p>}
            <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em]">
              {title}
            </h1>
          </div>
        </section>
        <section className="section-pad">
          <div className="content-wrap max-w-3xl">
            <BlockRenderer blocks={blocks} />
          </div>
        </section>
      </div>
    </>
  );
}

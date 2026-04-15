/*
  Build-time SEO generator for Vite SPA deployments on Vercel.

  Why this exists:
  - React Router SPAs render <title>/<meta> client-side.
  - Search engines and social crawlers (iMessage, Facebook, X, etc.) often need
    route-specific HTML on first request for reliable indexing + link previews.

  What this script does (post-build):
  - Reads dist/index.html
  - Writes dist/<route>/index.html pages for important routes (products, collections, etc.)
  - Generates dist/sitemap.xml
  - Writes dist/robots.txt (overriding any from /public)

  Run via package.json: "vite build && node scripts/generate-static-seo.mjs"
*/

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");

const SITE_NAME = "Style Eternal";
const DEFAULT_DESCRIPTION =
  "Premium streetwear. Limited drops. Timeless design. Shop tees, hoodies, outerwear, and more.";

const SITE_URL = String(
  process.env.VITE_SITE_URL || process.env.SITE_URL || "https://www.styleeternal.com"
).replace(/\/+$/, "");

const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/se_og_banner.jpg`;

const SEO_BEGIN = "<!-- SEO:BEGIN -->";
const SEO_END = "<!-- SEO:END -->";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function abs(pathOrUrl) {
  const val = String(pathOrUrl || "").trim();
  if (!val) return "";
  if (/^https?:\/\//i.test(val)) return val;
  return `${SITE_URL}${val.startsWith("/") ? "" : "/"}${val}`;
}

function ensureSiteUrl(pathname) {
  const p = String(pathname || "/");
  if (p === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

function replaceSeoBlock(html, newBlock) {
  const start = html.indexOf(SEO_BEGIN);
  const end = html.indexOf(SEO_END);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "Could not find SEO markers in dist/index.html. Ensure index.html contains <!-- SEO:BEGIN --> and <!-- SEO:END -->."
    );
  }
  return (
    html.slice(0, start + SEO_BEGIN.length) +
    "\n" +
    newBlock.trim() +
    "\n" +
    html.slice(end)
  );
}

function renderJsonLd({ url, title, description, images, product }) {
  const graph = [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: images?.[0] || DEFAULT_OG_IMAGE,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
    },
  ];

  if (product) {
    graph.push(product);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function renderSeoMeta({
  pathname,
  title,
  description,
  images = [],
  ogType = "website",
  noindex = false,
  jsonLd,
}) {
  const url = ensureSiteUrl(pathname);
  const cleanTitle = String(title || "").trim() || SITE_NAME;
  const finalTitle = cleanTitle.includes(SITE_NAME)
    ? cleanTitle
    : `${cleanTitle} | ${SITE_NAME}`;
  const finalDescription = String(description || DEFAULT_DESCRIPTION).trim();

  const imgList = (Array.isArray(images) ? images : [])
    .map(abs)
    .filter(Boolean);
  const finalImages = imgList.length ? imgList : [DEFAULT_OG_IMAGE];

  const robotsContent = noindex
    ? "noindex,nofollow"
    : "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";

  const lines = [];

  lines.push(`  <title>${escapeHtml(finalTitle)}</title>`);
  lines.push(
    `  <meta name="description" content="${escapeHtml(finalDescription)}" />`
  );
  lines.push(`  <link rel="canonical" href="${escapeHtml(url)}" />`);

  lines.push(`  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`);
  lines.push(`  <meta property="og:title" content="${escapeHtml(finalTitle)}" />`);
  lines.push(
    `  <meta property="og:description" content="${escapeHtml(finalDescription)}" />`
  );
  for (const img of finalImages) {
    lines.push(`  <meta property="og:image" content="${escapeHtml(img)}" />`);
  }
  lines.push(`  <meta property="og:type" content="${escapeHtml(ogType)}" />`);
  lines.push(`  <meta property="og:url" content="${escapeHtml(url)}" />`);

  lines.push(`  <meta name="twitter:card" content="summary_large_image" />`);
  lines.push(`  <meta name="twitter:title" content="${escapeHtml(finalTitle)}" />`);
  lines.push(
    `  <meta name="twitter:description" content="${escapeHtml(finalDescription)}" />`
  );
  lines.push(`  <meta name="twitter:image" content="${escapeHtml(finalImages[0])}" />`);

  lines.push(`  <meta name="robots" content="${escapeHtml(robotsContent)}" />`);
  if (jsonLd) {
    const safeJson = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
    lines.push('  <script type="application/ld+json" id="ld-json">');
    lines.push(`    ${safeJson}`);
    lines.push("  </script>");
  }

  return lines.join("\n");
}

function buildOffersForProduct(p) {
  // Price range (many variants) → AggregateOffer
  let low = null;
  let high = null;
  let offerCount = 0;

  try {
    const lengths = Array.isArray(p.lengths) ? p.lengths : [];
    const densities = Array.isArray(p.densities) ? p.densities : [];
    const laceOptions = p.type === "wig" ? ["Transparent Lace", "HD Lace"] : [null];

    for (const L of lengths) {
      for (const D of densities) {
        for (const lace of laceOptions) {
          const price =
            typeof p.price === "function"
              ? Number(p.price(L, D, lace || undefined) || 0)
              : 0;
          if (!price) continue;
          offerCount += 1;
          low = low == null ? price : Math.min(low, price);
          high = high == null ? price : Math.max(high, price);
        }
      }
    }
  } catch {
    // If pricing changes, fall back to no offers.
  }

  if (low == null) return null;

  const url = ensureSiteUrl(`/products/${p.slug}`);

  if (low === high) {
    return {
      "@type": "Offer",
      price: low,
      priceCurrency: "USD",
      url,
    };
  }

  return {
    "@type": "AggregateOffer",
    lowPrice: low,
    highPrice: high,
    offerCount: offerCount || undefined,
    priceCurrency: "USD",
    url,
  };
}

async function main() {
  // Ensure dist exists
  await fs.mkdir(DIST_DIR, { recursive: true });

  const indexPath = path.join(DIST_DIR, "index.html");
  const baseHtml = await fs.readFile(indexPath, "utf8");

  // Import products (ESM)
  const productsModulePath = pathToFileURL(
    path.join(ROOT, "src", "data", "products.js")
  ).href;
  const { products } = await import(productsModulePath);

  const collectionSlugs = Array.from(
    new Set(
      (products || [])
        .map((p) => String(p.collectionSlug || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const COLLECTION_META = {
    "north-ward": {
      title: "North Ward",
      description:
        "Utility-driven streetwear rooted in grit and resilience — heavyweight pieces built for the everyday.",
    },
    "iron-bound": {
      title: "Iron Bound",
      description:
        "Industrial-inspired silhouettes and bold graphics — forged in concrete and steel.",
    },
    essentials: {
      title: "Essentials",
      description:
        "Core staples designed for daily rotation — clean lines, premium fabrics, timeless fit.",
    },
    legacy: {
      title: "Legacy",
      description:
        "Heritage pieces that define the brand — iconic cuts and signature details.",
    },
    graphics: {
      title: "Graphics",
      description:
        "Statement graphic tees and hoodies — wearable art with a streetwear edge.",
    },
    "love-never-dies": {
      title: "Love Never Dies",
      description:
        "A capsule celebrating devotion — romantic motifs meet raw streetwear energy.",
    },
    archive: {
      title: "Archive",
      description:
        "Past drops and limited editions — once they're gone, they're gone.",
    },
  };

  const staticRoutes = [
    {
      pathname: "/",
      title: "Premium Streetwear — Limited Drops",
      description:
        "Style Eternal — premium streetwear designed for those who move with intention. Shop tees, hoodies, outerwear, and more.",
      ogType: "website",
    },
    {
      pathname: "/shop",
      title: "Shop All",
      description: "Browse the full Style Eternal collection — tees, hoodies, outerwear, bottoms, headwear, and accessories.",
      ogType: "website",
    },

    {
      pathname: "/shop/tees",
      title: "Shop Tees",
      description: "Premium graphic and essential tees from Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/shop/hoodies",
      title: "Shop Hoodies",
      description: "Heavyweight hoodies and pullovers from Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/shop/outerwear",
      title: "Shop Outerwear",
      description: "Jackets, coaches, and layering pieces from Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/shop/bottoms",
      title: "Shop Bottoms",
      description: "Joggers, cargos, and essential bottoms from Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/shop/headwear",
      title: "Shop Headwear",
      description: "Caps, beanies, and headwear from Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/shop/accessories",
      title: "Shop Accessories",
      description: "Bags, socks, and accessories from Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/shop/preorders",
      title: "Pre-Orders",
      description: "Upcoming drops available for pre-order. Secure yours before they sell out.",
      ogType: "website",
    },

    {
      pathname: "/drops",
      title: "Drops",
      description: "Upcoming and past limited releases from Style Eternal. Stay ahead of every drop.",
      ogType: "website",
    },
    {
      pathname: "/editorial",
      title: "Editorial",
      description: "Lookbooks, campaigns, and visual stories from Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/community",
      title: "Community",
      description: "Join the Style Eternal community — events, features, and culture.",
      ogType: "website",
    },

    {
      pathname: "/collections",
      title: "Collections",
      description: "Explore curated collections from Style Eternal.",
      ogType: "website",
    },

    {
      pathname: "/about",
      title: "About",
      description: "The story behind Style Eternal and our commitment to premium streetwear.",
      ogType: "website",
    },
    {
      pathname: "/contact",
      title: "Contact",
      description: "Get in touch with Style Eternal for support and inquiries.",
      ogType: "website",
    },
    {
      pathname: "/returns",
      title: "Returns & Exchanges",
      description: "Read our returns and exchanges policy.",
      ogType: "website",
    },
    {
      pathname: "/rewards",
      title: "Rewards — Eternal Rewards Program",
      description:
        "Join the Eternal Rewards program. Earn points, unlock tiers, and access exclusive perks as a Style Eternal member.",
      ogType: "website",
    },
    {
      pathname: "/shipping",
      title: "Shipping Information",
      description:
        "Shipping options, delivery times, and packaging details for Style Eternal orders.",
      ogType: "website",
    },
    {
      pathname: "/size-guide",
      title: "Size Guide",
      description:
        "Find your perfect fit with Style Eternal size charts for tees, hoodies, outerwear, bottoms, and headwear.",
      ogType: "website",
    },
    {
      pathname: "/faqs",
      title: "FAQs",
      description: "Shipping, returns, sizing, and product questions.",
      ogType: "website",
    },
    {
      pathname: "/privacy",
      title: "Privacy Policy",
      description: "Read how Style Eternal handles your data.",
      ogType: "website",
    },

    {
      pathname: "/privacy-choices",
      title: "Your Privacy Choices",
      description: "Manage your privacy preferences and cookie settings for Style Eternal.",
      ogType: "website",
    },

    {
      pathname: "/terms",
      title: "Terms & Conditions",
      description: "Terms and conditions for shopping with Style Eternal.",
      ogType: "website",
    },

    // Noindex routes (not in sitemap)
    {
      pathname: "/checkout",
      title: "Secure Checkout",
      description: "Encrypted checkout with premium packaging.",
      ogType: "website",
      noindex: true,
    },
    {
      pathname: "/success",
      title: "Order Confirmed",
      description: "Your Style Eternal order has been successfully placed.",
      ogType: "website",
      noindex: true,
    },
    {
      pathname: "/cancel",
      title: "Payment Cancelled",
      description: "Your payment was cancelled.",
      ogType: "website",
      noindex: true,
    },
    {
      pathname: "/account",
      title: "My Account",
      description: "Manage your Style Eternal account, orders, and preferences.",
      ogType: "website",
      noindex: true,
    },
    {
      pathname: "/cart",
      title: "Cart",
      description: "Review your cart items.",
      ogType: "website",
      noindex: true,
    },
  ];

  // Collection pages
  const collectionRoutes = collectionSlugs.map((slug) => {
    const meta = COLLECTION_META[String(slug).toLowerCase()];
    const title = meta?.title || String(slug)
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      pathname: `/collections/${slug}`,
      title: `${title} | Collections`,
      description:
        meta?.description ||
        "A Style Eternal collection — premium streetwear designed for those who move with intention.",
      ogType: "website",
    };
  });

  // Product pages
  const productRoutes = (products || []).map((p) => {
    const title = p.displayName || p.name || "Product";
    const description = p.description || DEFAULT_DESCRIPTION;

    // Always include a JPEG-safe banner first for maximum compatibility.
    const images = [DEFAULT_OG_IMAGE, ...(Array.isArray(p.images) ? p.images.slice(0, 1).map(abs) : [])];

    const url = ensureSiteUrl(`/products/${p.slug}`);
    const offers = buildOffersForProduct(p);

    const productJsonLd = {
      "@type": "Product",
      "@id": `${url}#product`,
      name: title,
      description,
      sku: p.verificationCode,
      brand: { "@type": "Brand", name: SITE_NAME },
      url,
      image: (Array.isArray(p.images) ? p.images.map(abs).filter(Boolean) : []).slice(0, 10),
      ...(offers ? { offers } : {}),
    };

    return {
      pathname: `/products/${p.slug}`,
      title,
      description,
      ogType: "product",
      images,
      jsonLd: renderJsonLd({
        url,
        title: `${title} | ${SITE_NAME}`,
        description,
        images,
        product: productJsonLd,
      }),
    };
  });

  const routes = [...staticRoutes, ...collectionRoutes, ...productRoutes];

  // Write route HTML files
  for (const route of routes) {
    const pathname = route.pathname;

    const url = ensureSiteUrl(pathname);
    const images = route.images || [DEFAULT_OG_IMAGE];

    const jsonLd =
      route.jsonLd ||
      renderJsonLd({
        url,
        title: route.title,
        description: route.description,
        images: images.map(abs),
      });

    const seoBlock = renderSeoMeta({
      pathname,
      title: route.title,
      description: route.description,
      images,
      ogType: route.ogType,
      noindex: Boolean(route.noindex),
      jsonLd,
    });

    const finalHtml = replaceSeoBlock(baseHtml, seoBlock);

    // / -> dist/index.html, /path -> dist/path/index.html
    const outFile =
      pathname === "/"
        ? path.join(DIST_DIR, "index.html")
        : path.join(DIST_DIR, pathname.replace(/^\//, ""), "index.html");

    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, finalHtml, "utf8");
  }

  // robots.txt (override)
  const robots = [
    "User-agent: *",
    "Allow: /",
    "",
    "Disallow: /api/",
    "Disallow: /checkout",
    "Disallow: /success",
    "Disallow: /cancel",
    "Disallow: /account",
    "Disallow: /cart",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");

  await fs.writeFile(path.join(DIST_DIR, "robots.txt"), robots, "utf8");

  // sitemap.xml
  const today = new Date().toISOString().slice(0, 10);
  const sitemapRoutes = routes
    .filter((r) => !r.noindex)
    .map((r) => ensureSiteUrl(r.pathname))
    .filter((u) => !u.includes("/account"))
    .sort();

  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapRoutes
      .map(
        (loc) =>
          `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  await fs.writeFile(path.join(DIST_DIR, "sitemap.xml"), sitemap, "utf8");

  // Small log for Vercel builds
  console.log(`[seo] wrote ${routes.length} route HTML files`);
  console.log(`[seo] wrote sitemap.xml (${sitemapRoutes.length} urls)`);
  console.log(`[seo] wrote robots.txt`);
}

main().catch((err) => {
  console.error("[seo] generation failed:", err);
  process.exit(1);
});

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
  "Premium streetwear rooted in Newark’s North Ward. Pieces with weight. Style that outlives trends.";

const SITE_URL = String(
  process.env.VITE_SITE_URL || process.env.SITE_URL || "https://www.styleeternal.com"
).replace(/\/+$/, "");

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listImageFiles(dirPath) {
  if (!(await fileExists(dirPath))) return [];

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return listImageFiles(fullPath);
      }

      if (entry.isFile() && /\.(avif|gif|jpe?g|png|webp)$/i.test(entry.name)) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
}

async function resolveDefaultOgImage() {
  const preferredRelativePath = "/assets/se_og_banner.jpg";
  const preferredDistPath = path.join(DIST_DIR, preferredRelativePath.replace(/^\//, ""));

  if (await fileExists(preferredDistPath)) {
    return `${SITE_URL}${preferredRelativePath}`;
  }

  const assetFiles = await listImageFiles(path.join(DIST_DIR, "assets"));
  if (!assetFiles.length) return "";

  const scoreAsset = (filePath) => {
    const name = path.basename(filePath).toLowerCase();
    if (/og|open-graph|social|share/.test(name)) return 4;
    if (/banner/.test(name)) return 3;
    if (/hero/.test(name)) return 2;
    if (/logo/.test(name)) return 1;
    return 0;
  };

  const [bestMatch] = [...assetFiles].sort((a, b) => {
    const scoreDiff = scoreAsset(b) - scoreAsset(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.localeCompare(b);
  });

  const relativePath = path.relative(DIST_DIR, bestMatch).split(path.sep).join("/");
  return `${SITE_URL}/${relativePath}`;
}

const DEFAULT_OG_IMAGE = await resolveDefaultOgImage();

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
  // Flat apparel pricing — single price per product
  const price = typeof p.price === "number" ? p.price : 0;
  if (!price) return null;

  const url = ensureSiteUrl(`/products/${p.slug}`);

  return {
    "@type": "Offer",
    price,
    priceCurrency: "USD",
    url,
    availability: p.releaseStatus === "sold-out"
      ? "https://schema.org/SoldOut"
      : p.releaseStatus === "preorder"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
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
        "The North Ward collection draws from Newark's most storied neighborhood. Heavyweight streetwear built for presence.",
    },
    "iron-bound": {
      title: "Iron Bound",
      description:
        "Named for the Ironbound District. Where immigrant grit meets modern streetwear. Garment-washed. Utility-driven.",
    },
    "love-never-dies": {
      title: "Love Never Dies",
      description:
        "Drop 03. Five pieces. Skeleton tees, heavyweight hoodies, statement graphics. The realest collection yet.",
    },
    essentials: {
      title: "Essentials",
      description:
        "Core pieces that anchor every rotation. Minimal branding. Maximum quality. Built to be worn on repeat.",
    },
    legacy: {
      title: "Legacy",
      description:
        "Limited capsule pieces that define the brand's premium tier. Varsity jackets, fitted caps, and statement items.",
    },
    graphics: {
      title: "Graphics",
      description:
        "Graphic-forward pieces. Screenprinted, distressed, layered. Each design carries a narrative.",
    },
    archive: {
      title: "Archive",
      description:
        "Previous releases preserved. Once sold out, they live here. Collector's territory.",
    },
    accessories: {
      title: "Accessories",
      description:
        "Statement accessories. Pins, patches, and premium add-ons for the full Style Eternal look.",
    },
  };

  const staticRoutes = [
    {
      pathname: "/",
      title: "Style Eternal — Born in Newark",
      description:
        "Premium streetwear rooted in Newark\u2019s North Ward. Pieces with weight. Style that outlives trends.",
      ogType: "website",
    },
    {
      pathname: "/shop",
      title: "Shop All",
      description: "Shop premium streetwear by Style Eternal. Tees, hoodies, outerwear, bottoms, and accessories.",
      ogType: "website",
    },
    {
      pathname: "/shop/tees",
      title: "Shop Tees",
      description: "Heavyweight tees by Style Eternal. Oversized fits. Premium prints. Built to last.",
      ogType: "website",
    },
    {
      pathname: "/shop/hoodies",
      title: "Shop Hoodies",
      description: "Heavyweight hoodies by Style Eternal. Brushed fleece. Embroidered details. Made to be worn hard.",
      ogType: "website",
    },
    {
      pathname: "/shop/outerwear",
      title: "Shop Outerwear",
      description: "Premium outerwear by Style Eternal. Varsity jackets and statement layers.",
      ogType: "website",
    },
    {
      pathname: "/shop/bottoms",
      title: "Shop Bottoms",
      description: "Premium bottoms by Style Eternal. Cargo pants, sweats, and utility wear.",
      ogType: "website",
    },
    {
      pathname: "/shop/headwear",
      title: "Shop Headwear",
      description: "Fitted caps and headwear by Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/shop/accessories",
      title: "Shop Accessories",
      description: "Accessories by Style Eternal. Pins, patches, and finishing touches.",
      ogType: "website",
    },
    {
      pathname: "/collections",
      title: "Collections",
      description: "Explore curated collections by Style Eternal. Each drop tells a story.",
      ogType: "website",
    },
    {
      pathname: "/drops",
      title: "Drops",
      description: "Current and upcoming drops from Style Eternal. Limited releases. No restocks.",
      ogType: "website",
    },
    {
      pathname: "/editorial",
      title: "Editorial",
      description: "Stories, lookbooks, and visual culture from Style Eternal.",
      ogType: "website",
    },
    {
      pathname: "/community",
      title: "Community",
      description: "The Style Eternal community. From Newark to the world.",
      ogType: "website",
    },
    {
      pathname: "/about",
      title: "About",
      description: "The story behind Style Eternal. Born in Newark. Built to last.",
      ogType: "website",
    },
    {
      pathname: "/contact",
      title: "Contact",
      description: "Contact Style Eternal for support, press, or wholesale inquiries.",
      ogType: "website",
    },
    {
      pathname: "/faqs",
      title: "FAQs",
      description: "Shipping, returns, sizing, and product questions answered.",
      ogType: "website",
    },
    {
      pathname: "/returns",
      title: "Returns & Exchanges",
      description: "Read our returns and exchanges policy. 30-day returns on unworn items.",
      ogType: "website",
    },
    {
      pathname: "/rewards",
      title: "Rewards \u2014 Eternal Rewards Program",
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
      pathname: "/lookbook",
      title: "Lookbook",
      description:
        "Editorial lookbook by Style Eternal. Premium streetwear styled with intention.",
      ogType: "website",
    },
    {
      pathname: "/privacy",
      title: "Privacy Policy",
      description: "Read how Style Eternal handles your data and protects your privacy.",
      ogType: "website",
    },
    {
      pathname: "/privacy-choices",
      title: "Your Privacy Choices",
      description: "Manage your privacy preferences and cookie settings.",
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
      description: "Secure checkout for your Style Eternal order.",
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
        "A Style Eternal collection. Premium streetwear built with intention.",
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

// src/pages/ProductDetail.jsx — Style Eternal (Streetwear PDP)
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
} from "lucide-react";
import { motion as Motion } from "framer-motion";

import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useProductPrice } from "../hooks/useProductOverlay";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import SEO from "../components/SEO";
import ProductCard from "../components/ProductCard";
import NotifyMeForm from "../components/NotifyMeForm";
import FitFinder from "../components/FitFinder";
import { resolveProductImages } from "../utils/productMedia";

/* ------------------------------------------------------------------ */
/*  Accordion                                                          */
/* ------------------------------------------------------------------ */
function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-[13px] font-accent font-medium tracking-[0.08em] uppercase text-se-bone">
          {title}
        </span>
        <span
          className={`text-se-steel transition-transform duration-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          <Plus size={16} />
        </span>
      </button>

      <Motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="pb-6 text-[13px] leading-relaxed text-se-bone/70 font-body">
          {children}
        </div>
      </Motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Size Guide Table                                                    */
/* ------------------------------------------------------------------ */
function SizeGuideTable({ measurements, sizes }) {
  if (!measurements || !sizes?.length) return null;

  const sampleKeys = Object.keys(measurements[sizes[0]] || {});
  if (!sampleKeys.length) return null;

  const labelMap = {
    chest: "Chest",
    length: "Body Length",
    sleeve: "Sleeve",
    waist: "Waist",
    inseam: "Inseam",
    rise: "Rise",
    thigh: "Thigh",
    hem: "Hem",
  };

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[12px] font-accent">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="text-left py-3 pr-4 text-se-steel font-medium uppercase tracking-[0.1em]">
              Size
            </th>
            {sampleKeys.map((key) => (
              <th
                key={key}
                className="text-left py-3 pr-4 text-se-steel font-medium uppercase tracking-[0.1em]"
              >
                {labelMap[key] || key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size} className="border-b border-white/[0.04]">
              <td className="py-2.5 pr-4 text-se-bone font-medium">{size}</td>
              {sampleKeys.map((key) => (
                <td key={key} className="py-2.5 pr-4 text-se-bone/70">
                  {measurements[size]?.[key] ? `${measurements[size][key]}"` : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-se-steel mt-3">
        All measurements in inches. Measured flat.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Image Gallery — desktop zoom + thumbnails, mobile swipe carousel   */
/* ------------------------------------------------------------------ */
function ProductBadge({ badge }) {
  if (!badge) return null;
  return (
    <div
      className={`absolute top-4 left-4 badge ${
        badge === "Sold Out"
          ? "badge-sold-out"
          : badge === "Limited"
          ? "badge-limited"
          : "badge-new"
      }`}
    >
      {badge}
    </div>
  );
}

function ImageGallery({ images, alt, badge }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const scrollRef = useRef(null);

  // Reset to first image whenever the image set changes (product switch).
  useEffect(() => {
    setActive(0);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [images]);

  const hasMultiple = images.length > 1;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom({ on: true, x, y });
  };
  const onLeave = () => setZoom((z) => ({ ...z, on: false }));

  // Mobile: derive active dot from scroll position.
  const onScroll = (e) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-[3/4] bg-se-charcoal overflow-hidden rounded-sm flex items-center justify-center">
        <span className="font-display text-2xl tracking-[0.3em] text-se-steel/40">SE</span>
        <ProductBadge badge={badge} />
      </div>
    );
  }

  return (
    <div>
      {/* ── Desktop: vertical thumbnails + zoomable main ── */}
      <div className="hidden lg:flex lg:gap-4">
        {hasMultiple && (
          <div className="flex flex-col gap-3">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1} of ${images.length}`}
                aria-current={active === i}
                className="w-[72px] h-[72px] overflow-hidden transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-se-gold"
                style={{
                  borderRadius: "2px",
                  border: `0.5px solid ${active === i ? "#c9a96e" : "#2a2a2a"}`,
                  opacity: active === i ? 1 : 0.65,
                }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div
          className="relative flex-1 aspect-[3/4] bg-se-charcoal overflow-hidden rounded-sm cursor-zoom-in"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${alt} — view ${i + 1}`}
              aria-hidden={i !== active}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: i === active ? 1 : 0,
                transform: zoom.on && i === active ? "scale(1.35)" : "scale(1)",
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
                transition: "opacity 180ms ease, transform 120ms ease-out",
              }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
          <ProductBadge badge={badge} />
        </div>
      </div>

      {/* ── Mobile: swipeable scroll-snap carousel + dots ── */}
      <div className="lg:hidden">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory rounded-sm [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((src, i) => (
            <div key={i} className="snap-center shrink-0 w-full">
              <div className="relative aspect-[3/4] bg-se-charcoal overflow-hidden">
                <img
                  src={src}
                  alt={`${alt} — view ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                {i === 0 && <ProductBadge badge={badge} />}
              </div>
            </div>
          ))}
        </div>

        {hasMultiple && (
          <div className="flex justify-center gap-2 mt-3" role="tablist" aria-label="Image position">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-selected={active === i}
                onClick={() => {
                  setActive(i);
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: "smooth" });
                  }
                }}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{
                  width: active === i ? 20 : 6,
                  background: active === i ? "#c9a96e" : "rgba(232,228,222,0.35)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact product row (Complete the Look / Recently Viewed)          */
/* ------------------------------------------------------------------ */
function ProductRow({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="section-pad border-t border-white/[0.06]">
      <div className="content-wide">
        <h2 className="font-display text-xl tracking-[0.2em] text-se-bone mb-8">{title}</h2>
        <div
          className="flex gap-5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((p) => (
            <div key={p.id} className="shrink-0 w-[200px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Fade-in wrapper                                                     */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

/* ================================================================== */
/*  MAIN COMPONENT                                                      */
/* ================================================================== */
export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart, openCart } = useCart();
  const { recentSlugs, addSlug } = useRecentlyViewed();

  /* ---------- find product ---------- */
  const rawProduct = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug),
    [slug]
  );

  // Overlay live price/compare-at/stock from Supabase (admin-editable).
  const overlay = useProductPrice(rawProduct?.slug);
  const product = useMemo(
    () =>
      rawProduct && overlay
        ? {
            ...rawProduct,
            price: overlay.price != null ? overlay.price : rawProduct.price,
            comparePrice:
              overlay.comparePrice != null ? overlay.comparePrice : rawProduct.comparePrice,
          }
        : rawProduct,
    [rawProduct, overlay]
  );

  /* ---------- images ---------- */
  const images = useMemo(() => resolveProductImages(product), [product]);

  /* ---------- selections ---------- */
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  /* ---------- sticky add-to-cart (mobile) ---------- */
  const addBtnRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);

  /* ---------- AI fit finder ---------- */
  const [fitOpen, setFitOpen] = useState(false);

  /* reset state when product changes */
  useEffect(() => {
    setSelectedSize(null);
    setQuantity(1);
    setSizeError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  /* record recently viewed */
  useEffect(() => {
    if (product?.slug) addSlug(product.slug);
  }, [product?.slug, addSlug]);

  /* ---------- derived ---------- */
  const isSoldOut = product?.releaseStatus === "sold-out";
  const isPreorder = product?.releaseStatus === "preorder";
  const isComingSoon = product?.releaseStatus === "coming-soon";
  const canAddToCart = !isSoldOut && !isComingSoon;

  // Stock urgency: prefer the live Supabase stock, fall back to limitedQty.
  const effectiveStock =
    overlay?.stock != null ? overlay.stock : (typeof product?.limitedQty === "number" ? product.limitedQty : null);
  const lowThreshold = typeof product?.low_stock_threshold === "number" ? product.low_stock_threshold : 5;
  const showOnlyXLeft = effectiveStock != null && effectiveStock > 0 && effectiveStock <= lowThreshold;
  const soldOutSizes = Array.isArray(product?.soldOutSizes) ? product.soldOutSizes : [];

  /* ---------- sticky bar observer ---------- */
  useEffect(() => {
    const el = addBtnRef.current;
    if (!el || !canAddToCart) {
      setShowSticky(false);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [canAddToCart, slug]);

  /* ---------- complete the look (same category, then fill) ---------- */
  const completeTheLook = useMemo(() => {
    if (!product) return [];
    const eligible = (p) => p.id !== product.id && p.releaseStatus !== "coming-soon";
    const sameCat = products.filter((p) => eligible(p) && p.category === product.category);
    let picks = sameCat.slice(0, 4);
    if (picks.length < 4) {
      const chosen = new Set(picks.map((p) => p.id));
      const fill = products
        .filter((p) => eligible(p) && !chosen.has(p.id))
        .slice(0, 4 - picks.length);
      picks = [...picks, ...fill];
    }
    return picks;
  }, [product]);

  /* ---------- recently viewed (excluding current) ---------- */
  const recentlyViewed = useMemo(
    () =>
      recentSlugs
        .filter((s) => s !== product?.slug)
        .map((s) => products.find((p) => p.slug === s))
        .filter(Boolean),
    [recentSlugs, product?.slug]
  );

  /* ---------- add to cart ---------- */
  const handleAddToCart = useCallback(() => {
    if (!product || !canAddToCart) return;

    if (product.sizes?.length && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    const image = images[0] || null;

    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.displayName || product.name,
        price: product.price,
        image,
        size: selectedSize,
        sizes: product.sizes,
      },
      { quantity }
    );

    openCart();
  }, [product, selectedSize, quantity, images, canAddToCart, addToCart, openCart]);

  /* ---------- 404 ---------- */
  if (!product) {
    return (
      <div className="min-h-screen bg-se-black flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-display text-3xl text-se-bone tracking-wider">PRODUCT NOT FOUND</h1>
        <p className="text-se-steel font-body text-sm">
          This product doesn&apos;t exist or has been removed.
        </p>
        <Link to="/shop" className="btn-primary px-8 py-3 text-[11px] tracking-[0.2em]">
          BACK TO SHOP
        </Link>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  const siteUrl = import.meta?.env?.VITE_SITE_URL || "https://www.shopstyleeternal.com";
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const categoryLabel = product.category
    ? product.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
  const categoryHref = product.category ? `/shop/${product.category}` : "/shop";
  const productName = product.displayName || product.name;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: productName,
        description: product.description,
        url: productUrl,
        image: images.map((img) => (String(img).startsWith("http") ? img : `${siteUrl}${img}`)),
        brand: { "@type": "Brand", name: "Style Eternal" },
        ...(product.price
          ? {
              offers: {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "USD",
                url: productUrl,
                availability: isSoldOut
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
          ...(categoryLabel
            ? [{ "@type": "ListItem", position: 3, name: categoryLabel, item: `${siteUrl}${categoryHref}` }]
            : []),
          { "@type": "ListItem", position: categoryLabel ? 4 : 3, name: productName },
        ],
      },
    ],
  };

  return (
    <>
      <SEO
        title={`${productName} | Style Eternal`}
        description={product.description}
        image={images[0]}
        type="product"
        jsonLd={productJsonLd}
      />

      <main className="min-h-screen bg-se-black">
        {/* ---- Breadcrumbs ---- */}
        <nav aria-label="Breadcrumb" className="content-wide pt-6 pb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-accent tracking-[0.08em]">
            <li>
              <Link to="/" className="text-se-steel hover:text-se-bone transition-colors">Home</Link>
            </li>
            <li className="text-se-steel/40">/</li>
            <li>
              <Link to="/shop" className="text-se-steel hover:text-se-bone transition-colors">Shop</Link>
            </li>
            {categoryLabel && (
              <>
                <li className="text-se-steel/40">/</li>
                <li>
                  <Link to={categoryHref} className="text-se-steel hover:text-se-bone transition-colors">
                    {categoryLabel}
                  </Link>
                </li>
              </>
            )}
            <li className="text-se-steel/40">/</li>
            <li aria-current="page" className="text-se-gold truncate max-w-[55vw] sm:max-w-none">
              {productName}
            </li>
          </ol>
        </nav>

        {/* ============================================================ */}
        {/*  PRODUCT GRID — image left, info right                       */}
        {/* ============================================================ */}
        <div className="content-wide pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* ── LEFT: Image Gallery ── */}
            <Motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <ImageGallery images={images} alt={productName} badge={product.badge} />
            </Motion.div>

            {/* ── RIGHT: Product Info ── */}
            <Motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="flex flex-col"
            >
              {/* Collection label */}
              {product.collection && (
                <Link
                  to={`/collections/${product.collectionSlug}`}
                  className="text-overline text-se-gold hover:text-se-gold/80 transition-colors mb-3"
                >
                  {product.collection}
                </Link>
              )}

              {/* Product name */}
              <h1 className="font-display text-3xl md:text-4xl text-se-bone tracking-wider leading-tight">
                {productName}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mt-4">
                {product.comparePrice && (
                  <span className="text-lg text-se-steel line-through font-body">
                    ${product.comparePrice}
                  </span>
                )}
                <span
                  className={`text-xl font-accent font-semibold ${
                    isSoldOut ? "text-se-steel" : "text-se-bone"
                  }`}
                >
                  {isSoldOut ? "Sold Out" : `$${product.price}`}
                </span>
              </div>

              {/* Colorway */}
              {product.colorway && (
                <div className="flex items-center gap-2.5 mt-4">
                  {product.colorHex && (
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-white/10"
                      style={{ backgroundColor: product.colorHex }}
                    />
                  )}
                  <span className="text-[13px] font-accent text-se-bone/70">{product.colorway}</span>
                </div>
              )}

              <div className="divider my-6" />

              {/* ---- Size Selector ---- */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-label text-se-bone/80">Size</span>
                    <button
                      type="button"
                      onClick={() => setFitOpen(true)}
                      className="text-[11px] font-accent text-se-gold hover:text-se-gold/80 underline underline-offset-2 transition-colors"
                    >
                      Find my size
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => {
                      const sizeSoldOut = soldOutSizes.includes(size);
                      const disabled = isSoldOut || isComingSoon || sizeSoldOut;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (disabled) return;
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          disabled={disabled}
                          aria-label={sizeSoldOut ? `Size ${size} — out of stock` : `Size ${size}`}
                          className={`py-2.5 text-[12px] font-accent font-medium tracking-[0.1em] uppercase rounded-sm border transition-all duration-200 ${
                            selectedSize === size
                              ? "bg-se-bone text-se-black border-se-bone"
                              : disabled
                              ? "border-white/[0.06] text-se-steel/40 cursor-not-allowed line-through"
                              : "border-white/[0.1] text-se-bone/70 hover:border-se-bone/40 hover:text-se-bone"
                          }`}
                          style={sizeSoldOut ? { opacity: 0.35 } : undefined}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stock urgency */}
                  {showOnlyXLeft && (
                    <p className="text-[11px] font-accent text-se-gold tracking-[0.1em] uppercase mt-2.5">
                      Only {effectiveStock} left
                    </p>
                  )}

                  {sizeError && (
                    <p className="text-[11px] text-red-400 font-accent mt-2">Please select a size</p>
                  )}
                </div>
              )}

              {/* ---- Quantity Selector ---- */}
              {canAddToCart && (
                <div className="mb-6">
                  <span className="text-label text-se-bone/80 mb-3 block">Quantity</span>
                  <div className="inline-flex items-center border border-white/[0.1] rounded-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-2.5 text-se-bone/60 hover:text-se-bone transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-5 py-2.5 text-[13px] font-accent font-medium text-se-bone min-w-[3rem] text-center border-x border-white/[0.1]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="px-3.5 py-2.5 text-se-bone/60 hover:text-se-bone transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ---- Add to Cart / Status Button ---- */}
              <div ref={addBtnRef} className="mt-2 mb-8">
                {isSoldOut ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 bg-se-asphalt text-se-steel text-[12px] font-accent font-semibold tracking-[0.2em] uppercase rounded-sm cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : isComingSoon ? (
                  <div>
                    <p className="text-[11px] font-accent text-se-steel tracking-[0.1em] uppercase mb-3">
                      Drop notifier — be first in line
                    </p>
                    <NotifyMeForm
                      source="coming_soon_notify"
                      productId={product.id}
                      dropId={product.drop || ""}
                      ctaText="Notify Me"
                      className="w-full"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="btn-primary w-full py-4 text-[12px] tracking-[0.2em]"
                  >
                    {isPreorder ? "Pre-Order" : "Add to Cart"} — ${product.price * quantity}
                  </button>
                )}
              </div>

              {/* ---- Trust signals ---- */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Truck, label: "Free Shipping 100+" },
                  { icon: RotateCcw, label: "30-Day Returns" },
                  { icon: ShieldCheck, label: "Authentic Guarantee" },
                ].map((item) => {
                  const SignalIcon = item.icon;
                  return (
                    <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                      <SignalIcon size={16} className="text-se-steel" />
                      <span className="text-[10px] font-accent text-se-steel tracking-[0.05em] uppercase leading-tight">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="divider mb-2" />

              {/* ============================================================ */}
              {/*  Accordion Sections                                           */}
              {/* ============================================================ */}
              <Accordion title="Description" defaultOpen>
                {product.story && <p className="mb-4 italic text-se-bone/50">{product.story}</p>}
                <p>{product.description}</p>
                {product.modelInfo && (
                  <p className="mt-4 text-se-steel text-[12px]">{product.modelInfo}</p>
                )}
              </Accordion>

              <Accordion title="Materials & Care">
                <div className="space-y-3">
                  {product.fabric && (
                    <div>
                      <span className="text-se-bone/90 font-medium">Fabric: </span>
                      {product.fabric}
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-se-bone/90 font-medium">Weight: </span>
                      {product.weight}
                    </div>
                  )}
                  {product.printMethod && (
                    <div>
                      <span className="text-se-bone/90 font-medium">Print: </span>
                      <span className="capitalize">{product.printMethod.replace(/-/g, " ")}</span>
                    </div>
                  )}
                  {product.careInstructions && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                      <span className="text-se-bone/90 font-medium block mb-1">Care</span>
                      {product.careInstructions}
                    </div>
                  )}
                </div>
              </Accordion>

              {product.measurements && product.sizes?.length > 0 && (
                <Accordion title="Size Guide">
                  <div className="flex items-center gap-2 mb-4 text-se-steel">
                    <Ruler size={14} />
                    <span className="text-[11px] uppercase tracking-[0.1em]">
                      Measurements in inches (flat)
                    </span>
                  </div>
                  <SizeGuideTable measurements={product.measurements} sizes={product.sizes} />
                  {product.fit && (
                    <p className="mt-4 text-[12px] text-se-bone/50">
                      This garment has a <span className="text-se-bone/80">{product.fit}</span> fit.
                      {product.fit === "oversized" &&
                        " We recommend your usual size for the intended silhouette, or size down for a more standard fit."}
                      {product.fit === "relaxed" && " True to size with a comfortable, relaxed drape."}
                      {product.fit === "regular" && " True to size with a classic, tailored feel."}
                    </p>
                  )}
                </Accordion>
              )}

              <Accordion title="Shipping & Returns">
                <div className="space-y-3">
                  <p>
                    <span className="text-se-bone/90 font-medium">Standard Shipping: </span>
                    Free on orders over $100. Otherwise $8 flat rate within the US.
                  </p>
                  <p>
                    <span className="text-se-bone/90 font-medium">Processing: </span>
                    {isPreorder
                      ? "Pre-order items ship within 2-4 weeks of the stated release date."
                      : "Orders ship within 1-3 business days."}
                  </p>
                  <p>
                    <span className="text-se-bone/90 font-medium">Returns: </span>
                    Unworn items with tags may be returned within 30 days for a full refund.
                  </p>
                  <p>
                    <span className="text-se-bone/90 font-medium">International: </span>
                    We ship worldwide. Duties and taxes may apply at checkout.
                  </p>
                </div>
              </Accordion>
            </Motion.div>
          </div>
        </div>

        {/* ---- Complete the Look ---- */}
        <ProductRow title="COMPLETE THE LOOK" items={completeTheLook} />

        {/* ---- Recently Viewed (≥ 2 others) ---- */}
        {recentlyViewed.length >= 2 && (
          <ProductRow title="RECENTLY VIEWED" items={recentlyViewed} />
        )}
      </main>

      {/* ---- AI Fit Finder ---- */}
      <FitFinder
        open={fitOpen}
        onClose={() => setFitOpen(false)}
        product={product}
        onPick={(size) => { setSelectedSize(size); setSizeError(false); }}
      />

      {/* ---- Sticky mobile add-to-cart bar ---- */}
      {canAddToCart && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-200"
          style={{ transform: showSticky ? "translateY(0)" : "translateY(110%)" }}
        >
          <div className="bg-se-charcoal/95 backdrop-blur border-t border-white/10 px-4 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-se-bone font-accent font-medium truncate">{productName}</p>
              <p className="text-[11px] text-se-steel font-accent">
                {selectedSize ? `Size ${selectedSize}` : "Select size"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="shrink-0 px-5 py-3 rounded-sm text-[12px] font-accent font-semibold tracking-[0.15em] uppercase"
              style={{ background: "#c9a96e", color: "#0A0A0A" }}
            >
              Add — ${product.price * quantity}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// src/pages/ProductDetail.jsx — Style Eternal (Streetwear PDP)
import React, { useMemo, useState, useEffect, useCallback } from "react";
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
import SEO from "../components/SEO";
import ProductCard from "../components/ProductCard";
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
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
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

  /* ---------- find product ---------- */
  const product = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug),
    [slug]
  );

  /* ---------- images ---------- */
  const images = useMemo(() => resolveProductImages(product), [product]);
  const [activeImg, setActiveImg] = useState(0);

  /* ---------- selections ---------- */
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  /* reset state when product changes */
  useEffect(() => {
    setActiveImg(0);
    setSelectedSize(null);
    setQuantity(1);
    setSizeError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  /* ---------- derived ---------- */
  const isSoldOut = product?.releaseStatus === "sold-out";
  const isPreorder = product?.releaseStatus === "preorder";
  const isComingSoon = product?.releaseStatus === "coming-soon";
  const canAddToCart = !isSoldOut && !isComingSoon;

  /* ---------- related products ---------- */
  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.collectionSlug === product.collectionSlug &&
          p.releaseStatus !== "coming-soon"
      )
      .slice(0, 4);
  }, [product]);

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
        <h1 className="font-display text-3xl text-se-bone tracking-wider">
          PRODUCT NOT FOUND
        </h1>
        <p className="text-se-steel font-body text-sm">
          This product doesn't exist or has been removed.
        </p>
        <Link
          to="/shop"
          className="btn-primary px-8 py-3 text-[11px] tracking-[0.2em]"
        >
          BACK TO SHOP
        </Link>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  const siteUrl = import.meta?.env?.VITE_SITE_URL || "https://shopstyleeternal.com";
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.displayName || product.name,
        description: product.description,
        url: productUrl,
        image: images.map((img) =>
          String(img).startsWith("http") ? img : `${siteUrl}${img}`
        ),
        brand: { "@type": "Brand", name: "Style Eternal" },
        ...(product.price
          ? {
              offers: {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "USD",
                url: productUrl,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
          { "@type": "ListItem", position: 3, name: product.displayName || product.name },
        ],
      },
    ],
  };

  return (
    <>
      <SEO
        title={`${product.displayName || product.name} | Style Eternal`}
        description={product.description}
        image={images[0]}
        type="product"
        jsonLd={productJsonLd}
      />

      <main className="min-h-screen bg-se-black">
        {/* ---- Breadcrumb / Back ---- */}
        <div className="content-wide pt-6 pb-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-se-steel hover:text-se-bone text-[11px] font-accent tracking-[0.15em] uppercase transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Shop
          </Link>
        </div>

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
              {/* Main image */}
              <div className="relative aspect-[3/4] bg-se-charcoal overflow-hidden rounded-sm">
                {images.length > 0 ? (
                  <img
                    key={activeImg}
                    src={images[activeImg]}
                    alt={`${product.displayName || product.name} — view ${activeImg + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="font-display text-2xl tracking-[0.3em] text-se-steel/40">
                      SE
                    </span>
                  </div>
                )}

                {/* Badge overlay */}
                {product.badge && (
                  <div
                    className={`absolute top-4 left-4 badge ${
                      product.badge === "Sold Out"
                        ? "badge-sold-out"
                        : product.badge === "Limited"
                        ? "badge-limited"
                        : "badge-new"
                    }`}
                  >
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
                        activeImg === i
                          ? "border-se-gold"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
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
                {product.displayName || product.name}
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
                  <span className="text-[13px] font-accent text-se-bone/70">
                    {product.colorway}
                  </span>
                </div>
              )}

              <div className="divider my-6" />

              {/* ---- Size Selector ---- */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-label text-se-bone/80">Size</span>
                    {product.fit && (
                      <span className="text-[11px] font-accent text-se-steel">
                        {product.fit} fit
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        disabled={isSoldOut}
                        className={`py-2.5 text-[12px] font-accent font-medium tracking-[0.1em] uppercase rounded-sm border transition-all duration-200 ${
                          selectedSize === size
                            ? "bg-se-bone text-se-black border-se-bone"
                            : isSoldOut
                            ? "border-white/[0.06] text-se-steel/40 cursor-not-allowed"
                            : "border-white/[0.1] text-se-bone/70 hover:border-se-bone/40 hover:text-se-bone"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {sizeError && (
                    <p className="text-[11px] text-red-400 font-accent mt-2">
                      Please select a size
                    </p>
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

              {/* ---- Limited stock note ---- */}
              {product.limited && product.limitedQty && !isSoldOut && (
                <p className="text-[11px] font-accent text-se-gold tracking-[0.1em] uppercase mb-4">
                  Only {product.limitedQty} remaining
                </p>
              )}

              {/* ---- Add to Cart / Status Button ---- */}
              <div className="mt-2 mb-8">
                {isSoldOut ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 bg-se-asphalt text-se-steel text-[12px] font-accent font-semibold tracking-[0.2em] uppercase rounded-sm cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : isComingSoon ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 bg-se-asphalt text-se-steel text-[12px] font-accent font-semibold tracking-[0.2em] uppercase rounded-sm cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
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
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 text-center"
                  >
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

              {/* Description */}
              <Accordion title="Description" defaultOpen>
                {product.story && (
                  <p className="mb-4 italic text-se-bone/50">{product.story}</p>
                )}
                <p>{product.description}</p>
                {product.modelInfo && (
                  <p className="mt-4 text-se-steel text-[12px]">{product.modelInfo}</p>
                )}
              </Accordion>

              {/* Materials & Care */}
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
                      <span className="capitalize">
                        {product.printMethod.replace(/-/g, " ")}
                      </span>
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

              {/* Size Guide */}
              {product.measurements && product.sizes?.length > 0 && (
                <Accordion title="Size Guide">
                  <div className="flex items-center gap-2 mb-4 text-se-steel">
                    <Ruler size={14} />
                    <span className="text-[11px] uppercase tracking-[0.1em]">
                      Measurements in inches (flat)
                    </span>
                  </div>
                  <SizeGuideTable
                    measurements={product.measurements}
                    sizes={product.sizes}
                  />
                  {product.fit && (
                    <p className="mt-4 text-[12px] text-se-bone/50">
                      This garment has a{" "}
                      <span className="text-se-bone/80">{product.fit}</span> fit.
                      {product.fit === "oversized" &&
                        " We recommend your usual size for the intended silhouette, or size down for a more standard fit."}
                      {product.fit === "relaxed" &&
                        " True to size with a comfortable, relaxed drape."}
                      {product.fit === "regular" &&
                        " True to size with a classic, tailored feel."}
                    </p>
                  )}
                </Accordion>
              )}

              {/* Shipping */}
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

        {/* ============================================================ */}
        {/*  Related Products                                             */}
        {/* ============================================================ */}
        {related.length > 0 && (
          <section className="section-pad border-t border-white/[0.06]">
            <div className="content-wide">
              <h2 className="font-display text-xl tracking-[0.2em] text-se-bone mb-10">
                FROM THE SAME COLLECTION
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

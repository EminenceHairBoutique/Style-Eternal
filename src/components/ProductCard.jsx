// src/components/ProductCard.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { resolveProductImages } from "../utils/productMedia";
import { useProductPrice } from "../hooks/useProductOverlay";
import { formatMoney } from "../utils/format";
import { trackAddToCart } from "../utils/track";
import ComingSoonOverlay from "./ComingSoonOverlay";
import SmartImage from "./SmartImage";

// Grid cards: half viewport on phones, a third on tablets, a quarter on desktop.
const CARD_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

const ProductCard = ({ product: rawProduct, featured = false }) => {
  const { addToCart, openCart } = useCart();
  const wishlist = useWishlist();
  // Overlay live price/compare-at from Supabase (admin-editable) onto the
  // hardcoded product. Falls back to the hardcoded values when no DB row.
  const overlay = useProductPrice(rawProduct?.slug);
  const product = overlay
    ? {
        ...rawProduct,
        price: overlay.price != null ? overlay.price : rawProduct.price,
        comparePrice: overlay.comparePrice != null ? overlay.comparePrice : rawProduct.comparePrice,
      }
    : rawProduct;

  const images = resolveProductImages(product);
  const img = product.image || images?.[0] || product.images?.[0] || null;
  const imgSecondary = images?.[1] || product.images?.[1] || null;

  // Quick add with an explicit size choice — never silently picks one.
  const handleQuickAdd = (e, size) => {
    e.preventDefault();
    e.stopPropagation();

    const price = Number(product.price ?? 0);
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      price,
      image: img,
      size: size ?? null,
      quantity: 1,
    });
    trackAddToCart({
      id: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      type: product.type,
      price,
      quantity: 1,
    });
    openCart();
  };

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const needsSizeChoice = sizes.length > 1;

  const isSoldOut = product.releaseStatus === "sold-out";
  const isPreorder = product.releaseStatus === "preorder";
  const isComingSoon = product.releaseStatus === "coming-soon";

  const isWishlisted = wishlist.has(product.slug);
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlist.toggle(product.slug);
  };

  return (
    <Link
      to={`/products/${product.slug ?? product.id}`}
      className={`group block product-card overflow-hidden ${featured ? "" : ""}`}
    >
      {/* Image */}
      <div className={`relative ${featured ? "aspect-[3/4]" : "aspect-[3/4]"} bg-se-charcoal overflow-hidden ${imgSecondary ? "product-card-img-swap" : ""}`}>
        {img ? (
          <>
            <SmartImage
              src={img}
              alt={product.name}
              sizes={CARD_SIZES}
              className={`img-primary absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                isSoldOut || isComingSoon ? "opacity-50 grayscale" : "group-hover:scale-[1.04]"
              }`}
              loading="lazy"
            />
            {imgSecondary && !isSoldOut && !isComingSoon && (
              <SmartImage
                src={imgSecondary}
                alt={`${product.name} alternate view`}
                sizes={CARD_SIZES}
                className="img-secondary absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-se-charcoal to-se-asphalt">
            <span className="font-display text-[28px] tracking-[0.15em] text-se-gold/15 block select-none">
              SE
            </span>
            <span className="font-accent text-[8px] tracking-[0.22em] uppercase text-se-steel/40 mt-2 block px-4 text-center">
              {product.collection || "Style Eternal"}
            </span>
            {isComingSoon && (
              <span className="mt-3 inline-flex items-center gap-1.5 border border-se-bone/10 px-2.5 py-1">
                <span className="inline-block w-1 h-1 rounded-full bg-se-gold/50 animate-pulse" />
                <span className="font-accent text-[7px] tracking-[0.2em] uppercase text-se-bone/50">
                  Coming Soon
                </span>
              </span>
            )}
          </div>
        )}

        {/* Coming Soon Overlay */}
        {isComingSoon && img && (
          <ComingSoonOverlay
            dropName={product.drop ? product.drop.replace("drop-", "Drop ").replace(/\b\w/g, c => c.toUpperCase()) : null}
            season={product.season}
          />
        )}

        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-3 left-3 badge ${
            product.badge === "Sold Out" ? "badge-sold-out" :
            product.badge === "Limited" ? "badge-limited" :
            product.badge === "Pre-Order" ? "badge-archive" :
            product.badge === "Coming Soon" ? "badge-coming-soon" :
            "badge-new"
          }`}>
            {product.badge === "Coming Soon" && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-se-steel animate-pulse mr-1.5" />
            )}
            {product.badge}
          </div>
        )}

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-se-black/40 backdrop-blur-sm border border-white/10 transition-colors hover:bg-se-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-se-gold"
        >
          <Heart
            size={15}
            className={isWishlisted ? "text-se-gold" : "text-se-bone/70"}
            fill={isWishlisted ? "#c9a96e" : "none"}
          />
        </button>

        {/* Quick Add (desktop hover) — only for available/preorder.
            Multi-size products show a size row; the size the customer taps
            is the size that lands in the bag. */}
        {!isSoldOut && !isComingSoon && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            {needsSizeChoice ? (
              <div className="bg-se-bone">
                <p className="pt-2 text-center text-[8px] font-accent font-medium tracking-[0.25em] uppercase text-se-black/50">
                  {isPreorder ? "Pre-Order" : "Quick Add"} — Select Size
                </p>
                <div className="flex">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => handleQuickAdd(e, s)}
                      aria-label={`Add size ${s} to bag`}
                      className="flex-1 py-2.5 text-[10px] font-accent font-medium tracking-[0.1em] uppercase text-se-black hover:bg-se-black hover:text-se-bone transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => handleQuickAdd(e, sizes[0] ?? null)}
                className="w-full py-3 bg-se-bone text-se-black text-[10px] font-accent font-medium tracking-[0.2em] uppercase hover:bg-se-cream transition-colors"
                type="button"
              >
                {isPreorder ? "Pre-Order" : "Quick Add"}
              </button>
            )}
          </div>
        )}

        {/* Notify Me (for coming-soon products on hover) */}
        {isComingSoon && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <span className="block w-full py-3 bg-se-charcoal text-se-bone/70 text-[10px] font-accent font-medium tracking-[0.2em] uppercase text-center border-t border-white/10">
              Notify Me
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1 pt-4 pb-3">
        {/* Collection label */}
        {product.collection && (
          <p className="text-[8px] tracking-[0.28em] uppercase text-se-gold/60 font-accent mb-1.5">
            {product.collection}
          </p>
        )}

        <h3 className="text-[13px] text-se-bone/90 font-accent font-medium mb-1.5 line-clamp-1">
          {product.displayName || product.name}
        </h3>

        <div className="flex items-center gap-3">
          {product.comparePrice && (
            <span className="text-[12px] text-se-steel line-through">
              {formatMoney(product.comparePrice)}
            </span>
          )}
          <span className={`text-[14px] font-medium ${isSoldOut || isComingSoon ? "text-se-steel" : "text-se-bone"}`}>
            {isSoldOut ? "Sold Out" : formatMoney(product.price)}
          </span>
        </div>

        {/* Colorway */}
        {product.colorway && (
          <p className="text-[10px] text-se-steel/70 mt-1.5 font-accent">{product.colorway}</p>
        )}
      </div>
    </Link>
  );
};

// Grids render many cards; memoization keeps a cart or wishlist change from
// re-rendering every card on the page.
export default React.memo(ProductCard);

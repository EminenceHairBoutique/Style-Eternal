// src/components/ProductCard.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { resolveProductImages } from "../utils/productMedia";

const ProductCard = ({ product, featured = false }) => {
  const { addToCart, openCart } = useCart();
  const images = resolveProductImages(product);
  const img = product.image || images?.[0] || product.images?.[0] || null;
  const imgSecondary = images?.[1] || product.images?.[1] || null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const price = Number(product.price ?? 0);
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      price,
      image: img,
      size: product.sizes?.[Math.floor(product.sizes.length / 2)] || "M",
      quantity: 1,
    });
    openCart();
  };

  const isSoldOut = product.releaseStatus === "sold-out";
  const isPreorder = product.releaseStatus === "preorder";

  return (
    <Link
      to={`/products/${product.slug ?? product.id}`}
      className={`group block product-card overflow-hidden ${featured ? "" : ""}`}
    >
      {/* Image */}
      <div className={`relative ${featured ? "aspect-[3/4]" : "aspect-[3/4]"} bg-se-charcoal overflow-hidden ${imgSecondary ? "product-card-img-swap" : ""}`}>
        {img ? (
          <>
            <img
              src={img}
              alt={product.name}
              className={`img-primary absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                isSoldOut ? "opacity-50 grayscale" : "group-hover:scale-[1.04]"
              }`}
              loading="lazy"
            />
            {imgSecondary && !isSoldOut && (
              <img
                src={imgSecondary}
                alt={`${product.name} alternate view`}
                className="img-secondary absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-se-asphalt">
            <span className="font-display text-[14px] tracking-[0.2em] text-se-steel">
              SE
            </span>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-3 left-3 badge ${
            product.badge === "Sold Out" ? "badge-sold-out" :
            product.badge === "Limited" ? "badge-limited" :
            product.badge === "Pre-Order" ? "badge-archive" :
            "badge-new"
          }`}>
            {product.badge}
          </div>
        )}

        {/* Quick Add (desktop hover) */}
        {!isSoldOut && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button
              onClick={handleQuickAdd}
              className="w-full py-3 bg-se-bone text-se-black text-[10px] font-accent font-medium tracking-[0.2em] uppercase hover:bg-se-cream transition-colors"
              type="button"
            >
              {isPreorder ? "Pre-Order" : "Quick Add"}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1 pt-4 pb-2">
        {/* Collection label */}
        {product.collection && (
          <p className="text-[9px] tracking-[0.25em] uppercase text-se-steel font-accent mb-1">
            {product.collection}
          </p>
        )}

        <h3 className="text-[13px] text-se-bone/90 font-accent font-medium mb-1 line-clamp-1">
          {product.displayName || product.name}
        </h3>

        <div className="flex items-center gap-3">
          {product.comparePrice && (
            <span className="text-[13px] text-se-steel line-through">
              ${product.comparePrice}
            </span>
          )}
          <span className={`text-[14px] font-medium ${isSoldOut ? "text-se-steel" : "text-se-bone"}`}>
            {isSoldOut ? "Sold Out" : `$${product.price}`}
          </span>
        </div>

        {/* Colorway */}
        {product.colorway && (
          <p className="text-[10px] text-se-steel mt-1">{product.colorway}</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

// src/pages/Wishlist.jsx — Style Eternal
// Saved pieces. Guest wishlists live locally; signed-in wishlists sync to the
// account and merge on sign-in (see WishlistContext).

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import SEO from "../components/SEO";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { useProducts } from "../context/ProductsContext";
import { useUser } from "../context/UserContext";

export default function Wishlist() {
  const { slugs, count } = useWishlist();
  const { products } = useProducts();
  const { user } = useUser();

  const saved = useMemo(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return slugs.map((s) => bySlug.get(s)).filter(Boolean);
  }, [slugs, products]);

  return (
    <>
      <SEO title="Wishlist — Style Eternal" description="Your saved pieces." noindex={true} />

      <div className="bg-se-black text-se-bone min-h-[70vh]">
        <section className="pt-28 pb-24">
          <div className="content-wide">
            <p className="text-overline mb-3">Saved</p>
            <h1 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] mb-2">
              WISHLIST
            </h1>
            <p className="text-[13px] text-se-bone/40 font-accent mb-10">
              {count === 0
                ? "Nothing saved yet."
                : `${count} ${count === 1 ? "piece" : "pieces"} saved${
                    user ? "" : " on this device — sign in to keep them everywhere"
                  }.`}
            </p>

            {saved.length === 0 ? (
              <div className="border border-white/5 bg-se-charcoal p-12 text-center max-w-lg">
                <Heart className="w-7 h-7 text-se-steel mx-auto mb-4" />
                <p className="text-[14px] text-se-bone/70">
                  Tap the heart on any product to save it here.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link to="/shop" className="btn-primary">Shop Now</Link>
                  {!user && (
                    <Link to="/account" className="btn-outline">Sign In</Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                {saved.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

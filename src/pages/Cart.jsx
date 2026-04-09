// src/pages/Cart.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import SEO from "../components/SEO";

const money = (n) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function Cart() {
  const { cartItems = [], items = [], updateQuantity, removeFromCart, removeItem, subtotal, total } = useCart();
  const cartList = cartItems?.length ? cartItems : items || [];
  const cartTotal = subtotal ?? total ?? 0;

  if (!cartList.length) {
    return (
      <>
        <SEO title="Shopping Bag — Style Eternal" noindex={true} />
        <div className="bg-se-black text-se-bone min-h-[70vh] pt-32 text-center">
          <h1 className="font-display text-[28px] tracking-[0.08em] mb-4">YOUR BAG IS EMPTY</h1>
          <p className="text-[14px] text-se-bone/40 mb-8">Nothing in here yet.</p>
          <Link to="/shop" className="btn-primary">Shop Now</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Shopping Bag — Style Eternal" noindex={true} />
      <div className="bg-se-black text-se-bone min-h-screen">
        <section className="pt-28 pb-24">
          <div className="content-wide">
            <h1 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] mb-10">
              SHOPPING BAG
            </h1>

            <div className="grid lg:grid-cols-[1fr,0.4fr] gap-12">
              {/* Items */}
              <div className="space-y-0">
                {cartList.map((item) => (
                  <div key={item.cartKey || item.id} className="flex gap-5 py-6 border-b border-white/[0.06]">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-24 h-28 object-cover bg-se-asphalt border border-white/5" />
                    ) : (
                      <div className="w-24 h-28 bg-se-asphalt border border-white/5 flex items-center justify-center">
                        <span className="font-display text-[10px] tracking-[0.2em] text-se-steel">SE</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.slug || item.id}`} className="text-[14px] font-accent text-se-bone hover:text-se-bone/70 transition">
                        {item.name}
                      </Link>
                      <p className="text-[11px] text-se-steel mt-1">
                        {item.size && `Size ${item.size}`}
                        {item.colorway && ` · ${item.colorway}`}
                      </p>
                      {item.isPreorder && (
                        <p className="text-[9px] uppercase tracking-[0.2em] text-se-gold font-accent mt-1">Pre-Order</p>
                      )}

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-white/10">
                          <button
                            onClick={() => (updateQuantity || (() => {}))(item.id, item.variant, Math.max(1, item.quantity - 1))}
                            className="px-2.5 py-1.5 text-se-steel hover:text-se-bone transition" type="button"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-[12px] font-accent">{item.quantity}</span>
                          <button
                            onClick={() => (updateQuantity || (() => {}))(item.id, item.variant, item.quantity + 1)}
                            className="px-2.5 py-1.5 text-se-steel hover:text-se-bone transition" type="button"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => (removeFromCart || removeItem || (() => {}))(item.id, item.variant)}
                          className="text-[10px] font-accent uppercase tracking-[0.15em] text-se-steel hover:text-se-red-bright transition"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <p className="text-[14px] font-accent text-se-bone">
                      {money(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:sticky lg:top-24">
                <div className="border border-white/5 bg-se-charcoal p-6 space-y-5">
                  <h2 className="font-display text-[14px] tracking-[0.12em]">ORDER SUMMARY</h2>
                  <div className="divider" />
                  <div className="flex justify-between text-[13px] font-accent">
                    <span className="text-se-bone/60">Subtotal</span>
                    <span>{money(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-accent">
                    <span className="text-se-bone/60">Shipping</span>
                    <span className="text-se-steel">Calculated at checkout</span>
                  </div>
                  <div className="divider" />
                  <div className="flex justify-between text-[15px] font-accent font-medium">
                    <span>Total</span>
                    <span>{money(cartTotal)}</span>
                  </div>

                  <Link to="/checkout" className="btn-primary w-full text-center block mt-4">
                    Proceed to Checkout
                  </Link>

                  <p className="text-[10px] text-se-steel font-accent text-center">
                    Secure checkout via Stripe. Free shipping over $150.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

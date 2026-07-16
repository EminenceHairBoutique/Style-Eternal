// src/context/CartContext.jsx
// Style Eternal — Cart state + drawer controls.
//
// All state math lives in src/utils/cartOps.js (pure, unit-tested). This
// provider owns persistence (localStorage), the drawer flag, and a stable,
// memoized context value so cart changes don't re-render every consumer
// with fresh function identities.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { resolveProductImages } from "../utils/productMedia";
import * as ops from "../utils/cartOps";

const CartContext = createContext(null);

const STORAGE_KEY = "se_cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch { /* storage full/blocked — cart still works in-memory */ }
  }, [cartItems]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const addToCart = useCallback((product, options = {}) => {
    if (!product?.id) return;

    const size = options.size ?? product.size ?? null;
    const colorway = options.colorway ?? product.colorway ?? null;
    const quantity = ops.clampQty(options.quantity ?? 1);

    const price = Number(options.price ?? product.price ?? 0);

    const images = resolveProductImages(product);
    const image =
      options.image ||
      product.image ||
      images?.[0] ||
      product.images?.[0] ||
      null;

    const isPreorder = Boolean(options.isPreorder ?? product.isPreorder ?? false);
    const leadTimeDays = Number(options.leadTimeDays ?? product.leadTimeDays ?? 0);

    const cartKey = ops.cartKeyFor(product.id, size, colorway);

    const entry = {
      id: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      image,
      size,
      colorway,
      price,
      quantity,
      isPreorder,
      leadTimeDays,
      cartKey,
      variant: cartKey,
    };

    setCartItems((prev) => ops.addItem(prev, entry));
    setIsOpen(true);
  }, []);

  // updateQuantity(id, qty) or updateQuantity(id, variant, qty) — the
  // 2-arg legacy shape targets every line of the product.
  const updateQuantity = useCallback((id, a, b) => {
    const hasVariant = typeof a === "string";
    const variant = hasVariant ? a : null;
    const qty = hasVariant ? b : a;
    setCartItems((prev) => ops.setQuantity(prev, id, variant, qty));
  }, []);

  const updateItemOptions = useCallback((id, cartKey, next = {}) => {
    setCartItems((prev) => ops.changeOptions(prev, id, cartKey, next));
  }, []);

  // removeFromCart(id) removes every line of the product;
  // removeFromCart(id, variant) removes only that line.
  const removeFromCart = useCallback((id, variant = null) => {
    setCartItems((prev) => ops.removeItem(prev, id, variant));
  }, []);

  // Same semantics as removeFromCart — the variant is honored, not dropped.
  // (A dropped second argument here once made "remove size M" also delete
  // size L of the same product from the drawer.)
  const removeItem = removeFromCart;

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    setIsOpen(false);
  }, []);

  const subtotal = useMemo(() => ops.subtotal(cartItems), [cartItems]);
  const count = useMemo(() => ops.itemCount(cartItems), [cartItems]);

  const value = useMemo(
    () => ({
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      cartItems,
      addToCart,
      updateQuantity,
      updateItemOptions,
      removeFromCart,
      removeItem,
      clearCart,
      items: cartItems,
      setItems: setCartItems,
      subtotal,
      total: subtotal,
      count,
    }),
    [
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      cartItems,
      addToCart,
      updateQuantity,
      updateItemOptions,
      removeFromCart,
      removeItem,
      clearCart,
      subtotal,
      count,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

// src/utils/cartOps.js
// Pure cart-state operations. No React, no storage — fully unit-testable.
// CartContext delegates every mutation here.

export const MAX_QTY = 10; // mirrors the server-side limit in lib/checkout.js

export const cartKeyFor = (id, size, colorway) =>
  `${id}::${size || ""}::${colorway || ""}`;

const keyOf = (item) => item.cartKey || item.variant || cartKeyFor(item.id, item.size, item.colorway);

export const clampQty = (qty) =>
  Math.min(MAX_QTY, Math.max(1, Math.round(Number(qty) || 1)));

/**
 * Add a normalized entry; merges quantity into an existing line with the same
 * cartKey (same product + size + colorway).
 */
export function addItem(items, entry) {
  const key = keyOf(entry);
  const idx = items.findIndex((p) => keyOf(p) === key);
  if (idx >= 0) {
    const copy = [...items];
    copy[idx] = {
      ...copy[idx],
      quantity: clampQty(Number(copy[idx].quantity || 0) + Number(entry.quantity || 1)),
    };
    return copy;
  }
  return [...items, { ...entry, quantity: clampQty(entry.quantity) }];
}

/**
 * Remove a line. With a variant (cartKey), removes only that line; with
 * variant = null, removes every line of the product — an explicit
 * "remove all variants" call, never an accident of a dropped argument.
 */
export function removeItem(items, id, variant = null) {
  return items.filter((p) => {
    if (p.id !== id) return true;
    if (variant == null) return false;
    return keyOf(p) !== variant;
  });
}

/** Set the quantity of one line (clamped 1..MAX_QTY). variant=null → all lines of the product. */
export function setQuantity(items, id, variant, qty) {
  const nextQty = clampQty(qty);
  return items.map((p) => {
    if (p.id !== id) return p;
    if (variant != null && keyOf(p) !== variant) return p;
    return { ...p, quantity: nextQty };
  });
}

/**
 * Change a line's options (size/colorway). If the new options collide with an
 * existing line, the two merge (quantities added).
 */
export function changeOptions(items, id, cartKey, next = {}) {
  const current = items.find((x) => keyOf(x) === cartKey);
  if (!current) return items;

  const size = next.size ?? current.size;
  const colorway = next.colorway ?? current.colorway;
  const newKey = cartKeyFor(id, size, colorway);

  const updated = { ...current, size, colorway, cartKey: newKey, variant: newKey };

  const without = items.filter((x) => keyOf(x) !== cartKey);
  const mergeIdx = without.findIndex((x) => keyOf(x) === newKey);
  if (mergeIdx >= 0) {
    const copy = [...without];
    copy[mergeIdx] = {
      ...copy[mergeIdx],
      quantity: clampQty(Number(copy[mergeIdx].quantity || 0) + Number(updated.quantity || 0)),
    };
    return copy;
  }
  return [...without, updated];
}

export function subtotal(items) {
  return items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
}

export function itemCount(items) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

import { describe, it, expect } from "vitest";
import {
  addItem,
  removeItem,
  setQuantity,
  changeOptions,
  subtotal,
  itemCount,
  cartKeyFor,
  clampQty,
  MAX_QTY,
} from "../../src/utils/cartOps.js";

const line = (id, size, quantity = 1, price = 75) => ({
  id,
  size,
  colorway: null,
  price,
  quantity,
  cartKey: cartKeyFor(id, size, null),
  variant: cartKeyFor(id, size, null),
});

describe("addItem", () => {
  it("appends a new line for a new product/size", () => {
    const items = addItem([], line("tee", "M"));
    expect(items).toHaveLength(1);
  });

  it("merges quantity into an existing identical line", () => {
    const items = addItem([line("tee", "M", 1)], line("tee", "M", 2));
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it("keeps different sizes of the same product as separate lines", () => {
    const items = addItem([line("tee", "M")], line("tee", "L"));
    expect(items).toHaveLength(2);
  });

  it("clamps merged quantity at MAX_QTY", () => {
    const items = addItem([line("tee", "M", 9)], line("tee", "M", 5));
    expect(items[0].quantity).toBe(MAX_QTY);
  });
});

describe("removeItem — the two-sizes regression", () => {
  it("removing ONE size leaves the other size in the cart", () => {
    // Regression: CartContext.removeItem(id) used to drop the variant arg,
    // so removing the M line also deleted the L line.
    const cart = [line("tee", "M"), line("tee", "L")];
    const next = removeItem(cart, "tee", cartKeyFor("tee", "M", null));
    expect(next).toHaveLength(1);
    expect(next[0].size).toBe("L");
  });

  it("variant = null removes every line of the product (explicit)", () => {
    const cart = [line("tee", "M"), line("tee", "L"), line("cap", "OS")];
    const next = removeItem(cart, "tee", null);
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe("cap");
  });

  it("does not touch other products", () => {
    const cart = [line("tee", "M"), line("cap", "OS")];
    const next = removeItem(cart, "tee", cartKeyFor("tee", "M", null));
    expect(next.map((i) => i.id)).toEqual(["cap"]);
  });
});

describe("setQuantity", () => {
  it("targets only the matching variant line", () => {
    const cart = [line("tee", "M", 1), line("tee", "L", 1)];
    const next = setQuantity(cart, "tee", cartKeyFor("tee", "M", null), 4);
    expect(next.find((i) => i.size === "M").quantity).toBe(4);
    expect(next.find((i) => i.size === "L").quantity).toBe(1);
  });

  it("clamps to 1..MAX_QTY", () => {
    const cart = [line("tee", "M", 5)];
    expect(setQuantity(cart, "tee", null, 0)[0].quantity).toBe(1);
    expect(setQuantity(cart, "tee", null, 99)[0].quantity).toBe(MAX_QTY);
    expect(setQuantity(cart, "tee", null, "abc")[0].quantity).toBe(1);
  });
});

describe("changeOptions", () => {
  it("rewrites the line key when the size changes", () => {
    const cart = [line("tee", "M")];
    const next = changeOptions(cart, "tee", cartKeyFor("tee", "M", null), { size: "L" });
    expect(next).toHaveLength(1);
    expect(next[0].size).toBe("L");
    expect(next[0].cartKey).toBe(cartKeyFor("tee", "L", null));
  });

  it("merges into an existing line when options collide", () => {
    const cart = [line("tee", "M", 2), line("tee", "L", 1)];
    const next = changeOptions(cart, "tee", cartKeyFor("tee", "M", null), { size: "L" });
    expect(next).toHaveLength(1);
    expect(next[0].quantity).toBe(3);
  });

  it("no-ops for an unknown key", () => {
    const cart = [line("tee", "M")];
    expect(changeOptions(cart, "tee", "missing::key::", { size: "L" })).toBe(cart);
  });
});

describe("totals", () => {
  it("subtotal multiplies price × quantity across lines", () => {
    expect(subtotal([line("a", "M", 2, 50), line("b", "L", 1, 25)])).toBe(125);
  });

  it("itemCount sums quantities", () => {
    expect(itemCount([line("a", "M", 2), line("b", "L", 3)])).toBe(5);
  });

  it("clampQty normalizes garbage input to integers in 1..MAX_QTY", () => {
    expect(clampQty(undefined)).toBe(1);
    expect(clampQty(-5)).toBe(1);
    expect(clampQty(3.7)).toBe(4);
    expect(clampQty(99)).toBe(MAX_QTY);
  });
});

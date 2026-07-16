import { describe, it, expect } from "vitest";
import {
  buildLineItems,
  buildShippingOptions,
  allowedShippingCountries,
  isDigitalOnly,
  CheckoutError,
} from "../../lib/checkout.js";

const CATALOG = [
  {
    id: "se-test-tee",
    slug: "test-tee",
    name: "Test Tee",
    displayName: "Test Tee — Black",
    price: 75,
    sizes: ["S", "M", "L"],
    releaseStatus: "available",
    images: ["/assets/products/test-tee/01.jpg"],
  },
  {
    id: "se-test-cap",
    slug: "test-cap",
    name: "Test Cap",
    price: 40,
    sizes: [],
    releaseStatus: "available",
    images: [],
  },
  {
    id: "se-test-soon",
    slug: "test-soon",
    name: "Coming Soon Hoodie",
    price: 120,
    sizes: ["M"],
    releaseStatus: "coming-soon",
  },
  {
    id: "se-test-pre",
    slug: "test-pre",
    name: "Preorder Jacket",
    price: 200,
    sizes: ["M"],
    releaseStatus: "preorder",
  },
];

const item = (over = {}) => ({ slug: "test-tee", quantity: 1, size: "M", ...over });

describe("buildLineItems", () => {
  it("prices from the static catalog when no overlay", () => {
    const { lineItems, subtotalCents } = buildLineItems({
      items: [item({ quantity: 2 })],
      catalog: CATALOG,
      origin: "https://shop.example",
    });
    expect(subtotalCents).toBe(15000);
    expect(lineItems[0].price_data.unit_amount).toBe(7500);
    expect(lineItems[0].quantity).toBe(2);
  });

  it("overlay price wins over static price", () => {
    const overlay = new Map([["test-tee", { price: 85, stock: 10, isActive: true }]]);
    const { lineItems } = buildLineItems({
      items: [item()],
      catalog: CATALOG,
      overlayBySlug: overlay,
    });
    expect(lineItems[0].price_data.unit_amount).toBe(8500);
  });

  it("falls back to static price when overlay row lacks a price", () => {
    const overlay = new Map([["test-tee", { price: null, stock: 10, isActive: true }]]);
    const { lineItems } = buildLineItems({
      items: [item()],
      catalog: CATALOG,
      overlayBySlug: overlay,
    });
    expect(lineItems[0].price_data.unit_amount).toBe(7500);
  });

  it("stamps slug/size/product_id metadata for the webhook", () => {
    const { lineItems } = buildLineItems({ items: [item()], catalog: CATALOG });
    expect(lineItems[0].price_data.product_data.metadata).toEqual({
      slug: "test-tee",
      size: "M",
      product_id: "se-test-tee",
      gift_card: "",
    });
  });

  it("flags gift-card lines for webhook issuance and detects digital-only carts", () => {
    const giftCatalog = [
      ...CATALOG,
      { id: "se-gift-50", slug: "gift-card-50", name: "Gift Card", price: 50, sizes: [], releaseStatus: "available", giftCard: true },
    ];
    const { lineItems } = buildLineItems({
      items: [{ slug: "gift-card-50", quantity: 2 }],
      catalog: giftCatalog,
    });
    expect(lineItems[0].price_data.product_data.metadata.gift_card).toBe("true");

    expect(isDigitalOnly([{ slug: "gift-card-50", quantity: 1 }], giftCatalog)).toBe(true);
    expect(
      isDigitalOnly(
        [{ slug: "gift-card-50", quantity: 1 }, { slug: "test-tee", quantity: 1 }],
        giftCatalog
      )
    ).toBe(false);
    expect(isDigitalOnly([], giftCatalog)).toBe(false);
  });

  it("resolves products by id as well as slug", () => {
    const { lineItems } = buildLineItems({
      items: [{ id: "se-test-tee", quantity: 1, size: "S" }],
      catalog: CATALOG,
    });
    expect(lineItems[0].price_data.product_data.metadata.slug).toBe("test-tee");
  });

  it("rejects unknown products", () => {
    expect(() =>
      buildLineItems({ items: [item({ slug: "nope" })], catalog: CATALOG })
    ).toThrowError(CheckoutError);
  });

  it("rejects a size not offered by the product", () => {
    expect(() =>
      buildLineItems({ items: [item({ size: "XXL" })], catalog: CATALOG })
    ).toThrow(/size/i);
  });

  it("rejects a missing size when the product has sizes", () => {
    expect(() =>
      buildLineItems({ items: [item({ size: null })], catalog: CATALOG })
    ).toThrow(/size/i);
  });

  it("allows items with no size when the product defines none", () => {
    const { lineItems } = buildLineItems({
      items: [{ slug: "test-cap", quantity: 1 }],
      catalog: CATALOG,
    });
    expect(lineItems[0].price_data.product_data.metadata.size).toBe("");
  });

  it.each([0, -1, 11, 1.5, "2abc", NaN])("rejects quantity %s", (quantity) => {
    expect(() =>
      buildLineItems({ items: [item({ quantity })], catalog: CATALOG })
    ).toThrow(/quantity/i);
  });

  it("blocks coming-soon products", () => {
    expect(() =>
      buildLineItems({
        items: [{ slug: "test-soon", quantity: 1, size: "M" }],
        catalog: CATALOG,
      })
    ).toThrow(/not available/i);
  });

  it("blocks preorder products unless the item is flagged as preorder", () => {
    expect(() =>
      buildLineItems({
        items: [{ slug: "test-pre", quantity: 1, size: "M" }],
        catalog: CATALOG,
      })
    ).toThrow(/not available/i);

    const { lineItems } = buildLineItems({
      items: [{ slug: "test-pre", quantity: 1, size: "M", isPreorder: true }],
      catalog: CATALOG,
    });
    expect(lineItems[0].price_data.unit_amount).toBe(20000);
  });

  it("blocks deactivated products (overlay is_active = false)", () => {
    const overlay = new Map([["test-tee", { price: 75, stock: 10, isActive: false }]]);
    expect(() =>
      buildLineItems({ items: [item()], catalog: CATALOG, overlayBySlug: overlay })
    ).toThrow(/no longer available/i);
  });

  it("blocks sold-out stock and over-stock quantities", () => {
    const soldOut = new Map([["test-tee", { price: 75, stock: 0, isActive: true }]]);
    expect(() =>
      buildLineItems({ items: [item()], catalog: CATALOG, overlayBySlug: soldOut })
    ).toThrow(/sold out/i);

    const lowStock = new Map([["test-tee", { price: 75, stock: 1, isActive: true }]]);
    expect(() =>
      buildLineItems({ items: [item({ quantity: 2 })], catalog: CATALOG, overlayBySlug: lowStock })
    ).toThrow(/only 1 left/i);
  });

  it("rejects an empty cart", () => {
    expect(() => buildLineItems({ items: [], catalog: CATALOG })).toThrow(/empty/i);
  });

  it("absolutizes relative image paths against the origin", () => {
    const { lineItems } = buildLineItems({
      items: [item()],
      catalog: CATALOG,
      origin: "https://shop.example",
    });
    expect(lineItems[0].price_data.product_data.images[0]).toBe(
      "https://shop.example/assets/products/test-tee/01.jpg"
    );
  });
});

describe("buildShippingOptions", () => {
  it("charges the standard rate below the threshold", () => {
    const [opt] = buildShippingOptions({ subtotalCents: 14999, env: {} });
    expect(opt.shipping_rate_data.fixed_amount.amount).toBe(1000);
    expect(opt.shipping_rate_data.display_name).toMatch(/standard/i);
  });

  it("is free exactly at the threshold", () => {
    const [opt] = buildShippingOptions({ subtotalCents: 15000, env: {} });
    expect(opt.shipping_rate_data.fixed_amount.amount).toBe(0);
    expect(opt.shipping_rate_data.display_name).toMatch(/free/i);
  });

  it("honors env overrides", () => {
    const env = { FREE_SHIPPING_THRESHOLD_CENTS: "5000", SHIPPING_STANDARD_CENTS: "799" };
    expect(buildShippingOptions({ subtotalCents: 4999, env })[0].shipping_rate_data.fixed_amount.amount).toBe(799);
    expect(buildShippingOptions({ subtotalCents: 5000, env })[0].shipping_rate_data.fixed_amount.amount).toBe(0);
  });

  it("always includes a 5-7 business day estimate", () => {
    const [opt] = buildShippingOptions({ subtotalCents: 1, env: {} });
    expect(opt.shipping_rate_data.delivery_estimate.minimum.value).toBe(5);
    expect(opt.shipping_rate_data.delivery_estimate.maximum.value).toBe(7);
  });
});

describe("allowedShippingCountries", () => {
  it("defaults to US", () => {
    expect(allowedShippingCountries({})).toEqual(["US"]);
  });

  it("parses comma-separated env values", () => {
    expect(allowedShippingCountries({ SHIPPING_COUNTRIES: "us, ca ,GB" })).toEqual([
      "US",
      "CA",
      "GB",
    ]);
  });
});

/**
 * lib/checkout.js — pure checkout builders.
 *
 * No I/O here: the handler fetches the catalog overlay and passes it in, so
 * every pricing/validation rule is unit-testable. Prices are computed
 * server-side only — client-sent prices are never trusted.
 *
 * Money convention: catalog prices are dollars; Stripe wants integer cents.
 */

const MAX_QTY_PER_LINE = 10;

export class CheckoutError extends Error {
  constructor(message, code = "invalid_cart") {
    super(message);
    this.name = "CheckoutError";
    this.code = code;
    this.status = 400;
  }
}

function toCents(dollars) {
  const n = Number(dollars);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function absolutize(imagePath, origin) {
  if (!imagePath) return null;
  const s = String(imagePath);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return origin ? `${origin}${s.startsWith("/") ? "" : "/"}${s}` : null;
}

/**
 * Build Stripe line items from cart items.
 *
 * @param {object}   args
 * @param {Array}    args.items          cart items: { id?, slug?, quantity, size?, isPreorder?, image? }
 * @param {Array}    args.catalog        static product catalog (src/data/products.js)
 * @param {Map|null} args.overlayBySlug  Map<slug, { price, comparePrice, stock, isActive }>
 *                                       from the Supabase products table (admin-edited truth).
 * @param {string}   args.origin         absolute origin for image URLs
 * @returns {{ lineItems: Array, subtotalCents: number }}
 * @throws {CheckoutError} on any invalid line
 */
export function buildLineItems({ items, catalog, overlayBySlug = null, origin = "" }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutError("Your bag is empty.", "empty_cart");
  }
  if (items.length > 50) {
    throw new CheckoutError("Too many items in one order.", "too_many_lines");
  }

  let subtotalCents = 0;

  const lineItems = items.map((item) => {
    if (!item || (!item.id && !item.slug)) {
      throw new CheckoutError("A cart item is missing its product reference.");
    }

    const product = catalog.find(
      (p) => p.id === item.id || p.slug === item.slug
    );
    if (!product) {
      throw new CheckoutError(
        `Unknown product: ${item.id || item.slug}`,
        "unknown_product"
      );
    }

    const label = product.displayName || product.name || product.slug;

    // Quantity: integer, 1..MAX_QTY_PER_LINE
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) {
      throw new CheckoutError(
        `Quantity for ${label} must be between 1 and ${MAX_QTY_PER_LINE}.`,
        "invalid_quantity"
      );
    }

    // Size must belong to the product when the product defines sizes.
    const size = item.size != null ? String(item.size) : null;
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    if (sizes.length > 0) {
      if (!size || !sizes.includes(size)) {
        throw new CheckoutError(
          `Please select a valid size for ${label}.`,
          "invalid_size"
        );
      }
    }

    // Purchasability by release status.
    const status = String(product.releaseStatus || "available");
    const purchasable =
      status === "available" || (status === "preorder" && Boolean(item.isPreorder));
    if (!purchasable) {
      throw new CheckoutError(
        `${label} is not available for purchase right now.`,
        "not_purchasable"
      );
    }

    // Live overlay: admin-managed price / stock / active flag win over the
    // static catalog. Missing overlay row → static price (graceful).
    const overlay = overlayBySlug ? overlayBySlug.get(product.slug) : null;
    if (overlay) {
      if (overlay.isActive === false) {
        throw new CheckoutError(
          `${label} is no longer available.`,
          "not_purchasable"
        );
      }
      if (overlay.stock != null && overlay.stock <= 0) {
        throw new CheckoutError(`${label} is sold out.`, "sold_out");
      }
      if (overlay.stock != null && quantity > overlay.stock) {
        throw new CheckoutError(
          `Only ${overlay.stock} left of ${label}.`,
          "insufficient_stock"
        );
      }
    }

    const unitAmount = toCents(overlay?.price ?? product.price);
    if (unitAmount == null) {
      throw new CheckoutError(`Invalid price for ${label}.`, "invalid_price");
    }

    subtotalCents += unitAmount * quantity;

    const image = absolutize(item.image || product.images?.[0] || null, origin);

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: label,
          ...(size ? { description: `Size: ${size}` } : {}),
          images: image ? [image] : [],
          // Read back by the webhook (listLineItems + expanded product) to
          // write order_items rows without parsing display strings.
          // gift_card lines trigger code issuance in the webhook.
          metadata: {
            slug: product.slug,
            size: size || "",
            product_id: product.id,
            gift_card: product.giftCard ? "true" : "",
          },
        },
        unit_amount: unitAmount,
        // Subscription-capable products (product.subscription.interval)
        // bill on a recurring price; the session switches to
        // mode: "subscription" (see subscriptionInterval()).
        ...(product.subscription?.interval
          ? { recurring: { interval: product.subscription.interval } }
          : {}),
      },
      quantity,
    };
  });

  return { lineItems, subtotalCents };
}

/**
 * Shipping options for Stripe Checkout. Single clear choice:
 * free standard shipping at/above the threshold, flat rate below.
 * Amounts are env-configurable; defaults match the site's promised microcopy
 * ("Free shipping on orders over $150").
 */
export function buildShippingOptions({ subtotalCents, env = {} }) {
  const thresholdCents = Number(
    env.FREE_SHIPPING_THRESHOLD_CENTS ?? 15000
  );
  const standardCents = Number(env.SHIPPING_STANDARD_CENTS ?? 1000);

  const deliveryEstimate = {
    minimum: { unit: "business_day", value: 5 },
    maximum: { unit: "business_day", value: 7 },
  };

  const free = subtotalCents >= thresholdCents;

  return [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: free ? 0 : standardCents, currency: "usd" },
        display_name: free ? "Free Standard Shipping" : "Standard Shipping",
        delivery_estimate: deliveryEstimate,
      },
    },
  ];
}

/**
 * Allowed shipping countries from env (comma-separated ISO codes), default US.
 */
export function allowedShippingCountries(env = {}) {
  return String(env.SHIPPING_COUNTRIES || "US")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

/**
 * True when every cart item is a digital gift card — those sessions skip
 * shipping address collection and shipping charges entirely.
 */
export function isDigitalOnly(items, catalog) {
  if (!Array.isArray(items) || !items.length) return false;
  return items.every((item) => {
    const product = catalog.find((p) => p.id === item.id || p.slug === item.slug);
    return Boolean(product?.giftCard);
  });
}

/**
 * Subscription support (dormant until a catalog product declares
 * `subscription: { interval: "month" | "week" | "year" }`).
 *
 * Returns the billing interval when the cart is subscription-based, null for
 * ordinary carts. Mixing subscription and one-time items in one session is
 * rejected — Stripe's subscription mode complicates shipping and totals, so
 * they check out separately (same pattern as preorder vs standard).
 */
export function subscriptionInterval(items, catalog) {
  if (!Array.isArray(items) || !items.length) return null;

  const intervals = items.map((item) => {
    const product = catalog.find((p) => p.id === item.id || p.slug === item.slug);
    return product?.subscription?.interval || null;
  });

  const subCount = intervals.filter(Boolean).length;
  if (subCount === 0) return null;
  if (subCount !== items.length) {
    throw new CheckoutError(
      "Subscriptions are checked out separately from one-time items.",
      "mixed_subscription"
    );
  }
  const unique = [...new Set(intervals)];
  if (unique.length > 1) {
    throw new CheckoutError(
      "Please checkout subscriptions with different billing periods separately.",
      "mixed_subscription_interval"
    );
  }
  return unique[0];
}

import Stripe from "stripe";
import { checkRateLimit } from "./_utils/rateLimit.js";
import { getUserFromReq } from "./_utils/auth.js";
import { supabaseServer } from "../lib/supabaseServer.js";
import { products } from "../src/data/products.js";
import {
  buildLineItems,
  buildShippingOptions,
  allowedShippingCountries,
  isDigitalOnly,
  CheckoutError,
} from "../lib/checkout.js";

// Lazy-init: guard against missing key in local dev (no .env set up)
let _stripe = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

// Pin redirect URLs to the canonical site when configured; otherwise fall
// back to the request origin (local dev, previews).
function resolveOrigin(req) {
  const configured = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (configured) return String(configured).replace(/\/+$/, "");
  return (
    req.headers.origin ||
    `https://${req.headers["x-forwarded-host"] || req.headers.host}`
  );
}

/**
 * Live price/stock overlay for the requested slugs — the same Supabase
 * `products` rows the admin panel edits and the storefront displays. This is
 * what guarantees the charged price equals the displayed price. On any
 * failure we fall back to static catalog prices rather than blocking sales.
 */
async function fetchOverlay(slugs) {
  try {
    const { data, error } = await supabaseServer
      .from("products")
      .select("slug, price, compare_at_price, stock, is_active")
      .in("slug", slugs);
    if (error || !Array.isArray(data)) {
      if (error) console.warn("Checkout overlay unavailable:", error.message);
      return null;
    }
    const map = new Map();
    for (const r of data) {
      if (!r.slug) continue;
      map.set(r.slug, {
        price: r.price != null ? Number(r.price) : null,
        comparePrice: r.compare_at_price != null ? Number(r.compare_at_price) : null,
        stock: r.stock != null ? Number(r.stock) : null,
        isActive: r.is_active !== false,
      });
    }
    return map;
  } catch (err) {
    console.warn("Checkout overlay fetch failed:", err?.message || err);
    return null;
  }
}

export default async function handler(req, res) {
  return await createHandler(req, res);
}

export async function createHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit: 5 checkout session creations per IP per minute
  const allowed = await checkRateLimit(req, res, {
    endpoint: "checkout",
    max: 5,
    windowMs: 60_000,
  });
  if (!allowed) return;

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY in your .env.local file." });
  }

  try {
    const { items, userId, customerEmail, referralCode, useStoreCredit } = req.body || {};

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid cart items" });
    }

    // Server-side enforcement: reject mixed preorder + domestic checkout.
    const hasPreorder = items.some((i) => Boolean(i.isPreorder));
    const hasDomestic = items.some((i) => !i.isPreorder);
    if (hasPreorder && hasDomestic) {
      return res.status(400).json({
        error:
          "Mixed cart: pre-order and standard items cannot be checked out together. " +
          "Please checkout each group separately.",
      });
    }

    const origin = resolveOrigin(req);

    // Charged price = displayed price: overlay wins, static catalog fallback.
    const slugs = [...new Set(
      items
        .map((i) => i.slug || products.find((p) => p.id === i.id)?.slug)
        .filter(Boolean)
    )];
    const overlayBySlug = slugs.length ? await fetchOverlay(slugs) : null;

    const { lineItems, subtotalCents } = buildLineItems({
      items,
      catalog: products,
      overlayBySlug,
      origin,
    });

    // Aggregate preorder metadata for the session.
    const isPreorderSession = hasPreorder;
    const preorderLeadDays = isPreorderSession
      ? Math.max(...items.map((i) => Number(i.leadTimeDays || 0)))
      : 0;

    // Digital gift-card-only orders: nothing ships, nothing to charge for.
    const digitalOnly = isDigitalOnly(items, products);

    // Store credit: only for a BEARER-VERIFIED user (the body's userId is
    // client-supplied and must never unlock someone else's balance). Applied
    // as a one-off coupon; Stripe disallows combining explicit discounts
    // with allow_promotion_codes, so promo entry is off for these sessions.
    let storeCredit = null; // { userId, cents, couponId }
    if (useStoreCredit) {
      const authedUser = await getUserFromReq(req);
      if (authedUser) {
        try {
          const { data: prof } = await supabaseServer
            .from("profiles")
            .select("store_credit_cents")
            .eq("id", authedUser.id)
            .maybeSingle();
          const balance = Number(prof?.store_credit_cents || 0);
          const cents = Math.min(balance, subtotalCents);
          if (cents > 0) {
            const coupon = await stripe.coupons.create({
              amount_off: cents,
              currency: "usd",
              duration: "once",
              name: "Store credit",
            });
            storeCredit = { userId: authedUser.id, cents, couponId: coupon.id };
          }
        } catch (err) {
          console.warn("Store credit skipped:", err?.message || err);
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      // No payment_method_types: automatic payment methods let Stripe show
      // Apple Pay / Google Pay / Link when enabled in the dashboard.
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,

      ...(storeCredit
        ? { discounts: [{ coupon: storeCredit.couponId }] }
        : { allow_promotion_codes: true }),

      // Physical goods: collect where to ship and charge the promised rates
      // (free at/above the threshold, flat standard below). Digital gift
      // cards skip shipping entirely.
      ...(digitalOnly
        ? {}
        : {
            shipping_address_collection: {
              allowed_countries: allowedShippingCountries(process.env),
            },
            shipping_options: buildShippingOptions({ subtotalCents, env: process.env }),
          }),

      // Supabase user mapping for loyalty + order history.
      client_reference_id: userId ? String(userId) : undefined,
      customer_email: customerEmail ? String(customerEmail) : undefined,

      metadata: {
        source: "se_checkout",
        user_id: userId ? String(userId) : "",
        customer_email: customerEmail ? String(customerEmail) : "",
        referral_code: referralCode ? String(referralCode).slice(0, 40) : "",
        preorder: isPreorderSession ? "true" : "false",
        lead_time_days: isPreorderSession ? String(preorderLeadDays) : "0",
        store_credit_cents: storeCredit ? String(storeCredit.cents) : "0",
        store_credit_user: storeCredit ? storeCredit.userId : "",
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.error("Stripe error:", err?.message || err);
    res.status(500).json({ error: "Unable to start checkout. Please try again." });
  }
}

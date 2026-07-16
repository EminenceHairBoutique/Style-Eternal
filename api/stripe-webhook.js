import Stripe from "stripe";
import { randomBytes } from "node:crypto";
import { supabaseServer } from "../lib/supabaseServer.js";
import { generateOrderNumber } from "../lib/orderNumber.js";
import {
  sendOrderConfirmationEmail,
  sendCartRecoveryEmail,
  sendGiftCardEmail,
} from "../lib/email.js";
import { LOYALTY, pointsForPurchaseCents } from "../src/utils/loyalty.js";

export const config = {
  api: {
    bodyParser: false, // required for Stripe signature verification
  },
};

// Lazy-init: guard against missing key in local dev
let _stripe = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

async function getRawBody(req) {
  // Local dev (express.raw) provides a Buffer on req.body
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);

  // Vercel/Node fallback: read the request stream
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

const isUniqueViolation = (error) =>
  error?.code === "23505" || /duplicate key/i.test(String(error?.message || ""));

/**
 * Extract normalized items from Stripe line items. Uses the per-line
 * product metadata stamped by lib/checkout.js (slug/size/product_id), so no
 * display-string parsing is involved.
 */
function normalizeLineItems(lineItems) {
  return (lineItems?.data || []).map((li) => {
    const md = li.price?.product?.metadata || {};
    return {
      product_slug: md.slug || null,
      catalog_product_id: md.product_id || null,
      product_name: li.description || md.slug || "Item",
      variant: md.size || null,
      quantity: Number(li.quantity || 1),
      unit_price: li.price?.unit_amount != null ? li.price.unit_amount / 100 : 0,
      line_total: li.amount_total != null ? li.amount_total / 100 : 0,
      isGiftCard: md.gift_card === "true",
    };
  });
}

/**
 * Issue digital gift cards for purchased gift-card line items (one unique
 * code per unit) and email them to the purchaser. Never throws; a unique
 * stripe_session_id + code pair keeps webhook retries from double-issuing
 * (the 23505 idempotency skip path never reaches here anyway).
 */
async function issueGiftCards({ normalizedItems, email, orderNumber, sessionId }) {
  const cardLines = normalizedItems.filter((i) => i.isGiftCard);
  if (!cardLines.length || !email) return;

  try {
    for (const line of cardLines) {
      const amountCents = Math.round(Number(line.unit_price || 0) * 100);
      if (amountCents <= 0) continue;

      for (let unit = 0; unit < line.quantity; unit++) {
        const code = `SE-GIFT-${randomBytes(5).toString("hex").toUpperCase()}`;

        const { error } = await supabaseServer.from("gift_cards").insert({
          code,
          amount_cents: amountCents,
          purchaser_email: email,
          order_number: orderNumber,
          stripe_session_id: sessionId,
        });
        if (error) {
          console.warn("Gift card insert failed:", error.message);
          continue;
        }

        try {
          await sendGiftCardEmail({ to: email, code, amountCents });
        } catch (err) {
          console.warn("Gift card email failed:", err?.message || err);
        }
      }
    }
  } catch (err) {
    console.warn("Gift card issuance skipped:", err?.message || err);
  }
}

/** Deduct applied store credit after payment (bearer-verified at session create). Never throws. */
async function settleStoreCredit(session) {
  const cents = Number(session.metadata?.store_credit_cents || 0);
  const userId = session.metadata?.store_credit_user || null;
  if (!cents || !userId) return;
  try {
    const { data, error } = await supabaseServer.rpc("deduct_store_credit", {
      p_user: userId,
      p_amount: cents,
    });
    if (error) console.warn("deduct_store_credit failed:", error.message);
    else if (Number(data) < cents) {
      // Two concurrent sessions can race the same balance; the clamp means
      // the second one under-deducts. Log for reconciliation — rare + small.
      console.warn(`Store credit under-deducted: wanted ${cents}, got ${data} (user ${userId})`);
    }
  } catch (err) {
    console.warn("Store credit settlement skipped:", err?.message || err);
  }
}

/** Insert order_items rows for an order. Never throws. */
async function insertOrderItems(orderId, normalizedItems) {
  if (!orderId || !normalizedItems.length) return;
  try {
    // Map catalog slugs → DB product UUIDs (order_items.product_id is a UUID
    // FK onto public.products; the catalog's string ids don't fit it).
    const slugs = [...new Set(normalizedItems.map((i) => i.product_slug).filter(Boolean))];
    const idBySlug = new Map();
    if (slugs.length) {
      const { data } = await supabaseServer
        .from("products")
        .select("id, slug")
        .in("slug", slugs);
      for (const row of data || []) idBySlug.set(row.slug, row.id);
    }

    const rows = normalizedItems.map((i) => ({
      order_id: orderId,
      product_id: i.product_slug ? idBySlug.get(i.product_slug) || null : null,
      product_slug: i.product_slug,
      product_name: i.product_name,
      variant: i.variant,
      quantity: i.quantity,
      unit_price: i.unit_price,
      line_total: i.line_total,
    }));

    const { error } = await supabaseServer.from("order_items").insert(rows);
    if (error) console.warn("order_items insert failed:", error.message);
  } catch (err) {
    console.warn("order_items insert exception:", err?.message || err);
  }
}

/** Atomically decrement live stock for purchased slugs. Never throws. */
async function decrementInventory(normalizedItems) {
  for (const item of normalizedItems) {
    if (!item.product_slug || !item.quantity) continue;
    try {
      const { error } = await supabaseServer.rpc("decrement_stock", {
        p_slug: item.product_slug,
        p_qty: item.quantity,
      });
      if (error) console.warn("decrement_stock failed:", error.message);
    } catch (err) {
      console.warn("decrement_stock exception:", err?.message || err);
    }
  }
}

/** Attribute a Stripe promotion-code redemption to the local discount table. Never throws. */
async function attributeDiscount(stripe, session, orderId) {
  try {
    if (!session.total_details?.amount_discount) return;

    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["total_details.breakdown"],
    });
    const discounts = full.total_details?.breakdown?.discounts || [];

    for (const d of discounts) {
      const promoId = d.discount?.promotion_code;
      if (!promoId) continue;

      let code = null;
      try {
        const promo = await stripe.promotionCodes.retrieve(promoId);
        code = promo?.code || null;
      } catch { /* display code is best-effort */ }

      try {
        await supabaseServer.rpc("increment_discount_usage", { p_promo_id: promoId });
      } catch (err) {
        console.warn("increment_discount_usage failed:", err?.message || err);
      }

      if (code && orderId) {
        await supabaseServer
          .from("orders")
          .update({ discount_code: code })
          .eq("id", orderId);
      }
    }
  } catch (err) {
    console.warn("Discount attribution skipped:", err?.message || err);
  }
}

async function awardLoyalty({ userId, email, amountTotalCents, orderNumber, stripeSessionId }) {
  if (!userId) return;

  try {
    // Ensure a profile row exists and fetch current values in one round-trip.
    // ignoreDuplicates: true means existing rows are left unchanged (no overwrite of earned points).
    const { data: profile, error: profErr } = await supabaseServer
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: email || null,
          loyalty_points: 0,
          lifetime_spend_cents: 0,
          first_purchase_bonus_awarded: false,
        },
        { onConflict: "id", ignoreDuplicates: true }
      )
      .select("id, email, loyalty_points, lifetime_spend_cents, first_purchase_bonus_awarded")
      .maybeSingle();

    if (profErr) {
      console.warn("Loyalty: could not read/create profile", profErr);
      return;
    }

    const currentPoints = Number(profile?.loyalty_points || 0);
    const currentSpend = Number(profile?.lifetime_spend_cents || 0);

    const earned = pointsForPurchaseCents(amountTotalCents);
    const bonus = profile?.first_purchase_bonus_awarded ? 0 : LOYALTY.firstPurchaseBonusPoints;

    const { error: updErr } = await supabaseServer
      .from("profiles")
      .update({
        loyalty_points: currentPoints + earned + bonus,
        lifetime_spend_cents: currentSpend + Number(amountTotalCents || 0),
        first_purchase_bonus_awarded: profile?.first_purchase_bonus_awarded || bonus > 0,
      })
      .eq("id", userId);

    if (updErr) {
      console.warn("Loyalty: profile update failed", updErr);
      return;
    }

    try {
      const entries = [];
      if (earned > 0)
        entries.push({
          user_id: userId,
          delta: earned,
          reason: "purchase",
          order_number: orderNumber,
          stripe_session_id: stripeSessionId,
        });
      if (bonus > 0)
        entries.push({
          user_id: userId,
          delta: bonus,
          reason: "first_purchase_bonus",
          order_number: orderNumber,
          stripe_session_id: stripeSessionId,
        });

      if (entries.length) {
        const { error: ledgerErr } = await supabaseServer.from("loyalty_ledger").insert(entries);
        if (ledgerErr) {
          console.warn("Loyalty: ledger insert skipped", ledgerErr.message || ledgerErr);
        }
      }
    } catch (e) {
      console.warn("Loyalty: ledger insert exception", e?.message || e);
    }
  } catch (err) {
    console.warn("Loyalty: award exception", err?.message || err);
  }
}

async function handleCheckoutCompleted(stripe, session) {
  const email =
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.customer_email ||
    null;
  const userId = session.client_reference_id || session.metadata?.user_id || null;

  const orderNumber = await generateOrderNumber(supabaseServer);

  let lineItems = null;
  try {
    lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ["data.price.product"],
    });
  } catch (err) {
    console.warn("listLineItems failed:", err?.message || err);
  }
  const normalizedItems = normalizeLineItems(lineItems);

  const shipping = session.shipping_details || session.customer_details || null;
  const shippingAddress = shipping
    ? { name: shipping.name || null, ...(shipping.address || {}) }
    : {};

  const amountTotal = Number(session.amount_total || 0);

  const order = {
    order_number: orderNumber,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent || null,
    stripe_payment_id: session.payment_intent || null,
    user_id: userId,
    email,
    customer_email: email,
    customer_name: session.customer_details?.name || null,
    amount_total: amountTotal,
    currency: session.currency,
    subtotal: Number(session.amount_subtotal || 0) / 100,
    shipping: Number(session.shipping_cost?.amount_total || 0) / 100,
    tax: Number(session.total_details?.amount_tax || 0) / 100,
    total: amountTotal / 100,
    shipping_address: shippingAddress,
    items: lineItems?.data || [],
    consent: session.metadata || {},
    status: "paid",
  };

  // Insert-first idempotency: the partial unique index on stripe_session_id
  // makes a duplicate insert fail with 23505, which we treat as
  // "already processed" (Stripe retries webhooks). On that path we still
  // backfill order_items if a previous attempt crashed between steps.
  const { data: inserted, error: insertErr } = await supabaseServer
    .from("orders")
    .insert(order)
    .select("id")
    .maybeSingle();

  if (insertErr) {
    if (isUniqueViolation(insertErr)) {
      console.log("Order already exists for session", session.id);
      try {
        const { data: existing } = await supabaseServer
          .from("orders")
          .select("id, order_items(id)")
          .eq("stripe_session_id", session.id)
          .maybeSingle();
        if (existing && (existing.order_items || []).length === 0) {
          await insertOrderItems(existing.id, normalizedItems);
        }
      } catch (err) {
        console.warn("order_items backfill skipped:", err?.message || err);
      }
      return;
    }
    console.error("Failed to save order:", insertErr);
    throw insertErr; // → 500 → Stripe retries
  }

  const orderId = inserted?.id || null;
  console.log("Order saved:", orderNumber);

  // Post-insert steps: each independently guarded so a partial failure never
  // 500s after the order row exists (a retry would hit the 23505 path and
  // skip everything below).
  await insertOrderItems(orderId, normalizedItems);
  await decrementInventory(normalizedItems);
  await awardLoyalty({
    userId,
    email,
    amountTotalCents: amountTotal,
    orderNumber,
    stripeSessionId: session.id,
  });
  await attributeDiscount(stripe, session, orderId);
  await issueGiftCards({ normalizedItems, email, orderNumber, sessionId: session.id });
  await settleStoreCredit(session);

  try {
    await sendOrderConfirmationEmail({
      to: email,
      orderNumber,
      amount: amountTotal,
      items: normalizedItems,
      shippingAddress,
      isPreorder: session.metadata?.preorder === "true",
    });
  } catch (err) {
    console.error("Confirmation email failed:", err?.message || err);
  }
}

async function handleCheckoutExpired(stripe, session) {
  const email =
    session.customer_details?.email || session.metadata?.customer_email || null;
  if (!email) return;

  try {
    // Record once per session; emailed_at guards single-send.
    await supabaseServer.from("abandoned_checkouts").upsert(
      {
        stripe_session_id: session.id,
        email,
        amount_total: Number(session.amount_total || 0),
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true }
    );

    const { data: row, error } = await supabaseServer
      .from("abandoned_checkouts")
      .select("id, emailed_at")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (error || !row || row.emailed_at) return;

    let items = [];
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 20,
        expand: ["data.price.product"],
      });
      items = normalizeLineItems(lineItems);
      await supabaseServer
        .from("abandoned_checkouts")
        .update({ items })
        .eq("id", row.id);
    } catch { /* summary is best-effort */ }

    const origin =
      process.env.SITE_URL ||
      process.env.VITE_SITE_URL ||
      "https://www.shopstyleeternal.com";

    await sendCartRecoveryEmail({
      to: email,
      items,
      resumeUrl: `${String(origin).replace(/\/+$/, "")}/cart`,
    });

    await supabaseServer
      .from("abandoned_checkouts")
      .update({ emailed_at: new Date().toISOString() })
      .eq("id", row.id);
  } catch (err) {
    // Recovery is best-effort marketing — never fail the webhook for it.
    console.warn("Abandoned-checkout handling skipped:", err?.message || err);
  }
}

async function handleChargeRefunded(charge) {
  const paymentIntent = charge?.payment_intent;
  if (!paymentIntent) return;
  try {
    const { error } = await supabaseServer
      .from("orders")
      .update({ status: "refunded" })
      .or(`stripe_payment_intent.eq.${paymentIntent},stripe_payment_id.eq.${paymentIntent}`);
    if (error) console.warn("Refund status update failed:", error.message);
    else console.log("Order marked refunded for", paymentIntent);
  } catch (err) {
    console.warn("Refund handling skipped:", err?.message || err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).send("Stripe is not configured.");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await getRawBody(req),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Event verified — safe to trust.
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object);
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(stripe, event.data.object);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        console.warn(
          "PaymentIntent failed:",
          intent.id,
          intent.last_payment_error?.message || ""
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

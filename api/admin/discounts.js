/**
 * api/admin/discounts.js — bridge the admin discount_codes table to Stripe.
 *
 * The storefront's checkout applies Stripe-native promotion codes
 * (allow_promotion_codes), so a discount only works once it exists in Stripe.
 * This endpoint makes the admin UI real:
 *
 *   POST { action: "sync", id }        → create a Stripe coupon + promotion
 *                                        code for the row and store their ids
 *   POST { action: "deactivate", id }  → deactivate the Stripe promotion code
 *                                        and the local row
 *
 * Stripe coupons are immutable, so "sync" on an already-synced row issues a
 * fresh coupon + promotion code and deactivates the previous promotion code
 * (redemption history stays intact in Stripe).
 */
import Stripe from "stripe";
import { supabaseServer } from "../../lib/supabaseServer.js";
import { requireAdmin } from "../_utils/auth.js";

let _stripe = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function parseJsonBody(req) {
  const raw = req.body;
  if (raw && typeof raw === "object") return raw;
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return null; } }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return null;
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return null; }
}

async function deactivatePromo(stripe, promoId) {
  if (!promoId) return;
  try {
    await stripe.promotionCodes.update(promoId, { active: false });
  } catch (err) {
    console.warn("Promotion code deactivation skipped:", err?.message || err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const admin = await requireAdmin(req, res);
  if (!admin) return; // response already sent

  const stripe = getStripe();
  if (!stripe) return json(res, 503, { error: "Stripe is not configured" });

  const body = await parseJsonBody(req);
  if (!body?.id) return json(res, 400, { error: "Missing discount id" });

  const { data: row, error: rowErr } = await supabaseServer
    .from("discount_codes")
    .select("*")
    .eq("id", body.id)
    .maybeSingle();
  if (rowErr || !row) return json(res, 404, { error: "Discount not found" });

  const action = String(body.action || "sync").toLowerCase();

  try {
    if (action === "deactivate") {
      await deactivatePromo(stripe, row.stripe_promotion_code_id);
      const { error } = await supabaseServer
        .from("discount_codes")
        .update({ is_active: false, sync_status: "deactivated" })
        .eq("id", row.id);
      if (error) throw error;
      return json(res, 200, { ok: true, status: "deactivated" });
    }

    if (action !== "sync") return json(res, 400, { error: "Unknown action" });

    // Validate the row before touching Stripe.
    const value = Number(row.value || 0);
    if (!row.code || value <= 0) {
      return json(res, 400, { error: "Code and a positive value are required" });
    }
    if (row.type === "percentage" && value > 100) {
      return json(res, 400, { error: "Percentage discounts cannot exceed 100%" });
    }

    // Coupons are immutable — re-syncing replaces the promo code.
    await deactivatePromo(stripe, row.stripe_promotion_code_id);

    const coupon = await stripe.coupons.create({
      name: row.code,
      duration: "once",
      ...(row.type === "percentage"
        ? { percent_off: value }
        : { amount_off: Math.round(value * 100), currency: "usd" }),
    });

    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: row.code,
      active: Boolean(row.is_active),
      ...(row.usage_limit ? { max_redemptions: Number(row.usage_limit) } : {}),
      ...(row.expires_at
        ? { expires_at: Math.floor(new Date(row.expires_at).getTime() / 1000) }
        : {}),
      ...(Number(row.min_order_value) > 0
        ? {
            restrictions: {
              minimum_amount: Math.round(Number(row.min_order_value) * 100),
              minimum_amount_currency: "usd",
            },
          }
        : {}),
    });

    const { error: updErr } = await supabaseServer
      .from("discount_codes")
      .update({
        stripe_coupon_id: coupon.id,
        stripe_promotion_code_id: promo.id,
        sync_status: "synced",
      })
      .eq("id", row.id);
    if (updErr) throw updErr;

    return json(res, 200, {
      ok: true,
      status: "synced",
      stripeCouponId: coupon.id,
      stripePromotionCodeId: promo.id,
    });
  } catch (err) {
    console.error("Discount sync error:", err?.message || err);
    const message = err?.raw?.message || err?.message || "Stripe sync failed";
    return json(res, 500, { error: message });
  }
}

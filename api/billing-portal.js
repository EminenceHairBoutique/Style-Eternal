/**
 * POST /api/billing-portal — Stripe Customer Portal session for the
 * signed-in customer (manage subscriptions, payment methods, invoices).
 *
 * Requires a bearer token; the portal opens for the caller's own
 * stripe_customer_id (stored by the webhook when a subscription checkout
 * completes). 404 when the account has no Stripe customer yet.
 *
 * Note: the portal must be configured once in the Stripe dashboard
 * (Settings → Billing → Customer portal) — see RUNBOOK.md.
 */
import Stripe from "stripe";
import { supabaseServer } from "../lib/supabaseServer.js";
import { requireUser } from "./_utils/auth.js";
import { checkRateLimit } from "./_utils/rateLimit.js";

let _stripe = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

function resolveOrigin(req) {
  const configured = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (configured) return String(configured).replace(/\/+$/, "");
  return (
    req.headers.origin ||
    `https://${req.headers["x-forwarded-host"] || req.headers.host}`
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const allowed = await checkRateLimit(req, res, {
    endpoint: "billing-portal",
    max: 10,
    windowMs: 60_000,
  });
  if (!allowed) return;

  const user = await requireUser(req, res);
  if (!user) return; // response already sent

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: "Stripe is not configured" });
  }

  try {
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return res.status(404).json({ error: "No billing profile yet" });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${resolveOrigin(req)}/account`,
    });

    return res.status(200).json({ url: portal.url });
  } catch (err) {
    console.error("Billing portal error:", err?.message || err);
    return res.status(500).json({ error: "Could not open the billing portal" });
  }
}

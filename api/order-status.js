/**
 * GET /api/order-status?session_id=cs_...
 *
 * Lets the /success page show the real order number instead of a Stripe
 * session id suffix. The session id is an unguessable capability handed to
 * the buyer by Stripe, so no auth is required — but the response is limited
 * to non-sensitive fields and the email is masked.
 *
 * Returns 200 { found: false } while the webhook hasn't landed yet (the
 * client polls briefly, then falls back to its local snapshot).
 */
import { supabaseServer } from "../lib/supabaseServer.js";
import { checkRateLimit } from "./_utils/rateLimit.js";

function maskEmail(email) {
  const s = String(email || "");
  const at = s.indexOf("@");
  if (at <= 1) return s ? "***" : null;
  return `${s[0]}***${s.slice(at - 1)}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const allowed = await checkRateLimit(req, res, {
    endpoint: "order-status",
    max: 20,
    windowMs: 60_000,
  });
  if (!allowed) return;

  const sessionId = String(req.query?.session_id || "").trim();
  if (!sessionId.startsWith("cs_") || sessionId.length > 200) {
    return res.status(400).json({ error: "Invalid session id" });
  }

  try {
    const { data, error } = await supabaseServer
      .from("orders")
      .select("order_number, status, amount_total, currency, email, created_at")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.warn("order-status lookup failed:", error.message);
      return res.status(200).json({ found: false });
    }
    if (!data) return res.status(200).json({ found: false });

    return res.status(200).json({
      found: true,
      orderNumber: data.order_number,
      status: data.status,
      amountTotal: data.amount_total != null ? Number(data.amount_total) : null,
      currency: data.currency || "usd",
      emailMasked: maskEmail(data.email),
      createdAt: data.created_at,
    });
  } catch (err) {
    console.warn("order-status exception:", err?.message || err);
    return res.status(200).json({ found: false });
  }
}

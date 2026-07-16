/**
 * api/admin/orders.js — admin fulfillment actions that need server-side email.
 *
 *   POST { action: "ship", id, trackingNumber, trackingCarrier, trackingUrl? }
 *     → stamps tracking + shipped_at, sets status "shipped", emails the
 *       customer with the tracking link
 *   POST { action: "return-update", returnId, status, adminNotes? }
 *     → moves a return through its lifecycle and emails the customer
 *
 * Plain status edits stay in the admin SPA via RLS; these two flows live here
 * because RESEND_API_KEY is server-only.
 */
import { supabaseServer } from "../../lib/supabaseServer.js";
import { requireAdmin } from "../_utils/auth.js";
import {
  sendOrderShippedEmail,
  sendReturnStatusEmail,
} from "../../lib/email.js";

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

const CARRIER_URLS = {
  usps: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(n)}`,
  ups: (n) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  fedex: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  dhl: (n) => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encodeURIComponent(n)}`,
};

function resolveTrackingUrl({ trackingUrl, trackingCarrier, trackingNumber }) {
  if (trackingUrl) return String(trackingUrl);
  const build = CARRIER_URLS[String(trackingCarrier || "").toLowerCase()];
  return build && trackingNumber ? build(String(trackingNumber)) : null;
}

const RETURN_STATUSES = ["requested", "approved", "rejected", "received", "refunded"];

async function handleShip(res, body) {
  const trackingNumber = String(body.trackingNumber || "").trim();
  const trackingCarrier = String(body.trackingCarrier || "").trim().toLowerCase();
  if (!body.id || !trackingNumber) {
    return json(res, 400, { error: "Order id and tracking number are required" });
  }

  const trackingUrl = resolveTrackingUrl({
    trackingUrl: body.trackingUrl,
    trackingCarrier,
    trackingNumber,
  });

  const { data: order, error } = await supabaseServer
    .from("orders")
    .update({
      status: "shipped",
      tracking_number: trackingNumber,
      tracking_carrier: trackingCarrier || null,
      tracking_url: trackingUrl,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .select("id, order_number, email, customer_email, order_items(product_name, variant, quantity, unit_price, line_total)")
    .maybeSingle();

  if (error || !order) {
    return json(res, error ? 500 : 404, { error: error?.message || "Order not found" });
  }

  let emailed = false;
  const to = order.email || order.customer_email;
  if (to) {
    try {
      await sendOrderShippedEmail({
        to,
        orderNumber: order.order_number || order.id,
        trackingNumber,
        trackingCarrier,
        trackingUrl,
        items: order.order_items || [],
      });
      emailed = true;
    } catch (err) {
      console.warn("Shipped email failed:", err?.message || err);
    }
  }

  return json(res, 200, { ok: true, emailed, trackingUrl });
}

async function handleReturnUpdate(res, body) {
  const status = String(body.status || "").toLowerCase();
  if (!body.returnId || !RETURN_STATUSES.includes(status)) {
    return json(res, 400, { error: "returnId and a valid status are required" });
  }

  const adminNotes =
    body.adminNotes != null ? String(body.adminNotes).slice(0, 2000) : undefined;

  const { data: ret, error } = await supabaseServer
    .from("returns")
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq("id", body.returnId)
    .select("id, email, status, admin_notes, orders(order_number)")
    .maybeSingle();

  if (error || !ret) {
    return json(res, error ? 500 : 404, { error: error?.message || "Return not found" });
  }

  let emailed = false;
  if (ret.email) {
    try {
      await sendReturnStatusEmail({
        to: ret.email,
        orderNumber: ret.orders?.order_number || "your order",
        status,
        adminNotes: ret.admin_notes,
      });
      emailed = true;
    } catch (err) {
      console.warn("Return status email failed:", err?.message || err);
    }
  }

  return json(res, 200, { ok: true, emailed });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const admin = await requireAdmin(req, res);
  if (!admin) return; // response already sent

  const body = await parseJsonBody(req);
  if (!body) return json(res, 400, { error: "Invalid JSON" });

  const action = String(body.action || "").toLowerCase();
  if (action === "ship") return handleShip(res, body);
  if (action === "return-update") return handleReturnUpdate(res, body);
  return json(res, 400, { error: "Unknown action" });
}

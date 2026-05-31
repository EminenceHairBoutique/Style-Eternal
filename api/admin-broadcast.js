/* eslint-env node */
/**
 * api/admin-broadcast.js
 * Admin-only customer email broadcast.
 *
 * POST body:
 *   { action: "preview", recipientFilter }                  → { count }
 *   { action: "send", subject, bodyHtml, recipientFilter }  → { ok, sentCount, broadcastId }
 *
 * Security:
 *  - Requires a Bearer token; the caller must have profiles.is_admin = true.
 *  - Recipient emails are gathered and used entirely server-side; only counts
 *    are ever returned to the client.
 *  - Sends in batches via the existing Resend transport (lib/email.js).
 */
import { supabaseServer } from "../lib/supabaseServer.js";
import { sendBroadcastEmail } from "../lib/email.js";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function getBearerToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth) return null;
  const m = String(auth).match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
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

// Verify the caller is a signed-in admin (profiles.is_admin = true).
async function requireAdmin(req, res) {
  const token = getBearerToken(req);
  if (!token) { json(res, 401, { error: "Unauthorized" }); return null; }

  const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !userData?.user) { json(res, 401, { error: "Unauthorized" }); return null; }

  const { data: profile, error: profErr } = await supabaseServer
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (profErr || !profile?.is_admin) { json(res, 403, { error: "Forbidden" }); return null; }

  return userData.user;
}

// Gather a de-duplicated list of recipient emails for a filter. Server-side only.
async function gatherRecipients(recipientFilter) {
  const emails = new Set();

  // Newsletter / SMS-style signups always count for "all".
  if (recipientFilter === "all") {
    const { data } = await supabaseServer.from("email_signups").select("email");
    for (const r of data || []) {
      if (r.email) emails.add(String(r.email).trim().toLowerCase());
    }
  }

  // Profiles (registered users).
  let q = supabaseServer.from("profiles").select("email, account_tier, partner_status");
  const { data: profiles } = await q;
  for (const p of profiles || []) {
    if (!p.email) continue;
    const email = String(p.email).trim().toLowerCase();
    if (recipientFilter === "all") {
      emails.add(email);
    } else if (recipientFilter === "customers") {
      emails.add(email);
    } else if (recipientFilter === "partners") {
      if (p.partner_status === "approved" || p.account_tier === "partner") emails.add(email);
    }
  }

  return Array.from(emails);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const admin = await requireAdmin(req, res);
  if (!admin) return; // response already sent

  const body = await parseJsonBody(req);
  if (!body) return json(res, 400, { error: "Invalid JSON" });

  const action = String(body.action || "").toLowerCase();
  const recipientFilter = ["all", "customers", "partners"].includes(body.recipientFilter)
    ? body.recipientFilter
    : "all";

  // ---- Preview: just count recipients ------------------------------------
  if (action === "preview") {
    const recipients = await gatherRecipients(recipientFilter);
    return json(res, 200, { count: recipients.length });
  }

  // ---- Send --------------------------------------------------------------
  if (action === "send") {
    const subject = String(body.subject || "").trim();
    const bodyHtml = String(body.bodyHtml || "").trim();
    if (!subject || !bodyHtml) return json(res, 400, { error: "Subject and body are required" });

    const recipients = await gatherRecipients(recipientFilter);
    if (recipients.length === 0) return json(res, 400, { error: "No recipients match this filter" });

    // Record the broadcast as 'sending'.
    const { data: rec, error: recErr } = await supabaseServer
      .from("email_broadcasts")
      .insert({ subject, body_html: bodyHtml, recipient_filter: recipientFilter, status: "sending" })
      .select("id")
      .single();
    if (recErr) return json(res, 500, { error: "Could not create broadcast record" });

    const broadcastId = rec.id;
    let sent = 0;
    const BATCH = 10;

    try {
      for (let i = 0; i < recipients.length; i += BATCH) {
        const slice = recipients.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          slice.map((to) => sendBroadcastEmail({ to, subject, html: bodyHtml }))
        );
        sent += results.filter((r) => r.status === "fulfilled").length;
      }

      await supabaseServer
        .from("email_broadcasts")
        .update({ status: "sent", sent_count: sent, sent_at: new Date().toISOString() })
        .eq("id", broadcastId);

      return json(res, 200, { ok: true, sentCount: sent, broadcastId });
    } catch {
      await supabaseServer
        .from("email_broadcasts")
        .update({ status: "failed", sent_count: sent })
        .eq("id", broadcastId);
      return json(res, 500, { error: "Send failed", sentCount: sent, broadcastId });
    }
  }

  return json(res, 400, { error: "Unknown action" });
}

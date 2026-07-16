import { Resend } from "resend";
import { supabaseServer } from "./supabaseServer.js";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function requireResend() {
  if (!resend) {
    throw new Error(
      "Missing RESEND_API_KEY. Set it in your environment variables to send emails."
    );
  }
  return resend;
}

// All from/reply addresses derive from one env var so the sending domain can
// match whatever is verified in Resend (SPF/DKIM). Default: the site domain.
const FROM_DOMAIN = process.env.EMAIL_FROM_DOMAIN || "shopstyleeternal.com";
const from = (local) => `Style Eternal <${local}@${FROM_DOMAIN}>`;
const SUPPORT = `support@${FROM_DOMAIN}`;

const escapeHtml = (value = "") =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const usd = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Shared branded shell: editorial, restrained, email-client-safe (system
 * fonts, table layout, light background — dark themes render unreliably
 * across clients).
 */
function renderShell({ eyebrow, heading, bodyHtml }) {
  return `
  <div style="margin:0;padding:0;background:#F5F2EC;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EC;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E4DE;">
          <tr>
            <td style="background:#0A0A0A;padding:28px 32px;text-align:center;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;letter-spacing:0.35em;color:#E8E4DE;text-transform:uppercase;">Style&nbsp;Eternal</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;">
              ${eyebrow ? `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#A08A4A;">${eyebrow}</p>` : ""}
              <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;color:#0A0A0A;">${heading}</h1>
            </td>
          </tr>
          <tr><td style="padding:0 32px 36px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#3A3A3A;">
            ${bodyHtml}
          </td></tr>
          <tr>
            <td style="padding:22px 32px;border-top:1px solid #E8E4DE;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B6B6B;">The Flame Never Dies</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9A9A9A;">
                Questions? Reply to this email or write to ${SUPPORT}.
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

function renderItemsTable(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #EFEBE4;">
          <span style="color:#0A0A0A;">${escapeHtml(i.product_name || i.name || "Item")}</span>
          ${i.variant ? `<br /><span style="font-size:12px;color:#6B6B6B;">Size ${escapeHtml(i.variant)}</span>` : ""}
        </td>
        <td align="center" style="padding:10px 8px;border-bottom:1px solid #EFEBE4;color:#6B6B6B;white-space:nowrap;">× ${Number(i.quantity || 1)}</td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #EFEBE4;color:#0A0A0A;white-space:nowrap;">${usd(i.line_total ?? (Number(i.unit_price || 0) * Number(i.quantity || 1)))}</td>
      </tr>`
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;font-size:14px;">
      ${rows}
    </table>`;
}

function renderAddress(address = {}) {
  const parts = [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(line));
  if (!parts.length) return "";
  return `
    <p style="margin:18px 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#A08A4A;">Shipping to</p>
    <p style="margin:0;color:#3A3A3A;">${parts.join("<br />")}</p>`;
}

/**
 * Send a single marketing/broadcast email. Reuses the existing Resend client.
 * Used by api/admin-broadcast.js. `to` is a single recipient — the broadcast
 * endpoint loops/batches and never exposes the full list to the client.
 */
export async function sendBroadcastEmail({ to, subject, html }) {
  return requireResend().emails.send({
    from: from("news"),
    to,
    reply_to: SUPPORT,
    subject,
    html,
  });
}

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  amount, // cents
  items = [],
  shippingAddress = {},
  isPreorder = false,
}) {
  if (!to) return null;

  const bodyHtml = `
    <p style="margin:0 0 14px;">Thank you for your order. It's confirmed${
      isPreorder ? " and has entered the production queue" : ""
    }.</p>

    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#A08A4A;">Order number</p>
    <p style="margin:0 0 18px;font-size:18px;color:#0A0A0A;letter-spacing:0.05em;">${escapeHtml(orderNumber)}</p>

    ${renderItemsTable(items)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;font-size:14px;">
      <tr>
        <td style="padding:10px 0;color:#6B6B6B;">Total paid</td>
        <td align="right" style="padding:10px 0;color:#0A0A0A;font-size:16px;">${usd((amount || 0) / 100)}</td>
      </tr>
    </table>

    ${renderAddress(shippingAddress)}

    <p style="margin:22px 0 0;color:#6B6B6B;">
      ${
        isPreorder
          ? "Pre-orders ship in 14–21 business days. You'll receive tracking as soon as it's on the way."
          : "Your order ships within 2–3 business days. You'll receive tracking as soon as it's on the way."
      }
    </p>`;

  return requireResend().emails.send({
    from: from("orders"),
    to,
    reply_to: SUPPORT,
    subject: `Order ${orderNumber} confirmed`,
    html: renderShell({
      eyebrow: isPreorder ? "Pre-order confirmed" : "Order confirmed",
      heading: "Thank you.",
      bodyHtml,
    }),
  });
}

/**
 * Abandoned-checkout recovery. Sent at most once per expired Stripe session
 * (guarded by abandoned_checkouts.emailed_at in the webhook).
 */
export async function sendCartRecoveryEmail({ to, items = [], resumeUrl }) {
  if (!to || !resumeUrl) return null;

  const bodyHtml = `
    <p style="margin:0 0 14px;">Your pieces are still set aside — but not for long. Checkout picks up right where you left off.</p>

    ${renderItemsTable(items)}

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 8px;">
      <tr>
        <td style="background:#0A0A0A;">
          <a href="${escapeHtml(resumeUrl)}" style="display:inline-block;padding:14px 34px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#E8E4DE;text-decoration:none;">Return to your bag</a>
        </td>
      </tr>
    </table>

    <p style="margin:16px 0 0;font-size:12px;color:#9A9A9A;text-align:center;">
      If you've already completed your order, please disregard this email.
    </p>`;

  return requireResend().emails.send({
    from: from("orders"),
    to,
    reply_to: SUPPORT,
    subject: "Your bag is waiting",
    html: renderShell({
      eyebrow: "Saved for you",
      heading: "Still thinking it over?",
      bodyHtml,
    }),
  });
}

export async function sendConciergeRequestEmail({
  type,
  payload,
  to = SUPPORT,
}) {
  const safeType = String(type || "request").replace(/[^a-z0-9_-]/gi, "");

  // Extract optional reference uploads (base64) so we don't dump them into the HTML table.
  const rawUploads = Array.isArray(payload?.referenceUploads)
    ? payload.referenceUploads
    : [];

  const safeFilename = (name = "reference.jpg") => {
    const cleaned = String(name || "reference.jpg")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]+/gi, "")
      .replace(/-+/g, "-")
      .slice(0, 80);
    return cleaned && cleaned.includes(".") ? cleaned : `${cleaned || "reference"}.jpg`;
  };

  const normalizeBase64 = (content = "") => {
    const contentString = String(content || "").trim();
    if (!contentString) return "";
    const idx = contentString.indexOf("base64,");
    return idx >= 0 ? contentString.slice(idx + "base64,".length) : contentString;
  };

  const slugLabel = (labelString = "") =>
    String(labelString || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24);

  const attachments = [];
  const includedUploads = [];
  const includedLinks = [];
  let totalApproxBytes = 0;

  const SIGNED_LINK_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
  const DEFAULT_UPLOAD_BUCKET = process.env.SUPABASE_ATELIER_BUCKET || "atelier-uploads";

  for (const u of rawUploads.slice(0, 6)) {
    const labelRaw = String(u?.label || "").trim();
    const prefix = labelRaw ? slugLabel(labelRaw) : "";
    const baseName = u?.filename || `reference-${attachments.length + 1}.jpg`;
    const filename = safeFilename(prefix ? `${prefix}-${baseName}` : baseName);
    const content = normalizeBase64(u?.content);

    // 1) Legacy: base64 attachments
    if (content) {
      const approxBytes = Math.floor((content.length * 3) / 4);
      if (approxBytes > 6 * 1024 * 1024) continue; // skip any single file > ~6MB
      if (totalApproxBytes + approxBytes > 12 * 1024 * 1024) break; // cap total ~12MB

      totalApproxBytes += approxBytes;
      attachments.push({ filename, content, contentType: u?.contentType || "image/jpeg" });
      includedUploads.push({ label: labelRaw, filename });
      continue;
    }

    // 2) Secure uploads: Supabase Storage path (private bucket) → signed download link
    const path = String(u?.path || "").trim();
    if (!path) continue;

    const bucket = String(u?.bucket || DEFAULT_UPLOAD_BUCKET).trim() || DEFAULT_UPLOAD_BUCKET;
    try {
      const { data, error } = await supabaseServer.storage
        .from(bucket)
        .createSignedUrl(path, SIGNED_LINK_TTL_SECONDS);
      if (error || !data?.signedUrl) {
        includedLinks.push({ label: labelRaw, filename, url: null, path, bucket });
      } else {
        includedLinks.push({ label: labelRaw, filename, url: data.signedUrl, path, bucket });
      }
    } catch {
      includedLinks.push({ label: labelRaw, filename, url: null, path, bucket });
    }
  }

  // Flatten payload for readability
  const entries = Object.entries(payload || {})
    .filter(
      ([k, v]) =>
        k !== "website" &&
        k !== "referenceUploads" &&
        v != null &&
        String(v).trim() !== ""
    )
    .map(([k, v]) => [k, String(v)])
    .slice(0, 80);

  const rows = entries
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding: 8px 10px; border: 1px solid #eee; font-weight: 600; background: #fafafa;">${escapeHtml(k)}</td>
          <td style="padding: 8px 10px; border: 1px solid #eee;">${escapeHtml(v)}</td>
        </tr>
      `
    )
    .join("");

  const subjectMap = {
    client_services: "Client Services Inquiry",
    contact: "New Contact Message",
    newsletter: "New Newsletter Signup",
  };

  const subject = subjectMap[safeType] || "New Concierge Request";

  const uploadsHtml = (() => {
    const parts = [];

    if (includedUploads.length) {
      parts.push(`
        <div style="margin: 14px 0 0; color: #555;">
          <strong>Reference images attached:</strong>
          <ul style="margin: 8px 0 0; padding-left: 18px;">
            ${includedUploads
              .map(
                (i) =>
                  `<li>${i.label ? `<strong>${escapeHtml(i.label)}:</strong> ` : ""}${escapeHtml(i.filename)}</li>`
              )
              .join("")}
          </ul>
        </div>
      `);
    }

    if (includedLinks.length) {
      parts.push(`
        <div style="margin: 14px 0 0; color: #555;">
          <strong>Reference images (secure links):</strong>
          <ul style="margin: 8px 0 0; padding-left: 18px;">
            ${includedLinks
              .map((i) => {
                const label = i.label ? `<strong>${escapeHtml(i.label)}:</strong> ` : "";
                const text = `${label}${escapeHtml(i.filename)}`;
                if (i.url) {
                  return `<li><a href="${i.url}" target="_blank" rel="noopener noreferrer">${text}</a></li>`;
                }
                return `<li>${text} <span style="color:#999;">(unable to generate signed link; bucket=${escapeHtml(i.bucket)} path=${escapeHtml(i.path)})</span></li>`;
              })
              .join("")}
          </ul>
          <p style="margin: 8px 0 0; font-size: 12px; color: #777;">
            Links expire in ${Math.round(SIGNED_LINK_TTL_SECONDS / 86400)} days.
          </p>
        </div>
      `);
    }

    if (!parts.length) {
      return `<p style="margin: 14px 0 0; color: #555;"><strong>Reference images:</strong> none</p>`;
    }

    return parts.join("\n");
  })();

  return requireResend().emails.send({
    from: from("concierge"),
    to,
    reply_to: payload?.email || SUPPORT,
    subject,
    ...(attachments.length ? { attachments } : {}),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 720px; line-height: 1.45;">
        <p style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #666;">
          Style Eternal Concierge • ${safeType}
        </p>

        <h2 style="margin: 10px 0 6px; font-weight: 500;">${subject}</h2>
        <p style="color: #555; margin: 0 0 18px;">Submitted from the website form.</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${rows || ""}
        </table>

        ${uploadsHtml}

        <p style="margin-top: 18px; font-size: 12px; color: #666;">
          Reply to the client using the email above. If this looks like spam, check the hidden honeypot field.
        </p>
      </div>
    `,
  });
}

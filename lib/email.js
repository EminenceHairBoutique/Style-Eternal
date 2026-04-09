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

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  amount,
}) {
  return requireResend().emails.send({
    from: "Eminence Hair <orders@eminenceluxuryhair.com>",
    to,
    reply_to: "support@eminenceluxuryhair.com",
    subject: `Order ${orderNumber} confirmed`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Thank you for your order</h2>

        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>

        <p><strong>Total paid:</strong> $${(amount / 100).toFixed(2)}</p>

        <p>
          Your order is now being processed and will ship within
          <strong>2–3 business days</strong>.
        </p>

        <p>
          You’ll receive another email once your order ships.
        </p>

        <hr />

        <p style="font-size: 12px; color: #666;">
          Eminence Hair · Discreet luxury packaging · Premium quality guaranteed
        </p>
      </div>
    `,
  });
}

export async function sendConciergeRequestEmail({
  type,
  payload,
  to = "support@eminenceluxuryhair.com",
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
    // Always ensure a reasonable filename
    return cleaned && cleaned.includes(".") ? cleaned : `${cleaned || "reference"}.jpg`;
  };

  const normalizeBase64 = (content = "") => {
    const contentString = String(content || "").trim();
    if (!contentString) return "";
    // Accept either raw base64 or data URLs
    const idx = contentString.indexOf("base64,");
    return idx >= 0 ? contentString.slice(idx + "base64,".length) : contentString;
  };

  const escapeHtml = (htmlString = "") =>
    String(htmlString || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

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
      // Approximate decoded bytes from base64 length (3/4). This helps keep requests sane.
      const approxBytes = Math.floor((content.length * 3) / 4);
      if (approxBytes > 6 * 1024 * 1024) continue; // skip any single file > ~6MB
      if (totalApproxBytes + approxBytes > 12 * 1024 * 1024) break; // cap total ~12MB

      totalApproxBytes += approxBytes;
      attachments.push({ filename, content, contentType: u?.contentType || "image/jpeg" });
      includedUploads.push({ label: labelRaw, filename });
      continue;
    }

    // 2) Secure uploads: Supabase Storage path (private bucket) → signed download link in email
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
          <td style="padding: 8px 10px; border: 1px solid #eee; font-weight: 600; background: #fafafa;">${k}</td>
          <td style="padding: 8px 10px; border: 1px solid #eee;">${v.replace(
            /</g,
            "&lt;"
          ).replace(/>/g, "&gt;")}</td>
        </tr>
      `
    )
    .join("");

  const subjectMap = {
    custom_order: "New Custom Order Request",
    custom_atelier: "New Custom Atelier Request",
    private_consult: "New Private Consult Request",
    contact: "New Contact Message",
    newsletter: "New Newsletter Signup",
    ar_tryon_waitlist: "AR Try-On Beta Waitlist",
    partner_application: "New Partner Application",
    partner_quote: "Partner Wholesale Quote Request",
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
    from: "Eminence Hair <concierge@eminenceluxuryhair.com>",
    to,
    reply_to: payload?.email || "support@eminenceluxuryhair.com",
    subject,
    ...(attachments.length ? { attachments } : {}),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 720px; line-height: 1.45;">
        <p style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #666;">
          Eminence Concierge • ${safeType}
        </p>

        <h2 style="margin: 10px 0 6px; font-weight: 500;">${subject}</h2>
        <p style="color: #555; margin: 0 0 18px;">Submitted from the website form.</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${rows || ""}
        </table>

        ${attachmentLine}

        <p style="margin-top: 18px; font-size: 12px; color: #666;">
          Reply to the client using the email above. If this looks like spam, check the hidden honeypot field.
        </p>
      </div>
    `,
  });
}

/* eslint-env node */

import { sendConciergeRequestEmail } from "../lib/email.js";
import { checkRateLimit } from "./_utils/rateLimit.js";

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Rate limit: 3 requests per IP per minute.
  const allowed = await checkRateLimit(req, res, {
    endpoint: "client-services",
    max: 3,
    windowMs: 60_000,
  });
  if (!allowed) return;

  const data = await readJson(req);
  if (!data) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  // Honeypot
  if (data.website) {
    res.status(200).json({ ok: true });
    return;
  }

  // Validate required fields
  const fullName = String(data.fullName || "").trim();
  const email = String(data.email || "").trim();
  const subject = String(data.subject || "").trim();
  const message = String(data.message || "").trim();

  if (!fullName || !email || !subject || !message) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  // Sanitize optional fields
  const inquiryType = String(data.inquiryType || "general").trim();
  const orderNumber = String(data.orderNumber || "").trim();

  try {
    const inquiryLabelMap = {
      order: "Order Question",
      return: "Return or Exchange",
      product: "Product Question",
      sizing: "Sizing & Fit",
      shipping: "Shipping",
      consultation: "Product Consultation",
      collab: "Collaboration",
      press: "Press Inquiry",
      other: "Other",
    };

    const typeLabel = inquiryLabelMap[inquiryType] || "General";

    await sendConciergeRequestEmail({
      type: "client_services",
      payload: {
        name: fullName,
        fullName,
        email,
        inquiryType: typeLabel,
        orderNumber: orderNumber || "N/A",
        subject,
        message,
        source: "Client Services",
        timestamp: new Date().toISOString(),
      },
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("client-services error", err);
    res.status(500).json({ error: "Failed to send message" });
  }
}

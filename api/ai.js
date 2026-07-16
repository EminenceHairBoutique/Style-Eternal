/**
 * api/ai.js — single AI router for the Style Eternal commerce suite.
 *
 * Routes on a JSON `action` field so all AI features share ONE serverless
 * function (Vercel function-count budget). Actions:
 *   - stylist   : streaming brand-voice stylist chat (text/plain stream)
 *   - fitfinder : size recommendation from body + product fit notes (JSON)
 *   - describe  : admin-only on-brand product copy generation (JSON)
 *   - search    : semantic product match for natural queries (JSON)
 *
 * The Anthropic API key is read from ANTHROPIC_API_KEY and never sent to the
 * client. Every action is rate-limited. The catalog the model reasons over is
 * passed in by the client (trimmed) and cached as a prompt prefix.
 */
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "./_utils/rateLimit.js";
import { requireAdmin } from "./_utils/auth.js";

const MODEL = "claude-sonnet-4-6"; // sonnet-class, per spec

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const BRAND_VOICE = `You are the personal stylist for Style Eternal — a premium streetwear label born in Newark, NJ (North Ward). Brand ethos: "Love is eternal. Style is eternal." Heavyweight garments (280gsm tees, 400gsm hoodies), distressed-luxe, built to outlast trends.

Voice: confident, warm, street-rooted, never corporate or salesy. Short, punchy sentences. You know fit, fabric, and how pieces layer. Recommend specific pieces by name and link them as /products/<slug>. Suggest complete fits, not just single items. When a customer asks about sizing, give a clear answer and note the oversized/relaxed cut where relevant. Keep replies concise — a few sentences, not essays.`;

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

// Shared admin guard (profiles.is_admin). Sends 401/403 and returns false on failure.
async function isAdminRequest(req, res) {
  return Boolean(await requireAdmin(req, res));
}

// Compact a client-supplied catalog into a small, stable context string.
function catalogContext(products) {
  const list = Array.isArray(products) ? products.slice(0, 120) : [];
  if (!list.length) return "No catalog provided.";
  return list
    .map((p) => {
      const bits = [
        p.name,
        p.category ? `[${p.category}]` : "",
        p.collection ? `(${p.collection})` : "",
        p.price != null ? `$${p.price}` : "",
        p.fit ? `${p.fit} fit` : "",
        p.slug ? `slug:${p.slug}` : "",
      ].filter(Boolean);
      return `- ${bits.join(" ")}${p.description ? ` — ${String(p.description).slice(0, 120)}` : ""}`;
    })
    .join("\n");
}

/* ---------------- stylist: streaming chat ---------------- */
async function handleStylist(req, res, body) {
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (!messages.length) return json(res, 400, { error: "messages required" });

  const system = [
    { type: "text", text: BRAND_VOICE },
    {
      type: "text",
      text: `Current catalog (recommend only from these; link as /products/<slug>):\n${catalogContext(body.products)}`,
      cache_control: { type: "ephemeral" },
    },
  ];

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");

  try {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 700,
      system,
      messages: messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 2000),
      })),
    });
    stream.on("text", (delta) => res.write(delta));
    await stream.finalMessage();
    res.end();
  } catch (e) {
    // If we haven't streamed much, surface a readable error.
    try { res.write(`\n[Stylist is unavailable right now: ${e.message || "error"}]`); } catch { /* noop */ }
    res.end();
  }
}

/* ---------------- fitfinder: size recommendation ---------------- */
async function handleFitfinder(req, res, body) {
  const p = body.product || {};
  const a = body.answers || {};
  const userPrompt = `Recommend a size for this Style Eternal garment.

Garment: ${p.name || "(unknown)"}
Fit: ${p.fit || "regular"}
Fabric/weight: ${[p.fabric, p.weight].filter(Boolean).join(", ") || "n/a"}
Available sizes: ${(p.sizes || []).join(", ") || "S, M, L, XL, XXL"}

Customer:
- Height: ${a.height || "n/a"}
- Weight: ${a.weight || "n/a"}
- Preferred fit: ${a.fitPref || "regular"}
- Usually wears size ${a.knownSize || "?"} in ${a.knownBrand || "another brand"}

Pick ONE size from the available sizes and give a one-sentence reason. Account for the garment's cut (oversized runs large; relaxed is true-to-size).`;

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: "You are a fit expert for a heavyweight streetwear brand. Be confident and concise.",
      messages: [{ role: "user", content: userPrompt }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              size: { type: "string" },
              reasoning: { type: "string" },
            },
            required: ["size", "reasoning"],
          },
        },
      },
    });
    const text = msg.content.find((b) => b.type === "text")?.text || "{}";
    return json(res, 200, JSON.parse(text));
  } catch (e) {
    return json(res, 500, { error: e.message || "Fit finder failed" });
  }
}

/* ---------------- describe: admin product copy ---------------- */
async function handleDescribe(req, res, body) {
  if (!(await isAdminRequest(req, res))) return; // response already sent

  const prompt = `Write on-brand catalog copy for a Style Eternal product.

Name: ${body.name || "(unnamed)"}
Category: ${body.category || "apparel"}
Notes: ${body.notes || "none"}

Brand: premium Newark streetwear, heavyweight, distressed-luxe, "Love is eternal. Style is eternal." Confident, street-rooted, never corporate.`;

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              description: { type: "string" },
              materials: { type: "string" },
              seo: { type: "string" },
            },
            required: ["description", "materials", "seo"],
          },
        },
      },
    });
    const text = msg.content.find((b) => b.type === "text")?.text || "{}";
    return json(res, 200, JSON.parse(text));
  } catch (e) {
    return json(res, 500, { error: e.message || "Generation failed" });
  }
}

/* ---------------- search: semantic product match ---------------- */
async function handleSearch(req, res, body) {
  const query = String(body.query || "").trim();
  if (!query) return json(res, 400, { error: "query required" });

  const prompt = `A shopper searched: "${query}"

Catalog:
${catalogContext(body.products)}

Return the slugs of up to 6 products that best match the intent (color, vibe, garment type, price ceiling, occasion). Order best-first. Only use slugs that appear above.`;

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: "You match natural-language shopping queries to a product catalog. Return only relevant matches.",
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { slugs: { type: "array", items: { type: "string" } } },
            required: ["slugs"],
          },
        },
      },
    });
    const text = msg.content.find((b) => b.type === "text")?.text || "{}";
    const parsed = JSON.parse(text);
    return json(res, 200, { slugs: Array.isArray(parsed.slugs) ? parsed.slugs.slice(0, 6) : [] });
  } catch (e) {
    return json(res, 500, { error: e.message || "Search failed" });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!anthropic) return json(res, 503, { error: "AI is not configured (missing ANTHROPIC_API_KEY)." });

  // Rate limit: 20 AI calls per IP per minute.
  // failClosed: AI calls cost real money — if the limiter is down (beyond the
  // missing-table bootstrap grace), refuse rather than run unmetered.
  const allowed = await checkRateLimit(req, res, {
    endpoint: "ai",
    max: 20,
    windowMs: 60_000,
    failClosed: true,
  });
  if (!allowed) return;

  const body = await parseJsonBody(req);
  if (!body) return json(res, 400, { error: "Invalid JSON" });

  switch (String(body.action || "").toLowerCase()) {
    case "stylist": return handleStylist(req, res, body);
    case "fitfinder": return handleFitfinder(req, res, body);
    case "describe": return handleDescribe(req, res, body);
    case "search": return handleSearch(req, res, body);
    default: return json(res, 400, { error: "Unknown action" });
  }
}

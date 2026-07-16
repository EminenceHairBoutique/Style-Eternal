import dotenv from "dotenv";

// Load .env.local first, then .env (so .env.local wins)
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import express from "express";
import cors from "cors";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Generic file-based router that mirrors Vercel's `api/` mapping, so every
 * endpoint works locally — not just a hand-maintained subset.
 *
 *   api/create-checkout-session.js → /api/create-checkout-session
 *   api/admin/discounts.js         → /api/admin/discounts
 *
 * `_utils/` (and any _-prefixed path segment) is skipped, matching Vercel.
 * Handlers are lazy-imported on first hit so a broken/unconfigured endpoint
 * doesn't crash the whole dev server. The Stripe webhook gets a raw body for
 * signature verification; everything else gets JSON.
 */
const API_DIR = join(process.cwd(), "api");

function collectHandlers(dir) {
  const routes = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      routes.push(...collectHandlers(full));
    } else if (entry.endsWith(".js")) {
      const rel = relative(API_DIR, full).split(sep).join("/");
      routes.push({ route: `/api/${rel.replace(/\.js$/, "")}`, file: full });
    }
  }
  return routes;
}

const app = express();
app.use(cors());

for (const { route, file } of collectHandlers(API_DIR)) {
  const bodyParser =
    route === "/api/stripe-webhook"
      ? express.raw({ type: "application/json" })
      : express.json({ limit: "16mb" });

  app.all(route, bodyParser, async (req, res) => {
    try {
      const mod = await import(pathToFileURL(file).href);
      const handler = mod.default;
      if (typeof handler !== "function") {
        return res.status(500).json({ error: `No default export in ${file}` });
      }
      // Vercel-style req.query for GET handlers.
      req.query = { ...req.query };
      return await handler(req, res);
    } catch (err) {
      console.error(`Handler error ${route}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

app.listen(3000, () => {
  console.log("✅ Local API running on http://localhost:3000 (all api/ routes mounted)");
});

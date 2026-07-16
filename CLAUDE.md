# Style Eternal — Codebase Guide

Premium streetwear ecommerce (shopstyleeternal.com). Vite + React 19 SPA with
Vercel serverless functions. **JavaScript, not TypeScript.**

## Commands

```bash
npm run dev            # Vite (5173) + API server (3000, all api/ routes)
npm run build          # vite build + static SEO prerender (sitemap/robots)
npm run lint           # ESLint flat config — 0 errors required
npm run test:unit      # Vitest (tests/unit)
npm run test:e2e       # Playwright vs `vite preview` on :4173
npm run audit:products # catalog/image integrity (CI-failing)
npm run media:optimize # regenerate WebP variants + mediaManifest.json
```

CI (.github/workflows/ci.yml) runs all of the above on every push/PR.

## Architecture

- **Storefront**: `src/pages` + `src/components`, routes in `src/App.jsx`.
  Storefront routes render in an animated tree; `/admin` renders in its own
  un-animated tree (never remounts AdminLayout).
- **Admin SPA**: `src/admin/*` at `/admin`. Talks to Supabase directly with
  the anon client; authorization is RLS via `public.is_admin()`
  (`profiles.is_admin` = the ONLY admin model — no email allowlists).
- **API**: `api/**/*.js` — Vercel serverless (default-export handlers).
  `dev-server.js` mirrors the file-based routing locally. Shared helpers in
  `api/_utils` (auth, rate limiting) and `lib/` (server-side: checkout
  builders, email, supabaseServer service client — never import `lib/` from
  `src/`).
- **Catalog**: `src/data/products.js` is the rich content source; the
  Supabase `products` table overlays live price/compare-at/stock
  (admin-edited). `ProductsContext`/`useProductOverlay` merge them in the
  storefront; `api/create-checkout-session.js` does the same server-side, so
  the charged price always equals the displayed price.
- **Orders**: Stripe Checkout (hosted) → `api/stripe-webhook.js` persists
  `orders` + `order_items`, decrements stock, awards loyalty + referral
  bonuses, attributes promo codes, issues gift cards, settles store credit,
  emails confirmation. Money convention: `amount_total` (integer cents) is
  canonical; `total/subtotal/shipping/tax` (dollars) are maintained for
  compatibility. Fulfillment: `api/admin/orders.js` ships (tracking + email)
  and drives the returns lifecycle.
- **Gift cards / store credit**: gift-card catalog products (`giftCard: true`)
  → webhook issues codes → `redeem_gift_card()` RPC converts to
  `profiles.store_credit_cents` → checkout applies it as a one-off coupon for
  the bearer-verified user only.
- **Subscriptions (dormant)**: give a catalog product
  `subscription: { interval: "month" }` and checkout switches to Stripe
  subscription mode; renewals are recorded by `invoice.payment_succeeded`;
  customers manage billing via `api/billing-portal.js`. No product uses it
  yet — the plumbing is tested but inert.
- **Images**: originals in `public/assets/**` (JPG); `npm run media:optimize`
  emits WebP + 800/400 variants and `src/data/mediaManifest.json`. Render
  through `SmartImage` (manifest-driven `<picture>` + srcset). Product
  convention: `public/assets/products/<slug>/01.jpg`, `02.jpg`, …
- **Migrations**: `supabase/migrations/*` — idempotent, drift-tolerant
  (guarded ALTERs, DROP POLICY IF EXISTS + CREATE). They are applied by hand
  in the Supabase SQL editor (see RUNBOOK.md); never assume a fresh DB.

## Conventions

- Design tokens live in `src/index.css` (`@theme` + `:root`) — Tailwind v4
  via `@tailwindcss/vite`; there is no tailwind.config.js. Fonts are
  self-hosted via `@fontsource-variable` (`'Oswald Variable'`, etc.).
- Money formatting: `formatMoney` (dollars) / `formatMoneyCents` from
  `src/utils/format.js` — never hand-roll `$${...}`.
- Cart state math is pure in `src/utils/cartOps.js` (unit-tested);
  `CartContext` only owns persistence + the drawer flag. `removeFromCart(id,
  variant)` — variant null means ALL lines of the product, deliberately.
- Context values are memoized (`useMemo` + `useCallback` handlers);
  `ProductCard` is `React.memo`.
- Analytics (`src/utils/track.js`) and marketing pixels are consent-gated
  (`se_cookie_consent`); the capture governor
  (`src/utils/captureGovernor.js`) allows at most one marketing modal per
  session, never on cart/checkout/product routes.
- Graceful degradation is the house style: missing env vars, tables, or
  Stripe keys must never crash a page — features hide or fall back.
- Rate limiting: `checkRateLimit(req, res, { endpoint, max, windowMs,
  failClosed })` — use `failClosed: true` only where abuse costs real money
  (AI, SMS-like endpoints).

## Operational docs

- `RUNBOOK.md` — one-time SQL application, Stripe dashboard setup, env var
  delta, smoke tests.
- `.env.example` — every variable with browser/server annotations.
- `LAUNCH_CHECKLIST.md` — pre-launch pass.

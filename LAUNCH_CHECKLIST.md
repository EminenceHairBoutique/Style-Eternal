# Style Eternal — Launch Checklist (Vercel + Supabase + Stripe + SEO)

> **Start with `RUNBOOK.md`** — it covers the one-time Supabase SQL
> application, Stripe dashboard settings (webhook events, wallets), and the
> full environment-variable delta with a smoke-test script. This checklist is
> the pre-launch sweep that follows it.

## 1) Vercel deployment settings
- **Framework Preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 20+ (CI runs 22)

> The build runs a post-step that generates route-specific HTML for major
> pages + every product URL, `sitemap.xml`, and `robots.txt`.

## 2) Environment variables
The complete annotated list lives in **`.env.example`** — copy from there.
Highlights:

- **Checkout/orders:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `VITE_STRIPE_PUBLISHABLE_KEY`
- **Shipping:** `SHIPPING_STANDARD_CENTS`, `FREE_SHIPPING_THRESHOLD_CENTS`,
  `SHIPPING_COUNTRIES`, `VITE_FREE_SHIPPING_THRESHOLD`
- **Supabase:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`
- **Email:** `RESEND_API_KEY`, `EMAIL_FROM_DOMAIN` (verified in Resend)
- **AI:** `ANTHROPIC_API_KEY`
- **SEO:** `VITE_SITE_URL=https://www.shopstyleeternal.com`
- **Analytics (optional):** `VITE_GA_MEASUREMENT_ID`, `VITE_META_PIXEL_ID`,
  `VITE_TIKTOK_PIXEL_ID`
- **Errors (optional):** `VITE_SENTRY_DSN`
- **Removed (do NOT set):** `ADMIN_EMAILS`, `VITE_ADMIN_EMAILS`, `TWILIO_*`
  — admin access is `profiles.is_admin` only (see RUNBOOK §4)

## 3) Database
All tables ship as idempotent migrations in `supabase/migrations/` —
apply them per RUNBOOK §1. (The old inline SQL snippets in this file are
retired; `email_signups` is created by the reconciliation migration.)

## 4) Stripe dashboard
Per RUNBOOK §2: webhook events (`checkout.session.completed` +
`checkout.session.expired`), enable Apple Pay / Google Pay / Link, add the
Apple Pay domain. Discount codes created in the admin sync to Stripe
automatically on save.

## 5) Google indexing
1. Verify the property in **Google Search Console**.
2. Submit `https://www.shopstyleeternal.com/sitemap.xml`.
3. Request indexing for the homepage, Shop, Collections, and 3–5 products.

## 6) Social share previews
Test a product URL in the Facebook Sharing Debugger and the X Card
Validator — product pages ship route-specific server-delivered OG tags.

## 7) Conversion tracking (consent-gated)
- GA4 + Meta + TikTok page views (SPA)
- `view_item` (PDP), `add_to_cart` (PDP + quick add),
  `begin_checkout`, `purchase` (Success page)

## 8) Final smoke pass
- Place a test-mode order below and above the $150 threshold (RUNBOOK §5)
- Confirm the confirmation email renders with line items + address
- `/success` shows the real order number
- Admin → Orders shows the order with items and a working Stripe link
- Heart a product signed-out, sign in, confirm the wishlist merged

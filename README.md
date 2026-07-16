# Style Eternal

**Premium streetwear built on permanence, emotion, and legacy. Style that outlives trends.**

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4 (dark editorial luxury; tokens in `src/index.css`)
- **Fonts:** self-hosted variable fonts via `@fontsource-variable`
- **Animations:** Framer Motion (respects `prefers-reduced-motion`)
- **Backend:** Vercel serverless functions in `api/` (Express shim for local dev)
- **Database/Auth/Storage:** Supabase (idempotent migrations in `supabase/migrations/`)
- **Payments:** Stripe Checkout (wallets via automatic payment methods, shipping collection)
- **Email:** Resend (order confirmation, cart recovery, broadcasts)
- **AI:** Anthropic (stylist chat, fit finder, semantic search)
- **Errors:** Sentry (optional, `VITE_SENTRY_DSN`)

## Commands

```bash
npm run dev            # Vite dev server (5173) + API server (3000, all routes)
npm run build          # vite build + static SEO generation (sitemap, robots, route HTML)
npm run lint           # ESLint (0 errors enforced in CI)
npm run test:unit      # Vitest unit suite
npm run test:e2e       # Playwright (headless Chromium vs vite preview)
npm run audit:products # Validate product catalog + image/WebP integrity
npm run media:optimize # Generate WebP/srcset variants + media manifest
npm run preview        # Preview dist/ locally
```

## Product images

Place originals in `public/assets/products/<productSlug>/` as `01.jpg`,
`02.jpg`, … then run `npm run media:optimize` — it emits WebP + responsive
variants and updates `src/data/mediaManifest.json`. Components render them
through `SmartImage` (`<picture>` + srcset). Resolution logic:
`src/utils/productMedia.js`.

## Environment

Copy `.env.example` to `.env.local` and fill in keys — every variable is
documented there with browser/server annotations.

## Going to production

Read **`RUNBOOK.md`** first (one-time Supabase SQL, Stripe dashboard
settings, env delta, smoke tests), then sweep **`LAUNCH_CHECKLIST.md`**.
Architecture notes for contributors live in **`CLAUDE.md`**.

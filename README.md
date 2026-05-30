# Style Eternal

**Premium streetwear built on permanence, emotion, and legacy. Style that outlives trends.**

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Styling:** Utility-first (dark editorial luxury)
- **Animations:** Framer Motion
- **Backend:** Vercel serverless functions (Node.js / Express 5 local dev)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe Checkout
- **Email:** Resend

## Commands

```bash
npm run dev           # Vite dev server (5173) + API server (3000)
npm run dev:vite      # Vite only
npm run dev:api       # API only
npm run build         # vite build + static SEO generation
npm run lint          # ESLint
npm run preview       # Preview dist/ locally
npm run audit:products # Validate product catalog
npm run test:e2e      # Playwright (headless Chromium)
```

## Product Image Convention

Place images in `public/assets/products/<productSlug>/` as `01.webp`, `02.webp`, etc. Resolved via `src/utils/productMedia.js`.

## Environment

See `.env.example` for required variables. Key ones:

| Variable | Context |
| --- | --- |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Server only |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Browser |
| `RESEND_API_KEY` | Server only |
| `ADMIN_EMAILS` | Server only |

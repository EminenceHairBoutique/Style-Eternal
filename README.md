# Style Eternal

Premium streetwear e-commerce platform. Drop-based release model with limited collections.

## Tech Stack

- **Frontend:** React 19, React Router DOM v7, Vite
- **Styling:** Tailwind CSS v4 (utility-first)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Vercel serverless functions (`/api/`)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe Checkout
- **Email/SMS:** Resend (email), Twilio (SMS OTP)
- **Language:** JavaScript (ES Modules, no TypeScript)

## Quick Start

```bash
npm install           # Install dependencies
npm run dev           # Start Vite dev server (5173) + API server (3000)
npm run dev:vite      # Vite dev server only
npm run dev:api       # API server only
npm run build         # Production build (Vite + static SEO generation)
npm run lint          # ESLint check
npm run preview       # Preview production build locally
npm run audit:products # Validate product data integrity
npm run test:e2e      # Playwright end-to-end tests
```

Copy `.env.example` to `.env` and fill in the required values before running.

## Project Structure

```
src/
  App.jsx              # Route definitions (lazy-loaded)
  main.jsx             # Entry point
  pages/               # Route-level page components
  components/          # Reusable UI components
  context/             # React Context providers (Cart, User, Toast)
  hooks/               # Custom hooks
  utils/               # Pure helper functions
  lib/                 # Supabase clients, email templates
  data/products.js     # Product catalog (source of truth)
  assets/              # Images, videos, badges

api/                   # Vercel serverless functions
lib/                   # Server-only utilities
scripts/               # Build and dev scripts
tests/e2e/             # Playwright tests
public/assets/         # Static assets (product images, OG images)
```

## Collections

North Ward · Iron Bound · Love Never Dies · Essentials · Legacy · Graphics · Archive

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Browser Supabase client |
| `VITE_SUPABASE_ANON_KEY` | Browser Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Supabase client |
| `STRIPE_SECRET_KEY` | Stripe checkout |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Elements (browser) |
| `RESEND_API_KEY` | Email sending |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |

## Deployment

Deployed on **Vercel**. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.

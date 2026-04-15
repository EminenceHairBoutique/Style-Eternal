# Copilot Instructions for Style Eternal

## Project Overview

Style Eternal is a premium streetwear e-commerce SPA with a B2B partner portal and drop-based release model. The stack is React 19 + Vite + Tailwind CSS deployed on Vercel with Node.js/Express serverless API functions.

**Product categories:** Tees, hoodies, long sleeves, crewnecks, outerwear, bottoms, headwear, accessories.

**Collections:** North Ward, Iron Bound, Love Never Dies, Essentials, Legacy, Graphics, Archive.

**Pricing model:** Flat pricing per product (no variant matrices). Drop-based limited releases.

## Tech Stack

- **Frontend:** React 19, React Router DOM v7 (flat route config, all pages lazy-loaded)
- **Styling:** Tailwind CSS v4 (utility-first, no CSS modules)
- **Animations:** Framer Motion (`import { motion as Motion } from "framer-motion"` — capital-M alias required by ESLint)
- **Icons:** Lucide React
- **Backend:** Vercel serverless functions in `/api/` (Express 5 for local dev via `dev-server.js`)
- **Database:** Supabase (PostgreSQL) — browser client at `src/lib/supabaseClient.js`, server client at `lib/supabaseServer.js`
- **Payments:** Stripe (`/api/create-checkout-session.js` creates sessions; prices are always re-validated server-side)
- **Email/SMS:** Resend (email), Twilio (SMS OTP)
- **Language:** JavaScript (ES Modules, no TypeScript)

## Commands

```bash
npm run dev           # Start Vite dev server (port 5173) + local API server (port 3000)
npm run dev:vite      # Vite dev server only
npm run dev:api       # API server only
npm run build         # vite build + generate static SEO metadata (dist/)
npm run lint          # ESLint check (must pass before committing)
npm run preview       # Preview the dist/ build locally
npm run audit:products # Validate product data integrity
npm run test:e2e      # Playwright end-to-end tests (headless Chromium)
```

> The `npm run build` script also runs `node scripts/generate-static-seo.mjs` which requires the Vite build artifacts in `dist/` to already exist. Build with `node_modules/.bin/vite build` alone if you only need the frontend bundle.

## Directory Structure

```
src/
  App.jsx              # Lazy-loaded routes defined here
  main.jsx             # Entry point — BrowserRouter > UserProvider > CartProvider > App
  pages/               # Route-level components (PascalCase .jsx)
  components/          # Reusable UI (PascalCase .jsx); ui/ for headless primitives
  context/             # CartContext, UserContext, ToastContext (React Context, no Redux)
  hooks/               # Custom hooks (camelCase, use* prefix)
  utils/               # Pure helpers — pricing, filtering, formatting, tracking (camelCase .js)
  lib/                 # Supabase clients, email templates
  data/products.js     # Complete product catalog (source of truth for prices/descriptions)
  ui/motionPresets.js  # Shared Framer Motion variants (fadeUp, staggerContainer, etc.)
  assets/              # Images, videos, badges

api/                   # Vercel serverless functions (Node.js)
  _utils/              # Shared server helpers
  admin/               # Admin endpoints (protected by ADMIN_EMAILS env var server-side)
  partners/            # Partner application endpoint

lib/                   # Server-only utilities (supabaseServer.js)
scripts/               # Build/dev scripts (.mjs)
tests/e2e/             # Playwright tests
public/assets/         # Static assets served as-is (product images, OG images, favicon)
```

## Coding Conventions

### File Naming
- **Pages & Components:** PascalCase `.jsx` (e.g., `ProductDetail.jsx`, `CartDrawer.jsx`)
- **Utilities & hooks:** camelCase `.js` (e.g., `productFiltering.js`, `useRouteAnalytics.js`)
- **Context files:** PascalCase with `Context` suffix (e.g., `CartContext.jsx`)
- **Server functions:** camelCase `.js` (e.g., `create-checkout-session.js`)

### Component Structure
Always use functional components with hooks. Follow this import order:

```jsx
// 1. React + third-party libraries
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion"; // capital M required

// 2. Context / custom hooks
import { useCart } from "../context/CartContext";

// 3. Components (relative paths)
import SEO from "../components/SEO";

// 4. Utilities and data
import { formatPrice } from "../utils/format";

// 5. Assets
import heroImage from "../assets/hero.jpg";
```

### Framer Motion Alias — Important
Always import Framer Motion as `Motion` (capital M):
```jsx
import { motion as Motion } from "framer-motion";
```
This is required because ESLint's `no-unused-vars` rule is configured to ignore variables matching `/^[A-Z_]/`. Using lowercase `motion` would trigger a lint error if the variable appears unused in certain patterns.

### ESLint Rules
- `no-unused-vars`: variables matching `^[A-Z_]` are ignored; args/caught errors starting with `_` are ignored
- Client code (`src/`) uses browser globals; server code (`api/`, `lib/`) uses Node globals
- Context files (`src/context/`) have `react-refresh/only-export-components` disabled

### Page Structure
Every page must:
1. Include the `<SEO>` component as the first child (inside a fragment or wrapper):
   ```jsx
   import SEO from "../components/SEO";
   // ...
   return (
     <>
       <SEO title="Page Title" description="Brief description for search engines." />
       <PageTransition>
         {/* page content */}
       </PageTransition>
     </>
   );
   ```
2. Wrap content in `<PageTransition>` for consistent Framer Motion page transitions.

### Adding a New Route
1. Create the page component in `src/pages/YourPage.jsx`
2. Add a lazy import and `<Route>` entry in `src/App.jsx`
3. Add the path to the sitemap/SEO generation script if needed

## Design System

### Brand Colors (Tailwind tokens)
```
se-black:    #0A0A0A   (primary background)
se-charcoal: #1A1A1A   (cards, elevated surfaces)
se-graphite: #2A2A2A   (borders, subtle contrast)
se-steel:    #4A4A4A   (muted text, secondary)
se-ash:      #8A8A8A   (placeholder text)
se-silver:   #C0C0C0   (light text on dark)
se-bone:     #E8E4DE   (light backgrounds, contrast text)
gold:        #C4A35A   (primary brand accent)
```

### Typography
```
font-header:   Oswald, sans-serif         (headings, hero text)
font-body:     Inter, system-ui           (body copy, UI)
font-mono:     Space Grotesk, monospace   (accents, product codes)
```

Always use Tailwind utility classes. Do not add inline `style` objects except for dynamic values that cannot be expressed as utilities.

## State Management

State is managed with **React Context only** — no Redux, Zustand, or other external stores.

- **CartContext** — cart items, drawer open/close state, localStorage persistence (`se_cart` key)
- **UserContext** — authenticated user, profile from Supabase `profiles` table, account tier
- **ToastContext** — notification/toast system

## Routing & Route Protection

Routes are defined as a flat array in `src/App.jsx`. All pages are lazy-loaded via `React.lazy()`.

**Protected routes:**
- `<PartnerRoute>` — guards `/partner-portal`. Checks `user.accountTier` and `user.partnerStatus` from `UserContext`. Unapproved users are redirected to `/partners`; unauthenticated users to `/account`.
- `<AdminRoute>` — guards `/admin/*`. Primary enforcement is server-side (via `ADMIN_EMAILS` env var in API functions). The client-side guard should not be relied upon as a security boundary.

## API / Serverless Functions

All API endpoints live in `/api/` and are deployed as Vercel serverless functions.

- Always re-validate prices server-side in checkout flows — never trust client-submitted prices
- Use `lib/supabaseServer.js` (service-role client) for privileged DB operations; never expose the service-role key to the browser
- Return errors as `{ error: "message" }` JSON with an appropriate HTTP status code
- Rate limiting is enforced via the `rate_limits` Supabase table

## Product Catalog

`src/data/products.js` is the single source of truth for all product data (prices, descriptions, collections, images).

- Flat pricing model — each product has a single price (no variant matrices)
- Price re-validation in `api/create-checkout-session.js` verifies prices server-side
- Products are organized into collections and categories (tees, hoodies, outerwear, bottoms, headwear, accessories)

### Product Image Convention
Images can be declared explicitly per product (`images: []`) or follow the folder convention:
```
public/assets/products/<productSlug>/01.webp, 02.webp, ...
```
Use `src/utils/productMedia.js` (`resolveProductImages`) to resolve images — do not hardcode paths.

## Security Notes

- **Never** commit `.env` files or secrets. Use `.env.example` as a template.
- The Supabase **anon key** (browser client) is safe to expose; the **service-role key** must stay server-side only.
- Stripe prices are always re-validated server-side in `api/create-checkout-session.js`.
- Partner portal access is gated by `<PartnerRoute>` (client) + JWT validation (server).
- Admin routes rely on server-side `ADMIN_EMAILS` env var for authorization.
- CSP headers and cache-control rules are configured in `vercel.json` — do not weaken them without review.

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Used in |
| --- | --- |
| `VITE_SUPABASE_URL` | Browser Supabase client |
| `VITE_SUPABASE_ANON_KEY` | Browser Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Supabase client (never expose to browser) |
| `STRIPE_SECRET_KEY` | Stripe checkout + webhook |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Elements (browser) |
| `RESEND_API_KEY` | Email sending |
| `TWILIO_*` | SMS OTP |
| `ADMIN_EMAILS` | Comma-separated list of admin email addresses |

## Testing

End-to-end tests use **Playwright** (`tests/e2e/`). Run with `npm run test:e2e`. Tests run against the built `dist/` folder in headless Chromium.

There are no unit tests. When adding tests, use Playwright and follow patterns in `tests/e2e/`.

# Style Eternal — Production Runbook

This runbook covers everything that must happen **outside this repository** to
activate the platform upgrade: Supabase SQL, Stripe dashboard settings, and
Vercel environment variables. Work top to bottom. Total time: ~20 minutes.

> **Order matters:** apply the SQL (step 1) **before** deploying the updated
> code. The new Stripe webhook writes columns these migrations create. If code
> deploys first, Stripe retries failed webhooks automatically for days, so
> nothing is lost — but orders will not appear until the SQL is applied.

---

## 1. Supabase — apply migrations

Open **Supabase Studio → SQL Editor** and run these four files from
`supabase/migrations/`, in order:

1. `20260716100000_orders_reconciliation.sql`
2. `20260716110000_rls_is_admin_policies.sql`
3. `20260716120000_rate_limit_rpc.sql`
4. `20260716130000_wishlists_reviews_recovery.sql`

All four are idempotent — re-running them is safe. They are written to
converge **any** starting state (fresh database, migration-built, or the
hand-patched production database) onto one canonical schema.

### 1a. Pre-check (only if migration 1 errors on a unique index)

If `orders_stripe_session_uidx` or `orders_order_number_uidx` fails to create,
you have duplicate rows. Find them:

```sql
SELECT stripe_session_id, COUNT(*) FROM public.orders
WHERE stripe_session_id IS NOT NULL
GROUP BY 1 HAVING COUNT(*) > 1;

SELECT order_number, COUNT(*) FROM public.orders
WHERE order_number IS NOT NULL
GROUP BY 1 HAVING COUNT(*) > 1;
```

Delete/merge the duplicates (keep the earliest `created_at`), then re-run the
migration.

### 1b. Post-checks

```sql
-- Orders now has both column families:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'orders' AND column_name IN
  ('order_number','stripe_session_id','amount_total','email','shipping_address','total');
-- expect 6 rows

-- No admin policy uses the recursive inline subquery anymore:
SELECT policyname, tablename FROM pg_policies
WHERE schemaname = 'public' AND qual LIKE '%FROM profiles%';
-- expect 0 rows (all admin policies now call is_admin())

-- Anonymous discount enumeration is closed:
SELECT policyname FROM pg_policies WHERE tablename = 'discount_codes';
-- expect only discount_codes_admin_all

-- RPCs exist:
SELECT proname FROM pg_proc WHERE proname IN
  ('next_order_number','decrement_stock','increment_discount_usage','rate_limit_hit');
-- expect 4 rows
```

---

## 2. Stripe dashboard

1. **Webhook events** — Developers → Webhooks → your endpoint
   (`https://<domain>/api/stripe-webhook`): ensure these events are enabled:
   - `checkout.session.completed` (existing)
   - `checkout.session.expired` ← **add this** (powers abandoned-cart recovery)
2. **Payment methods** — Settings → Payment methods: enable **Apple Pay**,
   **Google Pay**, and **Link**. The code now uses automatic payment methods;
   wallets appear at checkout once enabled here (falls back to card if not).
3. **Apple Pay domain** — Settings → Payment methods → Apple Pay → add
   `www.shopstyleeternal.com` (required for Apple Pay on the web).

---

## 3. Vercel environment variables

### Add (server)

| Variable | Value | Purpose |
| --- | --- | --- |
| `SHIPPING_STANDARD_CENTS` | `1000` | Standard shipping ($10) below the free threshold |
| `FREE_SHIPPING_THRESHOLD_CENTS` | `15000` | Free shipping at/above $150 subtotal |
| `SHIPPING_COUNTRIES` | `US` | Comma-separated allowed shipping countries |
| `EMAIL_FROM_DOMAIN` | `shopstyleeternal.com` | From-domain for all transactional email (must be verified in Resend) |

### Add (client, optional — features no-op when unset)

| Variable | Purpose |
| --- | --- |
| `VITE_FREE_SHIPPING_THRESHOLD` | Dollars, default `150`; drives the cart progress meter |
| `VITE_SENTRY_DSN` | Enables Sentry error reporting |
| `VITE_TIKTOK_PIXEL_ID` | Enables TikTok pixel (consent-gated) |

### Remove

| Variable | Why |
| --- | --- |
| `ADMIN_EMAILS` | Retired. Admin access is now solely `profiles.is_admin` (set per user in Supabase). |
| `VITE_ADMIN_EMAILS` | Same — and as a `VITE_` var it would have shipped the allowlist to browsers. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_VERIFY_SERVICE_SID` | SMS endpoints removed (they had no frontend callers). |

### Verify still set

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`,
`RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `VITE_GA_MEASUREMENT_ID`,
`VITE_META_PIXEL_ID`, `VITE_SITE_URL`.

> **Resend:** confirm the sending domain matches `EMAIL_FROM_DOMAIN`
> (`shopstyleeternal.com`) with valid SPF/DKIM. The old hardcoded from-domain
> was `styleeternal.com`; if that is the verified one, set
> `EMAIL_FROM_DOMAIN=styleeternal.com` instead.

---

## 4. Granting admin access

```sql
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'you@example.com';
```

(The user must have signed up first so the profile row exists.)

---

## 5. Smoke test (Stripe test mode)

1. Deploy, then place a test order (card `4242 4242 4242 4242`) with a
   shipping address, below $150 subtotal (expect $10 standard shipping) and a
   second one above $150 (expect free shipping).
2. Verify in Supabase:
   ```sql
   SELECT order_number, status, amount_total, shipping_address->>'name',
          (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items
   FROM orders o ORDER BY created_at DESC LIMIT 2;
   ```
   Expect: `SE-1000xx` numbers, `status = 'paid'`, non-null address, items ≥ 1.
3. Verify the product's `stock` decremented in the `products` table.
4. Verify the confirmation email arrived with line items + address.
5. `/success` page shows the real order number.
6. Start a checkout, abandon it, wait ~24h (Stripe expires sessions) or expire
   it via the Stripe CLI: expect a row in `abandoned_checkouts` and one
   recovery email.
7. Admin → Orders shows the order with items and a working Stripe link.

## 6. Hero video (one-time, optional but recommended)

`public/assets/video/brand-promo-ss26.mp4` is 9.6MB. The site now paints a
lightweight poster instantly and defers the film until the browser is idle,
so it no longer blocks first paint — but the file itself is still heavy for
mobile data. When convenient, compress it on any machine with ffmpeg and
replace the file (same name, no code change needed):

```bash
ffmpeg -i brand-promo-ss26.mp4 -vf "scale=-2:720" -c:v libx264 -crf 28 \
  -movflags +faststart -an brand-promo-720.mp4
mv brand-promo-720.mp4 public/assets/video/brand-promo-ss26.mp4
```

Target: ≤3MB. `-movflags +faststart` makes it stream progressively.
(This environment's ffmpeg build cannot decode H.264, so it could not be done
automatically.)

## 7. Local development

```bash
npm ci
cp .env.example .env.local   # fill in keys
npm run dev                  # Vite :5173 + API :3000 (all endpoints now served locally)
# Webhook testing:
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

# Production Readiness — Low Religion

Status of the storefront after the production-hardening pass, plus the
remaining steps that require dashboard access (Vercel, Supabase, Razorpay).

Canonical domain: **https://lowreligion.com** (apex 308 → `www`, both serve).

---

## 1. Deploy

1. Push the branch and let Vercel build. The build must pass `next build`
   with `typescript.ignoreBuildErrors: false`.
2. Set the following environment variables in **Vercel → Settings → Environment
   Variables** for Production (and Preview where useful). See `.env.example`.

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `DATABASE_URL` | yes | Supabase pooled connection string |
   | `NEXT_PUBLIC_SUPABASE_URL` | yes | |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | yes | live key id |
   | `RAZORPAY_KEY_SECRET` | yes | **server-only** |
   | `RAZORPAY_WEBHOOK_SECRET` | yes | new — webhook returns 503 until set |
   | `NEXT_PUBLIC_SITE_URL` | yes | `https://lowreligion.com` |
   | `NEXT_PUBLIC_SELLABLE_CATEGORIES` | optional | defaults to `Accessories`; all other categories are coming-soon |
   | `NEXT_PUBLIC_COMING_SOON_LABEL` | optional | defaults to `DROPPING SOON` |
   | `NEXT_PUBLIC_COMING_SOON_PRICE_LABEL` | optional | defaults to `Price revealed at drop` |
   | `NEXT_PUBLIC_GA_ID` | optional | defaults to `G-L9NZEQMD9F` |
   | `GOOGLE_SITE_VERIFICATION` | optional | blank = no verification meta tag |

3. Redeploy after adding/changing env vars (they are read at build + runtime).

### Coming-soon merchandising

Only categories listed in `NEXT_PUBLIC_SELLABLE_CATEGORIES` can be bought. Every
other product is displayed with a subtle blur, no price, and the badge from
`NEXT_PUBLIC_COMING_SOON_LABEL`; checkout rejects those items server-side. When
the clothing drop goes live, add its category to the comma-separated list and
redeploy. Because these are `NEXT_PUBLIC_*`, a fresh build is required.

---

## 2. Razorpay webhook (required for order integrity)

Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**

- **URL:** `https://www.lowreligion.com/api/webhooks/razorpay`
- **Secret:** the same value as `RAZORPAY_WEBHOOK_SECRET`
- **Active events:** `payment.captured`, `payment.failed`, `order.paid`

Why: the client confirmation (`PUT /api/checkout/razorpay`) records the paid
order when the browser returns. The webhook records it even if the shopper
closes the tab, loses signal, or the redirect fails. Both paths call the same
idempotent `markOrderPaid()`, so duplicate notifications are harmless.

---

## 3. Rotate exposed credentials (owner action)

The `.env.local` credentials were committed to the public GitHub history in
commit `3da4d4b`. They must be treated as compromised:

1. **Supabase** → rotate the database password and the `anon`/`service_role`
   keys (Project Settings → API → Reset). Update Vercel + local `.env.local`.
2. **Razorpay** → regenerate the API key secret, then update Vercel + the
   webhook secret.
3. Confirm `.env.local` remains gitignored (it is). Never commit it again.
4. Optionally purge the secret-bearing commit history (e.g. `git filter-repo`)
   and force-push; rotation is mandatory regardless.

---

## 4. Admin access

Admin pages and server actions are gated by `requireAdmin()` (session + `profiles.role = 'admin'`).
The marketing export API returns 403 for non-admins.

Grant the owner account the admin role once:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Verify: `/admin` returns 307 → `/login` when signed out, home when signed in
without the role, and renders only for the admin account.

---

## 5. Database migration

`supabase/migrations/0004_round_ultimo.sql` and
`supabase/migrations/0005_lucky_hulk.sql` are additive and idempotent.

0004 creates:

- `sessions` — one row per browser session (`lowrel_session_id` cookie) with
  landing/exit path, referrer, geo, page-view and event counts.
- `newsletter_subscribers` — unique email, source (`popup`, `footer`,
  `newsletter_section`).
- `contact_messages` — support form inbox.
- Lookup indexes on `user_events.visitor_id` and `orders.razorpay_order_id`.

0005 creates `homepage_sections`, the ordered section list behind
`/admin/homepage`.

They have already been applied to the production database. For a fresh
environment run them before deploying the app:

```bash
# psql "$DATABASE_URL" -f supabase/migrations/0004_round_ultimo.sql
# psql "$DATABASE_URL" -f supabase/migrations/0005_lucky_hulk.sql
```

---

## 6. Homepage builder

`/admin/homepage` controls the live homepage without code. The layout is an
ordered list of sections stored in `homepage_sections`; each section has a
type, a title, a visibility flag and a whitelisted JSON config:

| Section | Controls |
| --- | --- |
| Hero | video/image URLs, height, headline, subheadline, CTA |
| Category Grid | 2–4 columns, tiles (label/link/image), fallback image category |
| Product Grid | source (category / all / new / sale / manual products), limit, 2–5 columns, view-all link |
| Product Carousel | source, limit, cards per view, view-all link |
| Shop The Look Strip | source, limit, heading, view-all link |

Only known section types are rendered, and every server action re-checks
`requireAdmin()` and sanitizes the config. Saving replaces the full ordered
layout in one transaction and revalidates `/`. If the table is missing or
empty, the storefront falls back to the original built-in layout.

---

## 7. Data capture — what is now recorded

| Signal | Before | Now |
| --- | --- | --- |
| `user_events.visitor_id` | always null | linked from the `visitor_id` cookie |
| Session journeys | none | `sessions` row upserted per event |
| Profiles | only 2 of 8 auth users | `ensureProfile()` on login, OAuth callback, tracking |
| Reviews | 0 rows (FK failed) | profile row now exists before insert |
| Newsletter | fake success | persisted to `newsletter_subscribers` |
| Contact form | no backend | persisted to `contact_messages` |
| `wishlist_add` | never fired | fires on new wishlist items |
| Pending/paid orders | client-recorded only | pending row at order creation + webhook backstop |
| Checkout amount | trusted client value | recomputed from DB, signed Razorpay order |

Geo comes from Vercel headers (`x-vercel-ip-country/region/city`), IP from
`x-forwarded-for`.

### Analytics consent

The site currently captures analytics without hard consent gating; the cookie
banner stores the user's choice (`cookie_consent`) and `visitors.meta.consent_status`
is persisted for audit. If you later need strict gating, wire
`applyConsent()` to `gtag('consent', 'update', …)` and skip `track()` when
analytics consent is denied. This is a policy decision, not a code gap.

---

## 8. Historical orders to reconcile (manual)

There are ~8 Razorpay purchases tied to customers whose `profiles`/`customers`
row shows `orders_count = 0`. Those payments predate the webhook, so they were
never written to `orders` and cannot be reconstructed automatically.

1. Export payments from the Razorpay Dashboard for the affected period.
2. Insert the missing rows (or update LTV) manually. Template:

```sql
-- Inspect mismatches
select c.id, c.email, c.orders_count, count(o.*) filter (where o.status = 'paid') as paid_orders,
       coalesce(sum(o.total_amount) filter (where o.status = 'paid'), 0) as paid_total
from customers c
left join orders o on o.customer_id = c.id
group by c.id
having count(o.*) filter (where o.status = 'paid') > 0 and c.orders_count = 0;

-- Recompute LTV from recorded paid orders
update customers c
set orders_count = s.paid_orders,
    total_spend  = s.paid_total
from (
  select customer_id, count(*) as paid_orders, coalesce(sum(total_amount), 0) as paid_total
  from orders where status = 'paid' group by customer_id
) s
where c.id = s.customer_id;
```

Going forward the webhook + pending-order row eliminates this class of loss.

---

## 9. Security

- Security headers are set in `next.config.ts`: `nosniff`, `SAMEORIGIN`,
  `strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`,
  COOP, and HSTS in production. `X-Powered-By` is disabled.
- Payment amounts are recomputed server-side; Razorpay signature is verified
  with `timingSafeEqual`; webhook HMAC is verified before processing.
- Admin surface is gated at layout, server-action and route-handler level.
- **Not yet done:** a Content-Security-Policy. Add it in report-only mode
  first because Razorpay Checkout and GA4 inject third-party scripts:

  ```
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://www.googletagmanager.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://www.google-analytics.com; img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com
  ```

  Once reports are clean, switch it to `Content-Security-Policy`.

---

## 10. SEO

- `robots.ts` → `/robots.txt`, sitemap reference, private routes disallowed.
- `sitemap.ts` → `/sitemap.xml`, static routes + every product, generated at
  request time with a graceful fallback if the DB is unavailable.
- Root metadata: `metadataBase`, OG/Twitter cards, robots directives.
- Product pages: per-product canonical, OG image and Twitter card.
- Placeholder Google verification token removed; set `GOOGLE_SITE_VERIFICATION`
  to enable it.

Submit `https://lowreligion.com/sitemap.xml` in Google Search Console after
the deploy that includes `sitemap.ts`.

---

## 11. Post-deploy smoke test

1. `GET /` — renders, no console errors.
2. `GET /collections/all` and a product page — images load, add to cart works.
3. `GET /sitemap.xml` — 200, contains product URLs; `GET /robots.txt` — 200.
4. `GET /this-does-not-exist` — branded 404 with header/footer.
5. Checkout: create an order, pay in Razorpay test mode, confirm the success
   page, then verify `orders.status = 'paid'` and `customers.orders_count`
   incremented exactly once (also re-send the webhook to confirm idempotency).
6. `POST /api/track` fires on page views; `sessions` and `user_events.visitor_id`
   are populated.
7. Newsletter popup/footer and contact form persist rows.
8. `/admin` is inaccessible without the admin role.

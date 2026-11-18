# Low Religion

Storefront for **lowreligion.com** — Next.js 16 (App Router), Supabase (Auth +
Postgres), Drizzle ORM, Razorpay payments and Tailwind CSS v4.

## Requirements

- Node.js 20+
- A Supabase project and Razorpay account

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in real values
```

Apply database migrations (or run the SQL files in `supabase/migrations` in
order against a fresh database):

```bash
npm run db:migrate
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a Drizzle migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Seed local product images |
| `npm run db:studio` | Open Drizzle Studio |

## Structure

- `src/app` — routes (storefront, `/admin`, `/api`)
- `src/components` — UI, sections, cart/checkout widgets
- `src/lib` — server actions, data access, payments, analytics, auth
- `src/db` — Drizzle schema and client
- `src/proxy.ts` — request proxy: Supabase session refresh, region + visitor id
- `supabase/migrations` — SQL migrations

## Payments

Checkout recomputes every amount from the database, creates a `pending` order
before opening Razorpay, verifies the payment signature, and marks the order
paid idempotently. The Razorpay webhook
(`/api/webhooks/razorpay`) is the server-side backstop.

Required env vars: `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`.

## Admin

`/admin` requires a Supabase session whose `profiles.role` is `admin`:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Before going live

See [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md) for the deploy
checklist, webhook configuration, credential rotation and post-deploy smoke
tests.

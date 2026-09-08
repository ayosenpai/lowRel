# Low Religion — Project Findings & State

Analysis date: 2026-08-09

## Overview

**Low Religion** is a streetwear e-commerce store built on:

- **Next.js 16** (App Router, Turbopack) + **React 19** + **Tailwind v4**
- **Supabase Postgres** accessed directly via **Drizzle ORM** + `postgres` driver (`src/db/index.ts`)
- **Supabase Auth** (`@supabase/ssr`) — email/password + Google OAuth
- **Razorpay** payments (India / INR) with HMAC signature verification
- **Supabase Storage** for product imagery (custom `SupabaseImage` bypasses Next image optimization)
- **GA4** + custom `user_events` analytics + a parallel `visitors` table

Routes: home, products, collections, checkout (3-step), account, admin (dashboard / analytics / products / customers / settings), help center, wishlist, login / register.

---

## Critical Issues

### 1. Committed secrets
- `.env.local` (DB password, Supabase keys, Razorpay keys) is **tracked in git** and omitted from `.gitignore`.
- **Action taken**: added `.env.local` to `.gitignore` and `git rm --cached .env.local`.
- **Still required**: rotate the DB / Supabase / Razorpay credentials in their dashboards — they are exposed in git history.

### 2. Corrupted component
- `src/components/ui/sidebar.tsx` had every `"sidebar"` string stripped by a bad uncommitted edit, producing invalid syntax (broken `export { , Content, ... }`, mangled data-slot attributes).
- Unimported (dead code), but a build hazard. **Action taken**: restored from `git HEAD`.

### 3. Broken `/cart` links
- The standalone `/cart` page was deleted, but inbound links remain:
  - `src/app/checkout/page.tsx` header bag icon
  - `src/app/checkout/payment/page.tsx` header bag icon
  - `src/components/sections/header.tsx` bag item `href: "/cart"` (unused; Bag renders a button)
  - `src/components/ui/back-button.tsx` smart-fallback logic referencing `/cart`
- **Action taken**: routed these to the cart sidebar / removed.

### 4. Type errors masked
- `next.config.ts` sets `typescript.ignoreBuildErrors: true`, masking ~15 real errors (plus ~110 in the now-deleted `temp_nextadmin/` template).
- **Action taken**: fixed real errors and re-enabled type checking.

### 5. Collections bugs
- `src/components/sections/category-grid.tsx` links to `/collections/tops`, but the slug mapper only recognizes `tops-tees` → `/collections/tops` silently renders **all** products.
- `new-in` / `sale` collections compute `isNew` / `isSale` but never pass them to `getProducts`, so those pages return everything.
- **Action taken**: added `tops` alias, extended `getProducts` with `isNew` / `isSale` filters, wired pagination.

### 6. Currency / unit bugs
- `src/app/checkout/payment/page.tsx` had a dead ternary forcing **INR for everyone**: `symbol === '₹' ? 'INR' : 'INR'`.
- `createOrderRecord` (`src/lib/actions/crm.ts`) stores Razorpay **paise** into fields documented as **cents**; `orderItems.price` also in paise but inconsistent with `totalAmount`.
- **Action taken**: currency derived from cart; amount stored consistently in smallest unit.

### 7. Coupon bugs
- Header announced `MATTERBABY`; checkout only accepted `FAMILY15`. **Standardized on `MATTERBABY`** (checkout-context + success-page gift code).
- `applyDiscount('')` did **not** clear the discount, so the payment page's "remove" was a no-op. **Fixed**.
- The discount-code input on the checkout info step was dead UI (no state/handler). **Wired to the shared context.**

### 8. Admin not protected
- `src/app/admin/layout.tsx` only fetches the Supabase user client-side for display. There is **no server-side role check** (`profiles.role` exists but is unused); any logged-in user can open `/admin`.

### 9. Two disconnected analytics systems
- `visitors` table is populated (middleware + `/api/track`) but never surfaced in admin.
- `user_events` is read by admin, but `user_events.visitor_id` is never populated.

### 10. Seeder wipes production
- `npm run db:seed` (`src/db/seed-local-images.ts`) **deletes all products** and inserts rows with **random prices**. Do not run against production.

---

## Uncommitted Work in Progress (at time of analysis)

Cart→sidebar refactor: `/cart` and `/order-success` pages deleted; cart is now localStorage-persisted in `CartSidebar`; checkout form extended (company / apartment / state, country default → India); globals.css + section banners updated.

---

## Performance & Mobile Findings

- **Fonts**: `Archivo` was loaded via a render-blocking `@import url(...)` in `globals.css`; `CatamaranOmnisend` loaded from a remote `@font-face`. **Action**: moved Archivo to `next/font/google` (self-hosted, `display: swap`), removed blocking imports.
- **Preconnect**: only the secondary Supabase host (`slelguoygbfzlpylpxfs`) was preconnected; the primary product-image host (`ojmqttdrbundpodfusoe`) was not. **Action**: added preconnect + dns-prefetch.
- **Images**: `SupabaseImage` now passes `decoding="async"` and `fetchPriority`.
- **MovingCarousel** (`new-arrivals-banner.tsx`) ran an rAF loop continuously even off-screen. **Action**: pauses via IntersectionObserver and respects `prefers-reduced-motion`.
- **Header** scroll hide/show updated React state on every scroll event. **Action**: de-janked with rAF/throttling + `will-change`.
- **`ErrorReporter`** dev harness (iframe/postMessage) is now dev-only.
- **`images.unoptimized: true`** is deliberate (previously caused 400 errors); the `formats`/`deviceSizes`/`imageSizes` config is effectively inert as a result.

---

## Consistency Issues

- Payment / success pages used a rounded, gray "Shopify-style" UI (`rounded-[14px]`, `rounded-full`, gray borders) inconsistent with the sharp black + `#d8a4bc` brand style. **Action**: restyled to brand.
- `product-showcase` ProductCard hid name/price until hover and fell back to static `data.ts` products lacking `price`/`symbol` → rendered `Rs. undefined`. **Action**: standardized product cards (name + price always visible) and removed the fallback.
- `Product` interface duplicated in `src/lib/types.ts` and `src/lib/data.ts`.
- Sale accent color mixed between `#ff69b4` (hot pink) and `#d8a4bc` (brand pink).

---

## Session Update (2026-08-09, continuation)

### Consistency pass — sharp brand style everywhere
- Converted **every** rounded surface in the storefront to sharp (`rounded-none`): checkout (36 instances), payment (18), success (17), wishlist (4), account avatar (2), header cart-count badge, product-detail heart button + bullet dots, product `loading.tsx` skeletons, help-pagination cards, reviews avatars (`ui/avatar.tsx`), search-overlay close button.
- Kept circular only where functionally required (spinners / rotating rings → `rounded-[9999px]`): payment Pay-Now spinner, success "securing order" ring, wishlist + product-detail loading spinners.
- Header borders on checkout/payment now `border-black` (was `#e5e5e5`).
- Admin dashboard + shadcn `ui/*` primitives left untouched (deliberate separate rounded design system).
- Wishlist "Select Options" button: replaced `window.location.href` reload with `useRouter().push` (snappier).

### Motion / accessibility
- `globals.css`: added global `@media (prefers-reduced-motion: reduce)` that auto-collapses animations/transitions for all users who request it (alongside the existing `.reduce-motion` class).

### Verification (this session)
- `tsc --noEmit` — passes.
- `eslint src` — passes (1 accepted dev-only warning in `ErrorReporter.tsx:71`).
- `next build` **not** re-run while dev server active (build + dev share `.next`); run after stopping dev to confirm. Dev-server hot reload is the live smoke test.

---

## Dead / Incomplete Features (not fixed, noted for later)

- `/track-order` was an empty dir (removed). Footer "Track My Order" routes to `/account`.
- Admin Settings page and help/contact form are presentational (no backend).
- Account orders / wishlist tabs are placeholders; wishlist is localStorage-only (not per-user).
- No `sitemap.ts` / `robots.ts`; GA verification code is a placeholder.
- No Razorpay webhook (`payment.captured` verification); only client-side signature check.
- Unused heavy deps in `package.json` (`three`, `@react-three/*`, `stripe`, `@tsparticles/*`, `@libsql/client`, `better-auth`, etc.).

---

## Verified Commands

- `tsc --noEmit` — passes after fixes.
- `eslint src` — passes after fixes.
- `next build` — passes after fixes.
- Dev smoke test: home → product → cart → checkout.

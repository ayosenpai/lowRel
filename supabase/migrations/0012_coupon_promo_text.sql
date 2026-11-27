-- 0012: Add editable promo/banner text for coupons.
-- Additive only. Do not execute on production without explicit approval.

ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "promo_text" text;

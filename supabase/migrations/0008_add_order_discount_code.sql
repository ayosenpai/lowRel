-- 0008: Track applied discount code on orders for coupon usage limits.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_code" text;

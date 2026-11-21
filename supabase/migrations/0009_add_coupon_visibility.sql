-- 0009: Public/private visibility for coupons.
-- Public coupons can be promoted/displayed; private coupons are usable only when the code is entered.
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT true NOT NULL;

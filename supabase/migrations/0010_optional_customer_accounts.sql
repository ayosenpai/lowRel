-- 0010: Optional customer accounts, secure order claiming, and manual tracking.
-- Additive only. Do not execute on production without explicit approval.

ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "username" text;

CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_lower_idx"
  ON "profiles" (lower("username"))
  WHERE "username" IS NOT NULL;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "profile_id" uuid;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_profile_id_profiles_id_fk'
  ) THEN
    ALTER TABLE "orders"
      ADD CONSTRAINT "orders_profile_id_profiles_id_fk"
      FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "claim_token_hash" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "claim_token_expires_at" timestamp;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "claimed_at" timestamp;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_carrier" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_number" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_url" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipped_at" timestamp;

CREATE INDEX IF NOT EXISTS "order_profile_idx" ON "orders" ("profile_id");
CREATE UNIQUE INDEX IF NOT EXISTS "order_claim_token_hash_idx"
  ON "orders" ("claim_token_hash")
  WHERE "claim_token_hash" IS NOT NULL;

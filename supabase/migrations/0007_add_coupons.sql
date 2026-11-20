-- 0007: Discount coupons for checkout and admin management.
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'percent' NOT NULL,
	"value" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupon_code_idx" ON "coupons" USING btree ("code");
--> statement-breakpoint
-- Preserve the previously hardcoded coupon so existing promos keep working.
INSERT INTO "coupons" ("code", "description", "type", "value", "is_active")
VALUES ('MATTERBABY', '15% off', 'percent', 15, true)
ON CONFLICT ("code") DO NOTHING;

-- 0005: Editable homepage layout.
-- Written to be idempotent so it can also be applied safely where the table
-- already exists (the app also falls back to the default layout if absent).
CREATE TABLE IF NOT EXISTS "homepage_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"config" jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "homepage_section_position_idx" ON "homepage_sections" USING btree ("position");

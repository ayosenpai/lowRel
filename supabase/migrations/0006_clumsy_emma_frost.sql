-- 0006: Homepage draft + named layout slots.
-- Written to be idempotent; the app degrades to the editor's in-memory state
-- if these tables are absent.
CREATE TABLE IF NOT EXISTS "homepage_draft" (
	"id" text PRIMARY KEY DEFAULT 'current' NOT NULL,
	"sections" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "homepage_layouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sections" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "homepage_layout_name_idx" ON "homepage_layouts" USING btree ("name");

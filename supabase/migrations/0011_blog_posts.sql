-- 0011: On-site blog posts for admin-managed journal.
-- Additive only. Do not execute on production without explicit approval.

CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "excerpt" text,
  "content" text NOT NULL DEFAULT '',
  "cover_image_url" text,
  "status" text NOT NULL DEFAULT 'draft',
  "published_at" timestamp,
  "position" integer NOT NULL DEFAULT 0,
  "seo_title" text,
  "seo_description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);

CREATE INDEX IF NOT EXISTS "blog_post_slug_idx" ON "blog_posts" ("slug");
CREATE INDEX IF NOT EXISTS "blog_post_status_idx" ON "blog_posts" ("status");
CREATE INDEX IF NOT EXISTS "blog_post_position_idx" ON "blog_posts" ("position");

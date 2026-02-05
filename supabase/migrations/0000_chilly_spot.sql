CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"name" text NOT NULL,
	"price_usd" integer NOT NULL,
	"price_inr" integer NOT NULL,
	"compare_at_price_usd" integer,
	"compare_at_price_inr" integer,
	"description" text,
	"images" text[],
	"details" text[],
	"fit" text,
	"model_info" text,
	"category" text,
	"is_new" boolean DEFAULT false,
	"is_sale" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"first_name" text,
	"last_name" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "handle_idx" ON "products" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_idx" ON "profiles" USING btree ("email");
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"location" jsonb,
	"visit_count" integer DEFAULT 1,
	"consent_given" boolean DEFAULT false,
	"meta" jsonb,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_events" ADD COLUMN "visitor_id" uuid;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "visitor_ip_idx" ON "visitors" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "visitor_profile_idx" ON "visitors" USING btree ("profile_id");--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_visitor_idx" ON "user_events" USING btree ("visitor_id");
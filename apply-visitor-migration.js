const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

const sql = postgres(dbUrl);

async function migrate() {
    try {
        console.log('Starting manual migration for visitors table...');

        // 1. Create visitors table
        console.log('Creating visitors table...');
        await sql`
            CREATE TABLE IF NOT EXISTS "visitors" (
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
        `;

        // 2. Add visitor_id to user_events
        console.log('Adding visitor_id to user_events...');
        // Check if column exists first to avoid error
        const [columnExists] = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user_events' AND column_name='visitor_id';
        `;

        if (!columnExists) {
            await sql`ALTER TABLE "user_events" ADD COLUMN "visitor_id" uuid;`;
        } else {
            console.log('column visitor_id already exists in user_events.');
        }

        // 3. Add FK constraint for profile_id in visitors
        // We'll use a DO block or just try/catch unique constraint creation logic, 
        // but robust SQL is better. 
        // Simple way: just run it, if it fails because it exists, ignore.

        try {
            await sql`ALTER TABLE "visitors" ADD CONSTRAINT "visitors_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;`;
        } catch (e) {
            if (e.code !== '42710') console.log('Constraint visitors_profile_id_profiles_id_fk might already exist or failed:', e.message); // duplicate object
        }

        // 4. Create Indexes
        try { await sql`CREATE INDEX IF NOT EXISTS "visitor_ip_idx" ON "visitors" USING btree ("ip_address");`; } catch (e) { }
        try { await sql`CREATE INDEX IF NOT EXISTS "visitor_profile_idx" ON "visitors" USING btree ("profile_id");`; } catch (e) { }

        // 5. Add FK constraint for user_events.visitor_id
        try {
            await sql`ALTER TABLE "user_events" ADD CONSTRAINT "user_events_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE no action ON UPDATE no action;`;
        } catch (e) {
            if (e.code !== '42710') console.log('Constraint user_events_visitor_id_visitors_id_fk might already exist or failed:', e.message);
        }

        // 6. Index for visitor_id in user_events
        try { await sql`CREATE INDEX IF NOT EXISTS "event_visitor_idx" ON "user_events" USING btree ("visitor_id");`; } catch (e) { }

        console.log('Successfully updated schema manually.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sql.end();
    }
}

migrate();

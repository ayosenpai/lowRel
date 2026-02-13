
const postgres = require('postgres');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].trim() : null;

if (!dbUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

const sql = postgres(dbUrl);

async function migrate() {
    try {
        console.log('Creating reviews table...');

        await sql`
            CREATE TABLE IF NOT EXISTS "reviews" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "product_id" text NOT NULL,
                "profile_id" uuid NOT NULL,
                "rating" integer NOT NULL,
                "title" text,
                "content" text NOT NULL,
                "is_verified" boolean DEFAULT false,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL,
                CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action,
                CONSTRAINT "reviews_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action
            );
        `;

        await sql`CREATE INDEX IF NOT EXISTS "review_product_idx" ON "reviews" ("product_id");`;
        await sql`CREATE INDEX IF NOT EXISTS "review_profile_idx" ON "reviews" ("profile_id");`;

        console.log('Successfully created reviews table.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sql.end();
    }
}

migrate();

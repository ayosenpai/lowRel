
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
    console.log('Pushing schema changes...');

    // Using direct SQL for the new table to avoid drizzle-kit hang if it happens
    try {
        // Create user_events table
        await client`
            CREATE TABLE IF NOT EXISTS "user_events" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" uuid,
                "session_id" text NOT NULL,
                "event_type" text NOT NULL,
                "path" text,
                "payload" jsonb,
                "timestamp" timestamp DEFAULT now() NOT NULL
            )
        `;
        console.log('Created user_events table');

        // Create indices
        await client`CREATE INDEX IF NOT EXISTS "session_id_idx" ON "user_events" ("session_id")`;
        await client`CREATE INDEX IF NOT EXISTS "event_type_idx" ON "user_events" ("event_type")`;
        console.log('Created indices');

        // Add role to profiles if it doesn't exist
        await client`
            ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL
        `;
        console.log('Added role column to profiles');

        console.log('Successfully updated schema.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.end();
    }
}

main();

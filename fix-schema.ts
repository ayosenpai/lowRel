import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Starting schema fix...');
    try {
        // 1. Create Customers
        console.log('Creating customers table...');
        await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "customers" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "email" text UNIQUE,
            "phone" text,
            "first_name" text,
            "last_name" text,
            "total_spend" integer DEFAULT 0,
            "orders_count" integer DEFAULT 0,
            "last_seen_at" timestamp DEFAULT now(),
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
        );
    `);

        // 2. Create Orders
        console.log('Creating orders table...');
        await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "orders" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "customer_id" uuid REFERENCES "customers"("id"),
            "total_amount" integer NOT NULL,
            "currency" text DEFAULT 'USD',
            "status" text DEFAULT 'pending',
            "payment_id" text,
            "razorpay_order_id" text,
            "shipping_address" jsonb,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
        );
    `);

        // 3. Create Order Items
        console.log('Creating order_items table...');
        await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "order_items" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "order_id" uuid REFERENCES "orders"("id") NOT NULL,
            "product_id" text NOT NULL,
            "product_name" text NOT NULL,
            "variant_name" text,
            "quantity" integer NOT NULL,
            "price" integer NOT NULL
        );
    `);

        // 4. Alter User Events
        console.log('Altering user_events table...');
        await db.execute(sql`
        ALTER TABLE "user_events" ADD COLUMN IF NOT EXISTS "customer_id" uuid REFERENCES "customers"("id");
    `);

        console.log('Schema fix completed successfully.');
    } catch (e) {
        console.error('Schema fix failed:', e);
    }
    process.exit(0);
}
main();

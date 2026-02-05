import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        const tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
        console.log('Tables:', JSON.stringify(tables, null, 2));

        const columns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_events'
    `);
        console.log('UserEvents Columns:', JSON.stringify(columns, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
main();

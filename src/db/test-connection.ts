
import postgres from 'postgres'
import { config } from 'dotenv'

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL
console.log('Testing connection to:', connectionString ? connectionString.replace(/:[^:@]*@/, ':****@') : 'undefined');

if (!connectionString) {
    console.error('DATABASE_URL is missing!');
    process.exit(1);
}

const sql = postgres(connectionString)

async function test() {
    try {
        const result = await sql`select 1 as x`
        console.log('Connection successful!', result)
    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await sql.end()
    }
}

test()

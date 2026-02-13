
const postgres = require('postgres');
const fs = require('fs');

// Simple env loader
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
        console.log('Adding madid column to customers table...');
        await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS madid TEXT;`;
        console.log('Successfully updated schema.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sql.end();
    }
}

migrate();

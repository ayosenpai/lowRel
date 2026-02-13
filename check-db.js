
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

async function check() {
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'customers';
        `;
        console.log('Columns in customers table:');
        columns.forEach(c => console.log(`- ${c.column_name}: ${c.data_type}`));
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await sql.end();
    }
}

check();

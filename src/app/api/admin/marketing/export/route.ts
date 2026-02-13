
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq, isNotNull, or } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        // Fetch all customers with either email or phone
        const data = await db.select({
            email: customers.email,
            phone: customers.phone,
            firstName: customers.firstName,
            lastName: customers.lastName,
            madid: customers.madid,
        })
            .from(customers)
            .where(
                or(
                    isNotNull(customers.email),
                    isNotNull(customers.phone),
                    isNotNull(customers.madid)
                )
            );

        if (data.length === 0) {
            return new NextResponse('No audience data available for export.', { status: 404 });
        }

        // Meta Formatting Guidelines:
        // 1. Column headers: email, phone, fn, ln, madid
        // 2. Email: lower case, remove spaces
        // 3. Phone: must include country code
        // 4. Madid: IDFA/AAID for mobile app users

        const headers = ['email', 'phone', 'fn', 'ln', 'madid'];
        const csvRows = [headers.join(',')];

        data.forEach(item => {
            const row = [
                (item.email || '').toLowerCase().trim(),
                (item.phone || '').replace(/\s+/g, '').trim(),
                (item.firstName || '').toLowerCase().trim(),
                (item.lastName || '').toLowerCase().trim(),
                (item.madid || '').trim(),
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');

        return new NextResponse(csvString, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="meta_custom_audience.csv"',
            },
        });
    } catch (error) {
        console.error('Data Export Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

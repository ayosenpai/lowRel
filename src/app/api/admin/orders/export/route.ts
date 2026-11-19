import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, ilike, inArray, or, sql, sum } from 'drizzle-orm';
import { db } from '@/db';
import { customers, orderItems, orders } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { isOrderStatus } from '@/lib/order-utils';

function csvCell(value: unknown): string {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvRow(cells: unknown[]): string {
    return cells.map(csvCell).join(',');
}

/**
 * CSV export for reconciliation. Uses getAdminUser (not requireAdmin) so
 * non-admins get a clean 403 instead of a redirect response.
 */
export async function GET(request: NextRequest) {
    const { admin } = await getAdminUser();
    if (!admin) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = (searchParams.get('search') ?? '').trim().slice(0, 80);

    const conditions = [];
    if (isOrderStatus(status)) {
        conditions.push(eq(orders.status, status));
    }
    if (search) {
        const like = `%${search}%`;
        conditions.push(
            or(
                sql`${orders.id}::text ilike ${like}`,
                ilike(orders.orderId, like),
                ilike(orders.paymentId, like),
                ilike(customers.email, like),
                ilike(customers.firstName, like),
                ilike(customers.lastName, like)
            )
        );
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
        .select({
            id: orders.id,
            createdAt: orders.createdAt,
            status: orders.status,
            currency: orders.currency,
            totalAmount: orders.totalAmount,
            razorpayOrderId: orders.orderId,
            paymentId: orders.paymentId,
            firstName: customers.firstName,
            lastName: customers.lastName,
            email: customers.email,
            phone: customers.phone,
        })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(5000);

    const ids = rows.map((row) => row.id);
    const unitRows = ids.length
        ? await db
              .select({ orderId: orderItems.orderId, units: sum(orderItems.quantity) })
              .from(orderItems)
              .where(inArray(orderItems.orderId, ids))
              .groupBy(orderItems.orderId)
        : [];
    const unitsById = new Map(unitRows.map((row) => [row.orderId, Number(row.units) || 0]));

    const lines = [
        csvRow([
            'order_id',
            'placed_at',
            'status',
            'currency',
            'total',
            'units',
            'customer_name',
            'customer_email',
            'customer_phone',
            'razorpay_order_id',
            'payment_id',
        ]),
        ...rows.map((row) =>
            csvRow([
                row.id,
                row.createdAt?.toISOString() ?? '',
                row.status ?? '',
                row.currency ?? '',
                ((Number(row.totalAmount) || 0) / 100).toFixed(2),
                unitsById.get(row.id) ?? 0,
                [row.firstName, row.lastName].filter(Boolean).join(' '),
                row.email ?? '',
                row.phone ?? '',
                row.razorpayOrderId ?? '',
                row.paymentId ?? '',
            ])
        ),
    ];

    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(`\uFEFF${lines.join('\r\n')}`, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="orders-${stamp}.csv"`,
            'Cache-Control': 'no-store',
        },
    });
}

'use server';

import { and, count, desc, eq, ilike, inArray, or, sql, sum } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { customers, orderItems, orders } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { isOrderStatus, isRevenueStatus, type OrderStatus } from '@/lib/order-utils';

export interface AdminOrderFilters {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface AdminOrderRow {
    id: string;
    createdAt: Date;
    status: string;
    currency: string;
    totalAmount: number;
    customerId: string | null;
    customerName: string | null;
    customerEmail: string | null;
    razorpayOrderId: string | null;
    paymentId: string | null;
    units: number;
}

export interface AdminOrderStats {
    totalOrders: number;
    counts: Record<string, number>;
    /** Revenue per currency, in the smallest unit. */
    revenue: Record<string, number>;
}

export interface AdminOrdersPage {
    orders: AdminOrderRow[];
    stats: AdminOrderStats;
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
}

export interface AdminOrderItem {
    id: string;
    productId: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    price: number;
}

export interface AdminOrderDetail {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    currency: string;
    totalAmount: number;
    paymentId: string | null;
    razorpayOrderId: string | null;
    shippingAddress: Record<string, unknown> | null;
    customerId: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    items: AdminOrderItem[];
}

function customerName(firstName: string | null, lastName: string | null): string | null {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    return name || null;
}

function buildWhere(filters: AdminOrderFilters) {
    const conditions = [];

    if (isOrderStatus(filters.status)) {
        conditions.push(eq(orders.status, filters.status));
    }

    const term = (filters.search ?? '').trim().slice(0, 80);
    if (term) {
        const like = `%${term}%`;
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

    return conditions.length > 0 ? and(...conditions) : undefined;
}

/** Paginated order list with customer info, unit counts and headline stats. */
export async function getAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrdersPage> {
    await requireAdmin();

    const pageSize = Math.min(Math.max(Math.floor(Number(filters.pageSize) || 25), 1), 100);
    const page = Math.max(Math.floor(Number(filters.page)) || 1, 1);
    const where = buildWhere(filters);

    const [rows, totalRows, statusRows] = await Promise.all([
        db
            .select({
                id: orders.id,
                createdAt: orders.createdAt,
                status: orders.status,
                currency: orders.currency,
                totalAmount: orders.totalAmount,
                customerId: orders.customerId,
                firstName: customers.firstName,
                lastName: customers.lastName,
                email: customers.email,
                razorpayOrderId: orders.orderId,
                paymentId: orders.paymentId,
            })
            .from(orders)
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(where)
            .orderBy(desc(orders.createdAt))
            .limit(pageSize)
            .offset((page - 1) * pageSize),
        db
            .select({ value: count() })
            .from(orders)
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(where),
        db
            .select({
                status: orders.status,
                currency: orders.currency,
                orders: count(),
                amount: sum(orders.totalAmount),
            })
            .from(orders)
            .groupBy(orders.status, orders.currency),
    ]);

    const ids = rows.map((row) => row.id);
    const unitRows = ids.length
        ? await db
              .select({ orderId: orderItems.orderId, units: sum(orderItems.quantity) })
              .from(orderItems)
              .where(inArray(orderItems.orderId, ids))
              .groupBy(orderItems.orderId)
        : [];
    const unitsById = new Map(unitRows.map((row) => [row.orderId, Number(row.units) || 0]));

    const stats: AdminOrderStats = { totalOrders: 0, counts: {}, revenue: {} };
    for (const row of statusRows) {
        const orderCount = Number(row.orders) || 0;
        const status = row.status || 'pending';
        stats.totalOrders += orderCount;
        stats.counts[status] = (stats.counts[status] ?? 0) + orderCount;

        if (isRevenueStatus(row.status)) {
            const currency = (row.currency || 'USD').toUpperCase();
            stats.revenue[currency] = (stats.revenue[currency] ?? 0) + (Number(row.amount) || 0);
        }
    }

    const total = Number(totalRows[0]?.value) || 0;

    return {
        orders: rows.map((row) => ({
            id: row.id,
            createdAt: row.createdAt,
            status: row.status ?? 'pending',
            currency: row.currency ?? 'USD',
            totalAmount: row.totalAmount,
            customerId: row.customerId,
            customerName: customerName(row.firstName, row.lastName),
            customerEmail: row.email,
            razorpayOrderId: row.razorpayOrderId,
            paymentId: row.paymentId,
            units: unitsById.get(row.id) ?? 0,
        })),
        stats,
        total,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
}

/** One order with items, customer and shipping address. */
export async function getAdminOrder(id: string): Promise<AdminOrderDetail | null> {
    await requireAdmin();

    const rows = await db
        .select({
            id: orders.id,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
            status: orders.status,
            currency: orders.currency,
            totalAmount: orders.totalAmount,
            paymentId: orders.paymentId,
            razorpayOrderId: orders.orderId,
            shippingAddress: orders.shippingAddress,
            customerId: orders.customerId,
            firstName: customers.firstName,
            lastName: customers.lastName,
            email: customers.email,
            phone: customers.phone,
        })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .where(eq(orders.id, id))
        .limit(1);

    const order = rows[0];
    if (!order) return null;

    const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, id));

    return {
        id: order.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status ?? 'pending',
        currency: order.currency ?? 'USD',
        totalAmount: order.totalAmount,
        paymentId: order.paymentId,
        razorpayOrderId: order.razorpayOrderId,
        shippingAddress: (order.shippingAddress as Record<string, unknown> | null) ?? null,
        customerId: order.customerId,
        customerName: customerName(order.firstName, order.lastName),
        customerEmail: order.email,
        customerPhone: order.phone,
        items: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price,
        })),
    };
}

export interface UpdateAdminOrderInput {
    status?: string;
    paymentId?: string | null;
}

/**
 * Updates an order's status and/or payment reference. Customer lifetime value
 * is adjusted only when an order enters or leaves a revenue status, so
 * toggling statuses never double-counts a sale.
 */
export async function updateAdminOrder(orderId: string, input: UpdateAdminOrderInput) {
    await requireAdmin();

    if (input.status !== undefined && !isOrderStatus(input.status)) {
        throw new Error('Unknown order status');
    }

    const result = await db.transaction(async (tx) => {
        const existingRows = await tx
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);

        const existing = existingRows[0];
        if (!existing) {
            throw new Error('Order not found');
        }

        const nextStatus: OrderStatus = (input.status as OrderStatus | undefined) ?? (existing.status as OrderStatus);
        const patch: Partial<typeof orders.$inferInsert> = {
            status: nextStatus,
            updatedAt: new Date(),
        };

        if (input.paymentId !== undefined) {
            const paymentId = String(input.paymentId ?? '').trim().slice(0, 120);
            patch.paymentId = paymentId || null;
        }

        const updatedRows = await tx
            .update(orders)
            .set(patch)
            .where(eq(orders.id, orderId))
            .returning({ id: orders.id, status: orders.status });

        const wasRevenue = isRevenueStatus(existing.status);
        const nowRevenue = isRevenueStatus(nextStatus);

        if (existing.customerId && wasRevenue !== nowRevenue) {
            const delta = nowRevenue ? existing.totalAmount : -existing.totalAmount;
            const countDelta = nowRevenue ? 1 : -1;

            await tx
                .update(customers)
                .set({
                    totalSpend: sql`greatest(0, coalesce(${customers.totalSpend}, 0) + ${delta})`,
                    ordersCount: sql`greatest(0, coalesce(${customers.ordersCount}, 0) + ${countDelta})`,
                    lastSeenAt: new Date(),
                })
                .where(eq(customers.id, existing.customerId));
        }

        return updatedRows[0];
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin');
    revalidatePath('/admin/customers');

    return result;
}

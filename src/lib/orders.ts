import { headers } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { eq, inArray, and, sql, isNull, lt, or } from 'drizzle-orm';
import { db } from '@/db';
import { products, orders, orderItems, customers, coupons } from '@/db/schema';
import { isComingSoon } from '@/lib/store-config';
import { validateCouponCode } from '@/lib/actions/coupons';

export interface OrderItemInput {
    id: string;
    quantity: number;
    size?: string;
}

export interface ComputedOrder {
    currency: 'INR' | 'USD';
    subtotal: number; // smallest unit (paise / cents)
    discountAmount: number; // smallest unit
    total: number; // smallest unit
    discountCode: string | null;
    discountRate: number; // 0..1
    lines: {
        productId: string;
        productName: string;
        quantity: number;
        price: number; // smallest unit
        variantName: string;
    }[];
}

export class OrderValidationError extends Error {}

/**
 * Recomputes the payable amount from the database for the visitor's region.
 * This is what makes checkout tamper-proof: the client can no longer send
 * an arbitrary amount.
 */
export async function computeOrderTotals(
    items: OrderItemInput[],
    discountCode?: string | null
): Promise<ComputedOrder> {
    if (!Array.isArray(items) || items.length === 0) {
        throw new OrderValidationError('Cart is empty');
    }
    if (items.length > 50) {
        throw new OrderValidationError('Too many distinct items in cart');
    }

    const headerList = await headers();
    const isIndia = headerList.get('x-region') !== 'GLOBAL';
    const currency: 'INR' | 'USD' = isIndia ? 'INR' : 'USD';

    const ids = [...new Set(items.map((i) => String(i.id)))];
    const rows = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(rows.map((row) => [row.id, row]));

    let subtotal = 0;
    const lines: ComputedOrder['lines'] = [];

    for (const item of items) {
        const product = byId.get(String(item.id));
        if (!product) {
            throw new OrderValidationError(`Product not available: ${item.id}`);
        }

        // Coming-soon categories are display-only. Enforce it here so a tampered
        // cart can never create a payable order for them.
        if (isComingSoon(product)) {
            throw new OrderValidationError(`${product.name} is not available for purchase yet`);
        }

        const quantity = Math.floor(Number(item.quantity));
        if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10) {
            throw new OrderValidationError('Invalid item quantity');
        }

        const unitPrice = isIndia ? product.priceINR : product.priceUSD;
        subtotal += unitPrice * quantity;

        lines.push({
            productId: product.id,
            productName: product.name,
            quantity,
            price: unitPrice,
            variantName: item.size || 'Standard',
        });
    }

    const validated = await validateCouponCode(discountCode || '');
    const rate = validated.valid ? validated.rate ?? 0 : 0;
    const appliedCode = validated.valid ? validated.code ?? null : null;
    const discountAmount = Math.round(subtotal * rate);

    return {
        currency,
        subtotal,
        discountAmount,
        total: Math.max(0, subtotal - discountAmount),
        discountCode: appliedCode,
        discountRate: rate,
        lines,
    };
}

/**
 * Creates a `pending` order row (plus its items) at Razorpay order creation
 * time. The webhook/confirmation later flips it to `paid`, so we never lose
 * a paid order just because the shopper closed the browser early.
 */
export async function createPendingOrder(params: {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    customerId: string | null;
    discountCode?: string | null;
    shippingAddress: Record<string, unknown> | null;
    lines: ComputedOrder['lines'];
}): Promise<string> {
    // Order + items must land together, otherwise a paid order could exist
    // without its line items.
    return db.transaction(async (tx) => {
        const inserted = await tx
            .insert(orders)
            .values({
                customerId: params.customerId,
                orderId: params.razorpayOrderId,
                totalAmount: params.amount,
                currency: params.currency,
                status: 'pending',
                discountCode: params.discountCode ?? null,
                shippingAddress: params.shippingAddress,
            })
            .returning({ id: orders.id });

        const orderRecordId = inserted[0].id;

        if (params.lines.length > 0) {
            await tx.insert(orderItems).values(
                params.lines.map((line) => ({
                    orderId: orderRecordId,
                    productId: line.productId,
                    productName: line.productName,
                    quantity: line.quantity,
                    price: line.price,
                    variantName: line.variantName,
                }))
            );
        }

        return orderRecordId;
    });
}

export interface MarkPaidResult {
    updated: boolean;
    missing: boolean;
    order?: typeof orders.$inferSelect;
}

/**
 * Idempotently marks an order as paid and increments customer LTV.
 * Called from both the client-confirmation endpoint and the webhook, so
 * duplicate notifications are harmless.
 */
export async function markOrderPaid(
    razorpayOrderId: string,
    razorpayPaymentId: string
): Promise<MarkPaidResult> {
    return db.transaction(async (tx) => {
        const existing = await tx
            .select()
            .from(orders)
            .where(eq(orders.orderId, razorpayOrderId))
            .limit(1);

        const order = existing[0];
        if (!order) {
            return { updated: false, missing: true };
        }

        if (order.status === 'paid') {
            return { updated: false, missing: false, order };
        }

        // Atomic guard: if two notifications (browser + webhook) arrive at the
        // same time, only one conditional update matches, so LTV is incremented
        // exactly once.
        const claimed = await tx
            .update(orders)
            .set({
                status: 'paid',
                paymentId: razorpayPaymentId,
                updatedAt: new Date(),
            })
            .where(and(eq(orders.id, order.id), sql`${orders.status} is distinct from 'paid'`))
            .returning({ id: orders.id });

        if (claimed.length === 0) {
            return { updated: false, missing: false, order };
        }

        if (order.customerId) {
            await tx
                .update(customers)
                .set({
                    totalSpend: sql`${customers.totalSpend} + ${order.totalAmount}`,
                    ordersCount: sql`${customers.ordersCount} + 1`,
                    lastSeenAt: new Date(),
                })
                .where(eq(customers.id, order.customerId));
        }

        if (order.discountCode) {
            await tx
                .update(coupons)
                .set({
                    usedCount: sql`${coupons.usedCount} + 1`,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(coupons.code, order.discountCode),
                        or(isNull(coupons.maxUses), lt(coupons.usedCount, coupons.maxUses))
                    )
                );
        }

        return { updated: true, missing: false, order };
    });
}

/** Verifies a Razorpay payment signature (HMAC-SHA256). */
export function verifyRazorpaySignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;

    const expected = createHmac('sha256', secret)
        .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
        .digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const receivedBuf = Buffer.from(params.razorpaySignature || '', 'utf8');
    return expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf);
}

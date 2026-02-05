'use server';

import { db } from '@/db';
import { customers, orders, orderItems, userEvents } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getSessionId } from './analytics';
import { cookies } from 'next/headers';

export type CustomerData = {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
};

// 1. Identify or Create Customer
export async function identifyCustomer(data: CustomerData) {
    if (!data.email) return null;

    try {
        // Check if customer exists
        const existing = await db.select().from(customers).where(eq(customers.email, data.email)).limit(1);

        let customerId;

        if (existing.length > 0) {
            customerId = existing[0].id;
            // Update latest info if provided
            await db.update(customers).set({
                firstName: data.firstName || existing[0].firstName,
                lastName: data.lastName || existing[0].lastName,
                phone: data.phone || existing[0].phone,
                lastSeenAt: new Date(),
            }).where(eq(customers.id, customerId));
        } else {
            // Create new customer
            const newCustomer = await db.insert(customers).values({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                lastSeenAt: new Date(),
            }).returning({ id: customers.id });
            customerId = newCustomer[0].id;
        }

        // Stitch anonymous session to this customer
        const sessionId = await getSessionId();
        await stitchSession(sessionId, customerId);

        return customerId;
    } catch (error) {
        console.error('CRM Identity Error:', error);
        return null;
    }
}

// 2. Stitch Session: Link anonymous events to the customer
export async function stitchSession(sessionId: string, customerId: string) {
    try {
        await db.update(userEvents)
            .set({ customerId: customerId })
            .where(and(eq(userEvents.sessionId, sessionId), isNull(userEvents.customerId))); // Only update anonymous ones
    } catch (error) {
        console.error('CRM Stitch Error:', error);
    }
}

// 3. Create Order & Update LTV
export async function createOrderRecord(orderData: {
    customerId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number; // cents
    currency: string;
    items: any[];
    shippingAddress: any;
}) {
    try {
        // Create Order
        const newOrder = await db.insert(orders).values({
            customerId: orderData.customerId,
            orderId: orderData.razorpayOrderId,
            paymentId: orderData.razorpayPaymentId,
            totalAmount: orderData.amount,
            currency: orderData.currency,
            status: 'paid', // Assuming we call this on success
            shippingAddress: orderData.shippingAddress,
        }).returning({ id: orders.id });

        const orderId = newOrder[0].id;

        // Create Order Items
        if (orderData.items && orderData.items.length > 0) {
            await db.insert(orderItems).values(
                orderData.items.map((item: any) => ({
                    orderId: orderId,
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    price: Math.round(item.price * 100), // Ensure cents
                    variantName: item.size || 'Standard',
                }))
            );
        }

        // Update Customer LTV & Order Count
        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, orderData.customerId)
        });

        if (customer) {
            await db.update(customers).set({
                totalSpend: (customer.totalSpend || 0) + orderData.amount,
                ordersCount: (customer.ordersCount || 0) + 1,
            }).where(eq(customers.id, orderData.customerId));
        }

        return orderId;
    } catch (error) {
        console.error('CRM Order Error:', error);
        return null;
    }
}

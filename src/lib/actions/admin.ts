'use server';

import { db } from '@/db';
import { userEvents, products } from '@/db/schema';
import { count, sum, desc, eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAdminStats() {
    try {
        // 1. Total Purchases
        const purchaseEvents = await db.select().from(userEvents).where(eq(userEvents.eventType, 'purchase'));
        const totalSales = purchaseEvents.reduce((acc, event) => {
            const payload = event.payload as any;
            return acc + (payload?.total || 0);
        }, 0);

        // 2. Conversion Funnel
        const cartAdds = await db.select({ count: count() }).from(userEvents).where(eq(userEvents.eventType, 'add_to_cart'));
        const checkoutStarts = await db.select({ count: count() }).from(userEvents).where(eq(userEvents.eventType, 'begin_checkout'));
        const completedPurchases = await db.select({ count: count() }).from(userEvents).where(eq(userEvents.eventType, 'purchase'));

        // 3. Recent Events
        const recentEvents = await db.select()
            .from(userEvents)
            .orderBy(desc(userEvents.timestamp))
            .limit(10);

        // 4. Top Selling Products (Simplified logic using event payloads)
        const productSales: Record<string, { name: string, count: number, revenue: number }> = {};

        purchaseEvents.forEach(event => {
            const payload = event.payload as any;
            if (payload?.items) {
                payload.items.forEach((item: any) => {
                    if (!productSales[item.id]) {
                        productSales[item.id] = { name: item.name, count: 0, revenue: 0 };
                    }
                    productSales[item.id].count += (item.quantity || 1);
                    productSales[item.id].revenue += (item.price * (item.quantity || 1));
                });
            }
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // 5. Chart Data (Last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const chartData = last7Days.map(date => {
            const dayPurchases = purchaseEvents.filter(e => e.timestamp.toISOString().split('T')[0] === date);
            const amount = dayPurchases.reduce((acc, e) => acc + ((e.payload as any)?.total || 0), 0);
            return { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount };
        });

        return {
            stats: {
                totalSales,
                cartAdds: cartAdds[0].count,
                checkoutStarts: checkoutStarts[0].count,
                completedPurchases: completedPurchases[0].count,
                conversionRate: checkoutStarts[0].count > 0
                    ? (completedPurchases[0].count / checkoutStarts[0].count) * 100
                    : 0
            },
            recentEvents,
            topProducts,
            chartData
        };
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return null;
    }
}

export async function getAdminProducts() {
    return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function addProduct(data: any) {
    try {
        await db.insert(products).values({
            id: crypto.randomUUID(),
            handle: data.handle,
            name: data.name,
            priceUSD: Math.round(data.priceUSD * 100),
            priceINR: Math.round(data.priceINR * 100),
            compareAtPriceUSD: data.compareAtPriceUSD ? Math.round(data.compareAtPriceUSD * 100) : null,
            compareAtPriceINR: data.compareAtPriceINR ? Math.round(data.compareAtPriceINR * 100) : null,
            description: data.description,
            images: data.images,
            details: data.details,
            fit: data.fit,
            modelInfo: data.modelInfo,
            category: data.category,
            isNew: data.isNew || false,
            isSale: data.isSale || false,
        });

        revalidatePath('/admin/products');
        revalidatePath('/collections/all');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Failed to add product:', error);
        throw new Error('Failed to create product');
    }
}

export async function deleteProduct(id: string) {
    try {
        await db.delete(products).where(eq(products.id, id));

        revalidatePath('/admin/products');
        revalidatePath('/collections/all');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Failed to delete product:', error);
        throw new Error('Failed to delete product');
    }
}

export async function getDetailedAnalytics() {
    try {
        const events = await db.select().from(userEvents);

        const funnel = [
            { name: 'Views', count: events.filter(e => e.eventType === 'view_product').length },
            { name: 'Cart Adds', count: events.filter(e => e.eventType === 'add_to_cart').length },
            { name: 'Checkouts', count: events.filter(e => e.eventType === 'begin_checkout').length },
            { name: 'Purchases', count: events.filter(e => e.eventType === 'purchase').length },
        ];

        const sessions = [...new Set(events.map(e => e.sessionId))];
        const abandonedSessions = sessions.filter(sid => {
            const sessEvents = events.filter(e => e.sessionId === sid);
            const hasCheckout = sessEvents.some(e => e.eventType === 'begin_checkout');
            const hasPurchase = sessEvents.some(e => e.eventType === 'purchase');
            return hasCheckout && !hasPurchase;
        });

        const abandonedCarts = abandonedSessions.map(sid => {
            const sessEvents = events.filter(e => e.sessionId === sid);
            const checkoutEvent = sessEvents.find(e => e.eventType === 'begin_checkout');
            const cartItems = sessEvents.filter(e => e.eventType === 'add_to_cart');
            return {
                sessionId: sid,
                timestamp: checkoutEvent?.timestamp,
                items: cartItems.length,
                lastPath: checkoutEvent?.path
            };
        }).sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 10);

        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const dailyTrends = last7Days.map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: events.filter(e => e.eventType === 'view_product' && e.timestamp.toISOString().split('T')[0] === date).length,
            intent: events.filter(e => (e.eventType === 'add_to_cart' || e.eventType === 'begin_checkout') && e.timestamp.toISOString().split('T')[0] === date).length,
            sales: events.filter(e => e.eventType === 'purchase' && e.timestamp.toISOString().split('T')[0] === date).length,
        }));

        return {
            funnel,
            abandonedCarts,
            dailyTrends,
            totalSessions: sessions.length
        };
    } catch (error) {
        console.error('Failed to fetch detailed analytics:', error);
        return null;
    }
}

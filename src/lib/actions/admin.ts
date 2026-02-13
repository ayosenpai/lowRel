'use server';

import { db } from '@/db';
import { userEvents, products, customers } from '@/db/schema';
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
        const visitors = [...new Set((await db.select({ sessionId: userEvents.sessionId }).from(userEvents)).map(e => e.sessionId))].length;
        const cartAdds = await db.select({ count: count() }).from(userEvents).where(eq(userEvents.eventType, 'add_to_cart'));
        const checkoutStarts = await db.select({ count: count() }).from(userEvents).where(eq(userEvents.eventType, 'begin_checkout'));
        const completedPurchases = await db.select({ count: count() }).from(userEvents).where(eq(userEvents.eventType, 'purchase'));

        // 3. Recent Events
        const recentEvents = await db.select()
            .from(userEvents)
            .orderBy(desc(userEvents.timestamp))
            .limit(10);

        // ... (product logic same) ...
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
                visitors,
                cartAdds: cartAdds[0].count,
                checkoutStarts: checkoutStarts[0].count,
                completedPurchases: completedPurchases[0].count,
                conversionRate: visitors > 0
                    ? (completedPurchases[0].count / visitors) * 100
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

export async function getProductById(id: string) {
    try {
        const product = await db.select().from(products).where(eq(products.id, id));
        return product[0] || null;
    } catch (error) {
        console.error('Failed to get product:', error);
        return null;
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        await db.update(products)
            .set({
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
            })
            .where(eq(products.id, id));

        revalidatePath('/admin/products');
        revalidatePath(`/products/${data.handle}`);
        revalidatePath('/collections/all');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Failed to update product:', error);
        throw new Error('Failed to update product');
    }
}

export async function getDetailedAnalytics() {
    try {
        const events = await db.select().from(userEvents);

        // 1. Enhanced Funnel
        const funnel = [
            { name: 'Total Visits', count: [...new Set(events.map(e => e.sessionId))].length },
            { name: 'Product Views', count: events.filter(e => e.eventType === 'view_product').length },
            { name: 'Cart Adds', count: events.filter(e => e.eventType === 'add_to_cart').length },
            { name: 'Checkouts', count: events.filter(e => e.eventType === 'begin_checkout').length },
            { name: 'Purchases', count: events.filter(e => e.eventType === 'purchase').length },
        ];

        // 2. Acquisition Channels (Referrers)
        const referrerCounts: Record<string, number> = {};
        events.forEach(e => {
            if (e.eventType === 'page_view') {
                const ref = (e.payload as any)?.referrer;
                let channel = 'Direct / Unknown';
                if (ref) {
                    try {
                        const url = new URL(ref);
                        if (url.hostname.includes('google')) channel = 'Google Search';
                        else if (url.hostname.includes('instagram')) channel = 'Instagram';
                        else if (url.hostname.includes('facebook')) channel = 'Facebook';
                        else if (url.hostname.includes('t.co') || url.hostname.includes('twitter')) channel = 'Twitter/X';
                        else channel = url.hostname;
                    } catch {
                        channel = 'Other';
                    }
                }
                referrerCounts[channel] = (referrerCounts[channel] || 0) + 1;
            }
        });
        const channels = Object.entries(referrerCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 3. Behavioral Intelligence (Top Pages)
        const pageCounts: Record<string, number> = {};
        events.filter(e => e.eventType === 'page_view').forEach(e => {
            const p = e.path || '/';
            pageCounts[p] = (pageCounts[p] || 0) + 1;
        });
        const topPages = Object.entries(pageCounts)
            .map(([path, views]) => ({ path, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 8);

        // 4. Search Intelligence
        const searchCounts: Record<string, number> = {};
        events.filter(e => e.eventType === 'search').forEach(e => {
            const q = (e.payload as any)?.query?.toLowerCase();
            if (q) searchCounts[q] = (searchCounts[q] || 0) + 1;
        });
        const topSearches = Object.entries(searchCounts)
            .map(([query, count]) => ({ query, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 5. Abandoned Cart Logic (Same as before but cleaned up)
        const sessions = [...new Set(events.map(e => e.sessionId))];
        const abandonedCarts = sessions.filter(sid => {
            const sessEvents = events.filter(e => e.sessionId === sid);
            const hasCheckout = sessEvents.some(e => e.eventType === 'begin_checkout');
            const hasPurchase = sessEvents.some(e => e.eventType === 'purchase');
            return hasCheckout && !hasPurchase;
        }).map(sid => {
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

        // 6. Growth Trends
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const dailyTrends = last7Days.map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: events.filter(e => e.eventType === 'page_view' && e.timestamp.toISOString().split('T')[0] === date).length,
            intent: events.filter(e => (e.eventType === 'add_to_cart' || e.eventType === 'begin_checkout') && e.timestamp.toISOString().split('T')[0] === date).length,
            sales: events.filter(e => e.eventType === 'purchase' && e.timestamp.toISOString().split('T')[0] === date).length,
        }));

        return {
            funnel,
            channels,
            topPages,
            topSearches,
            abandonedCarts,
            dailyTrends,
            totalSessions: sessions.length
        };
    } catch (error) {
        console.error('Failed to fetch detailed analytics:', error);
        return null;
    }
}

export async function getMarketingSegments() {
    try {
        const events = await db.select().from(userEvents);
        const allCustomers = await db.select().from(customers);

        // 1. VIP Seed (Top 20% Spenders) - Perfect for "Value-Based Lookalikes"
        const vipSeed = allCustomers
            .filter(c => (c.totalSpend || 0) > 0)
            .sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0))
            .slice(0, Math.ceil(allCustomers.length * 0.2))
            .map(c => ({ id: c.id, email: c.email, spend: c.totalSpend }));

        // 2. High Intent Categories
        const categoryEnthusiasts: Record<string, string[]> = {};
        events.filter(e => e.eventType === 'view_product').forEach(e => {
            const path = e.path || '';
            const category = path.includes('t-shirt') ? 'T-Shirts' :
                path.includes('hoodie') ? 'Hoodies' : 'Other';

            if (!categoryEnthusiasts[category]) categoryEnthusiasts[category] = [];
            categoryEnthusiasts[category].push(e.sessionId);
        });

        const highIntentSeeds = Object.entries(categoryEnthusiasts).map(([name, sessions]) => {
            const freq: Record<string, number> = {};
            sessions.forEach(s => freq[s] = (freq[s] || 0) + 1);
            const highIntentCount = Object.values(freq).filter(f => f > 3).length;
            return { name, count: highIntentCount };
        });

        return {
            vipSeed,
            highIntentSeeds,
            totalMarketable: allCustomers.length
        };
    } catch (error) {
        console.error('Failed to fetch marketing segments:', error);
        return null;
    }
}

'use server';

import { db } from '@/db';
import { userEvents, products, customers, orders } from '@/db/schema';
import { count, sum, desc, asc, eq, sql, and } from 'drizzle-orm';
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

export interface AdminDashboardData {
    range: number;
    currencySymbol: string;
    period: {
        revenue: number;
        orders: number;
        visitors: number;
        cartAdds: number;
        checkouts: number;
        purchases: number;
        aov: number;
        conversionRate: number;
    };
    previous: {
        revenue: number;
        orders: number;
        visitors: number;
        purchases: number;
        aov: number;
        conversionRate: number;
    };
    series: { date: string; revenue: number; visitors: number; orders: number }[];
    funnel: { name: string; count: number; pct: number }[];
    topProducts: { id: string; name: string; count: number; revenue: number }[];
    recentOrders: {
        id: string;
        total: number;
        status: string;
        customer: string;
        createdAt: string;
    }[];
    insights: {
        kind: 'positive' | 'warning' | 'info' | 'danger';
        title: string;
        detail: string;
    }[];
    hourlyActivity: { hour: number; count: number }[];
    peakDay: string | null;
    topChannels: { name: string; value: number }[];
}

export async function getAdminDashboard(rangeDays = 7): Promise<AdminDashboardData | null> {
    try {
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - rangeDays);
        const prevStart = new Date(start);
        prevStart.setDate(prevStart.getDate() - rangeDays);

        const allEvents = await db.select().from(userEvents);
        const periodEvents = allEvents.filter(e => e.timestamp >= start);
        const prevEvents = allEvents.filter(e => e.timestamp >= prevStart && e.timestamp < start);

        const countBy = (events: typeof allEvents, type: string) => events.filter(e => e.eventType === type).length;
        const sumRevenue = (events: typeof allEvents) => events
            .filter(e => e.eventType === 'purchase')
            .reduce((acc, e) => acc + ((e.payload as any)?.total || 0), 0);

        const purchases = periodEvents.filter(e => e.eventType === 'purchase');
        const prevPurchases = prevEvents.filter(e => e.eventType === 'purchase');

        const revenue = sumRevenue(periodEvents);
        const prevRevenue = sumRevenue(prevEvents);
        const visitors = new Set(periodEvents.map(e => e.sessionId)).size;
        const prevVisitors = new Set(prevEvents.map(e => e.sessionId)).size;
        const cartAdds = countBy(periodEvents, 'add_to_cart');
        const checkouts = countBy(periodEvents, 'begin_checkout');
        const ordersCount = purchases.length;
        const prevOrders = prevPurchases.length;
        const aov = ordersCount ? revenue / ordersCount : 0;
        const prevAov = prevOrders ? prevRevenue / prevOrders : 0;
        const conversionRate = visitors ? (ordersCount / visitors) * 100 : 0;
        const prevConversionRate = prevVisitors ? (prevOrders / prevVisitors) * 100 : 0;

        const series = [...Array(rangeDays)].map((_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().split('T')[0];
            const dayEvents = periodEvents.filter(e => e.timestamp.toISOString().split('T')[0] === key);
            const dayPurchases = dayEvents.filter(e => e.eventType === 'purchase');
            const dayRev = dayPurchases.reduce((acc, e) => acc + ((e.payload as any)?.total || 0), 0);
            return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: Math.round(dayRev * 100) / 100,
                visitors: new Set(dayEvents.map(e => e.sessionId)).size,
                orders: dayPurchases.length,
            };
        });

        const funnelSteps = ['page_view', 'view_product', 'add_to_cart', 'begin_checkout', 'purchase'];
        const funnel = funnelSteps.map((key, i) => {
            const count = countBy(periodEvents, key);
            const prev = i === 0 ? 100 : countBy(periodEvents, funnelSteps[i - 1]);
            return {
                name: key.replace(/_/g, ' '),
                count,
                pct: i === 0 ? 100 : (prev ? (count / prev) * 100 : 0),
            };
        });

        const productSales: Record<string, { id: string; name: string; count: number; revenue: number }> = {};
        purchases.forEach(e => {
            const items = (e.payload as any)?.items;
            if (!Array.isArray(items)) return;
            items.forEach((item: any) => {
                if (!item?.id) return;
                const rec = productSales[item.id] || (productSales[item.id] = { id: item.id, name: item.name || 'Unknown', count: 0, revenue: 0 });
                rec.count += item.quantity || 1;
                rec.revenue += (item.price || 0) * (item.quantity || 1);
            });
        });
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const recentOrdersRaw = await db.select({
            id: orders.id,
            totalAmount: orders.totalAmount,
            status: orders.status,
            firstName: customers.firstName,
            lastName: customers.lastName,
            email: customers.email,
            createdAt: orders.createdAt,
        }).from(orders)
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .orderBy(desc(orders.createdAt))
            .limit(8);

        const recentOrders = recentOrdersRaw.map(o => ({
            id: o.id,
            total: (o.totalAmount || 0) / 100,
            status: o.status || 'pending',
            customer: [o.firstName, o.lastName].filter(Boolean).join(' ') || o.email || '—',
            createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
        }));

        const lastPurchase = purchases[purchases.length - 1];
        const currencyCode = (lastPurchase?.payload as any)?.currency === 'INR' ? 'INR' : 'USD';
        const currencySymbol = currencyCode === 'INR' ? '₹' : '$';

        const hourlyActivity = [...Array(24)].map((_, h) => ({
            hour: h,
            count: periodEvents.filter(e => e.timestamp.getHours() === h).length,
        }));

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayRevenue: Record<string, number> = {};
        periodEvents
            .filter(e => e.eventType === 'purchase')
            .forEach(e => {
                const day = dayNames[e.timestamp.getDay()];
                dayRevenue[day] = (dayRevenue[day] || 0) + ((e.payload as any)?.total || 0);
            });
        const peakDay = Object.entries(dayRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        const referrerCounts: Record<string, number> = {};
        periodEvents
            .filter(e => e.eventType === 'page_view')
            .forEach(e => {
                const ref = (e.payload as any)?.referrer;
                let channel = 'Direct / Unknown';
                if (ref) {
                    try {
                        const url = new URL(ref);
                        if (url.hostname.includes('google')) channel = 'Google Search';
                        else if (url.hostname.includes('instagram')) channel = 'Instagram';
                        else if (url.hostname.includes('facebook')) channel = 'Facebook';
                        else if (url.hostname.includes('t.co') || url.hostname.includes('twitter')) channel = 'Twitter / X';
                        else if (url.hostname.includes('pinterest')) channel = 'Pinterest';
                        else if (url.hostname.includes('tiktok')) channel = 'TikTok';
                        else channel = url.hostname;
                    } catch {
                        channel = 'Other';
                    }
                }
                referrerCounts[channel] = (referrerCounts[channel] || 0) + 1;
            });
        const topChannels = Object.entries(referrerCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const insights: AdminDashboardData['insights'] = [];

        const hourCounts: Record<number, number> = {};
        periodEvents.forEach(e => {
            const h = e.timestamp.getHours();
            hourCounts[h] = (hourCounts[h] || 0) + 1;
        });
        const peakEntry = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
        if (peakEntry) {
            const h = Number(peakEntry[0]);
            const label = `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
            insights.push({
                kind: 'info',
                title: 'Peak engagement window',
                detail: `Most activity lands around ${label}. Time launches, drops and email sends to this window to maximise reach.`,
            });
        }

        if (topProducts.length) {
            const best = topProducts[0];
            insights.push({
                kind: 'positive',
                title: 'Top revenue driver',
                detail: `“${best.name}” is your biggest seller this period (${currencySymbol}${best.revenue.toFixed(2)} across ${best.count} units). Keep it front and centre.`,
            });
        }

        const checkoutSessions = new Set(periodEvents.filter(e => e.eventType === 'begin_checkout').map(e => e.sessionId));
        const purchasedSessions = new Set(purchases.map(e => e.sessionId));
        const abandoned = [...checkoutSessions].filter(sid => !purchasedSessions.has(sid)).length;
        if (abandoned > 0) {
            insights.push({
                kind: 'danger',
                title: 'Recoverable revenue',
                detail: `${abandoned} session${abandoned === 1 ? '' : 's'} reached checkout without converting. A recovery email or retargeting push could reclaim these.`,
            });
        }

        if (visitors > 0 && conversionRate < 1) {
            insights.push({
                kind: 'warning',
                title: 'Conversion below 1%',
                detail: `Current conversion sits at ${conversionRate.toFixed(1)}%. Audit checkout friction, shipping costs and pricing to lift it.`,
            });
        }

        return {
            range: rangeDays,
            currencySymbol,
            period: {
                revenue: Math.round(revenue * 100) / 100,
                orders: ordersCount,
                visitors,
                cartAdds,
                checkouts,
                purchases: ordersCount,
                aov: Math.round(aov * 100) / 100,
                conversionRate: Math.round(conversionRate * 100) / 100,
            },
            previous: {
                revenue: Math.round(prevRevenue * 100) / 100,
                orders: prevOrders,
                visitors: prevVisitors,
                purchases: prevOrders,
                aov: Math.round(prevAov * 100) / 100,
                conversionRate: Math.round(prevConversionRate * 100) / 100,
            },
            series,
            funnel,
            topProducts,
            recentOrders,
            insights,
            hourlyActivity,
            peakDay,
            topChannels,
        };
    } catch (error) {
        console.error('Failed to fetch admin dashboard:', error);
        return null;
    }
}

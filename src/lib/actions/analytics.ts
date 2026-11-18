'use server';

import { db } from '@/db';
import { userEvents, sessions, visitors } from '@/db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/profile';

const SESSION_COOKIE_NAME = 'lowrel_session_id';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getSessionId() {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        // Set session cookie for 30 days
        cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }

    return sessionId;
}

export type EventType = 'page_view' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'remove_from_cart' | 'search' | 'wishlist_add';

interface TrackEventParams {
    eventType: EventType;
    path?: string;
    payload?: any;
}

/**
 * Stores only the pathname + query string so journeys are consistent even
 * when callers pass absolute URLs (checkout pages currently do).
 */
function normalizePath(input?: string | null): string {
    if (!input) return '/';
    try {
        if (input.startsWith('http://') || input.startsWith('https://')) {
            const url = new URL(input);
            return `${url.pathname}${url.search}`;
        }
    } catch {
        // fall through
    }
    return input.startsWith('/') ? input : `/${input}`;
}

export async function trackEvent({ eventType, path, payload }: TrackEventParams) {
    try {
        const sessionId = await getSessionId();
        const cookieStore = await cookies();
        const headerList = await headers();
        const currentPath = normalizePath(path || headerList.get('referer'));

        const rawVisitorId = cookieStore.get('visitor_id')?.value;
        const visitorId = rawVisitorId && UUID_RE.test(rawVisitorId) ? rawVisitorId : null;

        // Get current user if logged in (Supabase Auth)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Keep the CRM profile row in sync so identity joins never break
        if (user) {
            await ensureProfile(user);
        }

        // PageTracker and TrackingProvider fire concurrently on mount, so the
        // visitor row may not exist yet. Upsert a stub first, otherwise the
        // user_events -> visitors foreign key drops the very first event.
        if (visitorId) {
            try {
                await db.insert(visitors).values({ id: visitorId }).onConflictDoNothing();
            } catch (visitorError) {
                console.error('[analytics] Failed to ensure visitor row:', visitorError);
            }
        }

        // Check if this session is already linked to a CRM Customer
        const existingLink = await db.query.userEvents.findFirst({
            where: and(eq(userEvents.sessionId, sessionId), isNotNull(userEvents.customerId)),
            columns: { customerId: true }
        });
        const crmCustomerId = existingLink?.customerId || null;

        await db.insert(userEvents).values({
            sessionId: sessionId,
            userId: user?.id || null,
            customerId: crmCustomerId,
            visitorId,
            eventType: eventType,
            path: currentPath,
            payload: payload || {},
        });

        // Upsert the session row (first page = landing page, latest = exit page)
        try {
            const now = new Date();
            const ip = (headerList.get('x-forwarded-for') || '').split(',')[0].trim() || null;
            const country = headerList.get('x-vercel-ip-country');
            const region = headerList.get('x-vercel-ip-region');
            const city = headerList.get('x-vercel-ip-city');
            const referrer = typeof payload?.referrer === 'string' ? payload.referrer : null;

            await db
                .insert(sessions)
                .values({
                    id: sessionId,
                    visitorId,
                    customerId: crmCustomerId,
                    userId: user?.id || null,
                    landingPath: currentPath,
                    exitPath: currentPath,
                    referrer,
                    userAgent: headerList.get('user-agent'),
                    ipAddress: ip,
                    country,
                    region,
                    city,
                    pageViews: eventType === 'page_view' ? 1 : 0,
                    eventCount: 1,
                    startedAt: now,
                    lastSeenAt: now,
                })
                .onConflictDoUpdate({
                    target: sessions.id,
                    set: {
                        exitPath: currentPath,
                        lastSeenAt: now,
                        pageViews: sql`${sessions.pageViews} + ${eventType === 'page_view' ? 1 : 0}`,
                        eventCount: sql`${sessions.eventCount} + 1`,
                        ...(visitorId ? { visitorId } : {}),
                        ...(crmCustomerId ? { customerId: crmCustomerId } : {}),
                        ...(user?.id ? { userId: user.id } : {}),
                    },
                });
        } catch (sessionError) {
            // Session bookkeeping must never lose the event itself
            console.error('[analytics] Failed to upsert session:', sessionError);
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to track event:', error);
        // Don't throw - analytics shouldn't break the app
        return { success: false, error: 'Failed to log event' };
    }
}

'use server';

import { db } from '@/db';
import { userEvents } from '@/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const SESSION_COOKIE_NAME = 'lowrel_session_id';

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

export async function trackEvent({ eventType, path, payload }: TrackEventParams) {
    try {
        const sessionId = await getSessionId();
        const headerList = await headers();
        const currentPath = path || headerList.get('referer') || '/';

        // Get current user if logged in (Supabase Auth)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

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
            eventType: eventType,
            path: currentPath,
            payload: payload || {},
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to track event:', error);
        // Don't throw - analytics shouldn't break the app
        return { success: false, error: 'Failed to log event' };
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { visitors } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { sql, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const visitorId = request.cookies.get('visitor_id')?.value;
        const userAgent = request.headers.get('user-agent');
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const country = request.headers.get('x-vercel-ip-country');
        const region = request.headers.get('x-vercel-ip-region');
        const city = request.headers.get('x-vercel-ip-city');

        const body = await request.json().catch(() => ({}));
        const path = body.path || '/';

        if (!visitorId) {
            return NextResponse.json({ error: 'No visitor ID found' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const locationData = {
            country,
            region,
            city,
        };

        // Check if visitor exists to determine if we insert or update
        // Actually onConflictDoUpdate is better

        await db.insert(visitors).values({
            id: visitorId,
            profileId: user?.id || null,
            ipAddress: ip,
            userAgent: userAgent,
            location: locationData,
            visitCount: 1,
            lastSeenAt: new Date(),
        }).onConflictDoUpdate({
            target: visitors.id,
            set: {
                profileId: user?.id || sql`visitors.profile_id`, // Update profile if user logs in, else keep existing
                ipAddress: ip,
                userAgent: userAgent,
                location: locationData,
                visitCount: sql`${visitors.visitCount} + 1`,
                lastSeenAt: new Date(),
            }
        });

        // Use eq to conditionally update profile_id if user is currently logged in, 
        // effectively linking the anonymous visitor to the user.
        // The above onConflictDoUpdate logic:
        // user?.id || sql`visitors.profile_id` 
        // If user is logged in (user.id exists), update profileId.
        // If user is NOT logged in (user is null), keep the existing profileId (do not overwrite with null if it was already set).

        // However, if user?.id is undefined, the SQL might be: profileId: NULL || existing.
        // If user is null, we want to Keep existing.
        // syntax in JS: user?.id ? user.id : sql`visitors.profile_id`

        // Let's refine the Update Set object.

        const cookieConsent = request.cookies.get('cookie_consent')?.value;
        const consentGiven = cookieConsent === 'all' || cookieConsent === 'true';
        const consentStatus = cookieConsent || 'pending';

        const updateSet: any = {
            ipAddress: ip,
            userAgent: userAgent,
            location: locationData,
            visitCount: sql`${visitors.visitCount} + 1`,
            lastSeenAt: new Date(),
            consentGiven: consentGiven,
            meta: sql`jsonb_set(
                COALESCE(${visitors.meta}, '{}'::jsonb), 
                '{consent_status}', 
                ${JSON.stringify(consentStatus)}::jsonb
            )`
        };

        if (user?.id) {
            updateSet.profileId = user.id;
        }

        await db.insert(visitors).values({
            id: visitorId,
            profileId: user?.id || null,
            ipAddress: ip,
            userAgent: userAgent,
            location: locationData,
            visitCount: 1,
            lastSeenAt: new Date(),
            consentGiven: consentGiven,
            meta: { consent_status: consentStatus },
        }).onConflictDoUpdate({
            target: visitors.id,
            set: updateSet
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Tracking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

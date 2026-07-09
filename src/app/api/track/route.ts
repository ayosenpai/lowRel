import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { visitors, profiles } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const visitorId = request.cookies.get('visitor_id')?.value;
        const userAgent = request.headers.get('user-agent');
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const country = request.headers.get('x-vercel-ip-country');
        const region = request.headers.get('x-vercel-ip-region');
        const city = request.headers.get('x-vercel-ip-city');

        const body = await request.json().catch(() => ({}));

        if (!visitorId) {
            return NextResponse.json({ error: 'No visitor ID found' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Ensure user profile exists in database if they are logged in via Supabase Auth
        // to prevent foreign key errors with visitor profile stitching
        if (user?.id) {
            const fullName = user.user_metadata?.full_name || '';
            const [firstName, ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ');

            await db.insert(profiles).values({
                id: user.id,
                email: user.email || '',
                firstName: firstName || null,
                lastName: lastName || null,
                avatarUrl: user.user_metadata?.avatar_url || null,
                role: 'user',
            }).onConflictDoNothing();
        }

        const locationData = {
            country,
            region,
            city,
        };

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

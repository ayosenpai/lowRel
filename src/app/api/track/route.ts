import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { visitors } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/profile';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Vercel sends geo values URI-encoded (e.g. "San%20Jose")
function decodeGeo(value: string | null): string | null {
    if (!value) return null;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export async function POST(request: NextRequest) {
    try {
        const visitorId = request.cookies.get('visitor_id')?.value;
        const userAgent = request.headers.get('user-agent');
        const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
        const country = decodeGeo(request.headers.get('x-vercel-ip-country'));
        const region = decodeGeo(request.headers.get('x-vercel-ip-region'));
        const city = decodeGeo(request.headers.get('x-vercel-ip-city'));

        if (!visitorId || !UUID_RE.test(visitorId)) {
            return NextResponse.json({ error: 'No visitor ID found' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Keep the profile row in sync (FK target for visitor stitching + reviews)
        if (user?.id) {
            await ensureProfile(user);
        }

        const locationData = { country, region, city };

        const cookieConsent = request.cookies.get('cookie_consent')?.value;
        const consentGiven = cookieConsent === 'all' || cookieConsent === 'true';
        const consentStatus = cookieConsent || 'pending';

        const updateSet: Record<string, unknown> = {
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
            )`,
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

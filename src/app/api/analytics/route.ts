import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/actions/analytics';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventType, path, payload } = body;

        await trackEvent({ eventType, path, payload });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Get the Supabase session update response
    const supabaseResponse = await updateSession(request)

    // Create response based on what updateSession returned
    const response = supabaseResponse || NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // IMPORTANT: Copy over all Supabase cookies to preserve authentication
    if (supabaseResponse) {
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value, {
                ...cookie,
            })
        })
    }

    // Region detection logic
    // In production (Vercel), we have 'x-vercel-ip-country'
    const country = request.headers.get('x-vercel-ip-country') || 'IN'; // Default to IN for local testing
    const region = country === 'IN' ? 'IN' : 'GLOBAL';

    // Visitor Tracking Logic
    let visitorId = request.cookies.get('visitor_id')?.value;
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        response.cookies.set('visitor_id', visitorId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
        });
    }

    // Set a header that our Server Components can read
    response.headers.set('x-region', region);
    response.headers.set('x-visitor-id', visitorId);

    // Also set a cookie for client-side persistence/access if needed
    response.cookies.set('x-region', region, { path: '/' });

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

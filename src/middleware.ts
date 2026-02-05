import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    let response = await updateSession(request)

    // Create a new response if updateSession returned something else or if we need to set headers
    if (!response) {
        response = NextResponse.next()
    }

    // Region detection logic
    // In production (Vercel), we have 'x-vercel-ip-country'
    const country = request.headers.get('x-vercel-ip-country') || 'IN'; // Default to IN for local testing
    const region = country === 'IN' ? 'IN' : 'GLOBAL';

    // Set a header that our Server Components can read
    response.headers.set('x-region', region);

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

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

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
    // Get the Supabase session update response (refreshes auth cookies)
    const supabaseResponse = await updateSession(request)

    // Region detection: on Vercel the country header is populated by the edge.
    // Locally we default to India so prices/currency behave like production.
    const country = request.headers.get('x-vercel-ip-country') || 'IN'
    const region = country === 'IN' ? 'IN' : 'GLOBAL'

    // Visitor identity: stable anonymous id used to stitch journeys
    const existingVisitorId = request.cookies.get('visitor_id')?.value
    const visitorId = existingVisitorId || crypto.randomUUID()

    // Expose both values as REQUEST headers so Server Components / route
    // handlers can read them via headers(). Setting them on the response
    // alone (previous behaviour) is invisible to headers().
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-region', region)
    requestHeaders.set('x-visitor-id', visitorId)

    const response = NextResponse.next({ request: { headers: requestHeaders } })

    // Preserve any cookies refreshed by Supabase
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie)
    })

    if (!existingVisitorId) {
        response.cookies.set('visitor_id', visitorId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

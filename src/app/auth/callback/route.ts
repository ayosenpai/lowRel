
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/profile'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const code = searchParams.get('code')
    const next = (() => {
        const requested = searchParams.get('next') ?? '/'
        // Only allow same-origin relative paths (no protocol-relative URLs)
        return requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'
    })()

    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next
    redirectTo.searchParams.delete('code')
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')

    // Handle OAuth callback (Google, etc.)
    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) await ensureProfile(user)
            return NextResponse.redirect(redirectTo)
        }
    }

    // Handle email OTP verification
    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) await ensureProfile(user)
            return NextResponse.redirect(redirectTo)
        }
    }

    // return the user to an error page with some instructions
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=auth_failed`)
}

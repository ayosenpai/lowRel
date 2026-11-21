
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/profile'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Maintain the profiles row used for identity joins (reviews, CRM)
    if (data.user) {
        await ensureProfile(data.user)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    const headerList = await headers()
    const forwardedHost = headerList.get('x-forwarded-host')
    const forwardedProto = headerList.get('x-forwarded-proto') || 'https'
    const hostOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || hostOrigin || 'http://localhost:3000').replace(/\/$/, '')

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Google sign-in error:', error)
        redirect('/login?error=oauth_failed')
    }

    if (data.url) {
        redirect(data.url)
    }
}

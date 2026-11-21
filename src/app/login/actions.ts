'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/profile'
import { finalizeClaimForCurrentUser } from '@/lib/actions/account'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { normalizeUsername } from '@/lib/username'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Already-authenticated sessions
    const { data: { user: existingUser } } = await supabase.auth.getUser()
    if (existingUser) {
        redirect('/account')
    }

    const identifier = String(formData.get('identifier') || formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')

    if (!identifier || !password) {
        return { error: 'Invalid username or password.' }
    }

    let email = identifier
    if (!identifier.includes('@')) {
        const username = normalizeUsername(identifier)
        const rows = await db
            .select({ email: profiles.email })
            .from(profiles)
            .where(sql`lower(${profiles.username}) = ${username}`)
            .limit(1)
        const resolvedEmail = rows[0]?.email
        if (!resolvedEmail) {
            return { error: 'Invalid username or password.' }
        }
        email = resolvedEmail
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        const msg = (error.message || '').toLowerCase()
        if (msg.includes('email not confirmed')) {
            return { error: 'Please confirm your email before signing in.' }
        }
        return { error: 'Invalid username or password.' }
    }

    if (data.user) {
        await ensureProfile(data.user)
        await finalizeClaimForCurrentUser().catch(() => {})
    }

    revalidatePath('/', 'layout')
    redirect('/account')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const headerList = await headers()
    const forwardedHost = headerList.get('x-forwarded-host')
    const forwardedProto = headerList.get('x-forwarded-proto') || 'https'
    const hostOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || hostOrigin || 'http://localhost:3000').replace(/\/$/, '')

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
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

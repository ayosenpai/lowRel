import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';

export interface AdminUser {
    id: string;
    email: string;
    role: string;
}

export interface AdminAuthResult {
    /** Populated only when the user is authenticated AND has role 'admin'. */
    admin: AdminUser | null;
    /** True when a Supabase session exists, regardless of role. */
    authenticated: boolean;
}

/**
 * Resolves the current Supabase user and their `profiles.role`.
 * Runs on the server (layout / route handlers / server actions).
 */
export async function getAdminUser(): Promise<AdminAuthResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { admin: null, authenticated: false };
    }

    let role: string | null = null;
    try {
        const rows = await db
            .select({ role: profiles.role })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1);
        role = rows[0]?.role ?? null;
    } catch (error) {
        console.error('[admin-auth] Failed to load profile role:', error);
    }

    if (role !== 'admin') {
        return { admin: null, authenticated: true };
    }

    return { admin: { id: user.id, email: user.email ?? '', role }, authenticated: true };
}

/**
 * For server actions and pages: redirects when the caller is not an admin.
 * - Not signed in → /login
 * - Signed in without the admin role → home
 * Uses redirect() so pages never render a raw error boundary and server
 * actions return a redirect response instead of an unhandled error.
 * (Route handlers should use getAdminUser() and return 403 instead.)
 */
export async function requireAdmin(): Promise<AdminUser> {
    const { admin, authenticated } = await getAdminUser();
    if (!admin) {
        redirect(authenticated ? '/' : '/login');
    }
    return admin!;
}

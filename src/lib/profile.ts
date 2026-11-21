import type { User } from '@supabase/supabase-js';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { normalizeUsername } from '@/lib/username';

/**
 * Ensures a `profiles` row exists for a Supabase auth user and keeps the
 * basic fields fresh. This is the single source of truth for "a logged-in
 * user exists in our database" — used on login, auth callback and tracking.
 *
 * Without this, inserts that reference profiles.id (reviews, visitor
 * stitching) fail with a foreign-key error for users who never triggered
 * the tracking route.
 */
export async function ensureProfile(user: User): Promise<void> {
    const fullName = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || '';
    const [firstName, ...lastNameParts] = fullName.split(' ').filter(Boolean);
    const lastName = lastNameParts.join(' ');
    const rawUsername = (user.user_metadata?.username as string) || '';
    const username = rawUsername ? normalizeUsername(rawUsername) : '';
    const safeUsername = username && /^[a-z0-9][a-z0-9_]{2,29}$/.test(username) ? username : null;

    try {
        await db
            .insert(profiles)
            .values({
                id: user.id,
                email: user.email ?? '',
                firstName: firstName || null,
                lastName: lastName || null,
                username: safeUsername,
                avatarUrl: (user.user_metadata?.avatar_url as string) || null,
                role: 'user',
            })
            .onConflictDoUpdate({
                target: profiles.id,
                set: {
                    email: user.email ?? '',
                    avatarUrl: (user.user_metadata?.avatar_url as string) || null,
                    ...(safeUsername ? { username: safeUsername } : {}),
                },
            });
    } catch (error) {
        // Never break the request flow for profile bookkeeping
        console.error('[ensureProfile] Failed to upsert profile:', error);
    }
}

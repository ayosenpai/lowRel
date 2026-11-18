'use server';

import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface NewsletterResult {
    success: boolean;
    error?: string;
}

/**
 * Persists a newsletter signup. Idempotent: re-subscribing an existing email
 * succeeds without creating duplicates.
 */
export async function subscribeToNewsletter(input: {
    email: string;
    source?: string;
}): Promise<NewsletterResult> {
    const email = (input?.email || '').trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
        return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        await db
            .insert(newsletterSubscribers)
            .values({
                email,
                source: input.source || 'popup',
                userId: user?.id ?? null,
            })
            .onConflictDoNothing({ target: newsletterSubscribers.email });

        return { success: true };
    } catch (error) {
        console.error('[newsletter] Failed to store subscriber:', error);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}

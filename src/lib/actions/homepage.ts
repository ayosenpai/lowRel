'use server';

import { asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { homepageSections } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import {
    defaultHomepageSections,
    normalizeHomepageSection,
    normalizeHomepageSections,
    type HomepageSection,
} from '@/lib/homepage-sections';

function rowToSection(
    row: typeof homepageSections.$inferSelect,
    index: number
): HomepageSection | null {
    return normalizeHomepageSection(
        {
            id: row.id,
            type: row.type,
            title: row.title ?? '',
            isVisible: row.isVisible,
            config: row.config,
        },
        index
    );
}

/** Published homepage layout. Falls back to the built-in default when unset. */
export async function getHomepageSections(): Promise<HomepageSection[]> {
    try {
        const rows = await db
            .select()
            .from(homepageSections)
            .orderBy(asc(homepageSections.position));

        if (rows.length === 0) {
            return defaultHomepageSections();
        }

        return rows
            .map((row, index) => rowToSection(row, index))
            .filter((section): section is HomepageSection => section !== null);
    } catch (error) {
        console.error('[homepage] Failed to load layout, using defaults:', error);
        return defaultHomepageSections();
    }
}

/**
 * Replaces the entire homepage layout in one transaction. Called only from the
 * admin editor; input is sanitized so unknown section types/fields are dropped.
 */
export async function saveHomepageSections(
    input: unknown
): Promise<{ success: true; sections: HomepageSection[] }> {
    await requireAdmin();

    const sections = normalizeHomepageSections(input);
    const now = new Date();

    await db.transaction(async (tx) => {
        await tx.delete(homepageSections);

        if (sections.length > 0) {
            await tx.insert(homepageSections).values(
                sections.map((section, index) => ({
                    type: section.type,
                    title: section.title || null,
                    config: section.config as Record<string, unknown>,
                    position: index,
                    isVisible: section.isVisible,
                    createdAt: now,
                    updatedAt: now,
                }))
            );
        }
    });

    revalidatePath('/');
    revalidatePath('/admin/homepage');

    return { success: true, sections: await getHomepageSections() };
}

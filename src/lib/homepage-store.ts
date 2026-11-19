import { asc, desc } from 'drizzle-orm';
import { db } from '@/db';
import { homepageDraft, homepageLayouts } from '@/db/schema';
import {
    normalizeHomepageSections,
    type HomepageLayoutRecord,
    type HomepageSection,
} from '@/lib/homepage-sections';

/**
 * Data access for the homepage draft and saved layout slots.
 *
 * These functions do no auth on their own: callers must be admin-gated (the
 * server actions use requireAdmin, the preview page checks getAdminUser).
 * Keeping them out of the 'use server' action module lets the preview route
 * read the draft during render without going through the action boundary.
 */

export interface HomepageDraftRecord {
    sections: HomepageSection[];
    updatedAt: Date;
}

export async function readHomepageDraft(): Promise<HomepageDraftRecord | null> {
    try {
        const rows = await db.select().from(homepageDraft).limit(1);
        const row = rows[0];
        if (!row) return null;

        return {
            sections: normalizeHomepageSections(row.sections),
            updatedAt: row.updatedAt,
        };
    } catch (error) {
        console.error('[homepage] Failed to load draft:', error);
        return null;
    }
}

export async function readHomepageLayouts(): Promise<HomepageLayoutRecord[]> {
    try {
        const rows = await db
            .select()
            .from(homepageLayouts)
            .orderBy(desc(homepageLayouts.updatedAt), asc(homepageLayouts.name));

        return rows.map((row) => {
            const sections = normalizeHomepageSections(row.sections);
            return {
                id: row.id,
                name: row.name,
                sectionCount: sections.length,
                updatedAt: row.updatedAt.toISOString(),
                sections,
            };
        });
    } catch (error) {
        console.error('[homepage] Failed to load saved layouts:', error);
        return [];
    }
}

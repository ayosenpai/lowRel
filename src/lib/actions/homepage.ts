'use server';

import { asc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { homepageDraft, homepageLayouts, homepageSections } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { readHomepageLayouts } from '@/lib/homepage-store';
import {
    defaultHomepageSections,
    normalizeHomepageSection,
    normalizeHomepageSections,
    type HomepageLayoutRecord,
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

        // Keep the preview draft in lockstep with what was just published.
        await tx
            .insert(homepageDraft)
            .values({
                id: 'current',
                sections: sections as unknown as Record<string, unknown>[],
                updatedAt: now,
            })
            .onConflictDoUpdate({
                target: homepageDraft.id,
                set: {
                    sections: sections as unknown as Record<string, unknown>[],
                    updatedAt: now,
                },
            });
    });

    revalidatePath('/');
    revalidatePath('/admin/homepage');
    revalidatePath('/preview/homepage');

    return { success: true, sections: await getHomepageSections() };
}

/**
 * Stores an unpublished draft so the editor can preview changes without
 * touching the live homepage. Sanitized exactly like a publish.
 */
export async function saveHomepageDraft(input: unknown): Promise<{ updatedAt: string }> {
    await requireAdmin();
    const sections = normalizeHomepageSections(input);
    const now = new Date();

    await db
        .insert(homepageDraft)
        .values({
            id: 'current',
            sections: sections as unknown as Record<string, unknown>[],
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: homepageDraft.id,
            set: {
                sections: sections as unknown as Record<string, unknown>[],
                updatedAt: now,
            },
        });

    return { updatedAt: now.toISOString() };
}

/** All saved layout slots, newest first, with their sections. */
export async function listHomepageLayouts(): Promise<HomepageLayoutRecord[]> {
    await requireAdmin();
    return readHomepageLayouts();
}

/**
 * Saves the editor state as a named layout slot. Names are compared
 * case-insensitively: saving an existing name updates that slot.
 */
export async function saveHomepageLayout(
    name: string,
    input: unknown
): Promise<{ layouts: HomepageLayoutRecord[]; savedId: string }> {
    await requireAdmin();

    const cleanName = String(name ?? '').trim().slice(0, 80);
    if (!cleanName) {
        throw new Error('Give the layout a name first.');
    }

    const sections = normalizeHomepageSections(input);
    const now = new Date();
    const values = sections as unknown as Record<string, unknown>[];

    const existing = await db
        .select({ id: homepageLayouts.id })
        .from(homepageLayouts)
        .where(sql`lower(${homepageLayouts.name}) = lower(${cleanName})`)
        .limit(1);

    let savedId = existing[0]?.id;

    if (savedId) {
        await db
            .update(homepageLayouts)
            .set({ name: cleanName, sections: values, updatedAt: now })
            .where(eq(homepageLayouts.id, savedId));
    } else {
        const inserted = await db
            .insert(homepageLayouts)
            .values({ name: cleanName, sections: values, createdAt: now, updatedAt: now })
            .returning({ id: homepageLayouts.id });
        savedId = inserted[0].id;
    }

    revalidatePath('/admin/homepage');

    return { layouts: await readHomepageLayouts(), savedId };
}

/** Removes a saved layout slot. The published homepage is unaffected. */
export async function deleteHomepageLayout(id: string): Promise<{ layouts: HomepageLayoutRecord[] }> {
    await requireAdmin();

    const layoutId = String(id ?? '').trim();
    if (!layoutId) {
        throw new Error('Missing layout id.');
    }

    await db.delete(homepageLayouts).where(eq(homepageLayouts.id, layoutId));
    revalidatePath('/admin/homepage');

    return { layouts: await readHomepageLayouts() };
}

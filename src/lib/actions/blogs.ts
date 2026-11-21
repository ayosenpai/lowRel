'use server';

import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type BlogPostRecord = typeof blogPosts.$inferSelect;

export interface BlogPostInput {
    title: string;
    slug?: string;
    excerpt?: string | null;
    content?: string | null;
    coverImageUrl?: string | null;
    status?: 'draft' | 'published';
    publishedAt?: string | null;
    position?: number | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function normalizeSlug(value: string) {
    const slug = slugify(value);
    return slug || 'post';
}

function cleanText(value?: string | null) {
    const v = (value ?? '').trim();
    return v.length > 0 ? v : null;
}

function parseDate(value?: string | null): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function revalidateBlogPaths(slug?: string | null) {
    revalidatePath('/blog');
    revalidatePath('/');
    if (slug) revalidatePath(`/blog/${slug}`);
}

function isMissingBlogTableError(error: unknown) {
    const code = (error as any)?.code;
    const message = String((error as any)?.message || '');
    return code === '42P01' || (message.includes('blog_posts') && message.toLowerCase().includes('does not exist'));
}

export async function getPublishedBlogPosts(limit = 20): Promise<BlogPostRecord[]> {
    try {
        return await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.status, 'published'))
            .orderBy(asc(blogPosts.position), desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
            .limit(Math.max(1, Math.min(limit, 100)));
    } catch (error) {
        if (!isMissingBlogTableError(error)) {
            console.error('[blogs] Failed to fetch published posts:', error);
        }
        return [];
    }
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPostRecord | null> {
    const normalized = normalizeSlug(slug);
    try {
        const rows = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.slug, normalized))
            .limit(1);
        const post = rows[0];
        if (!post || post.status !== 'published') return null;
        return post;
    } catch (error) {
        if (!isMissingBlogTableError(error)) {
            console.error('[blogs] Failed to fetch post by slug:', error);
        }
        return null;
    }
}

// --- Admin ---

export async function getAdminBlogPosts(): Promise<BlogPostRecord[]> {
    await requireAdmin();
    try {
        return await db
            .select()
            .from(blogPosts)
            .orderBy(asc(blogPosts.position), desc(blogPosts.updatedAt));
    } catch (error) {
        if (!isMissingBlogTableError(error)) {
            console.error('[blogs] Failed to fetch admin posts:', error);
        }
        return [];
    }
}

export async function getAdminBlogPost(id: string): Promise<BlogPostRecord | null> {
    await requireAdmin();
    try {
        const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
        return rows[0] ?? null;
    } catch (error) {
        if (!isMissingBlogTableError(error)) {
            console.error('[blogs] Failed to fetch admin post:', error);
        }
        return null;
    }
}

export async function upsertBlogPost(
    input: BlogPostInput,
    id?: string
): Promise<{ success: boolean; error?: string; id?: string; slug?: string }> {
    await requireAdmin();

    const title = (input.title || '').trim();
    if (!title) return { success: false, error: 'Title is required.' };
    if (title.length > 160) return { success: false, error: 'Title is too long.' };

    const slug = normalizeSlug(input.slug || title);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return { success: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    }

    const status = input.status === 'published' ? 'published' : 'draft';
    const content = (input.content ?? '').toString();
    const excerpt = cleanText(input.excerpt);
    const coverImageUrl = cleanText(input.coverImageUrl);
    const seoTitle = cleanText(input.seoTitle);
    const seoDescription = cleanText(input.seoDescription);
    const position = Number.isFinite(Number(input.position)) ? Math.max(0, Math.round(Number(input.position))) : 0;

    const publishedAtInput = parseDate(input.publishedAt);
    const publishedAt = status === 'published' ? (publishedAtInput ?? new Date()) : publishedAtInput;

    try {
        if (id) {
            const existingRows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
            const existing = existingRows[0];
            if (!existing) return { success: false, error: 'Post not found.' };

            await db
                .update(blogPosts)
                .set({
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImageUrl,
                    status,
                    publishedAt,
                    position,
                    seoTitle,
                    seoDescription,
                    updatedAt: new Date(),
                })
                .where(eq(blogPosts.id, id));

            revalidateBlogPaths(existing.slug);
            revalidateBlogPaths(slug);
            revalidatePath('/admin/blogs');
            return { success: true, id, slug };
        }

        const rows = await db
            .insert(blogPosts)
            .values({
                title,
                slug,
                excerpt,
                content,
                coverImageUrl,
                status,
                publishedAt,
                position,
                seoTitle,
                seoDescription,
            })
            .returning({ id: blogPosts.id, slug: blogPosts.slug });

        const created = rows[0];
        revalidateBlogPaths(created?.slug);
        revalidatePath('/admin/blogs');
        return { success: true, id: created?.id, slug: created?.slug };
    } catch (error: any) {
        console.error('[blogs] Failed to save post:', error);
        if (error?.code === '23505' || String(error?.message || '').includes('unique')) {
            return { success: false, error: 'A post with this slug already exists.' };
        }
        return { success: false, error: 'Failed to save post.' };
    }
}

export async function deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
    await requireAdmin();
    try {
        const existing = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
        const slug = existing[0]?.slug;
        await db.delete(blogPosts).where(eq(blogPosts.id, id));
        revalidateBlogPaths(slug);
        revalidatePath('/admin/blogs');
        return { success: true };
    } catch (error) {
        console.error('[blogs] Failed to delete post:', error);
        return { success: false, error: 'Failed to delete post.' };
    }
}

export async function setBlogPostStatus(
    id: string,
    status: 'draft' | 'published'
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin();
    try {
        const existingRows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
        const existing = existingRows[0];
        if (!existing) return { success: false, error: 'Post not found.' };
        const nextStatus = status === 'published' ? 'published' : 'draft';
        await db
            .update(blogPosts)
            .set({
                status: nextStatus,
                publishedAt: nextStatus === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
                updatedAt: new Date(),
            })
            .where(eq(blogPosts.id, id));
        revalidateBlogPaths(existing.slug);
        revalidatePath('/admin/blogs');
        return { success: true };
    } catch (error) {
        console.error('[blogs] Failed to update status:', error);
        return { success: false, error: 'Failed to update post status.' };
    }
}

export async function reorderBlogPosts(
    orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin();
    try {
        await db.transaction(async (tx) => {
            for (let i = 0; i < orderedIds.length; i++) {
                const id = orderedIds[i];
                await tx
                    .update(blogPosts)
                    .set({ position: i, updatedAt: new Date() })
                    .where(eq(blogPosts.id, id));
            }
        });
        revalidateBlogPaths();
        revalidatePath('/admin/blogs');
        return { success: true };
    } catch (error) {
        console.error('[blogs] Failed to reorder posts:', error);
        return { success: false, error: 'Failed to reorder posts.' };
    }
}

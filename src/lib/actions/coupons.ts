'use server';

import { db } from '@/db';
import { coupons } from '@/db/schema';
import { and, desc, eq, or, lte, gte, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';

export type CouponRecord = typeof coupons.$inferSelect;

export interface CouponValidation {
    valid: boolean;
    code?: string;
    type?: 'percent';
    value?: number; // percent (e.g. 15)
    rate?: number; // 0..1
    message?: string;
}

function normalizeCode(code: string) {
    return (code || '').toUpperCase().trim();
}

export async function validateCouponCode(code: string): Promise<CouponValidation> {
    const normalized = normalizeCode(code);
    if (!normalized) {
        return { valid: false, message: 'Enter a discount code.' };
    }

    try {
        const rows = await db
            .select()
            .from(coupons)
            .where(eq(coupons.code, normalized))
            .limit(1);

        const coupon = rows[0];
        if (!coupon || !coupon.isActive) {
            return { valid: false, message: 'Invalid discount code.' };
        }

        const now = new Date();
        if (coupon.startsAt && coupon.startsAt > now) {
            return { valid: false, message: 'This code is not active yet.' };
        }
        if (coupon.expiresAt && coupon.expiresAt < now) {
            return { valid: false, message: 'This code has expired.' };
        }
        if (
            coupon.maxUses != null &&
            (coupon.usedCount ?? 0) >= coupon.maxUses
        ) {
            return { valid: false, message: 'This code has reached its usage limit.' };
        }
        if (coupon.type !== 'percent' || !Number.isFinite(coupon.value) || coupon.value <= 0) {
            return { valid: false, message: 'This code is not valid.' };
        }

        const value = Math.min(100, Math.max(1, Math.round(coupon.value)));
        return {
            valid: true,
            code: coupon.code,
            type: 'percent',
            value,
            rate: value / 100,
        };
    } catch (error) {
        console.error('[coupons] Failed to validate code:', error);
        return { valid: false, message: 'Could not validate this code. Try again.' };
    }
}

/** Returns the discount rate (0..1) for server-side order totals. */
export async function getDiscountRateForCode(code?: string | null): Promise<number> {
    if (!code) return 0;
    const result = await validateCouponCode(code);
    return result.valid ? result.rate ?? 0 : 0;
}

export async function getActivePromoCoupon(): Promise<CouponRecord | null> {
    try {
        const now = new Date();
        const rows = await db
            .select()
            .from(coupons)
            .where(
                and(
                    eq(coupons.isActive, true),
                    or(isNull(coupons.startsAt), lte(coupons.startsAt, now)),
                    or(isNull(coupons.expiresAt), gte(coupons.expiresAt, now))
                )
            )
            .orderBy(desc(coupons.createdAt))
            .limit(10);

        const usable = rows.find(
            (c) => c.maxUses == null || (c.usedCount ?? 0) < c.maxUses
        );
        return usable ?? null;
    } catch (error) {
        console.error('[coupons] Failed to fetch promo coupon:', error);
        return null;
    }
}

// --- Admin ---

export async function getAdminCoupons(): Promise<CouponRecord[]> {
    await requireAdmin();
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function getCouponById(id: string): Promise<CouponRecord | null> {
    await requireAdmin();
    const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    return rows[0] ?? null;
}

export interface CouponInput {
    code: string;
    description?: string;
    value: number; // percent
    isActive?: boolean;
    startsAt?: string | null;
    expiresAt?: string | null;
    maxUses?: number | null;
}

function parseDate(value?: string | null): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

export async function upsertCoupon(
    input: CouponInput,
    id?: string
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin();

    const code = normalizeCode(input.code);
    if (!code || !/^[A-Z0-9_-]{2,32}$/.test(code)) {
        return { success: false, error: 'Code must be 2–32 characters (letters, numbers, _ or -).' };
    }

    const value = Math.round(Number(input.value));
    if (!Number.isFinite(value) || value < 1 || value > 100) {
        return { success: false, error: 'Discount must be between 1% and 100%.' };
    }

    const startsAt = parseDate(input.startsAt);
    const expiresAt = parseDate(input.expiresAt);
    if (startsAt && expiresAt && expiresAt < startsAt) {
        return { success: false, error: 'End date must be after start date.' };
    }

    const maxUses =
        input.maxUses == null || input.maxUses === ('' as any)
            ? null
            : Math.max(1, Math.round(Number(input.maxUses)));

    try {
        if (id) {
            await db
                .update(coupons)
                .set({
                    code,
                    description: input.description?.trim() || null,
                    type: 'percent',
                    value,
                    isActive: input.isActive ?? true,
                    startsAt,
                    expiresAt,
                    maxUses,
                    updatedAt: new Date(),
                })
                .where(eq(coupons.id, id));
        } else {
            await db.insert(coupons).values({
                code,
                description: input.description?.trim() || null,
                type: 'percent',
                value,
                isActive: input.isActive ?? true,
                startsAt,
                expiresAt,
                maxUses,
                usedCount: 0,
            });
        }

        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error: any) {
        console.error('[coupons] Failed to save coupon:', error);
        if (error?.code === '23505' || String(error?.message || '').includes('unique')) {
            return { success: false, error: 'A coupon with this code already exists.' };
        }
        return { success: false, error: 'Failed to save coupon.' };
    }
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
    await requireAdmin();
    try {
        await db.delete(coupons).where(eq(coupons.id, id));
        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error) {
        console.error('[coupons] Failed to delete coupon:', error);
        return { success: false, error: 'Failed to delete coupon.' };
    }
}

export async function toggleCouponActive(
    id: string,
    isActive: boolean
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin();
    try {
        await db
            .update(coupons)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(coupons.id, id));
        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error) {
        console.error('[coupons] Failed to toggle coupon:', error);
        return { success: false, error: 'Failed to update coupon.' };
    }
}

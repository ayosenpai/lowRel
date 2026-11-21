'use server';

import { cookies, headers } from 'next/headers';
import { and, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { customers, orders, profiles } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { hashClaimToken } from '@/lib/claim-token';
import { getUsernameValidationError, normalizeUsername } from '@/lib/username';

const CLAIM_COOKIE = 'lowrel_claims';
const LEGACY_CLAIM_COOKIE = 'lowrel_claim';
const MAX_CLAIM_COOKIES = 5;

type ClaimState = 'claimable' | 'claimed' | 'expired' | 'pending_payment' | 'invalid' | 'email_mismatch';

function maskEmail(email: string | null | undefined): string | null {
    if (!email || !email.includes('@')) return null;
    const [local, domain] = email.split('@');
    if (!local) return `***@${domain}`;
    const start = local.slice(0, 1);
    const end = local.length > 1 ? local.slice(-1) : '';
    return `${start}${'*'.repeat(Math.max(2, local.length - 2))}${end}@${domain}`;
}

function readClaimTokens(cookieStore: Awaited<ReturnType<typeof cookies>>): string[] {
    const tokens: string[] = [];
    const raw = cookieStore.get(CLAIM_COOKIE)?.value;
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                for (const t of parsed) if (typeof t === 'string' && t) tokens.push(t);
            }
        } catch {
            // ignore malformed cookie
        }
    }
    const legacy = cookieStore.get(LEGACY_CLAIM_COOKIE)?.value;
    if (legacy) tokens.push(legacy);
    return [...new Set(tokens)].slice(0, MAX_CLAIM_COOKIES);
}

function writeClaimTokens(cookieStore: Awaited<ReturnType<typeof cookies>>, tokens: string[]) {
    const unique = [...new Set(tokens.filter(Boolean))].slice(-MAX_CLAIM_COOKIES);
    const opts = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 };
    if (unique.length > 0) cookieStore.set(CLAIM_COOKIE, JSON.stringify(unique), opts);
    else cookieStore.set(CLAIM_COOKIE, '', { ...opts, maxAge: 0 });
    // clear legacy cookie
    cookieStore.set(LEGACY_CLAIM_COOKIE, '', { ...opts, maxAge: 0 });
}

async function getClaimOrdersFromCookie() {
    const cookieStore = await cookies();
    const rawTokens = readClaimTokens(cookieStore);
    if (rawTokens.length === 0) return [];

    const tokenHashes = rawTokens.map(hashClaimToken);
    const rows = await db
        .select({
            id: orders.id,
            status: orders.status,
            currency: orders.currency,
            totalAmount: orders.totalAmount,
            createdAt: orders.createdAt,
            customerId: orders.customerId,
            profileId: orders.profileId,
            claimTokenHash: orders.claimTokenHash,
            claimTokenExpiresAt: orders.claimTokenExpiresAt,
            claimedAt: orders.claimedAt,
            customerEmail: customers.email,
        })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .where(inArray(orders.claimTokenHash, tokenHashes));

    const byHash = new Map(rows.map((r) => [r.claimTokenHash, r]));
    return rawTokens.map((rawToken) => {
        const hash = hashClaimToken(rawToken);
        const order = byHash.get(hash) ?? null;
        return { rawToken, tokenHash: hash, order };
    });
}

type ClaimOrder = Awaited<ReturnType<typeof getClaimOrdersFromCookie>>[number]['order'];

function getClaimState(order: ClaimOrder, userEmail?: string | null): ClaimState {
    if (!order) return 'invalid';
    if (order.claimedAt || order.profileId) return 'claimed';
    if (!order.claimTokenHash || !order.claimTokenExpiresAt) return 'invalid';
    if (order.claimTokenExpiresAt.getTime() <= Date.now()) return 'expired';
    if (!['paid', 'shipped', 'completed'].includes(order.status ?? '')) return 'pending_payment';
    if (userEmail && order.customerEmail && userEmail.toLowerCase() !== order.customerEmail.toLowerCase()) return 'email_mismatch';
    return 'claimable';
}

function pickPrimaryClaim(candidates: Array<{ rawToken: string; order: any }>, userEmail?: string | null) {
    const ranked = ['claimable', 'pending_payment', 'claimed', 'expired', 'email_mismatch', 'invalid'] as const;
    const withState = candidates.map((c) => ({ ...c, state: getClaimState(c.order, userEmail) }));
    for (const state of ranked) {
        const found = withState.find((c) => c.state === state);
        if (found) return found;
    }
    return null;
}

export async function getClaimStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const candidates = await getClaimOrdersFromCookie();
    const primary = pickPrimaryClaim(candidates, user?.email);

    if (!primary || !primary.order || primary.state === 'invalid') {
        return { state: 'invalid' as const };
    }

    return {
        state: primary.state,
        orderReference: primary.order.id.slice(0, 8).toUpperCase(),
        email: maskEmail(primary.order.customerEmail),
        totalAmount: primary.order.totalAmount,
        currency: primary.order.currency,
        canClaim: primary.state === 'claimable',
        isAuthenticated: !!user,
        pendingClaimCount: candidates.filter((c) => getClaimState(c.order, user?.email) === 'claimable').length,
    };
}

export async function claimOrderWithUsername(input: { username: string; password: string }) {
    const username = normalizeUsername(input.username || '');
    const password = input.password || '';
    const usernameError = getUsernameValidationError(username);
    if (usernameError) return { error: usernameError };
    if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const candidates = await getClaimOrdersFromCookie();
    const primary = pickPrimaryClaim(candidates, currentUser?.email);
    const order = primary?.order ?? null;
    const state = primary?.state ?? 'invalid';
    if (!order || state === 'invalid' || state === 'expired') {
        return { error: 'This claim link is invalid or expired.' };
    }
    if (state === 'claimed') {
        return { error: 'This order has already been claimed.' };
    }
    if (state === 'pending_payment') {
        return { error: 'Order payment is not confirmed yet.' };
    }
    if (state === 'email_mismatch') {
        return { error: 'This account cannot claim this order.' };
    }
    if (!order.customerEmail) {
        return { error: 'Unable to claim this order. Please contact support.' };
    }

    const existingUsername = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(sql`lower(${profiles.username}) = ${username}`)
        .limit(1);
    if (existingUsername[0] && existingUsername[0].id !== currentUser?.id) {
        return { error: 'That username is not available.' };
    }

    const headerList = await headers();
    const forwardedHost = headerList.get('x-forwarded-host');
    const forwardedProto = headerList.get('x-forwarded-proto') || 'https';
    const hostOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null;
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || hostOrigin || 'http://localhost:3000').replace(/\/$/, '');

    let authUser = currentUser;
    if (!authUser) {
        const { data, error } = await supabase.auth.signUp({
            email: order.customerEmail,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback?next=/claim-order`,
                data: { username, full_name: username },
            },
        });
        if (error) {
            const msg = error.message?.toLowerCase().includes('already registered')
                ? 'An account already exists for this order email. Please log in to claim it.'
                : 'Unable to create account. Please try again.';
            return { error: msg };
        }
        authUser = data.user ?? null;
        if (!data.session) {
            if (authUser) {
                await db.insert(profiles).values({
                    id: authUser.id,
                    email: order.customerEmail,
                    username,
                    role: 'user',
                }).onConflictDoUpdate({
                    target: profiles.id,
                    set: { email: order.customerEmail, username },
                });
            }
            return { success: true, needsEmailConfirmation: true, email: maskEmail(order.customerEmail) };
        }
    }

    if (!authUser) return { error: 'Unable to authenticate account.' };
    if (authUser.email?.toLowerCase() !== order.customerEmail.toLowerCase()) {
        return { error: 'This account cannot claim this order.' };
    }

    const claimResult = await finalizeClaimRecord(order.id, authUser.id, authUser.email ?? order.customerEmail, username);
    if (!claimResult.ok) return { error: claimResult.error };

    const cookieStore = await cookies();
    const remaining = readClaimTokens(cookieStore).filter((t) => hashClaimToken(t) !== order.claimTokenHash);
    writeClaimTokens(cookieStore, remaining);

    return { success: true, claimed: true };
}

async function finalizeClaimRecord(orderId: string, profileId: string, email: string, username: string) {
    const normalizedUsername = normalizeUsername(username);

    return db.transaction(async (tx) => {
        const [order] = await tx
            .select({
                id: orders.id,
                status: orders.status,
                customerEmail: customers.email,
                claimTokenHash: orders.claimTokenHash,
                claimTokenExpiresAt: orders.claimTokenExpiresAt,
                claimedAt: orders.claimedAt,
                profileId: orders.profileId,
            })
            .from(orders)
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!order) return { ok: false as const, error: 'Order not found.' };
        if (order.claimedAt || order.profileId) return { ok: false as const, error: 'This order has already been claimed.' };
        if (!order.claimTokenHash || !order.claimTokenExpiresAt || order.claimTokenExpiresAt.getTime() <= Date.now()) {
            return { ok: false as const, error: 'This claim link is invalid or expired.' };
        }
        if (!['paid', 'shipped', 'completed'].includes(order.status ?? '')) {
            return { ok: false as const, error: 'Order payment is not confirmed yet.' };
        }
        if (!order.customerEmail || order.customerEmail.toLowerCase() !== email.toLowerCase()) {
            return { ok: false as const, error: 'This account cannot claim this order.' };
        }

        await tx.insert(profiles).values({
            id: profileId,
            email,
            username: normalizedUsername,
            role: 'user',
        }).onConflictDoUpdate({
            target: profiles.id,
            set: { email, username: normalizedUsername },
        });

        const claimed = await tx
            .update(orders)
            .set({
                profileId,
                claimedAt: new Date(),
                claimTokenHash: null,
                claimTokenExpiresAt: null,
                updatedAt: new Date(),
            })
            .where(and(
                eq(orders.id, orderId),
                isNull(orders.claimedAt),
                isNull(orders.profileId),
                eq(orders.claimTokenHash, order.claimTokenHash),
                gt(orders.claimTokenExpiresAt, new Date()),
                or(eq(orders.status, 'paid'), eq(orders.status, 'shipped'), eq(orders.status, 'completed'))
            ))
            .returning({ id: orders.id });

        if (claimed.length === 0) {
            return { ok: false as const, error: 'This order could not be claimed.' };
        }

        return { ok: true as const };
    });
}

export async function finalizeClaimForCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return { ok: false as const };

    const cookieStore = await cookies();
    const candidates = readClaimTokens(cookieStore).map((rawToken) => ({ rawToken, tokenHash: hashClaimToken(rawToken) }));
    if (candidates.length === 0) return { ok: false as const };

    const hashes = candidates.map((c) => c.tokenHash);
    const rows = await db
        .select({
            id: orders.id,
            status: orders.status,
            claimedAt: orders.claimedAt,
            profileId: orders.profileId,
            claimTokenHash: orders.claimTokenHash,
            claimTokenExpiresAt: orders.claimTokenExpiresAt,
            customerEmail: customers.email,
        })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .where(inArray(orders.claimTokenHash, hashes));

    const byHash = new Map(rows.map((r) => [r.claimTokenHash, r]));
    for (const c of candidates) {
        const order = byHash.get(c.tokenHash);
        if (!order) continue;
        if (order.claimedAt || order.profileId) continue;
        if (!order.claimTokenExpiresAt || order.claimTokenExpiresAt.getTime() <= Date.now()) continue;
        if (!['paid', 'shipped', 'completed'].includes(order.status ?? '')) continue;
        if (!order.customerEmail || order.customerEmail.toLowerCase() !== user.email.toLowerCase()) continue;

        const username = normalizeUsername((user.user_metadata?.username as string) || user.email.split('@')[0] || 'user');
        const safeUsername = username.replace(/[^a-z0-9_]/g, '').slice(0, 30) || `user${Date.now().toString().slice(-6)}`;
        const result = await finalizeClaimRecord(order.id, user.id, user.email, safeUsername);
        if (result.ok) {
            try {
                const remaining = readClaimTokens(cookieStore).filter((t) => hashClaimToken(t) !== c.tokenHash);
                writeClaimTokens(cookieStore, remaining);
            } catch {
                // Cookie mutation may be unavailable in Server Components; claim is already persisted.
            }
            return result;
        }
    }

    return { ok: false as const };
}

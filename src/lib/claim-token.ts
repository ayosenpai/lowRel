import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const CLAIM_TOKEN_BYTES = 32;
const CLAIM_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function createClaimToken() {
    const rawToken = randomBytes(CLAIM_TOKEN_BYTES).toString('base64url');
    return {
        rawToken,
        tokenHash: hashClaimToken(rawToken),
        expiresAt: new Date(Date.now() + CLAIM_TOKEN_TTL_MS),
    };
}

export function hashClaimToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
}

export function verifyClaimToken(rawToken: string, expectedHash: string): boolean {
    const actual = Buffer.from(hashClaimToken(rawToken), 'utf8');
    const expected = Buffer.from(expectedHash, 'utf8');
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
}

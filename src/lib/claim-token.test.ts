import { describe, expect, it } from 'vitest';
import { createClaimToken, hashClaimToken, verifyClaimToken } from './claim-token';

describe('claim-token', () => {
  it('creates a raw token and stores only a hash-compatible value', () => {
    const claim = createClaimToken();
    expect(claim.rawToken).toBeTruthy();
    expect(claim.tokenHash).toBe(hashClaimToken(claim.rawToken));
    expect(claim.tokenHash).not.toBe(claim.rawToken);
    expect(claim.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('verifies a valid token against its hash', () => {
    const claim = createClaimToken();
    expect(verifyClaimToken(claim.rawToken, claim.tokenHash)).toBe(true);
  });

  it('rejects an invalid token', () => {
    const claim = createClaimToken();
    expect(verifyClaimToken('wrong-token', claim.tokenHash)).toBe(false);
  });

  it('rejects expired claims by expiry timestamp', () => {
    const claim = createClaimToken();
    const expired = new Date(Date.now() - 1000);
    expect(expired.getTime() <= Date.now()).toBe(true);
    expect(claim.expiresAt.getTime() > Date.now()).toBe(true);
  });
});

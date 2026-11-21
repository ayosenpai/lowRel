import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCookies = { get: vi.fn(), set: vi.fn() };
const mockHeaders = { get: vi.fn(() => null) };
const dbState: any = { selectRows: [], updateReturning: [], insertCalls: [] };

vi.mock('next/headers', () => ({
  cookies: async () => mockCookies,
  headers: async () => mockHeaders,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1', email: 'buyer@example.com', user_metadata: { username: 'buyer1' } } } }),
      signUp: vi.fn(),
    },
  }),
}));

vi.mock('@/db', () => {
  const makeSelect = (rows: any[]) => {
    const q: any = {};
    q.from = () => q;
    q.leftJoin = () => q;
    q.where = () => q;
    q.limit = async () => rows;
    q.then = (resolve: any, reject: any) => Promise.resolve(rows).then(resolve, reject);
    return q;
  };
  const makeUpdate = () => {
    const q: any = {};
    q.set = () => q;
    q.where = () => q;
    q.returning = async () => dbState.updateReturning;
    return q;
  };
  const makeInsert = () => {
    const q: any = {};
    q.values = (v: any) => { dbState.insertCalls.push(v); return q; };
    q.onConflictDoUpdate = async () => ({});
    return q;
  };
  const db = {
    select: () => makeSelect(dbState.selectRows),
    update: () => makeUpdate(),
    insert: () => makeInsert(),
    transaction: async (fn: any) => fn({
      select: () => makeSelect(dbState.selectRows),
      update: () => makeUpdate(),
      insert: () => makeInsert(),
    }),
  };
  return { db };
});

import { finalizeClaimForCurrentUser, getClaimStatus } from './account';
import { hashClaimToken } from '@/lib/claim-token';

describe('account claim actions', () => {
  beforeEach(() => {
    mockCookies.get.mockReset();
    mockCookies.set.mockReset();
    dbState.selectRows = [];
    dbState.updateReturning = [];
    dbState.insertCalls = [];
  });

  it('returns invalid when no claim cookie exists', async () => {
    mockCookies.get.mockReturnValue(undefined);
    const status = await getClaimStatus();
    expect(status.state).toBe('invalid');
  });

  it('rejects wrong-email claim finalization', async () => {
    const raw = 'rawtoken';
    mockCookies.get.mockImplementation((name: string) => name === 'lowrel_claims' ? { value: JSON.stringify([raw]) } : undefined);
    dbState.selectRows = [{
      id: 'order-1', status: 'paid', claimedAt: null, profileId: null,
      claimTokenHash: hashClaimToken(raw), claimTokenExpiresAt: new Date(Date.now() + 60_000),
      customerEmail: 'someoneelse@example.com',
    }];
    const result = await finalizeClaimForCurrentUser();
    expect(result.ok).toBe(false);
  });

  it('rejects expired claim', async () => {
    const raw = 'rawtoken';
    mockCookies.get.mockImplementation((name: string) => name === 'lowrel_claims' ? { value: JSON.stringify([raw]) } : undefined);
    dbState.selectRows = [{
      id: 'order-1', status: 'paid', claimedAt: null, profileId: null,
      claimTokenHash: hashClaimToken(raw), claimTokenExpiresAt: new Date(Date.now() - 60_000),
      customerEmail: 'buyer@example.com',
    }];
    const result = await finalizeClaimForCurrentUser();
    expect(result.ok).toBe(false);
  });

  it('rejects replay when order already claimed', async () => {
    const raw = 'rawtoken';
    mockCookies.get.mockImplementation((name: string) => name === 'lowrel_claims' ? { value: JSON.stringify([raw]) } : undefined);
    dbState.selectRows = [{
      id: 'order-1', status: 'paid', claimedAt: new Date(), profileId: 'user-1',
      claimTokenHash: hashClaimToken(raw), claimTokenExpiresAt: new Date(Date.now() + 60_000),
      customerEmail: 'buyer@example.com',
    }];
    const result = await finalizeClaimForCurrentUser();
    expect(result.ok).toBe(false);
  });

  it('finalizes claim atomically when valid', async () => {
    const raw = 'rawtoken';
    mockCookies.get.mockImplementation((name: string) => name === 'lowrel_claims' ? { value: JSON.stringify([raw]) } : undefined);
    dbState.selectRows = [{
      id: 'order-1', status: 'paid', claimedAt: null, profileId: null,
      claimTokenHash: hashClaimToken(raw), claimTokenExpiresAt: new Date(Date.now() + 60_000),
      customerEmail: 'buyer@example.com',
    }];
    dbState.updateReturning = [{ id: 'order-1' }];
    const result = await finalizeClaimForCurrentUser();
    expect(result.ok).toBe(true);
    expect(mockCookies.set).toHaveBeenCalled();
  });

  it('supports multiple pending order tokens and picks a claimable one', async () => {
    const raw1 = 'rawtoken1';
    const raw2 = 'rawtoken2';
    mockCookies.get.mockImplementation((name: string) => name === 'lowrel_claims' ? { value: JSON.stringify([raw1, raw2]) } : undefined);
    dbState.selectRows = [
      {
        id: 'order-expired', status: 'paid', claimedAt: null, profileId: null,
        claimTokenHash: hashClaimToken(raw1), claimTokenExpiresAt: new Date(Date.now() - 60_000),
        customerEmail: 'buyer@example.com', totalAmount: 100, currency: 'INR', createdAt: new Date(),
      },
      {
        id: 'order-ok', status: 'paid', claimedAt: null, profileId: null,
        claimTokenHash: hashClaimToken(raw2), claimTokenExpiresAt: new Date(Date.now() + 60_000),
        customerEmail: 'buyer@example.com', totalAmount: 200, currency: 'INR', createdAt: new Date(),
      },
    ];
    const status = await getClaimStatus();
    expect(status.state).toBe('claimable');
    expect(status.orderReference).toBe('ORDER-OK'.slice(0, 8));
  });
});

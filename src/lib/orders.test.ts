import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbState: any = { order: null, updateReturning: [], claimed: false };

vi.mock('next/headers', () => ({ headers: async () => ({ get: () => 'IN' }) }));
vi.mock('@/db', () => {
  const makeSelect = () => {
    const q: any = {};
    q.from = () => q;
    q.where = () => q;
    q.limit = async () => (dbState.order ? [dbState.order] : []);
    return q;
  };
  const makeUpdate = () => {
    const q: any = {};
    q.set = (v: any) => { q._set = v; return q; };
    q.where = () => q;
    q.returning = async () => dbState.updateReturning;
    return q;
  };
  return {
    db: {
      transaction: async (fn: any) => fn({
        select: () => makeSelect(),
        update: () => makeUpdate(),
      }),
    },
  };
});
vi.mock('@/db/schema', () => ({ products: {}, orders: { id: 'id', status: 'status', orderId: 'orderId', paymentId: 'paymentId', customerId: 'customerId', discountCode: 'discountCode', totalAmount: 'totalAmount', updatedAt: 'updatedAt' }, orderItems: {}, customers: { id: 'id', totalSpend: 'totalSpend', ordersCount: 'ordersCount', lastSeenAt: 'lastSeenAt' }, coupons: { code: 'code', usedCount: 'usedCount', updatedAt: 'updatedAt', maxUses: 'maxUses' } }));
vi.mock('@/lib/store-config', () => ({ isComingSoon: () => false }));
vi.mock('@/lib/actions/coupons', () => ({ validateCouponCode: async () => ({ valid: false }) }));
vi.mock('@/lib/claim-token', () => ({ createClaimToken: () => ({ rawToken: 't', tokenHash: 'h', expiresAt: new Date() }), hashClaimToken: () => 'h' }));

import { markOrderPaid } from './orders';

describe('markOrderPaid', () => {
  beforeEach(() => {
    dbState.order = { id: 'o1', status: 'pending', customerId: null, discountCode: null, totalAmount: 1000 };
    dbState.updateReturning = [{ id: 'o1' }];
  });

  it('marks pending order paid once (browser-verification first)', async () => {
    const first = await markOrderPaid('rzp_1', 'pay_1');
    expect(first.updated).toBe(true);
    dbState.order.status = 'paid';
    const second = await markOrderPaid('rzp_1', 'pay_1');
    expect(second.updated).toBe(false);
  });

  it('is idempotent when webhook arrives after browser verification', async () => {
    dbState.order.status = 'paid';
    const result = await markOrderPaid('rzp_1', 'pay_webhook');
    expect(result.updated).toBe(false);
    expect(result.missing).toBe(false);
  });

  it('returns missing for unknown order', async () => {
    dbState.order = null;
    const result = await markOrderPaid('missing', 'pay_1');
    expect(result.missing).toBe(true);
  });
});

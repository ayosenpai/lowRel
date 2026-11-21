import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbState: any = { orders: [], items: [] };
const authState: any = { user: { id: 'profile-1' } };

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: authState.user } }) },
  }),
}));

vi.mock('@/db', () => {
  const makeSelect = () => {
    const q: any = {};
    q.from = () => q;
    q.where = () => q;
    q.orderBy = () => q;
    q.limit = async () => dbState.orders;
    q.then = (resolve: any, reject: any) => Promise.resolve(dbState.orders).then(resolve, reject);
    return q;
  };
  return {
    db: {
      select: (shape: any) => {
        // first select returns orders, second returns items
        const isItems = shape && shape.orderId;
        const rows = isItems ? dbState.items : dbState.orders;
        const q: any = {};
        q.from = () => q;
        q.where = () => q;
        q.orderBy = () => q;
        q.then = (resolve: any, reject: any) => Promise.resolve(rows).then(resolve, reject);
        return q;
      },
    },
  };
});

vi.mock('@/db/schema', () => ({
  orders: { id: 'id', profileId: 'profileId', createdAt: 'createdAt', totalAmount: 'totalAmount', currency: 'currency', status: 'status', trackingCarrier: 'trackingCarrier', trackingNumber: 'trackingNumber', trackingUrl: 'trackingUrl', shippedAt: 'shippedAt' },
  orderItems: { id: 'id', orderId: 'orderId', productName: 'productName', variantName: 'variantName', quantity: 'quantity', price: 'price' },
}));

import { getMyOrders } from './account-orders';

describe('getMyOrders', () => {
  beforeEach(() => {
    authState.user = { id: 'profile-1' };
    dbState.orders = [];
    dbState.items = [];
  });

  it('returns empty array when unauthenticated', async () => {
    authState.user = null;
    const result = await getMyOrders();
    expect(result).toEqual([]);
  });

  it('maps orders and sanitizes tracking URL', async () => {
    dbState.orders = [{
      id: 'order-12345678',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      totalAmount: 2500,
      currency: 'INR',
      status: 'paid',
      trackingCarrier: 'DHL',
      trackingNumber: 'TRK123',
      trackingUrl: 'javascript:alert(1)',
      shippedAt: null,
    }];
    dbState.items = [{
      id: 'item-1', orderId: 'order-12345678', productName: 'Tee', variantName: 'M', quantity: 1, price: 2500,
    }];

    const result = await getMyOrders();
    expect(result).toHaveLength(1);
    expect(result[0].reference).toBe('ORDER-12');
    expect(result[0].paymentStatus).toBe('Paid');
    expect(result[0].fulfilmentStatus).toBe('Processing');
    expect(result[0].trackingUrl).toBeNull();
    expect(result[0].items[0].productName).toBe('Tee');
  });

  it('allows only http/https tracking URLs', async () => {
    dbState.orders = [{
      id: 'order-abcdefgh',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      totalAmount: 1000,
      currency: 'USD',
      status: 'shipped',
      trackingCarrier: null,
      trackingNumber: null,
      trackingUrl: 'https://tracking.example.com/abc',
      shippedAt: null,
    }];
    dbState.items = [];
    const result = await getMyOrders();
    expect(result[0].trackingUrl).toBe('https://tracking.example.com/abc');
  });
});

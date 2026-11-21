import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { orderItems, orders } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';

export interface AccountOrderItem {
  id: string;
  productName: string;
  variantName: string | null;
  quantity: number;
  price: number;
}

export interface AccountOrder {
  id: string;
  reference: string;
  createdAt: Date;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  fulfilmentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: Date | null;
  items: AccountOrderItem[];
}

function formatPaymentStatus(status: string): string {
  switch (status) {
    case 'paid':
    case 'shipped':
    case 'completed':
      return 'Paid';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    case 'pending':
    default:
      return 'Pending';
  }
}

function formatFulfilmentStatus(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'shipped':
      return 'Shipped';
    case 'paid':
      return 'Processing';
    case 'cancelled':
      return 'Cancelled';
    case 'failed':
      return 'Failed';
    case 'pending':
    default:
      return 'Pending';
  }
}

function safeTrackingUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
    return null;
  } catch {
    return null;
  }
}

export async function getMyOrders(): Promise<AccountOrder[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const rows = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      status: orders.status,
      trackingCarrier: orders.trackingCarrier,
      trackingNumber: orders.trackingNumber,
      trackingUrl: orders.trackingUrl,
      shippedAt: orders.shippedAt,
    })
    .from(orders)
    .where(eq(orders.profileId, user.id))
    .orderBy(desc(orders.createdAt));

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const allItems = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productName: orderItems.productName,
      variantName: orderItems.variantName,
      quantity: orderItems.quantity,
      price: orderItems.price,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, ids));

  const itemsByOrder = new Map<string, AccountOrderItem[]>();
  for (const item of allItems) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push({
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      price: item.price,
    });
    itemsByOrder.set(item.orderId, list);
  }

  return rows.map((row) => {
    const status = row.status ?? 'pending';
    return {
      id: row.id,
      reference: row.id.slice(0, 8).toUpperCase(),
      createdAt: row.createdAt,
      totalAmount: row.totalAmount,
      currency: row.currency ?? 'INR',
      status,
      paymentStatus: formatPaymentStatus(status),
      fulfilmentStatus: formatFulfilmentStatus(status),
      trackingCarrier: row.trackingCarrier,
      trackingNumber: row.trackingNumber,
      trackingUrl: safeTrackingUrl(row.trackingUrl),
      shippedAt: row.shippedAt,
      items: itemsByOrder.get(row.id) ?? [],
    };
  });
}

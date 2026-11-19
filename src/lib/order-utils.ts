/** Shared order vocabulary for the admin UI and server actions. */

export const ORDER_STATUSES = [
    'pending',
    'paid',
    'shipped',
    'completed',
    'failed',
    'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses that represent money actually collected. */
export const REVENUE_STATUSES: readonly OrderStatus[] = ['paid', 'shipped', 'completed'];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Pending',
    paid: 'Paid',
    shipped: 'Shipped',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
};

/**
 * Literal Tailwind classes so they are picked up by the scanner. Only real
 * statuses are ever looked up here.
 */
const STATUS_CLASSES: Record<OrderStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shipped: 'bg-sky-50 text-sky-700 border-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-red-50 text-red-600 border-red-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

export function isOrderStatus(value: unknown): value is OrderStatus {
    return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);
}

export function orderStatusClass(status: string): string {
    return isOrderStatus(status)
        ? STATUS_CLASSES[status]
        : 'bg-gray-100 text-gray-500 border-gray-200';
}

export function orderStatusLabel(status: string): string {
    return isOrderStatus(status) ? ORDER_STATUS_LABELS[status] : status;
}

export function isRevenueStatus(status: string | null | undefined): boolean {
    return isOrderStatus(status) && REVENUE_STATUSES.includes(status);
}

/** Amounts are stored in the smallest unit (paise / cents). */
export function formatOrderMoney(amount: number, currency?: string | null): string {
    const value = Number.isFinite(amount) ? amount / 100 : 0;
    if ((currency || '').toUpperCase() === 'INR') {
        return `₹${value.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }
    return `$${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function orderReference(id: string): string {
    return id.slice(0, 8).toUpperCase();
}

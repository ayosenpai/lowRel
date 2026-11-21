import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, CreditCard, MapPin, User } from 'lucide-react';
import { getAdminOrder } from '@/lib/actions/orders-admin';
import {
    formatOrderMoney,
    orderReference,
    orderStatusClass,
    orderStatusLabel,
} from '@/lib/order-utils';
import OrderStatusControl from '@/components/admin/OrderStatusControl';

export const dynamic = 'force-dynamic';

const ADDRESS_ORDER = [
    'firstName',
    'lastName',
    'company',
    'address',
    'apartment',
    'city',
    'state',
    'postalCode',
    'country',
    'phone',
    'email',
];

function prettifyKey(key: string) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase())
        .replace('Postal Code', 'Postal code');
}

function renderAddressValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function addressEntries(address: Record<string, unknown> | null) {
    if (!address) return [];
    const entries = Object.entries(address).filter(
        ([, value]) => value !== null && value !== undefined && value !== ''
    );
    const ordered = ADDRESS_ORDER.map((key) => [key, address[key]] as const).filter(
        ([, value]) => value !== null && value !== undefined && value !== ''
    );
    const orderedKeys = new Set(ADDRESS_ORDER);
    const extra = entries.filter(([key]) => !orderedKeys.has(key));
    return [...ordered, ...extra];
}

export default async function AdminOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getAdminOrder(id);

    if (!order) {
        notFound();
    }

    const linesTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const adjustment = order.totalAmount - linesTotal;
    const address = addressEntries(order.shippingAddress);

    return (
        <div className="space-y-8 pb-16">
            <div>
                <Link
                    href="/admin/orders"
                    className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 transition-colors hover:text-black"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to orders
                </Link>

                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="lr-display text-3xl font-black uppercase tracking-tighter text-[#0F172A]">
                                #{orderReference(order.id)}
                            </h1>
                            <span
                                className={`inline-block rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${orderStatusClass(order.status)}`}
                            >
                                {orderStatusLabel(order.status)}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                            Placed {format(order.createdAt, 'PPpp')} · Updated{' '}
                            {format(order.updatedAt, 'PPpp')}
                        </p>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="lr-kicker">Order total</p>
                        <p className="lr-display mt-2 text-4xl font-black text-[#0F172A]">
                            {formatOrderMoney(order.totalAmount, order.currency)}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {order.currency}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <div className="admin-card overflow-hidden rounded-2xl">
                        <div className="flex items-center justify-between border-b border-[#ECE9E4] px-6 py-5">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                                    Items
                                </h2>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    {order.items.length} lines ·{' '}
                                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left">
                                <thead>
                                    <tr className="border-b border-[#ECE9E4]">
                                        <th className="px-6 py-3 lr-kicker">Product</th>
                                        <th className="px-6 py-3 lr-kicker">Variant</th>
                                        <th className="px-6 py-3 lr-kicker text-center">Qty</th>
                                        <th className="px-6 py-3 lr-kicker text-right">Unit</th>
                                        <th className="px-6 py-3 lr-kicker text-right">Line</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1EDE8]">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">
                                                <p className="text-[11px] font-black uppercase tracking-wide text-[#0F172A]">
                                                    {item.productName}
                                                </p>
                                                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                                    {item.productId}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                {item.variantName || 'Standard'}
                                            </td>
                                            <td className="px-6 py-4 text-center text-[11px] font-black text-[#0F172A]">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right text-[11px] font-bold text-gray-600">
                                                {formatOrderMoney(item.price, order.currency)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-[11px] font-black text-[#0F172A]">
                                                {formatOrderMoney(
                                                    item.price * item.quantity,
                                                    order.currency
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {order.items.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400"
                                            >
                                                No line items recorded for this order.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-2 border-t border-[#ECE9E4] bg-[#FAF7F4]/50 px-6 py-5">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>Items subtotal</span>
                                <span>{formatOrderMoney(linesTotal, order.currency)}</span>
                            </div>
                            {adjustment !== 0 && (
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    <span>Discount / adjustment</span>
                                    <span>{formatOrderMoney(adjustment, order.currency)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between border-t border-[#ECE9E4] pt-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0F172A]">
                                    Charged total
                                </span>
                                <span className="lr-display text-lg font-black text-[#0F172A]">
                                    {formatOrderMoney(order.totalAmount, order.currency)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card rounded-2xl p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#b9849f]" />
                            <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                                Shipping address
                            </h2>
                        </div>
                        {address.length === 0 ? (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                No address captured for this order.
                            </p>
                        ) : (
                            <dl className="grid gap-3 sm:grid-cols-2">
                                {address.map(([key, value]) => (
                                    <div key={key}>
                                        <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                                            {prettifyKey(key)}
                                        </dt>
                                        <dd className="mt-1 break-words text-[11px] font-bold text-[#0F172A]">
                                            {renderAddressValue(value)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="admin-card rounded-2xl p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-[#b9849f]" />
                            <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                                Customer
                            </h2>
                        </div>
                        {order.customerId ? (
                            <div className="space-y-2">
                                <p className="text-[11px] font-black uppercase tracking-wide text-[#0F172A]">
                                    {order.customerName || 'Unnamed customer'}
                                </p>
                                <p className="text-[10px] font-bold text-gray-500">
                                    {order.customerEmail || '—'}
                                </p>
                                {order.customerPhone && (
                                    <p className="text-[10px] font-bold text-gray-500">
                                        {order.customerPhone}
                                    </p>
                                )}
                                <Link
                                    href={`/admin/customers/${order.customerId}`}
                                    className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#b9849f] hover:text-[#0F172A]"
                                >
                                    View profile →
                                </Link>
                            </div>
                        ) : (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Guest checkout — no customer profile linked.
                            </p>
                        )}
                    </div>

                    <div className="admin-card rounded-2xl p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-[#b9849f]" />
                            <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                                Payment
                            </h2>
                        </div>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                                    Razorpay order
                                </dt>
                                <dd className="mt-1 break-all font-mono text-[10px] text-[#0F172A]">
                                    {order.razorpayOrderId || '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                                    Payment id
                                </dt>
                                <dd className="mt-1 break-all font-mono text-[10px] text-[#0F172A]">
                                    {order.paymentId || '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                                    Order id
                                </dt>
                                <dd className="mt-1 break-all font-mono text-[10px] text-gray-500">
                                    {order.id}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="admin-card rounded-2xl p-6">
                        <div className="mb-4">
                            <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                                Tracking
                            </h2>
                            <p className="mt-1 text-[10px] font-medium leading-relaxed text-gray-400">
                                Saved tracking details are visible to the customer in My Orders.
                            </p>
                        </div>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Carrier</dt>
                                <dd className="mt-1 text-[11px] font-bold text-[#0F172A]">{order.trackingCarrier || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Tracking number</dt>
                                <dd className="mt-1 break-all text-[11px] font-bold text-[#0F172A]">{order.trackingNumber || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Tracking URL</dt>
                                <dd className="mt-1 break-all text-[11px] font-bold text-[#0F172A]">
                                    {order.trackingUrl ? (
                                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[#b9849f] hover:text-[#0F172A] underline underline-offset-2">
                                            {order.trackingUrl}
                                        </a>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Shipped at</dt>
                                <dd className="mt-1 text-[11px] font-bold text-[#0F172A]">{order.shippedAt ? format(order.shippedAt, 'PP') : '—'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="admin-card rounded-2xl p-6">
                        <div className="mb-4">
                            <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                                Update order
                            </h2>
                            <p className="mt-1 text-[10px] font-medium leading-relaxed text-gray-400">
                                Marking an order paid adds it to revenue and the customer&apos;s lifetime
                                spend. Moving it back out reverses that.
                            </p>
                        </div>
                        <OrderStatusControl
                            orderId={order.id}
                            initialStatus={order.status}
                            initialPaymentId={order.paymentId}
                            initialTrackingCarrier={order.trackingCarrier}
                            initialTrackingNumber={order.trackingNumber}
                            initialTrackingUrl={order.trackingUrl}
                            initialShippedAt={order.shippedAt}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

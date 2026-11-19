import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight, Download, Receipt, Search } from 'lucide-react';
import { getAdminOrders } from '@/lib/actions/orders-admin';
import {
    formatOrderMoney,
    orderReference,
    orderStatusClass,
    orderStatusLabel,
    ORDER_STATUSES,
} from '@/lib/order-utils';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
    searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

function buildHref(params: { status?: string; search?: string; page?: number }) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.page && params.page > 1) query.set('page', String(params.page));
    const suffix = query.toString();
    return suffix ? `/admin/orders?${suffix}` : '/admin/orders';
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
    const { status = '', search = '', page = '1' } = await searchParams;
    const data = await getAdminOrders({ status, search, page: Number(page) || 1 });

    const revenueEntries = Object.entries(data.stats.revenue);
    const pending = data.stats.counts.pending ?? 0;
    const failed = data.stats.counts.failed ?? 0;
    const exportQuery = new URLSearchParams();
    if (status) exportQuery.set('status', status);
    if (search) exportQuery.set('search', search);
    const exportSuffix = exportQuery.toString();
    const exportHref = `/api/admin/orders/export${exportSuffix ? `?${exportSuffix}` : ''}`;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                    <p className="lr-kicker">Commerce</p>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-[#0F172A]">
                        Orders
                    </h1>
                    <p className="max-w-2xl text-[11px] font-medium leading-relaxed text-gray-500">
                        Every order created at checkout, including ones that never reached a paid state.
                        Update a status to reconcile payments and keep customer lifetime value accurate.
                    </p>
                </div>

                <a
                    href={exportHref}
                    className="flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#0F172A] transition-colors hover:border-black"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="admin-card rounded-2xl p-5">
                    <p className="lr-kicker">All orders</p>
                    <p className="lr-display mt-3 text-3xl font-black text-[#0F172A]">
                        {data.stats.totalOrders}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {data.stats.counts.paid ?? 0} paid · {data.stats.counts.shipped ?? 0} shipped
                    </p>
                </div>
                <div className="admin-card rounded-2xl p-5">
                    <p className="lr-kicker">Collected revenue</p>
                    {revenueEntries.length === 0 ? (
                        <p className="lr-display mt-3 text-3xl font-black text-[#0F172A]">—</p>
                    ) : (
                        <div className="mt-3 space-y-1">
                            {revenueEntries.map(([currency, amount]) => (
                                <p
                                    key={currency}
                                    className="lr-display text-2xl font-black text-[#0F172A]"
                                >
                                    {formatOrderMoney(amount, currency)}
                                </p>
                            ))}
                        </div>
                    )}
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Paid, shipped & completed
                    </p>
                </div>
                <div className="admin-card rounded-2xl p-5">
                    <p className="lr-kicker">Awaiting payment</p>
                    <p className="lr-display mt-3 text-3xl font-black text-amber-600">{pending}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Pending orders
                    </p>
                </div>
                <div className="admin-card rounded-2xl p-5">
                    <p className="lr-kicker">Failed</p>
                    <p className="lr-display mt-3 text-3xl font-black text-red-500">{failed}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Needs review
                    </p>
                </div>
            </div>

            <div className="admin-card rounded-2xl p-5">
                <form method="get" className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Search order id, payment id, customer name or email…"
                            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-[#0F172A] outline-none transition-colors focus:border-[#d8a4bc] focus:ring-1 focus:ring-[#d8a4bc]"
                        />
                    </div>
                    {status && <input type="hidden" name="status" value={status} />}
                    <button
                        type="submit"
                        className="rounded-xl bg-[#0F172A] px-5 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#d8a4bc] transition-colors hover:bg-black"
                    >
                        Search
                    </button>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                        href={buildHref({ search })}
                        className={`rounded-full border px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] transition-colors ${
                            !status
                                ? 'border-[#0F172A] bg-[#0F172A] text-[#d8a4bc]'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                        }`}
                    >
                        All ({data.stats.totalOrders})
                    </Link>
                    {ORDER_STATUSES.map((value) => (
                        <Link
                            key={value}
                            href={buildHref({ status: value, search })}
                            className={`rounded-full border px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] transition-colors ${
                                status === value
                                    ? 'border-[#0F172A] bg-[#0F172A] text-[#d8a4bc]'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                            }`}
                        >
                            {orderStatusLabel(value)} ({data.stats.counts[value] ?? 0})
                        </Link>
                    ))}
                </div>
            </div>

            <div className="admin-card overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="border-b border-[#ECE9E4]">
                                <th className="px-6 py-4 lr-kicker">Order</th>
                                <th className="px-6 py-4 lr-kicker">Placed</th>
                                <th className="px-6 py-4 lr-kicker">Customer</th>
                                <th className="px-6 py-4 lr-kicker text-center">Items</th>
                                <th className="px-6 py-4 lr-kicker text-right">Total</th>
                                <th className="px-6 py-4 lr-kicker">Status</th>
                                <th className="px-6 py-4 lr-kicker text-right" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1EDE8]">
                            {data.orders.map((order) => (
                                <tr key={order.id} className="group transition-colors hover:bg-[#FAF7F4]/60">
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="lr-display text-[11px] font-black text-[#0F172A] hover:underline"
                                        >
                                            #{orderReference(order.id)}
                                        </Link>
                                        <p className="mt-1 max-w-[180px] truncate text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                            {order.razorpayOrderId || 'No gateway id'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                                            {format(order.createdAt, 'MMM d, yyyy')}
                                        </p>
                                        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                            {format(order.createdAt, 'h:mm a')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="max-w-[220px] truncate text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                                            {order.customerName || 'Guest'}
                                        </p>
                                        <p className="mt-1 max-w-[220px] truncate text-[10px] text-gray-400">
                                            {order.customerEmail || '—'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-block rounded-md bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-600">
                                            {order.units}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="lr-display text-[12px] font-black text-[#0F172A]">
                                            {formatOrderMoney(order.totalAmount, order.currency)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-block rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${orderStatusClass(order.status)}`}
                                        >
                                            {orderStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-gray-400 transition-colors group-hover:text-[#0F172A]"
                                        >
                                            View
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {data.orders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-50">
                                            <Receipt className="mb-3 h-10 w-10 text-gray-300" />
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                                                No orders match these filters
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#ECE9E4] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400">
                        {data.total === 0
                            ? 'No orders'
                            : `Showing ${(data.page - 1) * data.pageSize + 1}–${Math.min(
                                  data.page * data.pageSize,
                                  data.total
                              )} of ${data.total}`}
                    </p>
                    <div className="flex items-center gap-2">
                        <Link
                            href={buildHref({ status, search, page: data.page - 1 })}
                            aria-disabled={data.page <= 1}
                            className={`rounded-lg border px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.14em] transition-colors ${
                                data.page <= 1
                                    ? 'pointer-events-none border-gray-100 text-gray-300'
                                    : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                            }`}
                        >
                            Previous
                        </Link>
                        <span className="px-2 text-[9px] font-black uppercase tracking-[0.14em] text-gray-400">
                            {data.page} / {data.pageCount}
                        </span>
                        <Link
                            href={buildHref({ status, search, page: data.page + 1 })}
                            aria-disabled={data.page >= data.pageCount}
                            className={`rounded-lg border px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.14em] transition-colors ${
                                data.page >= data.pageCount
                                    ? 'pointer-events-none border-gray-100 text-gray-300'
                                    : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                            }`}
                        >
                            Next
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

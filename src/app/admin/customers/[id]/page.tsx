import { db } from '@/db';
import { customers, orders, userEvents } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, ShoppingBag, Eye, Calendar, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';

export default async function CustomerProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const customer = await db.query.customers.findFirst({
        where: eq(customers.id, id),
    });

    if (!customer) {
        notFound();
    }

    // Parallel Fetching
    const [customerOrders, events] = await Promise.all([
        db.select().from(orders).where(eq(orders.customerId, id)).orderBy(desc(orders.createdAt)),
        db.select().from(userEvents).where(eq(userEvents.customerId, id)).orderBy(desc(userEvents.timestamp)).limit(50),
    ]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link
                    href="/admin/customers"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Customers
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                            {(customer.firstName?.[0] || customer.email?.[0] || '?')}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {customer.firstName} {customer.lastName}
                            </h1>
                            <p className="text-gray-500">{customer.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Spend</p>
                            <p className="text-xl font-bold text-gray-900">${((customer.totalSpend || 0) / 100).toFixed(2)}</p>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Orders</p>
                            <p className="text-xl font-bold text-gray-900">{customer.ordersCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline / Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Eye size={20} className="text-gray-400" />
                        Activity Feed
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                            {events.map((event) => (
                                <div key={event.id} className="relative flex gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${event.eventType === 'purchase' ? 'bg-green-100 text-green-600' :
                                        event.eventType === 'add_to_cart' ? 'bg-blue-100 text-blue-600' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                        {event.eventType === 'purchase' ? <DollarSign size={16} /> :
                                            event.eventType === 'add_to_cart' ? <ShoppingBag size={16} /> :
                                                <Eye size={16} />}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatEventType(event.eventType as string)}
                                            </p>
                                            <span className="text-xs text-gray-400">
                                                {format(event.timestamp, 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {event.path}
                                        </p>
                                        {event.payload && Object.keys(event.payload as object).length > 0 && (
                                            <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-600 font-mono overflow-x-auto">
                                                {JSON.stringify(event.payload, null, 2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <p className="text-center text-gray-400 py-4">No activity recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info & Orders */}
                <div className="space-y-8">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-900">Contact Information</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Email</p>
                                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">{customer.email}</a>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Phone</p>
                                <p className="text-gray-900">{customer.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Last Seen</p>
                                <p className="text-gray-900">{customer.lastSeenAt ? format(customer.lastSeenAt, 'PP pp') : '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center justify-between">
                            Recent Orders
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{customerOrders.length}</span>
                        </h3>
                        <div className="space-y-4">
                            {customerOrders.map((order) => (
                                <div key={order.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                        <Package size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <p className="font-medium text-sm text-gray-900">
                                                #{order.id.slice(0, 8)}...
                                            </p>
                                            <p className="font-bold text-sm text-gray-900">
                                                ${(order.totalAmount / 100).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between mt-0.5">
                                            <p className="text-xs text-gray-500">
                                                {format(order.createdAt, 'MMM d, yyyy')}
                                            </p>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {customerOrders.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">No orders placed yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatEventType(type: string) {
    switch (type) {
        case 'page_view': return 'Viewed Page';
        case 'add_to_cart': return 'Added to Cart';
        case 'begin_checkout': return 'Started Checkout';
        case 'purchase': return 'Purchased';
        case 'search': return 'Searched';
        default: return type.replace(/_/g, ' ');
    }
}

import { db } from '@/db';
import { customers } from '@/db/schema';
import { desc, ilike, or } from 'drizzle-orm';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const { search } = await searchParams;
    const searchTerm = search || '';

    let customerList;

    if (searchTerm) {
        customerList = await db.select().from(customers).where(
            or(
                ilike(customers.firstName, `%${searchTerm}%`),
                ilike(customers.lastName, `%${searchTerm}%`),
                ilike(customers.email, `%${searchTerm}%`)
            )
        ).orderBy(desc(customers.lastSeenAt));
    } else {
        customerList = await db.select().from(customers).orderBy(desc(customers.lastSeenAt));
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Customers</h1>
                <div className="text-sm text-gray-500">
                    {customerList.length} Total Profiles
                </div>
            </div>

            {/* Search */}
            <form className="max-w-sm">
                <input
                    name="search"
                    defaultValue={searchTerm}
                    placeholder="Search by name or email..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
                />
            </form>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Contact</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Orders</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Total Spend</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Last Seen</th>
                            <th className="px-6 py-4 font-semibold text-gray-900"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customerList.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                                        {customer.firstName} {customer.lastName}
                                    </Link>
                                    {!customer.firstName && <span className="text-gray-400 italic">Guest</span>}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex flex-col">
                                        <span>{customer.email}</span>
                                        <span className="text-xs text-gray-400">{customer.phone}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                        {customer.ordersCount}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    ${((customer.totalSpend || 0) / 100).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">
                                    {customer.lastSeenAt ? format(customer.lastSeenAt, 'MMM d, yyyy h:mm a') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/admin/customers/${customer.id}`}
                                        className="text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                                    >
                                        View Profile
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {customerList.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { Receipt } from 'lucide-react';

const statusStyles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    failed: 'bg-red-50 text-red-500 border-red-100',
    shipped: 'bg-[#d8a4bc]/15 text-[#b9849f] border-[#d8a4bc]/25',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function RecentOrders({
    orders,
    symbol,
}: {
    orders: { id: string; total: number; status: string; customer: string; createdAt: string }[];
    symbol: string;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-[#ECE9E4]">
                        <th className="px-8 py-4 lr-kicker">Order</th>
                        <th className="px-8 py-4 lr-kicker">Customer</th>
                        <th className="px-8 py-4 lr-kicker">Total</th>
                        <th className="px-8 py-4 lr-kicker">Status</th>
                        <th className="px-8 py-4 lr-kicker text-right">Placed</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EDE8]">
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-8 py-16 text-center">
                                <div className="flex flex-col items-center justify-center opacity-40">
                                    <Receipt className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">No orders placed yet</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        orders.map(o => (
                            <tr key={o.id} className="hover:bg-[#FAF7F4]/60 transition-colors group">
                                <td className="px-8 py-4">
                                    <span className="lr-display text-[11px] font-black text-[#0F172A]">#{o.id.slice(0, 8)}</span>
                                </td>
                                <td className="px-8 py-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 truncate max-w-[220px] block">{o.customer}</span>
                                </td>
                                <td className="px-8 py-4">
                                    <span className="lr-display text-[12px] font-black text-[#0F172A]">{symbol}{o.total.toFixed(2)}</span>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`inline-block px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${statusStyles[o.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <span className="text-[10px] font-bold text-gray-500">
                                        {new Date(o.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

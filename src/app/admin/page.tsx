
import { getAdminStats } from '@/lib/actions/admin';
import {
    TrendingUp,
    ShoppingCart,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Package,
    Clock,
    DollarSign,
    CreditCard
} from 'lucide-react';
import SalesChart from '@/components/admin/SalesChart';

export default async function AdminDashboardPage() {
    const data = await getAdminStats();

    if (!data) {
        return <div className="p-8 text-center admin-card">Failed to load dashboard data.</div>;
    }

    const { stats, recentEvents, topProducts, chartData } = data;

    const cards = [
        {
            name: 'Total Revenue',
            value: `$${stats.totalSales.toFixed(2)}`,
            icon: DollarSign,
            change: '+12.5%',
            trend: 'up',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            name: 'Total Visitors',
            value: stats.visitors,
            icon: Users,
            change: '+18%',
            trend: 'up',
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            name: 'Active Interest',
            value: stats.cartAdds,
            icon: ShoppingCart,
            change: '+12%',
            trend: 'up',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            name: 'Conversion',
            value: `${stats.conversionRate.toFixed(1)}%`,
            icon: Activity,
            change: '-2.1%',
            trend: 'down',
            color: 'text-red-600',
            bg: 'bg-red-50'
        },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Command Center</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Operational Overview & Intelligence</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-lg shadow-sm">Export Data</button>
                    <button className="px-5 py-2.5 bg-[#0F172A] text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-lg shadow-lg">New Report</button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.name} className="admin-card p-6 rounded-2xl flex flex-col justify-between group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className={`flex items-center text-[10px] font-black tracking-tighter ${card.trend === 'up' ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {card.change}
                                {card.trend === 'up' ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter mb-1">{card.value}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{card.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Sales Performance</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Revenue over the last 7 days</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#5750F1]"></span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Gross Sale</span>
                            </div>
                        </div>
                    </div>
                    <SalesChart data={chartData} />
                </div>

                <div className="lg:col-span-4 admin-card p-8 rounded-2xl flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A] mb-8">Top Products</h2>
                    <div className="flex-1 space-y-6">
                        {topProducts.length > 0 ? topProducts.map((product: any, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-gray-500 border border-gray-200 group-hover:bg-[#d8a4bc] group-hover:text-black group-hover:border-[#d8a4bc] transition-all">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">{product.name}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{product.count} Sold</p>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-[#0F172A]">${product.revenue.toFixed(2)}</p>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                                <Package className="w-12 h-12 text-gray-100 mb-4" />
                                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">No transaction data</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full mt-8 py-3 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">View Full Catalog</button>
                </div>
            </div>

            {/* Recent Activity Table Style */}
            <div className="admin-card rounded-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Real-Time Behavioral Intelligence</h2>
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-[#d8a4bc] hover:text-[#0F172A] transition-colors">Audit All Streams</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Stream Source</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Interaction Path</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Timestamp</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Identifier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white border border-gray-100 group-hover:border-[#d8a4bc] transition-colors">
                                                <Activity className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">{event.eventType.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[300px] block">{event.path}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-gray-300" />
                                            <span className="text-[10px] font-bold text-gray-600">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                                            SES_{event.sessionId.slice(0, 12)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

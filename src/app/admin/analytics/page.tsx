
import { getDetailedAnalytics } from '@/lib/actions/admin';
import {
    Activity,
    ArrowRight,
    MousePointer2,
    ShoppingCart,
    ShoppingBag,
    TrendingUp,
    Users,
    AlertCircle,
    Package,
    Clock,
    Globe
} from 'lucide-react';
import ConversionFunnel from '@/components/admin/ConversionFunnel';
import DailyTrendsChart from '@/components/admin/DailyTrendsChart';

export default async function AnalyticsPage() {
    const data = await getDetailedAnalytics();

    if (!data) {
        return <div className="p-8 text-center admin-card">Failed to load intelligence data.</div>;
    }

    const { funnel, abandonedCarts, dailyTrends, totalSessions } = data;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Intelligence Center</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Advanced Behavioral Analytics & Insights</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Active Sessions</p>
                        <p className="text-sm font-black text-[#0F172A]">{totalSessions}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Daily Engagement Trends */}
                <div className="lg:col-span-8 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Engagement Dynamics</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Multi-vector traffic analysis (7 Days)</p>
                        </div>
                    </div>
                    <DailyTrendsChart data={dailyTrends} />
                </div>

                {/* Conversion Funnel */}
                <div className="lg:col-span-4 admin-card p-8 rounded-2xl flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A] mb-8">Acquisition Funnel</h2>
                    <div className="flex-1">
                        <ConversionFunnel data={funnel} />
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Overall Conversion</p>
                            <span className="text-xs font-black text-green-500">
                                {funnel[0].count > 0 ? ((funnel[3].count / funnel[0].count) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full transition-all duration-1000"
                                style={{ width: `${funnel[0].count > 0 ? (funnel[3].count / funnel[0].count) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Abandoned Cart Intelligence */}
                <div className="lg:col-span-12 admin-card rounded-2xl overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Abandoned Interaction Recovery</h2>
                        </div>
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-orange-100">
                            {abandonedCarts.length} HIGH-INTENT SESSIONS
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Target Session</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Last Identified Path</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Item Count</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Age</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {abandonedCarts.length > 0 ? abandonedCarts.map((cart: any) => (
                                    <tr key={cart.sessionId} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[9px] text-gray-500 border border-gray-200">
                                                    ID
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                                                    {cart.sessionId.slice(0, 16)}...
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{cart.lastPath}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-3.5 h-3.5 text-gray-300" />
                                                <span className="text-[10px] font-black text-[#0F172A]">{cart.items} High-Value Items</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Clock className="w-3.5 h-3.5 text-gray-300" />
                                                <span className="text-[10px] font-bold text-gray-600">
                                                    {cart.timestamp ? new Date(cart.timestamp).toLocaleString() : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <MousePointer2 className="w-12 h-12 text-gray-100 mb-4" />
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300">No high-intent dropouts detected</h3>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#d8a4bc] hover:text-[#0F172A] transition-colors">Generate Retargeting Campaign</button>
                    </div>
                </div>
            </div>
        </div>
    );
}


import { getDetailedAnalytics, getMarketingSegments } from '@/lib/actions/admin';
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
    const marketingData = await getMarketingSegments();

    if (!data) {
        return <div className="p-8 text-center admin-card">Failed to load intelligence data.</div>;
    }

    const { funnel, channels, topPages, topSearches, abandonedCarts, dailyTrends, totalSessions } = data;

    return (
        <div className="space-y-10">
            {/* Header Intelligence */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Intelligence Center</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Multi-Vector Behavioral Analysis</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Active Velocity</p>
                            <p className="text-sm font-black text-[#0F172A]">{totalSessions} Sessions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase 1: Growth & Conversion Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Engagement Dynamics */}
                <div className="lg:col-span-8 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Engagement Dynamics</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Daily interaction vectors across the catalog</p>
                        </div>
                    </div>
                    <DailyTrendsChart data={dailyTrends} />
                </div>

                {/* Acquisition Funnel */}
                <div className="lg:col-span-4 admin-card p-8 rounded-2xl flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A] mb-8">Purchase Funnel</h2>
                    <div className="flex-1">
                        <ConversionFunnel data={funnel} />
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Conversion Rate</p>
                            <span className="text-xs font-black text-green-500">
                                {funnel[0].count > 0 ? ((funnel[4].count / funnel[0].count) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full transition-all duration-1000"
                                style={{ width: `${funnel[0].count > 0 ? (funnel[4].count / funnel[0].count) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase 2: Acquisition & Behavioral Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Traffic Channels */}
                <div className="admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Acquisition Channels</h2>
                        <Globe className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="space-y-5">
                        {channels.map((channel, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-black transition-colors">{channel.name}</span>
                                    <span className="text-[10px] font-bold text-gray-400">{channel.value} hits</span>
                                </div>
                                <div className="w-full bg-gray-50 h-1 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[#0F172A] h-full"
                                        style={{ width: `${(channel.value / channels[0].value) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Visited Pages */}
                <div className="admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Page Performance</h2>
                        <TrendingUp className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="space-y-4">
                        {topPages.map((page, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                                <span className="text-[10px] font-bold text-gray-500 truncate max-w-[180px] lowercase">{page.path}</span>
                                <span className="text-[10px] font-black text-[#0F172A]">{page.views}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search Intent */}
                <div className="admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Search Intelligence</h2>
                        <MousePointer2 className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="space-y-2">
                        {topSearches.length > 0 ? topSearches.map((search, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 group hover:bg-white hover:shadow-sm transition-all">
                                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[9px] font-black group-hover:bg-[#d8a4bc] transition-colors">{i + 1}</div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">{search.query}</span>
                                <span className="ml-auto text-[9px] font-bold text-gray-400">{search.count} queries</span>
                            </div>
                        )) : (
                            <div className="py-10 text-center opacity-30 italic text-[10px] font-bold uppercase tracking-widest">No search data yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Phase 3: Marketing Intelligence & Lookalike Seeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Seed Audiences for Lookalikes</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ready for Meta & Google Custom Audiences</p>
                        </div>
                        <Users className="w-5 h-5 text-[#d8a4bc]" />
                    </div>

                    <div className="space-y-6">
                        <div className="p-5 bg-black rounded-2xl text-white">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d8a4bc]">Value-Based Seed</span>
                                <span className="px-2 py-0.5 bg-[#d8a4bc] text-black text-[8px] font-black uppercase rounded">High Match</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter mb-1">{marketingData?.vipSeed.length || 0} VIP Shoppers</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                Top 20% by LTV. Use these to build your primary 1% Lookalike (LAL) for highest ROAS.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {marketingData?.highIntentSeeds.map((seed, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{seed.name} Intent</p>
                                    <p className="text-lg font-black text-[#0F172A]">{seed.count}</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase mt-1">High-Freq Viewers</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="admin-card p-8 rounded-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Ads Integration Status</h2>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Globe className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Advanced Matching</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 leading-relaxed">
                                    Browser signatures & device signals are being collected for server-side match enrichment.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 border border-dashed border-gray-200 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 text-center">Syncing with Meta CAPI API (Pending Config)</p>
                        </div>
                    </div>
                    <a
                        href="/api/admin/marketing/export"
                        target="_blank"
                        className="w-full mt-8 py-4 bg-[#0F172A] text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg text-center block"
                    >
                        Export Audience CSVs
                    </a>
                </div>
            </div>

            {/* Phase 4: Recovery & Loss Prevention */}
            <div className="admin-card rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">High-Intent Dropouts</h2>
                    </div>
                    <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100 shadow-sm">
                        {abandonedCarts.length} Potential Recoveries
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Stream Identifier</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Exit Path</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Basket Load</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Last Interaction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {abandonedCarts.length > 0 ? abandonedCarts.map((cart: any) => (
                                <tr key={cart.sessionId} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-[10px] text-gray-300 group-hover:text-black group-hover:border-[#d8a4bc] transition-all">
                                                ID
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F172A]">
                                                {cart.sessionId.slice(0, 8)}...{cart.sessionId.slice(-4)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-gray-100 text-[10px] text-gray-500 font-bold uppercase tracking-widest rounded-lg">{cart.lastPath}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-gray-300" />
                                            <span className="text-[11px] font-black text-[#0F172A]">{cart.items} Units</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold">
                                                {cart.timestamp ? new Date(cart.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            <MousePointer2 className="w-16 h-16 text-gray-300 mb-4" />
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Zero intent dropouts detected in current cycle</h3>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

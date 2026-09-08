'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    ShoppingBag,
    Receipt,
    Target,
    Users,
    ShoppingCart,
    CreditCard,
    Package,
    Download,
    RefreshCw,
    ArrowRight,
    Lightbulb,
    TrendingUp,
    Globe,
    CalendarDays,
    Clock,
    Activity,
} from 'lucide-react';
import { getAdminDashboard, AdminDashboardData } from '@/lib/actions/admin';
import StatCard from './StatCard';
import RevenueChart from './RevenueChart';
import FunnelChart from './FunnelChart';
import TopProducts from './TopProducts';
import RecentOrders from './RecentOrders';
import InsightsPanel from './InsightsPanel';
import RhythmCard from './RhythmCard';
import AcquisitionCard from './AcquisitionCard';

const pctChange = (cur: number, prev: number): number | null =>
    prev === 0 ? (cur === 0 ? 0 : null) : ((cur - prev) / prev) * 100;

function ConversionRing({ value }: { value: number }) {
    const pct = Math.min(100, Math.max(0, value));
    const r = 40;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct / 100);
    return (
        <div className="relative w-24 h-24 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#F1EDE8" strokeWidth="9" />
                <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke="#d8a4bc"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="lr-display text-xl font-black text-[#0F172A]">{pct.toFixed(1)}%</span>
            </div>
        </div>
    );
}

export default function DashboardClient({ initialData }: { initialData: AdminDashboardData }) {
    const [range, setRange] = useState(initialData.range);
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [now, setNow] = useState(new Date());
    const firstRun = useRef(true);

    const load = useCallback(async (r: number) => {
        setLoading(true);
        const res = await getAdminDashboard(r);
        if (res) setData(res);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        load(range);
    }, [range, load]);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);

    const exportCsv = () => {
        const lines = [
            ['Date', 'Revenue', 'Visitors', 'Orders'].join(','),
            ...data.series.map(s => [s.date, s.revenue, s.visitors, s.orders].join(',')),
            '',
            ['Order', 'Customer', 'Total', 'Status'].join(','),
            ...data.recentOrders.map(o => [o.id, o.customer, o.total, o.status].join(',')),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lowrel-report-${range}d.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const cards = [
        {
            label: 'Revenue',
            value: `${data.currencySymbol}${data.period.revenue.toFixed(2)}`,
            delta: pctChange(data.period.revenue, data.previous.revenue),
            icon: DollarSign,
            tone: 'indigo' as const,
            sparkline: data.series.map(s => s.revenue),
        },
        {
            label: 'Orders',
            value: String(data.period.orders),
            delta: pctChange(data.period.orders, data.previous.orders),
            icon: ShoppingBag,
            tone: 'pink' as const,
            sparkline: data.series.map(s => s.orders),
        },
        {
            label: 'Avg Order Value',
            value: `${data.currencySymbol}${data.period.aov.toFixed(2)}`,
            delta: pctChange(data.period.aov, data.previous.aov),
            icon: Receipt,
            tone: 'amber' as const,
        },
        {
            label: 'Conversion Rate',
            value: `${data.period.conversionRate.toFixed(1)}%`,
            delta: pctChange(data.period.conversionRate, data.previous.conversionRate),
            icon: Target,
            tone: 'emerald' as const,
            sparkline: data.series.map((_, i) => (data.series.length ? 0 : 0)),
        },
    ];

    const traffic = [
        { label: 'Visitors', value: data.period.visitors, delta: pctChange(data.period.visitors, data.previous.visitors), icon: Users },
        { label: 'Cart Adds', value: data.period.cartAdds, delta: null, icon: ShoppingCart },
        { label: 'Checkouts', value: data.period.checkouts, delta: null, icon: CreditCard },
        { label: 'Purchases', value: data.period.purchases, delta: pctChange(data.period.purchases, data.previous.purchases), icon: Package },
    ];

    const peakHour = data.hourlyActivity.reduce((best, h) => (h.count > best.count ? h : best), data.hourlyActivity[0]);
    const peakLabel = peakHour ? `${peakHour.hour % 12 === 0 ? 12 : peakHour.hour % 12}:00 ${peakHour.hour < 12 ? 'AM' : 'PM'}` : '—';

    const pulse = [
        { label: 'Today', value: now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }), icon: CalendarDays },
        { label: 'Best Day', value: data.peakDay || '—', icon: TrendingUp },
        { label: 'Peak Hour', value: peakLabel, icon: Clock },
        { label: 'Top Channel', value: data.topChannels[0]?.name || '—', icon: Globe },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-[3px] rounded-full bg-[#d8a4bc]" />
                        <p className="lr-kicker">Low Religion · Operations</p>
                    </div>
                    <h1 className="lr-display text-4xl font-black uppercase tracking-tight text-[#0F172A]">Command Center</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        Live · last {data.range} days · refreshed just now
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-white border border-[#ECE9E4] rounded-xl p-1 shadow-sm">
                        {[7, 14, 30].map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${data.range === r
                                    ? 'bg-[#0F172A] text-[#d8a4bc] shadow'
                                    : 'text-gray-500 hover:text-black'
                                    }`}
                            >
                                {r}D
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => load(range)}
                        disabled={loading}
                        className="px-4 py-2.5 bg-white border border-[#ECE9E4] text-[10px] font-black uppercase tracking-widest hover:bg-[#FAF7F4] transition-all rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Syncing' : 'Refresh'}
                    </button>

                    <button
                        onClick={exportCsv}
                        className="px-4 py-2.5 bg-white border border-[#ECE9E4] text-[10px] font-black uppercase tracking-widest hover:bg-[#FAF7F4] transition-all rounded-xl shadow-sm flex items-center gap-2"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>

                    <Link
                        href="/admin/analytics"
                        className="px-4 py-2.5 bg-[#0F172A] text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-xl shadow-lg shadow-[#0F172A]/10 flex items-center gap-2"
                    >
                        Deep Dive
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Pulse strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {pulse.map(p => (
                    <div key={p.label} className="admin-card rounded-2xl px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#d8a4bc]/15 flex items-center justify-center shrink-0">
                            <p.icon className="w-4 h-4 text-[#b9849f]" />
                        </div>
                        <div className="min-w-0">
                            <p className="lr-display text-lg font-black text-[#0F172A] leading-none truncate">{p.value}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">{p.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map(card => (
                    <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        delta={card.delta}
                        icon={card.icon}
                        tone={card.tone}
                        sparkline={card.sparkline}
                    />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="lr-kicker mb-1">Revenue Performance</p>
                            <h2 className="lr-display text-sm font-black uppercase tracking-[0.15em] text-[#0F172A]">
                                Daily gross sales · last {data.range} days
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#d8a4bc]" /> Revenue
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#0F172A]/60" /> Orders
                            </span>
                        </div>
                    </div>
                    <RevenueChart data={data.series} symbol={data.currencySymbol} />
                </div>

                <div className="lg:col-span-4 admin-card p-8 rounded-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="lr-kicker mb-1">Purchase Funnel</p>
                            <h2 className="lr-display text-sm font-black uppercase tracking-[0.15em] text-[#0F172A]">Visitor journey</h2>
                        </div>
                        <span className="w-9 h-9 rounded-xl bg-[#0F172A]/5 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[#0F172A]" />
                        </span>
                    </div>
                    <FunnelChart data={data.funnel} />
                    <div className="mt-8 pt-6 border-t border-[#ECE9E4]">
                        <p className="lr-kicker text-center mb-4">Overall Conversion</p>
                        <ConversionRing value={data.period.conversionRate} />
                        <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-3">
                            {data.period.orders} orders · {data.period.visitors} visitors
                        </p>
                    </div>
                </div>
            </div>

            {/* Insights + Products + Traffic */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="lr-kicker mb-1">Auto-generated</p>
                            <h2 className="lr-display text-sm font-black uppercase tracking-[0.15em] text-[#0F172A]">Smart Insights</h2>
                        </div>
                        <Lightbulb className="w-4 h-4 text-[#b9849f]" />
                    </div>
                    <InsightsPanel insights={data.insights} />
                </div>

                <div className="lg:col-span-4 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="lr-kicker mb-1">By revenue</p>
                            <h2 className="lr-display text-sm font-black uppercase tracking-[0.15em] text-[#0F172A]">Top Products</h2>
                        </div>
                        <Package className="w-4 h-4 text-gray-300" />
                    </div>
                    <TopProducts products={data.topProducts} symbol={data.currencySymbol} />
                </div>

                <div className="lg:col-span-4 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="lr-kicker mb-1">This period</p>
                            <h2 className="lr-display text-sm font-black uppercase tracking-[0.15em] text-[#0F172A]">Traffic Overview</h2>
                        </div>
                        <Users className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="space-y-5">
                        {traffic.map(t => (
                            <div key={t.label} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#FAF7F4] border border-[#ECE9E4] flex items-center justify-center">
                                    <t.icon className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="lr-display text-lg font-black text-[#0F172A] leading-none">{t.value.toLocaleString()}</p>
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t.label}</p>
                                </div>
                                {t.delta !== null && (
                                    <span className={`text-[10px] font-black ${t.delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {t.delta >= 0 ? '+' : ''}{t.delta.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rhythm + Acquisition */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="lr-kicker mb-1">Audience pulse · 24h</p>
                            <h2 className="lr-display text-sm font-black uppercase tracking-[0.15em] text-[#0F172A]">Activity Rhythm</h2>
                        </div>
                        <Clock className="w-4 h-4 text-[#b9849f]" />
                    </div>
                    <RhythmCard hourlyActivity={data.hourlyActivity} />
                </div>

                <div className="lg:col-span-5 admin-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="lr-kicker mb-1">Top sources</p>
                            <h2 className="lr-display text-sm font-black uppercase tracking-[0.15em] text-[#0F172A]">Acquisition</h2>
                        </div>
                        <Globe className="w-4 h-4 text-gray-300" />
                    </div>
                    <AcquisitionCard channels={data.topChannels} />
                </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-card rounded-2xl overflow-hidden">
                <div className="p-8 border-b border-[#ECE9E4] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-[#d8a4bc]/15 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-[#b9849f]" />
                        </span>
                        <div>
                            <h2 className="lr-display text-sm font-black uppercase tracking-[0.15em] text-[#0F172A]">Recent Orders</h2>
                            <p className="lr-kicker mt-0.5">Latest from the orders table</p>
                        </div>
                    </div>
                    <Link href="/admin/customers" className="lr-pill hover:bg-[#d8a4bc]/25 transition-colors">
                        View Customers
                    </Link>
                </div>
                <RecentOrders orders={data.recentOrders} symbol={data.currencySymbol} />
            </div>
        </div>
    );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

const tones = {
    indigo: { soft: 'bg-[#0F172A]/5 text-[#0F172A]', bar: '#0F172A' },
    emerald: { soft: 'bg-emerald-50 text-emerald-600', bar: '#10B981' },
    pink: { soft: 'bg-[#d8a4bc]/15 text-[#b9849f]', bar: '#d8a4bc' },
    amber: { soft: 'bg-amber-50 text-amber-600', bar: '#F59E0B' },
};

function useCountUp(value: string) {
    const numeric = parseFloat(value.replace(/[^0-9.\-]/g, '')) || 0;
    const [display, setDisplay] = useState(0);
    const raf = useRef<number>(0);

    useEffect(() => {
        const start = performance.now();
        const duration = 900;
        const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(numeric * eased);
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [numeric]);

    return display;
}

export default function StatCard({
    label,
    value,
    delta,
    deltaLabel,
    icon: Icon,
    tone = 'indigo',
    sparkline,
}: {
    label: string;
    value: string;
    delta: number | null;
    deltaLabel?: string;
    icon: LucideIcon;
    tone?: keyof typeof tones;
    sparkline?: number[];
}) {
    const t = tones[tone];
    const up = (delta ?? 0) >= 0;
    const animated = useCountUp(value);

    const isPercent = value.trim().endsWith('%');
    const prefix = value.replace(/[0-9.,%]+/g, '').trim();
    const shown = `${prefix}${isPercent ? animated.toFixed(1) : animated.toLocaleString('en-US', { maximumFractionDigits: 2 })}${isPercent ? '%' : ''}`;

    const maxS = sparkline && sparkline.length > 1 ? Math.max(...sparkline, 1) : 1;
    const minS = sparkline && sparkline.length > 1 ? Math.min(...sparkline, 0) : 0;
    const rangeS = maxS - minS || 1;
    const points = sparkline
        ? sparkline.map((v, i) => {
              const x = (i / (sparkline.length - 1)) * 120;
              const y = 28 - ((v - minS) / rangeS) * 24;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ')
        : '';

    return (
        <div className="admin-card rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative group">
            <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d8a4bc]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-5">
                <div className={`p-2.5 rounded-xl ${t.soft} transition-transform duration-300 group-hover:scale-105`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-end gap-0.5">
                    {delta !== null && (
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {up ? '+' : ''}{delta.toFixed(1)}%
                        </span>
                    )}
                    <span className="text-[7px] text-gray-400 font-bold uppercase tracking-[0.18em]">{deltaLabel || 'vs prev period'}</span>
                </div>
            </div>

            <div>
                <p className="lr-display text-[28px] leading-none font-black text-[#0F172A] tracking-tight">{shown}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.18em] mt-2">{label}</p>
            </div>

            {sparkline && sparkline.length > 1 && (
                <svg viewBox="0 0 120 32" className="w-full h-8 mt-4" preserveAspectRatio="none" aria-hidden>
                    <defs>
                        <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={t.bar} stopOpacity="0.28" />
                            <stop offset="100%" stopColor={t.bar} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <polygon
                        fill={`url(#spark-${tone})`}
                        points={`0,28 ${points} 120,28`}
                    />
                    <polyline
                        fill="none"
                        stroke={t.bar}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                    />
                </svg>
            )}
        </div>
    );
}

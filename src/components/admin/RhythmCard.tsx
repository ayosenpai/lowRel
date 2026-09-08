'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';

export default function RhythmCard({
    hourlyActivity,
}: {
    hourlyActivity: { hour: number; count: number }[];
}) {
    const max = useMemo(() => Math.max(...hourlyActivity.map(h => h.count), 1), [hourlyActivity]);
    const peak = useMemo(() => {
        let best = hourlyActivity[0];
        for (const h of hourlyActivity) if (h.count > best.count) best = h;
        return best;
    }, [hourlyActivity]);

    const peakLabel = `${peak.hour % 12 === 0 ? 12 : peak.hour % 12}:00 ${peak.hour < 12 ? 'AM' : 'PM'}`;

    return (
        <div>
            <div className="flex items-end gap-[3px] h-24">
                {hourlyActivity.map(({ hour, count }) => {
                    const isPeak = hour === peak.hour;
                    return (
                        <div
                            key={hour}
                            title={`${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'} — ${count} events`}
                            className={`flex-1 rounded-t-[3px] transition-all duration-300 ${
                                isPeak
                                    ? 'bg-[#d8a4bc]'
                                    : count === 0
                                        ? 'bg-[#F1EDE8]'
                                        : 'bg-[#0F172A]/60'
                            }`}
                            style={{ height: `${Math.max(6, (count / max) * 100)}%`, opacity: isPeak ? 1 : 0.15 + (count / max) * 0.55 }}
                        />
                    );
                })}
            </div>

            <div className="flex justify-between mt-2 text-[8px] font-bold uppercase tracking-widest text-gray-400">
                <span>Midnight</span>
                <span>6 AM</span>
                <span>Noon</span>
                <span>6 PM</span>
                <span>11 PM</span>
            </div>

            <div className="mt-5 pt-4 border-t border-[#ECE9E4] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-[#b9849f]" />
                    Peak window
                </div>
                <span className="lr-display text-sm font-black text-[#0F172A]">{peakLabel}</span>
            </div>
        </div>
    );
}

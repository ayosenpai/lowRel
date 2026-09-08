const bars = ['#0F172A', '#3B2B33', '#6B4257', '#a86680', '#d8a4bc'];

export default function FunnelChart({
    data,
}: {
    data: { name: string; count: number; pct: number }[];
}) {
    if (!data.length) return null;

    return (
        <div className="space-y-5">
            {data.map((step, i) => (
                <div key={step.name}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                            <span className="w-4 h-4 rounded-full bg-gray-50 border border-[#ECE9E4] flex items-center justify-center text-[8px] font-black text-gray-400">
                                {i + 1}
                            </span>
                            {step.name}
                        </span>
                        <span className="lr-display text-sm font-black text-[#0F172A]">{step.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 bg-[#F1EDE8] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${Math.min(100, Math.max(step.pct, step.count ? 4 : 0))}%`,
                                background: `linear-gradient(90deg, ${bars[i % bars.length]}, #d8a4bc)`,
                            }}
                        />
                    </div>
                    {i > 0 && (
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {step.pct.toFixed(0)}% carried from previous step
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

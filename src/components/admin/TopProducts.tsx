import { Package } from 'lucide-react';

export default function TopProducts({
    products,
    symbol,
}: {
    products: { id: string; name: string; count: number; revenue: number }[];
    symbol: string;
}) {
    const max = Math.max(...products.map(p => p.revenue), 1);

    if (!products.length) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-10 opacity-40">
                <Package className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">No sales recorded in this window</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {products.map((p, i) => (
                <div key={p.id} className="group">
                    <div className="flex items-center justify-between mb-1.5 gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black shrink-0 transition-colors ${
                                    i === 0 ? 'bg-[#d8a4bc] text-[#0F172A]' : 'bg-[#0F172A] text-[#d8a4bc]'
                                }`}
                            >
                                {i + 1}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] truncate">{p.name}</span>
                        </div>
                        <span className="lr-display text-[11px] font-black text-[#0F172A] shrink-0">{symbol}{p.revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-[#F1EDE8] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0F172A] to-[#d8a4bc] transition-all duration-700 group-hover:to-[#b9849f]"
                            style={{ width: `${(p.revenue / max) * 100}%` }}
                        />
                    </div>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">{p.count} units</p>
                </div>
            ))}
        </div>
    );
}

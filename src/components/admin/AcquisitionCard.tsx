import { Globe } from 'lucide-react';

export default function AcquisitionCard({
    channels,
}: {
    channels: { name: string; value: number }[];
}) {
    const max = Math.max(...channels.map(c => c.value), 1);
    const total = channels.reduce((acc, c) => acc + c.value, 0);

    if (!channels.length) {
        return (
            <div className="text-center py-10 opacity-40">
                <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">No traffic sources recorded</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {channels.map((c, i) => (
                <div key={c.name}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d8a4bc]" />
                            {c.name}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                            {c.value.toLocaleString()}
                            <span className="text-gray-300 ml-1">
                                {total ? Math.round((c.value / total) * 100) : 0}%
                            </span>
                        </span>
                    </div>
                    <div className="h-1.5 bg-[#F1EDE8] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#0F172A] transition-all duration-700"
                            style={{ width: `${(c.value / max) * 100}%`, opacity: 0.35 + (i / channels.length) * 0.65 }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

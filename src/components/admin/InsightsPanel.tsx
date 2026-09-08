import { Sparkles, AlertTriangle, AlertCircle, Lightbulb, LucideIcon } from 'lucide-react';

const kindConfig: Record<string, { icon: LucideIcon; card: string; iconColor: string; accent: string }> = {
    positive: {
        icon: Sparkles,
        card: 'border-emerald-100 bg-emerald-50/50',
        iconColor: 'text-emerald-600',
        accent: 'bg-emerald-500',
    },
    warning: {
        icon: AlertTriangle,
        card: 'border-amber-100 bg-amber-50/50',
        iconColor: 'text-amber-600',
        accent: 'bg-amber-500',
    },
    danger: {
        icon: AlertCircle,
        card: 'border-red-100 bg-red-50/50',
        iconColor: 'text-red-500',
        accent: 'bg-red-500',
    },
    info: {
        icon: Lightbulb,
        card: 'border-[#d8a4bc]/30 bg-[#d8a4bc]/10',
        iconColor: 'text-[#b9849f]',
        accent: 'bg-[#d8a4bc]',
    },
};

export default function InsightsPanel({
    insights,
}: {
    insights: { kind: string; title: string; detail: string }[];
}) {
    if (!insights.length) {
        return (
            <div className="text-center py-12 opacity-40">
                <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Collect more events to unlock insights</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {insights.map((insight, i) => {
                const cfg = kindConfig[insight.kind] || kindConfig.info;
                const Icon = cfg.icon;
                return (
                    <div key={i} className={`p-4 rounded-2xl border ${cfg.card} flex gap-3.5`}>
                        <div className={`w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden`}>
                            <span className={`absolute inset-x-0 bottom-0 h-[2px] ${cfg.accent}`} />
                            <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] mb-1">{insight.title}</p>
                            <p className="text-[10px] text-gray-500 leading-relaxed">{insight.detail}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

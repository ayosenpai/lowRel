'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Power, X } from 'lucide-react';
import {
    deleteCoupon,
    toggleCouponActive,
    upsertCoupon,
} from '@/lib/actions/coupons';

export type SerializableCoupon = {
    id: string;
    code: string;
    description: string | null;
    type: string;
    value: number;
    isActive: boolean;
    startsAt: string | null;
    expiresAt: string | null;
    maxUses: number | null;
    usedCount: number;
    createdAt: string;
    updatedAt: string;
};

type FormState = {
    id?: string;
    code: string;
    description: string;
    value: string;
    isActive: boolean;
    startsAt: string;
    expiresAt: string;
    maxUses: string;
};

const emptyForm: FormState = {
    code: '',
    description: '',
    value: '10',
    isActive: true,
    startsAt: '',
    expiresAt: '',
    maxUses: '',
};

function toDateInput(value?: string | null) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(value?: string | null) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatus(coupon: SerializableCoupon) {
    const now = new Date();
    const startsAt = coupon.startsAt ? new Date(coupon.startsAt) : null;
    const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : null;

    if (!coupon.isActive) return { label: 'Inactive', className: 'bg-gray-50 text-gray-400 border-gray-100' };
    if (startsAt && startsAt > now) return { label: 'Scheduled', className: 'bg-amber-50 text-amber-600 border-amber-100' };
    if (expiresAt && expiresAt < now) return { label: 'Expired', className: 'bg-red-50 text-red-600 border-red-100' };
    if (coupon.maxUses != null && (coupon.usedCount ?? 0) >= coupon.maxUses) {
        return { label: 'Limit reached', className: 'bg-red-50 text-red-600 border-red-100' };
    }
    return { label: 'Active', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
}

export default function CouponManager({ initialCoupons }: { initialCoupons: SerializableCoupon[] }) {
    const router = useRouter();
    const [coupons, setCoupons] = useState(initialCoupons);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    const [busyId, setBusyId] = useState<string | null>(null);

    const isEditing = Boolean(form.id);

    const stats = useMemo(() => {
        const active = coupons.filter((c) => getStatus(c).label === 'Active').length;
        return { total: coupons.length, active };
    }, [coupons]);

    const openCreate = () => {
        setForm(emptyForm);
        setError('');
        setIsFormOpen(true);
    };

    const openEdit = (coupon: SerializableCoupon) => {
        setForm({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description || '',
            value: String(coupon.value ?? 10),
            isActive: coupon.isActive,
            startsAt: toDateInput(coupon.startsAt),
            expiresAt: toDateInput(coupon.expiresAt),
            maxUses: coupon.maxUses == null ? '' : String(coupon.maxUses),
        });
        setError('');
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setForm(emptyForm);
        setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        startTransition(async () => {
            const result = await upsertCoupon(
                {
                    code: form.code,
                    description: form.description,
                    value: Number(form.value),
                    isActive: form.isActive,
                    startsAt: form.startsAt || null,
                    expiresAt: form.expiresAt || null,
                    maxUses: form.maxUses ? Number(form.maxUses) : null,
                },
                form.id
            );

            if (!result.success) {
                setError(result.error || 'Failed to save coupon.');
                return;
            }

            closeForm();
            router.refresh();
        });
    };

    const handleToggle = (coupon: SerializableCoupon) => {
        setBusyId(coupon.id);
        startTransition(async () => {
            const res = await toggleCouponActive(coupon.id, !coupon.isActive);
            setBusyId(null);
            if (res.success) {
                setCoupons((prev) =>
                    prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
                );
                router.refresh();
            }
        });
    };

    const handleDelete = (coupon: SerializableCoupon) => {
        if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
        setBusyId(coupon.id);
        startTransition(async () => {
            const res = await deleteCoupon(coupon.id);
            setBusyId(null);
            if (res.success) {
                setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                    <div className="admin-card rounded-xl px-5 py-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total</p>
                        <p className="text-lg font-black text-[#0F172A]">{stats.total}</p>
                    </div>
                    <div className="admin-card rounded-xl px-5 py-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Active</p>
                        <p className="text-lg font-black text-[#0F172A]">{stats.active}</p>
                    </div>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0F172A] text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-xl shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    New coupon
                </button>
            </div>

            {isFormOpen && (
                <div className="admin-card rounded-2xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">
                            {isEditing ? 'Edit coupon' : 'Create coupon'}
                        </h2>
                        <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Code</label>
                                <input
                                    required
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="E.g. SUMMER20"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-[#0F172A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Discount %</label>
                                <input
                                    required
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={form.value}
                                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold outline-none focus:ring-1 focus:ring-[#0F172A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Usage limit (optional)</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={form.maxUses}
                                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                                    placeholder="Unlimited (e.g. 100)"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold outline-none focus:ring-1 focus:ring-[#0F172A]"
                                />
                                <p className="text-[10px] text-gray-400">How many times this code can be redeemed (e.g. 100 for the first 100 users). Leave blank for unlimited.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Description (optional)</label>
                            <input
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Internal note or promo label"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-medium outline-none focus:ring-1 focus:ring-[#0F172A]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Starts at (optional)</label>
                                <input
                                    type="datetime-local"
                                    value={form.startsAt}
                                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-medium outline-none focus:ring-1 focus:ring-[#0F172A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Expires at (optional)</label>
                                <input
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-medium outline-none focus:ring-1 focus:ring-[#0F172A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</label>
                                <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">Active</span>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-red-600">{error}</p>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-6 py-3 bg-[#0F172A] text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-50"
                            >
                                {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create coupon'}
                            </button>
                            <button
                                type="button"
                                onClick={closeForm}
                                className="px-6 py-3 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Code</th>
                                <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Discount</th>
                                <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Redemptions</th>
                                <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Window</th>
                                <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No coupons yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Create a code to replace hardcoded discounts.</p>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => {
                                    const status = getStatus(coupon);
                                    const busy = busyId === coupon.id && isPending;
                                    return (
                                        <tr key={coupon.id} className="hover:bg-gray-50/50 transition-all">
                                            <td className="px-6 md:px-8 py-5">
                                                <p className="text-[11px] font-black uppercase tracking-widest text-[#0F172A]">{coupon.code}</p>
                                                {coupon.description && (
                                                    <p className="text-[10px] text-gray-400 mt-1">{coupon.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 md:px-8 py-5">
                                                <span className="text-[11px] font-black text-[#0F172A]">{coupon.value}%</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">off</span>
                                            </td>
                                            <td className="px-6 md:px-8 py-5">
                                                <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-md border ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-5">
                                                <span className="text-[10px] font-bold text-gray-600">
                                                    {coupon.usedCount ?? 0}{coupon.maxUses != null ? ` / ${coupon.maxUses}` : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-5">
                                                <p className="text-[10px] font-bold text-gray-500">
                                                    {coupon.startsAt || coupon.expiresAt
                                                        ? `${formatDate(coupon.startsAt)} → ${formatDate(coupon.expiresAt)}`
                                                        : 'Always on'}
                                                </p>
                                            </td>
                                            <td className="px-6 md:px-8 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(coupon)}
                                                        disabled={busy}
                                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(coupon)}
                                                        disabled={busy}
                                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className={`w-3.5 h-3.5 ${coupon.isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon)}
                                                        disabled={busy}
                                                        className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-100 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

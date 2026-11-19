'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { updateAdminOrder } from '@/lib/actions/orders-admin';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/order-utils';

export default function OrderStatusControl({
    orderId,
    initialStatus,
    initialPaymentId,
}: {
    orderId: string;
    initialStatus: string;
    initialPaymentId: string | null;
}) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [paymentId, setPaymentId] = useState(initialPaymentId ?? '');
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(
        null
    );

    const dirty =
        status !== initialStatus || (paymentId.trim() || null) !== (initialPaymentId || null);

    const handleSave = () => {
        setMessage(null);
        startTransition(async () => {
            try {
                await updateAdminOrder(orderId, {
                    status,
                    paymentId: paymentId.trim() || null,
                });
                setMessage({ kind: 'success', text: 'Order updated.' });
                router.refresh();
            } catch (error) {
                setMessage({
                    kind: 'error',
                    text: error instanceof Error ? error.message : 'Could not update the order.',
                });
            }
        });
    };

    return (
        <div className="space-y-4">
            <label className="block space-y-1.5">
                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                    Status
                </span>
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-[#0F172A] outline-none transition-colors focus:border-[#d8a4bc] focus:ring-1 focus:ring-[#d8a4bc]"
                >
                    {ORDER_STATUSES.map((value) => (
                        <option key={value} value={value}>
                            {ORDER_STATUS_LABELS[value]}
                        </option>
                    ))}
                </select>
            </label>

            <label className="block space-y-1.5">
                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                    Payment reference
                </span>
                <input
                    value={paymentId}
                    onChange={(event) => setPaymentId(event.target.value)}
                    placeholder="pay_XXXXXXXXXXXX"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-[#0F172A] outline-none transition-colors focus:border-[#d8a4bc] focus:ring-1 focus:ring-[#d8a4bc]"
                />
                <span className="block text-[10px] leading-relaxed text-gray-400">
                    Use this to reconcile historical payments with Razorpay.
                </span>
            </label>

            <button
                type="button"
                onClick={handleSave}
                disabled={isPending || !dirty}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#d8a4bc] transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Save className="h-3.5 w-3.5" />
                {isPending ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
            </button>

            {message && (
                <p
                    className={`text-[10px] font-black uppercase tracking-[0.12em] ${
                        message.kind === 'success' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                >
                    {message.text}
                </p>
            )}
        </div>
    );
}

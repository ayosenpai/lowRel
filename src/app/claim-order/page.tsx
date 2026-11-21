'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { claimOrderWithUsername, getClaimStatus } from '@/lib/actions/account';

type ClaimStatus = Awaited<ReturnType<typeof getClaimStatus>>;

export default function ClaimOrderPage() {
    const [status, setStatus] = useState<ClaimStatus | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const s = await getClaimStatus();
            setStatus(s);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSubmitting(true);
        try {
            const result = await claimOrderWithUsername({ username, password });
            if (result?.error) {
                setError(result.error);
            } else if (result?.needsEmailConfirmation) {
                setMessage(`Check ${result.email || 'your email'} to confirm your account. Once confirmed, your order will be claimed automatically in this browser.`);
            } else if (result?.claimed) {
                setMessage('Order claimed successfully. You can now view it in My Orders.');
                await load();
            }
            await load();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-white text-black px-5 py-16 font-sans">
            <div className="max-w-xl mx-auto border border-gray-200 p-6 md:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Low Religion</p>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3">Claim your order</h1>
                <p className="text-sm text-gray-600 mb-8">
                    Create your Low Religion identity to unlock My Orders and order tracking. Your purchase is already confirmed — claiming is optional.
                </p>

                {loading ? (
                    <p className="text-sm text-gray-500">Checking claim status...</p>
                ) : !status || status.state === 'invalid' ? (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">No active claim was found in this browser.</p>
                        <p className="text-xs text-gray-500">If you just confirmed your email in another tab, return to the original checkout success page in this browser, or contact support for help.</p>
                    </div>
                ) : status.state === 'claimed' ? (
                    <div className="space-y-4">
                        <p className="text-sm text-green-700 font-medium">This order is claimed.</p>
                        <Link href="/account" className="inline-block bg-black text-white px-6 py-3 text-xs font-black uppercase tracking-[0.15em]">Go to My Account</Link>
                    </div>
                ) : status.state === 'pending_payment' ? (
                    <p className="text-sm text-gray-700">This order is not confirmed paid yet. Please wait for payment confirmation.</p>
                ) : status.state === 'expired' ? (
                    <p className="text-sm text-gray-700">This claim link has expired. Please contact support for assistance.</p>
                ) : status.state === 'email_mismatch' ? (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">You are signed in with a different email than the one used for this order.</p>
                        <p className="text-xs text-gray-500">Sign in with the order email to claim it.</p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="bg-gray-50 border border-gray-100 p-4 text-sm text-gray-700">
                            <p><span className="font-semibold">Order:</span> #{status.orderReference}</p>
                            {status.email && <p><span className="font-semibold">Checkout email:</span> {status.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Username</label>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black" autoComplete="username" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black" autoComplete="new-password" />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {message && <p className="text-sm text-green-700">{message}</p>}

                        <button type="submit" disabled={submitting} className="w-full bg-black text-white py-3 text-xs font-black uppercase tracking-[0.15em] disabled:opacity-50">
                            {submitting ? 'Processing...' : 'Create account & claim order'}
                        </button>

                        <p className="text-[11px] text-gray-500">The account will use the checkout email for this order. We don’t expose it publicly.</p>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 text-xs">
                    <Link href="/" className="underline text-gray-500 hover:text-black">Home</Link>
                    <Link href="/login" className="underline text-gray-500 hover:text-black">Login</Link>
                </div>
            </div>
        </main>
    );
}

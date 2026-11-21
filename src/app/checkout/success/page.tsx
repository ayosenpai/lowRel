'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Heart, ArrowRight, Sparkles, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useCart, CartItem } from '@/lib/cart-context';
import { getActivePromoCoupon } from '@/lib/actions/coupons';
import { claimOrderWithUsername, getClaimStatus } from '@/lib/actions/account';
import SupabaseImage from '@/components/SupabaseImage';

interface OrderSnapshot {
    orderId: string;
    paymentId: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    currency: string;
    symbol: string;
    discountCode: string;
}

export default function SuccessPage() {
    const { dispatch } = useCart();
    const [orderNumber, setOrderNumber] = useState<string | number>(() => Math.floor(100000 + Math.random() * 900000));
    const [order, setOrder] = useState<OrderSnapshot | null>(null);
    const [promo, setPromo] = useState<{ code: string; value: number } | null>(null);
    const [claimStatus, setClaimStatus] = useState<any>(null);
    const [claimUsername, setClaimUsername] = useState('');
    const [claimPassword, setClaimPassword] = useState('');
    const [claimError, setClaimError] = useState('');
    const [claimMessage, setClaimMessage] = useState('');
    const [claimSubmitting, setClaimSubmitting] = useState(false);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('lowrel_order');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.items)) {
                    setOrder(parsed);
                    if (parsed.orderId) setOrderNumber(parsed.orderId);
                }
            }
        } catch (e) {
            console.error('Failed to read order snapshot:', e);
        }

        let cancelled = false;
        getActivePromoCoupon()
            .then((coupon) => {
                if (!cancelled && coupon) setPromo({ code: coupon.code, value: coupon.value });
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, []);

    const refreshClaimStatus = async () => {
        try {
            const status = await getClaimStatus();
            setClaimStatus(status);
        } catch {
            // ignore - claim is optional
        }
    };

    useEffect(() => {
        refreshClaimStatus();
    }, []);

    useEffect(() => {
        dispatch({ type: 'CLEAR_CART' });

        const duration = 1800;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 24, spread: 70, ticks: 50, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const confettiInterval: ReturnType<typeof setInterval> = setInterval(() => {
            const remaining = animationEnd - Date.now();
            if (remaining <= 0) {
                clearInterval(confettiInterval);
                return;
            }
            const particleCount = Math.max(8, Math.floor(28 * (remaining / duration)));
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.2, 0.4), y: 0.15 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.6, 0.8), y: 0.15 } });
        }, 300);

        return () => {
            clearInterval(confettiInterval);
        };
    }, [dispatch]);



    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        setClaimError('');
        setClaimMessage('');
        setClaimSubmitting(true);
        try {
            const result = await claimOrderWithUsername({ username: claimUsername, password: claimPassword });
            if (result?.error) {
                setClaimError(result.error);
            } else if (result?.needsEmailConfirmation) {
                setClaimMessage(`Check ${result.email || 'your email'} to confirm your account. Once confirmed, your order will be claimed automatically in this browser.`);
            } else if (result?.claimed) {
                setClaimMessage('Your Low Religion identity is claimed and this order is linked to your account.');
            }
            await refreshClaimStatus();
        } finally {
            setClaimSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">
            <div className="border-b border-black">
                <div className="max-w-5xl mx-auto px-5 py-6 flex items-center justify-between">
                    <Link href="/" className="block">
                        <Image src="/assets/uni.png" alt="Low Religion Logo" width={180} height={45} priority className="h-[28px] w-auto lg:h-[34px] brightness-0" />
                    </Link>
                    <Link href="/collections/all" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 py-10 md:py-14 flex flex-col items-center">

            {/* Background Sparkles / Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, 90, 180]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-[#d8a4bc]/10 rounded-none blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.3, 0.1],
                        rotate: [180, 90, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-black/5 rounded-none blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-2xl w-full space-y-8 md:space-y-10 relative z-10"
            >
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.25 }}
                                className="w-14 h-14 bg-black text-white flex items-center justify-center mx-auto"
                            >
                                <Check size={28} strokeWidth={2.5} />
                            </motion.div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Order Confirmed</p>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[0.95]">
                                Welcome to the family.
                            </h1>
                            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto">
                                Your order <span className="text-black font-semibold">{order ? order.orderId : `#${orderNumber}`}</span> is confirmed. We&apos;ll send updates when it ships.
                            </p>
                        </div>

                        {/* Gratitude & Info Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            className="bg-gray-50 border border-gray-100 rounded-none md:rounded-none p-6 md:p-10 space-y-6 md:space-y-8 shadow-sm"
                        >
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-left">
                                <div className="space-y-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-[#d8a4bc]">
                                        <Heart size={14} className="md:w-[18px]" fill="currentColor" />
                                        <span className="font-bold uppercase tracking-widest text-[9px]">Gratitude</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">You're making a difference.</h3>
                                    <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto md:mx-0">Support us in pushing the boundaries of graphic design and sustainable fashion.</p>
                                </div>
                            </div>

                            {/* Motivation Section */}
                            {promo && (
                                <div className="bg-white rounded-none p-4 md:p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d8a4bc]/10 text-[#d8a4bc] rounded-none flex items-center justify-center shrink-0">
                                            <Gift size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs md:text-sm font-bold text-gray-900">Next drop gift</p>
                                            <p className="text-[10px] md:text-xs text-gray-500">{promo.value}% OFF your next piece.</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 rounded-none border-2 border-dashed border-gray-200">
                                        <span className="font-mono font-bold text-sm md:text-lg tracking-wider">{promo.code}</span>
                                    </div>
                                </div>
                            )}

                            {/* Ordered Items */}
                            {order && order.items.length > 0 && (
                                <div className="text-left space-y-4">
                                    <h3 className="font-bold uppercase tracking-widest text-[10px] text-gray-900">Order details</h3>
                                    <div className="bg-white rounded-none border border-gray-100 divide-y divide-gray-100">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-3">
                                                <div className="w-14 h-14 bg-gray-100 rounded-none overflow-hidden shrink-0">
                                                    {item.images && item.images[0] ? (
                                                        <SupabaseImage src={item.images[0]} alt={item.name} width={112} height={112} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.size ? `Size ${item.size} · ` : ''}Qty {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-gray-900">{order.symbol || '₹'}{((item.price ?? 0) * item.quantity).toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    <p className="text-xs text-gray-400">{order.symbol || '₹'}{(item.price ?? 0).toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>{order.symbol || '₹'}{order.subtotal.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-gray-600">
                                                <span>Discount{order.discountCode ? ` (${order.discountCode})` : ''}</span>
                                                <span>-{order.symbol || '₹'}{order.discount.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                                            <span>Total</span>
                                            <span>{order.symbol || '₹'}{order.total.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Claim Identity */}
                        {claimStatus && claimStatus.state !== 'invalid' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 }}
                            className="bg-white border border-gray-200 rounded-none p-6 md:p-8 text-left space-y-4"
                        >
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Optional</p>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Claim your Low Religion identity</h2>
                                <p className="text-sm text-gray-500">
                                    Create a username and password to unlock <span className="font-semibold text-gray-700">My Orders</span> and <span className="font-semibold text-gray-700">order tracking</span>. Your purchase is already confirmed — you can skip this and keep shopping.
                                </p>
                            </div>

                            {claimStatus?.state === 'claimed' ? (
                                <div className="bg-green-50 border border-green-100 p-4 text-sm text-green-800">
                                    This order is linked to your account. <Link href="/account" className="underline font-semibold">Go to My Orders</Link>
                                </div>
                            ) : claimStatus?.state === 'pending_payment' ? (
                                <p className="text-sm text-gray-500">Order claim will be available after payment confirmation.</p>
                            ) : claimStatus?.state === 'expired' ? (
                                <p className="text-sm text-gray-500">This claim link has expired. Contact support for help.</p>
                            ) : claimStatus?.state === 'email_mismatch' ? (
                                <p className="text-sm text-gray-500">You’re signed in with a different email than the one used for this order. Sign in with the order email to claim it.</p>
                            ) : (
                                <form onSubmit={handleClaim} className="space-y-3">
                                    {claimStatus?.email && (
                                        <p className="text-xs text-gray-500">Checkout email: <span className="font-semibold text-gray-700">{claimStatus.email}</span></p>
                                    )}
                                    <input
                                        value={claimUsername}
                                        onChange={(e) => setClaimUsername(e.target.value)}
                                        placeholder="Username"
                                        autoComplete="username"
                                        required
                                        className="w-full h-12 border border-gray-300 px-4 text-sm outline-none focus:border-black"
                                    />
                                    <input
                                        type="password"
                                        value={claimPassword}
                                        onChange={(e) => setClaimPassword(e.target.value)}
                                        placeholder="Password (min 8 characters)"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                        className="w-full h-12 border border-gray-300 px-4 text-sm outline-none focus:border-black"
                                    />
                                    {claimError && <p className="text-sm text-red-600">{claimError}</p>}
                                    {claimMessage && <p className="text-sm text-green-700">{claimMessage}</p>}
                                    <button
                                        type="submit"
                                        disabled={claimSubmitting}
                                        className="w-full h-12 bg-black text-white text-xs font-black uppercase tracking-[0.15em] disabled:opacity-50"
                                    >
                                        {claimSubmitting ? 'Processing...' : 'Claim your identity'}
                                    </button>
                                    <p className="text-[11px] text-gray-400">If email confirmation is required, confirm it and return to this browser — your order claim will complete automatically.</p>
                                    <p className="text-[11px] text-gray-400">Prefer not to? You can skip this step — your purchase is safe and unaffected.</p>
                                </form>
                            )}
                        </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-col items-center justify-center pt-4"
                        >
                            <Link
                                href="/collections/all"
                                className="w-full sm:w-auto bg-black text-white px-10 py-5 rounded-none font-bold text-base hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                Continue Shopping
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        {/* Social Motivation */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="flex items-center justify-center gap-2 text-gray-400 text-sm"
                        >
                            <Sparkles size={14} />
                            <span>Share your fit with #LowReligion for a chance to be featured.</span>
                        </motion.div>

                        {/* Footer Links */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.3 }}
                            className="pt-8 space-y-2 text-sm"
                        >
                            <Link href="/help/returns" className="block text-gray-500 hover:text-black">Refund policy</Link>
                            <Link href="/help/shipping" className="block text-gray-500 hover:text-black">Shipping</Link>
                            <Link href="/help/privacy" className="block text-gray-500 hover:text-black">Privacy policy</Link>
                            <Link href="/help/terms" className="block text-gray-500 hover:text-black">Terms of service</Link>
                </motion.div>
            </motion.div>
            </div>
        </div>
    );
}

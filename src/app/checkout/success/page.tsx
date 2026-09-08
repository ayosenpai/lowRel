'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Package, Heart, ArrowRight, ShoppingBag, Sparkles, Gift, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useCart, CartItem } from '@/lib/cart-context';
import { getProducts } from '@/lib/actions/products';
import { Product } from '@/lib/types';
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
    const [showContent, setShowContent] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [orderNumber, setOrderNumber] = useState(() => Math.floor(100000 + Math.random() * 900000));
    const [order, setOrder] = useState<OrderSnapshot | null>(null);
    const [upsell, setUpsell] = useState<Product | null>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [upsellAdded, setUpsellAdded] = useState(false);

    useEffect(() => {
        // Restore the real order snapshot saved by the payment page
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

        // Load a real accessory for the post-purchase upsell
        let cancelled = false;
        getProducts({ category: 'Accessories', limit: 1 })
            .then(({ products }) => {
                if (!cancelled && products[0]) setUpsell(products[0]);
            })
            .catch((e) => console.error('Failed to load upsell product:', e));

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        // Clear cart immediately on success page arrival
        dispatch({ type: 'CLEAR_CART' });

        // Initial delay for the "celebration" to feel impactful
        const timer = setTimeout(() => setShowContent(true), 1500);

        // Confetti burst on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // Show upsell after 3 seconds of showing main content
        let upsellTimer: any;
        if (showContent) {
            upsellTimer = setTimeout(() => setShowUpsell(true), 1500);
        }

        // Countdown timer
        const timerInterval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(upsellTimer);
            clearInterval(interval);
            clearInterval(timerInterval);
        };
    }, [showContent]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAddUpsell = () => {
        if (!upsell) return;
        dispatch({ type: 'ADD_TO_CART', payload: { product: upsell } });
        setUpsellAdded(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const upsellHalf = upsell ? (upsell.price ?? 0) / 2 : 0;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-28 pb-20 md:justify-center p-5 font-sans overflow-x-hidden">
            {/* Logo Header */}
            <div className="absolute top-8 left-8 z-10">
                <Link href="/" className="block">
                    <Image src="/assets/uni.png" alt="Low Religion Logo" width={180} height={45} priority className="h-[28px] w-auto lg:h-[38px] brightness-0" />
                </Link>
            </div>

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

            <AnimatePresence mode="wait">
                {!showContent ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-24 border-2 border-dashed border-black/10 rounded-[9999px]"
                            />
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                animate={{ scale: [0.8, 1.1, 0.8] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Package className="text-black" size={32} />
                            </motion.div>
                        </div>
                        <p className="font-bold tracking-widest uppercase text-xs text-gray-400">Securing your order...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl w-full text-center space-y-6 md:space-y-12 relative z-10"
                    >
                        {/* Header / Primary Message */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                                transition={{
                                    scale: { delay: 0.2, type: 'spring', damping: 12 },
                                    rotate: { delay: 0.2, duration: 0.5, ease: "easeInOut" }
                                }}
                                className="w-16 h-16 md:w-24 md:h-24 bg-black text-white rounded-none md:rounded-none flex items-center justify-center mx-auto shadow-2xl"
                            >
                                <Check size={32} className="md:w-10 md:h-10" strokeWidth={3} />
                            </motion.div>

                            <div className="space-y-2">
                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-none"
                                >
                                    Welcome to the family.
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-gray-500 text-base md:text-xl"
                                >
                                    Your order <span className="text-black font-bold">{order ? order.orderId : `#${orderNumber}`}</span> is confirmed and being prepared.
                                </motion.p>
                            </div>
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
                            <div className="bg-white rounded-none p-4 md:p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d8a4bc]/10 text-[#d8a4bc] rounded-none flex items-center justify-center shrink-0">
                                        <Gift size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs md:text-sm font-bold text-gray-900">Next drop gift</p>
                                        <p className="text-[10px] md:text-xs text-gray-500">15% OFF your next piece.</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-2 rounded-none border-2 border-dashed border-gray-200">
                                    <span className="font-mono font-bold text-sm md:text-lg tracking-wider">MATTERBABY</span>
                                </div>
                            </div>

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
                                                    <p className="text-sm font-semibold text-gray-900">{order.symbol || '$'}{((item.price ?? 0) * item.quantity).toFixed(2)}</p>
                                                    <p className="text-xs text-gray-400">{order.symbol || '$'}{(item.price ?? 0).toFixed(2)} each</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>{order.symbol || '$'}{order.subtotal.toFixed(2)}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-gray-600">
                                                <span>Discount{order.discountCode ? ` (${order.discountCode})` : ''}</span>
                                                <span>-{order.symbol || '$'}{order.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                                            <span>Total</span>
                                            <span>{order.symbol || '$'}{order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

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

                        {/* Post-Purchase Upsell Section */}
                        <AnimatePresence>
                            {showUpsell && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: 10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    className="pt-6 md:pt-12 border-t border-gray-100"
                                >
                                    <div className="bg-black rounded-none md:rounded-none p-6 md:p-12 relative overflow-hidden group">
                                        {/* Decorative Blur */}
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#d8a4bc]/20 rounded-none blur-[80px] -mr-24 -mt-24" />

                                        <div className="relative z-10 flex flex-col items-center md:flex-row md:items-center gap-6 md:gap-10 text-center md:text-left">
                                            <div className="w-28 h-28 md:w-40 md:h-40 bg-white rounded-none overflow-hidden shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                {upsell && upsell.images && upsell.images[0] ? (
                                                    <SupabaseImage src={upsell.images[0]} alt={upsell.name} width={160} height={160} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-4 md:space-y-6">
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                                                    <span className="bg-[#d8a4bc] text-black text-[9px] font-bold px-3 py-1 rounded-none uppercase tracking-widest">
                                                        Limited Offer
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-white/60 text-[9px] font-bold uppercase tracking-widest">
                                                        <Clock size={10} />
                                                        {formatTime(timeLeft)}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="text-xl md:text-3xl font-bold text-white tracking-tight leading-tight">Accessory of the Devout.</h3>
                                                    <p className="text-gray-400 text-[10px] md:text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                                                        Add {upsell ? `our ${upsell.name}` : 'the perfect finishing piece'} now for <span className="text-white font-bold">50% OFF</span>.
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-center md:justify-start gap-4">
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-gray-500 line-through text-[10px]">{upsell ? `${upsell.symbol || '$'}${(upsell.price ?? 0).toFixed(2)}` : '$0.00'}</span>
                                                        <span className="text-white font-bold text-lg md:text-xl">{upsell ? `${upsell.symbol || '$'}${upsellHalf.toFixed(2)}` : '$0.00'}</span>
                                                    </div>

                                                    <button
                                                        onClick={handleAddUpsell}
                                                        disabled={upsellAdded || !upsell}
                                                        className={`px-6 md:px-8 py-3 md:py-4 rounded-none font-bold text-[11px] md:text-sm transition-all flex items-center justify-center gap-2 ${upsellAdded
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-white text-black hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {upsellAdded ? (
                                                            <><Check size={16} /> Added</>
                                                        ) : (
                                                            <>Add <Sparkles size={14} /></>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Package, Heart, ArrowRight, ShoppingBag, Sparkles, Gift, Clock } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useCart } from '@/lib/cart-context';

export default function SuccessPage() {
    const { dispatch } = useCart();
    const [showContent, setShowContent] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [orderNumber] = useState(() => Math.floor(100000 + Math.random() * 900000));
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [upsellAdded, setUpsellAdded] = useState(false);

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
        setUpsellAdded(true);
        // In a real app, this would call an API to update the order
        // For now, we'll just show a success state
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-10 pb-20 md:justify-center p-5 font-sans overflow-x-hidden">
            {/* Background Sparkles / Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, 90, 180]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-[#d8a4bc]/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.3, 0.1],
                        rotate: [180, 90, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-black/5 rounded-full blur-3xl"
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
                                className="w-24 h-24 border-2 border-dashed border-black/10 rounded-full"
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
                                className="w-16 h-16 md:w-24 md:h-24 bg-black text-white rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto shadow-2xl"
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
                                    Your order <span className="text-black font-bold">#{orderNumber}</span> is being prepared.
                                </motion.p>
                            </div>
                        </div>

                        {/* Gratitude & Info Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            className="bg-gray-50 border border-gray-100 rounded-[30px] md:rounded-[40px] p-6 md:p-10 space-y-6 md:space-y-8 shadow-sm"
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
                            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d8a4bc]/10 text-[#d8a4bc] rounded-xl flex items-center justify-center shrink-0">
                                        <Gift size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs md:text-sm font-bold text-gray-900">Next drop gift</p>
                                        <p className="text-[10px] md:text-xs text-gray-500">15% OFF your next piece.</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-2 rounded-full border-2 border-dashed border-gray-200">
                                    <span className="font-mono font-bold text-sm md:text-lg tracking-wider">FAMILY15</span>
                                </div>
                            </div>
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
                                className="w-full sm:w-auto bg-black text-white px-10 py-5 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 group"
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
                                    <div className="bg-black rounded-[30px] md:rounded-[40px] p-6 md:p-12 relative overflow-hidden group">
                                        {/* Decorative Blur */}
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#d8a4bc]/20 rounded-full blur-[80px] -mr-24 -mt-24" />

                                        <div className="relative z-10 flex flex-col items-center md:flex-row md:items-center gap-6 md:gap-10 text-center md:text-left">
                                            <div className="w-28 h-28 md:w-40 md:h-40 bg-white rounded-2xl overflow-hidden shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                <img
                                                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop"
                                                    alt="Signature Tote Bag"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 space-y-4 md:space-y-6">
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                                                    <span className="bg-[#d8a4bc] text-black text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
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
                                                        Add our Signature Raw Canvas Tote now for <span className="text-white font-bold">50% OFF</span>.
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-center md:justify-start gap-4">
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-gray-500 line-through text-[10px]">$45</span>
                                                        <span className="text-white font-bold text-lg md:text-xl">$22.50</span>
                                                    </div>

                                                    <button
                                                        onClick={handleAddUpsell}
                                                        disabled={upsellAdded}
                                                        className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-[11px] md:text-sm transition-all flex items-center justify-center gap-2 ${upsellAdded
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

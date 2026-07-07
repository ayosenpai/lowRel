'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- LAYOUT CONFIGURATION ---
// Adjust these values to quickly change the look and feel of the popup
const LAYOUT_CONFIG = {
    modalWidth: 'max-w-[400px] md:max-w-2xl',
    imageWidthDesktop: 'md:w-[45%]',
    contentPadding: 'p-8 md:p-12',
    // Spacing between elements
    spacingTitle: 'mb-1',
    spacingDescription: 'mb-4',
    spacingForm: 'space-y-4',
    spacingFooter: 'mt-6 pt-4',

    // Font Sizes
    fontTitle: 'text-2xl md:text-5xl',
    fontDescription: 'text-[11px] md:text-xs',
    fontFooter: 'text-[10px]',
};

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // Here you would typically call your subscription API
            setIsSubscribed(true);
            // Automatically close after a delay if subscribed
            setTimeout(() => {
                onClose();
            }, 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 touch-none">
                    {/* Backdrop Animation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                                mass: 1
                            }
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.95,
                            y: 10,
                            transition: { duration: 0.2 }
                        }}
                        className={`w-full ${LAYOUT_CONFIG.modalWidth} bg-white shadow-2xl overflow-hidden font-sans relative flex flex-col md:flex-row shadow-black/20 z-10`}
                    >

                        {/* Aspect Ratio Image Container */}
                        <div className={`relative w-full ${LAYOUT_CONFIG.imageWidthDesktop} bg-gray-100 overflow-hidden aspect-[15/16] md:aspect-auto`}>
                            <Image
                                src="/products/img (4).png"
                                alt="Newsletter Promo"
                                fill
                                unoptimized={true}
                                sizes="(max-width: 768px) 100vw, 300px"
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                priority
                            />
                            <div className="absolute inset-0 bg-black/5" />
                        </div>

                        {/* Content Side */}
                        <div className={`flex-1 ${LAYOUT_CONFIG.contentPadding} flex flex-col justify-center text-center md:text-left relative`}>
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6 flex justify-center md:justify-start">
                                <div className="w-8 h-8 bg-black flex items-center justify-center">
                                    <span className="text-white font-black text-sm">LR</span>
                                </div>
                            </div>

                            <h2 className={`font-black tracking-tighter uppercase leading-tight ${LAYOUT_CONFIG.fontTitle} ${LAYOUT_CONFIG.spacingTitle}`}>
                                {isSubscribed ? "YOU'RE IN THE CULT" : "JOIN THE CULT"}
                            </h2>

                            <p className={`text-gray-500 uppercase tracking-widest font-bold leading-relaxed ${LAYOUT_CONFIG.fontDescription} ${LAYOUT_CONFIG.spacingDescription}`}>
                                {isSubscribed
                                    ? "Check your email for your welcome discount code."
                                    : "GET 15% OFF YOUR FIRST ORDER + EARLY ACCESS TO DROPS."}
                            </p>

                            {!isSubscribed ? (
                                <form onSubmit={handleSubmit} className={`${LAYOUT_CONFIG.spacingForm} max-w-sm mx-auto md:mx-0`}>
                                    <Input
                                        type="email"
                                        placeholder="ENTER YOUR EMAIL"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 border-gray-200 rounded-none text-center md:text-left font-bold tracking-wider placeholder:text-gray-400 focus-visible:ring-black px-4 text-xs"
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-black text-white hover:bg-gray-900 rounded-none uppercase font-black tracking-widest text-xs transition-all"
                                    >
                                        SUBSCRIBE <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-[10px] text-gray-400 hover:text-black uppercase tracking-widest font-bold mt-4 block mx-auto md:mx-0 underline transition-colors"
                                    >
                                        NO THANKS, I'LL PAY FULL PRICE
                                    </button>
                                </form>
                            ) : (
                                <div className="py-2 flex justify-center md:justify-start">
                                    <div className="inline-block px-8 py-3 bg-black text-white font-black uppercase tracking-widest text-[10px] border border-black animate-pulse">
                                        Subscription Confirmed
                                    </div>
                                </div>
                            )}

                            <div className={`border-t border-gray-50 text-gray-300 uppercase tracking-widest leading-loose ${LAYOUT_CONFIG.fontFooter} ${LAYOUT_CONFIG.spacingFooter}`}>
                                *By subscribing you agree to our privacy policy. No spam.
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

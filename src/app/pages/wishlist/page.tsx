"use client";

import React, { useState, useEffect, useActionState } from 'react';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { useWishlist } from '@/lib/wishlist-context';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { login } from '@/app/login/actions';
import SupabaseImage from '@/components/SupabaseImage';

export default function WishlistPage() {
    const { state, dispatch } = useWishlist();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Auth state for the inline login form
    const [loginState, loginAction, isPending] = useActionState(login, null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        }
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-white text-black pt-[100px] font-sans">
                <Header variant="solid" />
                <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12">
                    {/* Breadcrumbs */}
                    <nav className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-8 text-center">
                        <span className="lowrel-link">Home / My Wishlist</span>
                    </nav>

                    <div className="max-w-[380px] mx-auto text-center">
                        <h1 className="lowrel-header text-2xl mb-3 uppercase">
                            Wishlist
                        </h1>
                        <p className="text-[9px] font-black mb-10 uppercase tracking-widest text-gray-500">
                            Love it? Sign in and add it to ur wishlist
                        </p>

                        <form action={loginAction} className="space-y-4">
                            <div className="space-y-1 text-left">
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="EMAIL"
                                    required
                                    className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                                />
                            </div>

                            <div className="space-y-1 text-left relative">
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="PASSWORD"
                                    required
                                    className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                                />
                                <div className="flex justify-end mt-2">
                                    <button type="button" className="lowrel-link text-[8px] text-gray-400 hover:text-black transition-colors uppercase font-black">
                                        Forgot password?
                                    </button>
                                </div>
                            </div>

                            {loginState?.error && (
                                <p className="lowrel-link text-red-500 text-[10px] uppercase font-black text-center">{loginState.error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-black text-white py-3.5 text-xs hover:bg-gray-900 transition-colors disabled:opacity-50 mt-2"
                            >
                                <span className="lowrel-header tracking-[0.2em]">
                                    {isPending ? 'SIGNING IN...' : 'SIGN IN'}
                                </span>
                            </button>
                        </form>

                        <div className="mt-8">
                            <Link
                                href="/login"
                                className="lowrel-link text-[10px] hover:text-gray-600 transition-colors uppercase underline underline-offset-4 decoration-1 font-black"
                            >
                                Create account
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white text-black pt-[100px] font-sans">
            <Header variant="solid" />

            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12">
                <div className="text-center mb-10">
                    <h1 className="lowrel-header text-2xl uppercase">
                        Your Wishlist ({state.items.length})
                    </h1>
                </div>

                {state.items.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {state.items.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative"
                                >
                                    <button
                                        onClick={() => dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id })}
                                        className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <Link href={`/products/${product.handle}`} className="block">
                                        <div className="aspect-[3/4] relative bg-gray-100 mb-4 overflow-hidden">
                                            <SupabaseImage
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {product.isSale && (
                                                <div className="absolute top-2 left-2 bg-[#ff69b4] text-black text-[10px] font-black px-2 py-1 uppercase">
                                                    Sale
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <h3 className="text-xs font-black uppercase tracking-widest truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                                {product.symbol || '$'} {product.price?.toFixed(2)}
                                            </p>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => window.location.href = `/products/${product.handle}`}
                                        className="w-full mt-4 border border-black py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag className="w-3 h-3" />
                                        Select Options
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto uppercase text-xs tracking-widest font-bold">
                            Your wishlist is empty
                        </p>
                        <Link
                            href="/collections/all"
                            className="inline-block bg-black text-white px-8 py-3 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HELP_CATEGORIES, HELP_ARTICLES } from '@/lib/constants/help-navigation';
import { ChevronRight, HelpCircle, X, ChevronDown, Menu as MenuIcon, Home } from 'lucide-react';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const currentArticle = HELP_ARTICLES.find(a => a.path === pathname);
    const isHub = pathname === '/help';

    // Toggle body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    // If we are on the main help hub, don't wrap in the sidebar layout
    if (isHub) {
        return <div className="min-h-screen bg-white">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d8a4bc]/20">

            {/* Mobile Sticky Navigation Breadcrumb - Fixed "Botched" feel */}
            <div className="md:hidden sticky top-0 z-[100] bg-white border-b border-gray-100 flex items-center justify-between px-6 h-14">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <Home size={18} className="text-black" />
                    </Link>
                    <Link href="/help" className="p-1 px-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">Help</Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
                        {currentArticle?.title || 'Topics'}
                    </span>
                </div>

                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <MenuIcon size={18} className="text-black" />
                </button>
            </div>

            {/* Mobile Full-Screen Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-white md:hidden overflow-y-auto"
                    >
                        <div className="p-8 space-y-12">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-[#d8a4bc]">Index</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-gray-50 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-10">
                                {HELP_CATEGORIES.map((category) => (
                                    <div key={category.id} className="space-y-5">
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 border-b border-gray-50 pb-2">
                                            {category.title}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {category.items.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`group flex items-center justify-between py-2 text-sm transition-all ${pathname === item.path ? 'text-[#d8a4bc]' : 'text-black hover:translate-x-1'
                                                        }`}
                                                >
                                                    <span className="font-black uppercase tracking-widest leading-none">{item.title}</span>
                                                    {pathname === item.path && <div className="w-1.5 h-1.5 bg-[#d8a4bc] rounded-full" />}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10 space-y-4 border-t border-gray-100">
                                <Link
                                    href="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-3 w-full py-4 border border-black rounded-full text-black text-xs font-black uppercase tracking-[0.3em]"
                                >
                                    <Home size={16} />
                                    Home
                                </Link>
                                <Link
                                    href="/help/contact"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full py-5 bg-black text-white text-center text-xs font-black uppercase tracking-[0.3em] rounded-full shadow-2xl active:scale-95 transition-transform"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto max-w-7xl px-4 py-8 md:py-16">
                <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-start">

                    {/* Desktop Sidebar - Premium Minimalist */}
                    <aside className="hidden md:block w-72 shrink-0 sticky top-24 space-y-8">
                        <Link
                            href="/"
                            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                        >
                            <Home size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="uppercase tracking-widest text-[11px] font-black">Back to Home</span>
                        </Link>

                        <div className="space-y-8">
                            {HELP_CATEGORIES.map((category) => (
                                <div key={category.id} className="space-y-5">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 pl-4 border-l border-gray-100">
                                        {category.title}
                                    </h3>
                                    <nav className="space-y-1">
                                        {category.items.map((item) => {
                                            const isActive = pathname === item.path;
                                            return (
                                                <Link
                                                    key={item.id}
                                                    href={item.path}
                                                    className={`group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${isActive
                                                        ? 'bg-[#d8a4bc]/5 text-[#d8a4bc]'
                                                        : 'text-gray-400 hover:text-black hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="uppercase tracking-widest text-[11px] font-black">{item.title}</span>
                                                    <ChevronRight
                                                        size={12}
                                                        className={`transition-all duration-300 ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
                                                    />
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Need Assistance?</p>
                            <Link
                                href="/help/contact"
                                className="block text-center bg-black text-white py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#d8a4bc] hover:shadow-xl hover:shadow-[#d8a4bc]/20 transition-all font-sans"
                            >
                                Reach Out
                            </Link>
                        </div>
                    </aside>

                    {/* Main Content Area - Articles */}
                    <main className="flex-1 min-w-0 md:pl-8 border-l border-gray-50">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

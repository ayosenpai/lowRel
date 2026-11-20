'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HELP_CATEGORIES, HELP_ARTICLES } from '@/lib/constants/help-navigation';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const currentArticle = HELP_ARTICLES.find((article) => article.path === pathname);
    const isHub = pathname === '/help';

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    // The hub brings its own full-width search and directory layout.
    if (isHub) {
        return <div className="min-h-screen bg-white">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d8a4bc]/20">
            {/* Mobile top bar */}
            <div className="sticky top-0 z-[100] flex h-14 items-center justify-between border-b border-gray-100 bg-white px-5 md:hidden">
                <div className="flex min-w-0 items-center gap-2">
                    <Link
                        href="/"
                        aria-label="Back to store"
                        className="rounded-full px-2 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 transition-colors hover:bg-gray-50 hover:text-black"
                    >
                        Home
                    </Link>
                    <Link
                        href="/help"
                        className="rounded-full bg-black px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white"
                    >
                        Help
                    </Link>
                    <span className="truncate text-[10px] font-black uppercase tracking-widest text-gray-300">
                        {currentArticle?.title || 'Topics'}
                    </span>
                </div>

                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open help menu"
                    className="rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-gray-50"
                >
                    Menu
                </button>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] overflow-y-auto bg-white md:hidden"
                    >
                        <div className="space-y-10 p-6 pb-16">
                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                                        Low Religion
                                    </p>
                                    <p className="text-lg font-black uppercase tracking-tighter">
                                        Help Center
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-label="Close help menu"
                                    className="rounded-full bg-gray-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="space-y-8">
                                {HELP_CATEGORIES.map((category) => (
                                    <div key={category.id} className="space-y-3">
                                        <h3 className="border-b border-gray-100 pb-2 text-[9px] font-black uppercase tracking-[0.35em] text-gray-300">
                                            {category.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {category.items.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`flex items-center justify-between rounded-xl px-2 py-2.5 text-sm transition-all ${
                                                        pathname === item.path
                                                            ? 'text-[#d8a4bc]'
                                                            : 'text-black hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className="font-black uppercase tracking-widest leading-none">
                                                        {item.title}
                                                    </span>
                                                    {pathname === item.path && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#d8a4bc]" />
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t border-gray-100 pt-8">
                                <Link
                                    href="/help#search"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-4 text-[10px] font-black uppercase tracking-[0.25em]"
                                >
                                    Search all topics
                                </Link>
                                <Link
                                    href="/help/contact"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full rounded-full bg-black py-4 text-center text-[10px] font-black uppercase tracking-[0.25em] text-white"
                                >
                                    Contact support
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
                <div className="flex items-start gap-12 lg:gap-16">
                    {/* Desktop sidebar */}
                    <aside className="sticky top-24 hidden w-60 shrink-0 space-y-7 md:block lg:w-64">
                        <Link href="/help" className="block space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                                Low Religion
                            </p>
                            <p className="text-xl font-black uppercase tracking-tighter">
                                Help Center
                            </p>
                        </Link>

                        <Link
                            href="/help#search"
                            className="flex items-center justify-between rounded-full border border-gray-100 bg-gray-50/60 px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 transition-all hover:border-black hover:text-black"
                        >
                            Search articles
                        </Link>

                        <nav className="space-y-7" aria-label="Help topics">
                            {HELP_CATEGORIES.map((category) => (
                                <div key={category.id} className="space-y-2">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-300">
                                        {category.title}
                                    </h3>
                                    <div className="space-y-0.5">
                                        {category.items.map((item) => {
                                            const isActive = pathname === item.path;
                                            return (
                                                <Link
                                                    key={item.id}
                                                    href={item.path}
                                                    className={`group flex items-center justify-between rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                                                        isActive
                                                            ? 'bg-[#d8a4bc]/10 text-[#b87d95]'
                                                            : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                                                    }`}
                                                >
                                                    <span>{item.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>

                        <div className="rounded-[24px] border border-gray-100 bg-gray-50/60 p-5">
                            <Link
                                href="/help/contact"
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-black transition-colors hover:text-[#b87d95]"
                            >
                                Contact support →
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-black uppercase tracking-[0.15em] text-gray-300">
                            <Link href="/help/privacy" className="hover:text-black">
                                Privacy
                            </Link>
                            <Link href="/help/terms" className="hover:text-black">
                                Terms
                            </Link>
                            <Link href="/help/returns" className="hover:text-black">
                                Returns
                            </Link>
                        </div>
                    </aside>

                    {/* Article content */}
                    <main className="min-w-0 max-w-4xl flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HELP_CATEGORIES, HELP_ARTICLES } from '@/lib/constants/help-navigation';

const POPULAR_SEARCHES = ['Shipping', 'Returns', 'Size guide', 'Payment'];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const query = searchQuery.trim().toLowerCase();

    const results = useMemo(() => {
        if (!query) return [];
        return HELP_ARTICLES.filter(
            (article) =>
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query) ||
                article.category.toLowerCase().includes(query)
        );
    }, [query]);

    return (
        <div className="min-h-screen bg-white text-black selection:bg-[#d8a4bc]/20">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-gray-100">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d8a4bc]/10 blur-[90px]" />

                <div className="relative mx-auto max-w-5xl px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-16">
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400"
                    >
                        <Link href="/" className="transition-colors hover:text-black">
                            Home
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-500">Help Center</span>
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl space-y-5"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#b87d95]">
                            Help Center
                        </p>
                        <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter md:text-6xl">
                            How can we
                            <br />
                            <span className="text-[#d8a4bc]">help you?</span>
                        </h1>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        id="search"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="mt-8 max-w-xl scroll-mt-28"
                    >
                        <div className="relative">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for shipping, returns, sizing…"
                                aria-label="Search help articles"
                                className="w-full rounded-full border border-gray-200 bg-white px-5 py-4 pr-12 text-sm font-medium text-black outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-[#d8a4bc]/10"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Clear search"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {!query && (
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">
                                    Popular
                                </span>
                                {POPULAR_SEARCHES.map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        onClick={() => setSearchQuery(term)}
                                        className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-gray-500 transition-all hover:border-black hover:text-black"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Directory */}
            <section className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
                {query ? (
                    <div className="space-y-6">
                        <div className="flex items-baseline justify-between gap-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                                {results.length} result{results.length === 1 ? '' : 's'} for “{searchQuery.trim()}”
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 transition-colors hover:text-black"
                            >
                                Clear
                            </button>
                        </div>

                        {results.length > 0 ? (
                            <div className="divide-y divide-gray-100 rounded-[28px] border border-gray-100">
                                {results.map((article) => (
                                    <Link
                                        key={article.path}
                                        href={article.path}
                                        className="group flex items-start justify-between gap-6 p-5 transition-colors hover:bg-gray-50/70 md:p-6"
                                    >
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d8a4bc]">
                                                {article.category}
                                            </p>
                                            <h3 className="text-base font-black uppercase tracking-tight">
                                                {article.title}
                                            </h3>
                                        </div>
                                        <span className="mt-1 shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-black">
                                            →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[28px] border border-gray-100 bg-gray-50/60 px-6 py-14 text-center">
                                <p className="text-sm font-black uppercase tracking-widest">
                                    Nothing matched that.
                                </p>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                                    Try a simpler word, or send us a message and we’ll answer
                                    directly.
                                </p>
                                <Link
                                    href="/help/contact"
                                    className="mt-6 inline-flex items-center rounded-full bg-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#d8a4bc] hover:text-black"
                                >
                                    Contact support
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <h2 className="text-2xl font-black uppercase tracking-tighter md:text-3xl">
                                Browse by topic
                            </h2>
                            <Link
                                href="/help/contact"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-black"
                            >
                                Contact us →
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {HELP_CATEGORIES.map((category, index) => (
                                <motion.section
                                    key={category.id}
                                    initial={{ opacity: 0, y: 14 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex flex-col rounded-[28px] border border-gray-100 bg-white p-6 transition-colors hover:border-gray-200 md:p-7"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d8a4bc]">
                                                {String(index + 1).padStart(2, '0')}
                                            </p>
                                            <h3 className="mt-1 text-base font-black uppercase tracking-tight">
                                                {category.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-1 border-t border-gray-50 pt-4">
                                        {category.items.map((article) => (
                                            <Link
                                                key={article.id}
                                                href={article.path}
                                                className="group flex items-center justify-between gap-4 rounded-lg py-2 text-[13px] font-bold text-gray-700 transition-colors hover:text-black"
                                            >
                                                <span>{article.title}</span>
                                                <span className="shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[#d8a4bc]">
                                                    →
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.section>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Contact band */}
            <section className="border-t border-gray-100 bg-gray-50/60">
                <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8 md:py-14">
                    <div className="max-w-md space-y-2">
                        <h2 className="text-xl font-black uppercase tracking-tighter md:text-2xl">
                            Still need a hand?
                        </h2>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link
                            href="/help/contact"
                            className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[#d8a4bc] hover:text-black"
                        >
                            Contact support
                        </Link>
                        <a
                            href="mailto:support@lowreligion.com"
                            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:border-black"
                        >
                            support@lowreligion.com
                        </a>
                    </div>
                </div>
            </section>

            {/* Utility footer */}
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-8 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 md:px-8">
                <Link href="/help/privacy" className="hover:text-black">
                    Privacy policy
                </Link>
                <Link href="/help/terms" className="hover:text-black">
                    Terms of use
                </Link>
                <Link href="/help/shipping" className="hover:text-black">
                    Shipping
                </Link>
                <Link href="/help/returns" className="hover:text-black">
                    Start a return
                </Link>
                <Link href="/help/contact" className="hover:text-black">
                    Contact
                </Link>
                <Link href="/collections/all" className="ml-auto hover:text-black">
                    Continue shopping →
                </Link>
            </div>
        </div>
    );
}

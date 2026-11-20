'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HELP_ARTICLES } from '@/lib/constants/help-navigation';

export default function HelpPagination() {
    const pathname = usePathname();
    const currentIndex = HELP_ARTICLES.findIndex(article => article.path === pathname);

    if (currentIndex === -1) return null;

    const prevArticle = currentIndex > 0 ? HELP_ARTICLES[currentIndex - 1] : null;
    const nextArticle = currentIndex < HELP_ARTICLES.length - 1 ? HELP_ARTICLES[currentIndex + 1] : null;

    return (
        <nav aria-label="Help article pagination" className="grid gap-3 sm:grid-cols-2">
            {prevArticle ? (
                <Link
                    href={prevArticle.path}
                    className="group flex flex-col gap-2 rounded-[24px] border border-gray-100 p-5 transition-all hover:border-black hover:bg-gray-50/60"
                >
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
                        ← Previous
                    </span>
                    <span className="text-sm font-black uppercase tracking-tight">
                        {prevArticle.title}
                    </span>
                </Link>
            ) : (
                <div className="hidden sm:block" />
            )}

            {nextArticle ? (
                <Link
                    href={nextArticle.path}
                    className="group flex flex-col gap-2 rounded-[24px] border border-gray-100 p-5 text-left transition-all hover:border-black hover:bg-gray-50/60 sm:items-end sm:text-right"
                >
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
                        Next →
                    </span>
                    <span className="text-sm font-black uppercase tracking-tight">
                        {nextArticle.title}
                    </span>
                </Link>
            ) : (
                <div className="hidden sm:block" />
            )}
        </nav>
    );
}

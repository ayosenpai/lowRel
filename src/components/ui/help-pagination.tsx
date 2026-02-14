'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HELP_ARTICLES } from '@/lib/constants/help-navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HelpPagination() {
    const pathname = usePathname();
    const currentIndex = HELP_ARTICLES.findIndex(article => article.path === pathname);

    if (currentIndex === -1) return null;

    const prevArticle = currentIndex > 0 ? HELP_ARTICLES[currentIndex - 1] : null;
    const nextArticle = currentIndex < HELP_ARTICLES.length - 1 ? HELP_ARTICLES[currentIndex + 1] : null;

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between mt-12 md:mt-20 pt-12 border-t border-gray-100">
            {prevArticle ? (
                <Link
                    href={prevArticle.path}
                    className="w-full md:flex-1 group p-8 md:p-10 border border-gray-100 rounded-[48px] hover:border-black hover:bg-gray-50 flex flex-col items-start transition-all"
                >
                    <div className="flex items-center gap-3 text-gray-400 mb-4 group-hover:-translate-x-2 transition-transform">
                        <ArrowLeft size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Previous</span>
                    </div>
                    <p className="font-black text-black uppercase tracking-widest text-xs md:text-sm">{prevArticle.title}</p>
                </Link>
            ) : <div className="hidden md:block md:flex-1" />}

            {nextArticle ? (
                <Link
                    href={nextArticle.path}
                    className="w-full md:flex-1 group p-8 md:p-10 border border-black bg-black text-white rounded-[48px] hover:bg-[#d8a4bc] hover:text-black hover:border-[#d8a4bc] flex flex-col items-end transition-all shadow-2xl"
                >
                    <div className="flex items-center gap-3 text-gray-400 mb-4 group-hover:translate-x-2 transition-transform group-hover:text-black">
                        <span className="text-[10px] font-black uppercase tracking-widest">Next Topic</span>
                        <ArrowRight size={16} />
                    </div>
                    <p className="font-black uppercase tracking-widest text-xs md:text-sm">{nextArticle.title}</p>
                </Link>
            ) : <div className="hidden md:block md:flex-1" />}
        </div>
    );
}

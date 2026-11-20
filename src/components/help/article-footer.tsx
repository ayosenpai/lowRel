'use client';

import Link from 'next/link';
import { getRelatedArticles } from '@/lib/constants/help-navigation';
import HelpFeedback from '@/components/help/help-feedback';
import HelpPagination from '@/components/ui/help-pagination';

type ArticleFooterProps = {
    currentPath: string;
};

export default function ArticleFooter({ currentPath }: ArticleFooterProps) {
    const related = getRelatedArticles(currentPath);

    return (
        <div className="space-y-12 pt-2 md:space-y-16">
            <HelpFeedback />

            <section className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Related articles
                    </h2>
                    <Link
                        href="/help"
                        className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-black"
                    >
                        All topics →
                    </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {related.map((article) => (
                        <Link
                            key={article.path}
                            href={article.path}
                            className="group flex flex-col justify-between gap-6 rounded-[24px] border border-gray-100 p-5 transition-all hover:border-black hover:bg-gray-50/60"
                        >
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d8a4bc]">
                                    {article.category}
                                </p>
                                <h3 className="text-sm font-black uppercase leading-snug tracking-tight">
                                    {article.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="border-t border-gray-100 pt-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <Link href="/help/contact" className="text-black transition-colors hover:text-[#d8a4bc]">
                    Contact support →
                </Link>
            </div>

            <HelpPagination />
        </div>
    );
}

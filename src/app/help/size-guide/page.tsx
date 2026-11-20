'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ArticleHeader from '@/components/help/article-header';
import ArticleFooter from '@/components/help/article-footer';

const sizeCharts = [
    {
        category: 'Graphic tees',
        headers: ['Size', 'Chest', 'Length'],
        rows: [
            ['XS', '48cm', '66cm'],
            ['S', '51cm', '69cm'],
            ['M', '54cm', '72cm'],
            ['L', '57cm', '75cm'],
            ['XL', '60cm', '78cm'],
        ],
    },
    {
        category: 'Hoodies',
        headers: ['Size', 'Chest', 'Length'],
        rows: [
            ['S', '62cm', '68cm'],
            ['M', '65cm', '71cm'],
            ['L', '68cm', '74cm'],
            ['XL', '71cm', '77cm'],
        ],
    },
];

const fits = [
    {
        title: 'True to size',
        detail: 'A standard fit. Order your usual size for a clean, close silhouette.',
    },
    {
        title: 'Oversized',
        detail: 'Dropped shoulders and extra room. Size down if you want a standard look.',
    },
    {
        title: 'Boxy',
        detail: 'Wide through the body and slightly cropped. Structured and deliberate.',
    },
];

const measuring = [
    {
        step: '01',
        title: 'Chest',
        detail: 'Measure around the fullest part of your chest, keeping the tape horizontal.',
    },
    {
        step: '02',
        title: 'Length',
        detail: 'Measure from the highest point of the shoulder straight down to the hem.',
    },
    {
        step: '03',
        title: 'Compare',
        detail: 'Match your numbers to the garment measurements below. If you’re between sizes, size up.',
    },
];

export default function SizeGuidePage() {
    return (
        <div className="max-w-4xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="Support"
                title="Size Guide"
                updated="November 2026"
                readingTime="2 min read"
            />

            <div className="rounded-[20px] border border-[#d8a4bc]/30 bg-[#d8a4bc]/5 px-5 py-4">
                <p className="text-sm leading-relaxed text-gray-600">
                    These are <strong>garment measurements</strong>, not body measurements. Lay a
                    piece you already like flat and compare like for like.
                </p>
            </div>

            <section className="space-y-8">
                {sizeCharts.map((chart, index) => (
                    <motion.div
                        key={chart.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="space-y-4"
                    >
                        <div className="flex items-baseline justify-between gap-4">
                            <h2 className="text-lg font-black uppercase tracking-widest md:text-xl">
                                {chart.category}
                            </h2>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                                {chart.rows.length} sizes
                            </span>
                        </div>

                        <div className="-mx-1 overflow-x-auto px-1">
                            <table className="w-full min-w-[340px] text-left">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {chart.headers.map((header) => (
                                            <th
                                                key={header}
                                                className="py-3 pr-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {chart.rows.map((row) => (
                                        <tr
                                            key={row[0]}
                                            className="transition-colors hover:bg-gray-50/60"
                                        >
                                            {row.map((cell, cellIndex) => (
                                                <td
                                                    key={cellIndex}
                                                    className={`py-3.5 pr-4 text-sm ${
                                                        cellIndex === 0
                                                            ? 'font-black uppercase tracking-widest'
                                                            : 'font-medium text-gray-500'
                                                    }`}
                                                >
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ))}
            </section>

            <section className="space-y-5">
                <h2 className="text-lg font-black uppercase tracking-widest md:text-xl">
                    Fit notes
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                    {fits.map((fit, index) => (
                        <div
                            key={fit.title}
                            className="rounded-[24px] border border-gray-100 bg-gray-50/60 p-5"
                        >
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#b87d95]">
                                0{index + 1}
                            </p>
                            <h3 className="mt-2 text-sm font-black uppercase tracking-tight">
                                {fit.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                {fit.detail}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-5">
                <div>
                    <h2 className="text-lg font-black uppercase tracking-widest md:text-xl">
                        How to measure
                    </h2>
                </div>
                <div className="divide-y divide-gray-100 rounded-[24px] border border-gray-100 px-5">
                    {measuring.map((item) => (
                        <div key={item.step} className="flex items-start gap-4 py-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">
                                {item.step}
                            </span>
                            <div className="space-y-1">
                                <h3 className="text-[11px] font-black uppercase tracking-widest">
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-gray-500">
                                    {item.detail}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="flex justify-end">
                <Link
                    href="/help/contact"
                    className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#d8a4bc] hover:text-black"
                >
                    Ask us
                </Link>
            </div>

            <ArticleFooter currentPath="/help/size-guide" />
        </div>
    );
}

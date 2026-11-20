'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ArticleHeader from '@/components/help/article-header';
import ArticleFooter from '@/components/help/article-footer';

const sections = [
    {
        id: 'materials',
        number: '01',
        title: 'Materials over shortcuts',
        paragraphs: [
            'The market is flooded with polyester and synthetic alternatives, and finding the kind of fabrics I wanted to work with wasn’t always possible. Finding materials that actually align with what I believe in has been one of the biggest challenges. We’ve even had to get fabrics manufactured to make sure we could stick to our material choices and principles.',
            'It’s not the easiest or quickest way to do things, but that’s kind of the point.',
        ],
    },
    {
        id: 'pace',
        number: '02',
        title: 'Slow by design',
        paragraphs: [
            'I’d rather take my time, make fewer things and get them right than rush into producing more just because there’s a market for it.',
            'Slow and steady isn’t just how we’re working right now; it’s how I want this whole thing to grow.',
        ],
    },
    {
        id: 'people',
        number: '03',
        title: 'Who this is for',
        paragraphs: [
            'More than anything, I hope to find people who care about these things too. People who think about what they buy, where it comes from, how it’s made and how long it’ll stay with them.',
        ],
    },
    {
        id: 'process',
        number: '04',
        title: 'An honest work in progress',
        paragraphs: [
            'And I also want to be realistic about it. I’m human, and this is a growing project. We might get things wrong, run into limitations or fall short of our own expectations sometimes. I’m not going to pretend otherwise.',
            'What I can promise is that I’ll keep learning, keep questioning our choices and keep trying to do better. I’d rather be honest about that process than pretend to have everything figured out.',
        ],
    },
];

export default function BrandResponsibilityPage() {
    return (
        <div className="max-w-3xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="About"
                title="Brand Responsibility"
                updated="November 2026"
                readingTime="3 min read"
            />

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-2 border-[#d8a4bc] pl-5 text-lg font-medium leading-relaxed text-gray-700 md:pl-7 md:text-xl"
            >
                Low Religion isn’t something I’ve started with the intention of building a big,
                profit-driven business. Of course, I want it to grow, but not at the cost of the
                things I started it for.
            </motion.p>

            <div className="space-y-9 md:space-y-12">
                {sections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-28 space-y-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-300">
                                    {section.number}
                                </p>
                                <h2 className="text-base font-black uppercase tracking-widest md:text-lg">
                                    {section.title}
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-4 pl-12 text-[15px] leading-7 text-gray-600 md:text-base">
                            {section.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <section className="relative overflow-hidden rounded-[32px] bg-black p-8 text-white md:p-10">
                <div className="relative z-10 space-y-4">
                    <p className="text-xl font-black leading-tight tracking-tight md:text-2xl">
                        “It’s not the easiest or quickest way to do things, but that’s kind of the
                        point.”
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                        Low Religion
                    </p>
                </div>
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#d8a4bc]/10 blur-[80px]" />
            </section>

            <section className="space-y-4">
                <p className="text-sm leading-relaxed text-gray-500">
                    If this sounds like the kind of project you’d like to follow, have a look
                    around. And if you want the slightly longer version of how Low Religion
                    started, it’s here.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                        href="/collections/all"
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-black px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[#d8a4bc] hover:text-black"
                    >
                        Shop the pieces →
                    </Link>
                    <Link
                        href="/help/about"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:border-black"
                    >
                        About Us
                    </Link>
                </div>
            </section>

            <ArticleFooter currentPath="/help/brand-responsibility" />
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ArticleHeader from '@/components/help/article-header';
import ArticleFooter from '@/components/help/article-footer';

const principles = [
    {
        title: 'Materials first',
        description:
            'Finding fabrics that align with what I believe in has been one of the biggest challenges. I’d rather have materials made for us than compromise on what goes into a piece.',
    },
    {
        title: 'Fewer, better things',
        description:
            'I’d rather take my time, make fewer things and get them right than rush into producing more just because there’s a market for it.',
    },
    {
        title: 'Honest about the process',
        description:
            'This is a growing project. We might get things wrong or fall short sometimes. I’d rather be honest about that than pretend to have everything figured out.',
    },
];

export default function AboutPage() {
    return (
        <div className="max-w-4xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="About"
                title="About Us"
                updated="November 2026"
                readingTime="3 min read"
            />

            <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
                <div className="space-y-6">
                    <h2 className="text-lg font-black uppercase tracking-widest md:text-xl">
                        How it started
                    </h2>

                    <div className="space-y-5 text-[15px] leading-7 text-gray-600 md:text-base">
                        <p>
                            By day, I’m an architect. The rest of the time, I’m usually finding
                            something to make, alter, customise or completely DIY. I started making
                            my own clothes and accessories, and Low Religion grew out of that.
                        </p>
                        <p>
                            What began as a personal creative outlet slowly turned into something I
                            wanted to share with more people. Low Religion is my little attempt at
                            building a space for those who like their clothes a little different,
                            enjoy the unconventional, and don’t particularly care about fitting into
                            a mould.
                        </p>
                        <p>
                            Everything here is made mindfully, with thought put into the materials,
                            the process and the little details. It’s not about making more just for
                            the sake of it, but about making things worth keeping and wearing.
                        </p>
                        <p>
                            It’s still a growing project, and I’m figuring things out as I go. But
                            I’m really glad you’re here. Hopefully, you’ll find something that feels
                            a little like you.
                        </p>
                    </div>
                </div>

                <div className="space-y-5 rounded-[28px] border border-gray-100 bg-gray-50/60 p-6 md:p-8 lg:sticky lg:top-24">
                    <p className="text-xl font-bold leading-snug tracking-tight md:text-2xl">
                        “Not about making more just for the sake of it — about making things worth
                        keeping and wearing.”
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Low Religion
                    </p>
                    <Link
                        href="/help/brand-responsibility"
                        className="group inline-flex items-center gap-2 border-t border-gray-200 pt-5 text-[10px] font-black uppercase tracking-[0.15em] text-black transition-colors hover:text-[#b87d95]"
                    >
                        Read our brand responsibility →
                    </Link>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-lg font-black uppercase tracking-widest md:text-xl">
                    What I care about
                </h2>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {principles.map((principle, index) => (
                        <motion.div
                            key={principle.title}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.06 }}
                            className="space-y-4 rounded-[24px] border border-gray-100 bg-white p-5 transition-shadow hover:shadow-lg md:p-6"
                        >
                            <h3 className="text-sm font-black uppercase tracking-tight">
                                {principle.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-500">
                                {principle.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="relative overflow-hidden rounded-[32px] bg-black p-8 text-white md:p-12">
                <div className="relative z-10 max-w-2xl space-y-5">
                    <p className="text-2xl font-black leading-tight tracking-tight md:text-3xl">
                        “Slow and steady isn’t just how we’re working right now; it’s how I want
                        this whole thing to grow.”
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                        Low Religion
                    </p>
                </div>
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[#d8a4bc]/10 blur-[90px]" />
            </section>

            <section className="space-y-5 text-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter md:text-4xl">
                    Have a look around.
                </h2>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
                    It’s still a growing project, and I’m figuring things out as I go. Thanks for
                    being here.
                </p>
                <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                    <Link
                        href="/collections/all"
                        className="group inline-flex items-center gap-3 rounded-full bg-black px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[#d8a4bc] hover:text-black"
                    >
                        Shop the pieces →
                    </Link>
                    <Link
                        href="/help/brand-responsibility"
                        className="inline-flex items-center gap-3 rounded-full border border-gray-200 px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:border-black"
                    >
                        Brand responsibility
                    </Link>
                </div>
            </section>

            <ArticleFooter currentPath="/help/about" />
        </div>
    );
}

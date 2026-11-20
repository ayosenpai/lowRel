'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ArticleHeader from '@/components/help/article-header';
import ArticleSection from '@/components/help/article-section';
import ArticleFooter from '@/components/help/article-footer';

const quickFacts = [
    {
        title: '30 days',
        detail: 'From delivery',
    },
    {
        title: 'Unworn',
        detail: 'Tags still attached',
    },
    {
        title: 'Email us',
        detail: 'To start a return',
    },
];

const steps = [
    {
        step: '01',
        title: 'Email us',
        description:
            'Send your order number, the item you want to return and whether you’d like a refund or exchange.',
    },
    {
        step: '02',
        title: 'Pack it up',
        description:
            'Pop the item back in its packaging with the tags attached. Make sure it’s unworn and unwashed.',
    },
    {
        step: '03',
        title: 'Hand it over',
        description:
            'We’ll arrange a pickup where we can, or send you the drop-off details for your courier.',
    },
];

const policy = [
    { condition: 'Window', detail: '30 days from delivery' },
    { condition: 'Condition', detail: 'Unworn, unwashed, tags on' },
    { condition: 'Return shipping', detail: 'Free within India' },
    { condition: 'Refund time', detail: '5–7 working days after check' },
];

export default function ReturnsPage() {
    return (
        <div className="max-w-4xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="Shipping & Returns"
                title="Returns & Exchanges"
                updated="November 2026"
                readingTime="2 min read"
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-2"
            >
                {quickFacts.map((fact) => (
                    <div
                        key={fact.title}
                        className="rounded-[24px] border border-gray-100 bg-gray-50/60 p-4 md:p-5"
                    >
                        <h2 className="text-[10px] font-black uppercase tracking-widest">
                            {fact.title}
                        </h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {fact.detail}
                        </p>
                    </div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
                <section className="space-y-7">
                    <h2 className="text-lg font-black uppercase tracking-widest md:text-xl">
                        How to start a return
                    </h2>

                    <div className="space-y-7">
                        {steps.map((item) => (
                            <div key={item.step} className="flex items-start gap-5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
                                    {item.step}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-500">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-1">
                        <a
                            href="mailto:support@lowreligion.com?subject=Return%20request"
                            className="group inline-flex items-center gap-3 rounded-full bg-black px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[#d8a4bc] hover:text-black"
                        >
                            Email a return request →
                        </a>
                    </div>
                </section>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-widest md:text-xl">
                            The policy
                        </h2>
                        <div className="rounded-[24px] border border-gray-100 px-5">
                            {policy.map((item) => (
                                <div
                                    key={item.condition}
                                    className="flex items-center justify-between gap-4 border-b border-gray-50 py-3.5 last:border-0"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        {item.condition}
                                    </span>
                                    <span className="text-right text-[10px] font-black uppercase tracking-widest">
                                        {item.detail}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-[24px] bg-black p-6 text-white">
                        <h3 className="text-sm font-black uppercase tracking-tight">Exchanges</h3>
                        <p className="text-xs leading-relaxed text-gray-400">
                            Need a different size? Ask for an exchange in the same email. We’ll
                            reserve the size if it’s in stock and send it once your original item
                            is on its way back.
                        </p>
                        <p className="text-xs leading-relaxed text-gray-400">
                            If the size you want has sold out, we’ll refund you instead and let
                            you know.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-10 md:space-y-12">
                <ArticleSection title="What we can accept">
                    <p>
                        Items must be unworn, unwashed and in the condition you received them,
                        with all original tags attached. Please don’t remove tags or wear an item
                        out before deciding to return it — we can’t accept pieces that have been
                        used.
                    </p>
                    <p>
                        If an item was marked final sale at checkout, it can’t be returned unless
                        it arrived damaged or incorrect. Sale items that weren’t marked final sale
                        follow the same 30-day window as everything else.
                    </p>
                </ArticleSection>

                <ArticleSection title="Refunds">
                    <p>
                        Once your return reaches us, we’ll check it and email you to confirm.
                        Refunds are issued to your original payment method through Razorpay within{' '}
                        <strong>5–7 working days</strong> of that check. Your bank may take a few
                        extra days to show it.
                    </p>
                    <p>
                        We can’t refund the original shipping cost unless the item was faulty or
                        we sent the wrong thing.
                    </p>
                </ArticleSection>

                <ArticleSection title="Faulty or wrong items">
                    <p>
                        If something arrives damaged, faulty or isn’t what you ordered, email us
                        within 48 hours of delivery with your order number and photos of the item
                        and packaging. We’ll cover the return and make it right.
                    </p>
                </ArticleSection>

                <ArticleSection title="Cancellations">
                    <p>
                        Changed your mind before dispatch? Email us straight away. If the order
                        hasn’t left us yet, we’ll cancel it and refund you. Once it’s dispatched,
                        it becomes a normal return.
                    </p>
                </ArticleSection>
            </div>

            <ArticleFooter currentPath="/help/returns" />
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ArticleHeader from '@/components/help/article-header';
import ArticleSection from '@/components/help/article-section';
import ArticleFooter from '@/components/help/article-footer';

const quickFacts = [
    {
        title: 'Free shipping',
        detail: 'On every order in India',
    },
    {
        title: '5–7 days',
        detail: 'After dispatch',
    },
    {
        title: '1–2 days',
        detail: 'Dispatch time',
    },
];

export default function ShippingPage() {
    return (
        <div className="max-w-4xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="Shipping & Returns"
                title="Shipping"
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

            <div className="space-y-10 md:space-y-12">
                <ArticleSection title="Where we ship">
                    <p>
                        Low Religion currently ships within <strong>India only</strong>. The
                        checkout is set up for Indian addresses and prices are shown in INR.
                    </p>
                    <p>
                        If you’re outside India and want to order something, email{' '}
                        <a
                            href="mailto:support@lowreligion.com"
                            className="font-semibold text-black underline decoration-[#d8a4bc] underline-offset-4"
                        >
                            support@lowreligion.com
                        </a>{' '}
                        and we’ll see what we can arrange.
                    </p>
                </ArticleSection>

                <ArticleSection title="Cost and delivery time">
                    <p>
                        Standard shipping is <strong>free on every order</strong>. Delivery
                        usually takes <strong>5–7 business days</strong> after your order is
                        dispatched. Remote pin codes and public holidays can add a little time.
                    </p>
                    <p>
                        We don’t currently offer express or overnight shipping at checkout. If
                        you need something urgently, message us before ordering and we’ll be
                        honest about whether we can help.
                    </p>
                </ArticleSection>

                <ArticleSection title="Processing and dispatch">
                    <p>
                        Orders are packed and dispatched within <strong>1–2 business days</strong>{' '}
                        (Monday to Saturday, excluding public holidays). Orders placed on a Sunday
                        or public holiday start processing on the next working day.
                    </p>
                    <p>
                        Pieces are made in small runs, so occasionally an item may need an extra
                        day or two. If that happens, we’ll email you rather than leave you
                        guessing.
                    </p>
                </ArticleSection>

                <ArticleSection title="Tracking your order">
                    <p>
                        Once your order is dispatched, you’ll receive an email with tracking
                        details. Sometimes tracking can take a day to start updating after pickup.
                    </p>
                    <p>
                        If tracking hasn’t moved for more than five business days, get in touch and
                        we’ll look into it with the courier. Check your spam folder first — the
                        email may have landed there.
                    </p>
                </ArticleSection>

                <ArticleSection title="Changing your address">
                    <p>
                        Email us as soon as possible with your order number. If the order hasn’t
                        been dispatched yet, we may be able to update the address. Once it’s with
                        the courier, we can’t change it.
                    </p>
                </ArticleSection>

                <ArticleSection title="Lost, delayed or damaged parcels">
                    <p>
                        If your order arrives damaged or the wrong item was sent, email us within
                        48 hours of delivery with your order number and clear photos of the item
                        and packaging. We’ll sort it out from there.
                    </p>
                    <p>
                        If tracking says delivered but nothing arrived, check with neighbours and
                        your building reception first, then contact us. We’ll work through it with
                        the courier.
                    </p>
                </ArticleSection>
            </div>

            <div className="flex justify-end">
                <Link
                    href="/help/contact"
                    className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#d8a4bc] hover:text-black"
                >
                    Contact support
                </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                <span>Shipping within India</span>
                <span>Tracked delivery</span>
            </div>

            <ArticleFooter currentPath="/help/shipping" />
        </div>
    );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ArticleHeader from '@/components/help/article-header';
import ArticleFooter from '@/components/help/article-footer';

type FaqItem = {
    question: string;
    answer: string;
};

type FaqGroup = {
    category: string;
    items: FaqItem[];
};

const FAQS: FaqGroup[] = [
    {
        category: 'Orders & payment',
        items: [
            {
                question: 'What payment methods do you accept?',
                answer:
                    'Checkout runs through Razorpay, which supports UPI, credit and debit cards, net banking and most popular wallets. You’ll see the available options after you continue to payment.',
            },
            {
                question: 'How do I know my order went through?',
                answer:
                    'You’ll get a confirmation email as soon as your payment is confirmed. If it isn’t there within 15 minutes, check your spam folder, then email us with your name and the email you used.',
            },
            {
                question: 'Can I change or cancel my order?',
                answer:
                    'Email support@lowreligion.com as soon as possible with your order number. If the order hasn’t been dispatched, we can usually change or cancel it. Once it’s with the courier, it becomes a normal return.',
            },
            {
                question: 'Can I use a discount code after ordering?',
                answer:
                    'Codes need to be added at checkout, and only one code can be used per order. We can’t apply a code to an order after it’s been placed.',
            },
        ],
    },
    {
        category: 'Shipping',
        items: [
            {
                question: 'Where do you ship?',
                answer:
                    'We currently ship within India only. If you’re outside India and want to order, email us and we’ll let you know if we can arrange something.',
            },
            {
                question: 'How much is shipping and how long does it take?',
                answer:
                    'Standard shipping is free on every order. Delivery usually takes 5–7 business days after dispatch, and orders are dispatched within 1–2 business days.',
            },
            {
                question: 'How do I track my order?',
                answer:
                    'Once your order is dispatched, you’ll receive an email with tracking details. Tracking can take a day to start updating after pickup.',
            },
            {
                question: 'Can I change my delivery address?',
                answer:
                    'Email us immediately with your order number. If it hasn’t shipped yet we may be able to update it. Once it’s with the courier, the address is locked.',
            },
        ],
    },
    {
        category: 'Returns',
        items: [
            {
                question: 'What is your return window?',
                answer:
                    'You have 30 days from delivery. Items must be unworn, unwashed and have their original tags attached.',
            },
            {
                question: 'How do I start a return?',
                answer:
                    'Email support@lowreligion.com with your order number and the item you want to return. There’s no portal to fight with — we’ll reply with the next steps.',
            },
            {
                question: 'How long do refunds take?',
                answer:
                    'Once your return arrives and passes a quick check, we’ll refund you through Razorpay within 5–7 working days. Your bank may take a few more days to show it.',
            },
            {
                question: 'Can I exchange for another size?',
                answer:
                    'Yes, if the size is in stock. Ask for an exchange in your return email and we’ll reserve it where we can.',
            },
        ],
    },
    {
        category: 'Product & sizing',
        items: [
            {
                question: 'How do your pieces fit?',
                answer:
                    'Fit notes are on each product page, and our size guide has measurements for tees and hoodies. If you’re between sizes, size up for a looser fit or stay true to size for a closer one.',
            },
            {
                question: 'How should I care for my pieces?',
                answer:
                    'Wash cold and inside out, avoid tumble drying, and line dry in the shade. Materials for each piece are listed on its product page.',
            },
            {
                question: 'Will sold-out pieces come back?',
                answer:
                    'We work in small runs, so some pieces don’t come back. Join the newsletter to hear about restocks and latest arrivals first.',
            },
        ],
    },
];

export default function FAQsPage() {
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const query = searchQuery.trim().toLowerCase();

    const filteredFaqs = query
        ? FAQS.map((group) => ({
              ...group,
              items: group.items.filter(
                  (item) =>
                      item.question.toLowerCase().includes(query) ||
                      item.answer.toLowerCase().includes(query)
              ),
          })).filter((group) => group.items.length > 0)
        : FAQS;

    const toggleItem = (key: string) => {
        setOpenItems((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
        );
    };

    return (
        <div className="max-w-4xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="Support"
                title="Frequently Asked Questions"
                updated="November 2026"
                readingTime="2 min read"
            />

            <div>
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the FAQs…"
                    aria-label="Search frequently asked questions"
                    className="w-full rounded-full border border-gray-200 bg-white px-5 py-4 text-sm font-medium outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-[#d8a4bc]/10"
                />
            </div>

            {filteredFaqs.length === 0 ? (
                <div className="rounded-[24px] border border-gray-100 bg-gray-50/60 px-6 py-12 text-center">
                    <p className="text-sm font-black uppercase tracking-widest">
                        No answer for that.
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                        Try a different word, or send us the question directly.
                    </p>
                    <Link
                        href="/help/contact"
                        className="mt-5 inline-flex rounded-full bg-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                    >
                        Contact support
                    </Link>
                </div>
            ) : (
                <div className="space-y-9">
                    {filteredFaqs.map((group, groupIndex) => (
                        <section key={group.category} className="space-y-3">
                            <h2 className="border-b border-gray-100 pb-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                                {group.category}
                            </h2>

                            <div className="divide-y divide-gray-100 rounded-[24px] border border-gray-100">
                                {group.items.map((item, itemIndex) => {
                                    const key = `${groupIndex}-${itemIndex}`;
                                    const isOpen = openItems.includes(key);

                                    return (
                                        <div key={key}>
                                            <button
                                                type="button"
                                                onClick={() => toggleItem(key)}
                                                aria-expanded={isOpen}
                                                className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left md:px-6"
                                            >
                                                <span
                                                    className={`text-sm font-bold leading-snug transition-colors ${
                                                        isOpen ? 'text-black' : 'text-gray-700'
                                                    }`}
                                                >
                                                    {item.question}
                                                </span>
                                                <span
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black transition-all ${
                                                        isOpen
                                                            ? 'bg-black text-white'
                                                            : 'bg-gray-50 text-gray-400'
                                                    }`}
                                                >
                                                    {isOpen ? '−' : '+'}
                                                </span>
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{
                                                            duration: 0.25,
                                                            ease: 'easeOut',
                                                        }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="px-5 pb-5 text-sm leading-relaxed text-gray-500 md:px-6">
                                                            {item.answer}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            <div className="flex justify-end">
                <Link
                    href="/help/contact"
                    className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#d8a4bc] hover:text-black"
                >
                    Contact support
                </Link>
            </div>

            <ArticleFooter currentPath="/help/faqs" />
        </div>
    );
}

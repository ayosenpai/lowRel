'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import ArticleHeader from '@/components/help/article-header';
import ArticleFooter from '@/components/help/article-footer';
import { submitContactMessage, type ContactFormState } from '@/lib/actions/contact';

const initialState: ContactFormState = { status: 'idle' };

const details = [
    {
        label: 'Email',
        value: 'support@lowreligion.com',
        href: 'mailto:support@lowreligion.com',
    },
    {
        label: 'Response time',
        value: 'Usually 1–2 business days',
    },
    {
        label: 'Based in',
        value: 'India',
    },
];

export default function ContactPage() {
    const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);

    return (
        <div className="max-w-4xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="Support"
                title="Contact Support"
                updated="November 2026"
                readingTime="1 min read"
            />

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
                {/* Form */}
                <form action={formAction} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="contact-name"
                                className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400"
                            >
                                Full name
                            </label>
                            <input
                                id="contact-name"
                                type="text"
                                name="name"
                                placeholder="Your name"
                                required
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-[#d8a4bc]/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="contact-email"
                                className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400"
                            >
                                Email
                            </label>
                            <input
                                id="contact-email"
                                type="email"
                                name="email"
                                placeholder="you@email.com"
                                required
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-[#d8a4bc]/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="contact-order"
                            className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400"
                        >
                            Order number (optional)
                        </label>
                        <input
                            id="contact-order"
                            type="text"
                            name="orderNumber"
                            placeholder="e.g. LR-1042"
                            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-[#d8a4bc]/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="contact-message"
                            className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400"
                        >
                            Message
                        </label>
                        <textarea
                            id="contact-message"
                            name="message"
                            rows={6}
                            required
                            placeholder="Tell us what’s going on…"
                            className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-relaxed outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-[#d8a4bc]/10"
                        />
                    </div>

                    {state.status === 'success' && (
                        <div className="flex items-start gap-3 rounded-2xl border border-black bg-black px-5 py-4 text-white">
                            <p className="text-xs font-bold leading-relaxed">{state.message}</p>
                        </div>
                    )}

                    {state.status === 'error' && (
                        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                            <span className="mt-0.5 shrink-0 text-sm font-black">!</span>
                            <p className="text-xs font-bold leading-relaxed">{state.message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex w-full items-center justify-center gap-3 rounded-full bg-black py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-all hover:bg-[#d8a4bc] hover:text-black disabled:opacity-60"
                    >
                        {isPending ? (
                            'Sending…'
                        ) : (
                            'Send message →'
                        )}
                    </button>


                </form>

                {/* Details */}
                <div className="space-y-4">
                    <div className="rounded-[24px] border border-gray-100 bg-gray-50/60 p-6">
                        <div className="space-y-5">
                            {details.map((item) => (
                                <div key={item.label} className="flex items-start gap-4">
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            {item.label}
                                        </p>
                                        {item.href ? (
                                            <a
                                                href={item.href}
                                                className="block break-words text-sm font-bold text-black underline decoration-[#d8a4bc] underline-offset-4"
                                            >
                                                {item.value}
                                            </a>
                                        ) : (
                                            <p className="text-sm font-bold text-black">
                                                {item.value}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[24px] bg-black p-6">
                        <Link
                            href="/help/faqs"
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#d8a4bc] transition-colors hover:text-white"
                        >
                            Read the FAQs →
                        </Link>
                    </div>
                </div>
            </div>

            <ArticleFooter currentPath="/help/contact" />
        </div>
    );
}

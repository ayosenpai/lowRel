'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ArticleHeader from '@/components/help/article-header';
import ArticleSection from '@/components/help/article-section';
import ArticleFooter from '@/components/help/article-footer';

const sections = [
    { id: 'using-the-site', title: 'Using the site' },
    { id: 'orders', title: 'Orders' },
    { id: 'pricing', title: 'Pricing & payment' },
    { id: 'delivery', title: 'Delivery' },
    { id: 'returns', title: 'Returns' },
    { id: 'intellectual-property', title: 'Our work' },
    { id: 'acceptable-use', title: 'Acceptable use' },
    { id: 'liability', title: 'Liability' },
    { id: 'governing-law', title: 'Governing law' },
    { id: 'changes', title: 'Changes' },
];

const highlights = [
    { title: 'Prices in INR', detail: 'Indian addresses only, for now.' },
    { title: 'India law', detail: 'These terms are governed by Indian law.' },
    { title: 'Small runs', detail: 'Stock can sell out without notice.' },
];

export default function TermsPage() {
    return (
        <div className="max-w-3xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="Legal"
                title="Terms of Use"
                updated="November 2026"
                readingTime="3 min read"
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
            >
                {highlights.map((item) => (
                    <div
                        key={item.title}
                        className="rounded-[20px] border border-gray-100 bg-gray-50/60 p-4"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest">
                            {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                            {item.detail}
                        </p>
                    </div>
                ))}
            </motion.div>

            <nav
                aria-label="On this page"
                className="flex flex-wrap gap-2 border-y border-gray-100 py-4"
            >
                <span className="w-full text-[9px] font-black uppercase tracking-[0.25em] text-gray-300 sm:w-auto sm:py-1.5">
                    On this page
                </span>
                {sections.map((section) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="rounded-full border border-gray-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-500 transition-all hover:border-black hover:text-black"
                    >
                        {section.title}
                    </a>
                ))}
            </nav>

            <div className="space-y-10 md:space-y-12">
                <ArticleSection id="using-the-site" title="Using the site">
                    <p>
                        By browsing or ordering from Low Religion, you agree to these terms. If you
                        don’t agree with them, please don’t use the site.
                    </p>
                    <p>
                        You must be able to enter into a binding contract to place an order. If
                        you’re under 18, you’ll need a parent or guardian to order for you.
                    </p>
                </ArticleSection>

                <ArticleSection id="orders" title="Orders">
                    <p>
                        An order is an offer to buy. It’s accepted once payment is confirmed and we
                        confirm dispatch by email. We may decline or cancel an order if an item is
                        out of stock, if the price was clearly listed incorrectly, or if we suspect
                        fraud. If we cancel after payment, we’ll refund you in full.
                    </p>
                    <p>
                        Pieces are produced in small runs, so availability can change quickly.
                        Adding something to your cart doesn’t reserve it.
                    </p>
                </ArticleSection>

                <ArticleSection id="pricing" title="Pricing and payment">
                    <p>
                        Prices are shown in Indian Rupees (INR) and include applicable taxes unless
                        stated otherwise. The total at checkout is the amount you’ll be charged,
                        including shipping.
                    </p>
                    <p>
                        Payments are handled by Razorpay. We don’t store your full card details.
                        If a payment fails, the order won’t be confirmed, and any temporary hold
                        should be released by your bank.
                    </p>
                </ArticleSection>

                <ArticleSection id="delivery" title="Delivery">
                    <p>
                        We currently deliver within India only. Delivery estimates are estimates,
                        not guarantees, and can be affected by courier delays, weather or public
                        holidays. Risk in the goods passes to you on delivery.
                    </p>
                    <p>
                        Please make sure your address and phone number are correct. If a parcel is
                        returned to us because the address was wrong or delivery wasn’t accepted,
                        we may need to charge for re-delivery.
                    </p>
                </ArticleSection>

                <ArticleSection id="returns" title="Returns">
                    <p>
                        Returns are covered by our{' '}
                        <Link
                            href="/help/returns"
                            className="font-semibold text-black underline decoration-[#d8a4bc] underline-offset-4"
                        >
                            Returns & Exchanges
                        </Link>{' '}
                        policy. In short: 30 days from delivery, unworn and unwashed with tags, and
                        refunds issued to the original payment method after inspection.
                    </p>
                </ArticleSection>

                <ArticleSection id="intellectual-property" title="Our work">
                    <p>
                        The Low Religion name, logo, designs, artwork, photographs and site content
                        belong to us or are used with permission. You may share links and images for
                        personal, non-commercial purposes, but you may not copy our designs, use our
                        branding, or sell our content without written permission.
                    </p>
                </ArticleSection>

                <ArticleSection id="acceptable-use" title="Acceptable use">
                    <p>Please don’t:</p>
                    <ul className="list-disc space-y-2 pl-5 marker:text-[#d8a4bc]">
                        <li>Use the site for anything unlawful or fraudulent.</li>
                        <li>Attempt to interfere with the site, its security or other users.</li>
                        <li>Scrape, copy or resell our content or product listings.</li>
                        <li>Submit false information or someone else’s details.</li>
                    </ul>
                </ArticleSection>

                <ArticleSection id="liability" title="Liability">
                    <p>
                        The site is provided as it is. We work hard to keep it accurate and
                        available, but we can’t promise it will always be uninterrupted or
                        error-free.
                    </p>
                    <p>
                        To the extent permitted by law, we’re not liable for indirect or
                        consequential losses. Nothing in these terms limits your rights under
                        applicable consumer law, or our liability for death, personal injury or
                        fraud.
                    </p>
                </ArticleSection>

                <ArticleSection id="governing-law" title="Governing law">
                    <p>
                        These terms are governed by the laws of <strong>India</strong>. Disputes
                        will be subject to the jurisdiction of the courts where Low Religion is
                        established, without affecting any mandatory consumer protections you have
                        where you live.
                    </p>
                </ArticleSection>

                <ArticleSection id="changes" title="Changes to these terms">
                    <p>
                        We may update these terms as the project grows. The date at the top shows
                        the latest version. Orders are governed by the terms in place when the order
                        was placed.
                    </p>
                </ArticleSection>
            </div>

            <div className="flex flex-col gap-4 rounded-[24px] border border-gray-100 bg-gray-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-sm font-black uppercase tracking-tight">Something unclear?</h2>
                    <p className="text-sm leading-relaxed text-gray-500">
                        Ask us before ordering and we’ll explain it plainly.
                    </p>
                </div>
                <Link
                    href="/help/contact"
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#d8a4bc] hover:text-black"
                >
                    Contact support
                </Link>
            </div>

            <ArticleFooter currentPath="/help/terms" />
        </div>
    );
}

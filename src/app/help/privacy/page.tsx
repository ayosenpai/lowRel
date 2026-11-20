'use client';

import { motion } from 'framer-motion';
import ArticleHeader from '@/components/help/article-header';
import ArticleSection from '@/components/help/article-section';
import ArticleFooter from '@/components/help/article-footer';

const sections = [
    { id: 'who-we-are', title: 'Who we are' },
    { id: 'what-we-collect', title: 'What we collect' },
    { id: 'how-we-use-it', title: 'How we use it' },
    { id: 'sharing', title: 'Sharing' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'retention', title: 'Retention' },
    { id: 'your-rights', title: 'Your rights' },
    { id: 'updates', title: 'Updates' },
];

const highlights = [
    { title: 'We don’t sell data', detail: 'Your details are not sold or rented.' },
    { title: 'Razorpay payments', detail: 'Card details never touch our servers.' },
    { title: 'You can ask', detail: 'Access, correct or delete your data.' },
];

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl space-y-10 pb-20 md:space-y-14">
            <ArticleHeader
                category="Legal"
                title="Privacy Policy"
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
                <ArticleSection id="who-we-are" title="Who we are">
                    <p>
                        Low Religion is a small, independent clothing project based in India. For
                        the purposes of your personal data, Low Religion is the controller — we
                        decide what is collected and why.
                    </p>
                    <p>
                        Questions about this policy can go to{' '}
                        <a
                            href="mailto:privacy@lowreligion.com"
                            className="font-semibold text-black underline decoration-[#d8a4bc] underline-offset-4"
                        >
                            privacy@lowreligion.com
                        </a>
                        .
                    </p>
                </ArticleSection>

                <ArticleSection id="what-we-collect" title="What we collect">
                    <p>When you order or contact us, we collect:</p>
                    <ul className="list-disc space-y-2 pl-5 marker:text-[#d8a4bc]">
                        <li>Your name, email address and phone number.</li>
                        <li>Your shipping address and, where needed, billing address.</li>
                        <li>What you ordered, order value and order history.</li>
                        <li>Messages you send us through the contact form or email.</li>
                    </ul>
                    <p>
                        Payments are processed by Razorpay. We receive confirmation that a payment
                        succeeded and basic transaction details, but we do not see or store your
                        full card number, UPI PIN or bank credentials.
                    </p>
                    <p>
                        We also collect basic technical information such as browser type, device
                        and pages visited, to keep the site working and understand what people use.
                    </p>
                </ArticleSection>

                <ArticleSection id="how-we-use-it" title="How we use your information">
                    <ul className="list-disc space-y-2 pl-5 marker:text-[#d8a4bc]">
                        <li>To take payment and fulfil your order.</li>
                        <li>To arrange delivery and send tracking updates.</li>
                        <li>To handle returns, exchanges and refunds.</li>
                        <li>To answer your messages and provide support.</li>
                        <li>To prevent fraud and keep the site secure.</li>
                        <li>To improve the site, our products and how we describe them.</li>
                        <li>To send marketing emails, only if you have opted in.</li>
                    </ul>
                    <p>
                        We rely on your consent for marketing, and on performing our contract with
                        you for orders and support. You can unsubscribe from marketing at any time
                        using the link in the email.
                    </p>
                </ArticleSection>

                <ArticleSection id="sharing" title="Who we share it with">
                    <p>
                        We don’t sell your personal information. We share only what is necessary
                        with providers who help us run the store, such as:
                    </p>
                    <ul className="list-disc space-y-2 pl-5 marker:text-[#d8a4bc]">
                        <li>Razorpay, to process payments.</li>
                        <li>Courier partners, to deliver your order.</li>
                        <li>Hosting, email and analytics providers that run the site.</li>
                    </ul>
                    <p>
                        We may also disclose information if required by law, or to protect our
                        rights, customers or the public.
                    </p>
                </ArticleSection>

                <ArticleSection id="cookies" title="Cookies and tracking">
                    <p>
                        We use cookies and similar technologies to keep your cart working, remember
                        preferences and understand how the site is used. Some are essential — the
                        site can’t process an order without them.
                    </p>
                    <p>
                        You can block or delete cookies in your browser settings. Blocking essential
                        cookies may stop checkout from working properly.
                    </p>
                </ArticleSection>

                <ArticleSection id="retention" title="How long we keep it">
                    <p>
                        We keep order and payment records for as long as we need them to run the
                        business and meet accounting, tax and legal obligations. Support messages
                        are kept only as long as needed to resolve the issue and for a reasonable
                        record afterwards. Marketing preferences are kept until you unsubscribe.
                    </p>
                </ArticleSection>

                <ArticleSection id="your-rights" title="Your rights">
                    <p>
                        You can ask us to access, correct or delete the personal information we hold
                        about you, or to stop using it for marketing. Email{' '}
                        <a
                            href="mailto:privacy@lowreligion.com"
                            className="font-semibold text-black underline decoration-[#d8a4bc] underline-offset-4"
                        >
                            privacy@lowreligion.com
                        </a>{' '}
                        and we’ll respond within a reasonable time. We may need to confirm your
                        identity before acting on a request.
                    </p>
                    <p>
                        Some records, such as completed order and tax records, may need to be kept
                        even after a deletion request.
                    </p>
                </ArticleSection>

                <ArticleSection id="updates" title="Updates to this policy">
                    <p>
                        If this policy changes, we’ll update this page and the date above. If the
                        change is significant, we’ll make that clear on the site. Continuing to use
                        the store after an update means you accept the revised policy.
                    </p>
                </ArticleSection>
            </div>

            <div className="rounded-[24px] bg-black p-6 text-white md:p-8">
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Privacy questions</h2>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                    Email{' '}
                    <a
                        href="mailto:privacy@lowreligion.com"
                        className="text-[#d8a4bc] underline underline-offset-4"
                    >
                        privacy@lowreligion.com
                    </a>{' '}
                    and we’ll answer directly. You can also read our{' '}
                    <a href="/help/terms" className="text-[#d8a4bc] underline underline-offset-4">
                        Terms of Use
                    </a>
                    .
                </p>
            </div>

            <ArticleFooter currentPath="/help/privacy" />
        </div>
    );
}

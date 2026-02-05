'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Lock, Eye, Bell } from 'lucide-react';

const BackButton = () => (
    <Link
        href="/help"
        className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group text-sm font-medium"
    >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Help Center
    </Link>
);

export default function PrivacyPage() {
    const sections = [
        {
            id: 'collection',
            title: 'Information We Collect',
            content: `We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, shipping address, billing address, phone number, and payment information. Additionally, we automatically collect certain information about your device and how you interact with our site, such as your IP address, browser type, and page views.`
        },
        {
            id: 'usage',
            title: 'How We Use Your Information',
            content: `We use the information we collect to:
      • Process and fulfill your orders
      • Communicate with you about your account and purchases
      • Improve and optimize our website and user experience
      • Send you marketing communications (if you've opted in)
      • Protect against fraudulent transactions and security threats`
        },
        {
            id: 'sharing',
            title: 'Information Sharing',
            content: `We do not sell your personal information. We may share your data with trusted third-party service providers who assist us in operating our business, such as payment processors, shipping carriers, and marketing platforms. These partners are obligated to protect your information and only use it for the specific purposes we define.`
        },
        {
            id: 'cookies',
            title: 'Cookies & Tracking',
            content: `We use cookies and similar technologies to remember your preferences, analyze traffic, and personalize content. You can manage your cookie preferences through your browser settings, though disabling certain cookies may affect the functionality of our site.`
        },
        {
            id: 'rights',
            title: 'Your Privacy Rights',
            content: `Depending on your location, you may have the right to access, correct, or delete the personal information we hold about you. You can also object to certain types of processing or request that we transfer your data to another service. To exercise these rights, please contact us at privacy@lowreligion.com.`
        }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 pt-16 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <BackButton />
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Privacy Policy</h1>
                        <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
                            Last updated: February 05, 2026. Your privacy is paramount to us. This policy outlines how we handle your personal data with transparency and security.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Quick Links / Navigation */}
                    <div className="md:col-span-1 hidden md:block">
                        <div className="sticky top-24 space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Jump to</h3>
                            <nav className="flex flex-col gap-4">
                                {sections.map(s => (
                                    <a key={s.id} href={`#${s.id}`} className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                                        {s.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Policy Content */}
                    <div className="md:col-span-3 space-y-16">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                                <ShieldCheck size={24} className="text-[#d8a4bc] shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Secure Data</p>
                                    <p className="text-xs text-gray-500">256-bit encryption for all transactions.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                                <Eye size={24} className="text-[#d8a4bc] shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Transparency</p>
                                    <p className="text-xs text-gray-500">No hidden trackers or selling of data.</p>
                                </div>
                            </div>
                        </div>

                        {sections.map((section) => (
                            <section key={section.id} id={section.id} className="space-y-6 scroll-mt-24">
                                <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
                                <div className="text-gray-600 leading-relaxed space-y-4 whitespace-pre-line">
                                    {section.content}
                                </div>
                            </section>
                        ))}

                        <div className="pt-12 border-t border-gray-100">
                            <div className="p-10 bg-black text-white rounded-[40px] space-y-6">
                                <div className="flex items-center gap-3">
                                    <Bell size={24} className="text-[#d8a4bc]" />
                                    <h3 className="text-xl font-bold">Policy Updates</h3>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    We may update this policy periodically to reflect changes in our practices or for legal reasons. Significant changes will be announced on our homepage or via email.
                                </p>
                                <p className="text-xs text-gray-500 italic">Questions? Contact our Data Protection Officer at privacy@lowreligion.com</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

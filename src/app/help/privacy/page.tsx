'use client';

import { motion } from 'framer-motion';
import HelpPagination from '@/components/ui/help-pagination';
import { ShieldCheck, Eye, Bell } from 'lucide-react';

export default function PrivacyPage() {
    const sections = [
        {
            id: 'collection',
            title: 'Information We Collect',
            content: `We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, shipping address, billing address, phone number, and payment information.`
        },
        {
            id: 'usage',
            title: 'How We Use Your Information',
            content: `We use the information we collect to:
      • Process and fulfill your orders
      • Communicate with you about your account
      • Improve and optimize our website
      • Protect against fraudulent transactions`
        },
        {
            id: 'sharing',
            title: 'Information Sharing',
            content: `We do not sell your personal information. We may share your data with trusted third-party service providers who assist us in operating our business, such as payment processors and shipping carriers.`
        },
        {
            id: 'cookies',
            title: 'Cookies & Tracking',
            content: `We use cookies to remember your preferences and analyze traffic. You can manage your cookie preferences through your browser settings.`
        },
        {
            id: 'rights',
            title: 'Your Privacy Rights',
            content: `You have the right to access, correct, or delete the personal information we hold about you. To exercise these rights, please contact us at privacy@lowreligion.com.`
        }
    ];

    return (
        <div className="max-w-3xl space-y-8 md:space-y-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="inline-block px-3 py-1 bg-[#d8a4bc]/10 rounded-full text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest">Legal</div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">Privacy Policy</h1>
                <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
                    Last updated: February 2026. Your privacy is paramount.
                </p>
            </motion.div>

            {/* Content Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex gap-4">
                    <ShieldCheck size={20} className="text-[#d8a4bc] shrink-0" />
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-widest mb-1">Secure Data</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">256-bit encryption for all data.</p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex gap-4">
                    <Eye size={20} className="text-[#d8a4bc] shrink-0" />
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-widest mb-1">Transparency</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">No hidden trackers or selling.</p>
                    </div>
                </div>
            </div>

            {/* Main Sections */}
            <div className="space-y-12 md:space-y-16">
                {sections.map((section) => (
                    <section key={section.id} id={section.id} className="space-y-4">
                        <h2 className="text-lg md:text-xl font-black uppercase tracking-widest">{section.title}</h2>
                        <div className="text-gray-500 font-medium leading-loose text-xs md:text-sm uppercase tracking-wider whitespace-pre-line">
                            {section.content}
                        </div>
                    </section>
                ))}
            </div>

            {/* Policy Updates */}
            <div className="p-8 md:p-12 bg-black text-white rounded-[40px] space-y-6">
                <div className="flex items-center gap-3">
                    <Bell size={20} className="text-[#d8a4bc]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Updates</h3>
                </div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    We may update this policy periodically. Significant changes will be announced on our homepage.
                </p>
                <p className="text-[9px] text-[#d8a4bc] italic font-bold">Questions? Contact privacy@lowreligion.com</p>
            </div>

            <HelpPagination />
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import HelpPagination from '@/components/ui/help-pagination';
import { Scale, Gavel, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    const sections = [
        {
            id: 'acceptance',
            title: 'Acceptance of Terms',
            content: `By accessing Low Religion, you agree to be bound by these Terms of Use and all applicable laws. If you do not agree, you are prohibited from using this site.`
        },
        {
            id: 'license',
            title: 'Use License',
            content: `Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only. This is a license, not a transfer of title.`
        },
        {
            id: 'disclaimer',
            title: 'Disclaimer',
            content: `The materials on Low Religion's website are provided on an 'as is' basis. Low Religion makes no warranties, expressed or implied, and hereby disclaims all other warranties.`
        },
        {
            id: 'limitations',
            title: 'Limitations of Liability',
            content: `Low Religion or its suppliers shall not be liable for any damages arising out of the use or inability to use the materials on our website.`
        },
        {
            id: 'governing-law',
            title: 'Governing Law',
            content: `These terms are governed by the laws of the United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`
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
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">Terms of Use</h1>
                <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
                    Last updated: February 2026. Please read carefully.
                </p>
            </motion.div>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex gap-4">
                    <Scale size={20} className="text-[#d8a4bc] shrink-0" />
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-widest mb-1">Governing Law</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">UK Jurisdiction.</p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex gap-4">
                    <Gavel size={20} className="text-[#d8a4bc] shrink-0" />
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-widest mb-1">Fair Use</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Respect our IP.</p>
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

            {/* Support CTA */}
            <div className="p-8 md:p-12 border border-black rounded-[40px] space-y-6">
                <div className="flex items-center gap-3">
                    <HelpCircle size={20} className="text-black" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Questions?</h3>
                </div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    If anything is unclear, our team is here to help clarify the details of our terms.
                </p>
                <Link
                    href="/help/contact"
                    className="inline-block bg-black text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10"
                >
                    Contact Support
                </Link>
            </div>

            <HelpPagination />
        </div>
    );
}

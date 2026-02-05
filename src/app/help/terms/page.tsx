'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, FileText, Scale, Gavel, HelpCircle } from 'lucide-react';

const BackButton = () => (
    <Link
        href="/help"
        className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group text-sm font-medium"
    >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Help Center
    </Link>
);

export default function TermsPage() {
    const sections = [
        {
            id: 'acceptance',
            title: 'Acceptance of Terms',
            content: `By accessing or using the Low Religion website and purchasing our products, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.`
        },
        {
            id: 'license',
            title: 'Use License',
            content: `Permission is granted to temporarily download one copy of the materials (information or software) on Low Religion's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
      • Modify or copy the materials;
      • Use the materials for any commercial purpose;
      • Attempt to decompile or reverse engineer any software;
      • Remove any copyright or other proprietary notations;
      • Transfer the materials to another person or 'mirror' the materials on any other server.`
        },
        {
            id: 'disclaimer',
            title: 'Disclaimer',
            content: `The materials on Low Religion's website are provided on an 'as is' basis. Low Religion makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.`
        },
        {
            id: 'limitations',
            title: 'Limitations of Liability',
            content: `In no event shall Low Religion or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Low Religion's website, even if Low Religion or a Low Religion authorized representative has been notified orally or in writing of the possibility of such damage.`
        },
        {
            id: 'governing-law',
            title: 'Governing Law',
            content: `These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`
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
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Terms of Use</h1>
                        <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
                            Last updated: February 05, 2026. Please read these terms carefully before using our services. They define our relationship as you interact with our brand.
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
                                <Scale size={24} className="text-[#d8a4bc] shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Governing Law</p>
                                    <p className="text-xs text-gray-500">Regulated under UK jurisdiction.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                                <Gavel size={24} className="text-[#d8a4bc] shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Fair Use</p>
                                    <p className="text-xs text-gray-500">Respect our IP and community guidelines.</p>
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
                            <div className="p-10 border border-black rounded-[40px] space-y-6">
                                <div className="flex items-center gap-3">
                                    <HelpCircle size={24} className="text-black" />
                                    <h3 className="text-xl font-bold">Still have questions?</h3>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    If anything in these terms is unclear, or you have questions about your specific situation, our team is here to help clarify the details.
                                </p>
                                <Link
                                    href="/help/contact"
                                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

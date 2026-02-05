'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import BackButton from '@/components/ui/back-button';
import { Search, Plus, Minus, MessageCircle } from 'lucide-react';

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: "Market & Orders",
      items: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay."
        },
        {
          question: "Can I modify my order after placement?",
          answer: "Orders can be modified within 2 hours of placement. Please contact our support team immediately for assistance."
        },
        {
          question: "Do you offer gift wrapping?",
          answer: "Yes, we offer complimentary luxury gift wrapping. You can select this option at checkout."
        }
      ]
    },
    {
      category: "Shipping & Returns",
      items: [
        {
          question: "What are your shipping times?",
          answer: "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. International delivery varies by location."
        },
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for unworn items in original packaging with tags attached."
        }
      ]
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = searchQuery
    ? faqs.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0)
    : faqs;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20 py-12 md:py-20 px-5">
      <div className="container mx-auto max-w-4xl">
        <BackButton />

        <div className="text-center space-y-3 mb-12 md:mb-24">
          <h1 className="text-2xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">Frequently Asked Questions</h1>
          <p className="text-sm md:text-lg text-gray-500 max-w-2xl mx-auto">Everything you need to know about our products, shipping, and service.</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-12 md:mb-20">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d8a4bc] transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 md:py-5 pl-12 pr-6 text-sm md:text-base outline-none transition-all focus:bg-white focus:border-[#d8a4bc] focus:ring-4 focus:ring-[#d8a4bc]/5 shadow-sm"
          />
        </div>

        <div className="space-y-12 md:space-y-16">
          {filteredFaqs.map((section, sIdx) => (
            <div key={sIdx} className="space-y-6 md:space-y-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 px-2">{section.category}</h2>
              <div className="space-y-3 md:space-y-4">
                {section.items.map((item, iIdx) => {
                  const itemIndex = sIdx * 100 + iIdx;
                  const isOpen = openItems.includes(itemIndex);
                  return (
                    <div
                      key={iIdx}
                      className={`border border-gray-100 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-gray-50' : 'bg-white hover:border-[#d8a4bc]/30'}`}
                    >
                      <button
                        onClick={() => toggleItem(itemIndex)}
                        className="w-full p-5 md:p-8 flex justify-between items-center text-left group"
                      >
                        <span className="font-semibold text-gray-800 text-sm md:text-lg group-hover:text-black transition-colors">{item.question}</span>
                        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : 'text-gray-400'}`}>
                          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 md:px-8 pb-6 md:pb-8 text-gray-600 text-xs md:text-base leading-relaxed border-t border-gray-100 pt-5 md:pt-8">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 md:mt-32 p-8 md:p-12 border border-gray-100 rounded-[32px] md:rounded-[40px] text-center space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">Still have questions?</h3>
          <p className="text-sm text-gray-500">Can't find what you're looking for? Reach out to our human support team.</p>
          <div className="pt-4">
            <Link
              href="/help/contact"
              className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg text-xs md:text-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ faq, isOpen, onClick }: { faq: { question: string, answer: string }, isOpen: boolean, onClick: () => void }) {
  return (
    <motion.div
      className={`bg-white border transition-all duration-500 rounded-[32px] overflow-hidden ${isOpen ? 'border-[#d8a4bc] shadow-2xl shadow-[#d8a4bc]/10 translate-y-[-4px]' : 'border-gray-100 hover:border-gray-200'}`}
    >
      <button
        className="w-full p-8 flex justify-between items-center text-left gap-8 outline-none group"
        onClick={onClick}
      >
        <span className={`text-[13px] font-black uppercase tracking-wider transition-colors duration-300 ${isOpen ? 'text-[#0F172A]' : 'text-gray-600 group-hover:text-[#0F172A]'}`}>
          {faq.question}
        </span>
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[#0F172A] text-[#d8a4bc] rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
          <Plus size={16} className={isOpen ? 'hidden' : 'block'} />
          <Minus size={16} className={isOpen ? 'block' : 'hidden'} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-8 pb-10 text-[11px] font-medium leading-[1.8] text-gray-400 uppercase tracking-widest max-w-2xl border-t border-gray-50 pt-8">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

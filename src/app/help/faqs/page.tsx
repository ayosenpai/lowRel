'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HelpPagination from '@/components/ui/help-pagination';
import { Search, Plus, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: "Operations",
      items: [
        {
          question: "Payment Methods?",
          answer: "Major credit cards, PayPal, Apple Pay, and Google Pay accepted."
        },
        {
          question: "Modify Order?",
          answer: "Changes possible within 2 hours. Contact support immediately."
        }
      ]
    },
    {
      category: "Logistics",
      items: [
        {
          question: "Shipping Times?",
          answer: "Standard: 5-7 days. Express: 2-3 days. International varies."
        },
        {
          question: "Return Window?",
          answer: "30 days for unworn items with original tags."
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
    <div className="max-w-4xl space-y-8 md:space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-block px-3 py-1 bg-[#d8a4bc]/10 rounded-full text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest">Support</div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">Frequently Asked</h1>
        <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
          Quick solutions for common inquiries.
        </p>
      </motion.div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d8a4bc] transition-colors" size={16} />
        <input
          type="text"
          placeholder="SEARCH TOPICS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 border border-gray-100 rounded-full py-5 pl-14 pr-8 text-[10px] font-black uppercase tracking-[0.2em] outline-none transition-all focus:bg-white focus:border-[#d8a4bc] focus:ring-4 focus:ring-[#d8a4bc]/5"
        />
      </div>

      <div className="space-y-16">
        {filteredFaqs.map((section, sIdx) => (
          <div key={sIdx} className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 border-b border-gray-50 pb-4">{section.category}</h2>
            <div className="grid gap-3">
              {section.items.map((item, iIdx) => {
                const itemIndex = sIdx * 100 + iIdx;
                const isOpen = openItems.includes(itemIndex);
                return (
                  <div
                    key={iIdx}
                    className={`rounded-[32px] transition-all duration-300 border ${isOpen ? 'bg-black border-black text-white shadow-2xl' : 'bg-white border-gray-50'}`}
                  >
                    <button
                      onClick={() => toggleItem(itemIndex)}
                      className="w-full p-6 md:p-8 flex justify-between items-center text-left group"
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest leading-tight">{item.question}</span>
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-[#d8a4bc] text-black rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                        {isOpen ? <Minus size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "circOut" }}
                        >
                          <div className="px-6 md:px-8 pb-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">
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

      {/* Support CTA */}
      <div className="p-8 md:p-12 border border-black rounded-[48px] text-center space-y-6">
        <h3 className="text-xl font-black uppercase tracking-widest">Still Lost?</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose max-w-xs mx-auto">
          Our support team is active 24/7 to solve your queries.
        </p>
        <div className="pt-2">
          <Link
            href="/help/contact"
            className="inline-block bg-black text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#d8a4bc] transition-all shadow-2xl"
          >
            Contact Human
          </Link>
        </div>
      </div>

      <HelpPagination />
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

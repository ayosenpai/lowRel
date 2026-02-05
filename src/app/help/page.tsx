'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Minus,
  ChevronLeft,
  MessageCircle,
  Package,
  CreditCard,
  RotateCcw,
  Truck,
  User,
  Info,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

// Simplified Link component for the preview environment
const Link = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

// Inline BackButton component
const BackButton = () => (
  <button
    onClick={() => window.history.back()}
    className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6 group"
  >
    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
    <span className="font-medium text-sm">Back to Help Center</span>
  </button>
);

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { title: 'Orders', icon: <Package size={24} />, desc: 'Tracking, cancellations, and order modifications.' },
    { title: 'Shipping', icon: <Truck size={24} />, desc: 'Delivery times, costs, and international shipping.' },
    { title: 'Returns', icon: <RotateCcw size={24} />, desc: 'How to return items and our refund policy.' },
    { title: 'Payments', icon: <CreditCard size={24} />, desc: 'Payment methods, security, and billing.' },
    { title: 'Account', icon: <User size={24} />, desc: 'Managing your profile, password, and history.' },
    { title: 'Product Info', icon: <HelpCircle size={24} />, desc: 'Size guides, material details, and care.' }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20">
      {/* Hero Section - Clean & Functional */}
      <div className="bg-[#F8FAFC] py-12 md:py-24 px-5 border-b border-gray-100">
        <div className="container mx-auto max-w-4xl text-center space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">How can we <span className="text-[#d8a4bc]">help?</span></h1>
            <p className="text-sm md:text-lg text-gray-500 max-w-xl mx-auto">Search our help center or choose a category below to find the answers you need.</p>
          </motion.div>

          {/* Search Overlay Replacement - Standard Input */}
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d8a4bc] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search for articles, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-4 md:py-5 pl-12 pr-6 text-sm md:text-base outline-none transition-all focus:border-[#d8a4bc] focus:ring-4 focus:ring-[#d8a4bc]/5 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Grid - Shopify Minimalist */}
      <div className="container mx-auto max-w-6xl py-12 md:py-20 px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={`/help/${cat.title.toLowerCase().replace(' ', '-')}`}
              className="group p-6 md:p-8 border border-gray-100 rounded-2xl hover:border-[#d8a4bc]/30 hover:shadow-xl hover:shadow-[#d8a4bc]/5 transition-all bg-white flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 group-hover:bg-[#d8a4bc] group-hover:text-white transition-all mb-4 md:mb-6">
                {cat.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{cat.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-[200px]">{cat.desc}</p>
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-xs md:text-sm font-semibold text-[#d8a4bc] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Learn more <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Articles - Clean List */}
      <div className="bg-gray-50 py-12 md:py-20 px-5">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Frequently Asked</h2>
              <p className="text-xs md:text-sm text-gray-500">Quick answers to common inquiries.</p>
            </div>
            <Link href="/help/faqs" className="text-xs md:text-sm font-bold text-[#d8a4bc] hover:underline">
              View all FAQs
            </Link>
          </div>

          <div className="grid gap-3 md:gap-4">
            {[
              "How do I track my delivery status?",
              "What is your return policy for international orders?",
              "Can I modify my order after it's been committed?",
              "How do I apply for a professional discount?"
            ].map((text, i) => (
              <button key={i} className="flex items-center justify-between p-5 md:p-6 bg-white border border-gray-100 rounded-2xl hover:border-[#d8a4bc]/50 transition-all group text-left">
                <span className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-black">{text}</span>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-[#d8a4bc] transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section - Solid CTA */}
      <div className="py-16 md:py-24 px-5 text-center">
        <div className="container mx-auto max-w-2xl space-y-6 md:space-y-8">
          <div className="inline-flex p-3 md:p-4 bg-[#d8a4bc]/10 rounded-full text-[#d8a4bc]">
            <MessageCircle size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Still need help?</h2>
          <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">Our support team is available Monday through Friday, 9am-6pm EST.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/help/contact"
              className="bg-black text-white px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg text-xs md:text-sm"
            >
              Contact Support
            </Link>
            <Link
              href="/help/faqs"
              className="bg-white text-black border border-gray-200 px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold hover:bg-gray-50 transition-all text-xs md:text-sm"
            >
              Visit FAQ Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ faq, isOpen, onClick }: { faq: { question: string, answer: string }, isOpen: boolean, onClick: () => void }) {
  return (
    <div
      className={`border border-gray-100 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-gray-50 shadow-md ring-1 ring-black/5' : 'bg-white hover:bg-gray-50 shadow-sm'}`}
    >
      <button
        className="w-full p-6 flex justify-between items-center text-left gap-4 outline-none group"
        onClick={onClick}
      >
        <span className="font-bold text-lg md:text-xl text-black transition-colors group-hover:text-[#d8a4bc]">
          {faq.question}
        </span>
        <div className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : 'text-gray-400'}`}>
          {isOpen ? <Minus size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
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
            <div className="px-6 pb-8 text-gray-600 leading-relaxed text-lg border-t border-gray-100 pt-4">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
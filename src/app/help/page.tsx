'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  RotateCcw,
  Truck,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Home
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { title: 'Orders', icon: <Package size={18} />, desc: 'TRACKING AND MODIFICATIONS', path: '/help' },
    { title: 'Shipping', icon: <Truck size={18} />, desc: 'DELIVERY AND LOGISTICS', path: '/help/shipping' },
    { title: 'Returns', icon: <RotateCcw size={18} />, desc: 'EXCHANGES AND REFUNDS', path: '/help/returns' },
    { title: 'Security', icon: <ShieldCheck size={18} />, desc: 'PRIVACY AND TERMS', path: '/help/privacy' },
    { title: 'Sizing', icon: <HelpCircle size={18} />, desc: 'FIT AND MEASUREMENTS', path: '/help/size-guide' },
    { title: 'Support', icon: <MessageCircle size={18} />, desc: 'CONTACT OUR TEAM', path: '/help/contact' }
  ];

  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#d8a4bc]/20">
      {/* Legend Hero */}
      <div className="relative pt-12 pb-12 md:pt-16 md:pb-16 px-6 overflow-hidden bg-black text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          {/* Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d8a4bc] transition-colors mb-8 group"
          >
            <Home size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Home</span>
          </Link>

          <div className="block mb-6">
            <div className="inline-block px-4 py-1.5 bg-[#d8a4bc] text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
              Help Center
            </div>
          </div>

          <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
            How Can We <br /><span className="text-[#d8a4bc]">Serve You?</span>
          </h1>


          {/* Search Bar */}
          <div className="max-w-2xl py-6 mx-auto relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d8a4bc] transition-colors" size={18} />
            <input
              type="text"
              placeholder="SEARCH ARTICLES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-16 pr-8 text-[11px] font-black uppercase tracking-[0.3em] outline-none transition-all focus:bg-white focus:text-black focus:border-[#d8a4bc] placeholder:text-gray-600 focus:placeholder:text-gray-300"
            />
          </div>
        </motion.div>

        {/* Background Text Decor */}
        <div className="absolute bottom-0 left-0 w-full opacity-[0.03] select-none pointer-events-none translate-y-1/2">
          <h2 className="text-[20vw] font-black uppercase tracking-tighter whitespace-nowrap">LOW RELIGION SERVICE</h2>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto py-6 md:py-12 px-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {filteredCategories.map((cat, i) => (
            <Link
              key={i}
              href={cat.path}
              className="group relative p-3 md:p-6 border border-gray-100 rounded-[20px] md:rounded-[32px] hover:border-black transition-all bg-white flex items-center gap-3 md:gap-6 text-left"
            >
              <div className="w-8 h-8 md:w-12 md:h-12 shrink-0 rounded-lg md:rounded-2xl bg-gray-50 flex items-center justify-center text-black group-hover:bg-[#d8a4bc] transition-all">
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] md:text-xl font-black text-[#d8a4bc] uppercase tracking-tighter truncate leading-tight">{cat.title}</h3>
                <p className="hidden md:block text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] truncate mt-1">{cat.desc}</p>
              </div>
              <div className="hidden md:flex shrink-0 w-8 h-8 rounded-full border border-gray-100 items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
          {filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">No topics match your search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-50 py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Support Line</h2>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.4em] leading-loose">
              Response time within 2-4 business hours.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              href="/help/contact"
              className="bg-black text-white px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#d8a4bc] hover:text-black transition-all shadow-2xl"
            >
              Contact Team
            </Link>
            <Link
              href="/help/faqs"
              className="bg-white text-black border border-black/10 px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-50 transition-all shadow-lg"
            >
              Read Basics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

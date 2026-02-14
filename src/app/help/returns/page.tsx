'use client';

import { motion } from 'framer-motion';
import HelpPagination from '@/components/ui/help-pagination';
import { RefreshCcw, Package, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: 'Initiate',
      description: 'Log into your account and visit the returns portal.'
    },
    {
      step: 2,
      title: 'Pack',
      description: 'Place items in original packaging with tags.'
    },
    {
      step: 3,
      title: 'Ship',
      description: 'Attach the prepaid label and drop off.'
    }
  ];

  const returnPolicy = [
    { condition: 'Time Frame', detail: '30 Days' },
    { condition: 'Condition', detail: 'Original Tags' },
    { condition: 'Cost', detail: 'Free Domestic' }
  ];

  return (
    <div className="max-w-4xl space-y-8 md:space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-block px-3 py-1 bg-[#d8a4bc]/10 rounded-full text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest">Returns</div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">Returns & Exchanges</h1>
        <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
          Hassle-free returns within 30 days. Perfect fit guaranteed.
        </p>
      </motion.div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <RefreshCcw size={20} />, title: '30-Day Window', desc: 'Starting from delivery date.' },
          { icon: <ShieldCheck size={20} />, title: 'Quality Check', desc: 'Unworn with all tags intact.' },
          { icon: <Package size={20} />, title: 'Free Returns', desc: 'Prepaid labels provided.' }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 space-y-4">
            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
              {item.icon}
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest">{item.title}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
        {/* Steps */}
        <div className="space-y-12">
          <h2 className="text-xl font-black uppercase tracking-widest">Process</h2>
          <div className="space-y-8">
            {returnSteps.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-[10px]">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest">{item.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all group"
            >
              Start Return
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Fine Print */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest">Policy</h2>
            <div className="space-y-4">
              {returnPolicy.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{item.condition}</span>
                  <span className="text-[10px] font-black text-black uppercase tracking-widest">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-black text-white rounded-[40px] space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d8a4bc]/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="text-sm font-black uppercase tracking-tight">Exchanges</h3>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-loose">
              Need a different size? Select "Exchange" in our portal. We ship items as soon as yours are scanned.
            </p>
          </div>
        </div>
      </div>

      <HelpPagination />
    </div>
  );
}

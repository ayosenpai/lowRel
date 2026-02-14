'use client';

import { motion } from 'framer-motion';
import HelpPagination from '@/components/ui/help-pagination';
import { Truck, Package, Clock, Globe, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ShippingPage() {
  const shippingOptions = [
    {
      method: 'Standard Shipping',
      timeframe: '5-7 business days',
      cost: 'Free over $100',
      icon: <Package size={20} className="text-black" />,
    },
    {
      method: 'Express Shipping',
      timeframe: '2-3 business days',
      cost: '$15.00',
      icon: <Truck size={20} className="text-black" />,
      popular: true
    },
    {
      method: 'Overnight Shipping',
      timeframe: 'Next business day',
      cost: '$25.00',
      icon: <Clock size={20} className="text-black" />,
    }
  ];

  return (
    <div className="max-w-4xl space-y-8 md:space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-block px-3 py-1 bg-[#d8a4bc]/10 rounded-full text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest">Logistics</div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">Shipping Info</h1>
        <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
          Fast, secure, and transparent delivery worldwide.
        </p>
      </motion.div>

      {/* Shipping Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shippingOptions.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 md:p-8 rounded-[32px] border transition-all ${option.popular ? 'border-black bg-white shadow-xl ring-1 ring-black' : 'border-gray-100 bg-gray-50/50'
              }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${option.popular ? 'bg-black text-white' : 'bg-white shadow-sm'}`}>
                {option.icon}
              </div>
              {option.popular && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">Best Value</span>
              )}
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">{option.method}</h3>
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-400">Time:</span>
                <span>{option.timeframe}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#d8a4bc]">
                <span>Cost:</span>
                <span>{option.cost}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
        <div className="space-y-12">
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-[#d8a4bc]" />
              <h2 className="text-lg font-black uppercase tracking-widest">Processing</h2>
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-wider leading-relaxed">
              Orders are processed within 1-2 business days. Notification with tracking will be sent upon dispatch.
            </p>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-[#d8a4bc]" />
              <h2 className="text-lg font-black uppercase tracking-widest">Global</h2>
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-wider leading-relaxed">
              Shipping to 50+ countries. Times vary from 10-15 business days depending on location.
            </p>
          </section>
        </div>

        <div className="space-y-8">
          <div className="p-8 md:p-10 bg-black text-white rounded-[40px] space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d8a4bc]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#d8a4bc]/20 transition-all duration-700" />
            <h3 className="text-lg font-black uppercase tracking-tight">Track Package</h3>
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[#d8a4bc]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Real-time GPS updates</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[#d8a4bc]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">SMS notifications</span>
              </div>
            </div>
            <Link
              href="/help/contact"
              className="inline-block bg-white text-black px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#d8a4bc] hover:text-white transition-all shadow-xl"
            >
              Need Help?
            </Link>
          </div>

          <div className="p-8 md:p-10 border border-gray-100 bg-gray-50 rounded-[40px] space-y-4">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-gray-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Protection</h3>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-loose">
              Full insurance on all shipments. If lost or damaged, we've got you covered.
            </p>
          </div>
        </div>
      </div>

      <HelpPagination />
    </div>
  );
}

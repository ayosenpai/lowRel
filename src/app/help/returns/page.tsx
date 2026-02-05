'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, RefreshCcw, Package, ClipboardCheck, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const BackButton = () => (
  <Link
    href="/help"
    className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group text-sm font-medium"
  >
    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    Back to Help Center
  </Link>
);

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Log into your account or visit our return portal with your order number.'
    },
    {
      step: 2,
      title: 'Pack Items',
      description: 'Place items in their original packaging with all tags attached.'
    },
    {
      step: 3,
      title: 'Ship Back',
      description: 'Attach the prepaid label and drop off at any authorized location.'
    }
  ];

  const returnPolicy = [
    { condition: 'Time Frame', detail: '30 days from delivery' },
    { condition: 'Condition', detail: 'Unworn, unwashed, original tags' },
    { condition: 'Fee', detail: 'Free domestic returns' }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100 pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Returns & Exchanges</h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Not quite the right fit? No problem. We’ve designed our returns process to be as standard and hassle-free as possible.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Policy Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
              <RefreshCcw size={24} />
            </div>
            <h3 className="text-xl font-bold">30-Day Window</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Changed your mind? You have 30 days from the date of delivery to initiate a return.</p>
          </div>
          <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold">Quality Check</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Ensure items are in their original condition (unworn, unwashed) with all tags intact.</p>
          </div>
          <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
              <Package size={24} />
            </div>
            <h3 className="text-xl font-bold">Free Returns</h3>
            <p className="text-sm text-gray-500 leading-relaxed">We provide prepaid return labels for all domestic orders. Return shipping is on us.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
          {/* Steps */}
          <div className="space-y-12">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <div className="space-y-10">
              {returnSteps.map((item, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <Link
                href="/help/contact"
                className="inline-flex items-center gap-2 bg-black text-white px-10 py-5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98] group"
              >
                Start Your Return
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Details & Exclusions */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight">The Fine Print</h2>
              <div className="space-y-4">
                {returnPolicy.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400 font-medium">{item.condition}</span>
                    <span className="font-bold text-gray-900">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-gray-400" />
                <h3 className="font-bold">Non-Returnable Items</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-2">• Items marked as <span className="text-black font-bold">Final Sale</span></li>
                <li className="flex items-start gap-2">• Underwear and intimate apparel</li>
                <li className="flex items-start gap-2">• Items returned after the 30-day window</li>
                <li className="flex items-start gap-2">• Damaged or altered items without a valid claim</li>
              </ul>
            </div>

            <div className="p-8 bg-black text-white rounded-[32px] space-y-4">
              <h3 className="text-xl font-bold">Exchanges</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Found the right piece but need a different size? Simply select "Exchange" in our return portal. We'll ship your new size out as soon as your return is scanned by the carrier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Truck,
  Package,
  Clock,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const BackButton = () => (
  <Link
    href="/help"
    className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group text-sm font-medium"
  >
    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    Back to Help Center
  </Link>
);

export default function ShippingPage() {
  const shippingOptions = [
    {
      method: 'Standard Shipping',
      timeframe: '5-7 business days',
      cost: 'Free over $100',
      description: 'Reliable delivery for your everyday essentials.',
      icon: <Package size={20} className="text-black" />,
    },
    {
      method: 'Express Shipping',
      timeframe: '2-3 business days',
      cost: '$15.00',
      description: 'Faster delivery when you just can\'t wait.',
      icon: <Truck size={20} className="text-black" />,
      popular: true
    },
    {
      method: 'Overnight Shipping',
      timeframe: 'Next business day',
      cost: '$25.00',
      description: 'The quickest way to get your Low Religion fit.',
      icon: <Clock size={20} className="text-black" />,
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20">
      {/* Refined Hero */}
      <div className="bg-gray-50 border-b border-gray-100 pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Shipping Information</h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              We strive to deliver your pieces as quickly and securely as possible. Find everything you need to know about our rates, methods, and delivery times below.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {shippingOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-3xl border transition-all ${option.popular
                  ? 'border-black shadow-xl ring-1 ring-black'
                  : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${option.popular ? 'bg-black text-white' : 'bg-white shadow-sm'}`}>
                  {option.icon}
                </div>
                {option.popular && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">{option.method}</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{option.description}</p>
              <div className="space-y-2 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time:</span>
                  <span className="font-bold">{option.timeframe}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cost:</span>
                  <span className="font-bold text-black">{option.cost}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
          {/* Detailed Policy Sections */}
          <div className="space-y-16">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d8a4bc]/10 flex items-center justify-center text-[#d8a4bc]">
                  <Clock size={20} />
                </div>
                <h2 className="text-2xl font-bold">Processing Times</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                All orders are processed within 1-2 business days. Orders placed after 2 PM EST on Fridays will be processed on the following Monday. You will receive a notification email with a tracking number as soon as your order has been dispatched.
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-sm font-medium text-gray-700 italic">
                  Note: During peak seasons or major drops, processing may take up to 3-5 business days. We appreciate your patience.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Globe size={20} />
                </div>
                <h2 className="text-2xl font-bold">International Orders</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We proudly ship to over 50 countries globally. Delivery times for international orders range from 10-15 business days depending on location and local customs processing.
              </p>
              <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Import duties, taxes, and fees are not included in the item price or shipping cost. These charges are the buyer's responsibility and will be collected by the carrier upon delivery.
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="p-10 bg-black text-white rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-bold tracking-tight">Track Your Journey</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Curious where your package is? Once your order ships, we'll send you a unique tracking link to follow its path directly to your door.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#d8a4bc]" />
                    <span className="text-sm font-medium">Real-time GPS updates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#d8a4bc]" />
                    <span className="text-sm font-medium">SMS notifications available</span>
                  </div>
                </div>
                <Link
                  href="/help/contact"
                  className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-100 transition-all group"
                >
                  Need help? Contact Us
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d8a4bc]/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            </div>

            <div className="p-10 border border-gray-100 bg-gray-50 rounded-[40px] space-y-6">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-gray-400" />
                <h3 className="text-xl font-bold">Shipping Gurantee</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                If your package is lost in transit or arrives damaged, we've got you covered. We offer full insurance on all domestic and international shipments at no extra cost to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#d8a4bc] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto px-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <CheckCircle className="w-20 h-20 text-black mx-auto" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-black mb-4"
        >
          Order Confirmed!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-black mb-8"
        >
          Thank you for your order. We've received your purchase and will begin processing it right away.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="bg-black text-[#d8a4bc] p-6 rounded-lg">
            <h2 className="font-bold mb-2">Order Details</h2>
            <p className="text-sm mb-2">Order #LR{Math.floor(Math.random() * 100000)}</p>
            <p className="text-sm">You'll receive a confirmation email shortly.</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 bg-black text-[#d8a4bc] px-6 py-3 uppercase font-bold tracking-wider hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

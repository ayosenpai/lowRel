'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Info, Ruler, ArrowRight } from 'lucide-react';

const BackButton = () => (
  <Link
    href="/help"
    className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group text-sm font-medium"
  >
    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    Back to Help Center
  </Link>
);

export default function SizeGuidePage() {
  const sizeCharts = [
    {
      category: 'Unisex Graphic Tees',
      headers: ['Size', 'Chest (cm)', 'Length (cm)', 'Sleeve (cm)'],
      rows: [
        ['XS', '48', '66', '19'],
        ['S', '51', '69', '20'],
        ['M', '54', '72', '21'],
        ['L', '57', '75', '22'],
        ['XL', '60', '78', '23'],
        ['XXL', '63', '81', '24']
      ]
    },
    {
      category: 'Oversized Hoodies',
      headers: ['Size', 'Chest (cm)', 'Length (cm)', 'Shoulder (cm)'],
      rows: [
        ['S', '62', '68', '56'],
        ['M', '65', '71', '59'],
        ['L', '68', '74', '62'],
        ['XL', '71', '77', '65']
      ]
    },
    {
      category: 'Wide Leg Trousers',
      headers: ['Size', 'Waist (inch)', 'Hips (cm)', 'Inseam (cm)'],
      rows: [
        ['28', '28"', '104', '78'],
        ['30', '30"', '108', '79'],
        ['32', '32"', '112', '80'],
        ['34', '34"', '116', '81'],
        ['36', '36"', '120', '82']
      ]
    }
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Find Your Perfect Fit</h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Our pieces are designed with specific silhouettes in mind—from structured fits to oversized comfort. Use our guide to choose your ideal size.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-24">

          {/* Tables Section */}
          <div className="lg:col-span-2 space-y-20">
            {sizeCharts.map((chart, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                  <h2 className="text-2xl font-bold uppercase tracking-tight">{chart.category}</h2>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Measurements in CM</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50">
                        {chart.headers.map((header, hIdx) => (
                          <th key={hIdx} className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {chart.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`py-4 px-6 text-sm ${cIdx === 0 ? 'font-bold' : 'text-gray-600'}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar - Fit Info & Tips */}
          <div className="space-y-12">
            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-black">
                  <Ruler size={18} />
                  <h3 className="font-bold uppercase text-xs tracking-widest">Fit Silhouettes</h3>
                </div>
                <div className="h-px bg-gray-200 w-12" />
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="font-bold text-sm">True to Size</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Standard fit. Not too tight, not too loose. Order your usual size.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm">Oversized</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Intentionally larger. Dropped shoulders and extra room. Size down for a standard look.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm">Boxy Fit</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Wide and slightly cropped. Designed for a structured, modern streetwear look.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-4">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-[#d8a4bc]" />
                <h3 className="font-bold text-sm">How to measure</h3>
              </div>
              <div className="space-y-4 text-xs text-gray-500 leading-relaxed">
                <p><strong className="text-black">Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                <p><strong className="text-black">Waist:</strong> Measure around the narrowest part (typically where your body bends side to side).</p>
                <p><strong className="text-black">Hips:</strong> Measure around the fullest part of your hips with feet together.</p>
              </div>
            </div>

            <div className="p-10 bg-black text-white rounded-[40px] space-y-6">
              <h3 className="text-xl font-bold">Still unsure?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Send us your height and weight, and we'll recommend the best fit for your frame.
              </p>
              <Link
                href="/help/contact"
                className="inline-flex items-center gap-2 text-[#d8a4bc] font-bold text-sm hover:translate-x-1 transition-all group"
              >
                Let's chat
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import HelpPagination from '@/components/ui/help-pagination';
import { Ruler, Info, CheckCircle } from 'lucide-react';

export default function SizeGuidePage() {
  const sizeCharts = [
    {
      category: 'Graphic Tees',
      headers: ['Size', 'Chest', 'Length'],
      rows: [
        ['XS', '48cm', '66cm'],
        ['S', '51cm', '69cm'],
        ['M', '54cm', '72cm'],
        ['L', '57cm', '75cm'],
        ['XL', '60cm', '78cm']
      ]
    },
    {
      category: 'Hoodies',
      headers: ['Size', 'Chest', 'Length'],
      rows: [
        ['S', '62cm', '68cm'],
        ['M', '65cm', '71cm'],
        ['L', '68cm', '74cm'],
        ['XL', '71cm', '77cm']
      ]
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
        <div className="inline-block px-3 py-1 bg-[#d8a4bc]/10 rounded-full text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest">Sizing</div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">Find Your Fit</h1>
        <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
          Silhouettes designed for comfort and presence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
        {/* Tables */}
        <div className="lg:col-span-12 space-y-12">
          {sizeCharts.map((chart, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 border-b border-gray-50 pb-4">{chart.category}</h2>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      {chart.headers.map((h, i) => (
                        <th key={i} className="py-4 px-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {chart.rows.map((row, ri) => (
                      <tr key={ri} className="hover:bg-gray-50/50 transition-colors">
                        {row.map((cell, ci) => (
                          <td key={ci} className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${ci === 0 ? 'text-black' : 'text-gray-400'}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Fit Tips */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 md:p-10 bg-gray-50 rounded-[40px] border border-gray-100 space-y-8">
            <div className="flex items-center gap-3">
              <Ruler size={18} className="text-[#d8a4bc]" />
              <h3 className="text-xs font-black uppercase tracking-widest">Fit Silhouettes</h3>
            </div>
            <div className="space-y-6">
              {[
                { t: 'True to Size', d: 'Standard fit. Order your usual size.' },
                { t: 'Oversized', d: 'Dropped shoulders. Extra room. Size down for standard look.' },
                { t: 'Boxy Fit', d: 'Wide and slightly cropped. Structured streetwear look.' }
              ].map((fit, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">{fit.t}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">{fit.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 md:p-10 bg-black text-white rounded-[40px] space-y-6 flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-[#d8a4bc]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[#d8a4bc]">Measuring</h3>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">
              Measure around the fullest part of your chest or waist. Keep the tape horizontal and relaxed.
            </p>
            <div className="pt-4">
              <CheckCircle size={20} className="text-white opacity-20" />
            </div>
          </div>
        </div>
      </div>

      <HelpPagination />
    </div>
  );
}

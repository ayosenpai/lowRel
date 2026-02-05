'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Target, Users, Globe, ArrowRight } from 'lucide-react';

const BackButton = () => (
  <Link
    href="/help"
    className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group text-sm font-medium"
  >
    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    Back to Help Center
  </Link>
);

export default function AboutPage() {
  const values = [
    {
      title: 'Counter-Culture',
      description: 'We celebrate the rebels, the outcasts, and the creators who define their own religion through style.',
      icon: <Sparkles size={20} />
    },
    {
      title: 'Quality First',
      description: 'Every garment is a canvas. We prioritize heavy-weight fabrics and precision in every print.',
      icon: <Target size={20} />
    },
    {
      title: 'Global Community',
      description: 'From London to the world, we are building a tribe of individuals who value authenticity.',
      icon: <Users size={20} />
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100 pt-16 pb-20 px-6 overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 leading-none">
              Not a brand.<br /><span className="text-[#d8a4bc]">A Religion.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-medium">
              Low Religion was born in the streets of London with a single mission: to create clothing for the modern individual who refuses to conform.
            </p>
          </motion.div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
          <h2 className="text-[200px] font-black tracking-tighter leading-none select-none">LOW</h2>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-32 space-y-32">
        {/* Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">The Origin Story</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                Started in 2020 as a small screen-printing project in a shared studio, Low Religion quickly evolved into a full-scale movement. We saw a gap in the market for streetwear that didn't just follow trends, but challenged them.
              </p>
              <p>
                Our aesthetic is defined by a blend of minimalist structure and high-impact graphic design. We take inspiration from brutalist architecture, underground music scenes, and the raw energy of urban life.
              </p>
              <p>
                Today, Low Religion is shipped to over 50 countries, but our core remains the same: <span className="text-black font-bold italic">Stay Original. Belong Nowhere.</span>
              </p>
            </div>
          </div>
          <div className="aspect-square bg-gray-100 rounded-[64px] relative overflow-hidden group">
            {/* This would ideally have a high-res brand image */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700" />
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <p className="text-gray-300 font-bold text-lg text-center tracking-widest uppercase italic">Low Religion Studio // London 2026</p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">What we believe in</h2>
            <p className="text-gray-500 max-w-xl mx-auto">These are the pillars that support everything we do, from design to delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 space-y-6 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-black text-white rounded-[64px] p-12 md:p-24 overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-[#d8a4bc]">100K+</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Community</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-[#d8a4bc]">50+</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Countries</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-[#d8a4bc]">24/7</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Devotion</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-[#d8a4bc]">0%</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Conformity</p>
            </div>
          </div>
          {/* Subtle Glow */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#d8a4bc]/10 rounded-full blur-[120px] translate-y-1/2 translate-x-1/4" />
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-10 pb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to join?</h2>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-3 bg-black text-white px-12 py-6 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl active:scale-[0.98] group"
          >
            Shop The Drops
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-gray-400 text-sm font-medium">No membership required. Just authenticity.</p>
        </section>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SupabaseImage from '@/components/SupabaseImage';

export default function CategoryGridClient({ categoryData }: { categoryData: any[] }) {
  return (
    <section className="w-full bg-black">
      <div className="grid grid-cols-2 gap-[1px] bg-[#333333]">
        {categoryData.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
            className="relative group overflow-hidden bg-black"
          >
            <Link href={category.href} className="block relative aspect-[0.7/1] md:aspect-[4/5]">
              <SupabaseImage
                src={category.image}
                alt={category.title}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 50vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 p-4 md:p-6 lg:p-8 w-full">
                <span className="text-[#ff69b4] text-[16px] md:text-[20px] font-bold uppercase tracking-tight border-b-2 border-[#ff69b4] leading-none inline-block pb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {category.title}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

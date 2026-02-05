"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const categories = [
  {
    title: 'Sale Tops',
    image: '/products/img (2).png',
    href: '/collections/tops-tees?filter.p.m.custom.sale=true',
  },
  {
    title: 'Sale Bottoms',
    image: '/products/img (3).png',
    href: '/collections/bottoms?filter.p.m.custom.sale=true',
  },
  {
    title: 'Sale Hoodies',
    image: '/products/img (6).png',
    href: '/collections/sweatshirts-hoodies?filter.p.m.custom.sale=true',
  },
  {
    title: 'Sale Accessories',
    image: '/products/img (1).png',
    href: '/collections/accessories?filter.p.m.custom.sale=true',
  },
];

const CategoryGrid = () => {
  return (
    <section className="w-full bg-black">
      <div className="grid grid-cols-2 gap-[1px] bg-[#333333]">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
            className="relative group overflow-hidden bg-black"
          >
            <a href={category.href} className="block relative aspect-[1/1] md:aspect-[4/5]">
              <Image
                src={category.image}
                alt={category.title}
                fill
                priority={index < 4}
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 50vw"
              />

              {/* Enhanced Gradient Overlay for Legibility */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:from-black/100" />

              <div className="absolute bottom-0 left-0 p-4 md:p-6 lg:p-8 w-full">
                <span className="text-[#ff69b4] text-[16px] md:text-[20px] font-bold uppercase tracking-tight border-b-2 border-[#ff69b4] leading-none inline-block pb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {category.title}
                </span>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;

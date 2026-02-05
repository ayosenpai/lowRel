"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '@/lib/data';

export default function ProductShowcase({ products: initialProducts = [] }: { products?: any[] }) {
  // Use products from props if available (passed from server component)
  const displayProducts = initialProducts.length > 0 ? initialProducts : products;

  return (
    <section
      className="w-full bg-white py-0"
    >
      <div className="mx-auto max-w-full">
        <div className="grid grid-cols-3 bg-[#333333] gap-[1px]">
          {displayProducts.slice(0, 9).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>

  );
}

function ProductCard({ product, index }: { product: any, index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="group relative flex flex-col bg-white overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.handle}`} className="block w-full h-full">
        <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-white">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={isHovered ? 'hover' : 'default'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-1"
                sizes="(max-width: 768px) 33vw, 33vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Added price display for consistency */}
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          {product.symbol || 'Rs.'} {product.price?.toFixed(2)}
        </div>
      </Link>
    </motion.div>
  );
}

"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { products } from "@/lib/data";

const MovingCarousel = ({ products: initialProducts = [] }: { products?: any[] }) => {
  // Use products from props if available, otherwise fallback to static data
  const baseProducts = initialProducts.length > 0 ? initialProducts : products.map(p => ({
    ...p,
    price: p.priceUSD, // Fallback to USD for static usage
    symbol: '$'
  }));

  // Triple the products to ensure smooth infinite loop
  const marqueeProducts = [...baseProducts, ...baseProducts, ...baseProducts];

  return (
    <section className="w-full bg-[#d8a4bc] py-1   border-t border-black overflow-hidden">
      <div className="flex flex-col gap-6">
        <div className="px-5">
          <h2 className="text-black text-[18px] font-bold uppercase tracking-[0.2em]">
            Shop The Look
          </h2>
        </div>

        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{
              x: [0, -1600] // Adjust based on content width
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {marqueeProducts.map((product, index) => (
              <Link
                href={`/products/${product.handle}`}
                key={`${product.id}-${index}`}
                className="flex-shrink-0 w-[200px] md:w-[200px] group"
              >
                <div className="relative aspect-[3/5] overflow-hidden bg-[#111111]">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width: 768px) 200px, 200px"
                    loading="lazy"
                  />
                </div>

                <div className="mt-3">
                  <p className="text-black text-[12px] tracking-[0.15em] uppercase font-bold tracking-wider truncate">
                    {product.name}
                  </p>
                  <p className="text-black text-[12px] font-bold tracking-[0.1em] opacity-60">
                    {product.symbol || '$'} {product.price?.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MovingCarousel;

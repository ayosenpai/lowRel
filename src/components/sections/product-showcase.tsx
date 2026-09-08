"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import SupabaseImage from '@/components/SupabaseImage';
import type { Product } from '@/lib/types';

export default function ProductShowcase({ products = [] }: { products?: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="w-full bg-white py-0">
      <div className="mx-auto max-w-full">
        <div className="grid grid-cols-3 bg-black gap-[0.9px]">
          {products.slice(0, 9).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index }: { product: Product, index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative flex flex-col bg-white overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.handle}`} className="block w-full h-full">
        <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-white">
          <div className="absolute inset-0">
            <SupabaseImage
              src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 33vw, 33vw"
              loading={index < 3 ? 'eager' : 'lazy'}
            />
          </div>
        </div>

        <div className="absolute bottom-2 left-2 bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          {product.symbol || '₹'} {product.price?.toFixed(2)}
        </div>
      </Link>
    </div>
  );
}

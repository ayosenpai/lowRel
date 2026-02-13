"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/data';


export default function ProductShowcase({ products: initialProducts = [] }: { products?: any[] }) {
  // Use products from props if available (passed from server component)
  const displayProducts = initialProducts.length > 0 ? initialProducts : products;

  return (
    <section
      className="w-full bg-white py-0"
    >
      <div className="mx-auto max-w-full">
        <div className="grid grid-cols-3 bg-black gap-[0.9px]">
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
    <div
      className="group relative flex flex-col bg-white overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.handle}`} className="block w-full h-full">
        <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-white">
          <div className="absolute inset-0">
            <Image
              src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-1 transition-opacity duration-300"
              sizes="(max-width: 768px) 33vw, 33vw"
              loading="lazy"
            />
          </div>
        </div>


        {/* Added price display for consistency */}
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          {product.symbol || 'Rs.'} {product.price?.toFixed(2)}
        </div>
      </Link>
    </div>

  );
}

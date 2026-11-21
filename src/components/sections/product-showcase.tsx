"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import SupabaseImage from '@/components/SupabaseImage';
import type { Product } from '@/lib/types';
import { isComingSoon } from '@/lib/store-config';
import {
  COMING_SOON_IMAGE_CLASS,
  COMING_SOON_LABEL,
  COMING_SOON_PRICE_LABEL,
} from '@/components/product-coming-soon';

const GRID_COLUMNS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
};

export default function ProductShowcase({
  products = [],
  title = '',
  ctaLabel = '',
  ctaHref = '',
  columns = 3,
}: {
  products?: Product[];
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  columns?: number;
}) {
  if (!products.length) return null;

  return (
    <section className="w-full bg-white py-0">
      <div className="mx-auto max-w-full">
        {(title || (ctaLabel && ctaHref)) && (
          <div className="flex items-end justify-between gap-4 px-5 py-8 lg:px-10">
            {title && (
              <h2 className="text-xl font-black uppercase tracking-tight md:text-3xl">
                {title}
              </h2>
            )}
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="flex-shrink-0 border-b border-black pb-1 text-[10px] font-black uppercase tracking-[0.18em] hover:text-gray-500 transition-colors"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        )}
        <div className={`grid ${GRID_COLUMNS[columns] || GRID_COLUMNS[3]} bg-black gap-[0.9px]`}>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index }: { product: Product, index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const comingSoon = isComingSoon(product);

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
              src={!comingSoon && isHovered && product.images[1] ? product.images[1] : product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-300 ${comingSoon ? COMING_SOON_IMAGE_CLASS : ''}`}
              sizes="(max-width: 768px) 33vw, 33vw"
              loading={index < 3 ? 'eager' : 'lazy'}
            />
          </div>

          {comingSoon && (
            <span className="absolute top-2 left-2 z-10 bg-black text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1">
              {COMING_SOON_LABEL}
            </span>
          )}
        </div>

        <div className="absolute bottom-2 left-2 bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          {comingSoon
            ? COMING_SOON_PRICE_LABEL
            : <>{product.symbol || '₹'} {product.price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>}
        </div>
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import SupabaseImage from "@/components/SupabaseImage";
import type { Product } from "@/lib/types";
import { isComingSoon } from "@/lib/store-config";
import {
  COMING_SOON_IMAGE_CLASS,
  COMING_SOON_LABEL,
} from "@/components/product-coming-soon";

const WIDTH_CLASSES: Record<number, string> = {
  2: "w-[70vw] md:w-1/2",
  3: "w-[47vw] md:w-1/3",
  4: "w-[47vw] md:w-[33vw] lg:w-1/4",
  5: "w-[40vw] md:w-1/4 lg:w-1/5",
};

export default function BraceletCarousel({
  products = [],
  title = "",
  ctaLabel = "",
  ctaHref = "",
  itemsPerView = 4,
}: {
  products?: Product[];
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  itemsPerView?: number;
}) {
  if (products.length === 0) return null;

  return (
    <section className="w-full bg-white">
      {(title || (ctaLabel && ctaHref)) && (
        <div className="flex items-end justify-between gap-4 px-5 pt-8 pb-4 lg:px-10">
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
      <div
        className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className={`relative block flex-shrink-0 ${WIDTH_CLASSES[itemsPerView] || WIDTH_CLASSES[4]}`}
          >
            <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-white">
              <SupabaseImage
                src={product.images[0]}
                alt={product.name}
                fill
                className={`object-cover ${isComingSoon(product) ? COMING_SOON_IMAGE_CLASS : ''}`}
                sizes="(max-width: 768px) 47vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
              {isComingSoon(product) && (
                <span className="absolute top-3 left-3 z-10 bg-black text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1">
                  {COMING_SOON_LABEL}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

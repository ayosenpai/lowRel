"use client";

import Link from "next/link";
import SupabaseImage from "@/components/SupabaseImage";
import type { Product } from "@/lib/types";
import { isComingSoon } from "@/lib/store-config";
import {
  COMING_SOON_IMAGE_CLASS,
  COMING_SOON_LABEL,
} from "@/components/product-coming-soon";

export default function BraceletCarousel({ products = [] }: { products?: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="w-full bg-white">
      <div
        className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="relative block flex-shrink-0 w-[47vw] md:w-[33vw] lg:w-[25vw]"
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

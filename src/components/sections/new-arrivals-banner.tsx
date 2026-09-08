"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import SupabaseImage from "@/components/SupabaseImage";

const REPEATS = 3;

export default function NewArrivalsBanner({
  products = [],
}: {
  products?: any[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getCycle = () => {
    const el = trackRef.current;
    if (!el || el.children.length < 2) return 0;
    const first = el.children[0] as HTMLElement;
    const second = el.children[1] as HTMLElement;
    return second.offsetLeft - first.offsetLeft;
  };

  // Start centered on the real (middle) copy so a neighbor peeks on the left.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !el.children.length) return;
    const cycle = getCycle();
    if (cycle > 0) el.scrollLeft = cycle;
  }, []);

  if (!products.length) return null;

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;

    const cycle = getCycle();
    if (cycle <= 0) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const buffer = 8;

    if (el.scrollLeft >= maxScroll - buffer) {
      el.scrollLeft -= cycle;
    } else if (el.scrollLeft <= buffer) {
      el.scrollLeft += cycle;
    }
  };

  return (
    <section className="w-full overflow-hidden border-t border-black bg-[#d8a4bc] py-1">
      <div className="flex flex-col gap-6 max-w-[430px] mx-auto w-full">
        <div className="px-5">
          <h2 className="text-[18px] font-bold uppercase tracking-[0.2em] text-black">
            Shop The Look
          </h2>
        </div>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto overflow-y-hidden gap-4 px-[calc(50%-100px)] pb-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {Array.from({ length: REPEATS }, (_, copy) => {
            const isReal = copy === 1;
            return (
              <div
                key={copy}
                className="flex gap-4 flex-shrink-0"
                aria-hidden={!isReal}
              >
                {products.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    tabIndex={isReal ? undefined : -1}
                    className="group flex-shrink-0 w-[200px]"
                    draggable={false}
                  >
                    <div className="relative aspect-[3/5] overflow-hidden bg-[#111111]">
                      <SupabaseImage
                        src={product.images?.[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="200px"
                        loading={isReal && index < 8 ? "eager" : "lazy"}
                      />
                    </div>

                    <div className="mt-3">
                      <p className="truncate text-[12px] font-bold uppercase tracking-[0.15em] text-black">
                        {product.name}
                      </p>

                      <p className="text-[12px] font-bold tracking-[0.1em] text-black/60">
                        {product.symbol || "$"}{" "}
                        {product.price?.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import SupabaseImage from "@/components/SupabaseImage";
import { isComingSoon } from "@/lib/store-config";
import {
    COMING_SOON_IMAGE_CLASS,
    COMING_SOON_LABEL,
    COMING_SOON_PRICE_LABEL,
} from "@/components/product-coming-soon";

interface Product {
    id: string;
    name: string;
    handle: string;
    price: number;
    symbol: string;
    images?: string[] | null;
    category?: string | null;
}

interface CompleteTheLookProps {
    products: Product[];
    currentProductId: string;
}

export default function CompleteTheLook({ products, currentProductId }: CompleteTheLookProps) {
    const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

    // Filter out current product and limit to 3-4 items
    const relatedProducts = products
        .filter(p => p.id !== currentProductId)
        .slice(0, 4);

    if (relatedProducts.length === 0) return null;

    return (
        <div className="border-t border-gray-100 pt-3 mt-5">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">Complete the Look</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((product) => {
                    const comingSoon = isComingSoon(product);

                    return (
                    <div key={product.id}>
                        <Link href={`/products/${product.handle}`} className="group block">
                            <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden mb-3">
                                {/* Skeleton loader */}
                                {!imageLoaded[product.id] && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                                )}

                                {product.images && product.images[0] && (
                                    <div
                                        className="relative w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    >
                                        <SupabaseImage
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className={`object-cover ${comingSoon ? COMING_SOON_IMAGE_CLASS : ''}`}
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            onLoad={() => setImageLoaded(prev => ({ ...prev, [product.id]: true }))}
                                        />
                                    </div>
                                )}

                                {comingSoon && (
                                    <span className="absolute top-2 left-2 z-10 bg-black text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1">
                                        {COMING_SOON_LABEL}
                                    </span>
                                )}
                            </div>


                            <div className="space-y-1">
                                <h3 className="text-sm font-medium uppercase tracking-wide group-hover:text-gray-600 transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">
                                    {product.category}
                                </p>
                                <p className={`text-sm font-bold ${comingSoon ? 'text-gray-500 uppercase text-[11px] tracking-widest' : ''}`}>
                                    {comingSoon
                                        ? COMING_SOON_PRICE_LABEL
                                        : `${product.symbol}${product.price.toFixed(2)}`}
                                </p>
                            </div>
                        </Link>
                    </div>

                    );
                })}
            </div>
        </div>
    );
}

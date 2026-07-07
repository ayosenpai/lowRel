"use client";

import Link from "next/link";
import { useState } from "react";
import SupabaseImage from "@/components/SupabaseImage";

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
                {relatedProducts.map((product) => (
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
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            onLoad={() => setImageLoaded(prev => ({ ...prev, [product.id]: true }))}
                                        />
                                    </div>
                                )}
                            </div>


                            <div className="space-y-1">
                                <h3 className="text-sm font-medium uppercase tracking-wide group-hover:text-gray-600 transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">
                                    {product.category}
                                </p>
                                <p className="text-sm font-bold">
                                    {product.symbol}{product.price.toFixed(2)}
                                </p>
                            </div>
                        </Link>
                    </div>

                ))}
            </div>
        </div>
    );
}

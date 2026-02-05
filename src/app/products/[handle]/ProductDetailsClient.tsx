
"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from "@/lib/actions/analytics";

export default function ProductDetailsClient({ product }: { product: any }) {
    const router = useRouter();
    const { dispatch } = useCart();
    const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }
        getUser();
    }, [supabase]);

    const isFavorited = wishlistState.items.some((item) => item.id === product.id);

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push('/login');
            return;
        }

        wishlistDispatch({ type: 'TOGGLE_WISHLIST', payload: product });
    };

    const [isAdding, setIsAdding] = useState(false);

    const handleAddToBag = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        setIsAdding(true);
        dispatch({ type: 'ADD_TO_CART', payload: { product, size: selectedSize } });

        // Track event
        trackEvent({
            eventType: 'add_to_cart',
            payload: {
                productId: product.id,
                name: product.name,
                price: product.price,
                currency: product.currency,
                size: selectedSize
            }
        });

        // Auto-open cart sidebar
        setTimeout(() => {
            dispatch({ type: 'OPEN_CART' });
            setIsAdding(false);
        }, 500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.images?.map((image: string, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden"
                        >
                            <Image
                                src={image}
                                alt={`${product.name} - ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={index === 0}
                            />

                            {/* Wishlist Heart Overlay */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleToggleWishlist}
                                className="absolute bottom-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors group/heart"
                            >
                                <Heart
                                    className={`w-5 h-5 transition-colors ${isFavorited
                                        ? 'fill-black text-black'
                                        : 'text-gray-400 group-hover/heart:text-black'
                                        }`}
                                />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Right: Product Info */}
            <div className="lg:col-span-5 lg:sticky lg:top-[120px] h-fit">
                <div className="space-y-6">
                    <div>
                        <nav className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">
                            Home / {product.category} / {product.name}
                        </nav>
                        <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-tight mb-2">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className={`text-xl font-medium ${product.isSale ? 'text-[#ff69b4]' : ''}`}>
                                {product.symbol} {product.price.toFixed(2)}
                            </span>
                            {product.compareAtPrice && (
                                <span className="text-gray-400 line-through text-lg">
                                    {product.symbol} {product.compareAtPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest">Select Size</span>
                            <button className="text-[10px] uppercase tracking-widest underline decoration-gray-300">Size Guide</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {['XS', 'S', 'M', 'L'].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-12 border transition-colors flex items-center justify-center text-sm font-medium ${selectedSize === size
                                        ? 'border-black bg-black text-[#d8a4bc]'
                                        : 'border-gray-200 hover:border-black'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddToBag}
                            disabled={isAdding}
                            className="w-full bg-[#d8a4bc] text-black h-14 uppercase font-bold tracking-[0.2em] text-sm hover:bg-black hover:text-[#d8a4bc] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isAdding ? 'Adding...' : 'Add to Bag'}
                        </motion.button>
                    </div>

                    <div className="space-y-4 pt-6">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest">Fit:</span>
                            <span className="text-xs uppercase tracking-widest text-gray-600">{product.fit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest">Model:</span>
                            <span className="text-xs uppercase tracking-widest text-gray-600">{product.modelInfo}</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <p className="text-sm leading-relaxed text-gray-700">
                            {product.description}
                        </p>
                        <ul className="mt-4 space-y-2">
                            {product.details?.map((detail: string, i: number) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="mt-1.5 w-1 h-1 bg-black rounded-full shrink-0" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

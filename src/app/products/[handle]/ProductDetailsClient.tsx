
"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from "@/lib/actions/analytics";
import SkeletonLoader from "@/components/ui/skeleton-loader";
import CompleteTheLook from "@/components/sections/complete-the-look";
import ProductReviews from "@/components/sections/product-reviews";

export default function ProductDetailsClient({ product, relatedProducts }: { product: any; relatedProducts?: any[] }) {
    const router = useRouter();
    const { dispatch } = useCart();
    const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [user, setUser] = useState<any>(null);
    const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
        setIsZoomed(false);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setIsZoomed(false);
        document.body.style.overflow = 'unset';
    };

    const lastTap = useRef(0);
    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            setIsZoomed(!isZoomed);
        }
        lastTap.current = now;
    };

    const handleDoubleClick = () => {
        setIsZoomed(!isZoomed);
    };

    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % (product.images?.length || 1));
        setIsZoomed(false);
    }, [product.images?.length]);

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
        setIsZoomed(false);
    }, [product.images?.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, nextImage, prevImage]);

    useEffect(() => {
        const supabase = createClient();
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }
        getUser();
    }, []);

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
        <div className="space-y-4">
            {/* Breadcrumb Navigation - Full Width Header */}
            <nav className="text-[8px] uppercase tracking-[0.25em] text-[#9a9a9a] font-medium flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity duration-300 px-5 lg:px-10">
                <Link href="/" className="hover:text-black transition-colors">Home</Link>
                <span className="text-[8px] opacity-60">/</span>
                <Link href={`/collections/${product.category?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-black transition-colors">
                    {product.category}
                </Link>
                <span className="text-[8px] opacity-60">/</span>
                <span className="text-[#bebebe]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Image Gallery */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.images?.map((image: string, index: number) => (
                            <div
                                key={index}
                                className={`aspect-[9/14] relative bg-[#f5f5f5] overflow-hidden group ${index === 0 ? 'md:col-span-2' : ''}`}
                            >
                                {/* Skeleton Loader */}
                                {!imageLoaded[index] && (
                                    <div className="absolute inset-0 z-10">
                                        <SkeletonLoader variant="product-image" />
                                    </div>
                                )}

                                {/* Product Image */}
                                <div
                                    className="relative w-full h-full transition-transform duration-500 hover:scale-105 cursor-zoom-in"
                                    onClick={() => openLightbox(index)}
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.name} - ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority={index === 0}
                                        onLoad={() => setImageLoaded(prev => ({ ...prev, [index]: true }))}
                                    />
                                </div>


                                {/* Wishlist Heart Overlay */}
                                <button
                                    onClick={handleToggleWishlist}
                                    className="absolute bottom-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all group/heart hover:scale-110 active:scale-90"
                                >
                                    <div
                                        className={`transition-transform duration-300 ${isFavorited ? 'scale-110' : ''}`}
                                    >
                                        <Heart
                                            className={`w-5 h-5 transition-colors ${isFavorited
                                                ? 'fill-black text-black'
                                                : 'text-gray-400 group-hover/heart:text-black'
                                                }`}
                                        />
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="lg:col-span-5 lg:sticky lg:top-[120px] h-fit px-5 lg:px-10">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-bold uppercase tracking-[0.01em] mb-1 text-center">
                                {product.name}
                            </h1>
                            <div className="flex items-center justify-center gap-4">
                                <span className={`text-xl font-bold tracking-[.009em] ${product.isSale ? 'text-[#ff69b4]' : ''}`}>
                                    {product.symbol} {product.price.toFixed(2)}
                                </span>
                                {product.compareAtPrice && (
                                    <span className="text-gray-400 line-through text-lg">
                                        {product.symbol} {product.compareAtPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest">Select Size</span>
                                <button className="text-[10px] uppercase tracking-widest underline decoration-gray-300 hover:text-black transition-colors">Size Guide</button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {['XS', 'S', 'M', 'L'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-12 border transition-all duration-300 flex items-center justify-center text-sm font-medium hover:scale-105 active:scale-95 ${selectedSize === size
                                            ? 'border-black bg-black text-[#d8a4bc] shadow-md'
                                            : 'border-gray-200 hover:border-black hover:shadow-sm'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>

                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAddToBag}
                                disabled={isAdding}
                                className="relative w-full bg-[#d8a4bc] text-black h-14 uppercase font-bold tracking-[0.2em] text-sm hover:bg-black hover:text-[#d8a4bc] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {isAdding ? (
                                    <span
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <span
                                            className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"
                                        />
                                        Adding...
                                    </span>
                                ) : 'Add to Bag'}
                            </button>
                        </div>


                        <div className="space-y-4 pt-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest">Fit:</span>
                                <span className="text-xs uppercase tracking-widest text-black">{product.fit}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest">Model:</span>
                                <span className="text-xs uppercase tracking-widest text-black">{product.modelInfo}</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm leading-relaxed text-black font-medium">
                                {product.description}
                            </p>
                            <ul className="mt-4 space-y-2">
                                {product.details?.map((detail: string, i: number) => (
                                    <li key={i} className="text-sm text-black font-medium flex items-start gap-2">
                                        <span className="mt-2 w-1 h-1 bg-black rounded-full shrink-0" />
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Lightbox Modal */}
                <AnimatePresence>
                    {isLightboxOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[1000] bg-[#1a1a1a] flex flex-col items-center justify-center overflow-hidden"
                        >
                            {/* Main Image Container */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{
                                    scale: isZoomed ? 2.5 : 1,
                                    x: isZoomed ? undefined : 0,
                                    y: isZoomed ? undefined : 0,
                                    opacity: 1,
                                }}
                                drag={isZoomed}
                                dragConstraints={{ left: -1000, right: 1000, top: -1200, bottom: 1200 }}
                                dragElastic={0.05}
                                dragMomentum={false}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", damping: 30, stiffness: 150 }}
                                className={`relative w-full h-full flex items-center justify-center ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                            >
                                <div
                                    className="relative w-full h-full"
                                    onDoubleClick={handleDoubleClick}
                                    onTouchEnd={handleDoubleTap}
                                >
                                    <Image
                                        src={product.images[currentImageIndex]}
                                        alt={product.name}
                                        fill
                                        className="object-cover md:object-contain pointer-events-none select-none"
                                        priority
                                        quality={100}
                                    />
                                </div>
                            </motion.div>

                            {/* Bottom Control Bar - Matching Reference Image */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
                                <button
                                    onClick={prevImage}
                                    className="w-14 h-14 md:w-16 md:h-16 bg-white flex items-center justify-center text-black hover:bg-gray-100 transition-colors shadow-2xl"
                                    aria-label="Previous Image"
                                >
                                    <ChevronLeft className="w-7 h-7 md:w-8 md:h-8 stroke-[2px]" />
                                </button>

                                <button
                                    onClick={closeLightbox}
                                    className="w-14 h-14 md:w-16 md:h-16 bg-white flex items-center justify-center text-black hover:bg-gray-100 transition-colors shadow-2xl"
                                    aria-label="Close Lightbox"
                                >
                                    <X className="w-7 h-7 md:w-8 md:h-8 stroke-[2px]" />
                                </button>

                                <button
                                    onClick={nextImage}
                                    className="w-14 h-14 md:w-16 md:h-16 bg-white flex items-center justify-center text-black hover:bg-gray-100 transition-colors shadow-2xl"
                                    aria-label="Next Image"
                                >
                                    <ChevronRight className="w-7 h-7 md:w-8 md:h-8 stroke-[2px]" />
                                </button>
                            </div>

                            {/* Pagination Counter */}
                            <div className="absolute top-8 text-white/40 text-[10px] uppercase font-black tracking-[0.4em]">
                                {currentImageIndex + 1} / {product.images?.length}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Complete the Look Section */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="lg:col-span-12 px-5 lg:px-10">
                        <CompleteTheLook
                            products={relatedProducts}
                            currentProductId={product.id}
                        />
                    </div>
                )}

                {/* Reviews Section */}
                <div className="lg:col-span-12">
                    <ProductReviews
                        productId={product.id}
                        productHandle={product.handle}
                        productName={product.name}
                    />
                </div>
            </div>
        </div>
    );
}

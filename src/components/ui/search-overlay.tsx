
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import Link from 'next/link';
import { getProducts } from '@/lib/actions/products';
import { track } from '@/lib/analytics-client';
import SupabaseImage from '@/components/SupabaseImage';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Prevent scrolling when overlay is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle Search Logic via Server Action
    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim() === '') {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const { products: fetchedResults } = await getProducts({
                    search: query.trim(),
                    limit: 5
                });
                setResults(fetchedResults);

                // Track search intent
                if (query.trim().length > 2) {
                    track({
                        eventType: 'search',
                        payload: { query: query.trim(), resultsCount: fetchedResults.length }
                    });
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [query]);

    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed top-[94px] left-0 w-full z-[150]">
                    {/* Backdrop - Always show when open to allow clicking out */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140]"
                    />

                    {/* Slim Search Bar */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                        className="relative w-full bg-black border-t border-gray-800 z-[150]"
                    >
                        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-3 flex items-center gap-4">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search Low Religion..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent text-white text-base md:text-lg focus:outline-none placeholder-gray-500 uppercase tracking-widest"
                            />
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* In-place Results if any */}
                        <AnimatePresence>
                            {query.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 w-full bg-white text-black shadow-xl"
                                >
                                    <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-6">
                                        {results.length > 0 ? (
                                            <div className="space-y-4">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Products</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                                    {results.map((product) => (
                                                        <Link
                                                            key={product.id}
                                                            href={`/products/${product.handle}`}
                                                            onClick={onClose}
                                                            className="flex items-center gap-4 p-2 hover:bg-gray-50 transition-colors group"
                                                        >
                                                            <div className="relative w-12 aspect-[3/4] bg-gray-100 flex-shrink-0">
                                                                <SupabaseImage
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-xs font-bold uppercase truncate group-hover:text-black">{product.name}</h4>
                                                                <p className="text-[10px] text-gray-500">{product.symbol || 'Rs.'} {product.price?.toFixed(2)}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <Link
                                                    href={`/collections/all?q=${query}`}
                                                    onClick={onClose}
                                                    className="block text-center pt-4 text-xs font-black uppercase tracking-widest border-t border-gray-100 mt-4"
                                                >
                                                    View all results
                                                </Link>
                                            </div>
                                        ) : (
                                            <p className="text-center py-4 text-sm text-gray-400 uppercase tracking-widest">No products found</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

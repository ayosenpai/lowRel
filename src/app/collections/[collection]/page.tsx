
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SupabaseImage from '@/components/SupabaseImage';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { getProducts } from '@/lib/actions/products';
import { notFound } from 'next/navigation';

export default async function CollectionPage({ params, searchParams }: {
    params: Promise<{ collection: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { collection } = await params;
    const sParams = await searchParams;

    // Convert collection slug to category filter for the action
    let category: string | undefined = undefined;
    let isNew: boolean | undefined = undefined;
    let isSale: boolean | undefined = undefined;
    let search: string | undefined = sParams.q as string | undefined;

    if (collection === 'tops-tees') category = 'Tops';
    else if (collection === 'bottoms') category = 'Bottoms';
    else if (collection === 'accessories') category = 'Accessories';
    else if (collection === 'outerwear') category = 'Outerwear';
    else if (collection === 'new-in') isNew = true;
    else if (collection === 'sale') isSale = true;
    else if (collection !== 'all') {
        // Handle custom sweatshirts logic or 404
        if (collection === 'sweatshirts-hoodies') {
            category = 'Tops'; // We might need more granular filtering in the action later
        } else {
            // return notFound(); // Uncomment if you want strict 404
        }
    }

    const title = getCollectionTitle(collection);

    // Fetch products using our optimized server action
    // Note: In a real scenario, we'd add more filters to the action for isNew/isSale
    const { products: displayProducts, metadata } = await getProducts({
        category,
        search,
        page: Number(sParams.page || 1),
        limit: 24,
        sort: (sParams.sort as any) || 'newest'
    });

    return (
        <main className="min-h-screen bg-white text-black pt-[94px]">
            <Header variant="solid" />

            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-10">
                <div className="mb-10 text-center">
                    <nav className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">
                        Home / Collections / {title}
                    </nav>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
                        {title}
                    </h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">
                        {metadata.total} Products {metadata.region === 'IN' ? '(India)' : '(International)'}
                    </p>
                </div>

                {displayProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-lg">No products found in this collection.</p>
                        <Link href="/collections/all" className="inline-block mt-4 underline uppercase tracking-widest text-sm">View All Products</Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-1 gap-y-10">
                            {displayProducts.map((product) => (
                                <Link key={product.id} href={`/products/${product.handle}`} className="group block">
                                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
                                        <SupabaseImage
                                            src={product.images?.[0] || ''}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                        {product.isSale && (
                                            <span className="absolute top-2 left-2 bg-[#ff69b4] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                                Sale
                                            </span>
                                        )}
                                        {product.isNew && !product.isSale && (
                                            <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xs md:text-sm font-bold uppercase tracking-wide truncate pr-4">{product.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs md:text-sm font-bold ${product.isSale ? 'text-[#ff69b4]' : 'text-black'}`}>
                                                {product.symbol} {product.price.toFixed(2)}
                                            </span>
                                            {product.compareAtPrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    {product.symbol} {product.compareAtPrice.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination controls can be added here */}
                        {metadata.totalPages > 1 && (
                            <div className="mt-20 flex justify-center gap-4">
                                {/* Simple pagination links would go here */}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </main>
    );
}

// Helper for display titles
const getCollectionTitle = (collection: string) => {
    switch (collection) {
        case 'new-in': return 'New Arrivals';
        case 'sale': return 'Sale';
        case 'tops-tees': return 'Tops & Tees';
        case 'bottoms': return 'Bottoms';
        case 'sweatshirts-hoodies': return 'Sweatshirts & Hoodies';
        case 'accessories': return 'Accessories';
        case 'outerwear': return 'Outerwear';
        case 'all': return 'All Products';
        default: return collection.replace(/-/g, ' ');
    }
};

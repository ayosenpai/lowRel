
import React from 'react';
import Link from 'next/link';
import SupabaseImage from '@/components/SupabaseImage';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { getProducts } from '@/lib/actions/products';
import { notFound } from 'next/navigation';

const ITEMS_PER_PAGE = 24;

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
    const search = sParams.q as string | undefined;

    if (collection === 'tops-tees' || collection === 'tops') category = 'Tops';
    else if (collection === 'bottoms') category = 'Bottoms';
    else if (collection === 'accessories') category = 'Accessories';
    else if (collection === 'outerwear') category = 'Outerwear';
    else if (collection === 'sweatshirts-hoodies') category = 'Tops';
    else if (collection === 'new-in') isNew = true;
    else if (collection === 'sale') isSale = true;
    else if (collection !== 'all') {
        notFound();
    }

    const title = getCollectionTitle(collection);
    const currentPage = Math.max(1, Number(sParams.page) || 1);

    const { products: displayProducts, metadata } = await getProducts({
        category,
        search,
        isNew,
        isSale,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
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
                                                {product.symbol} {product.price?.toFixed(2)}
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

                        {/* Pagination */}
                        {metadata.totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={metadata.totalPages}
                                baseHref={`/collections/${collection}`}
                                searchParams={sParams}
                            />
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
        case 'tops': return 'Tops & Tees';
        case 'tops-tees': return 'Tops & Tees';
        case 'bottoms': return 'Bottoms';
        case 'sweatshirts-hoodies': return 'Sweatshirts & Hoodies';
        case 'accessories': return 'Accessories';
        case 'outerwear': return 'Outerwear';
        case 'all': return 'All Products';
        default: return collection.replace(/-/g, ' ');
    }
};

function Pagination({ currentPage, totalPages, baseHref, searchParams }: {
    currentPage: number;
    totalPages: number;
    baseHref: string;
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const pageHref = (page: number) => {
        const params = new URLSearchParams();
        if (typeof searchParams.q === 'string') params.set('q', searchParams.q);
        if (typeof searchParams.sort === 'string') params.set('sort', searchParams.sort);
        if (page > 1) params.set('page', String(page));
        const qs = params.toString();
        return qs ? `${baseHref}?${qs}` : baseHref;
    };

    const pages: (number | '...')[] = [];
    for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
            pages.push(p);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <nav className="mt-20 flex items-center justify-center gap-2" aria-label="Pagination">
            {currentPage > 1 && (
                <Link href={pageHref(currentPage - 1)} className="px-4 py-2 border border-black text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                    Prev
                </Link>
            )}
            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                ) : (
                    <Link
                        key={p}
                        href={pageHref(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                        className={`w-10 h-10 flex items-center justify-center text-[11px] font-bold uppercase transition-colors ${p === currentPage
                            ? 'bg-black text-white'
                            : 'border border-gray-200 hover:border-black'
                            }`}
                    >
                        {p}
                    </Link>
                )
            )}
            {currentPage < totalPages && (
                <Link href={pageHref(currentPage + 1)} className="px-4 py-2 border border-black text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                    Next
                </Link>
            )}
        </nav>
    );
}

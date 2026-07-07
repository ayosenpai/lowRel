'use server';

import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and, ilike, sql, desc, asc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';

export interface GetProductsOptions {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: 'price_asc' | 'price_desc' | 'newest';
    region?: 'IN' | 'GLOBAL';
}

export const getProducts = async (options: GetProductsOptions = {}) => {
    // Get region outside the cached function if not provided
    if (!options.region) {
        const headerList = await headers();
        options.region = (headerList.get('x-region') as 'IN' | 'GLOBAL') || 'GLOBAL';
    }

    if (process.env.NODE_ENV === 'development') {
        // Bypass next.js unstable_cache completely during development
        return fetchRawProducts(options);
    }

    return getCachedProducts(options);
};

const fetchRawProducts = async (options: GetProductsOptions) => {
    const {
        category,
        search,
        page = 1,
        limit = 12,
        sort = 'newest',
        region = 'GLOBAL'
    } = options;

    const offset = (page - 1) * limit;
    const isIndia = region === 'IN';

    let whereClause = undefined;
    let conditions = [];

    if (category && category !== 'All') {
        conditions.push(eq(products.category, category));
    }

    if (search) {
        conditions.push(ilike(products.name, `%${search}%`));
    }

    if (conditions.length > 0) {
        whereClause = and(...conditions);
    }

    let orderBy = [desc(products.createdAt)];
    if (sort === 'price_asc') {
        orderBy = [asc(isIndia ? products.priceINR : products.priceUSD)];
    } else if (sort === 'price_desc') {
        orderBy = [desc(isIndia ? products.priceINR : products.priceUSD)];
    }

    const data = await db.select().from(products)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(...orderBy);

    // Count total for pagination
    const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);

    return {
        products: data.map(p => ({
            ...p,
            // Adaptive price based on region
            price: isIndia ? p.priceINR / 100 : p.priceUSD / 100,
            compareAtPrice: isIndia
                ? (p.compareAtPriceINR ? p.compareAtPriceINR / 100 : undefined)
                : (p.compareAtPriceUSD ? p.compareAtPriceUSD / 100 : undefined),
            currency: isIndia ? 'INR' : 'USD',
            symbol: isIndia ? '₹' : '$'
        })),
        metadata: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            region
        }
    };
};

const getCachedProducts = unstable_cache(
    async (options: GetProductsOptions) => fetchRawProducts(options),
    ['products'],
    { revalidate: 3600, tags: ['products'] }
);

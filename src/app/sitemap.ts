import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lowreligion.com';

// Generated at request time so product/collection URLs stay fresh
export const dynamic = 'force-dynamic';

const STATIC_ROUTES: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/collections/all`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/collections/new-in`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/collections/sale`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/collections/tops`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/collections/bottoms`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/collections/accessories`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/collections/outerwear`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/help`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/help/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/help/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/help/faqs`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/help/shipping`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/help/returns`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/help/size-guide`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/help/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/help/terms`, changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes = [...STATIC_ROUTES];

    try {
        // Dynamic import keeps the sitemap buildable without a DATABASE_URL
        const { db } = await import('@/db');
        const { products } = await import('@/db/schema');

        const rows = await db
            .select({ handle: products.handle, createdAt: products.createdAt })
            .from(products);

        const productRoutes: MetadataRoute.Sitemap = rows.map((p) => ({
            url: `${SITE_URL}/products/${p.handle}`,
            lastModified: p.createdAt,
            changeFrequency: 'weekly',
            priority: 0.6,
        }));

        return [...staticRoutes, ...productRoutes];
    } catch (error) {
        console.error('[sitemap] Failed to load products, serving static routes only:', error);
        return staticRoutes;
    }
}

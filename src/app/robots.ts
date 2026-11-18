import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lowreligion.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/api',
                    '/account',
                    '/auth',
                    '/checkout',
                    '/login',
                    '/register',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}

import Script from 'next/script';

interface ProductSchemaProps {
    product: {
        id: string | number;
        name: string;
        description: string | null;
        price: number;
        currency: string;
        images?: string[] | null;
        category?: string | null;
        handle?: string;
        compareAtPrice?: number | null;
        availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'LimitedAvailability';
        reviewStats?: {
            averageRating: number;
            totalCount: number;
        };
    };
}

export default function ProductSchema({ product }: ProductSchemaProps) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || `Premium ${product.category || 'product'} - ${product.name}`,
        image: product.images || [],
        brand: {
            '@type': 'Brand',
            name: 'Low Religion',
        },
        offers: {
            '@type': 'Offer',
            url: `https://lowreligion.com/products/${product.handle}`,
            priceCurrency: product.currency,
            price: product.price.toFixed(2),
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            availability: `https://schema.org/${product.availability || 'InStock'}`,
            itemCondition: 'https://schema.org/NewCondition',
        },
        category: product.category,
    };

    if (product.reviewStats && product.reviewStats.totalCount > 0) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: product.reviewStats.averageRating.toFixed(1),
            reviewCount: product.reviewStats.totalCount,
            bestRating: '5',
            worstRating: '1',
        };
    }

    // Add aggregate rating if available (placeholder for future implementation)
    // if (product.rating && product.reviewCount) {
    //   schema.aggregateRating = {
    //     '@type': 'AggregateRating',
    //     ratingValue: product.rating,
    //     reviewCount: product.reviewCount,
    //   };
    // }

    return (
        <Script
            id="product-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}


import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from './index';
import { products } from './schema';
import { products as initialProducts } from '@/lib/data';

async function seed() {
    console.log('Seeding products...');

    for (const product of initialProducts) {
        await db.insert(products).values({
            id: product.id,
            handle: product.handle,
            name: product.name,
            priceUSD: Math.round(product.priceUSD * 100), // Convert to cents
            priceINR: Math.round(product.priceINR * 100), // Convert to cents
            compareAtPriceUSD: product.compareAtPriceUSD ? Math.round(product.compareAtPriceUSD * 100) : null,
            compareAtPriceINR: product.compareAtPriceINR ? Math.round(product.compareAtPriceINR * 100) : null,
            description: product.description,
            images: product.images,
            details: product.details,
            fit: product.fit,
            modelInfo: product.modelInfo,
            category: product.category,
            isNew: product.isNew || false,
            isSale: product.isSale || false,
        }).onConflictDoUpdate({
            target: products.id,
            set: {
                priceUSD: Math.round(product.priceUSD * 100),
                priceINR: Math.round(product.priceINR * 100),
                compareAtPriceUSD: product.compareAtPriceUSD ? Math.round(product.compareAtPriceUSD * 100) : null,
                compareAtPriceINR: product.compareAtPriceINR ? Math.round(product.compareAtPriceINR * 100) : null,
            }
        });
    }

    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});

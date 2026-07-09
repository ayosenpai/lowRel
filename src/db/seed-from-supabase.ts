import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { products as productsTable } from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const connectionString = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseAnonKey || !connectionString) {
  throw new Error('Supabase URL, anon key, or database connection string is not defined in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const client = postgres(connectionString, { prepare: false });
const dbClient = drizzle(client);

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function getProductPaths(bucketName: string, currentPath: string = ''): Promise<string[]> {
  const { data: items, error } = await supabase.storage.from(bucketName).list(currentPath, { limit: 100 });

  if (error) {
    console.error(`Error listing files in "${currentPath}":`, error);
    return [];
  }

  const productFolders: string[] = [];
  let hasImages = false;
  const subFolders: string[] = [];

  for (const item of items) {
    if (item.id === null) { // folder
      const subPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      subFolders.push(subPath);
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(item.name)) {
      hasImages = true;
    }
  }

  if (hasImages && currentPath) {
    productFolders.push(currentPath);
  } else {
    for (const subFolder of subFolders) {
      productFolders.push(...await getProductPaths(bucketName, subFolder));
    }
  }

  return productFolders;
}


async function seedProducts() {
  console.log('Starting to seed products from Supabase storage with recursive search...');

  const bucketName = 'LR_img';

  const productPaths = await getProductPaths(bucketName);

  console.log(`Found ${productPaths.length} product paths:`, productPaths.join(', '));

  if (productPaths.length === 0) {
    console.log('No product folders found in the bucket. Exiting.');
    return;
  }

  const allNewProducts = [];

  for (const productPath of productPaths) {
    const pathParts = productPath.split('/').filter(p => p);
    const topLevelFolder = pathParts[0]; // e.g. "T-shirts" or "Braclets"
    const productNameFromPath = pathParts[pathParts.length - 1]; // e.g. "lowrel Fe"

    // Determine category from top-level folder name
    let category: string;
    if (topLevelFolder === 'T-shirts') {
      category = 'Tops';
    } else if (topLevelFolder === 'Braclets') {
      category = 'Accessories';
    } else if (topLevelFolder.toLowerCase().includes('bottom') || topLevelFolder.toLowerCase().includes('jean') || topLevelFolder.toLowerCase().includes('pant')) {
      category = 'Bottoms';
    } else if (topLevelFolder.toLowerCase().includes('jacket') || topLevelFolder.toLowerCase().includes('outer')) {
      category = 'Outerwear';
    } else {
      category = 'Tops'; // safe default
    }

    // Clean up product name
    const productName = productNameFromPath
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const { data: imageFiles, error: imageError } = await supabase
      .storage
      .from(bucketName)
      .list(productPath, {
        limit: 10,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (imageError) {
      console.error(`Error listing images for ${productPath}:`, imageError);
      continue;
    }

    const imageUrls = imageFiles?.filter(file => file.id !== null).map(file => {
      // Store the relative path instead of the full public URL
      return `${productPath}/${file.name}`;
    }) || [];

    if (imageUrls.length === 0) {
      console.warn(`Skipping folder ${productPath} as it contains no images.`);
      continue;
    }

    const newProduct = {
      id: slugify(productName),
      handle: slugify(productName),
      name: productName,
      priceUSD: Math.floor(Math.random() * (120 - 30 + 1) + 30) * 100, // Random price between $30 and $120
      priceINR: Math.floor(Math.random() * (10000 - 2500 + 1) + 2500) * 100, // Random price between ₹2500 and ₹10000
      description: `Discover the ${productName}. A high-quality piece designed for the modern wardrobe.`,
      images: imageUrls,
      details: ['100% Premium Cotton', 'Designed in-house', 'Limited edition'],
      fit: 'Regular' as "Fitted" | "Oversized" | "Baggy" | "Regular",
      modelInfo: `Model is 6'0" and wears size M`,
      category: category,
      isNew: true,
    };

    allNewProducts.push(newProduct);
  }

  if (allNewProducts.length > 0) {
    console.log(`Preparing to insert ${allNewProducts.length} new products...`);

    // 3. Clear existing products and insert new ones
    try {
      console.log('Deleting existing products...');
      await dbClient.delete(productsTable);

      console.log('Inserting new products...');
      await dbClient.insert(productsTable).values(allNewProducts).onConflictDoNothing();

      console.log('✅ Successfully seeded products!');
    } catch (dbError) {
      console.error('Error seeding database:', dbError);
    }
  }

  await client.end();
}

seedProducts().catch(console.error);

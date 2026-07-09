import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Get all image paths from local public/products directory
function getLocalProductPaths(): string[] {
  const productsDir = path.join(process.cwd(), 'public', 'products');
  const paths: string[] = [];

  function scanDirectory(dir: string, basePath: string = '') {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Check if this is a product folder (contains images)
        const subItems = fs.readdirSync(fullPath);
        const hasImages = subItems.some(subItem =>
          /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(subItem)
        );

        if (hasImages) {
          const relativePath = path.join(basePath, item).replace(/\\/g, '/');
          paths.push(relativePath);
        } else {
          scanDirectory(fullPath, path.join(basePath, item));
        }
      }
    }
  }

  scanDirectory(productsDir);
  return paths;
}

// Get all images for a specific product folder
function getProductImages(productPath: string): string[] {
  const fullPath = path.join(process.cwd(), 'public', 'products', productPath);
  const images: string[] = [];

  if (!fs.existsSync(fullPath)) return images;

  const items = fs.readdirSync(fullPath);

  for (const item of items) {
    if (/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(item)) {
      images.push(`/products/${productPath}/${item}`.replace(/\\/g, '/'));
    }
  }

  // Sort images to ensure consistent order
  images.sort();
  return images;
}

async function seedLocalImages() {
  console.log('Starting to seed products with local image paths...');
  
  // Get all product folders from local directory
  const productPaths = getLocalProductPaths();
  console.log(`Found ${productPaths.length} product paths:`, productPaths);
  
  // Delete existing products
  console.log('Deleting existing products...');
  await db.delete(products);
  
  // Insert new products with local image paths
  console.log('Inserting new products with local images...');
  
  for (const productPath of productPaths) {
    const images = getProductImages(productPath);
    
    if (images.length === 0) {
      console.log(`Skipping ${productPath} - no images found`);
      continue;
    }
    
    // Skip format-variant folders that aren't individual products
    if (productPath.includes('Bracelets_more_formats')) {
      continue;
    }
    
    // Determine category based on folder structure
    let category = 'Tops';
    if (productPath.includes('Braclet') || productPath.includes('Bracelet')) {
      category = 'Accessories';
    } else if (productPath.includes('T-shirt') || productPath.includes('Tshirt')) {
      category = 'Tops';
    }
    
    // Generate product name from parent + folder for clearer titles/handles
    const pathParts = productPath.split('/');
    const folderName = pathParts[pathParts.length - 1] || productPath;
    const parentName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
    const name = parentName
      ? `${parentName} ${folderName}`.replace(/-/g, ' ').replace(/_/g, ' ')
      : folderName.replace(/-/g, ' ').replace(/_/g, ' ');
    const handle = slugify(name);
    
    // Random price
    const priceINR = Math.floor(Math.random() * 5000) + 1000;
    const priceUSD = Math.floor(priceINR / 80);

    const compareAtPriceINR = Math.random() > 0.5 ? Math.floor(priceINR * 1.2) * 100 : null;
    const compareAtPriceUSD = Math.random() > 0.5 ? Math.floor(priceUSD * 1.2) * 100 : null;

    await db.insert(products).values({
      id: randomUUID(),
      name,
      handle,
      category,
      images,
      description: `Premium ${category.toLowerCase()} - ${name}`,
      details: ['High quality material', 'Comfortable fit', 'Durable design'],
      fit: 'Regular fit',
      modelInfo: 'Model is 6\'0" wearing size M',
      priceINR: priceINR * 100,
      priceUSD: priceUSD * 100,
      isNew: Math.random() > 0.5,
      isSale: Math.random() > 0.7,
      compareAtPriceINR,
      compareAtPriceUSD,
    });
    
    console.log(`✅ Inserted: ${name} (${images.length} images)`);
  }
  
  console.log('✅ Successfully seeded products with local images!');
}

seedLocalImages().catch(console.error);


import Image from "next/image";
import { Heart, ChevronRight, Minus, Plus, Share2 } from "lucide-react";
import { headers } from 'next/headers';
import { db } from "@/db";
import { products as productTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import ProductSchema from "@/components/seo/product-schema";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import { getReviewStats } from "@/lib/actions/reviews";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;

  const productData = await db.select().from(productTable).where(eq(productTable.handle, handle)).limit(1);
  const product = productData[0];

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const headerList = await headers();
  const region = headerList.get('x-region') || 'GLOBAL';
  const isIndia = region === 'IN';

  const price = isIndia ? product.priceINR / 100 : product.priceUSD / 100;
  const symbol = isIndia ? '₹' : '$';
  const currency = isIndia ? 'INR' : 'USD';

  const title = `${product.name} | Low Religion — Minimalist Streetwear`;
  const description = `${product.description || `Premium ${product.category} in ${product.name}`}. ${symbol}${price.toFixed(2)}. Available in multiple sizes. Free shipping on orders over ${symbol}${isIndia ? '5,000' : '100'}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://lowreligion.com/products/${handle}`,
      images: product.images ? [
        {
          url: product.images[0],
          width: 1200,
          height: 1600,
          alt: product.name,
        }
      ] : [],
      siteName: 'Low Religion',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  // Fetch product directly from DB for the most up-to-date info
  const productData = await db.select().from(productTable).where(eq(productTable.handle, handle)).limit(1);
  const rawProduct = productData[0];

  if (!rawProduct) {
    notFound();
  }

  // Handle localization using headers (set by middleware)
  const headerList = await headers();
  const region = headerList.get('x-region') || 'GLOBAL';
  const isIndia = region === 'IN';

  const product = {
    ...rawProduct,
    price: isIndia ? rawProduct.priceINR / 100 : rawProduct.priceUSD / 100,
    compareAtPrice: isIndia
      ? (rawProduct.compareAtPriceINR ? rawProduct.compareAtPriceINR / 100 : undefined)
      : (rawProduct.compareAtPriceUSD ? rawProduct.compareAtPriceUSD / 100 : undefined),
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$'
  };

  // Fetch related products from same category
  const relatedProductsData = await db
    .select()
    .from(productTable)
    .where(eq(productTable.category, rawProduct.category || ''))
    .limit(5);

  const relatedProducts = relatedProductsData.map(p => ({
    ...p,
    price: isIndia ? p.priceINR / 100 : p.priceUSD / 100,
    symbol: isIndia ? '₹' : '$',
  }));

  const reviewStats = await getReviewStats(rawProduct.id);

  return (
    <main className="min-h-screen bg-white text-black pt-[94px]">
      <ProductSchema product={{ ...product, reviewStats }} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: product.category || 'Shop', item: `/collections/${product.category?.toLowerCase().replace(/\s+/g, '-')}` },
          { name: product.name, item: `/products/${product.handle}` }
        ]}
      />
      <Header variant="solid" />

      <div className="max-w-[1440px] mx-auto py-2.5">
        <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
      </div>

      <Footer />
    </main>
  );
}

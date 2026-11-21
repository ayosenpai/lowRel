
import Image from "next/image";
import { Heart, ChevronRight, Minus, Plus, Share2 } from "lucide-react";
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
import { isComingSoon } from "@/lib/store-config";
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

  const price = product.priceINR / 100;
  const symbol = '₹';
  const currency = 'INR';

  const title = `${product.name} | Low Religion — Minimalist Streetwear`;
  const description = isComingSoon(product)
    ? `${product.description || `Premium ${product.category} in ${product.name}`}. Dropping soon at Low Religion.`
    : `${product.description || `Premium ${product.category} in ${product.name}`}. ${symbol}${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Available in multiple sizes. Free shipping across India.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://lowreligion.com/products/${handle}`,
    },
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

  const product = {
    ...rawProduct,
    price: rawProduct.priceINR / 100,
    compareAtPrice: rawProduct.compareAtPriceINR ? rawProduct.compareAtPriceINR / 100 : undefined,
    currency: 'INR',
    symbol: '₹'
  };

  // Fetch related products from same category
  const relatedProductsData = await db
    .select()
    .from(productTable)
    .where(eq(productTable.category, rawProduct.category || ''))
    .limit(12);

  const relatedProducts = relatedProductsData
    .map(p => ({
      ...p,
      price: p.priceINR / 100,
      symbol: '₹',
    }))
    .filter(
      (p) =>
        p.id !== rawProduct.id &&
        !isComingSoon(p) &&
        (p.price ?? 0) > 0
    )
    .slice(0, 4);

  const reviewStats = await getReviewStats(rawProduct.id);

  return (
    <main className="min-h-screen bg-white text-black pt-[94px]">
      <ProductSchema product={{ ...product, reviewStats }} comingSoon={isComingSoon(product)} />
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

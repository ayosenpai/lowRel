
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

  return (
    <main className="min-h-screen bg-white text-black pt-[94px]">
      <Header variant="solid" />

      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-10">
        <ProductDetailsClient product={product} />
      </div>

      <Footer />
    </main>
  );
}

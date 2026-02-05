import Header from "@/components/sections/header";
import HeroSale from "@/components/sections/hero-sale";
import CategoryGrid from "@/components/sections/category-grid";
import ProductShowcase from "@/components/sections/product-showcase";
import MovingCarousel from "@/components/sections/new-arrivals-banner";
import Footer from "@/components/sections/footer";
import { getProducts } from "@/lib/actions/products";

export default async function Home() {
  const { products } = await getProducts({ limit: 9 });

  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <Header />

      {/* Adding padding top to account for the fixed header height (30px announcement + 64px nav) */}
      <div className="pt-[94px]">
        <HeroSale />
        <CategoryGrid />
        <ProductShowcase products={products} />
        <MovingCarousel products={products} />
      </div>

      <Footer />
    </main>
  );
}

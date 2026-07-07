import Header from "@/components/sections/header";
import HeroSale from "@/components/sections/hero-sale";
import CategoryGrid from "@/components/sections/category-grid";
import BraceletCarousel from "@/components/sections/bracelet-carousel";
import ProductShowcase from "@/components/sections/product-showcase";
import MovingCarousel from "@/components/sections/new-arrivals-banner";
import Footer from "@/components/sections/footer";
import { getProducts } from "@/lib/actions/products";

export default async function Home() {
  const [{ products }, { products: braceletProducts }] = await Promise.all([
    getProducts({ limit: 9, category: 'Tops' }),
    getProducts({ limit: 20, category: 'Accessories' }),
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header variant="transparent" />

      {/* Hero starts from top since header is transparent and overlays */}
      <div>
        <HeroSale />
        <CategoryGrid />
        <BraceletCarousel products={braceletProducts} />
        <ProductShowcase products={products} />
        <MovingCarousel products={products} />
      </div>

      <Footer />
    </main>
  );
}

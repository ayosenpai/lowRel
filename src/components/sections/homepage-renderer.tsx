import HeroSale from './hero-sale';
import CategoryGridClient from './category-grid-client';
import BraceletCarousel from './bracelet-carousel';
import ProductShowcase from './product-showcase';
import NewArrivalsBanner from './new-arrivals-banner';
import BlogTitlesSection from './blog-titles-section';
import { getProducts } from '@/lib/actions/products';
import { isComingSoon } from '@/lib/store-config';
import type { HomepageSection, HomepageSectionConfig } from '@/lib/homepage-sections';
import type { Product } from '@/lib/types';

const PRODUCT_SECTION_TYPES = new Set(['product-grid', 'product-carousel', 'product-strip']);

async function fetchSectionProducts(config: HomepageSectionConfig): Promise<Product[]> {
  const limit = Math.min(Math.max(Number(config.limit) || 9, 1), 48);

  if (config.source === 'manual') {
    const ids = (config.productIds ?? []).slice(0, limit);
    if (ids.length === 0) return [];

    const { products } = await getProducts({ ids, limit: ids.length });
    const byId = new Map(products.map((product) => [product.id, product]));

    // Manual sections respect the order picked in the admin, not DB order.
    return ids
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product));
  }

  const { products } = await getProducts({
    category: config.source === 'category' ? config.category : undefined,
    isNew: config.source === 'new' ? true : undefined,
    isSale: config.source === 'sale' ? true : undefined,
    limit,
    sort: 'newest',
  });

  return products;
}

interface PreparedSection {
  section: HomepageSection;
  products?: Product[];
  categoryData?: {
    title: string;
    href: string;
    image: string;
  }[];
}

/**
 * Renders the published homepage layout. Every section is a known type, so an
 * admin can reorder/configure the page without being able to inject markup.
 */
export default async function HomepageRenderer({ sections }: { sections: HomepageSection[] }) {
  const visibleSections = sections.filter((section) => section.isVisible);

  const prepared = await Promise.all<PreparedSection>(
    visibleSections.map(async (section) => {
      if (section.type === 'category-grid') {
        const items = section.config.items ?? [];
        if (items.length === 0) {
          return { section, categoryData: [] };
        }

        const { products } = await getProducts({
          category: section.config.poolCategory || 'Tops',
          limit: Math.max(items.length * 3, items.length),
        });
        const imageProducts = products.filter((p) => p.images?.[0]);

        const categoryData = items.map((item, index) => ({
          title: item.title,
          href: item.href,
          image:
            item.image ||
            imageProducts[index]?.images?.[0] ||
            imageProducts[0]?.images?.[0] ||
            '',
        }));

        return { section, categoryData };
      }

      if (PRODUCT_SECTION_TYPES.has(section.type)) {
        const products = (await fetchSectionProducts(section.config)).filter(
          (product) => !isComingSoon(product) && (product.price ?? 0) > 0
        );
        return { section, products };
      }

      return { section };
    })
  );

  return (
    <>
      {prepared.map(({ section, products = [], categoryData = [] }) => {
        switch (section.type) {
          case 'hero':
            return (
              <HeroSale
                key={section.id}
                mediaType={section.config.mediaType}
                videoUrl={section.config.videoUrl}
                videoWebmUrl={section.config.videoWebmUrl}
                imageUrl={section.config.imageUrl}
                height={section.config.height}
                headline={section.config.headline}
                subheadline={section.config.subheadline}
                ctaLabel={section.config.ctaLabel}
                ctaHref={section.config.ctaHref}
              />
            );

          case 'category-grid':
            if (categoryData.length === 0) return null;
            return (
              <CategoryGridClient
                key={section.id}
                categoryData={categoryData}
                columns={section.config.columns}
              />
            );

          case 'product-grid':
            if (products.length === 0) return null;
            return (
              <ProductShowcase
                key={section.id}
                products={products}
                title={section.title}
                ctaLabel={section.config.ctaLabel}
                ctaHref={section.config.ctaHref}
                columns={section.config.columns}
              />
            );

          case 'product-carousel':
            return (
              <div key={section.id}>
                {products.length > 0 ? (
                  <BraceletCarousel
                    products={products}
                    title={section.title}
                    ctaLabel={section.config.ctaLabel}
                    ctaHref={section.config.ctaHref}
                    itemsPerView={section.config.itemsPerView}
                  />
                ) : null}
                <BlogTitlesSection />
              </div>
            );

          case 'product-strip':
            if (products.length === 0) return null;
            return (
              <NewArrivalsBanner
                key={section.id}
                products={products}
                title={section.title}
                ctaLabel={section.config.ctaLabel}
                ctaHref={section.config.ctaHref}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}

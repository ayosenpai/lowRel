import { getAdminProducts } from '@/lib/actions/admin';
import { getHomepageSections } from '@/lib/actions/homepage';
import HomepageEditor from './HomepageEditor';

export default async function AdminHomepagePage() {
    const [sections, products] = await Promise.all([
        getHomepageSections(),
        getAdminProducts(),
    ]);

    const categories = [
        ...new Set(
            products
                .map((product) => product.category)
                .filter((category): category is string => Boolean(category))
        ),
    ].sort();

    const productOptions = products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.images?.[0] ?? null,
    }));

    return (
        <HomepageEditor
            initialSections={sections}
            products={productOptions}
            categories={categories}
        />
    );
}

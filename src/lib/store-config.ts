/**
 * Storefront merchandising controls.
 *
 * Only categories listed in NEXT_PUBLIC_SELLABLE_CATEGORIES are purchasable.
 * Every other category is shown as "coming soon": blurred media, no price and
 * blocked at checkout (server-side).
 *
 * Accessories are the only live category right now, so clothing is deliberately
 * held back until the drop.
 */
const configuredCategories = process.env.NEXT_PUBLIC_SELLABLE_CATEGORIES ?? 'Accessories';

export const SELLABLE_CATEGORIES = configuredCategories
    .split(',')
    .map((category) => category.trim().toLowerCase())
    .filter(Boolean);

export const COMING_SOON_LABEL =
    process.env.NEXT_PUBLIC_COMING_SOON_LABEL || 'DROPPING SOON';

export const COMING_SOON_PRICE_LABEL =
    process.env.NEXT_PUBLIC_COMING_SOON_PRICE_LABEL || 'Price revealed at drop';

/**
 * True when a product belongs to a category that is not yet on sale.
 * Unknown/blank categories fail closed (they are treated as coming soon).
 */
export function isComingSoon(product?: { category?: string | null } | null): boolean {
    if (!product) return false;

    const category = (product.category ?? '').trim().toLowerCase();
    if (!category) return true;

    return !SELLABLE_CATEGORIES.includes(category);
}

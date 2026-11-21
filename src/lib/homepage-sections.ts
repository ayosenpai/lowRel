/**
 * Homepage layout model, shared by the admin editor and the storefront renderer.
 *
 * The homepage is an ordered list of sections. Each section has a small,
 * whitelisted config object. Nothing here is executable: the renderer only
 * understands the section types declared below.
 */

export type HomepageSectionType =
    | 'hero'
    | 'category-grid'
    | 'product-grid'
    | 'product-carousel'
    | 'product-strip';

export type ProductSource = 'category' | 'all' | 'new' | 'sale' | 'manual';

export interface CategoryTile {
    title: string;
    href: string;
    image?: string;
}

export interface HomepageSectionConfig {
    // hero
    mediaType?: 'video' | 'image';
    imageUrl?: string;
    videoUrl?: string;
    videoWebmUrl?: string;
    height?: 'screen' | 'large' | 'medium';
    headline?: string;
    subheadline?: string;

    // shared CTA
    ctaLabel?: string;
    ctaHref?: string;

    // category grid
    columns?: number;
    poolCategory?: string;
    items?: CategoryTile[];

    // product sections
    source?: ProductSource;
    category?: string;
    productIds?: string[];
    limit?: number;
    itemsPerView?: number;
}

export interface HomepageSection {
    id: string;
    type: HomepageSectionType;
    title: string;
    isVisible: boolean;
    config: HomepageSectionConfig;
}

/** A named, reusable layout slot shown in the admin editor. */
export interface HomepageLayoutSummary {
    id: string;
    name: string;
    sectionCount: number;
    updatedAt: string;
}

/** A saved layout slot including its full ordered sections. */
export interface HomepageLayoutRecord extends HomepageLayoutSummary {
    sections: HomepageSection[];
}

export const HOMEPAGE_SECTION_TYPES: HomepageSectionType[] = [
    'hero',
    'category-grid',
    'product-grid',
    'product-carousel',
    'product-strip',
];

export const SECTION_DEFINITIONS: Record<
    HomepageSectionType,
    { label: string; description: string; defaultTitle: string; defaultConfig: HomepageSectionConfig }
> = {
    hero: {
        label: 'Hero',
        description: 'Full-width video or image with optional headline and button.',
        defaultTitle: 'Hero',
        defaultConfig: {
            mediaType: 'image',
            videoUrl: '/hero/hero.mp4',
            videoWebmUrl: '/hero/hero.webm',
            imageUrl: '/products/IMG_7658.webp',
            height: 'screen',
            headline: '',
            subheadline: '',
            ctaLabel: '',
            ctaHref: '',
        },
    },
    'category-grid': {
        label: 'Category Grid',
        description: 'Large image tiles linking to collections or any page.',
        defaultTitle: 'Shop by category',
        defaultConfig: {
            columns: 2,
            poolCategory: 'Tops',
            items: [
                { title: 'Latest arrivals', href: '/collections/new-in' },
                { title: 'Tops/Upperwear', href: '/collections/tops' },
                { title: 'Accessory Arrival', href: '/collections/accessories' },
                { title: 'Shop All', href: '/collections/all' },
            ],
        },
    },
    'product-grid': {
        label: 'Product Grid',
        description: 'A responsive grid of products with a fixed column count.',
        defaultTitle: '',
        defaultConfig: {
            source: 'category',
            category: 'Tops',
            productIds: [],
            limit: 9,
            columns: 3,
            ctaLabel: '',
            ctaHref: '',
        },
    },
    'product-carousel': {
        label: 'Product Carousel',
        description: 'A horizontal, swipeable row of products.',
        defaultTitle: '',
        defaultConfig: {
            source: 'category',
            category: 'Accessories',
            productIds: [],
            limit: 20,
            itemsPerView: 4,
            ctaLabel: '',
            ctaHref: '',
        },
    },
    'product-strip': {
        label: 'Shop the Archive Strip',
        description: 'A centered, looping strip with product name and price.',
        defaultTitle: 'Shop the Archive',
        defaultConfig: {
            source: 'category',
            category: 'Tops',
            productIds: [],
            limit: 9,
            ctaLabel: '',
            ctaHref: '',
        },
    },
};

const DEFAULT_SECTION_BLUEPRINT: { type: HomepageSectionType; title?: string }[] = [
    { type: 'hero' },
    { type: 'category-grid' },
    { type: 'product-carousel' },
    { type: 'product-grid' },
    { type: 'product-strip' },
];

/** The layout the storefront uses until an admin publishes something else. */
export function defaultHomepageSections(): HomepageSection[] {
    return DEFAULT_SECTION_BLUEPRINT.map((blueprint, index) => {
        const definition = SECTION_DEFINITIONS[blueprint.type];
        return {
            id: `default-${index}-${blueprint.type}`,
            type: blueprint.type,
            title: blueprint.title ?? definition.defaultTitle,
            isVisible: true,
            config: cloneConfig(definition.defaultConfig),
        };
    });
}

export function createHomepageSection(type: HomepageSectionType): HomepageSection {
    const definition = SECTION_DEFINITIONS[type];
    return {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        title: definition.defaultTitle,
        isVisible: true,
        config: cloneConfig(definition.defaultConfig),
    };
}

function cloneConfig(config: HomepageSectionConfig): HomepageSectionConfig {
    return JSON.parse(JSON.stringify(config)) as HomepageSectionConfig;
}

const text = (value: unknown, max = 600): string =>
    typeof value === 'string' ? value.trim().slice(0, max) : '';

const integer = (value: unknown, min: number, max: number, fallback: number): number => {
    const parsed = Math.floor(Number(value));
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;

const stringArray = (value: unknown, max = 48): string[] =>
    Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0).slice(0, max)
        : [];

function normalizeItems(value: unknown): CategoryTile[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => ({
            title: text(item?.title, 80),
            href: text(item?.href, 600),
            image: text(item?.image, 1000),
        }))
        .filter((item) => item.title.length > 0 && item.href.length > 0)
        .slice(0, 12);
}

export function isHomepageSectionType(value: unknown): value is HomepageSectionType {
    return HOMEPAGE_SECTION_TYPES.includes(value as HomepageSectionType);
}

export function normalizeHomepageSection(input: unknown, index: number): HomepageSection | null {
    if (!input || typeof input !== 'object') return null;
    const raw = input as Record<string, unknown>;
    if (!isHomepageSectionType(raw.type)) return null;

    const type = raw.type;
    const config = (raw.config && typeof raw.config === 'object' ? raw.config : {}) as Record<string, unknown>;
    const base: HomepageSectionConfig = {
        ctaLabel: text(config.ctaLabel, 60),
        ctaHref: text(config.ctaHref, 600),
    };

    if (type === 'hero') {
        const mediaType = oneOf(config.mediaType, ['video', 'image'] as const, 'video');
        const normalized: HomepageSectionConfig = {
            ...base,
            mediaType,
            imageUrl: text(config.imageUrl, 1000),
            videoUrl: text(config.videoUrl, 1000) || '/hero/hero.mp4',
            videoWebmUrl: text(config.videoWebmUrl, 1000),
            height: oneOf(config.height, ['screen', 'large', 'medium'] as const, 'screen'),
            headline: text(config.headline, 120),
            subheadline: text(config.subheadline, 240),
        };
        return {
            id: typeof raw.id === 'string' && raw.id ? raw.id : `section-${index}-hero`,
            type,
            title: text(raw.title, 80) || SECTION_DEFINITIONS[type].defaultTitle,
            isVisible: raw.isVisible !== false,
            config: normalized,
        };
    }

    if (type === 'category-grid') {
        const normalized: HomepageSectionConfig = {
            ...base,
            columns: integer(config.columns, 2, 4, 2),
            poolCategory: text(config.poolCategory, 80) || 'Tops',
            items: normalizeItems(config.items),
        };
        return {
            id: typeof raw.id === 'string' && raw.id ? raw.id : `section-${index}-category-grid`,
            type,
            title: text(raw.title, 80) || SECTION_DEFINITIONS[type].defaultTitle,
            isVisible: raw.isVisible !== false,
            config: normalized,
        };
    }

    const source = oneOf(config.source, ['category', 'all', 'new', 'sale', 'manual'] as const, 'category');
    const normalized: HomepageSectionConfig = {
        ...base,
        source,
        category: text(config.category, 80),
        productIds: stringArray(config.productIds),
        limit: integer(config.limit, 1, 48, type === 'product-carousel' ? 20 : 9),
    };

    if (type === 'product-grid') {
        normalized.columns = integer(config.columns, 2, 5, 3);
    }
    if (type === 'product-carousel') {
        normalized.itemsPerView = integer(config.itemsPerView, 2, 5, 4);
    }

    return {
        id: typeof raw.id === 'string' && raw.id ? raw.id : `section-${index}-${type}`,
        type,
        title: text(raw.title, 80),
        isVisible: raw.isVisible !== false,
        config: normalized,
    };
}

/** Sanitizes untrusted input (server action, JSON) into a valid layout. */
export function normalizeHomepageSections(input: unknown): HomepageSection[] {
    let value = input;
    if (typeof value === 'string') {
        try {
            value = JSON.parse(value);
        } catch {
            return defaultHomepageSections();
        }
    }
    if (!Array.isArray(value)) return defaultHomepageSections();

    return value
        .map((section, index) => normalizeHomepageSection(section, index))
        .filter((section): section is HomepageSection => section !== null)
        .slice(0, 30);
}

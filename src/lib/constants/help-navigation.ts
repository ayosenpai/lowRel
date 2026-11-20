export type HelpArticle = {
    id: string;
    title: string;
    path: string;
    description: string;
    updated: string;
    readingTime: string;
};

export type HelpCategory = {
    id: string;
    title: string;
    description: string;
    items: HelpArticle[];
};

export const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: 'about',
        title: 'About',
        description: 'Who is behind Low Religion and how the project is being built.',
        items: [
            {
                id: 'about',
                title: 'About Us',
                path: '/help/about',
                description: 'The person, the project and how Low Religion started.',
                updated: 'November 2026',
                readingTime: '3 min read',
            },
            {
                id: 'brand-responsibility',
                title: 'Brand Responsibility',
                path: '/help/brand-responsibility',
                description: 'Materials, pace and the honest process behind each piece.',
                updated: 'November 2026',
                readingTime: '3 min read',
            },
        ],
    },
    {
        id: 'support',
        title: 'Support',
        description: 'Answers to common questions and a direct line to us.',
        items: [
            {
                id: 'faqs',
                title: 'Frequently Asked Questions',
                path: '/help/faqs',
                description: 'Payments, delivery, returns and sizing, answered quickly.',
                updated: 'November 2026',
                readingTime: '2 min read',
            },
            {
                id: 'contact',
                title: 'Contact Support',
                path: '/help/contact',
                description: 'Get in touch about an order, a return or anything else.',
                updated: 'November 2026',
                readingTime: '1 min read',
            },
            {
                id: 'size-guide',
                title: 'Size Guide',
                path: '/help/size-guide',
                description: 'Measurements and fit notes for tees, hoodies and more.',
                updated: 'November 2026',
                readingTime: '2 min read',
            },
        ],
    },
    {
        id: 'logistics',
        title: 'Shipping & Returns',
        description: 'How orders get to you, and what to do if something is not right.',
        items: [
            {
                id: 'shipping',
                title: 'Shipping',
                path: '/help/shipping',
                description: 'Where we ship, how long it takes and what it costs.',
                updated: 'November 2026',
                readingTime: '2 min read',
            },
            {
                id: 'returns',
                title: 'Returns & Exchanges',
                path: '/help/returns',
                description: 'The return window, condition rules and how to start one.',
                updated: 'November 2026',
                readingTime: '2 min read',
            },
        ],
    },
    {
        id: 'legal',
        title: 'Legal',
        description: 'The policies that apply when you browse and buy from us.',
        items: [
            {
                id: 'privacy',
                title: 'Privacy Policy',
                path: '/help/privacy',
                description: 'What we collect, why we collect it and how to reach us.',
                updated: 'November 2026',
                readingTime: '3 min read',
            },
            {
                id: 'terms',
                title: 'Terms of Use',
                path: '/help/terms',
                description: 'The rules for using this site and buying from us.',
                updated: 'November 2026',
                readingTime: '3 min read',
            },
        ],
    },
];

export const HELP_ARTICLES = HELP_CATEGORIES.flatMap((category) =>
    category.items.map((article) => ({
        ...article,
        categoryId: category.id,
        category: category.title,
    }))
);

export type HelpArticleWithCategory = (typeof HELP_ARTICLES)[number];

export function getHelpArticle(path: string) {
    return HELP_ARTICLES.find((article) => article.path === path);
}

export function getRelatedArticles(path: string, limit = 3) {
    const current = getHelpArticle(path);
    if (!current) return HELP_ARTICLES.slice(0, limit);

    const sameCategory = HELP_ARTICLES.filter(
        (article) => article.path !== path && article.categoryId === current.categoryId
    );
    const others = HELP_ARTICLES.filter(
        (article) => article.path !== path && article.categoryId !== current.categoryId
    );

    return [...sameCategory, ...others].slice(0, limit);
}

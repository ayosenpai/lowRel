export const HELP_CATEGORIES = [
    {
        id: 'support',
        title: 'Support',
        items: [
            { id: 'faqs', title: 'Frequently Asked', path: '/help/faqs' },
            { id: 'contact', title: 'Contact Support', path: '/help/contact' },
            { id: 'size-guide', title: 'Size Guide', path: '/help/size-guide' },
        ]
    },
    {
        id: 'logistics',
        title: 'Logistics',
        items: [
            { id: 'shipping', title: 'Shipping Policy', path: '/help/shipping' },
            { id: 'returns', title: 'Returns & Exchanges', path: '/help/returns' },
        ]
    },
    {
        id: 'legal',
        title: 'Legal',
        items: [
            { id: 'privacy', title: 'Privacy Policy', path: '/help/privacy' },
            { id: 'terms', title: 'Terms of Use', path: '/help/terms' },
        ]
    }
];

export const HELP_ARTICLES = HELP_CATEGORIES.flatMap(cat => cat.items);

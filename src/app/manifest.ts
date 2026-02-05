import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Low Religion',
        short_name: 'LowRel',
        description: 'Low Religion Streetwear Store',
        start_url: '/',
        display: 'standalone',
        background_color: '#d8a4bc',
        theme_color: '#000000',
        icons: [
            {
                src: '/assets/alpha_logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/assets/main_logo_png.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Size Guide',
    description:
        'Garment measurements and fit notes for Low Religion tees, hoodies and more.',
};

export default function SizeGuideLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

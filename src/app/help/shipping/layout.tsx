import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Shipping',
    description:
        'Where Low Religion ships, how long delivery takes and how to track your order.',
};

export default function ShippingLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

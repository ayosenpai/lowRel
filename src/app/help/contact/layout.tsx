import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Contact Support',
    description:
        'Contact Low Religion about an order, a return or anything else.',
};

export default function ContactLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

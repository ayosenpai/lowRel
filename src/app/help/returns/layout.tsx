import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Returns & Exchanges',
    description:
        'The Low Religion return window, condition rules, exchanges and refund times.',
};

export default function ReturnsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

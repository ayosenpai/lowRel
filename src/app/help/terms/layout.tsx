import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Terms of Use',
    description:
        'The terms that apply when you browse Low Religion or place an order.',
};

export default function TermsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

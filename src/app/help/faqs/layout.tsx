import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'FAQs',
    description:
        'Short answers on payments, delivery, returns and sizing at Low Religion.',
};

export default function FaqsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

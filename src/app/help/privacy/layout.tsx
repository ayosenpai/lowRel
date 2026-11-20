import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description:
        'What Low Religion collects, why we collect it and how to access or delete your data.',
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

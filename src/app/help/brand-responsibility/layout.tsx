import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Brand Responsibility',
  description:
    'A note from the person behind Low Religion on materials, pace, honesty and building slowly.',
};

export default function BrandResponsibilityLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

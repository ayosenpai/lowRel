import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Low Religion is a growing personal project — clothes and accessories made mindfully, for people who like things a little different.',
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

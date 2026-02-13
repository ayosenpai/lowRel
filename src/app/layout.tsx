import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CheckoutProvider } from "@/lib/checkout-context";
import PageTracker from '@/components/analytics/PageTracker';
import { Suspense } from 'react';
import CartSidebar from "@/components/ui/cart-sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lowreligion.com'),
  title: {
    default: "Low Religion — Minimalist Streetwear & Contemporary Fashion",
    template: "%s | Low Religion"
  },
  description: "Discover premium minimalist streetwear and contemporary fashion. Shop curated collections of elevated basics, statement pieces, and timeless designs.",
  keywords: ["streetwear", "minimalist fashion", "contemporary clothing", "premium basics", "Low Religion"],
  authors: [{ name: "Low Religion" }],
  creator: "Low Religion",
  publisher: "Low Religion",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lowreligion.com',
    siteName: 'Low Religion',
    title: 'Low Religion — Minimalist Streetwear & Contemporary Fashion',
    description: 'Discover premium minimalist streetwear and contemporary fashion. Shop curated collections of elevated basics, statement pieces, and timeless designs.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Low Religion',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Low Religion — Minimalist Streetwear & Contemporary Fashion',
    description: 'Discover premium minimalist streetwear and contemporary fashion.',
    images: ['/og-image.jpg'],
    creator: '@lowreligion',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://slelguoygbfzlpylpxfs.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://slelguoygbfzlpylpxfs.supabase.co" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="antialiased">


        <CartProvider>
          <WishlistProvider>
            <CheckoutProvider>
              <a href="#main-content" className="skip-to-content">
                Skip to main content
              </a>
              <ErrorReporter />
              <div id="main-content">
                <Suspense fallback={null}>
                  <PageTracker />
                </Suspense>
                {children}
              </div>
              <CartSidebar />
              {/* <VisualEditsMessenger /> */}
              <Toaster />
            </CheckoutProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

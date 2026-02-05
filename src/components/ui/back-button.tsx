'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BackButtonProps {
  fallbackHref?: string;
  text?: string;
  className?: string;
}

export default function BackButton({ fallbackHref = '/', text = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [referrer, setReferrer] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Get the referrer from document.referrer (most reliable)
    const docReferrer = document.referrer;
    
    if (docReferrer && docReferrer !== window.location.href) {
      try {
        // Convert full URL to pathname
        const referrerUrl = new URL(docReferrer);
        const referrerPath = referrerUrl.pathname;
        
        // Only use referrer if it's from the same site
        if (referrerPath && referrerPath !== pathname) {
          setReferrer(referrerPath);
          return;
        }
      } catch (e) {
        // If URL parsing fails, continue to fallback
      }
    }
    
    // Fallback to sessionStorage
    const storedReferrer = sessionStorage.getItem('lastPage');
    
    if (storedReferrer && storedReferrer !== pathname) {
      setReferrer(storedReferrer);
    } else {
      // Smart fallback based on current page
      let smartFallback = '/';
      if (pathname.startsWith('/help/')) {
        smartFallback = '/help';
      } else if (pathname === '/help') {
        smartFallback = '/';
      } else if (pathname === '/cart') {
        smartFallback = '/collections/all';
      } else if (pathname === '/checkout') {
        smartFallback = '/cart';
      }
      setReferrer(smartFallback);
    }
  }, [pathname]);

  useEffect(() => {
    // Store current page as referrer for next page
    if (isClient) {
      sessionStorage.setItem('lastPage', pathname);
    }
  }, [pathname, isClient]);

  const handleClick = () => {
    if (referrer && referrer !== pathname) {
      window.location.href = referrer;
    } else if (fallbackHref) {
      window.location.href = fallbackHref;
    } else {
      router.back();
    }
  };

  // Dynamic text based on where we're going back to
  const getBackText = () => {
    if (!isClient) return text;
    
    if (referrer === '/' || referrer === '') return '← Back to Home';
    if (referrer === '/help') return '← Back to Help';
    if (referrer === '/collections/all') return '← Back to Shop';
    if (referrer === '/cart') return '← Back to Cart';
    if (referrer && referrer.startsWith('/products/')) return '← Back to Product';
    return text;
  };

  // Don't render during SSR/hydration
  if (!isClient) return null;

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-black hover:underline mb-4 transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {getBackText()}
    </button>
  );
}

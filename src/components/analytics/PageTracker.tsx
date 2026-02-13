'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics-client';

export default function PageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastTrackedUrl = useRef<string | null>(null);

    useEffect(() => {
        const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        // Prevent double tracking in the same mount
        if (url === lastTrackedUrl.current) return;

        // Check session storage to prevent tracking on router refreshes/reloads
        if (typeof window !== 'undefined') {
            const stored = window.sessionStorage.getItem('last_tracked_url');
            if (stored === url) {
                lastTrackedUrl.current = url;
                return;
            }
        }

        lastTrackedUrl.current = url;

        // Global Behavioral Tracking
        track({
            eventType: 'page_view',
            path: url
        });

        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('last_tracked_url', url);
        }
    }, [pathname, searchParams]);

    return null;
}

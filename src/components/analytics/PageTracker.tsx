'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/actions/analytics';

export default function PageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        trackEvent({
            eventType: 'page_view',
            path: url,
        });
    }, [pathname, searchParams]);

    return null;
}

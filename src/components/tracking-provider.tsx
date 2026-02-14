'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function TrackingProvider() {
    const pathname = usePathname();

    useEffect(() => {
        const trackVisitor = async () => {
            try {
                // Call the tracking API
                await fetch('/api/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: pathname }),
                });
            } catch (error) {
                console.error('Failed to track visitor:', error);
            }
        };

        trackVisitor();
    }, [pathname]);

    return null; // This component handles side effects only
}

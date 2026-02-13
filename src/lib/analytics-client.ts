
/**
 * Client-side utility for tracking analytics events.
 * Sends data to /api/analytics which handles server-side logging.
 */

export type EventType =
    | 'page_view'
    | 'add_to_cart'
    | 'begin_checkout'
    | 'purchase'
    | 'remove_from_cart'
    | 'search'
    | 'wishlist_add'
    | 'click_event';

interface TrackParams {
    eventType: EventType;
    path?: string;
    payload?: any;
}

export async function track(params: TrackParams) {
    if (typeof window === 'undefined') return;

    try {
        const body = {
            ...params,
            path: params.path || window.location.pathname + window.location.search,
            payload: {
                ...params.payload,
                referrer: document.referrer || null,
                screen: `${window.screen.width}x${window.screen.height}`,
                userAgent: navigator.userAgent,
                language: navigator.language,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
        };

        const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        return await response.json();
    } catch (error) {
        console.error('[Analytics] Failed to track event:', error);
        return { success: false };
    }
}

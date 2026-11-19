import { COMING_SOON_LABEL, COMING_SOON_PRICE_LABEL } from '@/lib/store-config';

export { COMING_SOON_LABEL, COMING_SOON_PRICE_LABEL };

/** Apply to product media that is not yet purchasable. */
export const COMING_SOON_IMAGE_CLASS = 'blur-[5px] scale-[1.04]';

export function ComingSoonBadge({ className = '' }: { className?: string }) {
    return (
        <span
            className={`inline-flex items-center bg-black text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1 whitespace-nowrap ${className}`}
        >
            {COMING_SOON_LABEL}
        </span>
    );
}

/** Centered pill over a blurred product image. */
export function ComingSoonOverlay() {
    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-2">
            <span className="bg-black/90 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.22em] px-3 py-1.5 text-center">
                {COMING_SOON_LABEL}
            </span>
        </div>
    );
}

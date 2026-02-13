"use client";


interface SkeletonLoaderProps {
    className?: string;
    variant?: 'product-image' | 'product-card' | 'text' | 'circle';
}

export default function SkeletonLoader({
    className = "",
    variant = 'product-image'
}: SkeletonLoaderProps) {
    const baseClasses = "relative overflow-hidden bg-gray-200";

    const variantClasses = {
        'product-image': 'aspect-[3/4] w-full',
        'product-card': 'h-full w-full',
        'text': 'h-4 w-full rounded',
        'circle': 'rounded-full',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            role="status"
            aria-label="Loading..."
        >
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .shimmer-bg {
                    animation: shimmer 1.5s infinite linear;
                }
            `}</style>
            {/* Shimmer effect */}
            <div
                className="shimmer-bg absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
            <span className="sr-only">Loading...</span>
        </div>
    );
}


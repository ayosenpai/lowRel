"use client";

import { ImageProps } from "next/image";
import supabaseLoader from "@/lib/supabase-image-loader";

// Client-side wrapper that uses regular img tag to bypass Next.js image optimization
// This avoids 400 errors with Supabase images in production
export default function SupabaseImage(props: Omit<ImageProps, "loader">) {
    const { src, alt, className, fill, style, sizes, priority, loading, ...rest } = props;

    // Get the proper URL from the loader
    const imageUrl = typeof src === 'string' ? supabaseLoader({ src, width: 800, quality: 75 }) : '';

    if (fill) {
        return (
            <img
                src={imageUrl}
                alt={alt || ''}
                className={className}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }}
                loading={loading || 'lazy'}
            />
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt || ''}
            className={className}
            style={style}
            loading={loading || 'lazy'}
            {...rest}
        />
    );
}

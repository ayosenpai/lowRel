"use client";

import { ImageProps } from "next/image";
import supabaseLoader from "@/lib/supabase-image-loader";

// Client-side wrapper that uses a regular img tag to bypass Next.js image optimization.
export default function SupabaseImage(props: Omit<ImageProps, "loader">) {
    const { src, alt, className, fill, style, priority, loading, onLoad, onError, ...rest } = props;

    const imageUrl = typeof src === 'string' ? supabaseLoader({ src, width: 800, quality: 75 }) : '';

    if (fill) {
        return (
            <img
                src={imageUrl}
                alt={alt || ''}
                className={className}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
                loading={priority ? 'eager' : (loading || 'lazy')}
                onLoad={onLoad}
                onError={onError}
                {...rest}
            />
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt || ''}
            className={className}
            style={style}
            loading={priority ? 'eager' : (loading || 'lazy')}
            onLoad={onLoad}
            onError={onError}
            {...rest}
        />
    );
}

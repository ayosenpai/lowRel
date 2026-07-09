// src/lib/supabase-image-loader.ts

// Type definition for the loader function parameters
interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

// Supabase project URL - hardcoded fallback in case env var is unavailable at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ojmqttdrbundpodfusoe.supabase.co';

/**
 * Encode local public paths so filenames/folders with spaces load reliably.
 */
function encodeLocalPath(path: string): string {
  return path
    .split('/')
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment)))
    .join('/');
}

/**
 * Custom image loader for Next.js.
 * Uses the plain public URL from Supabase Storage (no transformations needed).
 * Compatible with all Supabase plans - Free tier included.
 */
export default function supabaseLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src) return '';

  // Pass through local/static assets and external URLs from other domains untouched
  if (src.startsWith('/')) {
    return encodeLocalPath(src);
  }

  if (src.startsWith('data:')) {
    return src;
  }

  // If already a full absolute URL (e.g. stored as getPublicUrl output), return directly.
  // Next.js will still use this for srcset with different widths, but the URL is already valid.
  if (src.startsWith('http')) {
    return src;
  }

  // For relative paths (e.g. "Tee/image.jpg" or "BR04/image.jpg"), construct the full public URL.
  // Remove leading "LR_img/" prefix if accidentally included.
  const cleanPath = src.startsWith('LR_img/') ? src.slice('LR_img/'.length) : src;

  return `${supabaseUrl}/storage/v1/object/public/LR_img/${cleanPath}`;
}

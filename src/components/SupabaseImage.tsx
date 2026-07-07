"use client";

import Image, { ImageProps } from "next/image";
import supabaseLoader from "@/lib/supabase-image-loader";

// Client-side wrapper that applies supabaseLoader safely.
// Use this instead of plain <Image> for Supabase product bucket images
// in Server Components where passing loader as a prop would cause a hydration error.
export default function SupabaseImage(props: Omit<ImageProps, "loader">) {
    return <Image loader={supabaseLoader} unoptimized={true} {...props} />;
}

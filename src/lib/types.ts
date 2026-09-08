
export interface Product {
  id: string;
  handle: string;
  name: string;
  priceUSD: number;
  priceINR: number;
  compareAtPriceUSD?: number | null;
  compareAtPriceINR?: number | null;
  images: string[];
  description: string;
  details: string[];
  fit?: string;
  modelInfo?: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  categoryImage?: string; // Optional helper for categories (not in schema but handled in UI)
  price?: number;
  compareAtPrice?: number;
  currency?: string;
  symbol?: string;
}

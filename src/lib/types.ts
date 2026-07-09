
export interface Product {
  id: string;
  handle: string;
  name: string;
  priceUSD: number;
  priceINR: number;
  compareAtPriceUSD?: number;
  compareAtPriceINR?: number;
  images: string[];
  description: string;
  details: string[];
  fit: "Fitted" | "Oversized" | "Baggy" | "Regular";
  modelInfo: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  categoryImage?: string; // Optional helper for categories (not in schema but handled in UI)
  price?: number;
  currency?: string;
  symbol?: string;
}


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

export const products: Product[] = [
  {
    id: 'crux-claw-clip',
    handle: 'crux-claw-clip',
    name: 'Crux Claw Clip',
    priceUSD: 18.00,
    priceINR: 1500,
    images: [
      '/products/img (1).png'
    ],
    description: 'Keep your hair in place with style. The Crux Claw Clip features a unique design that adds an edgy touch to any look.',
    details: ['100% Acrylic', 'Strong grip', 'Matte finish'],
    fit: 'Regular',
    modelInfo: 'One Size',
    category: 'Accessories'
  },
  {
    id: 'ultimate-baby-tee',
    handle: 'ultimate-baby-tee',
    name: 'Ultimate Baby Tee',
    priceUSD: 32.00,
    priceINR: 2600,
    compareAtPriceUSD: 40.00,
    compareAtPriceINR: 3200,
    isSale: true,
    images: [
      '/products/img (2).png'
    ],
    description: 'The essential baby tee for your daily rotation. Cropped fit with soft cotton rib.',
    details: ['95% Cotton, 5% Elastane', 'Ribbed fabric', 'Cropped length'],
    fit: 'Fitted',
    modelInfo: 'Model is 5\'7 and wears size S',
    category: 'Tops',
    isNew: true
  },
  {
    id: 'echo-baggy-jeans',
    handle: 'echo-baggy-jeans',
    name: 'Echo Black Overdye Baggy Jeans',
    priceUSD: 85.00,
    priceINR: 7000,
    images: [
      '/products/img (3).png'
    ],
    description: 'Our signature baggy fit in a washed black overdye finish.',
    details: ['100% Cotton Denim', 'Five pocket styling', 'Washed finish'],
    fit: 'Baggy',
    modelInfo: 'Model is 5\'9 and wears size 26',
    category: 'Bottoms'
  },
  {
    id: 'harley-bomber',
    handle: 'harley-bomber',
    name: 'Harley Black Bomber Jacket',
    priceUSD: 110.00,
    priceINR: 9000,
    images: [
      '/products/img (4).png'
    ],
    description: 'Classic oversized bomber jacket with utility details.',
    details: ['100% Nylon', 'Quilted lining', 'Embroidered logo'],
    fit: 'Oversized',
    modelInfo: 'Model is 5\'8 and wears size M',
    category: 'Outerwear'
  },
  {
    id: 'hexa-sweatpants',
    handle: 'hexa-sweatpants',
    name: 'Hexa Black Wide Leg Sweatpants',
    priceUSD: 64.00,
    priceINR: 5200,
    images: [
      '/products/img (5).png'
    ],
    description: 'Ultra-comfortable wide leg sweatpants with distressed details.',
    details: ['100% Cotton Fleece', 'Elasticated waist', 'Side pockets'],
    fit: 'Baggy',
    modelInfo: 'Model is 5\'7 and wears size S',
    category: 'Bottoms'
  },
  {
    id: 'heaven-hoodie',
    handle: 'heaven-hoodie',
    name: 'Heaven Black Washed Zip Hoodie',
    priceUSD: 78.00,
    priceINR: 6500,
    images: [
      '/products/img (6).png'
    ],
    description: 'Washed black zip-up hoodie with graphic prints.',
    details: ['100% Cotton Fleece', 'YKK Zip', 'Washed look'],
    fit: 'Oversized',
    modelInfo: 'Model is 5\'10 and wears size L',
    category: 'Tops'
  },
  {
    id: 'euphoria-earrings',
    handle: 'euphoria-earrings',
    name: 'Euphoria Earring Set',
    priceUSD: 22.00,
    priceINR: 1800,
    images: [
      '/products/img (1).png' // Repeating 1
    ],
    description: 'A curated set of earrings for a maximalist look.',
    details: ['Zinc Alloy', 'Silver finish', 'Set of 6'],
    fit: 'Regular',
    modelInfo: 'One Size',
    category: 'Accessories'
  },
  {
    id: 'void-mini-skirt',
    handle: 'void-mini-skirt',
    name: 'Void Black Mini Skirt',
    priceUSD: 48.00,
    priceINR: 4000,
    images: [
      '/products/img (3).png' // Repeating 3
    ],
    description: 'Minimalist black mini skirt with a clean silhouette.',
    details: ['Poly-blend', 'Side zip', 'Mini length'],
    fit: 'Fitted',
    modelInfo: 'Model is 5\'6 and wears size S',
    category: 'Bottoms'
  },
  {
    id: 'harley-bomber-2',
    handle: 'harley-bomber-2',
    name: 'Harley Black Bomber Jacket (Sale)',
    priceUSD: 110.00,
    priceINR: 9000,
    images: [
      '/products/img (4).png'
    ],
    description: 'Classic oversized bomber jacket with utility details.',
    details: ['100% Nylon', 'Quilted lining', 'Embroidered logo'],
    fit: 'Oversized',
    modelInfo: 'Model is 5\'8 and wears size M',
    category: 'Outerwear'
  }
];

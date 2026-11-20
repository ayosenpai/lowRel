import React from 'react';
import { getProducts } from '@/lib/actions/products';
import CategoryGridClient from './category-grid-client';

const categoryDefinitions = [
  {
    title: 'Latest arrivals',
    href: '/collections/tops',
    productsParams: { category: 'Tops', limit: 1, page: 1 }
  },
  {
    title: 'Sale Tops/Upperwear',
    href: '/collections/bottoms',
    productsParams: { category: 'Tops', limit: 1, page: 2 }
  },
  {
    title: 'Sale Accessory Arrival',
    href: '/collections/accessories',
    productsParams: { category: 'Tops', limit: 1, page: 3 }
  },
  {
    title: 'Shop All',
    href: '/collections/all',
    productsParams: { category: 'Tops', limit: 1, page: 4 }
  },
];

const CategoryGrid = async () => {
  // Fetch 4 Tops products in a single call so cache is consistent and images are distinct
  const { products } = await getProducts({ category: 'Tops', limit: 4 });

  const categoryData = categoryDefinitions.map((def, i) => ({
    ...def,
    image: products[i]?.images?.[0] || products[0]?.images?.[0] || '/products/img (1).png',
  }));

  return <CategoryGridClient categoryData={categoryData} />;
};

export default CategoryGrid;

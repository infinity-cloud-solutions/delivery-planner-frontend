// src/views/admin/hooks/useProducts.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import { Product } from 'types/product';
import { getAccessToken } from 'security';

interface UseProductsReturn {
  products: Product[];
  loadingProducts: boolean;
  productsError: string | null;
  fetchProducts: () => Promise<void>;
}

const productsURL = process.env.REACT_APP_PRODUCTS_BASE_URL as string;

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const jwtToken = getAccessToken();

  const fetchProducts = useCallback(async (): Promise<void> => {
    if (!jwtToken) {
      console.warn('useProducts: no auth token, skipping fetch');
      return;
    }
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const response = await axios.get<Product[]>(productsURL, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = response.data;
      setProducts(
        data.map((item) => ({ ...item, label: item.name, value: item.name }))
      );
    } catch (error) {
      console.error('API error fetching products:', error);
      setProductsError('Error al cargar productos.');
    } finally {
      setLoadingProducts(false);
    }
  }, [jwtToken]);

  return { products, loadingProducts, productsError, fetchProducts };
}

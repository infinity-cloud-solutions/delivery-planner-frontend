// src/views/admin/hooks/useProducts.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import { Product } from 'types/product';
import { getAccessToken } from 'security';

interface UseProductsReturn {
  products: Product[];
  loadingProducts: boolean;
  fetchProducts: () => Promise<void>;
}

const productsURL = process.env.REACT_APP_PRODUCTS_BASE_URL as string;

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const jwtToken = getAccessToken();

  const fetchProducts = useCallback(async (): Promise<void> => {
    setLoadingProducts(true);
    try {
      const response = await axios.get<Product[]>(productsURL, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = response.data;
      if (data.length === 0) {
        setProducts([]);
      } else {
        setProducts(
          data.map((item) => ({ ...item, label: item.name, value: item.name }))
        );
      }
    } catch (error) {
      console.error('API error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [jwtToken]);

  return { products, loadingProducts, fetchProducts };
}

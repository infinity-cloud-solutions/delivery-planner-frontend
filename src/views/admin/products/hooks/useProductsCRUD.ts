import { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Product, CreateProductPayload, UpdateProductPayload } from 'types/product';
import { getAccessToken } from 'security';

export interface UpdateProductArgs {
  item: UpdateProductPayload;
  rowIndex: number;
}

export interface DeleteProductArgs {
  item: Product;
  rowIndex: number;
}

interface UseProductsCRUDReturn {
  products: Product[];
  loading: boolean;
  createProduct: (payload: CreateProductPayload) => Promise<void>;
  updateProduct: (args: UpdateProductArgs) => Promise<void>;
  deleteProduct: (args: DeleteProductArgs) => Promise<void>;
}

const productsURL = process.env.REACT_APP_PRODUCTS_BASE_URL as string;

export function useProductsCRUD(): UseProductsCRUDReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const jwtToken = getAccessToken();

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  }), [jwtToken]);

  useEffect(() => {
    if (!jwtToken) return;
    setLoading(true);
    axios
      .get<Product[]>(productsURL, { headers: authHeaders })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('API error:', err))
      .finally(() => setLoading(false));
  }, [authHeaders, jwtToken]);

  const createProduct = useCallback(
    async (payload: CreateProductPayload): Promise<void> => {
      setLoading(true);
      try {
        const res = await axios.post<{ id: string }>(productsURL, payload, { headers: authHeaders });
        setProducts((prev) => [...prev, { ...payload, id: res.data.id }]);
      } finally {
        setLoading(false);
      }
    },
    [authHeaders]
  );

  const updateProduct = useCallback(
    async ({ item, rowIndex }: UpdateProductArgs): Promise<void> => {
      setLoading(true);
      try {
        await axios.put(productsURL, item, { headers: authHeaders });
        setProducts((prev) => {
          const next = [...prev];
          next.splice(rowIndex, 1, item);
          return next;
        });
      } finally {
        setLoading(false);
      }
    },
    [authHeaders]
  );

  const deleteProduct = useCallback(
    async ({ item, rowIndex }: DeleteProductArgs): Promise<void> => {
      setLoading(true);
      try {
        await axios.delete(`${productsURL}?id=${item.id}`, { headers: authHeaders });
        setProducts((prev) => {
          const next = [...prev];
          next.splice(rowIndex, 1);
          return next;
        });
      } finally {
        setLoading(false);
      }
    },
    [authHeaders]
  );

  return { products, loading, createProduct, updateProduct, deleteProduct };
}

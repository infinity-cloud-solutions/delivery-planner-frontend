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
  fetching: boolean;
  submitting: boolean;
  createProduct: (payload: CreateProductPayload) => Promise<void>;
  updateProduct: (args: UpdateProductArgs) => Promise<void>;
  deleteProduct: (args: DeleteProductArgs) => Promise<void>;
}

const productsURL = process.env.REACT_APP_PRODUCTS_BASE_URL as string;

export function useProductsCRUD(): UseProductsCRUDReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const jwtToken = getAccessToken();

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  }), [jwtToken]);

  useEffect(() => {
    if (!jwtToken) {
      setFetching(false);
      return;
    }
    setFetching(true);
    axios
      .get<Product[]>(productsURL, { headers: authHeaders })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('API error:', err))
      .finally(() => setFetching(false));
  }, [authHeaders, jwtToken]);

  const createProduct = useCallback(
    async (payload: CreateProductPayload): Promise<void> => {
      if (!jwtToken) throw new Error('No authentication token');
      setSubmitting(true);
      try {
        const res = await axios.post<{ id: string }>(productsURL, payload, { headers: authHeaders });
        setProducts((prev) => [...prev, { ...payload, id: res.data.id }]);
      } finally {
        setSubmitting(false);
      }
    },
    [authHeaders, jwtToken]
  );

  const updateProduct = useCallback(
    async ({ item, rowIndex: _rowIndex }: UpdateProductArgs): Promise<void> => {
      if (!jwtToken) throw new Error('No authentication token');
      setSubmitting(true);
      try {
        await axios.put(productsURL, item, { headers: authHeaders });
        setProducts((prev) => prev.map((p) => (p.id === item.id ? item : p)));
      } finally {
        setSubmitting(false);
      }
    },
    [authHeaders, jwtToken]
  );

  const deleteProduct = useCallback(
    async ({ item, rowIndex: _rowIndex }: DeleteProductArgs): Promise<void> => {
      if (!jwtToken) throw new Error('No authentication token');
      setSubmitting(true);
      try {
        await axios.delete(`${productsURL}?id=${item.id}`, { headers: authHeaders });
        setProducts((prev) => prev.filter((p) => p.id !== item.id));
      } finally {
        setSubmitting(false);
      }
    },
    [authHeaders, jwtToken]
  );

  return { products, fetching, submitting, createProduct, updateProduct, deleteProduct };
}

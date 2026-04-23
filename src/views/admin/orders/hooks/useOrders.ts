// src/views/admin/orders/hooks/useOrders.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Order, CreateOrderPayload, ConsolidatedProducts } from 'types/order';
import { getAccessToken } from 'security';
import { DeliveryProcessor } from 'views/admin/orders/components/DeliveryProcessor';
import { buildConsolidated } from 'utils/buildConsolidated';

export interface UpdateOrderArgs {
  item: Order & { original_date?: string };
  rowIndex: number;
}

export interface DeleteOrderArgs {
  item: Order;
  rowIndex: number;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: (date: string) => Promise<void>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  updateOrder: (args: UpdateOrderArgs) => Promise<void>;
  deleteOrder: (args: DeleteOrderArgs) => Promise<void>;
  scheduleOrders: (selectedDrivers: number[]) => void;
  saveRoute: (orders: Order[]) => Promise<void>;
  consolidatedProducts: ConsolidatedProducts;
}

const ordersURL = process.env.REACT_APP_ORDERS_BASE_URL as string;
const ordersScheduleURL = process.env.REACT_APP_UPDATE_SEQUENCING_ORDERS_BASE_URL as string;

const STATUS_SORT_ORDER: Record<string, number> = { Error: 1, Reprogramada: 2 };

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    order: 'Ver detalles',
    payment_method:
      order.payment_method.toUpperCase() === 'PAID' ? 'Pagada' : order.payment_method,
  };
}

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const orderA = STATUS_SORT_ORDER[a.status] ?? 99;
    const orderB = STATUS_SORT_ORDER[b.status] ?? 99;
    return orderA - orderB;
  });
}

export function useOrders(initialDate: string | null): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jwtToken = getAccessToken();

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
    }),
    [jwtToken]
  );

  const fetchOrders = useCallback(
    async (date: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Order[]>(ordersURL, {
          headers: authHeaders,
          params: { date },
        });
        const data = response.data;
        if (data.length === 0) {
          setOrders([]);
        } else {
          setOrders(sortOrders(data.map(normalizeOrder)));
        }
      } catch (err) {
        console.error('API error:', err);
        setError('Error al cargar órdenes.');
      } finally {
        setLoading(false);
      }
    },
    [authHeaders]
  );

  useEffect(() => {
    if (initialDate) fetchOrders(initialDate);
  }, [initialDate, fetchOrders]);

  const createOrder = useCallback(
    async (payload: CreateOrderPayload): Promise<Order> => {
      if (!jwtToken) throw new Error('No authentication token');
      try {
        const response = await axios.post<Order>(ordersURL, payload, {
          headers: authHeaders,
        });
        const created: Order = {
          ...payload,
          ...response.data,
          order: 'Ver detalles',
          delivery_sequence: null,
        };
        setOrders((prev) => [...prev, created]);
        return created;
      } catch (err) {
        console.error('Error creating order:', err);
        throw err;
      }
    },
    [authHeaders, jwtToken]
  );

  const updateOrder = useCallback(
    async ({ item, rowIndex }: UpdateOrderArgs): Promise<void> => {
      if (!jwtToken) throw new Error('No authentication token');
      try {
        const response = await axios.put<Order>(ordersURL, item, {
          headers: authHeaders,
          params: { id: item.id, delivery_date: item.delivery_date },
        });
        const updated: Order = {
          ...item,
          ...response.data,
          order: 'Ver detalles',
          delivery_sequence: null,
        };
        setOrders((prev) => {
          const next = [...prev];
          if (item.delivery_date === item.original_date) {
            next[rowIndex] = updated;
          } else {
            next.splice(rowIndex, 1);
          }
          return next;
        });
      } catch (err) {
        console.error('Error updating order:', err);
        throw err;
      }
    },
    [authHeaders, jwtToken]
  );

  const deleteOrder = useCallback(
    async ({ item, rowIndex }: DeleteOrderArgs): Promise<void> => {
      if (!jwtToken) throw new Error('No authentication token');
      try {
        await axios.delete(ordersURL, {
          headers: authHeaders,
          params: { id: item.id, delivery_date: item.delivery_date },
        });
        setOrders((prev) => prev.filter((_, i) => i !== rowIndex));
      } catch (err) {
        console.error('Error deleting order:', err);
        throw err;
      }
    },
    [authHeaders, jwtToken]
  );

  const scheduleOrders = useCallback(
    (selectedDrivers: number[]): void => {
      setOrders((prev) => {
        let updated = prev;
        if (selectedDrivers.length === 1) {
          updated = prev.map((o) => ({ ...o, driver: selectedDrivers[0] }));
        }
        return DeliveryProcessor(selectedDrivers, updated);
      });
    },
    []
  );

  const saveRoute = useCallback(
    async (routeOrders: Order[]): Promise<void> => {
      if (!jwtToken) {
        console.warn('useOrders: no auth token, skipping saveRoute');
        return;
      }
      try {
        const response = await axios.post(ordersScheduleURL, routeOrders, {
          headers: authHeaders,
        });
        if (response.status !== 200) {
          throw new Error('Solicitud para guardar rutas falló');
        }
        setOrders((prev) =>
          prev.map((o) => {
            const match = routeOrders.find((r) => r.id === o.id);
            return match
              ? { ...o, status: match.status, delivery_sequence: match.delivery_sequence, driver: match.driver }
              : o;
          })
        );
      } catch (err) {
        console.error('Error saving route:', err);
        throw err;
      }
    },
    [jwtToken, authHeaders]
  );

  const consolidatedProducts = useMemo(() => buildConsolidated(orders), [orders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    scheduleOrders,
    saveRoute,
    consolidatedProducts,
  };
}

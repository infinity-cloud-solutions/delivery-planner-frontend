// src/views/admin/orders/hooks/useOrders.ts
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Order, CreateOrderPayload, UpdateOrderPayload, ConsolidatedProducts } from 'types/order';
import { getAccessToken } from 'security';
import { DeliveryProcessor } from 'views/admin/orders/components/DeliveryProcessor';

interface UpdateOrderArgs {
  item: Order & { original_date?: string };
  rowIndex: number;
}

interface DeleteOrderArgs {
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

function buildConsolidated(orders: Order[]): ConsolidatedProducts {
  const result: ConsolidatedProducts = {};
  orders.forEach(({ driver, cart_items }) => {
    const driverKey = String(driver);
    cart_items.forEach(({ product, quantity }) => {
      const qty = parseInt(String(quantity), 10);
      if (!result[driverKey]) result[driverKey] = {};
      result[driverKey][product] = (result[driverKey][product] ?? 0) + qty;
    });
  });
  return result;
}

export function useOrders(initialDate: string | null): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jwtToken = getAccessToken();

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  };

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
    [jwtToken]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialDate) fetchOrders(initialDate);
  }, [initialDate]);

  const createOrder = useCallback(
    async (payload: CreateOrderPayload): Promise<Order> => {
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
    [jwtToken]
  );

  const updateOrder = useCallback(
    async ({ item, rowIndex }: UpdateOrderArgs): Promise<void> => {
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
    [jwtToken]
  );

  const deleteOrder = useCallback(
    async ({ item, rowIndex }: DeleteOrderArgs): Promise<void> => {
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
    [jwtToken]
  );

  const scheduleOrders = useCallback(
    (selectedDrivers: number[]): void => {
      const scheduled = DeliveryProcessor(selectedDrivers, orders);
      setOrders(scheduled);
    },
    [orders]
  );

  const saveRoute = useCallback(
    async (routeOrders: Order[]): Promise<void> => {
      try {
        const promises = routeOrders.map((order, index) =>
          axios.put(
            ordersScheduleURL,
            { ...order, delivery_sequence: index + 1 },
            { headers: authHeaders }
          )
        );
        await Promise.all(promises);
        setOrders((prev) =>
          prev.map((o) => {
            const idx = routeOrders.findIndex((r) => r.id === o.id);
            return idx !== -1 ? { ...o, delivery_sequence: idx + 1 } : o;
          })
        );
      } catch (err) {
        console.error('Error saving route:', err);
        throw err;
      }
    },
    [jwtToken]
  );

  const consolidatedProducts = buildConsolidated(orders);

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

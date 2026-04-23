import { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Delivery, DeliveryStatus } from 'types/delivery';
import { ConsolidatedProducts } from 'types/order';
import { getAccessToken, getEmailFromToken } from 'security';
import { getDateAsQueryParam } from 'utils/Utility';

export interface UpdateDeliveryArgs {
  order: Delivery;
  orderId: string;
  statusText: DeliveryStatus;
}

interface UseDeliveriesReturn {
  deliveries: Delivery[];
  loading: boolean;
  error: string | null;
  consolidatedProducts: ConsolidatedProducts;
  updateDelivery: (args: UpdateDeliveryArgs) => Promise<void>;
}

const ordersURL = process.env.REACT_APP_ORDERS_BASE_URL as string;

function getDriverValue(): number {
  const driverEnvValue = process.env.REACT_APP_DRIVERS_MAP ?? '{}';
  const driversMap: Record<string, number> = JSON.parse(driverEnvValue);
  const userEmail = getEmailFromToken();
  return userEmail && userEmail in driversMap ? driversMap[userEmail] : 999;
}

function sortDeliveries(deliveries: Delivery[]): Delivery[] {
  return [...deliveries].sort((a, b) => {
    const aMorning = a.delivery_time === '9 AM - 1 PM';
    const bMorning = b.delivery_time === '9 AM - 1 PM';
    if (aMorning && !bMorning) return -1;
    if (!aMorning && bMorning) return 1;
    return a.delivery_sequence - b.delivery_sequence;
  });
}

function buildConsolidated(deliveries: Delivery[]): ConsolidatedProducts {
  const result: ConsolidatedProducts = {};
  deliveries.forEach(({ driver, cart_items }) => {
    const key = String(driver);
    cart_items.forEach(({ product, quantity }) => {
      const qty = parseInt(String(quantity), 10);
      if (!result[key]) result[key] = {};
      result[key][product] = (result[key][product] ?? 0) + qty;
    });
  });
  return result;
}

export function useDeliveries(): UseDeliveriesReturn {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const jwtToken = getAccessToken();

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  }), [jwtToken]);

  useEffect(() => {
    const dateParam = getDateAsQueryParam();
    const driverValue = getDriverValue();

    axios
      .get<Delivery[]>(ordersURL, { headers: authHeaders, params: { date: dateParam } })
      .then((response) => {
        const data = response.data
          .map((order) => ({
            ...order,
            payment_method: order.payment_method.toUpperCase() === 'PAID' ? 'Pagada' : order.payment_method,
          }))
          .filter(
            (order) =>
              (order.status === 'Programada' || order.status === 'En ruta') &&
              order.delivery_date === dateParam &&
              Number(order.driver) === Number(driverValue)
          );
        setDeliveries(sortDeliveries(data));
      })
      .catch((err) => {
        console.error('API error:', err);
        setError('Error al cargar las entregas.');
      })
      .finally(() => setLoading(false));
  }, [authHeaders]);

  const updateDelivery = useCallback(
    async ({ order, orderId, statusText }: UpdateDeliveryArgs): Promise<void> => {
      const response = await axios.put(ordersURL, order, {
        headers: authHeaders,
        params: { id: order.id, delivery_date: order.delivery_date },
      });

      if (response.status === 200) {
        setDeliveries((prev) => {
          if (statusText === 'Entregada' || statusText === 'Reprogramada') {
            return prev.filter((o) => o.id !== orderId);
          }
          return prev.map((o) => (o.id === orderId ? order : o));
        });
      }
    },
    [authHeaders]
  );

  return {
    deliveries,
    loading,
    error,
    consolidatedProducts: buildConsolidated(deliveries),
    updateDelivery,
  };
}

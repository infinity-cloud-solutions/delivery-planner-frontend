export type DeliveryStatus = 'Programada' | 'En ruta' | 'Entregada' | 'Reprogramada';

export interface Delivery {
  id: string;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
  delivery_sequence: number;
  driver: number;
  client_name: string;
  phone_number: string;
  total_amount: number;
  payment_method: string;
  status: DeliveryStatus;
  cart_items: import('./order').CartItem[];
  latitude?: number | null;
  longitude?: number | null;
}

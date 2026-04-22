export interface CartItem {
  product: string;
  quantity: number | string;
  price?: number;
}

export type OrderStatus =
  | 'Creada'
  | 'Programada'
  | 'En ruta'
  | 'Entregada'
  | 'Reprogramada'
  | 'Error';

export interface Order {
  id: string;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
  delivery_sequence: number | null;
  driver: number | string | null;
  client_name: string;
  phone_number: string;
  total_amount: number;
  payment_method: string;
  status: OrderStatus;
  errors: string[];
  cart_items: CartItem[];
  latitude?: number | null;
  longitude?: number | null;
  order?: string;
}

export interface CreateOrderPayload {
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
  client_name: string;
  phone_number: string;
  total_amount: number;
  payment_method: string;
  cart_items: CartItem[];
  driver?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateOrderPayload extends Partial<CreateOrderPayload> {
  id: string;
  delivery_date: string;
  original_date?: string;
  original_driver?: number;
}

export interface ConsolidatedProducts {
  [driver: string]: {
    [product: string]: number;
  };
}

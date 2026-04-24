/**
 * Shared typed mock API responses used across all E2E specs.
 * All data is in Spanish to match actual API response format.
 */

export const mockOrders = [
  {
    id: 'order-1',
    client_name: 'Juan Pérez',
    phone_number: '5551234567',
    delivery_address: 'Av. Insurgentes 100, CDMX',
    delivery_date: '2026-04-25',
    delivery_time: '10:00 - 12:00',
    payment_method: 'Tarjeta',
    driver_id: 1,
    delivery_sequence: 1,
    status: 'pending',
    discount: 0,
    total_amount: 150.0,
    products: [],
  },
  {
    id: 'order-2',
    client_name: 'María López',
    phone_number: '5559876543',
    delivery_address: 'Calle Reforma 200, CDMX',
    delivery_date: '2026-04-25',
    delivery_time: '14:00 - 16:00',
    payment_method: 'Efectivo',
    driver_id: 2,
    delivery_sequence: 1,
    status: 'pending',
    discount: 10,
    total_amount: 200.0,
    products: [],
  },
];

export const mockClients = [
  {
    id: 'client-1',
    phone_number: '5551234567',
    name: 'Juan Pérez',
    address: 'Av. Insurgentes 100, CDMX',
    email: 'juan@example.com',
    discount: 0,
  },
  {
    id: 'client-2',
    phone_number: '5559876543',
    name: 'María López',
    address: 'Calle Reforma 200, CDMX',
    email: 'maria@example.com',
    discount: 10,
  },
];

export const mockProducts = [
  { id: 'prod-1', name: 'Producto Alpha', price: 99.99 },
  { id: 'prod-2', name: 'Producto Beta', price: 149.50 },
];

export const mockDeliveries = [
  {
    id: 'delivery-1',
    order_id: 'order-1',
    client_name: 'Juan Pérez',
    delivery_address: 'Av. Insurgentes 100, CDMX',
    delivery_time: '10:00 - 12:00',
    payment_method: 'Tarjeta',
    status: 'pending',
    products: [{ name: 'Producto Alpha', quantity: 2 }],
    latitude: '19.4326',
    longitude: '-99.1332',
  },
  {
    id: 'delivery-2',
    order_id: 'order-2',
    client_name: 'María López',
    delivery_address: 'Calle Reforma 200, CDMX',
    delivery_time: '14:00 - 16:00',
    payment_method: 'Efectivo',
    status: 'pending',
    products: [{ name: 'Producto Beta', quantity: 1 }],
    latitude: '19.4270',
    longitude: '-99.1671',
  },
];

export const mockNewOrder = {
  id: 'order-new',
  client_name: 'Carlos Ruiz',
  phone_number: '5550001111',
  delivery_address: 'Calle Nueva 500, CDMX',
  delivery_date: '2026-04-26',
  delivery_time: '10:00 - 12:00',
  payment_method: 'Transferencia',
  driver_id: 1,
  delivery_sequence: 3,
  status: 'pending',
  discount: 0,
  total_amount: 300.0,
  products: [],
};

export const mockNewClient = {
  id: 'client-new',
  phone_number: '5550001111',
  name: 'Carlos Ruiz',
  address: 'Calle Nueva 500, CDMX',
  email: 'carlos@example.com',
  discount: 0,
};

export const mockNewProduct = {
  id: 'prod-new',
  name: 'Producto Nuevo',
  price: 250.0,
};

/** Delivery times available in the order form */
export const availableDeliveryTimes = ['10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'];

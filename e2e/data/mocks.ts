/**
 * Shared typed mock API responses used across all E2E specs.
 * All data is in Spanish to match actual API response format.
 */

const _today = new Date();
const TODAY = `${_today.getFullYear()}-${String(_today.getMonth() + 1).padStart(2, '0')}-${String(_today.getDate()).padStart(2, '0')}`;

export const mockOrders = [
  {
    id: 'order-1',
    client_name: 'Juan Pérez',
    phone_number: '5551234567',
    delivery_address: 'Av. Insurgentes 100, CDMX',
    delivery_date: TODAY,
    delivery_time: '10:00 - 12:00',
    payment_method: 'Tarjeta',
    driver: 999,
    driver_id: 1,
    delivery_sequence: 1,
    status: 'Creada',
    discount: 0,
    total_amount: 150.0,
    cart_items: [{ product: 'Producto Alpha', quantity: 1, price: 99.99 }],
    errors: [],
    latitude: 19.4326,
    longitude: -99.1332,
  },
  {
    id: 'order-2',
    client_name: 'María López',
    phone_number: '5559876543',
    delivery_address: 'Calle Reforma 200, CDMX',
    delivery_date: TODAY,
    delivery_time: '14:00 - 16:00',
    payment_method: 'Efectivo',
    driver: 999,
    driver_id: 2,
    delivery_sequence: 2,
    status: 'Creada',
    discount: 10,
    total_amount: 200.0,
    cart_items: [{ product: 'Producto Beta', quantity: 2, price: 149.50 }],
    errors: [],
    latitude: 19.4270,
    longitude: -99.1671,
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

/**
 * Deliveries use different client names from mockOrders to avoid table row collisions.
 * driver: 999 matches getDriverValue() for the fake driver JWT (email not in DRIVERS_MAP).
 */
export const mockDeliveries = [
  {
    id: 'delivery-1',
    order_id: 'order-3',
    client_name: 'Ana García',
    phone_number: '5551111111',
    delivery_address: 'Av. Insurgentes 100, CDMX',
    delivery_date: TODAY,
    delivery_time: '10:00 - 12:00',
    payment_method: 'Tarjeta',
    driver: 999,
    delivery_sequence: 1,
    status: 'En ruta',
    total_amount: 100.0,
    cart_items: [{ product: 'Producto Alpha', quantity: 2 }],
    errors: [],
    latitude: 19.4326,
    longitude: -99.1332,
    cooler: 1,
  },
  {
    id: 'delivery-2',
    order_id: 'order-4',
    client_name: 'Pedro Martín',
    phone_number: '5552222222',
    delivery_address: 'Calle Reforma 200, CDMX',
    delivery_date: TODAY,
    delivery_time: '14:00 - 16:00',
    payment_method: 'Efectivo',
    driver: 999,
    delivery_sequence: 2,
    status: 'En ruta',
    total_amount: 150.0,
    cart_items: [{ product: 'Producto Beta', quantity: 1 }],
    errors: [],
    latitude: 19.4270,
    longitude: -99.1671,
    cooler: 2,
  },
];

export const mockNewOrder = {
  id: 'order-new',
  client_name: 'Carlos Ruiz',
  phone_number: '5550001111',
  delivery_address: 'Calle Nueva 500, CDMX',
  delivery_date: TODAY,
  delivery_time: '10:00 - 12:00',
  payment_method: 'Transferencia',
  driver: null,
  driver_id: 1,
  delivery_sequence: 3,
  status: 'Creada',
  discount: 0,
  total_amount: 300.0,
  cart_items: [],
  errors: [],
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

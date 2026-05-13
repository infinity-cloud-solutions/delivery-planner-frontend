import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useOrders } from '../useOrders';

jest.mock('axios');
jest.mock('security', () => ({ getAccessToken: () => 'mock-token' }));
jest.mock('views/admin/orders/components/DeliveryProcessor', () => ({
  DeliveryProcessor: (drivers: number[], orders: unknown[]) => orders,
}));

const mockAxios = axios as jest.Mocked<typeof axios>;

const mockOrder = {
  id: '1', delivery_date: '2024-01-15', delivery_time: '9 AM - 1 PM',
  delivery_address: 'Calle 1', delivery_sequence: null, driver: 1,
  client_name: 'Test Client', phone_number: '1234567890', total_amount: 100,
  payment_method: 'PAID', status: 'Creada', errors: [], cart_items: [],
};

describe('useOrders', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fetch orders and normalize them', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [mockOrder] });
    const { result } = renderHook(() => useOrders('2024-01-15'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders[0].payment_method).toBe('Pagada');
    expect(result.current.orders[0].order).toBe('Ver detalles');
  });

  it('should set orders to empty array when no orders returned', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useOrders('2024-01-15'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toHaveLength(0);
  });

  it('should create an order and add it to state when date matches viewed date', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] });
    mockAxios.post.mockResolvedValueOnce({ data: { ...mockOrder, id: 'new-id' } });
    const { result } = renderHook(() => useOrders('2024-01-15'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createOrder({
        delivery_date: '2024-01-15', delivery_time: '9 AM - 1 PM',
        delivery_address: 'Calle 1', client_name: 'Test', phone_number: '123',
        total_amount: 100, payment_method: 'Efectivo', cart_items: [],
      });
    });
    expect(result.current.orders).toHaveLength(1);
  });

  it('should NOT add order to state when delivery_date differs from viewed date', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] });
    mockAxios.post.mockResolvedValueOnce({ data: { ...mockOrder, id: 'new-id', delivery_date: '2024-01-16' } });
    const { result } = renderHook(() => useOrders('2024-01-15'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createOrder({
        delivery_date: '2024-01-16', delivery_time: '9 AM - 1 PM',
        delivery_address: 'Calle 1', client_name: 'Test', phone_number: '123',
        total_amount: 100, payment_method: 'Efectivo', cart_items: [],
      });
    });
    // Order for a different date should not appear in the current view
    expect(result.current.orders).toHaveLength(0);
  });

  it('should delete an order and remove it from state', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [mockOrder] });
    mockAxios.delete.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(() => useOrders('2024-01-15'));
    await waitFor(() => expect(result.current.orders).toHaveLength(1));

    await act(async () => {
      await result.current.deleteOrder({ item: result.current.orders[0], rowIndex: 0 });
    });
    expect(result.current.orders).toHaveLength(0);
  });

  it('should consolidate products by driver', async () => {
    const orderWithItems = {
      ...mockOrder,
      driver: 1,
      cart_items: [{ product: 'Berry', quantity: 2 }],
    };
    mockAxios.get.mockResolvedValueOnce({ data: [orderWithItems] });
    const { result } = renderHook(() => useOrders('2024-01-15'));
    await waitFor(() => expect(result.current.orders).toHaveLength(1));
    expect(result.current.consolidatedProducts['1']['Berry']).toBe(2);
  });
});

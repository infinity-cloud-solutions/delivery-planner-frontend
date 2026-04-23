import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useDeliveries } from '../useDeliveries';

jest.mock('axios');
jest.mock('security', () => ({
  getAccessToken: jest.fn().mockReturnValue('mock-token'),
  getEmailFromToken: jest.fn().mockReturnValue('driver@test.com'),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Compute today's date the same way getDateAsQueryParam does, so the delivery_date filter passes
const today = new Date();
const todayParam = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const mockDelivery = {
  id: '1',
  delivery_date: todayParam,
  delivery_time: '9 AM - 1 PM',
  delivery_address: 'Calle 1 #123',
  delivery_sequence: 1,
  driver: 999,
  client_name: 'Test Client',
  phone_number: '1234567890',
  total_amount: 50,
  payment_method: 'Efectivo',
  status: 'Programada' as const,
  cart_items: [{ product: 'Mango', quantity: 2, price: 25 }],
};

describe('useDeliveries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load and filter deliveries for the current driver on mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [mockDelivery] });
    const { result } = renderHook(() => useDeliveries());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.deliveries).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('should filter out deliveries that do not match the driver', async () => {
    const otherDriverDelivery = { ...mockDelivery, driver: 1 };
    mockedAxios.get.mockResolvedValueOnce({ data: [mockDelivery, otherDriverDelivery] });
    const { result } = renderHook(() => useDeliveries());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.deliveries).toHaveLength(1);
    expect(result.current.deliveries[0].driver).toBe(999);
  });

  it('should normalize PAID payment method to Pagada', async () => {
    const paidDelivery = { ...mockDelivery, payment_method: 'PAID' };
    mockedAxios.get.mockResolvedValueOnce({ data: [paidDelivery] });
    const { result } = renderHook(() => useDeliveries());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.deliveries[0].payment_method).toBe('Pagada');
  });

  it('should set error when API call fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useDeliveries());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Error al cargar las entregas.');
    expect(result.current.deliveries).toHaveLength(0);
  });

  it('should build consolidatedProducts from deliveries', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [mockDelivery] });
    const { result } = renderHook(() => useDeliveries());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.consolidatedProducts['999']['Mango']).toBe(2);
  });

  it('should remove delivery when status is Entregada', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [mockDelivery] });
    mockedAxios.put.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(() => useDeliveries());
    await waitFor(() => expect(result.current.deliveries).toHaveLength(1));

    await act(async () => {
      await result.current.updateDelivery({
        order: { ...mockDelivery, status: 'Entregada' },
        orderId: '1',
        statusText: 'Entregada',
      });
    });

    expect(result.current.deliveries).toHaveLength(0);
  });

  it('should remove delivery when status is Reprogramada', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [mockDelivery] });
    mockedAxios.put.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(() => useDeliveries());
    await waitFor(() => expect(result.current.deliveries).toHaveLength(1));

    await act(async () => {
      await result.current.updateDelivery({
        order: { ...mockDelivery, status: 'Reprogramada' },
        orderId: '1',
        statusText: 'Reprogramada',
      });
    });

    expect(result.current.deliveries).toHaveLength(0);
  });

  it('should update delivery in place when status is En ruta', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [mockDelivery] });
    mockedAxios.put.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(() => useDeliveries());
    await waitFor(() => expect(result.current.deliveries).toHaveLength(1));

    const updatedOrder = { ...mockDelivery, status: 'En ruta' as const };
    await act(async () => {
      await result.current.updateDelivery({
        order: updatedOrder,
        orderId: '1',
        statusText: 'En ruta',
      });
    });

    expect(result.current.deliveries[0].status).toBe('En ruta');
  });
});

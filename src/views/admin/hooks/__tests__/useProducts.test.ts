import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useProducts } from '../useProducts';

jest.mock('axios');
jest.mock('security', () => ({ getAccessToken: () => 'mock-token' }));

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('useProducts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fetch and return products', async () => {
    const mockProducts = [{ id: '1', name: 'Berry', price: 10 }];
    mockAxios.get.mockResolvedValueOnce({ data: mockProducts });

    const { result } = renderHook(() => useProducts());
    act(() => { result.current.fetchProducts(); });

    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(result.current.products[0].label).toBe('Berry');
    expect(result.current.products[0].value).toBe('Berry');
  });

  it('should set products to empty array when API returns empty', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useProducts());
    act(() => { result.current.fetchProducts(); });
    await waitFor(() => expect(result.current.loadingProducts).toBe(false));
    expect(result.current.products).toHaveLength(0);
  });

  it('should handle API errors gracefully', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useProducts());
    act(() => { result.current.fetchProducts(); });
    await waitFor(() => expect(result.current.loadingProducts).toBe(false));
    expect(result.current.products).toHaveLength(0);
  });
});

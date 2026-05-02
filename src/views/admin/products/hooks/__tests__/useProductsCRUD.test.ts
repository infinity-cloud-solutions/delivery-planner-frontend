import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useProductsCRUD } from '../useProductsCRUD';
import * as security from 'security';

jest.mock('axios');
jest.mock('security', () => ({ getAccessToken: jest.fn(() => 'test-token') }));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockGetAccessToken = security.getAccessToken as jest.Mock;

const mockProduct = { id: '1', name: 'Berry', price: 10 };

describe('useProductsCRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToken.mockReturnValue('test-token');
  });

  it('should fetch on mount and call GET with auth headers', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [mockProduct] });
    const { result } = renderHook(() => useProductsCRUD());
    await waitFor(() => expect(result.current.fetching).toBe(false));
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
    expect(result.current.products).toEqual([mockProduct]);
  });

  it('should skip fetch when token is null', async () => {
    mockGetAccessToken.mockReturnValue(null);
    const { result } = renderHook(() => useProductsCRUD());
    await waitFor(() => expect(result.current.fetching).toBe(false));
    expect(mockAxios.get).not.toHaveBeenCalled();
    expect(result.current.products).toEqual([]);
  });

  it('should call POST and add item to state on createProduct', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] });
    mockAxios.post.mockResolvedValueOnce({ data: { id: 'new-1' } });
    const { result } = renderHook(() => useProductsCRUD());
    await waitFor(() => expect(result.current.fetching).toBe(false));

    await act(async () => {
      await result.current.createProduct({ name: 'Berry', price: 10 });
    });

    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      { name: 'Berry', price: 10 },
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
    expect(result.current.products).toEqual([{ name: 'Berry', price: 10, id: 'new-1' }]);
  });

  it('should call PUT and splice item into state on updateProduct', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [mockProduct] });
    mockAxios.put.mockResolvedValueOnce({ data: {} });
    const { result } = renderHook(() => useProductsCRUD());
    await waitFor(() => expect(result.current.products).toHaveLength(1));

    const updated = { id: '1', name: 'Berry Updated', price: 15 };
    await act(async () => {
      await result.current.updateProduct({ item: updated, rowIndex: 0 });
    });

    expect(mockAxios.put).toHaveBeenCalledWith(
      expect.any(String),
      updated,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
    expect(result.current.products[0]).toEqual(updated);
  });

  it('should call DELETE and remove item from state on deleteProduct', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [mockProduct] });
    mockAxios.delete.mockResolvedValueOnce({ data: {} });
    const { result } = renderHook(() => useProductsCRUD());
    await waitFor(() => expect(result.current.products).toHaveLength(1));

    await act(async () => {
      await result.current.deleteProduct({ item: mockProduct, rowIndex: 0 });
    });

    expect(mockAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining(`?id=${mockProduct.id}`),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
    expect(result.current.products).toHaveLength(0);
  });

  it('should not call POST when token is null on createProduct', async () => {
    mockGetAccessToken.mockReturnValue(null);
    const { result } = renderHook(() => useProductsCRUD());
    await expect(result.current.createProduct({ name: 'Berry', price: 10 })).rejects.toThrow('No authentication token');
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('should not call PUT when token is null on updateProduct', async () => {
    mockGetAccessToken.mockReturnValue(null);
    const { result } = renderHook(() => useProductsCRUD());
    await expect(result.current.updateProduct({ item: mockProduct, rowIndex: 0 })).rejects.toThrow('No authentication token');
    expect(mockAxios.put).not.toHaveBeenCalled();
  });

  it('should not call DELETE when token is null on deleteProduct', async () => {
    mockGetAccessToken.mockReturnValue(null);
    const { result } = renderHook(() => useProductsCRUD());
    await expect(result.current.deleteProduct({ item: mockProduct, rowIndex: 0 })).rejects.toThrow('No authentication token');
    expect(mockAxios.delete).not.toHaveBeenCalled();
  });
});

import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { useClientLookup } from '../useClientLookup';

jest.mock('axios');
jest.mock('security', () => ({ getAccessToken: () => 'mock-token' }));

const mockAxios = axios as jest.Mocked<typeof axios>;

const axiosError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { status },
  });

const mockClientData = {
  phone_number: '5551234567',
  name: 'John Doe',
  address: 'Calle 1 #2',
  address_latitude: 19.4,
  address_longitude: -99.1,
  second_address: null,
  second_address_latitude: null,
  second_address_longitude: null,
  email: 'john@example.com',
  discount: 0,
};

describe('useClientLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockAxios.isAxiosError as unknown as jest.Mock).mockImplementation(
      (error: { isAxiosError?: boolean }) => Boolean(error?.isAxiosError)
    );
  });

  it('should return mapped client when found', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: mockClientData });
    const { result } = renderHook(() => useClientLookup());

    let client;
    await act(async () => {
      client = await result.current.lookupClient('5551234567');
    });

    expect(client).toEqual({
      clientPhoneNumber: '5551234567',
      clientName: 'John Doe',
      clientAddress: 'Calle 1 #2',
      clientLatitude: 19.4,
      clientLongitude: -99.1,
      clientSecondAddress: null,
      clientSecondLatitude: null,
      clientSecondLongitude: null,
      clientEmail: 'john@example.com',
      clientDiscount: 0,
    });
  });

  it('should return null when API returns no data', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: null });
    const { result } = renderHook(() => useClientLookup());

    let client;
    await act(async () => {
      client = await result.current.lookupClient('0000000000');
    });

    expect(client).toBeNull();
  });

  it('should return null when the client is not found (404)', async () => {
    mockAxios.get.mockRejectedValueOnce(axiosError(404));
    const { result } = renderHook(() => useClientLookup());

    let client;
    await act(async () => {
      client = await result.current.lookupClient('5551234567');
    });

    expect(client).toBeNull();
  });

  it('should throw on server errors so callers can show an error', async () => {
    mockAxios.get.mockRejectedValueOnce(axiosError(500));
    const { result } = renderHook(() => useClientLookup());

    await expect(result.current.lookupClient('5551234567')).rejects.toThrow(
      'Request failed with status code 500'
    );
  });

  it('should throw on network errors', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useClientLookup());

    await expect(result.current.lookupClient('5551234567')).rejects.toThrow('Network error');
  });

  it('should return null when no auth token', async () => {
    const securityModule = require('security');
    jest.spyOn(securityModule, 'getAccessToken').mockReturnValueOnce(null);

    const { result } = renderHook(() => useClientLookup());

    let client;
    await act(async () => {
      client = await result.current.lookupClient('5551234567');
    });

    expect(client).toBeNull();
    expect(mockAxios.get).not.toHaveBeenCalled();
  });
});

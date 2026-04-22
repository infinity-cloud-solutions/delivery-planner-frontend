import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { useClientLookup } from '../useClientLookup';

jest.mock('axios');
jest.mock('security', () => ({ getAccessToken: () => 'mock-token' }));

const mockAxios = axios as jest.Mocked<typeof axios>;

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
  beforeEach(() => jest.clearAllMocks());

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

  it('should return null on API error', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useClientLookup());

    let client;
    await act(async () => {
      client = await result.current.lookupClient('5551234567');
    });

    expect(client).toBeNull();
  });
});

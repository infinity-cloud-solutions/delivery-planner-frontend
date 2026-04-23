import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { getAccessToken } from 'security';

jest.mock('axios');
jest.mock('security', () => ({ getAccessToken: jest.fn() }));

import { useClients } from '../useClients';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetAccessToken = getAccessToken as jest.Mock;

const mockClientResponse = {
  phone_number: '1234567890',
  name: 'John Doe',
  address: '123 Main St',
  address_latitude: 19.4326,
  address_longitude: -99.1332,
  second_address: null,
  second_address_latitude: null,
  second_address_longitude: null,
  email: 'john@example.com',
  discount: 10,
};

const mappedClient = {
  clientPhoneNumber: '1234567890',
  clientName: 'John Doe',
  clientAddress: '123 Main St',
  clientLatitude: 19.4326,
  clientLongitude: -99.1332,
  clientSecondAddress: null,
  clientSecondLatitude: null,
  clientSecondLongitude: null,
  clientEmail: 'john@example.com',
  clientDiscount: 10,
};

describe('useClients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockReturnValue('test-token');
  });

  describe('fetchClient', () => {
    it('should return a mapped client on success', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockClientResponse });
      const { result } = renderHook(() => useClients());

      let client;
      await act(async () => {
        client = await result.current.fetchClient('1234567890');
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
          params: { phone_number: '1234567890' },
        })
      );
      expect(client).toEqual(mappedClient);
    });

    it('should return null when jwtToken is null', async () => {
      mockedGetAccessToken.mockReturnValue(null);
      const { result } = renderHook(() => useClients());

      let client;
      await act(async () => {
        client = await result.current.fetchClient('1234567890');
      });

      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(client).toBeNull();
    });

    it('should return null on API error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      const { result } = renderHook(() => useClients());

      let client;
      await act(async () => {
        client = await result.current.fetchClient('1234567890');
      });

      expect(client).toBeNull();
    });
  });

  describe('createClient', () => {
    const createPayload = {
      phone_number: '1234567890',
      name: 'John Doe',
      address: '123 Main St',
      address_geolocation: null,
    };

    it('should POST with correct payload and headers', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.createClient(createPayload);
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        createPayload,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
    });

    it('should throw "No authentication token" when token is null', async () => {
      mockedGetAccessToken.mockReturnValue(null);
      const { result } = renderHook(() => useClients());

      await expect(result.current.createClient(createPayload)).rejects.toThrow(
        'No authentication token'
      );
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('updateClient', () => {
    const updatePayload = {
      phone_number: '1234567890',
      original_phone_number: '1234567890',
      name: 'Jane Doe',
      address: '456 Other St',
      address_geolocation: null,
    };

    it('should PUT with correct payload and headers', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.updateClient(updatePayload);
      });

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        updatePayload,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
    });

    it('should throw "No authentication token" when token is null', async () => {
      mockedGetAccessToken.mockReturnValue(null);
      const { result } = renderHook(() => useClients());

      await expect(result.current.updateClient(updatePayload)).rejects.toThrow(
        'No authentication token'
      );
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });
  });

  describe('deleteClient', () => {
    it('should DELETE with correct phone number param and headers', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.deleteClient('1234567890');
      });

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
          params: { phone_number: '1234567890' },
        })
      );
    });

    it('should throw "No authentication token" when token is null', async () => {
      mockedGetAccessToken.mockReturnValue(null);
      const { result } = renderHook(() => useClients());

      await expect(result.current.deleteClient('1234567890')).rejects.toThrow(
        'No authentication token'
      );
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });
  });
});

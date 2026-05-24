import { useCallback, useMemo } from 'react';
import axios from 'axios';
import { getAccessToken } from 'security';
import { CreateClientPayload, UpdateClientPayload, MappedClient } from 'types/client';

interface UseClientsReturn {
  fetchClient: (phoneNumber: string) => Promise<MappedClient | null>;
  createClient: (payload: CreateClientPayload) => Promise<void>;
  updateClient: (payload: UpdateClientPayload) => Promise<void>;
  deleteClient: (phoneNumber: string) => Promise<void>;
}

const clientsURL = process.env.REACT_APP_CLIENTS_BASE_URL as string;

function mapClientResponse(data: Record<string, unknown>): MappedClient {
  return {
    clientPhoneNumber: data.phone_number as string,
    clientName: data.name as string,
    clientAddress: data.address as string,
    clientLatitude: data.address_latitude as number | null,
    clientLongitude: data.address_longitude as number | null,
    clientSecondAddress: data.second_address as string | null,
    clientSecondLatitude: data.second_address_latitude as number | null,
    clientSecondLongitude: data.second_address_longitude as number | null,
    clientEmail: data.email as string,
    clientDiscount: data.discount as number,
  };
}

export function useClients(): UseClientsReturn {
  const jwtToken = getAccessToken();

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    }),
    [jwtToken]
  );

  const fetchClient = useCallback(
    async (phoneNumber: string): Promise<MappedClient | null> => {
      if (!jwtToken) return null;
      try {
        const response = await axios.get(clientsURL, {
          headers: authHeaders,
          params: { phone_number: phoneNumber },
        });
        if (response.data) {
          return mapClientResponse(response.data as Record<string, unknown>);
        }
        return null;
      } catch {
        return null;
      }
    },
    [authHeaders, jwtToken]
  );

  const createClient = useCallback(
    async (payload: CreateClientPayload): Promise<void> => {
      if (!jwtToken) throw new Error('No authentication token');
      await axios.post(clientsURL, payload, { headers: authHeaders });
    },
    [authHeaders, jwtToken]
  );

  const updateClient = useCallback(
    async (payload: UpdateClientPayload): Promise<void> => {
      if (!jwtToken) throw new Error('No authentication token');
      await axios.put(clientsURL, payload, { headers: authHeaders });
    },
    [authHeaders, jwtToken]
  );

  const deleteClient = useCallback(
    async (phoneNumber: string): Promise<void> => {
      if (!jwtToken) throw new Error('No authentication token');
      await axios.delete(clientsURL, {
        headers: authHeaders,
        params: { phone_number: phoneNumber },
      });
    },
    [authHeaders, jwtToken]
  );

  return { fetchClient, createClient, updateClient, deleteClient };
}

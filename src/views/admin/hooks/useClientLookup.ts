// src/views/admin/hooks/useClientLookup.ts
import { useCallback } from 'react';
import axios from 'axios';
import { MappedClient } from 'types/client';
import { getAccessToken } from 'security';

interface UseClientLookupReturn {
  lookupClient: (phoneNumber: string) => Promise<MappedClient | null>;
}

const clientsURL = process.env.REACT_APP_CLIENTS_BASE_URL as string;

export function useClientLookup(): UseClientLookupReturn {
  const jwtToken = getAccessToken();

  const lookupClient = useCallback(
    async (phoneNumber: string): Promise<MappedClient | null> => {
      if (!jwtToken) {
        console.warn('useClientLookup: no auth token, skipping lookup');
        return null;
      }
      try {
        const response = await axios.get(clientsURL, {
          headers: { Authorization: `Bearer ${jwtToken}` },
          params: { phone_number: phoneNumber },
        });
        const data = response.data;
        if (!data) return null;
        return {
          clientPhoneNumber: data.phone_number,
          clientName: data.name,
          clientAddress: data.address,
          clientLatitude: data.address_latitude,
          clientLongitude: data.address_longitude,
          clientSecondAddress: data.second_address,
          clientSecondLatitude: data.second_address_latitude,
          clientSecondLongitude: data.second_address_longitude,
          clientEmail: data.email,
          clientDiscount: data.discount,
        };
      } catch (error) {
        console.error('API error:', error);
        return null;
      }
    },
    [jwtToken]
  );

  return { lookupClient };
}

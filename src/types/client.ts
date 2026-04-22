export interface Client {
  phone_number: string;
  name: string;
  address: string;
  address_latitude?: number | null;
  address_longitude?: number | null;
  second_address?: string | null;
  second_address_latitude?: number | null;
  second_address_longitude?: number | null;
  email?: string;
  discount?: number;
}

export interface MappedClient {
  clientPhoneNumber: string;
  clientName: string;
  clientAddress: string;
  clientLatitude?: number | null;
  clientLongitude?: number | null;
  clientSecondAddress?: string | null;
  clientSecondLatitude?: number | null;
  clientSecondLongitude?: number | null;
  clientEmail?: string;
  clientDiscount?: number;
}

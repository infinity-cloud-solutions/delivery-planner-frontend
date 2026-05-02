export interface Product {
  id: string;
  name: string;
  price: number;
  label?: string;
  value?: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
}

export interface UpdateProductPayload extends CreateProductPayload {
  id: string;
}

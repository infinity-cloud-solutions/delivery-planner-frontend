import { ConsolidatedProducts } from 'types/order';

interface ConsolidatableItem {
  driver: number | string | null;
  cart_items: Array<{ product: string; quantity: number | string }>;
}

export function buildConsolidated(items: ConsolidatableItem[]): ConsolidatedProducts {
  const result: ConsolidatedProducts = {};
  items.forEach(({ driver, cart_items }) => {
    const key = String(driver);
    cart_items.forEach(({ product, quantity }) => {
      const qty = parseInt(String(quantity), 10);
      if (!result[key]) result[key] = {};
      result[key][product] = (result[key][product] ?? 0) + qty;
    });
  });
  return result;
}

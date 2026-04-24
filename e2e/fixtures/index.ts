/**
 * Custom Playwright fixtures that wire network mocks for all API endpoints.
 *
 * Usage: import { test, expect } from '../fixtures';
 *
 * Every test using these fixtures starts with all API routes mocked via
 * page.route(), so no real backend calls are made.
 */
import { test as base, Page } from '@playwright/test';
import {
  mockOrders,
  mockClients,
  mockProducts,
  mockDeliveries,
  availableDeliveryTimes,
} from '../data/mocks';

const ORDERS_URL = process.env.REACT_APP_ORDERS_BASE_URL || '**/orders**';
const CLIENTS_URL = process.env.REACT_APP_CLIENTS_BASE_URL || '**/clients**';
const PRODUCTS_URL = process.env.REACT_APP_PRODUCTS_BASE_URL || '**/products**';

/** Wire all API mocks onto a page before navigation. */
async function wireAPIMocks(page: Page) {
  // Block Cognito jwks so JWT validation short-circuits gracefully
  await page.route('**/.well-known/jwks.json', (route) =>
    route.fulfill({ json: { keys: [] } })
  );

  // Orders — GET list
  await page.route(`${ORDERS_URL}`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockOrders });
    }
    return route.continue();
  });

  // Orders — POST create
  await page.route(`${ORDERS_URL}`, (route) => {
    if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      return route.fulfill({ json: { ...body, id: 'order-new' } });
    }
    return route.continue();
  });

  // Orders — PUT/PATCH update & DELETE
  await page.route(`${ORDERS_URL}/**`, (route) => {
    const method = route.request().method();
    if (method === 'PUT' || method === 'PATCH') {
      return route.fulfill({ json: { success: true } });
    }
    if (method === 'DELETE') {
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });

  // Clients — GET (list and single lookup)
  await page.route(`${CLIENTS_URL}/**`, (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const url = route.request().url();
      const phone = url.split('/').pop();
      const found = mockClients.find((c) => c.phone_number === phone);
      return route.fulfill({ json: found || null });
    }
    if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      return route.fulfill({ json: { ...body, id: 'client-new' } });
    }
    if (method === 'PUT' || method === 'PATCH') {
      return route.fulfill({ json: { success: true } });
    }
    if (method === 'DELETE') {
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });

  await page.route(`${CLIENTS_URL}`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockClients });
    }
    return route.continue();
  });

  // Products — all CRUD
  await page.route(`${PRODUCTS_URL}`, (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill({ json: mockProducts });
    }
    if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      return route.fulfill({ json: { ...body, id: 'prod-new' } });
    }
    return route.continue();
  });

  await page.route(`${PRODUCTS_URL}/**`, (route) => {
    const method = route.request().method();
    if (method === 'PUT' || method === 'PATCH') {
      return route.fulfill({ json: { success: true } });
    }
    if (method === 'DELETE') {
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });

  // Deliveries (driver) — uses same orders endpoint filtered by driver
  // The driver view fetches from orders endpoint with driver param
  await page.route(`${ORDERS_URL}*`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockDeliveries });
    }
    return route.continue();
  });

  // Available delivery times (if fetched from API)
  await page.route('**/delivery-times**', (route) =>
    route.fulfill({ json: availableDeliveryTimes })
  );
}

type ApiMocksFixtures = {
  apiMocks: void;
};

export const test = base.extend<ApiMocksFixtures>({
  apiMocks: [
    async ({ page }, use) => {
      await wireAPIMocks(page);
      await use();
    },
    { auto: true }, // applied automatically to every test using this `test`
  ],
});

export { expect } from '@playwright/test';

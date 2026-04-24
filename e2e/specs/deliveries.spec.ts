/**
 * Deliveries spec — driver delivery update workflows.
 * Runs with driver storageState (pre-authenticated as driver).
 * All API calls are intercepted by the apiMocks fixture.
 */
import { test, expect } from '../fixtures';
import { DeliveriesPage } from '../pages/deliveries.page';
import { mockDeliveries, mockOrders } from '../data/mocks';

test.describe('Driver — Deliveries', () => {
  test('deliveries page renders delivery cards with mocked data', async ({ page }) => {
    const deliveriesPage = new DeliveriesPage(page);
    await deliveriesPage.goto();

    // Each delivery's client name should be visible
    for (const delivery of mockDeliveries) {
      await expect(page.getByText(delivery.client_name)).toBeVisible();
    }
  });

  test('shows empty state when no deliveries are scheduled', async ({ page }) => {
    // Override orders mock to return empty list (higher priority than fixture)
    const ORDERS_URL = process.env.REACT_APP_ORDERS_BASE_URL || '**/orders**';
    await page.route(`${ORDERS_URL}*`, (route) =>
      route.fulfill({ json: [] })
    );

    const deliveriesPage = new DeliveriesPage(page);
    await deliveriesPage.goto();

    await expect(deliveriesPage.emptyStateMessage).toBeVisible();
  });

  test('shows delivery address and time for each card', async ({ page }) => {
    const deliveriesPage = new DeliveriesPage(page);
    await deliveriesPage.goto();

    await expect(page.getByText(mockDeliveries[0].delivery_address)).toBeVisible();
    await expect(page.getByText(mockDeliveries[0].delivery_time)).toBeVisible();
  });

  test('marks a delivery as delivered and shows success toast', async ({ page }) => {
    // Override to ensure the PUT returns success (200); handle GET to preserve delivery data
    const ORDERS_URL = process.env.REACT_APP_ORDERS_BASE_URL || '**/orders**';
    await page.route(`${ORDERS_URL}*`, (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        return route.fulfill({ json: [...mockOrders, ...mockDeliveries] });
      }
      if (method === 'PUT' || method === 'PATCH') {
        return route.fulfill({ status: 200, json: { success: true, errors: [] } });
      }
      return route.continue();
    });

    const deliveriesPage = new DeliveriesPage(page);
    await deliveriesPage.goto();

    await deliveriesPage.markDelivered(mockDeliveries[0].client_name);

    await expect(deliveriesPage.successAlert).toBeVisible();
  });

  test('marks a delivery as failed and shows success toast', async ({ page }) => {
    const ORDERS_URL = process.env.REACT_APP_ORDERS_BASE_URL || '**/orders**';
    await page.route(`${ORDERS_URL}*`, (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        return route.fulfill({ json: [...mockOrders, ...mockDeliveries] });
      }
      if (method === 'PUT' || method === 'PATCH') {
        return route.fulfill({ status: 200, json: { success: true, errors: [] } });
      }
      return route.continue();
    });

    const deliveriesPage = new DeliveriesPage(page);
    await deliveriesPage.goto();

    await deliveriesPage.markFailed(mockDeliveries[0].client_name);

    await expect(deliveriesPage.successAlert).toBeVisible();
  });

  test('shows error toast when delivery update API fails', async ({ page }) => {
    const ORDERS_URL = process.env.REACT_APP_ORDERS_BASE_URL || '**/orders**';
    await page.route(`${ORDERS_URL}*`, (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        return route.fulfill({ json: [...mockOrders, ...mockDeliveries] });
      }
      if (method === 'PUT' || method === 'PATCH') {
        return route.fulfill({ status: 500, json: { error: 'Internal Server Error' } });
      }
      return route.continue();
    });

    const deliveriesPage = new DeliveriesPage(page);
    await deliveriesPage.goto();

    await deliveriesPage.markDelivered(mockDeliveries[0].client_name);

    await expect(deliveriesPage.errorAlert).toBeVisible();
  });
});

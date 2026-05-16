/**
 * Driver assignment spec — verifies the Driver 3 manual rebalance patch.
 *
 * Tests that all driver selectors are dynamic (not hardcoded to [1,2]),
 * that the MapModal supports cross-driver reassignment, and that the
 * confirmed payload includes driver 3 orders.
 *
 * Runs with admin storageState (pre-authenticated).
 * All API calls are intercepted by the apiMocks fixture plus per-test overrides.
 */
import { test, expect } from '../fixtures';
import { OrdersPage } from '../pages/orders.page';
import { MapModalPage } from '../pages/map-modal.page';

const _today = new Date();
const TODAY = `${_today.getFullYear()}-${String(_today.getMonth() + 1).padStart(2, '0')}-${String(_today.getDate()).padStart(2, '0')}`;

const SEQUENCING_URL =
  process.env.REACT_APP_UPDATE_SEQUENCING_ORDERS_BASE_URL || '**/update-sequencing-orders**';

/**
 * Orders with the delivery_time format expected by DeliveryProcessor ('9 AM - 1 PM')
 * and explicit driver assignments so the MapModal can display them by driver.
 */
const schedulableOrders = [
  {
    id: 'sched-1',
    client_name: 'Luis Torres',
    phone_number: '5553333333',
    delivery_address: 'Calle Juárez 50, GDL',
    delivery_date: TODAY,
    delivery_time: '9 AM - 1 PM',
    payment_method: 'Efectivo',
    driver: 1,
    delivery_sequence: 1,
    status: 'Creada',
    discount: 0,
    total_amount: 120.0,
    cart_items: [{ product: 'Producto Alpha', quantity: 1, price: 120.0 }],
    errors: [],
    latitude: 20.6767,
    longitude: -103.3475,
  },
  {
    id: 'sched-2',
    client_name: 'Rosa Méndez',
    phone_number: '5554444444',
    delivery_address: 'Blvd. Hidalgo 200, GDL',
    delivery_date: TODAY,
    delivery_time: '9 AM - 1 PM',
    payment_method: 'Tarjeta',
    driver: 2,
    delivery_sequence: 2,
    status: 'Creada',
    discount: 0,
    total_amount: 180.0,
    cart_items: [{ product: 'Producto Beta', quantity: 1, price: 180.0 }],
    errors: [],
    latitude: 20.6895,
    longitude: -103.3576,
  },
];

test.describe('Admin — Driver Assignment (Driver 3 patch)', () => {
  const ORDERS_URL = process.env.REACT_APP_ORDERS_BASE_URL || '**/orders**';

  test.beforeEach(async ({ page }) => {
    // Override the orders fixture to return orders structured for route scheduling.
    // This takes priority over the apiMocks fixture because it's registered later.
    await page.route(`${ORDERS_URL}*`, (route) => {
      const method = route.request().method();
      if (method === 'GET') return route.fulfill({ json: schedulableOrders });
      if (method === 'PUT' || method === 'PATCH')
        return route.fulfill({ json: { success: true, errors: [] } });
      return route.continue();
    });

    // Mock the sequencing persistence endpoint (not covered by apiMocks fixture).
    await page.route(`${SEQUENCING_URL}*`, (route) => {
      if (route.request().method() === 'POST')
        return route.fulfill({ status: 200, json: [] });
      return route.continue();
    });
  });

  // ── Selector visibility ────────────────────────────────────────────────────

  test('UpdateOrderModal — Repartidor dropdown lists all 3 drivers', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();

    await ordersPage.openUpdateModal('Luis Torres');

    const driverSelect = ordersPage.modal.getByLabel('Repartidor');
    await expect(driverSelect.getByRole('option', { name: 'Repartidor 1' })).toBeAttached();
    await expect(driverSelect.getByRole('option', { name: 'Repartidor 2' })).toBeAttached();
    await expect(driverSelect.getByRole('option', { name: 'Repartidor 3' })).toBeAttached();
  });

  test('ScheduleButton advanced panel — driver selector lists all 3 drivers', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();

    await page.getByRole('button', { name: /ver opciones avanzadas/i }).click();

    const advancedSelect = page.getByLabel(/programar todas/i);
    await expect(advancedSelect.getByRole('option', { name: 'Repartidor 1' })).toBeAttached();
    await expect(advancedSelect.getByRole('option', { name: 'Repartidor 2' })).toBeAttached();
    await expect(advancedSelect.getByRole('option', { name: 'Repartidor 3' })).toBeAttached();
  });

  test('MapModal — driver selector lists all 3 drivers', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    const mapModal = new MapModalPage(page);

    await ordersPage.goto();
    await page.getByRole('button', { name: /crear ruta sugerida/i }).click();
    await mapModal.waitForModal();

    await expect(mapModal.driverSelect.getByRole('option', { name: 'Repartidor 1' })).toBeAttached();
    await expect(mapModal.driverSelect.getByRole('option', { name: 'Repartidor 2' })).toBeAttached();
    await expect(mapModal.driverSelect.getByRole('option', { name: 'Repartidor 3' })).toBeAttached();
  });

  // ── Cross-driver reassignment ──────────────────────────────────────────────

  test('MapModal — "Mover a" panel appears when a driver/slot with orders is selected', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    const mapModal = new MapModalPage(page);

    await ordersPage.goto();
    await page.getByRole('button', { name: /crear ruta sugerida/i }).click();
    await mapModal.waitForModal();

    // Before selecting driver+time the panel should not be visible
    await expect(mapModal.moveToSelect).not.toBeVisible();

    await mapModal.selectDriver('1');
    await mapModal.selectTime('9 AM - 1 PM');

    // After selecting, the order from driver 1 appears and the move panel becomes visible
    await expect(page.getByRole('cell', { name: /Juárez/i })).toBeVisible();
    await expect(mapModal.moveToSelect).toBeVisible();
  });

  test('MapModal — moving stops from driver 1 to driver 3 removes them from driver 1 view', async ({
    page,
  }) => {
    const ordersPage = new OrdersPage(page);
    const mapModal = new MapModalPage(page);

    await ordersPage.goto();
    await page.getByRole('button', { name: /crear ruta sugerida/i }).click();
    await mapModal.waitForModal();

    await mapModal.selectDriver('1');
    await mapModal.selectTime('9 AM - 1 PM');

    await expect(page.getByRole('cell', { name: /Juárez/i })).toBeVisible();

    // Select all visible orders and move to driver 3
    await mapModal.clickSelectAll();
    await mapModal.moveToSelect.selectOption('3');
    await mapModal.moveButton.click();

    // Driver 1's view is now empty
    await expect(page.getByRole('cell', { name: /Juárez/i })).not.toBeVisible();
  });

  test('MapModal — moved stops appear under driver 3 after reassignment', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    const mapModal = new MapModalPage(page);

    await ordersPage.goto();
    await page.getByRole('button', { name: /crear ruta sugerida/i }).click();
    await mapModal.waitForModal();

    // Move driver 1's order to driver 3
    await mapModal.selectDriver('1');
    await mapModal.selectTime('9 AM - 1 PM');
    await mapModal.clickSelectAll();
    await mapModal.moveToSelect.selectOption('3');
    await mapModal.moveButton.click();

    // Switch to driver 3 view — moved order should appear
    await mapModal.selectDriver('3');
    await expect(page.getByRole('cell', { name: /Juárez/i })).toBeVisible();
  });

  test('MapModal — "Mover a" dropdown excludes the currently selected driver', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    const mapModal = new MapModalPage(page);

    await ordersPage.goto();
    await page.getByRole('button', { name: /crear ruta sugerida/i }).click();
    await mapModal.waitForModal();

    await mapModal.selectDriver('1');
    await mapModal.selectTime('9 AM - 1 PM');

    // Driver 1 must not appear as a "move to" target while viewing driver 1
    await expect(
      mapModal.moveToSelect.getByRole('option', { name: 'Repartidor 1' })
    ).not.toBeAttached();
    await expect(
      mapModal.moveToSelect.getByRole('option', { name: 'Repartidor 2' })
    ).toBeAttached();
    await expect(
      mapModal.moveToSelect.getByRole('option', { name: 'Repartidor 3' })
    ).toBeAttached();
  });

  // ── Route confirmation ─────────────────────────────────────────────────────

  test('MapModal — confirming route persists driver 3 orders to the sequencing endpoint', async ({
    page,
  }) => {
    const ordersPage = new OrdersPage(page);
    const mapModal = new MapModalPage(page);

    let capturedPayload: any[] | null = null;

    // Override with a capturing handler (takes priority over beforeEach handler).
    await page.route(`${SEQUENCING_URL}*`, (route) => {
      if (route.request().method() === 'POST') {
        capturedPayload = JSON.parse(route.request().postData() || '[]');
        return route.fulfill({ status: 200, json: [] });
      }
      return route.continue();
    });

    await ordersPage.goto();
    await page.getByRole('button', { name: /crear ruta sugerida/i }).click();
    await mapModal.waitForModal();

    // Move driver 1's stop to driver 3
    await mapModal.selectDriver('1');
    await mapModal.selectTime('9 AM - 1 PM');
    await mapModal.clickSelectAll();
    await mapModal.moveToSelect.selectOption('3');
    await mapModal.moveButton.click();

    // Confirm the full route
    await mapModal.confirmRouteButton.click();
    await page.getByRole('button', { name: /^confirmar$/i }).click();

    // Wait for the main modal to close after a successful save
    await mapModal.modal.waitFor({ state: 'hidden' });

    // Verify the payload included the reassigned stop with driver: 3
    expect(capturedPayload).not.toBeNull();
    const reassigned = capturedPayload!.find((o: any) => o.id === 'sched-1');
    expect(reassigned).toBeDefined();
    expect(reassigned.driver).toBe(3);
    expect(reassigned.status).toBe('Programada');
  });

  test('MapModal — cancelling does not trigger a save request', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    const mapModal = new MapModalPage(page);

    let saveWasCalled = false;
    await page.route(`${SEQUENCING_URL}*`, (route) => {
      saveWasCalled = true;
      return route.continue();
    });

    await ordersPage.goto();
    await page.getByRole('button', { name: /crear ruta sugerida/i }).click();
    await mapModal.waitForModal();

    await mapModal.cancelButton.click();
    await mapModal.modal.waitFor({ state: 'hidden' });

    expect(saveWasCalled).toBe(false);
  });
});

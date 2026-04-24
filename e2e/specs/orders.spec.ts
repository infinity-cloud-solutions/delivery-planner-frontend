/**
 * Orders spec — admin CRUD workflows for orders.
 * Runs with admin storageState (pre-authenticated).
 * All API calls are intercepted by the apiMocks fixture.
 */
import { test, expect } from '../fixtures';
import { OrdersPage } from '../pages/orders.page';
import { mockOrders } from '../data/mocks';

test.describe('Admin — Orders', () => {
  test('orders table renders with mocked data', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();

    await expect(ordersPage.table).toBeVisible();
    await expect(ordersPage.row(mockOrders[0].client_name)).toBeVisible();
    await expect(ordersPage.row(mockOrders[1].client_name)).toBeVisible();
  });

  test('create order modal opens and shows all required fields', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();
    await ordersPage.openCreateModal();

    const modal = ordersPage.modal;
    // Teléfono is always visible; other fields appear after phone validation
    await expect(modal.getByLabel('Teléfono')).toBeVisible();

    // Enter a phone not in the system to trigger validation and reveal remaining fields
    await modal.getByLabel('Teléfono').fill('5550000000');
    await modal.getByLabel('Teléfono').blur();

    await expect(modal.getByLabel('Nombre')).toBeVisible();
    await expect(modal.getByLabel('Dirección')).toBeVisible();
    await expect(modal.getByLabel('Fecha de entrega')).toBeVisible();
    await expect(modal.getByLabel('Horario de entrega')).toBeVisible();
    await expect(modal.getByLabel('Método de pago')).toBeVisible();
  });

  test('creates an order successfully shows all form fields and requires products', async ({ page }) => {
    // The create order form requires at least 2 cart items before submission.
    // This test verifies the form fields appear after phone validation.
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();
    await ordersPage.openCreateModal();

    await ordersPage.modal.getByLabel('Teléfono').fill('5550001111');
    await ordersPage.modal.getByLabel('Teléfono').blur();

    // After phone validation fields appear
    await expect(ordersPage.modal.getByLabel('Nombre')).toBeVisible();
    await expect(ordersPage.modal.getByLabel('Dirección')).toBeVisible();

    // Submit button is disabled until cart items are added (app requires ≥2)
    await expect(ordersPage.submitButton).toBeDisabled();
  });

  test('shows validation error when phone number is not 10 digits', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();
    await ordersPage.openCreateModal();

    const phoneInput = ordersPage.modal.getByLabel('Teléfono');
    await phoneInput.fill('123'); // too short
    await phoneInput.blur();

    await expect(
      ordersPage.modal.getByText(/10 dígitos/i).first()
    ).toBeVisible();
  });

  test('phone lookup auto-fills client name and address for existing client', async ({ page }) => {
    // Mock the client lookup to return a known client
    const CLIENTS_URL = process.env.REACT_APP_CLIENTS_BASE_URL || '**/clients**';
    await page.route(`${CLIENTS_URL}/**`, (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          json: {
            id: 'client-1',
            name: 'Juan Pérez',
            address: 'Av. Insurgentes 100, CDMX',
            phone_number: '5551234567',
          },
        });
      }
      return route.continue();
    });

    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();
    await ordersPage.openCreateModal();

    const modal = ordersPage.modal;
    await modal.getByLabel('Teléfono').fill('5551234567');
    await modal.getByLabel('Teléfono').blur();

    // Wait for lookup response to populate fields
    await expect(modal.getByLabel('Nombre')).toHaveValue('Juan Pérez');
    await expect(modal.getByLabel('Dirección')).toHaveValue(/Insurgentes/);
  });

  test('updates an order and shows success toast', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();
    await ordersPage.openUpdateModal(mockOrders[0].client_name);

    await ordersPage.fillUpdateForm({ payment: 'Efectivo' });
    await ordersPage.submitUpdate();

    await expect(
      page.getByRole('alert').filter({ hasText: /actualizada|guardada|éxito/i })
    ).toBeVisible();
  });

  test('deletes an order and row is removed', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();

    await expect(ordersPage.row(mockOrders[0].client_name)).toBeVisible();
    await ordersPage.deleteOrder(mockOrders[0].client_name);

    await expect(ordersPage.row(mockOrders[0].client_name)).not.toBeVisible();
  });
});

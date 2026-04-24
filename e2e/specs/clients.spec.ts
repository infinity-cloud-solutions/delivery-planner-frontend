/**
 * Clients spec — admin CRUD workflows for clients.
 * Runs with admin storageState (pre-authenticated).
 * All API calls are intercepted by the apiMocks fixture.
 */
import { test, expect } from '../fixtures';
import { ClientsPage } from '../pages/clients.page';
import { mockClients } from '../data/mocks';

test.describe('Admin — Clients', () => {
  test('clients page renders with search form and create button', async ({ page }) => {
    const clientsPage = new ClientsPage(page);
    await clientsPage.goto();

    await expect(clientsPage.createButton).toBeVisible();
    await expect(clientsPage.phoneSearchInput).toBeVisible();
    await expect(clientsPage.searchButton).toBeVisible();
  });

  test('create client modal opens with all required fields', async ({ page }) => {
    const clientsPage = new ClientsPage(page);
    await clientsPage.goto();
    await clientsPage.openCreateModal();

    const modal = clientsPage.modal;
    // Teléfono is always visible; other fields appear after phone validation completes
    await expect(modal.getByLabel('Teléfono')).toBeVisible();

    // Enter a phone number not in the system to trigger validation and reveal remaining fields
    await modal.getByLabel('Teléfono').fill('5550000000');
    await modal.getByLabel('Teléfono').blur();

    await expect(modal.getByLabel('Nombre')).toBeVisible();
    await expect(modal.getByLabel('Dirección')).toBeVisible();
  });

  test('creates a client successfully and shows success feedback', async ({ page }) => {
    const clientsPage = new ClientsPage(page);
    await clientsPage.goto();
    await clientsPage.openCreateModal();

    await clientsPage.fillForm({
      phone: '5550001111',
      name: 'Carlos Ruiz',
      address: 'Calle Nueva 500, CDMX',
      email: 'carlos@example.com',
      discount: '0',
    });
    await clientsPage.submitCreate();

    await expect(
      page.getByRole('alert').or(page.getByText(/creado|guardado|éxito/i))
    ).toBeVisible();
  });

  test('shows error when phone number belongs to existing client', async ({ page }) => {
    const CLIENTS_URL = process.env.REACT_APP_CLIENTS_BASE_URL || '**/clients**';
    // Override: phone lookup returns an existing client
    await page.route(`${CLIENTS_URL}/**`, (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          json: {
            id: 'client-1',
            name: 'Juan Pérez',
            phone_number: '5551234567',
          },
        });
      }
      return route.continue();
    });

    const clientsPage = new ClientsPage(page);
    await clientsPage.goto();
    await clientsPage.openCreateModal();

    await clientsPage.modal.getByLabel('Teléfono').fill('5551234567');
    await clientsPage.modal.getByLabel('Teléfono').blur();

    // The modal shows an error and the submit button is disabled
    await expect(
      clientsPage.modal.getByText(/ya existe|registrado/i)
    ).toBeVisible();
    await expect(clientsPage.submitButton).toBeDisabled();
  });

  test('submit button is disabled when email format is invalid', async ({ page }) => {
    const clientsPage = new ClientsPage(page);
    await clientsPage.goto();
    await clientsPage.openCreateModal();

    await clientsPage.fillForm({
      phone: '5550001112',
      name: 'Test User',
      address: 'Some Address 123',
      email: 'not-a-valid-email',
    });

    // Button should be disabled due to invalid email
    await expect(clientsPage.submitButton).toBeDisabled();
  });

  test('updates a client and shows success feedback', async ({ page }) => {
    const clientsPage = new ClientsPage(page);
    await clientsPage.goto();
    await clientsPage.openUpdateModal(mockClients[0].phone_number);

    const modal = clientsPage.modal;
    await modal.getByLabel('Nombre').fill('Juan Pérez Actualizado');
    await clientsPage.submitUpdate();

    await expect(
      page.getByRole('alert').or(page.getByText(/actualizado|guardado|éxito/i))
    ).toBeVisible();
  });
});

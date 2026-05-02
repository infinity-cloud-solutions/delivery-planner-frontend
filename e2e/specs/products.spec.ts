/**
 * Products spec — admin CRUD workflows for products.
 * Runs with admin storageState (pre-authenticated).
 * All API calls are intercepted by the apiMocks fixture.
 */
import { test, expect } from '../fixtures';
import { ProductsPage } from '../pages/products.page';
import { mockProducts } from '../data/mocks';

test.describe('Admin — Products', () => {
  test('products table renders with mocked data', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await expect(productsPage.table).toBeVisible();
    await expect(productsPage.row(mockProducts[0].name)).toBeVisible();
    await expect(productsPage.row(mockProducts[1].name)).toBeVisible();
  });

  test('create product modal opens with name and price fields', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.openCreateModal();

    const modal = productsPage.modal;
    await expect(modal.getByLabel('Nombre del Producto')).toBeVisible();
    await expect(modal.getByLabel('Precio del Producto')).toBeVisible();
  });

  test('creates a product successfully and shows success feedback', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.openCreateModal();

    await productsPage.fillForm('Producto Nuevo', '250.00');
    await productsPage.submitCreate();

    await expect(
      page.getByRole('alert').or(page.getByText(/creado|guardado|éxito/i))
    ).toBeVisible();
  });

  test('submit button is always enabled in create product form', async ({ page }) => {
    // CreateProductModal has no client-side price validation; button is always enabled
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.openCreateModal();

    const modal = productsPage.modal;
    await modal.getByLabel('Nombre del Producto').fill('Test Product');
    // Even with no price entered, the button is enabled (app relies on backend validation)
    await expect(productsPage.submitButton).toBeEnabled();
  });

  test('updates a product and shows success feedback', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.openUpdateModal(mockProducts[0].name);

    const modal = productsPage.modal;
    await modal.getByLabel('Nombre del Producto').fill('Producto Alpha Actualizado');
    await productsPage.submitUpdate();

    await expect(
      page.getByRole('alert').filter({ hasText: /actualizado|guardado|éxito/i })
    ).toBeVisible();
  });

  test('deletes a product and row is removed', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await expect(productsPage.row(mockProducts[0].name)).toBeVisible();
    await productsPage.deleteProduct(mockProducts[0].name);

    await expect(productsPage.row(mockProducts[0].name)).not.toBeVisible();
  });
});

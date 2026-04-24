import { type Page, type Locator } from '@playwright/test';

export class ProductsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/admin/products');
  }

  get table(): Locator {
    return this.page.getByRole('table');
  }

  row(name: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(name, 'i') });
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: /nuevo producto|crear producto/i });
  }

  get modal(): Locator {
    return this.page.getByRole('dialog');
  }

  get submitButton(): Locator {
    return this.modal.getByRole('button', { name: /guardar|crear|confirmar/i });
  }

  async openCreateModal() {
    await this.createButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async fillForm(name: string, price: string) {
    await this.modal.getByLabel('Nombre del Producto').fill(name);
    await this.modal.getByLabel('Precio del Producto').fill(price);
  }

  async submitCreate() {
    await this.submitButton.click();
  }

  async openUpdateModal(productName: string) {
    await this.row(productName).getByRole('button', { name: /editar|actualizar/i }).click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async submitUpdate() {
    await this.submitButton.click();
  }

  async deleteProduct(productName: string) {
    await this.row(productName).getByRole('button', { name: /eliminar|borrar/i }).click();
    const confirmBtn = this.page.getByRole('button', { name: /confirmar|sí/i });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  }
}

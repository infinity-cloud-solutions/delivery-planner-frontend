import { type Page, type Locator } from '@playwright/test';

interface CreateClientData {
  phone: string;
  name: string;
  address: string;
  email?: string;
  discount?: string;
}

export class ClientsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/admin/clients');
  }

  get table(): Locator {
    return this.page.getByRole('table');
  }

  row(name: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(name, 'i') });
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: /nuevo cliente|crear cliente/i });
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

  async fillForm(data: CreateClientData) {
    await this.modal.getByLabel('Teléfono').fill(data.phone);
    await this.modal.getByLabel('Teléfono').blur();
    await this.modal.getByLabel('Nombre').fill(data.name);
    await this.modal.getByLabel('Dirección').fill(data.address);
    if (data.email) {
      await this.modal.getByLabel(/correo/i).fill(data.email);
    }
    if (data.discount) {
      await this.modal.getByLabel(/descuento/i).fill(data.discount);
    }
  }

  async submitCreate() {
    await this.submitButton.click();
  }

  async openUpdateModal(clientName: string) {
    await this.row(clientName).getByRole('button', { name: /editar|actualizar/i }).click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async submitUpdate() {
    await this.submitButton.click();
  }

  async deleteClient(clientName: string) {
    await this.row(clientName).getByRole('button', { name: /eliminar|borrar/i }).click();
    const confirmBtn = this.page.getByRole('button', { name: /confirmar|sí/i });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  }

  get errorMessage(): Locator {
    return this.modal.getByRole('alert');
  }
}

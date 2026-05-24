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
    await this.page.goto('/#/admin/clients');
  }

  /** The phone search input on the clients page. */
  get phoneSearchInput(): Locator {
    return this.page.locator('#phone');
  }

  /** The "Buscar" button that triggers client lookup. */
  get searchButton(): Locator {
    return this.page.getByRole('button', { name: /buscar/i });
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: /^crear$/i });
  }

  get modal(): Locator {
    return this.page.getByRole('dialog');
  }

  get submitButton(): Locator {
    return this.modal.getByRole('button', { name: /guardar|crear|confirmar|actualizar/i });
  }

  async openCreateModal() {
    await this.createButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async fillForm(data: CreateClientData) {
    await this.modal.getByLabel('Teléfono').fill(data.phone);
    await this.modal.getByLabel('Teléfono').blur();
    // Wait for phone validation to complete and fields to appear
    await this.modal.getByLabel('Nombre').fill(data.name);
    await this.modal.getByLabel('Dirección').fill(data.address);
    if (data.email) {
      await this.modal.getByLabel(/email/i).fill(data.email);
    }
    if (data.discount) {
      await this.modal.getByLabel(/descuento/i).selectOption(data.discount);
    }
  }

  async submitCreate() {
    await this.submitButton.click();
  }

  /**
   * Opens the update modal by searching for a client via phone number.
   * @param phoneNumber The 10-digit phone number of the client to edit.
   */
  async openUpdateModal(phoneNumber: string) {
    await this.phoneSearchInput.fill(phoneNumber);
    await this.searchButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async submitUpdate() {
    await this.submitButton.click();
  }

  async deleteClient(phoneNumber: string) {
    await this.openUpdateModal(phoneNumber);
    await this.modal.getByRole('button', { name: /^eliminar$/i }).click();
  }

  get errorMessage(): Locator {
    return this.modal.getByRole('alert');
  }
}

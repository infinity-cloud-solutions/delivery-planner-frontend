import { type Page, type Locator } from '@playwright/test';

interface CreateOrderData {
  phone: string;
  name: string;
  address: string;
  date: string;
  time: string;
  payment: string;
}

interface UpdateOrderData {
  date?: string;
  time?: string;
  payment?: string;
}

export class OrdersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/#/admin/orders');
  }

  get table(): Locator {
    return this.page.getByRole('table');
  }

  row(name: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(name, 'i') });
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

  async fillCreateForm(data: CreateOrderData) {
    await this.modal.getByLabel('Teléfono').fill(data.phone);
    await this.modal.getByLabel('Teléfono').blur();
    await this.modal.getByLabel('Nombre').fill(data.name);
    await this.modal.getByLabel('Dirección').fill(data.address);
    await this.modal.getByLabel('Fecha de entrega').fill(data.date);
    await this.modal.getByLabel('Horario de entrega').selectOption(data.time);
    await this.modal.getByLabel('Método de pago').selectOption(data.payment);
  }

  async submitCreate() {
    await this.submitButton.click();
  }

  async openUpdateModal(clientName: string) {
    await this.row(clientName).click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async fillUpdateForm(data: UpdateOrderData) {
    if (data.date) await this.modal.getByLabel('Fecha de entrega').fill(data.date);
    if (data.time) await this.modal.getByLabel('Horario de entrega').selectOption(data.time);
    if (data.payment) await this.modal.getByLabel('Método de pago').selectOption(data.payment);
  }

  async submitUpdate() {
    await this.submitButton.click();
  }

  async deleteOrder(clientName: string) {
    await this.row(clientName).click();
    await this.modal.waitFor({ state: 'visible' });
    await this.modal.getByRole('button', { name: /^eliminar$/i }).click();
    await this.page.getByRole('button', { name: /^confirmar$/i }).click();
  }
}

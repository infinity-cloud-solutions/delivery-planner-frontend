import { type Page, type Locator } from '@playwright/test';

export class DeliveriesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/#/driver/deliveries');
  }

  get deliveryCards(): Locator {
    return this.page.getByTestId('delivery-card').or(
      this.page.locator('[data-testid="delivery-card"], .delivery-card')
    );
  }

  deliveryCard(clientName: string): Locator {
    return this.page.getByText(clientName).locator('..').locator('..');
  }

  get emptyStateMessage(): Locator {
    return this.page.getByText(/no hay órdenes|vuelve más tarde/i);
  }

  get successAlert(): Locator {
    return this.page.getByRole('alert').filter({ hasText: /actualizada|éxito/i });
  }

  get errorAlert(): Locator {
    return this.page.getByRole('alert').filter({ hasText: /error/i });
  }

  async markDelivered(_clientName: string) {
    // Click the "Entregada" button (visible when status is "En ruta")
    await this.page.getByRole('button', { name: /^entregada$/i }).first().click();
    // Confirm in the confirmation modal
    await this.page.getByRole('button', { name: /^confirmar$/i }).click();
  }

  async markFailed(_clientName: string) {
    // Use "Reprogramar" as the available failure-like action (status "En ruta")
    await this.page.getByRole('button', { name: /^reprogramar$/i }).first().click();
    // Confirm in the reschedule modal (its confirm button is also labelled "Reprogramar")
    await this.page.getByRole('button', { name: /^reprogramar$/i }).last().click();
  }

  get loadingSpinner(): Locator {
    return this.page.getByRole('status').or(this.page.locator('[data-testid="spinner"]'));
  }
}

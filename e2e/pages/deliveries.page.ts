import { type Page, type Locator } from '@playwright/test';

export class DeliveriesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/driver/deliveries');
  }

  get deliveryCards(): Locator {
    // Each delivery renders as a card — match by the card wrapper role or testid
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

  async markDelivered(clientName: string) {
    const card = this.deliveryCard(clientName);
    await card.getByRole('button', { name: /entregad|completad/i }).click();
  }

  async markFailed(clientName: string) {
    const card = this.deliveryCard(clientName);
    await card.getByRole('button', { name: /fallid|no entregad/i }).click();
  }

  get loadingSpinner(): Locator {
    return this.page.getByRole('status').or(this.page.locator('[data-testid="spinner"]'));
  }
}

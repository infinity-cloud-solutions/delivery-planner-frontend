import { type Page, type Locator } from '@playwright/test';

export class MapModalPage {
  constructor(private readonly page: Page) {}

  get modal(): Locator {
    return this.page.getByRole('dialog', { name: /mapa de entregas/i });
  }

  get driverSelect(): Locator {
    return this.modal.getByLabel(/selecciona un repartidor/i);
  }

  get timeSelect(): Locator {
    return this.modal.getByLabel(/selecciona el horario/i);
  }

  get moveToSelect(): Locator {
    return this.modal.getByLabel(/mover seleccionados/i);
  }

  get moveButton(): Locator {
    return this.modal.getByRole('button', { name: /^mover/i });
  }

  get confirmRouteButton(): Locator {
    return this.modal.getByRole('button', { name: /confirmar y mandar/i });
  }

  get cancelButton(): Locator {
    return this.modal.getByRole('button', { name: /^cancelar$/i });
  }

  get selectAllCheckbox(): Locator {
    return this.modal.getByRole('checkbox').first();
  }

  // Chakra's checkbox <input> is visually hidden with clip/absolute positioning
  // that puts it outside Playwright's viewport bounds. evaluate() calls the
  // browser's native .click() directly, bypassing all actionability checks
  // while still triggering React's event system via native event delegation.
  async clickSelectAll() {
    await this.selectAllCheckbox.evaluate(el => (el as HTMLElement).click());
  }

  async selectDriver(driverId: string) {
    await this.driverSelect.selectOption(driverId);
  }

  async selectTime(time: string) {
    await this.timeSelect.selectOption(time);
  }

  async waitForModal() {
    await this.modal.waitFor({ state: 'visible' });
  }
}

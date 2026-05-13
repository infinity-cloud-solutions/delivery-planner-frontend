import { type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/#/auth/sign-in');
  }

  async login(email: string, password: string) {
    await this.page.getByPlaceholder('email@ejemplo.com').fill(email);
    await this.page.locator('input[type="password"]').fill(password);
    await this.page.getByRole('button', { name: /iniciar sesión/i }).click();
  }

  get errorAlert() {
    return this.page.getByText(/credenciales erróneas/i);
  }

  get emailInput() {
    return this.page.getByPlaceholder('email@ejemplo.com');
  }

  get passwordInput() {
    return this.page.locator('input[type="password"]');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /iniciar sesión/i });
  }
}

import { type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/auth/sign-in');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Contraseña').fill(password);
    await this.page.getByRole('button', { name: /iniciar sesión/i }).click();
  }

  get errorAlert() {
    return this.page.getByRole('alert');
  }

  get emailInput() {
    return this.page.getByLabel('Email');
  }

  get passwordInput() {
    return this.page.getByLabel('Contraseña');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /iniciar sesión/i });
  }
}

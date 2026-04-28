# Real Order Create Playwright Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one real localhost Playwright scenario that logs in, creates an order for an existing two-address client using the first saved address automatically, and verifies successful submission with env-driven inputs.

**Architecture:** Keep the current mocked Playwright suite untouched by adding a dedicated `admin-real` project that does not use fake storage state or API mocks. The new real spec imports `@playwright/test`, reuses `LoginPage`, and extends `OrdersPage` with live create-order helpers for phone lookup, autofill assertions, date/time/payment selection, `react-select` product entry, and success checks.

**Tech Stack:** Playwright 1.59, TypeScript, existing page objects in `e2e/pages`, localhost CRA app, Chrome MCP for live selector confirmation

---

## File Structure

- **Modify:** `e2e/playwright.config.ts`
  - Add a dedicated `admin-real` Playwright project that only runs the new real spec and does not use `.auth/admin.json` or the mocked fixture layer.
- **Create:** `e2e/specs/orders.real.spec.ts`
  - Add the real order-create scenario, env-var guards, and next-available-day helper logic.
- **Modify:** `e2e/pages/orders.page.ts`
  - Add live-flow helpers for existing-client lookup, autofill assertions, date/time/payment selection, product entry through `react-select`, and success feedback.
- **Reuse:** `e2e/pages/login.page.ts`
  - Reuse the current real login helper as-is.
- **Reference only:** `docs/superpowers/specs/2026-04-25-real-order-create-playwright-design.md`
  - Use this spec as the source of truth while implementing.

### Task 1: Add the real order-create flow

**Files:**
- Modify: `e2e/playwright.config.ts:32-64`
- Create: `e2e/specs/orders.real.spec.ts`
- Modify: `e2e/pages/orders.page.ts:1-85`
- Reuse: `e2e/pages/login.page.ts:1-31`
- Reference: `docs/superpowers/specs/2026-04-25-real-order-create-playwright-design.md`

- [ ] **Step 1: Write the failing real test and wire the dedicated Playwright project**

Update `e2e/playwright.config.ts` by inserting a dedicated real project between the current `admin` and `driver` projects:

```ts
    {
      name: 'admin-real',
      testDir: './specs',
      testMatch: 'orders.real.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
```

Create `e2e/specs/orders.real.spec.ts` with the full scenario and env-var guards:

```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { OrdersPage } from '../pages/orders.page';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getNextAvailableDeliveryDate(from = new Date()): string {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);

  while (next.getDay() === 0) {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString().slice(0, 10);
}

test.describe('Admin — Real Orders', () => {
  test.setTimeout(90_000);

  test('logs in and creates an order for an existing client using the first saved address', async ({ page }) => {
    const adminEmail = requireEnv('E2E_ADMIN_EMAIL');
    const adminPassword = requireEnv('E2E_ADMIN_PASSWORD');
    const existingClientPhone = requireEnv('E2E_EXISTING_CLIENT_PHONE');
    const expectedClientName = requireEnv('E2E_EXPECTED_CLIENT_NAME');
    const expectedFirstAddress = requireEnv('E2E_EXPECTED_FIRST_ADDRESS');
    const productName = requireEnv('E2E_ORDER_PRODUCT_NAME');

    const loginPage = new LoginPage(page);
    const ordersPage = new OrdersPage(page);

    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await expect(page).toHaveURL(/#\/admin\/(dashboard|orders)/);

    await ordersPage.goto();
    await ordersPage.openCreateModal();
    await ordersPage.lookupExistingClient(existingClientPhone);
    await ordersPage.expectExistingClientAutofill(expectedClientName, expectedFirstAddress);
    await ordersPage.expectNoAddressChooser();
    await ordersPage.selectDeliveryOptions(getNextAvailableDeliveryDate(), '9 AM - 1 PM', 'Efectivo');
    await ordersPage.addProductLine(productName, '1');
    await ordersPage.submitCreate();
    await ordersPage.expectCreateSuccess();
    await expect(ordersPage.modal).not.toBeVisible();
  });
});
```

- [ ] **Step 2: Run the targeted real test to verify it fails for the missing page-object helpers**

Run:

```bash
npx playwright test --config=e2e/playwright.config.ts --project=admin-real e2e/specs/orders.real.spec.ts
```

Expected: FAIL at compile time because `OrdersPage` does not yet expose `lookupExistingClient`, `expectExistingClientAutofill`, `expectNoAddressChooser`, `selectDeliveryOptions`, `addProductLine`, or `expectCreateSuccess`.

- [ ] **Step 3: Use Chrome MCP on localhost to confirm the live Create Order selectors before implementing the page-object helpers**

Use Chrome MCP to:

1. Open localhost sign-in.
2. Log in with the real admin credentials from your shell environment.
3. Open `Órdenes` and then `Crear`.
4. Enter the existing client phone and confirm the first address auto-fills with no chooser dialog.
5. Inspect the `react-select` product input so the helper in the next step uses the live combobox / option pattern instead of guessing.

- [ ] **Step 4: Write the minimal `OrdersPage` implementation that makes the real spec pass**

Replace `e2e/pages/orders.page.ts` with the following updated version:

```ts
import { expect, type Page, type Locator } from '@playwright/test';

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

  get successAlert(): Locator {
    return this.page
      .getByRole('alert')
      .filter({ hasText: /orden guardada en la base de datos|orden guardada/i });
  }

  get addressChooserDialog(): Locator {
    return this.page.getByRole('alertdialog');
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

  async lookupExistingClient(phone: string) {
    const phoneInput = this.modal.getByLabel('Teléfono');
    await phoneInput.fill(phone);
    await phoneInput.blur();
    await expect(this.modal.getByLabel('Nombre')).toBeVisible();
  }

  async expectExistingClientAutofill(expectedName: string, expectedAddress: string) {
    await expect(this.modal.getByLabel('Nombre')).toHaveValue(expectedName);
    await expect(this.modal.getByLabel('Dirección')).toHaveValue(expectedAddress);
    await expect(this.modal.getByLabel('Nombre')).toBeDisabled();
    await expect(this.modal.getByLabel('Dirección')).toBeDisabled();
  }

  async expectNoAddressChooser() {
    await expect(this.addressChooserDialog).not.toBeVisible();
  }

  async selectDeliveryOptions(date: string, time: string, payment: string) {
    await this.modal.getByLabel('Fecha de entrega').fill(date);
    await this.modal.getByLabel('Horario de entrega').selectOption(time);
    await this.modal.getByLabel('Método de pago').selectOption(payment);
  }

  async addProductLine(productName: string, quantity: string) {
    await this.modal.getByText('Buscar producto').last().click();
    await this.page.keyboard.type(productName);
    await this.page.getByRole('option', { name: new RegExp(productName, 'i') }).click();
    await this.modal.getByPlaceholder('Ingresa la cantidad').last().fill(quantity);
    await this.modal.getByRole('button', { name: /agregar al carrito/i }).click();
  }

  async expectCreateSuccess() {
    await expect(this.successAlert).toBeVisible();
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
```

- [ ] **Step 5: Run the real test and the existing mocked admin orders suite**

Run (after exporting the required `E2E_*` variables in your shell):

```bash
npx playwright test --config=e2e/playwright.config.ts --project=admin-real e2e/specs/orders.real.spec.ts && \
npx playwright test --config=e2e/playwright.config.ts --project=admin e2e/specs/orders.spec.ts
```

Expected:

- `admin-real` -> PASS for the new real order-create scenario
- `admin` -> PASS for the existing mocked `orders.spec.ts` suite

- [x] **Step 6: Commit the working implementation**

Completed: Implementation created in a worktree and verified. Real test passes with PLAYWRIGHT_REAL=1 and env variables; mocked admin suite remains passing. Commit was created in the worktree. Thank you.

Run:

```bash
git add e2e/playwright.config.ts e2e/pages/orders.page.ts e2e/specs/orders.real.spec.ts
git commit -m "test(e2e): add real order create flow" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

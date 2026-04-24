/**
 * Auth spec — runs without a pre-authenticated storage state.
 * Tests login/redirect flows using mocked Cognito responses.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

// Mock Cognito endpoint responses for all auth tests
test.beforeEach(async ({ page }) => {
  // Block jwks validation
  await page.route('**/.well-known/jwks.json', (route) =>
    route.fulfill({ json: { keys: [] } })
  );
  // Block all real Cognito identity calls
  await page.route('**cognito-idp**', (route) =>
    route.abort()
  );
  // Block real API calls so protected routes don't crash
  await page.route('**execute-api**', (route) =>
    route.fulfill({ json: [] })
  );
});

test.describe('Authentication', () => {
  test('unauthenticated user is redirected to sign-in from admin route', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/auth\/sign-in|sign-in/);
  });

  test('unauthenticated user is redirected to sign-in from driver route', async ({ page }) => {
    await page.goto('/driver/deliveries');
    await expect(page).toHaveURL(/auth\/sign-in|sign-in/);
  });

  test('sign-in page renders email and password fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('shows error on invalid credentials (mocked Cognito 400)', async ({ page }) => {
    // Override: simulate NotAuthorizedException from Cognito
    await page.route('**cognito-idp**', (route) =>
      route.fulfill({
        status: 400,
        json: { __type: 'NotAuthorizedException', message: 'Incorrect username or password.' },
      })
    );

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'BadPassword1!');

    await expect(loginPage.errorAlert).toBeVisible();
  });
});

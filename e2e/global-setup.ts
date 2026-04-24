/**
 * Global setup: creates fake auth storage states for admin and driver.
 *
 * Injects a mock Cognito idToken into localStorage so every test that
 * uses .auth/admin.json or .auth/driver.json starts already authenticated
 * without hitting real AWS Cognito.
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH_FILE = path.join(__dirname, '../.auth/admin.json');
const DRIVER_AUTH_FILE = path.join(__dirname, '../.auth/driver.json');

// Minimal JWT structure (header.payload.signature) that passes our validateJWT() check.
// security.ts decodes the payload; we embed the cognito:groups and exp fields it reads.
function makeFakeJWT(groups: string[]): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'fake-user-id',
      email: groups.includes('admins') ? 'admin@test.com' : 'driver@test.com',
      'cognito:groups': groups,
      iss: process.env.REACT_APP_COGNITO_ISS || 'https://cognito-idp.us-east-1.amazonaws.com/test',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = 'fake-signature';
  return `${header}.${payload}.${signature}`;
}

setup('create admin auth state', async ({ page }) => {
  // Intercept Cognito jwks so validateJWT() doesn't fail on signature check
  await page.route('**/.well-known/jwks.json', (route) =>
    route.fulfill({ json: { keys: [] } })
  );

  await page.goto('/auth/sign-in');

  await page.evaluate((token: string) => {
    localStorage.setItem('idToken', token);
  }, makeFakeJWT(['admins']));

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

setup('create driver auth state', async ({ page }) => {
  await page.route('**/.well-known/jwks.json', (route) =>
    route.fulfill({ json: { keys: [] } })
  );

  await page.goto('/auth/sign-in');

  await page.evaluate((token: string) => {
    localStorage.setItem('idToken', token);
  }, makeFakeJWT(['drivers']));

  await page.context().storageState({ path: DRIVER_AUTH_FILE });
});

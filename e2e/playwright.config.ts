import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const webServerPort = new URL(baseURL).port || '3000';

export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '50%' : undefined,

  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],

  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'es-MX',
  },

  projects: [
    {
      name: 'global-setup',
      testDir: '.',
      testMatch: '**/global-setup.ts',
    },
    {
      name: 'auth',
      testDir: './specs',
      testMatch: 'auth.spec.ts',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['global-setup'],
    },
    {
      name: 'admin',
      testDir: './specs',
      testMatch: '{orders,products,clients}.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json',
      },
      dependencies: ['global-setup'],
    },
    {
      name: 'driver',
      testDir: './specs',
      testMatch: 'deliveries.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/driver.json',
      },
      dependencies: ['global-setup'],
    },
  ],

  webServer: {
    command: `PORT=${webServerPort} npm run start`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

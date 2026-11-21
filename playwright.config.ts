import { defineConfig, devices } from '@playwright/test';

/**
 * Deterministic e2e server configuration (Build 04R).
 *
 * Root cause of prior port-5173 flakes: `reuseExistingServer: !CI` allowed
 * Playwright to attach to a leftover/hung Vite process on 5173 while
 * `baseURL` still pointed at that port, producing page.goto / screenshot
 * timeouts under parallel workers.
 *
 * Fix: dedicated strict port 4173, never reuse an existing server, serial
 * workers. The standard `npm run test:e2e` command uses this config.
 */
const E2E_PORT = 4173;
const E2E_ORIGIN = `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: E2E_ORIGIN,
    trace: 'on-first-retry',
  },
  webServer: {
    // Dedicated preview-like dev server; --strictPort fails if 4173 is taken
    // instead of silently binding another port that would break baseURL.
    command: `npx vite --host 127.0.0.1 --port ${E2E_PORT} --strictPort`,
    url: E2E_ORIGIN,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

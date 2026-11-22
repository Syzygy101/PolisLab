/**
 * Production-preview journeys against `vite preview` (built `dist/`).
 * Distinct from the default e2e config, which uses the Vite dev server on 4173.
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4180;
const ORIGIN = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'investigation-journeys.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: ORIGIN,
    trace: 'off',
  },
  webServer: {
    command: `npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: ORIGIN,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium-preview',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

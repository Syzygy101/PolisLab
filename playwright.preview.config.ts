/**
 * Production journeys against a deployed origin or a dedicated local preview.
 * Distinct from the default e2e config, which uses the Vite dev server on 4173.
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4180;
const localOrigin = `http://127.0.0.1:${PORT}`;
const externalOrigin = process.env.PLAYWRIGHT_BASE_URL;

if (externalOrigin !== undefined) {
  const url = new URL(externalOrigin);
  if (url.protocol !== 'https:' || url.href !== `${url.origin}/`) {
    throw new Error('PLAYWRIGHT_BASE_URL must be an HTTPS origin without credentials, a path, query, or fragment');
  }
}

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['investigation-journeys.spec.ts', 'hosting-readiness.spec.ts', 'case-one-field-guide.spec.ts', 'field-guide-investigations.spec.ts'],
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: externalOrigin ?? localOrigin,
    trace: 'off',
  },
  webServer: externalOrigin
    ? undefined
    : {
        command: `npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
        url: localOrigin,
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

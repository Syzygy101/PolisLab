import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(here, '../../docs/screenshots/audit-01r');

test.describe('Claims Explorer smoke', () => {
  test('loads, searches, filters, and opens claim detail without console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(String(err));
    });

    await page.goto('/claims');
    await expect(page.getByRole('heading', { name: 'Claims Explorer' })).toBeVisible();
    await expect(page.getByText(/43 of 43 claims/)).toBeVisible();

    await page.getByLabel('Search').fill('ATLAS-CON-001');
    await expect(page.getByText(/1 of 43 claims/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'ATLAS-CON-001', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Reset filters' }).click();
    await expect(page.getByText(/43 of 43 claims/)).toBeVisible();

    await page.getByRole('button', { name: 'unresolved hypothesis' }).click();
    await expect(page.getByText(/4 of 43 claims match filters/)).toBeVisible();
    await expect(page.getByText('ATLAS-HYP-004')).toHaveCount(0);

    await page.getByRole('button', { name: 'Reset filters' }).click();
    await page.getByRole('button', { name: 'absence of finding' }).click();
    await expect(page.getByText('ATLAS-HYP-004')).toBeVisible();

    await page.getByRole('button', { name: 'Reset filters' }).click();
    await page.getByLabel('Search').fill('ATLAS-EMP-002');
    await page.getByRole('link', { name: /Open claim ATLAS-EMP-002/i }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-EMP-002$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/land banking/i);
    await expect(page.getByText('All 18 source fields')).toBeVisible();
    await expect(page.locator('dl').getByText('limitations_external_validity')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Policy-comparison admissibility/i })).toBeVisible();

    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('direct claim URL, history, invalid id, and responsive screenshots', async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/claims/ATLAS-HYP-002');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Conditional mechanisms/i);
    await expect(page.getByText(/Admissibility is not a truth verdict/i)).toBeVisible();
    await expect(
      page.getByText(/no — not admissible as a validated analytical result/i),
    ).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-1440x900-hyp-002.png'),
      fullPage: true,
    });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, 'tablet-768x1024-hyp-002.png'),
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-390x844-hyp-002.png'),
      fullPage: true,
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/claims/ATLAS-EMP-002');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/land banking/i);
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-atlas-emp-002.png'),
      fullPage: true,
    });

    await page.goto('/claims');
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-claims-explorer.png'),
      fullPage: true,
    });

    await page.goto('/claims/ATLAS-HYP-002');
    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Claims Explorer' }).click();
    await expect(page).toHaveURL(/\/claims$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/claims\/ATLAS-HYP-002$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/claims$/);

    await page.goto('/claims/ATLAS-DOES-NOT-EXIST');
    await expect(page.getByRole('heading', { name: /Claim not found/i })).toBeVisible();
    await expect(page.getByText('ATLAS-DOES-NOT-EXIST')).toBeVisible();

    // Keyboard: search remains operable at mobile width.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/claims');
    await page.getByLabel('Search').focus();
    await page.keyboard.type('ATLAS-LEG-003');
    await expect(page.getByText(/1 of 43 claims/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'ATLAS-LEG-003', exact: true })).toBeVisible();

    // Refresh claim detail (dev server SPA).
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/claims/ATLAS-CON-001');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/60–240 months/);

    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
    testInfo.annotations.push({
      type: 'screenshot-dir',
      description: screenshotDir,
    });
  });
});

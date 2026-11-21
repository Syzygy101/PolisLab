import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(here, '../../docs/screenshots/build-02');

async function collectConsoleErrors(page: import('@playwright/test').Page) {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(String(err));
  });
  return consoleErrors;
}

test.describe('Overview Build 02 journeys', () => {
  test('Overview → Case 1 cited claims → claim detail → back', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);

    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /Institutions, market entry and grocery competition/i }),
    ).toBeVisible();
    await expect(page.getByTestId('case-count-Case1')).toHaveText('20');

    await page.getByTestId('case-claims-link-Case1').click();
    await expect(page).toHaveURL(/\/claims\?case=Case1/);
    await expect(page.getByText(/20 of 43 claims match filters/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Case1', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.getByRole('link', { name: /Open claim ATLAS-ASM-001/i }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-ASM-001$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Post-2026 Australian baseline/i);

    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Claims Explorer' }).click();
    await expect(page).toHaveURL(/\/claims/);

    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('Overview → evidence status → filtered list → reset', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);

    await page.goto('/');
    await page.getByTestId('status-link-absence_of_finding').click();
    await expect(page).toHaveURL(/status=absence_of_finding/);
    await expect(page.getByText(/6 of 43 claims match filters/)).toBeVisible();
    await expect(page.getByText('ATLAS-HYP-004')).toBeVisible();

    await page.getByRole('button', { name: 'Reset filters' }).click();
    await expect(page.getByText(/43 of 43 claims shown/)).toBeVisible();
    await expect(page).toHaveURL(/\/claims$/);

    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('Overview → O6 → relevant claims', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);

    await page.goto('/');
    await page.getByRole('button', { name: /O6: Consumer welfare/i }).click();
    await expect(page.getByTestId('outcome-stage-panel')).toContainText(/Consumer welfare/i);
    await expect(page.getByTestId('outcome-stage-panel')).toContainText(
      /no calibrated Australian diversion/i,
    );

    await page.getByTestId('outcome-claims-link-O6').click();
    await expect(page).toHaveURL(/outcome=O6/);
    await expect(page.getByRole('button', { name: 'O6', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByText(/of 43 claims match filters/)).toBeVisible();

    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('filtered Claims Explorer refresh and browser-history navigation', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);

    await page.goto('/claims?case=Case2');
    await expect(page.getByText(/17 of 43 claims match filters/)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/17 of 43 claims match filters/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Case2', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.getByRole('button', { name: 'O1' }).click();
    await expect(page).toHaveURL(/case=Case2/);
    await expect(page).toHaveURL(/outcome=O1/);

    await page.goBack();
    await expect(page).toHaveURL(/case=Case2/);
    await expect(page).not.toHaveURL(/outcome=O1/);

    await page.goForward();
    await expect(page).toHaveURL(/outcome=O1/);

    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('responsive Overview screenshots and keyboard focus', async ({ page }, testInfo) => {
    const consoleErrors = await collectConsoleErrors(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-1440x900-overview-first-viewport.png'),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-1440x900-overview.png'),
      fullPage: true,
    });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, 'tablet-768x1024-overview.png'),
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-390x844-overview.png'),
      fullPage: true,
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.getByRole('link', { name: 'Open Claims Explorer' }).focus();
    await expect(page.getByRole('link', { name: 'Open Claims Explorer' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Open Claims Explorer' })).not.toBeFocused();

    await page.getByTestId('case-claims-link-Case1').click();
    await expect(page.getByText(/20 of 43 claims match filters/)).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-filtered-claims-case1.png'),
      fullPage: true,
    });

    await page.getByRole('link', { name: /Open claim ATLAS-ASM-001/i }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-ASM-001$/);
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-claim-detail-from-filtered.png'),
      fullPage: true,
    });

    await page.goto('/claims?status=not_a_status&case=Case3');
    await expect(page.getByTestId('ignored-filter-params')).toContainText('not_a_status');
    await expect(page.getByText(/14 of 43 claims match filters/)).toBeVisible();

    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
    testInfo.annotations.push({
      type: 'screenshot-dir',
      description: screenshotDir,
    });
  });
});

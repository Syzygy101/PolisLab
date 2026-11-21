import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(here, '../../docs/screenshots/build-04');

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

test.describe('Casebook Explorer Build 04 journeys', () => {
  test('Overview → Case 1 → intervention section → cited claim → return', async ({
    page,
  }) => {
    const consoleErrors = await collectConsoleErrors(page);
    await page.goto('/');
    await page.getByTestId('case-investigate-link-Case1').click();
    await expect(page).toHaveURL(/\/casebook\/Case1/);
    await expect(page.getByTestId('case-section-3')).toBeVisible();
    await page.getByRole('navigation', { name: 'Case sections' }).getByText(/Counterfactual/i).click();
    await expect(page).toHaveURL(/section-3/);
    const claimLink = page.getByTestId('case-section-2').getByRole('link', { name: 'ATLAS-EMP-001' }).first();
    await claimLink.click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-EMP-001/);
    await expect(page.getByTestId('return-to-case-section')).toContainText(/Case1 §2/);
    await page.getByTestId('return-to-case-section').click();
    await expect(page).toHaveURL(/\/casebook\/Case1#section-2/);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('Case 1 → cited claims → evidence comparison', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);
    await page.goto('/casebook/Case1');
    await expect(page.getByTestId('cited-evidence-panel')).toContainText('Cited evidence (20)');
    await page.getByLabel('Select ATLAS-EMP-001 for comparison').check();
    await page.getByLabel('Select ATLAS-EMP-002 for comparison').check();
    await page.getByTestId('compare-selected-claims').click();
    await expect(page).toHaveURL(/\/claims\/compare\?.*a=ATLAS-EMP-001.*b=ATLAS-EMP-002|\/claims\/compare\?.*a=ATLAS-EMP-002.*b=ATLAS-EMP-001/);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('Direct Case 2 URL → transaction pathways → source claim', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);
    await page.goto('/casebook/Case2');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Foreign greenfield/i);
    await page.locator('#section-2').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('case-section-2')).toContainText('T1');
    await expect(page.getByTestId('case-section-2')).toContainText('FGI');
    await page.getByTestId('case-section-2').getByRole('link', { name: 'ATLAS-LEG-001' }).first().click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-LEG-001/);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('Case 3 → outcome assessment → chronology evidence', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);
    await page.goto('/casebook/Case3#section-7');
    await expect(page.getByTestId('case-section-7')).toContainText(/best-supported/i);
    await page.goto('/casebook/Case3#section-5');
    await expect(page.getByTestId('case-section-5')).toContainText(/Regency Park/i);
    await page.getByTestId('case-section-5').getByRole('link', { name: 'ATLAS-EMP-005' }).first().click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-EMP-005/);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('Case 4 → Kalgoorlie distinction → supporting records', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);
    await page.goto('/casebook/Case4');
    await page.locator('#section-2').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('case-section-2')).toContainText(/voluntarily notified/i);
    await expect(page.getByTestId('case-section-2')).toContainText(/Notification waiver/i);
    await page.locator('#section-5').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('case-section-5')).toContainText(/27 November 2025/);
    await expect(page.getByTestId('case-section-5')).toContainText(/voluntary/i);
    // ADM-002 is cited in the baseline sources line; ADM-003 appears in §5 Tribunal notes.
    await page
      .getByTestId('case-section-5')
      .locator('a[data-claim-id="ATLAS-ADM-003"]')
      .first()
      .click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-ADM-003/);
    await page.goto('/casebook/Case4');
    await page
      .getByTestId('case-section-2')
      .locator('a[data-claim-id="ATLAS-ADM-002"]')
      .first()
      .click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-ADM-002/);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('Section deep link → refresh → back/forward', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);
    await page.goto('/casebook/Case1#section-9');
    await expect(page.getByTestId('case-section-9')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('case-section-9')).toBeVisible();
    await page.goBack();
    await page.goForward();
    await expect(page).toHaveURL(/\/casebook\/Case1#section-9/);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('Invalid case ID', async ({ page }) => {
    await page.goto('/casebook/Case99');
    await expect(page.getByTestId('case-not-found')).toBeVisible();
  });

  test('Desktop and mobile directory / Case 1 / Case 2 screenshots', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/casebook');
    await expect(page.getByTestId('casebook-directory')).toBeVisible();
    await expect(page.getByText('Loading casebook…')).toHaveCount(0);
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-casebook-directory.png'),
      fullPage: false,
    });
    await page.goto('/casebook/Case1');
    await expect(page.getByTestId('case-page-Case1')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Undeveloped supermarket sites/i);
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-case1.png'),
      fullPage: false,
    });
    await page.locator('#section-6').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('case-section-6')).toContainText(/develop-or-release/i);
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-case1-pathways.png'),
      fullPage: false,
    });
    await page.goto('/casebook/Case2');
    await expect(page.getByTestId('case-page-Case2')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Foreign greenfield/i);
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-case2.png'),
      fullPage: false,
    });
    await page.locator('#section-2').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('case-section-2')).toContainText('T1');
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-case2-pathways.png'),
      fullPage: false,
    });
    await page.locator('#cited-evidence').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('cited-evidence-panel')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-case2-cited-evidence.png'),
      fullPage: false,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/casebook');
    await expect(page.getByTestId('casebook-directory')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-casebook-directory.png'),
      fullPage: false,
    });
    await page.goto('/casebook/Case1');
    await expect(page.getByTestId('case-page-Case1')).toBeVisible();
    await expect(page.getByTestId('case-section-nav')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-case1.png'),
      fullPage: false,
    });
    await page.goto('/casebook/Case2');
    await expect(page.getByTestId('case-page-Case2')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-case2.png'),
      fullPage: false,
    });

    // Keyboard-accessible section nav
    await page.goto('/casebook/Case1');
    await expect(page.getByTestId('case-page-Case1')).toBeVisible();
    await page.getByRole('navigation', { name: 'Case sections' }).getByRole('link').first().focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/section-1/);

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});

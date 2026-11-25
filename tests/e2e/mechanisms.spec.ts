import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(__dirname, '../../docs/screenshots/build-05');

test.describe('Mechanism Explorer journeys', () => {
  test('overview → M1 family → 24 claims; M1c exact 17', async ({ page }) => {
    await page.goto('/mechanisms');
    await expect(page.getByTestId('mechanisms-page')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('family-count-M1')).toHaveText('24');
    await page.screenshot({
      path: path.join(screenshotDir, 'overview-desktop.png'),
      fullPage: true,
    });

    await page.getByRole('link', { name: /Open M1 profile/i }).click();
    await expect(page.getByTestId('mechanism-profile-M1')).toBeVisible();
    await expect(page.getByTestId('profile-family-count')).toHaveText('24');
    await page.getByTestId('profile-claims-link').click();
    await expect(page).toHaveURL(/mechanism_family=M1/);
    await expect(page.getByTestId('match-count')).toContainText('24 of 43');

    await page.goto('/mechanisms/M1');
    await page.getByRole('link', { name: /^M1c$/ }).first().click();
    await expect(page.getByTestId('mechanism-profile-M1c')).toBeVisible();
    await expect(page.getByTestId('profile-exact-count')).toHaveText('17');
    await page.screenshot({
      path: path.join(screenshotDir, 'm1c-profile-desktop.png'),
      fullPage: true,
    });
    await page.getByTestId('profile-claims-link').click();
    await expect(page).toHaveURL(/mechanism=M1c/);
    await expect(page.getByTestId('match-count')).toContainText('17 of 43');
  });

  test('matrix cells M1×O1 and M3×O6', async ({ page }) => {
    await page.goto('/mechanisms');
    await expect(page.getByTestId('mechanisms-page')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('matrix-cell-M1-O1').click();
    await expect(page.getByTestId('matrix-selection-count')).toContainText('23');
    await page.screenshot({
      path: path.join(screenshotDir, 'matrix-desktop.png'),
      fullPage: true,
    });
    await page.getByTestId('matrix-claims-link').click();
    await expect(page).toHaveURL(/mechanism_family=M1/);
    await expect(page).toHaveURL(/outcome=O1/);
    await expect(page.getByTestId('match-count')).toContainText('23 of 43');

    await page.goto('/mechanisms');
    await expect(page.getByTestId('mechanisms-page')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('matrix-cell-M3-O6').click();
    await expect(page.getByTestId('matrix-selection-count')).toContainText('6');
    await page.getByTestId('matrix-claims-link').click();
    await expect(page.getByTestId('match-count')).toContainText('6 of 43');
  });

  test('casebook mechanism section → profile → evidence', async ({ page }) => {
    await page.goto('/casebook/Case1#section-4');
    await expect(page.getByRole('heading', { name: /Undeveloped supermarket sites/i })).toBeVisible();
    const m1c = page.locator('[data-mechanism-id="M1c"]').first();
    await expect(m1c).toBeVisible();
    await m1c.click();
    await expect(page).toHaveURL(/\/mechanisms\/M1c/);
    await page.getByTestId('profile-claims-link').click();
    await expect(page.getByTestId('match-count')).toContainText('17 of 43');
  });

  test('claim detail → mechanism profile; direct URL refresh and history', async ({
    page,
  }) => {
    await page.goto('/claims/ATLAS-HYP-001');
    await page.locator('[data-mechanism-chip="M1c"]').click();
    await expect(page).toHaveURL(/\/mechanisms\/M1c/);
    await page.getByRole('link', { name: /Case1 §4/i }).first().click();
    await expect(page).toHaveURL(/\/casebook\/Case1/);

    await page.goto('/mechanisms/M2b');
    await expect(page.getByTestId('mechanism-profile-M2b')).toBeVisible({ timeout: 15_000 });
    await page.reload();
    await expect(page.getByTestId('mechanism-profile-M2b')).toBeVisible({ timeout: 15_000 });
    await page.goBack();
    await page.goForward();
    await expect(page.getByTestId('mechanism-profile-M2b')).toBeVisible();
  });

  test('mobile matrix/profile and keyboard matrix interaction', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/mechanisms');
    await expect(page.getByTestId('mechanism-outcome-matrix')).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: path.join(screenshotDir, 'overview-mobile.png'),
      fullPage: true,
    });
    await page.getByTestId('matrix-cell-M1-O1').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('matrix-selection-panel')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'matrix-mobile.png'),
      fullPage: true,
    });

    await page.goto('/mechanisms/M1c');
    await expect(page.getByTestId('mechanism-profile-M1c')).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: path.join(screenshotDir, 'm1c-profile-mobile.png'),
      fullPage: true,
    });
  });
});

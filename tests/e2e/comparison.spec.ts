import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(__dirname, '../../docs/screenshots/build-06');

test.describe('Policy Comparison Laboratory journeys', () => {
  test('orientation → two variants → claim → back restores selection', async ({
    page,
  }) => {
    await page.goto('/comparison');
    await expect(page.getByTestId('comparison-page')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('comparison-orientation')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'orientation-desktop.png'),
      fullPage: true,
    });

    await page.getByTestId('orientation-compare-Case1').click();
    await expect(page).toHaveURL(/a=C1-VAR-R/);
    await expect(page).toHaveURL(/b=C1-VAR-E/);
    await expect(page.getByTestId('comparison-side-C1-VAR-R')).toBeVisible();
    await expect(page.getByTestId('comparison-side-C1-VAR-E')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'c1-r-vs-e-desktop.png'),
      fullPage: true,
    });

    const claimLink = page.locator('[data-comparison-claim]').first();
    await expect(claimLink).toBeVisible();
    const claimId = await claimLink.getAttribute('data-comparison-claim');
    await claimLink.click();
    await expect(page).toHaveURL(new RegExp(`/claims/${claimId}`));

    await page.goBack();
    await expect(page).toHaveURL(/\/comparison\?a=C1-VAR-R&b=C1-VAR-E/);
    await expect(page.getByTestId('comparison-side-C1-VAR-R')).toBeVisible();
    await expect(page.getByTestId('comparison-select-a')).toHaveValue('C1-VAR-R');
  });

  test('refresh and back/forward preserve URL contract', async ({ page }) => {
    await page.goto('/comparison?a=C2-VAR-CF-A&b=C2-VAR-CF-C');
    await expect(page.getByTestId('comparison-side-C2-VAR-CF-A')).toBeVisible({
      timeout: 15_000,
    });
    await page.reload();
    await expect(page).toHaveURL(/a=C2-VAR-CF-A&b=C2-VAR-CF-C/);
    await expect(page.getByTestId('comparison-side-C2-VAR-CF-C')).toBeVisible();

    await page.goto('/comparison?a=C4-VAR-B0&b=C4-VAR-CF-WEAKER');
    await expect(page.getByTestId('comparison-side-C4-VAR-B0')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/C2-VAR-CF-A/);
    await page.goForward();
    await expect(page).toHaveURL(/C4-VAR-CF-WEAKER/);
  });

  test('invalid and duplicate selections surface notices', async ({ page }) => {
    await page.goto('/comparison?a=NOT-A-VARIANT&b=C1-VAR-R');
    await expect(page.getByTestId('comparison-url-notices')).toContainText(/Unknown variant/);
    await expect(page.getByTestId('comparison-select-a')).toHaveValue('');

    await page.goto('/comparison?a=C1-VAR-R&b=C1-VAR-R');
    await expect(page.getByTestId('comparison-url-notices')).toContainText(/distinct variants/);
  });

  test('mobile viewport and keyboard operation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/comparison');
    await expect(page.getByTestId('comparison-page')).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: path.join(screenshotDir, 'orientation-mobile.png'),
      fullPage: true,
    });

    await page.getByTestId('comparison-select-a').focus();
    await page.keyboard.press('Alt+ArrowDown');
    await page.selectOption('[data-testid="comparison-select-a"]', 'C3-VAR-SITE-FDI');
    await page.selectOption('[data-testid="comparison-select-b"]', 'C3-VAR-FDI-ONLY');
    await expect(page).toHaveURL(/C3-VAR-SITE-FDI/);
    await expect(page.getByTestId('comparison-side-C3-VAR-SITE-FDI')).toBeVisible();

    const caseSection = page.locator('[data-comparison-case-section]').first();
    if (await caseSection.count()) {
      await caseSection.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/casebook\//);
      await page.goBack();
      await expect(page).toHaveURL(/C3-VAR-SITE-FDI/);
    }
  });

  test('/claims/compare remains the two-claim evidence route', async ({ page }) => {
    await page.goto('/claims/compare?a=ATLAS-EMP-001&b=ATLAS-EMP-002');
    await expect(
      page.getByRole('heading', { name: /Two-claim evidence comparison/i }),
    ).toBeVisible();
    await expect(page.getByTestId('comparison-page')).toHaveCount(0);
  });
});

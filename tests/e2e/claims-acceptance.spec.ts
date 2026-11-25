import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(here, '../../docs/screenshots/build-03');

test.describe('Build 03R acceptance journeys', () => {
  test('search-commit race, related filter, compare return, and first-viewport screenshots', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/claims?case=Case1');
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-1440x900-first-viewport-claims.png'),
      fullPage: false,
    });

    const search = page.getByRole('searchbox', { name: 'Search' });
    await search.fill('ATLAS-EMP');
    // Immediate navigation before debounce settles.
    await page.getByRole('link', { name: 'ATLAS-EMP-001', exact: true }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-EMP-001$/);

    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', {
      name: 'Evidence library',
    }).click();
    await expect(page).toHaveURL(/case=Case1/);
    await expect(page).toHaveURL(/q=ATLAS-EMP/);

    await page.goto('/claims/ATLAS-ASM-002');
    await expect(page.getByTestId('related-evidence')).toBeVisible();
    await expect(page.getByTestId('related-count')).toContainText('42 of 42');
    await page.getByRole('button', { name: 'Mechanism' }).click();
    await expect(page.getByTestId('related-count')).toContainText('of 42');
    await page.getByRole('button', { name: 'All associations' }).click();
    await page.getByTestId('related-toggle').click();
    await expect(page.getByTestId('related-toggle')).toContainText(/Show fewer/);

    await page.goto('/claims/compare?a=ATLAS-EMP-001&b=ATLAS-DOES-NOT-EXIST');
    await expect(page.getByTestId('compare-slot-b')).toContainText(/No atlas claim matches/);
    await page.getByTestId('compare-slot-b').getByRole('button', { name: /Remove/i }).click();
    await expect(page).toHaveURL(/a=ATLAS-EMP-001/);
    await expect(page).not.toHaveURL(/b=/);

    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-1440x900-first-viewport-compare.png'),
      fullPage: false,
    });
  });

  test('mobile first-viewport detail and comparison', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/claims');
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-390x844-first-viewport-claims.png'),
      fullPage: false,
    });

    await page.goto('/claims/ATLAS-HYP-002');
    await expect(page.getByText(/Admissibility is not a truth verdict/i)).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-390x844-first-viewport-hyp-002.png'),
      fullPage: false,
    });

    await page.goto('/claims/compare?a=ATLAS-LEG-001&b=ATLAS-LEG-002');
    await expect(page.getByTestId('compare-fields')).toContainText(/Private foreign persons/i);
    await expect(page.getByTestId('compare-fields')).toContainText(/Foreign government investors/i);
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-390x844-first-viewport-compare.png'),
      fullPage: false,
    });
  });

  test('keyboard compare selection and malformed duplicate IDs', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/claims');
    await page.getByRole('checkbox', { name: /Select ATLAS-EMP-005 for comparison/i }).focus();
    await page.keyboard.press('Space');
    await page.getByRole('checkbox', { name: /Select ATLAS-HYP-004 for comparison/i }).focus();
    await page.keyboard.press('Space');
    await page.getByRole('link', { name: /Open comparison/i }).click();
    await expect(page).toHaveURL(/a=ATLAS-EMP-005/);
    await expect(page).toHaveURL(/b=ATLAS-HYP-004/);

    await page.goto('/claims/compare?a=ATLAS-HYP-001&b=ATLAS-HYP-001');
    await expect(page.getByTestId('compare-identical-notice')).toBeVisible();
    await page.goto('/claims/compare?a=&b=ATLAS-POL-001');
    await expect(page.getByTestId('compare-slot-a')).toContainText(/Set claim|Claim ID/i);
    await expect(page.getByTestId('compare-slot-b')).toContainText('ATLAS-POL-001');
  });
});

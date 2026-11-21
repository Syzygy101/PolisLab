import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(here, '../../docs/screenshots/build-03');

test.describe('Build 03 evidence investigation workspace', () => {
  test('Overview → Case 1 → EMP-001 → compare EMP-002', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('case-claims-link-Case1').click();
    await expect(page).toHaveURL(/\/claims\?case=Case1/);
    await expect(page.getByRole('heading', { name: 'Claims Explorer' })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search' }).fill('ATLAS-EMP-001');
    await page.getByRole('link', { name: /Open claim ATLAS-EMP-001/i }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-EMP-001$/);
    await expect(page.getByTestId('related-evidence')).toContainText('ATLAS-EMP-002');
    await page.getByRole('link', { name: /Compare with another claim/i }).click();
    await expect(page).toHaveURL(/\/claims\/compare\?a=ATLAS-EMP-001/);
    await page.getByRole('textbox', { name: /Claim ID for slot b/i }).fill('ATLAS-EMP-002');
    await page.getByTestId('compare-slot-b').getByRole('button', { name: /Set claim/i }).click();
    await expect(page).toHaveURL(/a=ATLAS-EMP-001.*b=ATLAS-EMP-002|b=ATLAS-EMP-002.*a=ATLAS-EMP-001/);
    await expect(page.getByTestId('compare-fields')).toContainText(/land banking/i);
  });

  test('ALDI chronology investigation → EMP-005 → HYP-004 related navigation', async ({ page }) => {
    await page.goto('/claims');
    // Exact phrase "ALDI chronology" is HYP-004 claim text; EMP-005 carries ALDI + O2 chronology
    // conditions. Search "chronology" returns both; inspect the empirical chronology record first.
    await page.getByRole('searchbox', { name: 'Search' }).fill('chronology');
    await expect(page).toHaveURL(/q=chronology/, { timeout: 3000 });
    await expect(page.getByRole('link', { name: 'ATLAS-EMP-005', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ATLAS-HYP-004', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'ATLAS-EMP-005', exact: true }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-EMP-005$/);
    // HYP-004 is beyond the initial progressive-disclosure window; expand or filter.
    await page.getByTestId('related-toggle').click();
    await page.getByTestId('related-evidence').getByRole('link', { name: 'ATLAS-HYP-004' }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-HYP-004$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/ALDI chronology/i);
  });

  test('admissibility + status filter, shared URL refresh, clear', async ({ page }) => {
    await page.goto('/claims');
    await page.getByRole('button', { name: 'no', exact: true }).click();
    await page.getByRole('button', { name: 'unresolved hypothesis' }).click();
    await expect(page.getByTestId('match-count')).toHaveText('2 of 43 claims match filters');
    await expect(page.getByTestId('active-filters')).toBeVisible();
    await expect(page).toHaveURL(/admissibility=no/);
    await expect(page).toHaveURL(/status=unresolved_hypothesis/);
    await page.reload();
    await expect(page.getByTestId('match-count')).toHaveText('2 of 43 claims match filters');
    await page.getByRole('button', { name: /Remove active filter Admissibility: no/i }).click();
    await expect(page.getByTestId('match-count')).toHaveText('4 of 43 claims match filters');
    await page.getByRole('button', { name: 'Reset filters' }).click();
    await expect(page.getByTestId('match-count')).toHaveText('43 of 43 claims shown');
  });

  test('direct comparison URL with back/forward', async ({ page }) => {
    await page.goto('/claims/compare?a=ATLAS-HYP-001&b=ATLAS-POL-001');
    await expect(page.getByTestId('compare-slot-a')).toContainText('ATLAS-HYP-001');
    await expect(page.getByTestId('compare-slot-b')).toContainText('ATLAS-POL-001');
    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Claims Explorer' }).click();
    await expect(page).toHaveURL(/\/claims$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/claims\/compare\?a=ATLAS-HYP-001&b=ATLAS-POL-001/);
    await page.goForward();
    await expect(page).toHaveURL(/\/claims$/);
  });

  test('mobile claim inspection and comparison', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/claims/ATLAS-EMP-002');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/land banking/i);
    await expect(page.getByText('All 18 source fields')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-390x844-emp-002.png'),
      fullPage: true,
    });

    await page.goto('/claims/compare?a=ATLAS-EMP-005&b=ATLAS-HYP-004');
    await expect(page.getByTestId('compare-slot-a')).toBeVisible();
    await expect(page.getByTestId('compare-slot-b')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-390x844-compare.png'),
      fullPage: true,
    });
  });

  test('keyboard-only essential controls and desktop screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/claims');
    const search = page.getByRole('searchbox', { name: 'Search' });
    await search.focus();
    await page.keyboard.type('ATLAS-LEG-001');
    await expect(page.getByTestId('match-count')).toContainText('1 of 43');
    await page.getByRole('checkbox', { name: /Select ATLAS-LEG-001 for comparison/i }).focus();
    await page.keyboard.press('Space');
    await search.fill('ATLAS-LEG-002');
    await page.getByRole('checkbox', { name: /Select ATLAS-LEG-002 for comparison/i }).focus();
    await page.keyboard.press('Space');
    await page.getByRole('link', { name: /Open comparison/i }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/claims\/compare/);
    await expect(page.getByTestId('compare-fields')).toBeVisible();

    await page.goto('/claims');
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-1440x900-claims.png'),
      fullPage: true,
    });
    await page.goto('/claims/ATLAS-EMP-001');
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-1440x900-emp-001.png'),
      fullPage: true,
    });
    await page.goto('/claims/compare?a=ATLAS-EMP-001&b=ATLAS-EMP-002');
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-1440x900-compare.png'),
      fullPage: true,
    });
  });
});

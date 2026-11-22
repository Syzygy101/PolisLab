import { expect, test } from '@playwright/test';
import path from 'node:path';

const SHOT_DIR = path.resolve('docs/screenshots/build-07');

test.describe('Evidence Gaps Laboratory', () => {
  test('overview, filter, detail, navigation, and return', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/gaps');
    await expect(page.getByTestId('gaps-page')).toBeVisible();
    await expect(page.getByTestId('gaps-match-count')).toContainText('Showing 19 of 19');
    await page.screenshot({
      path: path.join(SHOT_DIR, 'gaps-overview-desktop.png'),
      fullPage: true,
    });

    await page.getByTestId('gaps-theme-site-control').click();
    await expect(page).toHaveURL(/case=Case1/);
    await expect(page).toHaveURL(/mechanism_family=M1/);
    await expect(page.getByTestId('gaps-req-REQ-C1-03')).toBeVisible();

    await page.getByTestId('gaps-req-REQ-C1-03').getByRole('link', { name: 'REQ-C1-03' }).click();
    const detail = page.getByTestId('requirement-detail-REQ-C1-03');
    await expect(detail).toBeVisible();
    await expect(
      detail.getByRole('heading', { name: '1. Original research requirement' }),
    ).toBeVisible();
    await expect(detail.getByText(/AU quasi-experiment/i).first()).toBeVisible();
    await page.screenshot({
      path: path.join(SHOT_DIR, 'gaps-requirement-desktop.png'),
      fullPage: true,
    });

    await page.getByTestId('return-to-gaps').click();
    await expect(page).toHaveURL(/case=Case1/);
    await expect(page.getByTestId('gaps-page')).toBeVisible();

    await page.goBack();
    await expect(page.getByTestId('requirement-detail-REQ-C1-03')).toBeVisible();
    await page.goForward();
    await expect(page.getByTestId('gaps-page')).toBeVisible();
  });

  test('claim, casebook, mechanism, and comparison deep links', async ({ page }) => {
    await page.goto('/claims/ATLAS-GAP-002');
    await page.getByTestId('claim-gaps-link').click();
    await expect(page).toHaveURL(/claim=ATLAS-GAP-002/);
    await expect(page.getByTestId('gaps-req-REQ-C3-03')).toBeVisible();

    await page.goto('/casebook/Case4');
    await page.getByTestId('case-gaps-link').click();
    await expect(page).toHaveURL(/case=Case4/);
    await expect(page.getByTestId('gaps-match-count')).toContainText('Showing 5 of 19');

    await page.goto('/mechanisms/M2');
    await expect(page.getByTestId('mechanism-gaps-links')).toBeVisible();
    await page.getByRole('link', { name: 'REQ-C3-04' }).click();
    await expect(page.getByTestId('requirement-detail-REQ-C3-04')).toBeVisible();

    await page.goto('/comparison?a=C1-VAR-R&b=C1-VAR-E');
    await expect(page.getByTestId('comparison-gaps-shared')).toBeVisible();
    await expect(
      page.getByTestId('comparison-gaps-shared').getByRole('link', { name: 'REQ-C1-03' }),
    ).toBeVisible();
    await expect(page.getByTestId('comparison-gaps-C1-VAR-R')).toBeVisible();
    await page
      .getByTestId('comparison-gaps-C1-VAR-R')
      .getByRole('link', { name: 'REQ-C1-02' })
      .click();
    await expect(page.getByTestId('requirement-detail-REQ-C1-02')).toBeVisible();
    await expect(page).toHaveURL(/REQ-C1-02/);
  });

  test('invalid routes and mobile layout', async ({ page }) => {
    await page.goto('/gaps/NOT-A-REQ');
    await expect(page.getByTestId('requirement-not-found')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gaps?case=Case2');
    await expect(page.getByTestId('gaps-page')).toBeVisible();
    await page.screenshot({
      path: path.join(SHOT_DIR, 'gaps-overview-mobile.png'),
      fullPage: true,
    });

    await page.goto('/gaps/REQ-C2-05');
    await expect(page.getByText(/does not specify a sufficient empirical falsification test/i)).toBeVisible();
    await page.screenshot({
      path: path.join(SHOT_DIR, 'gaps-requirement-mobile.png'),
      fullPage: true,
    });
  });

  test('keyboard filter operation', async ({ page }) => {
    await page.goto('/gaps');
    await page.locator('#gaps-agenda').focus();
    await page.keyboard.press('Alt+ArrowDown');
    await page.selectOption('#gaps-agenda', 'legal-feasibility-institutional');
    await expect(page).toHaveURL(/agenda=legal-feasibility-institutional/);
    await expect(page.getByTestId('gaps-match-count')).toContainText('Showing 4 of 19');
    await expect(page.getByTestId('gaps-req-REQ-C1-05')).toBeVisible();
  });
});

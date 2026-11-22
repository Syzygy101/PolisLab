import { expect, test } from '@playwright/test';

/**
 * Lightweight accessibility smoke checks (Build 08).
 * Not a WCAG certification — supplements keyboard/manual review.
 */

const MODULE_PATHS = [
  '/',
  '/claims',
  '/casebook',
  '/mechanisms',
  '/comparison',
  '/gaps',
] as const;

test.describe('Accessibility smoke', () => {
  for (const path of MODULE_PATHS) {
    test(`${path} has main landmark, h1, and skip link target`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('#main-content')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      if (path === '/') {
        // Overview uses the editorial shell (no workspace rail); navigation is via the
        // in-page entrance actions and the mobile drawer.
        await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
        await expect(page.getByTestId('overview-enter')).toBeVisible();
      } else {
        await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
      }
      const skip = page.getByRole('link', { name: /Skip to content/i });
      await expect(skip).toHaveCount(1);
    });
  }

  test('Claims Explorer filters are keyboard reachable', async ({ page }) => {
    await page.goto('/claims');
    await page.keyboard.press('Tab');
    // Skip link becomes visible on focus
    const skip = page.getByRole('link', { name: /Skip to content/i });
    await skip.focus();
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeVisible();

    const search = page.getByRole('searchbox', { name: 'Search' });
    await search.focus();
    await expect(search).toBeFocused();
    await search.fill('EMP-001');
    await expect(page.getByTestId('match-count')).toBeVisible();
  });

  test('active nav communicates current page', async ({ page }) => {
    await page.goto('/gaps');
    const gaps = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: /Research gaps/i,
    });
    await expect(gaps).toHaveAttribute('aria-current', 'page');
  });
});

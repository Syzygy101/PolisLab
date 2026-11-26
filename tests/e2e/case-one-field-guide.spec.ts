import { expect, test, devices } from '@playwright/test';

const viewports = [
  { label: 'desktop', viewport: { width: 1440, height: 1000 }, mobile: false },
  { label: 'touch mobile', viewport: devices['iPhone 13'].viewport, mobile: true },
  { label: '320px reflow', viewport: { width: 320, height: 800 }, mobile: true },
];

for (const { label, viewport, mobile } of viewports) {
  test.describe(label, () => {
    test.use({ viewport, hasTouch: mobile, isMobile: mobile });

    test('follows the Case 1 question through investigation, comparison and source evidence', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('PolisLab Research Laboratory');
      await page.getByRole('link', { name: 'Investigate the site' }).click();
      await expect(page).toHaveURL(/\/casebook\/Case1$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('What keeps a new supermarket out?');
      await expect(page.getByText('Illustrative site plan · no real parcel data')).toBeVisible();

      const explanationGroup = page.getByRole('group', { name: 'Competing explanations' });
      await expect(explanationGroup.getByRole('button')).toHaveCount(4);
      await page.getByRole('link', { name: 'Examine the site' }).click();
      const waiting = explanationGroup.getByRole('button', { name: 'Waiting to invest' });
      await waiting.focus();
      await page.keyboard.press('Space');
      await expect(waiting).toHaveAttribute('aria-pressed', 'true');
      await expect(waiting).toBeFocused();
      await expect(page.getByRole('heading', { name: 'Waiting may be a commercial decision.' })).toBeVisible();

      const control = explanationGroup.getByRole('button', { name: 'Site control' });
      if (mobile) await control.tap();
      else await control.click();
      await expect(control).toHaveAttribute('aria-pressed', 'true');
      await expect(page).toHaveURL(/site=control#site-investigation$/);
      await page.getByText('Evidence and limits', { exact: true }).click();
      await expect(page.getByText(/Unresolved hypothesis\./).first()).toBeVisible();
      await page.getByRole('link', { name: 'The strategic foreclosure hypothesis' }).click();
      await expect(page).toHaveURL(/\/claims\/ATLAS-HYP-001$/);
      await page.goBack();
      await expect(control).toHaveAttribute('aria-pressed', 'true');

      await page.getByRole('link', { name: 'Compare proposals' }).click();
      const comparison = page.getByRole('region', { name: 'Could a change in site rules help a rival open?' });
      await comparison.getByRole('button', { name: 'Where it could fail' }).click();
      await expect(comparison.getByText(/The deadline could cut short useful waiting/)).toBeVisible();
      await comparison.getByRole('button', { name: 'If little changes' }).click();
      await expect(comparison.getByText(/Little may change where rivals cannot use/)).toBeVisible();
      await comparison.getByRole('button', { name: 'Evidence needed' }).click();
      await expect(comparison.getByRole('link', { name: /Observed assignment of released sites/ }))
        .toHaveAttribute('href', '/gaps/REQ-C1-02');
      await expect(comparison.getByRole('link', { name: 'Open the full policy comparison' }))
        .toHaveAttribute('href', '/comparison?a=C1-VAR-R&b=C1-VAR-E');

      await page.reload();
      await expect(comparison.getByRole('button', { name: 'Evidence needed' })).toHaveAttribute('aria-pressed', 'true');
      await expect(control).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('link', { name: 'Follow the evidence' }).click();
      const evidence = page.getByRole('region', { name: 'What would change the answer?' });
      await expect(evidence.locator('summary')).toHaveCount(5);
      await evidence.getByText(/Parcel-level findings/).click();
      await expect(evidence.getByText(/Absence of an ACCC land-banking finding/)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      await page.goto('/casebook/Case1#section-9');
      await expect(page.getByTestId('case-section-9')).toBeInViewport();
      await expect(page.getByTestId('case-section-9-gaps')).toBeVisible();
      expect(errors).toEqual([]);
    });
  });
}

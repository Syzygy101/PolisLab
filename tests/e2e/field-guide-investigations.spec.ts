import { expect, test } from '@playwright/test';

const journeys = [
  {
    id: 'Case2',
    choice: 'Foreign government investor',
    step: 'Acquire a land interest',
    heading: 'Land interests generally carry a zero-dollar threshold.',
    params: /investor=government&step=land/,
    pairing: '/comparison?a=C2-VAR-CF-A&b=C2-VAR-CF-C',
  },
  {
    id: 'Case3',
    choice: 'Western Australia',
    step: /First stores/,
    heading: 'The first Western Australian stores open.',
    params: /state=wa&step=stores/,
    pairing: '/comparison?a=C3-VAR-SITE-FDI&b=C3-VAR-FDI-ONLY',
  },
  {
    id: 'Case4',
    choice: null,
    step: 'Notification waiver',
    heading: 'A waiver decides whether a filing is required.',
    params: /step=waiver/,
    pairing: '/comparison?a=C4-VAR-B0&b=C4-VAR-CF-STRONGER',
  },
];

for (const width of [1440, 320]) {
  test.describe(`Field Guide at ${width}px`, () => {
    test.use({ viewport: { width, height: 850 } });

    for (const journey of journeys) {
      test(`${journey.id} supports evidence selection, a cited comparison and expert links`, async ({ page }) => {
        await page.goto('/');
        await page.getByTestId(`case-investigate-link-${journey.id}`).click();
        const guide = page.getByTestId(`guided-${journey.id}`);
        await expect(guide.getByRole('heading', { level: 1 })).toBeVisible();
        if (journey.choice) await guide.getByRole('button', { name: journey.choice }).click();

        const step = guide.getByRole('button', { name: journey.step });
        await step.focus();
        await page.keyboard.press('Space');
        await expect(step).toBeFocused();
        await expect(step).toHaveAttribute('aria-pressed', 'true');
        await expect(page).toHaveURL(journey.params);
        await expect(guide.getByRole('heading', { name: journey.heading })).toBeVisible();
        expect((await step.boundingBox())?.height).toBeGreaterThanOrEqual(44);
        await page.reload();
        await expect(guide.getByRole('heading', { name: journey.heading })).toBeVisible();
        await guide.getByText('Sources and technical detail', { exact: true }).click();
        await expect(guide.getByRole('link', { name: 'Read the published casebook section' })).toBeVisible();
        if (journey.id !== 'Case2') {
          await expect(guide.getByRole('link', { name: /Open the cited atlas claim/ })).toBeVisible();
        }

        const comparison = guide.getByRole('link', { name: 'Open the full policy comparison' });
        await expect(comparison).toHaveAttribute('href', journey.pairing);
        await comparison.click();
        await expect(page.getByTestId('comparison-page')).toBeVisible();
        await page.goBack();
        await expect(guide.getByRole('heading', { name: journey.heading })).toBeVisible();
        await page.getByText('Research index and identifiers', { exact: true }).click();
        await expect(page.getByTestId('case-related').getByText('Mechanism tags on cited claims')).toBeVisible();

        await guide.getByRole('link', { name: 'Follow the evidence' }).click();
        await guide.locator('#guided-evidence summary').first().click();
        await guide.getByRole('link', { name: 'Open the research requirement' }).click();
        await expect(page).toHaveURL(/\/gaps\/REQ-/);
        await page.goBack();
        await page.goto(`/casebook/${journey.id}#section-9`);
        await expect(page.getByTestId('case-section-9')).toBeInViewport();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }
  });
}


test('a narrow cold-link visit reaches research requirements and wraps technical fields', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto('/gaps?case=Case4#requirements');
  await expect(page.getByRole('heading', { name: 'Research requirements', exact: true })).toBeInViewport();
  await page.getByText('Atlas field name', { exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);

  await page.goto('/mechanisms#mechanism-pathways');
  await expect(page.getByRole('heading', { name: 'Conditional mechanism explanations' })).toBeInViewport();
});

import { expect, test } from '@playwright/test';

const deepLinks = [
  ['/claims/ATLAS-CON-001', 'heading', /foreign-investment approval delay/i],
  ['/casebook/Case1', 'testId', 'case-page-Case1'],
  ['/comparison?a=C1-VAR-R&b=C1-VAR-E', 'testId', 'comparison-bands'],
  ['/gaps/REQ-C1-01', 'testId', 'requirement-detail-REQ-C1-01'],
] as const;

for (const [path, locator, name] of deepLinks) {
  test(`serves ${path} on direct entry and refresh`, async ({ page, baseURL }) => {
    const url = new URL(path, baseURL).href;
    const content = locator === 'testId'
      ? page.getByTestId(name)
      : page.getByRole('heading', { level: 1, name });

    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page).toHaveURL(url);
    await expect(content).toBeVisible();
    expect((await page.reload())?.status()).toBe(200);
    await expect(page).toHaveURL(url);
    await expect(content).toBeVisible();

    if (path.startsWith('/comparison')) {
      await expect(page.getByRole('combobox', { name: 'Variant A' })).toHaveValue('C1-VAR-R');
      await expect(page.getByRole('combobox', { name: 'Variant B' })).toHaveValue('C1-VAR-E');
    }
  });
}

test('serves production assets and restores app navigation history', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const assets = new Map<string, { status: number; contentType: string }>();
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === origin && url.pathname.startsWith('/assets/')) {
      assets.set(url.pathname, {
        status: response.status(),
        contentType: response.headers()['content-type'] ?? '',
      });
    }
  });

  expect((await page.goto('/'))?.status()).toBe(200);
  await expect(page.getByTestId('overview-page')).toBeVisible();
  expect([...assets.entries()]).toEqual(expect.arrayContaining([
    [expect.stringMatching(/-[\w-]+\.js$/), { status: 200, contentType: expect.stringMatching(/javascript/) }],
    [expect.stringMatching(/-[\w-]+\.css$/), { status: 200, contentType: expect.stringMatching(/text\/css/) }],
  ]));

  await page.getByTestId('case-investigate-link-Case1').click();
  await expect(page.getByTestId('case-page-Case1')).toBeVisible();
  await page.getByTestId('case-compare-policies').click();
  await expect(page.getByTestId('comparison-page')).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId('case-page-Case1')).toBeVisible();
  await page.goForward();
  await expect(page.getByTestId('comparison-page')).toBeVisible();
});

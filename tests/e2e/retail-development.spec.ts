import { expect, test } from '@playwright/test';

test('guided demand, horizon and approval replays', async ({ page }) => {
  await page.goto('/sandbox');
  const result = page.getByRole('region', { name: 'Comparison result' });
  await expect(result).toContainText('+59.08');
  await page.getByLabel('Welfare horizon').selectOption('2');
  await expect(result).toContainText('-38.84');
  await page.getByLabel('Welfare horizon').selectOption('3');
  await page.getByLabel('Scenario').selectOption('low');
  await expect(result).toContainText('-4.34');
  await page.getByLabel('Scenario').selectOption('high');
  await expect(result).toContainText('+32.93');
  await page.getByLabel('Scenario').selectOption('permit');
  await expect(result).toContainText('+77.63');
  await page.getByLabel('Approval outcome').selectOption('denied');
  await expect(result).toContainText('0.00 welfare units');
  await expect(page.getByText(/Developer B pays 5 to A at year 0/)).toBeVisible();
  const replay = page.getByRole('link', { name: 'Open exact hypothetical replay · retail-1' });
  await expect(replay).toHaveAttribute('href', /model=retail-1.*approval=denied/);
  await replay.click();
  await page.reload();
  await expect(page.getByLabel('Approval outcome')).toHaveValue('denied');
  await expect(page.getByRole('table')).toBeVisible();
});

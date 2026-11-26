import { expect, test } from '@playwright/test';

/**
 * End-to-end substantive research journeys (Build 08 / 08F).
 * These verify investigation continuity — not economic validation or backtesting.
 *
 * 08F: real controls where practical, Journey E requires compare, exact CSV IDs.
 */

/** Case1 ∩ status=empirical_finding from research/10_policy_claims_atlas.csv. */
const CASE1_EMPIRICAL_FINDING_IDS = [
  'ATLAS-EMP-001',
  'ATLAS-EMP-003',
  'ATLAS-LIT-003',
  'ATLAS-LIT-004',
  'ATLAS-LIT-006',
] as const;

test.describe('Investigation journeys', () => {
  test('Journey A — undeveloped supermarket sites', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByTestId('case-investigate-link-Case1').click();
    await expect(page).toHaveURL(/\/casebook\/Case1/);
    await expect(page.getByTestId('case-page-Case1').getByRole('heading', { level: 1 })).toHaveText('What keeps a new supermarket out?');
    await expect(page.locator('#section-1')).toBeVisible();

    await page.goto('/comparison');
    await page.getByRole('link', { name: 'Site access proposals' }).click();
    await expect(page).toHaveURL(/a=C1-VAR-R/);
    await expect(page).toHaveURL(/b=C1-VAR-E/);
    await expect(page.getByTestId('comparison-select-a')).toHaveValue('C1-VAR-R');
    await expect(page.getByTestId('comparison-select-b')).toHaveValue('C1-VAR-E');
    await expect(page.getByTestId('comparison-shared')).toBeVisible();
    await expect(page.getByText(/Plausible pathways|Shared plausible pathways/i).first()).toBeVisible();

    await page.goto('/mechanisms/M1c');
    await expect(page.getByTestId('mechanism-profile-M1c')).toBeVisible();

    await page.goto('/claims?case=Case1');
    await page.getByRole('link', { name: 'ATLAS-EMP-001', exact: true }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-EMP-001/);
    await page.getByRole('link', { name: /Compare with another claim/i }).click();
    await expect(page).toHaveURL(/\/claims\/compare/);
    await page.getByRole('textbox', { name: /Claim ID for slot b/i }).fill('ATLAS-EMP-002');
    await page.getByTestId('compare-slot-b').getByRole('button', { name: /Set claim/i }).click();
    await expect(page.getByText('ATLAS-EMP-002').first()).toBeVisible();

    await page.goto('/gaps?case=Case1');
    await expect(page.getByTestId('gaps-page')).toBeVisible();
    await page.getByRole('link', { name: /REQ-C1-01/i }).first().click();
    await expect(page).toHaveURL(/\/gaps\/REQ-C1-01/);
    await expect(page.getByText(/exclusionary|foreclosure|planning delay \(M1b\)/i).first()).toBeVisible();
  });

  test('Journey B — foreign investment', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('case-investigate-link-Case2').click();
    await expect(page).toHaveURL(/\/casebook\/Case2/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/claims?case=Case2');
    await page.getByRole('searchbox', { name: 'Search' }).fill('ATLAS-LEG-001');
    await page.getByRole('link', { name: 'ATLAS-LEG-001', exact: true }).click();
    await expect(page).toHaveURL(/\/claims\/ATLAS-LEG-001/);
    await page.getByRole('link', { name: /Compare with another claim/i }).click();
    await page.getByRole('textbox', { name: /Claim ID for slot b/i }).fill('ATLAS-LEG-002');
    await page.getByTestId('compare-slot-b').getByRole('button', { name: /Set claim/i }).click();
    await expect(page.getByText('ATLAS-LEG-002').first()).toBeVisible();

    await page.goto('/comparison');
    await page.getByRole('link', { name: 'Foreign investment proposals' }).click();
    await expect(page.getByTestId('comparison-select-a')).toHaveValue('C2-VAR-CF-A');
    await expect(page.getByTestId('comparison-select-b')).toHaveValue('C2-VAR-CF-C');
    await expect(page.getByText(/C2-VAR-CF-A|C2-VAR-CF-C/i).first()).toBeVisible();

    await page.goto('/gaps?case=Case2');
    await page.getByRole('link', { name: /REQ-C2-05/i }).first().click();
    await expect(page).toHaveURL(/\/gaps\/REQ-C2-05/);
    await expect(page.getByText(/Layer C|Federal Register|announced/i).first()).toBeVisible();
  });

  test('Journey C — differentiated entry', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('case-investigate-link-Case3').click();
    await expect(page).toHaveURL(/\/casebook\/Case3/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/comparison?a=C3-VAR-SITE-FDI&b=C3-VAR-FDI-ONLY');
    await expect(page.getByTestId('comparison-select-a')).toHaveValue('C3-VAR-SITE-FDI');
    await expect(page.getByTestId('comparison-select-b')).toHaveValue('C3-VAR-FDI-ONLY');
    await expect(page.getByText(/Sadun|ATLAS-LIT-003|format shift/i).first()).toBeVisible();

    await page.goto('/mechanisms/M2');
    await expect(page.getByTestId('mechanism-profile-M2')).toBeVisible();

    await page.goto('/claims');
    await page.getByRole('searchbox', { name: 'Search' }).fill('ATLAS-EMP-005');
    await page.getByRole('link', { name: 'ATLAS-EMP-005', exact: true }).click();
    await page.getByRole('link', { name: /Compare with another claim/i }).click();
    await page.getByRole('textbox', { name: /Claim ID for slot b/i }).fill('ATLAS-HYP-004');
    await page.getByTestId('compare-slot-b').getByRole('button', { name: /Set claim/i }).click();
    await expect(page.getByText('ATLAS-HYP-004').first()).toBeVisible();

    await page.goto('/gaps?case=Case3');
    await expect(page.getByTestId('gaps-page')).toBeVisible();
  });

  test('Journey D — acquisition oversight', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('case-investigate-link-Case4').click();
    await expect(page).toHaveURL(/\/casebook\/Case4/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/comparison?a=C4-VAR-B0&b=C4-VAR-CF-WEAKER');
    await expect(page.getByTestId('comparison-select-a')).toHaveValue('C4-VAR-B0');
    await expect(page.getByTestId('comparison-select-b')).toHaveValue('C4-VAR-CF-WEAKER');
    await expect(page.getByTestId('compare-sticky-names')).toContainText('Current notification regime');

    await page.goto('/gaps?case=Case4');
    await page.getByRole('link', { name: /REQ-C4-05/i }).first().click();
    await expect(page.getByText(/LEG-007|sunset|2030/i).first()).toBeVisible();
  });

  test('Journey E — reproducible filtered evidence subset with compare', async ({ page, context }) => {
    await page.goto('/claims?case=Case1&status=empirical_finding');
    await expect(page.getByTestId('match-count')).toBeVisible();
    const idLinks = page.locator('.record-row a.claim-id');
    await expect(idLinks.first()).toBeVisible();
    const ids = (await idLinks.allTextContents()).map((t) => t.trim()).sort();
    expect(ids).toEqual([...CASE1_EMPIRICAL_FINDING_IDS]);

    const shareUrl = page.url();
    const page2 = await context.newPage();
    await page2.goto(shareUrl);
    await expect(page2.getByTestId('match-count')).toBeVisible();
    const ids2 = (
      await page2.locator('.record-row a.claim-id').allTextContents()
    )
      .map((t) => t.trim())
      .sort();
    expect(ids2).toEqual([...CASE1_EMPIRICAL_FINDING_IDS]);

    await page2.getByRole('link', { name: ids2[0]!, exact: true }).first().click();
    await expect(page2).toHaveURL(new RegExp(`/claims/${ids2[0]}`));

    // Required compare path (must not skip).
    expect(ids2.length).toBeGreaterThanOrEqual(2);
    await page2.getByRole('link', { name: /Compare with another claim/i }).click();
    await expect(page2).toHaveURL(/\/claims\/compare/);
    await page2.getByRole('textbox', { name: /Claim ID for slot b/i }).fill(ids2[1]!);
    await page2.getByTestId('compare-slot-b').getByRole('button', { name: /Set claim/i }).click();
    await expect(page2.getByText(ids2[0]!).first()).toBeVisible();
    await expect(page2.getByText(ids2[1]!).first()).toBeVisible();

    await page2.goto(shareUrl);
    const ids3 = (
      await page2.locator('.record-row a.claim-id').allTextContents()
    )
      .map((t) => t.trim())
      .sort();
    expect(ids3).toEqual([...CASE1_EMPIRICAL_FINDING_IDS]);
    await page2.close();
  });

  test('invalid route shows not-found (not silent home redirect)', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('heading', { name: /Page not found/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Research Overview/i })).toBeVisible();
  });

  test('sandbox is reachable but not in primary nav', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: /Sandbox/i })).toHaveCount(0);
    await page.goto('/sandbox');
    await expect(page.getByRole('heading', { name: /When does a required offer change supermarket entry/i })).toBeVisible();
    await expect(page.getByText(/Hypothetical computational experiment/i).first()).toBeVisible();
  });
});

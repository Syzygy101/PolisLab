import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ClaimsPage } from '../../src/pages/ClaimsPage';
import { ClaimDetailPage } from '../../src/pages/ClaimDetailPage';
import { OverviewPage } from '../../src/pages/OverviewPage';
import { allClaims } from '../../src/data/researchDataset';
import { V011_EXPECTED_CASE_MEMBERSHIP } from '../../src/research/referenceExpectations';

afterEach(() => {
  cleanup();
});

function renderApp(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <OverviewPage /> },
      { path: '/claims', element: <ClaimsPage /> },
      { path: '/claims/:claimId', element: <ClaimDetailPage /> },
    ],
    { initialEntries },
  );
  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}

describe('Claims Explorer URL-driven filter state', () => {
  it('initialises filters from the URL and reflects them in controls', () => {
    renderApp(['/claims?case=Case4&status=verified_legal_fact']);
    expect(screen.getByRole('button', { name: 'Case4', pressed: true })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'verified legal fact', pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('match-count').textContent).toMatch(/match filters/);
  });

  it('clearing filters restores the complete collection', async () => {
    const user = userEvent.setup();
    renderApp(['/claims?case=Case1']);
    expect(screen.getByTestId('match-count')).toHaveTextContent(
      `${V011_EXPECTED_CASE_MEMBERSHIP.Case1} of ${allClaims.length} claims match filters`,
    );
    await user.click(screen.getByRole('button', { name: /Reset filters/i }));
    expect(screen.getByTestId('match-count')).toHaveTextContent(
      `${allClaims.length} of ${allClaims.length} claims shown`,
    );
    expect(screen.getByRole('button', { name: 'Case1', pressed: false })).toBeInTheDocument();
  });

  it('handles invalid mixed parameters without crashing', () => {
    renderApp(['/claims?status=invented_status&case=Case9&outcome=O1&mechanism=M99z']);
    expect(screen.getByTestId('ignored-filter-params')).toHaveTextContent('invented_status');
    expect(screen.getByTestId('ignored-filter-params')).toHaveTextContent('Case9');
    expect(screen.getByRole('button', { name: 'O1', pressed: true })).toBeInTheDocument();
  });

  it('keeps direct claim-detail URLs functioning', () => {
    renderApp(['/claims/ATLAS-EMP-002']);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/land banking/i);
  });

  it('applies Overview deep-link navigation while already on Claims Explorer', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(['/claims?case=Case1']);
    expect(screen.getByRole('button', { name: 'Case1', pressed: true })).toBeInTheDocument();

    await router.navigate('/claims?status=absence_of_finding');
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'absence of finding', pressed: true }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Case1', pressed: false })).toBeInTheDocument();
    expect(screen.getByTestId('match-count')).toHaveTextContent('6 of 43 claims match filters');
  });

  it('preserves filters across detail navigation and back', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(['/claims?case=Case1']);
    expect(screen.getByTestId('match-count')).toHaveTextContent('20 of 43');

    await user.click(screen.getByRole('link', { name: 'ATLAS-ASM-001', exact: true }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        /Post-2026 Australian baseline/i,
      );
    });

    await router.navigate(-1);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Evidence library/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Case1', pressed: true })).toBeInTheDocument();
    expect(screen.getByTestId('match-count')).toHaveTextContent('20 of 43');
  });

  it('supports rapid multi-select filter changes without divergence', async () => {
    const user = userEvent.setup();
    renderApp(['/claims']);
    await user.click(screen.getByRole('button', { name: 'Case2' }));
    await user.click(screen.getByRole('button', { name: 'O1' }));
    await user.click(screen.getByRole('button', { name: 'verified legal fact' }));
    expect(screen.getByRole('button', { name: 'Case2', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'O1', pressed: true })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'verified legal fact', pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('match-count').textContent).toMatch(/match filters/);
  });
});

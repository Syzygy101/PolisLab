import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ComparePage } from '../../src/pages/ComparePage';
import { ClaimsPage } from '../../src/pages/ClaimsPage';

afterEach(() => {
  cleanup();
});

function renderCompare(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      { path: '/claims', element: <ClaimsPage /> },
      { path: '/claims/compare', element: <ComparePage /> },
    ],
    { initialEntries },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}

describe('Compare page interactions', () => {
  it('opens a direct comparison URL and preserves both source records', () => {
    renderCompare(['/claims/compare?a=ATLAS-LEG-001&b=ATLAS-LEG-002']);
    expect(
      screen.getByRole('heading', { name: /Two-claim evidence comparison/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('compare-slot-a')).toHaveTextContent('ATLAS-LEG-001');
    expect(screen.getByTestId('compare-slot-b')).toHaveTextContent('ATLAS-LEG-002');
    expect(screen.getByTestId('compare-fields')).toHaveTextContent(/private foreign person/i);
    expect(screen.getByTestId('compare-fields')).toHaveTextContent(/foreign government/i);
  });

  it('removes and replaces selected claims via URL state', async () => {
    const user = userEvent.setup();
    const { router } = renderCompare(['/claims/compare?a=ATLAS-EMP-001&b=ATLAS-EMP-002']);
    const slotB = within(screen.getByTestId('compare-slot-b'));
    await user.click(slotB.getByRole('button', { name: /Remove/i }));
    await waitFor(() => {
      expect(router.state.location.search).toBe('?a=ATLAS-EMP-001');
    });

    await user.type(screen.getByLabelText(/Claim ID for slot b/i), 'ATLAS-HYP-004');
    await user.click(
      within(screen.getByTestId('compare-slot-b')).getByRole('button', { name: /Set claim/i }),
    );
    await waitFor(() => {
      expect(router.state.location.search).toContain('b=ATLAS-HYP-004');
    });
  });

  it('shows identical-ID notice and frames comparison as non-adjudicative', () => {
    renderCompare(['/claims/compare?a=ATLAS-HYP-001&b=ATLAS-HYP-001']);
    expect(screen.getByTestId('compare-identical-notice')).toBeInTheDocument();
    expect(screen.getByText(/does not adjudicate truth/i)).toBeInTheDocument();
    expect(screen.queryByText(/composite confidence|truth score|policy winner/i)).not.toBeInTheDocument();
  });
});

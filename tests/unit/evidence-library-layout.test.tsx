import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ClaimsPage } from '../../src/pages/ClaimsPage';
import { ClaimDetailPage } from '../../src/pages/ClaimDetailPage';
import { allClaims } from '../../src/data/researchDataset';
import { ATLAS_SOURCE_FIELDS } from '../../src/research/constants';

const originalMatchMedia = window.matchMedia;

function mockViewport(wide: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: wide,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function renderLibrary(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      { path: '/claims', element: <ClaimsPage /> },
      { path: '/claims/:claimId', element: <ClaimDetailPage /> },
    ],
    { initialEntries },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}

beforeEach(() => {
  mockViewport(true);
});

afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: originalMatchMedia,
  });
});

describe('Evidence library master-detail (≥1100px)', () => {
  it('shows the Evidence library heading, prominent search, and all 43 records', () => {
    renderLibrary(['/claims']);
    expect(screen.getByRole('heading', { level: 1, name: 'Evidence library' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByTestId('match-count')).toHaveTextContent('43 of 43 claims shown');
    const list = screen.getByRole('list', { name: 'Matching claims' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(allClaims.length);
  });

  it('keeps advanced filters behind progressive disclosure and opens it for active filters', () => {
    const { unmount } = renderLibrary(['/claims']);
    const details = screen.getByTestId('advanced-filters') as HTMLDetailsElement;
    expect(details).toHaveClass('advanced-filters');
    expect(details.open).toBe(false);
    unmount();

    renderLibrary(['/claims?mechanism_family=M1']);
    expect((screen.getByTestId('advanced-filters') as HTMLDetailsElement).open).toBe(true);
    expect(screen.getByTestId('active-filters')).toHaveTextContent('Mechanism family: M1');
  });

  it('renders the sticky inspector with all 18 source fields for the first result', () => {
    renderLibrary(['/claims']);
    const inspector = screen.getByTestId('inspector');
    expect(inspector).toHaveClass('inspector');
    const fields = within(screen.getByTestId('inspector-fields'));
    for (const field of ATLAS_SOURCE_FIELDS) {
      expect(fields.getByText(field)).toBeInTheDocument();
    }
    expect(screen.getByTestId('inspector-claim-id')).toHaveTextContent(allClaims
      .map((c) => c.claim_id)
      .sort((a, b) => a.localeCompare(b))[0]);
  });

  it('inspects a record without navigating and keeps selection distinct from inspection', async () => {
    const user = userEvent.setup();
    const { router } = renderLibrary(['/claims']);

    const emp002Row = screen.getByRole('link', { name: 'ATLAS-EMP-002', exact: true }).closest(
      '[data-claim-id]',
    ) as HTMLElement;
    await user.click(within(emp002Row).getByRole('button'));
    expect(router.state.location.pathname).toBe('/claims');
    expect(screen.getByTestId('inspector-claim-id')).toHaveTextContent('ATLAS-EMP-002');
    expect(screen.getByTestId('compare-selection')).toHaveTextContent('none');

    await user.click(
      screen.getByRole('checkbox', { name: 'Select ATLAS-EMP-005 for comparison' }),
    );
    expect(screen.getByTestId('compare-selection')).toHaveTextContent('ATLAS-EMP-005');
    // Selecting for comparison does not move the inspector.
    expect(screen.getByTestId('inspector-claim-id')).toHaveTextContent('ATLAS-EMP-002');
  });

  it('enables comparison for two selected claims from the compare bar', async () => {
    const user = userEvent.setup();
    renderLibrary(['/claims']);
    expect(screen.getByTestId('compare-tray')).toHaveTextContent('Select two claims to compare');
    await user.click(screen.getByRole('checkbox', { name: 'Select ATLAS-EMP-001 for comparison' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select ATLAS-EMP-002 for comparison' }));
    expect(screen.getByRole('link', { name: 'Open comparison' })).toHaveAttribute(
      'href',
      expect.stringContaining('/claims/compare?'),
    );
  });

  it('commits search and passes return state when opening the full page from the inspector', async () => {
    const user = userEvent.setup();
    const { router } = renderLibrary(['/claims?case=Case1']);
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'EMP-001');
    await waitFor(() => {
      expect(screen.getByTestId('inspector-claim-id')).toHaveTextContent('ATLAS-EMP-001');
    });
    await user.click(screen.getByTestId('inspector-open-full'));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/claims/ATLAS-EMP-001');
    });
    const state = router.state.location.state as { explorerSearch: string };
    expect(state.explorerSearch).toContain('case=Case1');
    expect(state.explorerSearch).toContain('q=EMP-001');
  });
});

describe('Evidence library list at narrow widths (<1100px)', () => {
  beforeEach(() => {
    mockViewport(false);
  });

  it('has no inspector and navigates to the full page with explorerSearch state', async () => {
    const user = userEvent.setup();
    const { router } = renderLibrary(['/claims?case=Case1']);
    expect(screen.queryByTestId('inspector')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'ATLAS-ASM-001', exact: true }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/claims/ATLAS-ASM-001');
    });
    expect(router.state.location.state).toMatchObject({
      explorerSearch: expect.stringContaining('case=Case1'),
    });
  });
});

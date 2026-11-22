import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ClaimsPage } from '../../src/pages/ClaimsPage';
import { ClaimDetailPage } from '../../src/pages/ClaimDetailPage';
import { ComparePage } from '../../src/pages/ComparePage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderExplorer(
  initialEntries: string[],
  initialIndex?: number,
) {
  const router = createMemoryRouter(
    [
      { path: '/claims', element: <ClaimsPage /> },
      { path: '/claims/compare', element: <ComparePage /> },
      { path: '/claims/:claimId', element: <ClaimDetailPage /> },
    ],
    {
      initialEntries,
      initialIndex: initialIndex ?? initialEntries.length - 1,
    },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}

describe('search commit and investigation navigation', () => {
  it('commits pending search before opening a claim so return navigation restores the subset', async () => {
    const user = userEvent.setup();
    const { router } = renderExplorer(['/claims?case=Case1']);

    const search = screen.getByRole('searchbox', { name: 'Search' });
    await user.type(search, 'EMP-001');
    // Navigate immediately — before debounce would normally flush.
    await user.click(screen.getByRole('link', { name: /Open claim ATLAS-EMP-001/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/claims/ATLAS-EMP-001');
    });
    expect(router.state.location.state).toMatchObject({
      explorerSearch: expect.stringContaining('case=Case1'),
    });
    expect((router.state.location.state as { explorerSearch: string }).explorerSearch).toContain(
      'q=EMP-001',
    );

    await user.click(
      within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole('link', {
        name: 'Claims Explorer',
      }),
    );
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/claims');
    });
    expect(router.state.location.search).toContain('case=Case1');
    expect(router.state.location.search).toContain('q=EMP-001');
  });

  it('commits pending search before copy-link and copies the committed URL', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderExplorer(['/claims']);
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'land banking');
    await user.click(screen.getByTestId('copy-filter-link'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
    const copied = String(writeText.mock.calls[0]?.[0] ?? '');
    expect(copied).toContain('/claims?');
    expect(copied).toContain('q=land');
    expect(screen.getByTestId('copy-link-feedback')).toHaveTextContent(/copied/i);
  });

  it('preserves draft search when another filter changes immediately', async () => {
    const user = userEvent.setup();
    const { router } = renderExplorer(['/claims']);
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'FIRB');
    await user.click(screen.getByRole('button', { name: 'Case2', exact: true }));
    await waitFor(() => {
      expect(router.state.location.search).toContain('case=Case2');
    });
    expect(router.state.location.search).toContain('q=FIRB');
  });

  it('scopes pending search so Back before debounce cannot overwrite M6 with M1+planning', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // History stack: M6 → M1 (current).
    const { router } = renderExplorer(
      ['/claims?mechanism_family=M6', '/claims?mechanism_family=M1'],
      1,
    );

    expect(router.state.location.search).toBe('?mechanism_family=M1');
    expect(screen.getByTestId('match-count')).toHaveTextContent('24 of 43');

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'planning');
    // Press Back before 200 ms debounce flushes the draft into the URL.
    await router.navigate(-1);
    await waitFor(() => {
      expect(router.state.location.search).toBe('?mechanism_family=M6');
    });

    await vi.advanceTimersByTimeAsync(250);

    expect(router.state.location.search).toBe('?mechanism_family=M6');
    expect(router.state.location.search).not.toMatch(/planning|q=/);
    expect(screen.getByTestId('match-count')).toHaveTextContent('14 of 43');
    vi.useRealTimers();
  });
});

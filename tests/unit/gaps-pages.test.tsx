import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../../src/components/layout/AppShell';
import { GapsPage } from '../../src/pages/GapsPage';
import { GapRequirementPage } from '../../src/pages/GapRequirementPage';

afterEach(() => {
  cleanup();
});

function renderGaps(initialPath = '/gaps') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="gaps" element={<GapsPage />} />
          <Route path="gaps/:requirementId" element={<GapRequirementPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('gaps pages', () => {
  it('renders overview without deferred badge on Evidence Gaps nav', () => {
    renderGaps();
    expect(screen.getByTestId('gaps-page')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const gapsLink = within(nav).getByRole('link', { name: /Evidence Gaps/i });
    expect(gapsLink).toHaveAttribute('href', '/gaps');
    expect(within(gapsLink).queryByText(/later/i)).toBeNull();
    expect(within(nav).getByText(/later/i)).toBeInTheDocument();
  });

  it('filters by case via URL and shows match count', async () => {
    const user = userEvent.setup();
    renderGaps('/gaps?case=Case3');
    const page = screen.getByTestId('gaps-page');
    expect(within(page).getByTestId('gaps-match-count')).toHaveTextContent(
      'Showing 4 of 19',
    );
    expect(within(page).getByTestId('gaps-req-REQ-C3-03')).toBeInTheDocument();

    const case1 = within(page).getByRole('checkbox', { name: /Case1/i });
    await user.click(case1);
    expect(within(page).getByTestId('gaps-match-count').textContent).toMatch(
      /Showing \d+ of 19/,
    );
  });

  it('shows not-found for invalid requirement routes', () => {
    renderGaps('/gaps/REQ-C9-99');
    expect(screen.getByTestId('requirement-not-found')).toBeInTheDocument();
  });

  it('inspects an individual requirement with source wording preserved', () => {
    renderGaps('/gaps/REQ-C3-04');
    const detail = screen.getByTestId('requirement-detail-REQ-C3-04');
    expect(
      within(detail).getByRole('heading', {
        name: '1. Original research requirement',
      }),
    ).toBeInTheDocument();
    expect(within(detail).getAllByText(/would weaken H1/i).length).toBeGreaterThan(
      0,
    );
    expect(
      within(detail).queryByText(
        /^The published research does not specify a sufficient empirical falsification test\.$/,
      ),
    ).toBeNull();
  });

  it('states unspecified falsification for legal verification requirements', () => {
    renderGaps('/gaps/REQ-C1-05');
    const detail = screen.getByTestId('requirement-detail-REQ-C1-05');
    expect(
      within(detail).getByText(
        /^The published research does not specify a sufficient empirical falsification test\.$/,
      ),
    ).toBeInTheDocument();
  });
});

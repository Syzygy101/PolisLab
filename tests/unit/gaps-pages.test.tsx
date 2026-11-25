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
  it('renders overview without deferred badge on Research gaps nav', () => {
    renderGaps();
    expect(screen.getByTestId('gaps-page')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const gapsLink = within(nav).getByRole('link', { name: /Research gaps/i });
    expect(gapsLink).toHaveAttribute('href', '/gaps');
    expect(within(gapsLink).queryByText(/later/i)).toBeNull();
    // Analytical Sandbox removed from primary nav in Build 08 (deferred; /sandbox URL only).
    expect(within(nav).queryByText(/later/i)).toBeNull();
    expect(within(nav).queryByRole('link', { name: /Sandbox/i })).toBeNull();
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

  it('titles the module "Research gaps" and lists all 19 published requirements', () => {
    renderGaps();
    expect(screen.getByRole('heading', { level: 1, name: 'Research gaps' })).toBeInTheDocument();
    expect(screen.getByTestId('gaps-match-count')).toHaveTextContent('Showing 19 of 19');
    expect(screen.getAllByTestId(/^gaps-req-REQ-/)).toHaveLength(19);
    expect(document.title).toBe('Research gaps · PolisLab');
  });

  it('retains entry points, agenda grouping, and assessment-changing themes', () => {
    renderGaps();
    expect(screen.getByTestId('gaps-entry-points')).toHaveTextContent(/Absence of finding/);
    expect(screen.getByTestId('gaps-entry-points')).toHaveTextContent(
      /claim-level limitations and assessment-changing observations/i,
    );
    expect(screen.getByTestId('gaps-entry-points')).toHaveTextContent(/research agenda/i);
    expect(screen.getByTestId('gaps-assessment-themes')).toBeInTheDocument();
    expect(screen.getByLabelText('Research agenda programme')).toBeInTheDocument();
  });

  it('preserves the return link from a requirement to the filtered list', () => {
    renderGaps('/gaps/REQ-C3-04?from=case%3DCase3');
    const back = screen.getByTestId('return-to-gaps');
    expect(back).toHaveTextContent('Research gaps');
    expect(back.getAttribute('href')).toContain('case=Case3');
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CasebookPage } from '../../src/pages/CasebookPage';
import { CaseDetailPage } from '../../src/pages/CaseDetailPage';
import { CasebookSourcePage } from '../../src/pages/CasebookSourcePage';
import { OverviewPage } from '../../src/pages/OverviewPage';
import { ClaimDetailPage } from '../../src/pages/ClaimDetailPage';
import { V011_EXPECTED_CASE_MEMBERSHIP } from '../../src/research/referenceExpectations';
import { RESEARCH_CASES } from '../../src/research/taxonomy';

afterEach(() => {
  cleanup();
});

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/casebook" element={<CasebookPage />} />
        <Route path="/casebook/source" element={<CasebookSourcePage />} />
        <Route path="/casebook/:caseId" element={<CaseDetailPage />} />
        <Route path="/claims/:claimId" element={<ClaimDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Casebook pages', () => {
  it('renders directory with four cases and dynamic claim counts', () => {
    renderApp('/casebook');
    expect(screen.getByTestId('casebook-directory')).toBeInTheDocument();
    for (const researchCase of RESEARCH_CASES) {
      const card = screen.getByTestId(`casebook-card-${researchCase.id}`);
      expect(within(card).getByText(researchCase.title)).toBeInTheDocument();
      expect(screen.getByTestId(`casebook-count-${researchCase.id}`)).toHaveTextContent(
        String(V011_EXPECTED_CASE_MEMBERSHIP[researchCase.id]),
      );
    }
    expect(screen.getByTestId('membership-overlap-note')).toHaveTextContent(/overlap/i);
  });

  it('renders Case 1 with ten navigable sections and R/E focus', () => {
    renderApp('/casebook/Case1');
    expect(screen.getByTestId('case-page-Case1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /What keeps a new supermarket out/i,
    );
    for (let n = 1; n <= 10; n += 1) {
      expect(screen.getByTestId(`case-section-${n}`)).toBeInTheDocument();
    }
    expect(screen.getByTestId('case1-re-focus')).toBeInTheDocument();
    expect(screen.getByTestId('cited-evidence-panel')).toHaveTextContent('Cited evidence (20)');
  });

  it('links inline atlas IDs to claim detail', async () => {
    const user = userEvent.setup();
    renderApp('/casebook/Case1');
    const links = screen.getAllByRole('link', { name: 'ATLAS-EMP-001' });
    expect(links.length).toBeGreaterThan(0);
    await user.click(links[0]);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/pipeline|undeveloped|unused/i);
  });

  it('shows invalid case state', () => {
    renderApp('/casebook/Case9');
    expect(screen.getByTestId('case-not-found')).toBeInTheDocument();
    expect(screen.getByText(/Case9/)).toBeInTheDocument();
  });

  it('exposes source document methodology view', () => {
    renderApp('/casebook/source');
    expect(screen.getByTestId('casebook-source-page')).toBeInTheDocument();
    // The comparison table heading is also listed in the on-page section rail, so
    // assert the published heading itself and the retained table content.
    expect(
      screen.getByRole('heading', { level: 2, name: /Four-case comparison table/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Source document sections' })).toBeInTheDocument();
    expect(document.querySelector('.case-table-wrap table')).not.toBeNull();
  });

  it('gives every case the same section rail, compact jump list, and 10 sections', () => {
    for (const researchCase of RESEARCH_CASES) {
      const { unmount } = renderApp(`/casebook/${researchCase.id}`);
      const rail = screen.getByRole('navigation', { name: 'Case sections' });
      // Ten numbered sections plus the cited-evidence index entry.
      expect(within(rail).getAllByRole('link')).toHaveLength(11);
      const jump = screen.getByTestId('case-section-jump');
      expect(jump.tagName).toBe('DETAILS');
      expect(within(jump).getAllByRole('link')).toHaveLength(11);
      for (let n = 1; n <= 10; n += 1) {
        expect(screen.getByTestId(`case-section-${n}`)).toHaveAttribute('id', `section-${n}`);
      }
      expect(screen.getByTestId('case-related')).toBeInTheDocument();
      expect(screen.getByTestId('case-gaps-link').getAttribute('href')).toContain(
        `case=${researchCase.id}`,
      );
      expect(screen.getByTestId('case-compare-policies')).toBeInTheDocument();
      unmount();
    }
  });

  it('retains the published comparison table in the closing source sections', () => {
    renderApp('/casebook/source');
    const wrappers = document.querySelectorAll('.case-table-wrap');
    expect(wrappers.length).toBeGreaterThan(0);
  });

  it('Overview primary action opens case investigation', () => {
    renderApp('/');
    const link = screen.getByTestId('case-investigate-link-Case1');
    expect(link).toHaveAttribute('href', '/casebook/Case1');
    expect(screen.getByTestId('case-claims-link-Case1').getAttribute('href')).toContain(
      'case=Case1',
    );
  });

  it('claim detail links to casebook investigations', () => {
    renderApp('/claims/ATLAS-EMP-001');
    expect(screen.getByTestId('claim-casebook-link-Case1')).toHaveAttribute(
      'href',
      '/casebook/Case1',
    );
  });
});

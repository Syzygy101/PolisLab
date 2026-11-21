import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OverviewPage } from '../../src/pages/OverviewPage';
import { ClaimsPage } from '../../src/pages/ClaimsPage';
import { ClaimDetailPage } from '../../src/pages/ClaimDetailPage';
import { allClaims } from '../../src/data/researchDataset';
import {
  V011_EXPECTED_CASE_MEMBERSHIP,
  V011_EXPECTED_STATUS_COUNTS,
} from '../../src/research/referenceExpectations';
import { RESEARCH_INSIGHTS, RESEARCH_BOUNDARIES } from '../../src/research/overviewContent';
import { RESEARCH_CASES } from '../../src/research/taxonomy';

afterEach(() => {
  cleanup();
});

function renderOverview(initial = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/claims/:claimId" element={<ClaimDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Overview page', () => {
  it('renders orientation, coverage, and dynamic case counts', () => {
    renderOverview();
    expect(
      screen.getByRole('heading', {
        name: /Institutions, market entry and grocery competition/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('coverage-metrics')).toHaveTextContent('43');
    expect(screen.getByTestId('coverage-metrics')).toHaveTextContent('Published claims');
    expect(screen.getByText(/not policy performance/i)).toBeInTheDocument();

    for (const researchCase of RESEARCH_CASES) {
      const card = screen.getByTestId(`case-card-${researchCase.id}`);
      expect(within(card).getByText(researchCase.title)).toBeInTheDocument();
      expect(screen.getByTestId(`case-count-${researchCase.id}`)).toHaveTextContent(
        String(V011_EXPECTED_CASE_MEMBERSHIP[researchCase.id]),
      );
    }

    const note = screen.getByTestId('case-membership-note');
    expect(note.textContent).toMatch(/Sum of direct memberships/);
    expect(note.textContent).not.toMatch(/63 unique/);
  });

  it('renders status distribution with expected counts and explorer links', () => {
    renderOverview();
    const chart = screen.getByTestId('status-distribution');
    expect(within(chart).getByText(String(V011_EXPECTED_STATUS_COUNTS.verified_legal_fact))).toBeInTheDocument();
    expect(within(chart).getByText(String(V011_EXPECTED_STATUS_COUNTS.empirical_finding))).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Filter Claims Explorer by status Verified legal fact/i,
      }),
    ).toHaveAttribute('href', '/claims?status=verified_legal_fact');
  });

  it('case action opens the corresponding filtered Claims Explorer', async () => {
    const user = userEvent.setup();
    renderOverview();
    await user.click(screen.getByTestId('case-claims-link-Case1'));
    expect(screen.getByRole('heading', { name: /Claims Explorer/i })).toBeInTheDocument();
    expect(screen.getByTestId('match-count')).toHaveTextContent(
      `${V011_EXPECTED_CASE_MEMBERSHIP.Case1} of ${allClaims.length} claims match filters`,
    );
    expect(screen.getByRole('button', { name: 'Case1', pressed: true })).toBeInTheDocument();
  });

  it('status action opens the corresponding filtered list', async () => {
    const user = userEvent.setup();
    renderOverview();
    await user.click(screen.getByTestId('status-link-absence_of_finding'));
    expect(screen.getByTestId('match-count')).toHaveTextContent(
      `${V011_EXPECTED_STATUS_COUNTS.absence_of_finding} of ${allClaims.length} claims match filters`,
    );
    expect(
      screen.getByRole('button', { name: 'absence of finding', pressed: true }),
    ).toBeInTheDocument();
  });

  it('outcome selection changes explanatory content and links to filtered claims', async () => {
    const user = userEvent.setup();
    renderOverview();
    await user.click(screen.getByRole('button', { name: /O6: Consumer welfare/i }));
    const panel = screen.getByTestId('outcome-stage-panel');
    expect(panel).toHaveTextContent(/Consumer welfare/i);
    expect(panel).toHaveTextContent(/no calibrated Australian diversion/i);
    expect(
      screen.getByRole('button', { name: /O6: Consumer welfare/i, pressed: true }),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId('outcome-claims-link-O6'));
    expect(screen.getByRole('heading', { name: /Claims Explorer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'O6', pressed: true })).toBeInTheDocument();
  });

  it('direct claim links from insights still resolve', async () => {
    const user = userEvent.setup();
    renderOverview();
    const insight = screen.getByTestId('insight-baseline-oversight');
    await user.click(within(insight).getAllByRole('link', { name: 'ATLAS-ASM-001' })[0]!);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Post-2026 Australian baseline/i,
    );
  });

  it('exposes in-page section navigation', () => {
    renderOverview();
    const nav = screen.getByTestId('overview-section-nav');
    expect(within(nav).getByRole('link', { name: 'Investigations' })).toHaveAttribute(
      'href',
      '#policy-investigations',
    );
  });

  it('preserves research integrity language on the Overview', () => {
    renderOverview();
    const body = document.body.textContent ?? '';

    expect(body).toMatch(/absence of finding is not proof of absence/i);
    expect(body).toMatch(/Layer D/i);
    expect(body).toMatch(/not existing legal rights or duties/i);
    expect(body).toMatch(/conceptual progression/i);
    expect(body).toMatch(/not an identified causal chain/i);
    expect(body).toMatch(/transaction-specific/i);
    expect(body).not.toMatch(/recommended policy winner/i);
    expect(body).toMatch(/not policy performance, confidence scores/i);
    expect(body).not.toMatch(/our confidence score is/i);

    // Admissibility vs truth is reinforced in existing Claims Explorer; Overview
    // must still avoid treating Layer D / hypotheses as law in force.
    expect(screen.getByTestId('layer-D')).toHaveTextContent(/not law in force/i);
    expect(screen.getByTestId('boundary-no-nationwide-landbanking')).toHaveTextContent(
      /not proof of absence/i,
    );
    expect(screen.getByTestId('insight-capacity-not-welfare')).toHaveTextContent(
      /do not independently establish durable competitive constraint or consumer welfare/i,
    );
    expect(screen.getByTestId('insight-baseline-oversight')).toHaveTextContent(
      /not an automatic prohibition/i,
    );
    expect(screen.getByTestId('overview-section-nav')).toBeInTheDocument();


    for (const insight of RESEARCH_INSIGHTS) {
      expect(screen.getByTestId(`insight-${insight.id}`)).toBeInTheDocument();
    }
    for (const boundary of RESEARCH_BOUNDARIES) {
      expect(screen.getByTestId(`boundary-${boundary.id}`)).toBeInTheDocument();
    }
  });
});

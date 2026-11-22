import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ComparisonPage } from '../../src/pages/ComparisonPage';
import { ClaimDetailPage } from '../../src/pages/ClaimDetailPage';
import { CaseDetailPage } from '../../src/pages/CaseDetailPage';

afterEach(() => {
  cleanup();
});

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="loc">{`${loc.pathname}${loc.search}`}</div>;
}

function renderComparison(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/comparison"
          element={
            <>
              <ComparisonPage />
              <LocationProbe />
            </>
          }
        />
        <Route path="/claims/:claimId" element={<ClaimDetailPage />} />
        <Route path="/casebook/:caseId" element={<CaseDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ComparisonPage', () => {
  it('renders orientation table and empty selection by default', () => {
    renderComparison('/comparison');
    expect(
      screen.getByRole('heading', { name: /Policy Comparison Laboratory/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('comparison-orientation')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-select-a')).toHaveValue('');
    expect(screen.getAllByText(/no variant selected/i).length).toBe(2);
  });

  it('loads a shareable pair and shows both sides', () => {
    renderComparison('/comparison?a=C1-VAR-R&b=C1-VAR-E');
    expect(screen.getByTestId('comparison-side-C1-VAR-R')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-side-C1-VAR-E')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-shared')).toBeInTheDocument();
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/comparison?a=C1-VAR-R&b=C1-VAR-E',
    );
  });

  it('surfaces invalid and duplicate URL notices', () => {
    renderComparison('/comparison?a=C9-BAD&b=C1-VAR-R');
    const notices = screen.getByTestId('comparison-url-notices');
    expect(within(notices).getByText(/Unknown variant ID/i)).toBeInTheDocument();

    cleanup();
    renderComparison('/comparison?a=C1-VAR-R&b=C1-VAR-R');
    expect(screen.getByTestId('comparison-url-notices')).toHaveTextContent(
      /distinct variants/i,
    );
  });

  it('updates the URL when selectors change', async () => {
    const user = userEvent.setup();
    renderComparison('/comparison');
    await user.selectOptions(screen.getByTestId('comparison-select-a'), 'C4-VAR-B0');
    await user.selectOptions(
      screen.getByTestId('comparison-select-b'),
      'C4-VAR-CF-STRONGER',
    );
    expect(screen.getByTestId('loc')).toHaveTextContent(
      'a=C4-VAR-B0&b=C4-VAR-CF-STRONGER',
    );
    expect(screen.getByTestId('comparison-side-C4-VAR-B0')).toBeInTheDocument();
  });

  it('links to cited claims from evidence uses', () => {
    renderComparison('/comparison?a=C1-VAR-R&b=C1-VAR-E');
    const claimLinks = screen.getAllByRole('link', { name: /ATLAS-/ });
    expect(claimLinks.length).toBeGreaterThan(0);
    expect(claimLinks[0]).toHaveAttribute('href', expect.stringMatching(/^\/claims\//));
  });
});

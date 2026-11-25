import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ComparisonPage } from '../../src/pages/ComparisonPage';
import { ClaimDetailPage } from '../../src/pages/ClaimDetailPage';
import { CaseDetailPage } from '../../src/pages/CaseDetailPage';

afterEach(() => {
  cleanup();
});

function LocationProbe() {
  const loc = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <div data-testid="loc">{`${loc.pathname}${loc.search}`}</div>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  );
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
  it('renders selectors, prompt and open orientation details on empty selection', () => {
    renderComparison('/comparison');
    expect(
      screen.getByRole('heading', { name: /Policy Comparison Laboratory/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('comparison-selector')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-select-a')).toHaveValue('');
    expect(screen.getByTestId('comparison-select-b')).toHaveValue('');
    expect(screen.getByTestId('comparison-empty-prompt')).toHaveTextContent(
      /Select two policies/i,
    );
    const orientation = screen.getByTestId('comparison-orientation');
    expect(orientation.tagName).toBe('DETAILS');
    expect(orientation).toHaveAttribute('open');
    expect(screen.queryByText(/no variant selected/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('comparison-bands')).not.toBeInTheDocument();
  });

  it('shows selectors before orientation and keeps orientation secondary on a selected URL', () => {
    renderComparison('/comparison?a=C1-VAR-R&b=C1-VAR-E');
    const selector = screen.getByTestId('comparison-selector');
    const bands = screen.getByTestId('comparison-bands');
    const orientation = screen.getByTestId('comparison-orientation');
    expect(orientation.tagName).toBe('DETAILS');
    expect(orientation).not.toHaveAttribute('open');
    expect(
      selector.compareDocumentPosition(orientation) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      bands.compareDocumentPosition(orientation) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByTestId('comparison-select-a')).toHaveValue('C1-VAR-R');
    expect(screen.getByTestId('comparison-select-b')).toHaveValue('C1-VAR-E');
  });

  it('loads a shareable pair and shows both sides in aligned bands', () => {
    renderComparison('/comparison?a=C1-VAR-R&b=C1-VAR-E');
    expect(screen.getByTestId('comparison-bands')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-side-C1-VAR-R')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-side-C1-VAR-E')).toBeInTheDocument();
    expect(screen.getByTestId('pathways-band')).toBeInTheDocument();
    expect(screen.getByTestId('outcomes-band')).toBeInTheDocument();
    expect(screen.getByTestId('requirements-band')).toBeInTheDocument();
    // Shared material renders once.
    expect(screen.getAllByTestId('comparison-shared')).toHaveLength(1);
    expect(screen.getAllByTestId('case-wide-outcomes')).toHaveLength(1);
    expect(screen.getAllByTestId('comparison-gaps-shared')).toHaveLength(1);
    expect(screen.getByTestId('comparison-gaps-C1-VAR-R')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-gaps-C1-VAR-E')).toBeInTheDocument();
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/comparison?a=C1-VAR-R&b=C1-VAR-E',
    );
  });

  it('renders each pathway polarity as its own aligned row', () => {
    renderComparison('/comparison?a=C1-VAR-R&b=C1-VAR-E');
    for (const key of ['favourable', 'unfavourable', 'null_path']) {
      expect(screen.getByTestId(`pathways-${key}`)).toBeInTheDocument();
    }
  });

  it('shows only one side and no twin empty column for a partial selection', () => {
    renderComparison('/comparison?a=C1-VAR-R');
    expect(screen.getByTestId('comparison-side-C1-VAR-R')).toBeInTheDocument();
    expect(screen.queryByTestId('comparison-shared')).not.toBeInTheDocument();
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

  it('keeps both rapid selections before the router commits and restores history', () => {
    renderComparison('/comparison?a=C1-VAR-R&b=C1-VAR-E');
    const a = screen.getByRole('combobox', { name: 'Variant A' });
    const b = screen.getByRole('combobox', { name: 'Variant B' });

    act(() => {
      fireEvent.change(a, { target: { value: 'C4-VAR-B0' } });
      fireEvent.change(b, { target: { value: 'C4-VAR-CF-STRONGER' } });
    });

    expect(screen.getByTestId('loc').textContent).toBe(
      '/comparison?a=C4-VAR-B0&b=C4-VAR-CF-STRONGER',
    );
    expect(a).toHaveValue('C4-VAR-B0');
    expect(b).toHaveValue('C4-VAR-CF-STRONGER');
    expect(screen.getByTestId('comparison-side-C4-VAR-B0')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-side-C4-VAR-CF-STRONGER')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(a).toHaveValue('C4-VAR-B0');
    expect(b).toHaveValue('C1-VAR-E');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(a).toHaveValue('C1-VAR-R');
    expect(b).toHaveValue('C1-VAR-E');
    fireEvent.click(screen.getByRole('button', { name: 'Forward' }));
    expect(a).toHaveValue('C4-VAR-B0');
    expect(b).toHaveValue('C1-VAR-E');

    fireEvent.change(a, { target: { value: '' } });
    expect(screen.getByTestId('loc').textContent).toBe('/comparison?b=C1-VAR-E');
  });

  it('links to cited claims from evidence uses', () => {
    renderComparison('/comparison?a=C1-VAR-R&b=C1-VAR-E');
    const claimLinks = screen.getAllByRole('link', { name: /ATLAS-/ });
    expect(claimLinks.length).toBeGreaterThan(0);
    expect(claimLinks[0]).toHaveAttribute('href', expect.stringMatching(/^\/claims\//));
  });
});

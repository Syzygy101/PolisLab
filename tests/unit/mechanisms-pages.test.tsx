import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MechanismsPage } from '../../src/pages/MechanismsPage';
import { MechanismDetailPage } from '../../src/pages/MechanismDetailPage';
import { ClaimsPage } from '../../src/pages/ClaimsPage';
import { AppShell } from '../../src/components/layout/AppShell';

afterEach(() => {
  cleanup();
});

function renderMechanisms(path = '/mechanisms') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/mechanisms" element={<MechanismsPage />} />
          <Route path="/mechanisms/:mechanismId" element={<MechanismDetailPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Mechanism Explorer pages', () => {
  it('renders overview coverage and activates Mechanisms nav', () => {
    renderMechanisms('/mechanisms');
    expect(screen.getByRole('heading', { level: 1, name: 'Mechanisms' })).toBeInTheDocument();
    expect(screen.getByTestId('family-count-M1')).toHaveTextContent('24');
    expect(screen.getByTestId('exact-count-M1')).toHaveTextContent('2');
    const nav = screen.getByRole('navigation', { name: /Primary/i });
    const mechanismsLink = within(nav).getByRole('link', { name: /^Mechanisms$/i });
    expect(mechanismsLink).toBeInTheDocument();
    expect(mechanismsLink).not.toHaveTextContent(/later/i);
    const comparisonLink = within(nav).getByRole('link', { name: /Compare policies/i });
    expect(comparisonLink).not.toHaveTextContent(/later/i);
    expect(within(nav).queryByText(/later/i)).toBeNull();
    expect(within(nav).queryByRole('link', { name: /Sandbox/i })).toBeNull();
  });

  it('navigates family card to M1 profile with family count 24', async () => {
    const user = userEvent.setup();
    renderMechanisms('/mechanisms');
    await user.click(screen.getByRole('link', { name: /Open M1 profile/i }));
    expect(screen.getByTestId('mechanism-profile-M1')).toBeInTheDocument();
    expect(screen.getByTestId('profile-family-count')).toHaveTextContent('24');
  });

  it('opens M1c profile with exact count 17', () => {
    renderMechanisms('/mechanisms/M1c');
    expect(screen.getByTestId('mechanism-profile-M1c')).toBeInTheDocument();
    expect(screen.getByTestId('profile-exact-count')).toHaveTextContent('17');
  });

  it('matrix M1×O1 and M3×O6 expose filtered evidence links', async () => {
    const user = userEvent.setup();
    renderMechanisms('/mechanisms');
    await user.click(screen.getByTestId('matrix-cell-M1-O1'));
    expect(screen.getByTestId('matrix-selection-count')).toHaveTextContent('23');
    expect(screen.getByTestId('matrix-claims-link')).toHaveAttribute(
      'href',
      '/claims?outcome=O1&mechanism_family=M1',
    );
    await user.click(screen.getByTestId('matrix-cell-M3-O6'));
    expect(screen.getByTestId('matrix-selection-count')).toHaveTextContent('6');
  });

  it('handles invalid mechanism IDs', () => {
    renderMechanisms('/mechanisms/M99');
    expect(screen.getByTestId('mechanism-not-found')).toBeInTheDocument();
    expect(screen.getByText(/M99/)).toBeInTheDocument();
  });

  it('documents contextual M5a subdivisions on the M5a profile', () => {
    renderMechanisms('/mechanisms/M5a');
    const panel = screen.getByTestId('contextual-subdivisions');
    expect(panel).toBeInTheDocument();
    expect(within(panel).getAllByText(/M5a-1/).length).toBeGreaterThan(0);
    expect(within(panel).getAllByText(/M5a-2/).length).toBeGreaterThan(0);
  });

  it('keeps six families, twelve exact submechanisms, and the 6×6 matrix', () => {
    renderMechanisms('/mechanisms');
    const overview = screen.getByTestId('mechanism-family-overview');
    expect(within(overview).getAllByTestId(/^mechanism-family-card-M[1-6]$/)).toHaveLength(6);
    expect(within(overview).getAllByTestId(/^submech-link-M\d[a-z]$/)).toHaveLength(12);
    const matrix = screen.getByTestId('mechanism-outcome-matrix');
    expect(within(matrix).getAllByTestId(/^matrix-cell-M[1-6]-O[1-6]$/)).toHaveLength(36);
    // Interactive cells are buttons in a plain table, not an ARIA grid without grid keyboard support.
    expect(within(matrix).queryByRole('grid')).toBeNull();
    expect(within(matrix).getByTestId('matrix-cell-M1-O1')).toHaveAttribute('aria-pressed', 'true');
  });

  it('labels each relationship type distinctly and uses no universal arrows', () => {
    renderMechanisms('/mechanisms');
    const types = screen.getByTestId('mechanism-relation-types');
    for (const label of [
      /Taxonomy membership/,
      /Metadata co-tagging/,
      /Published casebook \/ claim citation/,
      /Hypothesised mechanism/,
      /Competing explanation/,
    ]) {
      expect(within(types).getByText(label)).toBeInTheDocument();
    }
    expect(types).toHaveTextContent(/Directed arrows are not used for generic metadata co-tagging/);
    expect(screen.getByTestId('mechanism-outcome-matrix').textContent).not.toMatch(/[→↓↑←]/);
  });
});

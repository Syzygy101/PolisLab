import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ClaimsPage } from '../../src/pages/ClaimsPage';
import { ClaimDetailPage } from '../../src/pages/ClaimDetailPage';
import { allClaims } from '../../src/data/researchDataset';

afterEach(() => {
  cleanup();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/claims/:claimId" element={<ClaimDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Claims Explorer routes', () => {
  it('renders all authentic claims by default', () => {
    renderAt('/claims');
    expect(screen.getByRole('heading', { name: /Evidence library/i })).toBeInTheDocument();
    expect(screen.getByTestId('match-count')).toHaveTextContent(
      `${allClaims.length} of ${allClaims.length} claims shown`,
    );
    expect(screen.getByText('ATLAS-LEG-001')).toBeInTheDocument();
  });

  it('resolves claim detail routes to the correct record', () => {
    renderAt('/claims/ATLAS-CON-003');
    expect(screen.queryByRole('heading', { name: /Evidence library/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Inferring consumer welfare or durable competitive constraint/i,
    );
    expect(screen.getByText('All 18 source fields')).toBeInTheDocument();
    expect(screen.getAllByText('limitations_external_validity').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Policy-comparison admissibility/i })).toBeInTheDocument();
  });

  it('surfaces admissibility distinctions for ATLAS-HYP-002 without treating them as truth', () => {
    renderAt('/claims/ATLAS-HYP-002');
    expect(screen.getAllByText('Unresolved hypothesis').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { name: /Policy-comparison admissibility/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Admissibility is not a truth verdict/i)).toBeInTheDocument();
    expect(screen.getAllByText(/labelled qualitative caution/i).length).toBeGreaterThan(0);
    // Full long-form claim text remains accessible (not truncated away).
    expect(screen.getByRole('heading', { level: 1 }).textContent?.length ?? 0).toBeGreaterThan(
      400,
    );
  });

  it('shows an error state for invalid claim routes', () => {
    renderAt('/claims/ATLAS-DOES-NOT-EXIST');
    expect(screen.getByRole('heading', { name: /Claim not found/i })).toBeInTheDocument();
    expect(screen.getByText(/ATLAS-DOES-NOT-EXIST/)).toBeInTheDocument();
  });

  it('filters interactively and can reset', async () => {
    const user = userEvent.setup();
    renderAt('/claims');

    const search = screen.getByLabelText(/^Search$/i);
    await user.clear(search);
    await user.type(search, 'ATLAS-HYP-003');

    expect(screen.getByTestId('match-count')).toHaveTextContent('1 of 43 claims match filters');
    expect(screen.getByText('ATLAS-HYP-003')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reset filters/i }));
    expect(screen.getByTestId('match-count')).toHaveTextContent('43 of 43 claims shown');
    expect(within(screen.getByRole('list', { name: 'Matching claims' })).getByText('ATLAS-LEG-001')).toBeInTheDocument();
  });
});

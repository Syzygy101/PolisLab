import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RelatedEvidencePanel } from '../../src/components/claims/RelatedEvidencePanel';
import { allClaims, findClaimById } from '../../src/data/researchDataset';

afterEach(() => {
  cleanup();
});

describe('RelatedEvidencePanel progressive disclosure', () => {
  it('keeps ASM-002 related evidence navigable via dimension filter and disclosure', async () => {
    const user = userEvent.setup();
    const claim = findClaimById('ATLAS-ASM-002');
    if (!claim) {
      throw new Error('missing ASM-002');
    }
    render(
      <MemoryRouter>
        <RelatedEvidencePanel claim={claim} claims={allClaims} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('related-count')).toHaveTextContent('42 of 42');
    expect(screen.getByTestId('related-toggle')).toHaveTextContent(/Show all 42/);
    expect(screen.queryByText('ATLAS-ASM-002')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mechanism', pressed: false }));
    expect(screen.getByTestId('related-count').textContent).toMatch(/of 42 associated/);
    expect(screen.getByRole('button', { name: 'Mechanism', pressed: true })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All associations' }));
    await user.click(screen.getByTestId('related-toggle'));
    expect(screen.getByTestId('related-toggle')).toHaveTextContent(/Show fewer/);
    expect(screen.getByText(/Metadata association is not causal/i)).toBeInTheDocument();
  });
});

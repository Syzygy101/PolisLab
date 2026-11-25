import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CompareView } from '../../src/components/claims/CompareView';
import { ClaimDetailView } from '../../src/components/claims/ClaimDetailView';
import { findClaimById } from '../../src/data/researchDataset';
import { parseCompareState } from '../../src/research/compareUrl';

afterEach(() => {
  cleanup();
});

const REQUIRED_COMPARE_LABELS = [
  'Exact claim',
  'Evidentiary status',
  'What the source establishes',
  'Limitations / external validity',
  'Competing mechanism or contrary evidence',
  'Admissibility in policy comparison',
  'Admissibility conditions',
  'Observation that would alter assessment',
  'Source title',
  'Source URL',
  'Pinpoint',
];

function renderPair(a: string, b: string) {
  const state = parseCompareState(new URLSearchParams(`a=${a}&b=${b}`), findClaimById);
  return render(
    <MemoryRouter>
      <CompareView state={state} onSetSlot={() => undefined} />
    </MemoryRouter>,
  );
}

describe('comparison and detail research integrity', () => {
  it.each([
    ['ATLAS-EMP-001', 'ATLAS-EMP-002'],
    ['ATLAS-EMP-005', 'ATLAS-HYP-004'],
    ['ATLAS-LEG-001', 'ATLAS-LEG-002'],
    ['ATLAS-HYP-001', 'ATLAS-POL-001'],
  ] as const)('exposes complete original fields for %s vs %s', (a, b) => {
    renderPair(a, b);
    const fields = screen.getByTestId('compare-fields');
    for (const label of REQUIRED_COMPARE_LABELS) {
      expect(within(fields).getByText(label)).toBeInTheDocument();
    }
    const left = findClaimById(a)!;
    const right = findClaimById(b)!;
    expect(fields).toHaveTextContent(left.exact_claim.slice(0, 40));
    expect(fields).toHaveTextContent(right.exact_claim.slice(0, 40));
    expect(fields).toHaveTextContent(left.limitations_external_validity.slice(0, 24));
    expect(fields).toHaveTextContent(right.admissibility_conditions.slice(0, 24));
    expect(screen.queryByText(/contradiction detected|confidence score|policy winner/i)).not.toBeInTheDocument();
  });

  it('preserves HYP-002 analytical-use limits and HYP-003 missing URL in detail', () => {
    const hyp002 = findClaimById('ATLAS-HYP-002')!;
    const { rerender } = render(
      <MemoryRouter>
        <ClaimDetailView claim={hyp002} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/no — not admissible as a validated analytical result/i)).toBeInTheDocument();
    expect(screen.getAllByText(/labelled qualitative caution/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Admissibility is not a truth verdict/i)).toBeInTheDocument();

    const hyp003 = findClaimById('ATLAS-HYP-003')!;
    rerender(
      <MemoryRouter>
        <ClaimDetailView claim={hyp003} />
      </MemoryRouter>,
    );
    expect(
      screen.getAllByText(/No public primary URL in the published atlas/i).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /^https?:/i })).not.toBeInTheDocument();
  });

  it('does not style admissibility as an ordinal pass/fail quality score', () => {
    renderPair('ATLAS-HYP-002', 'ATLAS-EMP-001');
    const yes = screen.getAllByText('Admissible: yes')[0];
    const no = screen.getAllByText('Admissible: no')[0];
    expect(yes?.className).not.toMatch(/ok-soft|text-ok/);
    expect(no?.className).not.toMatch(/ok-soft|text-ok/);
  });
});

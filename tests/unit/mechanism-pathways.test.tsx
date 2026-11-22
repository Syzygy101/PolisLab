import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MechanismPathway } from '../../src/components/mechanisms/MechanismPathway';
import { MECHANISM_EXPLANATIONS } from '../../src/research/mechanismExplanations';
import { findClaimById } from '../../src/data/researchDataset';
import { casebookDataset } from '../../src/data/casebookDataset';

afterEach(() => {
  cleanup();
});

describe('mechanism pathway wording and references', () => {
  const siteControl = MECHANISM_EXPLANATIONS.find(
    (item) => item.id === 'site-control-identification',
  )!;

  it('renders human-readable relation wording for M1 foreclosure as a possible explanation', () => {
    render(
      <MemoryRouter>
        <MechanismPathway explanation={siteControl} />
      </MemoryRouter>,
    );
    const edges = screen.getByTestId('pathway-edges-site-control-identification');
    expect(edges).toHaveTextContent(
      /Strategic foreclosure is a possible explanation for the observed site pattern/i,
    );
    expect(edges).toHaveTextContent(/compatible with/i);
    expect(edges).toHaveTextContent(/evidence limit/i);
    // Must not dump raw node ids as the sole edge wording.
    expect(edges.textContent).not.toMatch(/\bobs\s*→\s*m1c\b/);
  });

  it('validates curated claim, case-section, and pathway node references', () => {
    for (const explanation of MECHANISM_EXPLANATIONS) {
      const nodeIds = new Set(explanation.nodes.map((n) => n.id));
      for (const edge of explanation.edges) {
        expect(nodeIds.has(edge.from), `${explanation.id} edge from ${edge.from}`).toBe(
          true,
        );
        expect(nodeIds.has(edge.to), `${explanation.id} edge to ${edge.to}`).toBe(true);
      }
      for (const source of explanation.sources) {
        if (source.kind === 'claim') {
          expect(findClaimById(source.id), source.id).toBeTruthy();
        } else if (source.caseId && source.section) {
          const researchCase = casebookDataset.cases.find((c) => c.id === source.caseId);
          expect(researchCase, source.id).toBeTruthy();
          expect(
            researchCase?.sections.some((s) => s.number === source.section),
            source.id,
          ).toBe(true);
        }
      }
    }
  });

  it('labels competing compatibility and distinction relations distinctly', () => {
    const incumbent = MECHANISM_EXPLANATIONS.find(
      (item) => item.id === 'incumbent-response',
    )!;
    render(
      <MemoryRouter>
        <MechanismPathway explanation={incumbent} />
      </MemoryRouter>,
    );
    const edges = screen.getByTestId('pathway-edges-incumbent-response');
    expect(within(edges).getByText(/distinct from/i)).toBeInTheDocument();
    expect(within(edges).getByText(/does not imply/i)).toBeInTheDocument();
  });
});

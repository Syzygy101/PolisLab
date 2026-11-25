import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CasebookMarkdown } from '../../src/components/casebook/CasebookMarkdown';
import { isSafeHttpUrl } from '../../src/research/safeUrl';
import { splitTextWithClaimIds } from '../../src/research/casebookCitations';
import { ingestCasebookMarkdown, ResearchIngestError } from '../../src/research/index.ts';

afterEach(() => {
  cleanup();
});

function renderMd(markdown: string) {
  return render(
    <MemoryRouter>
      <CasebookMarkdown markdown={markdown} claimReturn={{ caseId: 'Case1', section: 2 }} />
    </MemoryRouter>,
  );
}

describe('casebook Markdown and link safety fixtures', () => {
  it('does not turn non-ATLAS text into claim links', () => {
    renderMd('Pipeline counts remain descriptive. ATLAS-EMP-001 anchors the fact.');
    expect(screen.getByText(/Pipeline counts remain descriptive/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'ATLAS-EMP-001' });
    expect(link).toHaveAttribute('href', '/claims/ATLAS-EMP-001');
    // Surrounding sentence still present as text (qualification not dropped).
    expect(screen.getByText(/anchors the fact/)).toBeInTheDocument();
  });

  it('preserves emphasis and table cell qualifications around claim IDs', () => {
    renderMd(
      '| Element | Atlas |\n| --- | --- |\n| **Baseline** remains qualified | **ATLAS-ASM-001** |\n',
    );
    expect(screen.getByText(/Baseline/)).toBeInTheDocument();
    expect(screen.getByText(/remains qualified/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ATLAS-ASM-001' })).toBeInTheDocument();
  });

  it('does not make javascript: or data: URLs clickable', () => {
    renderMd('See [x](javascript:alert(1)) and [y](data:text/html,hi) and [ok](https://example.gov.au/a).');
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(document.querySelector('a[href^="data:"]')).toBeNull();
    expect(screen.getByRole('link', { name: 'ok' })).toHaveAttribute(
      'href',
      'https://example.gov.au/a',
    );
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,hi')).toBe(false);
  });

  it('splitTextWithClaimIds does not consume adjacent qualification text', () => {
    const parts = splitTextWithClaimIds(
      'Absence of finding (ATLAS-EMP-002) is not proof of absence.',
    );
    expect(parts).toEqual([
      { type: 'text', value: 'Absence of finding (' },
      { type: 'claim', id: 'ATLAS-EMP-002' },
      { type: 'text', value: ') is not proof of absence.' },
    ]);
  });

  it('rejects embedded HTML in casebook ingest fixtures', () => {
    const md = `# Policy Assessment Casebook

## How to use this casebook

**Hard rules** (**ATLAS-ASM-002**; **ATLAS-CON-003** — all cases)

## Case 1 — Undeveloped supermarket sites

### 1. Precise policy question

Hello <img src=x onerror=alert(1)>

### 2. Legally accurate baseline

x

### 3. Counterfactual interventions (defined)

x

### 4. Affected causal mechanisms

x

### 5. What existing evidence supports or contradicts

x

### 6. Plausible favourable, unfavourable and null pathways

x

### 7. Which O1–O6 outcomes can be assessed

x

### 8. What cannot currently be inferred

x

### 9. Evidence that would materially change the answer

x

### 10. Carefully qualified conclusion

x

## Case 2 — Foreign greenfield grocery investment

### 1. Precise policy question

x

### 2. Legally accurate baseline

x

### 3. Counterfactual intervention

x

### 4. Affected causal mechanisms

x

### 5. What existing evidence supports or contradicts

x

### 6. Plausible favourable, unfavourable and null pathways

x

### 7. Which O1–O6 outcomes can be assessed

x

### 8. What cannot currently be inferred

x

### 9. Evidence that would materially change the answer

x

### 10. Carefully qualified conclusion

x

## Case 3 — Differentiated entry and scale-up

### 1. Precise policy question

x

### 2. Legally accurate baseline

x

### 3. Counterfactual intervention

x

### 4. Affected causal mechanisms

x

### 5. What existing evidence supports or contradicts

x

### 6. Plausible favourable, unfavourable and null pathways

x

### 7. Which O1–O6 outcomes can be assessed

x

### 8. What cannot currently be inferred

x

### 9. Evidence that would materially change the answer

x

### 10. Carefully qualified conclusion

x

## Case 4 — Supermarket acquisition oversight

### 1. Precise policy question

x

### 2. Legally accurate baseline

x

### 3. Counterfactual intervention

x

### 4. Affected causal mechanisms

x

### 5. What existing evidence supports or contradicts

x

### 6. Plausible favourable, unfavourable and null pathways

x

### 7. Which O1–O6 outcomes can be assessed

x

### 8. What cannot currently be inferred

x

### 9. Evidence that would materially change the answer

x

### 10. Carefully qualified conclusion

x

## Four-case comparison table

done
`;
    expect(() => ingestCasebookMarkdown(md)).toThrow(ResearchIngestError);
    expect(() => ingestCasebookMarkdown(md)).toThrow(/embedded HTML/i);
  });
});

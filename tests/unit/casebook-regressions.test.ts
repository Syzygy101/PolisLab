import { describe, expect, it } from 'vitest';
import { casebookDataset } from '../../src/data/casebookDataset.ts';
import { findClaimById } from '../../src/data/researchDataset.ts';

function caseBody(id: 'Case1' | 'Case2' | 'Case3' | 'Case4') {
  return casebookDataset.cases.find((c) => c.id === id)!;
}

describe('casebook research regressions', () => {
  it('Case1 preserves R/E distinctions and adverse pathways', () => {
    const c = caseBody('Case1');
    const question = c.sections.find((s) => s.number === 1)!.markdown;
    expect(question).toMatch(/Develop-or-release/i);
    expect(question).toMatch(/Exclusivity restriction/i);
    const interventions = c.sections.find((s) => s.number === 3)!.markdown;
    expect(interventions).toMatch(/That released sites go to rivals/i);
    expect(interventions).toMatch(/Layer D/i);
    expect(interventions).toMatch(/Grocery exclusivity/i);
    const pathways = c.sections.find((s) => s.number === 6)!.markdown;
    expect(pathways).toContain('R (develop-or-release)');
    expect(pathways).toContain('E (exclusivity restriction)');
    expect(pathways).toMatch(/Unfavourable/i);
    expect(pathways).toMatch(/option value/i);
    const baseline = c.sections.find((s) => s.number === 2)!.markdown;
    expect(baseline).toMatch(/40% cap is Layer D only/i);
    const hyp002 = findClaimById('ATLAS-HYP-002')!;
    expect(hyp002.admissible_in_policy_comparison).toBe('no');
    expect(c.membershipClaimIds).toContain('ATLAS-HYP-002');
  });

  it('Case2 preserves private/FGI and trigger/condition distinctions', () => {
    const c = caseBody('Case2');
    const baseline = c.sections.find((s) => s.number === 2)!.markdown;
    expect(baseline).toContain('T1');
    expect(baseline).toContain('FGI contrast');
    expect(baseline).toMatch(/typical.*conditions/i);
    expect(baseline).toMatch(/60–240 month/i);
    const cf = c.sections.find((s) => s.number === 3)!.markdown;
    expect(cf).toContain('CF-A');
    expect(cf).toContain('CF-B');
    expect(cf).toContain('CF-C');
    expect(cf).toContain('CF-D');
    expect(cf).toMatch(/Turn off FIRB for all foreign grocery entry/i);
    const cannot = c.sections.find((s) => s.number === 8)!.markdown;
    expect(cannot).toMatch(/performance targets/i);
    expect(cannot).toMatch(/binding entitlements/i);
  });

  it('Case3 preserves chronology versus causal identification', () => {
    const c = caseBody('Case3');
    const baseline = c.sections.find((s) => s.number === 2)!.markdown;
    expect(baseline).toMatch(/pre-2026/i);
    expect(baseline).toMatch(/historical mechanism test/i);
    const evidence = c.sections.find((s) => s.number === 5)!.markdown;
    expect(evidence).toMatch(/November 2015/i);
    expect(evidence).toMatch(/29.*SA/i);
    expect(evidence).toMatch(/41.*WA/i);
    const outcomes = c.sections.find((s) => s.number === 7)!.markdown;
    expect(outcomes).toMatch(/best-supported/i);
    expect(outcomes).toMatch(/\*\*O2\*\*/);
    const cannot = c.sections.find((s) => s.number === 8)!.markdown;
    expect(cannot).toMatch(/logistics \*\*bound\*\*/i);
    expect(c.membershipClaimIds).toContain('ATLAS-HYP-004');
  });

  it('Case4 preserves waiver vs clearance, Kalgoorlie voluntary notify, release-dated Tribunal', () => {
    const c = caseBody('Case4');
    const baseline = c.sections.find((s) => s.number === 2)!.markdown;
    expect(baseline).toMatch(/Notification waiver/i);
    expect(baseline).toMatch(/cleared as pro-competitive/i);
    expect(baseline).toMatch(/voluntarily notified/i);
    const evidence = c.sections.find((s) => s.number === 5)!.markdown;
    expect(evidence).toMatch(/27 November 2025/i);
    expect(evidence).toMatch(/final disposition of the ACCC refusal/i);
    expect(evidence).toMatch(/ACT 1 of 2026/i);
    const cannot = c.sections.find((s) => s.number === 8)!.markdown;
    expect(cannot).toMatch(/waiver grants mean acquisitions are competitively harmless/i);
    const conclusion = c.sections.find((s) => s.number === 10)!.markdown;
    expect(conclusion).toMatch(/competition scoreboard/i);
  });

  it('common O1–O6 inference restrictions and no policy winner', () => {
    expect(casebookDataset.frontMatterMarkdown).toMatch(/Access ≠ capacity ≠ viability/i);
    expect(casebookDataset.commonRuleClaimIds).toContain('ATLAS-ASM-002');
    expect(casebookDataset.commonRuleClaimIds).toContain('ATLAS-CON-003');
    const comparison = casebookDataset.closingParts.find(
      (p) => p.id === 'four-case-comparison-table',
    )!;
    expect(comparison.markdown).toMatch(/None declared/g);
    const winners = comparison.markdown.match(/None declared/g) ?? [];
    expect(winners.length).toBeGreaterThanOrEqual(4);
    for (const researchCase of casebookDataset.cases) {
      const conclusion = researchCase.sections.find((s) => s.number === 10)!.markdown;
      expect(conclusion.toLowerCase()).not.toMatch(/policy winner is/);
      expect(conclusion).not.toMatch(/predicted welfare gain of \d/i);
    }
  });
});

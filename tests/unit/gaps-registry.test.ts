import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { allClaims, findClaimById } from '../../src/data/researchDataset';
import { casebookDataset } from '../../src/data/casebookDataset';
import {
  GAPS_REGISTRY,
  GAPS_SOURCE_CONTENT_SHA256,
  V011_EXPECTED_REQUIREMENT_COUNTS,
  V011_EXPECTED_REQUIREMENT_TOTAL,
} from '../../src/research/gapsRequirements';
import {
  computeGapsAtlasCounts,
  filterResearchRequirements,
  partitionComparisonRequirements,
  validateGapsRegistry,
  EMPTY_GAPS_FILTERS,
} from '../../src/research/gapsQueries';
import { parseSection9Items, sourceTextsMatch } from '../../src/research/gapsParse';
import { COMPARISON_DATASET } from '../../src/research/comparisonDataset';

const KNOWN_VARIANTS = COMPARISON_DATASET.variants.map((v) => ({
  id: v.id,
  caseId: v.caseId,
}));

describe('gaps research-requirements registry', () => {
  it('validates against atlas and casebook §9 source text', () => {
    const result = validateGapsRegistry(
      GAPS_REGISTRY,
      allClaims,
      casebookDataset,
      KNOWN_VARIANTS,
    );
    expect(result.issues, JSON.stringify(result.issues, null, 2)).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('pins provenance to the published casebook SHA', () => {
    const onDisk = createHash('sha256')
      .update(readFileSync(path.resolve('research/10_policy_assessment_casebook.md')))
      .digest('hex');
    expect(onDisk).toBe(GAPS_SOURCE_CONTENT_SHA256);
    expect(GAPS_REGISTRY.provenance.sourceContentSha256).toBe(GAPS_SOURCE_CONTENT_SHA256);
    expect(casebookDataset.provenance.sourceContentSha256).toBe(GAPS_SOURCE_CONTENT_SHA256);
  });

  it('preserves all 19 numbered §9 source entries without merging', () => {
    expect(GAPS_REGISTRY.requirements).toHaveLength(V011_EXPECTED_REQUIREMENT_TOTAL);
    for (const [caseId, expected] of Object.entries(V011_EXPECTED_REQUIREMENT_COUNTS)) {
      expect(
        GAPS_REGISTRY.requirements.filter((r) => r.caseId === caseId),
      ).toHaveLength(expected);
    }
    const ids = GAPS_REGISTRY.requirements.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('matches each registry sourceText to parsed casebook §9 markdown', () => {
    for (const req of GAPS_REGISTRY.requirements) {
      const researchCase = casebookDataset.cases.find((c) => c.id === req.caseId)!;
      const section9 = researchCase.sections.find((s) => s.number === 9)!;
      const parsed = parseSection9Items(section9.markdown);
      const item = parsed.find((p) => p.itemNumber === req.itemNumber)!;
      expect(sourceTextsMatch(req.sourceText, item.sourceText)).toBe(true);
    }
  });

  it('does not treat GAP prefix as the sole evidence-gap set', () => {
    const counts = computeGapsAtlasCounts(allClaims);
    expect(counts.gapPrefixed).toBe(4);
    expect(counts.absenceOfFinding).toBe(6);
    expect(counts.unresolvedHypothesis).toBe(4);
    expect(counts.gapPrefixed).toBeLessThan(counts.absenceOfFinding);
    // Sum is not a unique unresolved-question count — groups overlap conceptually.
    expect(counts.absenceOfFinding + counts.unresolvedHypothesis).toBe(10);
  });

  it('retains HYP-004 absence_of_finding and HYP-002 analytical restrictions', () => {
    const hyp004 = findClaimById('ATLAS-HYP-004')!;
    expect(hyp004.status).toBe('absence_of_finding');
    const hyp002 = findClaimById('ATLAS-HYP-002')!;
    expect(hyp002.status).toBe('unresolved_hypothesis');
    expect(hyp002.admissible_in_policy_comparison).toBe('no');
  });

  it('distinguishes legal verification from empirical falsification', () => {
    const legal = GAPS_REGISTRY.requirements.filter(
      (r) => r.requirementType === 'legal_institutional_verification',
    );
    expect(legal.map((r) => r.id).sort()).toEqual([
      'REQ-C1-05',
      'REQ-C2-05',
      'REQ-C4-01',
      'REQ-C4-05',
    ]);
    for (const req of legal) {
      expect(req.falsificationUnspecified).toBe(true);
      expect(req.qualification).toMatch(/legal|institutional/i);
    }
  });

  it('keeps Case3 §9.3 linked to ATLAS-GAP-002 and Case3 §9.4 weaken role', () => {
    const diversion = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C3-03')!;
    expect(diversion.referencedClaimIds).toEqual(['ATLAS-GAP-002']);
    expect(diversion.sourceText).toContain('ATLAS-GAP-002');
    const weaken = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C3-04')!;
    expect(weaken.observationRole).toBe('weaken_proposition');
    expect(weaken.sourceText).toMatch(/weaken H1/i);
  });

  it('filters by case and agenda without inventing relationships', () => {
    const case1 = filterResearchRequirements(
      { ...EMPTY_GAPS_FILTERS, cases: ['Case1'] },
      allClaims,
    );
    expect(case1).toHaveLength(5);
    expect(case1.every((r) => r.caseId === 'Case1')).toBe(true);

    const legalAgenda = filterResearchRequirements(
      { ...EMPTY_GAPS_FILTERS, agenda: 'legal-feasibility-institutional' },
      allClaims,
    );
    expect(legalAgenda.map((r) => r.id).sort()).toEqual([
      'REQ-C1-05',
      'REQ-C2-05',
      'REQ-C4-01',
      'REQ-C4-05',
    ]);
  });

  it('rejects unsupported claim membership when mutated', () => {
    const clone = structuredClone(GAPS_REGISTRY);
    const target = clone.requirements.find((r) => r.id === 'REQ-C1-01')!;
    target.referencedClaimIds = ['ATLAS-GAP-003']; // Case4-only claim
    const result = validateGapsRegistry(
      clone,
      allClaims,
      casebookDataset,
      KNOWN_VARIANTS,
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => /not a member of Case1/.test(i.message))).toBe(
      true,
    );
  });

  it('rejects stale or corrupted sourceText against casebook §9', () => {
    const clone = structuredClone(GAPS_REGISTRY);
    const target = clone.requirements.find((r) => r.id === 'REQ-C1-03')!;
    target.sourceText = 'Stale invented requirement text that is not in the casebook.';
    const result = validateGapsRegistry(
      clone,
      allClaims,
      casebookDataset,
      KNOWN_VARIANTS,
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (i) =>
          i.path === 'REQ-C1-03.sourceText' ||
          /source text drift/i.test(i.message) ||
          /Source text drift/i.test(i.message),
      ),
      JSON.stringify(result.issues, null, 2),
    ).toBe(true);
  });

  it('rejects omitted requirement count when an entry is removed', () => {
    const clone = structuredClone(GAPS_REGISTRY);
    clone.requirements = clone.requirements.filter((r) => r.id !== 'REQ-C3-04');
    const result = validateGapsRegistry(
      clone,
      allClaims,
      casebookDataset,
      KNOWN_VARIANTS,
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (i) => /Expected 19/.test(i.message) || /Case3/.test(i.message),
      ),
    ).toBe(true);
  });

  it('keeps Part 3 preemption requirement case-wide (not all-variants assignment)', () => {
    const req = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C4-03')!;
    expect(req.comparisonVariantIds).toBeNull();
  });

  it('marks agenda programmes as organisational only', () => {
    expect(
      GAPS_REGISTRY.agendaProgrammes.every((p) => p.organisationalOnly === true),
    ).toBe(true);
  });
});

describe('comparison requirement partitioning', () => {
  it('shows shared case-wide requirements once for same-case variants', () => {
    const part = partitionComparisonRequirements(
      { id: 'C1-VAR-R', caseId: 'Case1' },
      { id: 'C1-VAR-E', caseId: 'Case1' },
    );
    expect(part.sameCase).toBe(true);
    expect(part.sharedCaseWide.map((r) => r.id).sort()).toEqual([
      'REQ-C1-01',
      'REQ-C1-03',
    ]);
    expect(part.sideA.map((r) => r.id).sort()).toEqual(['REQ-C1-02', 'REQ-C1-05']);
    expect(part.sideB.map((r) => r.id)).toEqual(['REQ-C1-04']);
    for (const shared of part.sharedCaseWide) {
      expect(part.sideA.some((r) => r.id === shared.id)).toBe(false);
      expect(part.sideB.some((r) => r.id === shared.id)).toBe(false);
    }
  });

  it('preserves per-case scope for cross-case comparisons', () => {
    const part = partitionComparisonRequirements(
      { id: 'C1-VAR-R', caseId: 'Case1' },
      { id: 'C4-VAR-B0', caseId: 'Case4' },
    );
    expect(part.sameCase).toBe(false);
    expect(part.sharedCaseWide).toEqual([]);
    expect(part.sideA.every((r) => r.caseId === 'Case1')).toBe(true);
    expect(part.sideB.every((r) => r.caseId === 'Case4')).toBe(true);
    expect(part.sideA.some((r) => r.id === 'REQ-C1-02')).toBe(true);
    expect(part.sideB.some((r) => r.id === 'REQ-C4-03')).toBe(true);
  });
});

describe('gaps adversarial research scenarios', () => {
  it('does not declare strategic foreclosure disproven from absence of finding', () => {
    const emp002 = findClaimById('ATLAS-EMP-002')!;
    expect(emp002.status).toBe('absence_of_finding');
    const req = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C1-01')!;
    expect(req.qualification).toMatch(/not proof that foreclosure is absent/i);
    expect(req.qualification + req.remainsUncertain).not.toMatch(
      /disproven|falsified|refuted/i,
    );
  });

  it('does not infer binding logistics from ALDI chronology', () => {
    const hyp004 = findClaimById('ATLAS-HYP-004')!;
    expect(hyp004.status).toBe('absence_of_finding');
    const req = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C3-01')!;
    expect(req.qualification).toMatch(/does not identify a binding logistics constraint/i);
  });

  it('does not present FIRB delay estimates without transaction-specific evidence', () => {
    const req = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C2-01')!;
    expect(req.qualification).toMatch(/transaction-specific/i);
    expect(req.qualification + req.remainsUncertain).not.toMatch(
      /\d+\s*(year|month|week)/i,
    );
  });

  it('does not treat foreign diversion as Australian calibration', () => {
    const req = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C3-03')!;
    expect(req.qualification).toMatch(/foreign diversion/i);
    expect(req.qualification).toMatch(/Australian calibration/i);
  });

  it('does not treat notification activity as realised competition', () => {
    const req = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C4-02')!;
    expect(req.qualification).toMatch(/not realised market competition/i);
  });

  it('does not represent proposed observations as already collected', () => {
    for (const req of GAPS_REGISTRY.requirements) {
      expect(req.assessmentChangingNote + req.remainsUncertain).not.toMatch(
        /already (collected|observed|measured)|study completed|results show/i,
      );
    }
  });

  it('does not automatically change atlas claim status', () => {
    const before = allClaims.map((c) => ({ id: c.claim_id, status: c.status }));
    validateGapsRegistry(GAPS_REGISTRY, allClaims, casebookDataset, KNOWN_VARIANTS);
    filterResearchRequirements(EMPTY_GAPS_FILTERS, allClaims);
    const after = allClaims.map((c) => ({ id: c.claim_id, status: c.status }));
    expect(after).toEqual(before);
  });
});

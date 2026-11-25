import { describe, expect, it } from 'vitest';
import { allClaims } from '../../src/data/researchDataset';
import {
  RESEARCH_BOUNDARIES,
  RESEARCH_INSIGHTS,
  insightClaimIds,
} from '../../src/research/overviewContent';
import { INSTITUTIONAL_LAYERS, OUTCOME_STAGES } from '../../src/research/taxonomy';

function claim(id: string) {
  const found = allClaims.find((c) => c.claim_id === id);
  if (!found) {
    throw new Error(`Missing claim ${id}`);
  }
  return found;
}

describe('Overview research-integrity content checks', () => {
  it('does not present absence of finding as proof of absence', () => {
    const emp002 = claim('ATLAS-EMP-002');
    expect(emp002.status).toBe('absence_of_finding');
    expect(emp002.admissibility_conditions).toMatch(/absence of finding is not proof/i);

    const boundary = RESEARCH_BOUNDARIES.find((b) => b.id === 'no-nationwide-landbanking');
    expect(boundary?.statement).toMatch(/not proof of absence/i);
    expect(boundary?.claimIds).toContain('ATLAS-EMP-002');

    const site = RESEARCH_INSIGHTS.find((i) => i.id === 'site-constraints-unresolved');
    const absenceProp = site?.propositions.find((p) =>
      p.claimIds.includes('ATLAS-EMP-002'),
    );
    expect(absenceProp?.text).toMatch(/not proof that exclusionary holding is absent/i);
  });

  it('keeps hypothetical instruments distinct from law in force', () => {
    const layerD = INSTITUTIONAL_LAYERS.find((l) => l.id === 'D');
    expect(layerD?.caution).toMatch(/not law in force/i);
    const pol001 = claim('ATLAS-POL-001');
    expect(pol001.exact_claim).toMatch(/additional to/i);
    expect(
      RESEARCH_INSIGHTS.some((i) => insightClaimIds(i).includes('ATLAS-POL-001')),
    ).toBe(false);
  });

  it('states that O1/O2 cannot establish O5/O6 without further evidence', () => {
    const o1 = OUTCOME_STAGES.find((s) => s.id === 'O1');
    const o2 = OUTCOME_STAGES.find((s) => s.id === 'O2');
    expect(o1?.subsequentStageLimitation).toMatch(/consumer welfare/i);
    expect(o2?.subsequentStageLimitation).toMatch(/durable competitive constraint/i);
    expect(o2?.subsequentStageLimitation).toMatch(/consumer welfare/i);

    const insight = RESEARCH_INSIGHTS.find((i) => i.id === 'capacity-not-welfare');
    expect(insightClaimIds(insight!)).toEqual(
      expect.arrayContaining([
        'ATLAS-ASM-002',
        'ATLAS-CON-003',
        'ATLAS-EMP-005',
        'ATLAS-GAP-002',
      ]),
    );
  });

  it('does not portray foreign-investment rules as uniform and cites pathway-specific law', () => {
    const insight = RESEARCH_INSIGHTS.find((i) => i.id === 'fdi-branching');
    const ids = insightClaimIds(insight!);
    expect(ids).toEqual(
      expect.arrayContaining([
        'ATLAS-LEG-001',
        'ATLAS-LEG-002',
        'ATLAS-LEG-005',
        'ATLAS-LIT-005',
        'ATLAS-CON-002',
      ]),
    );
    expect(insight?.propositions.some((p) => /differ|not interchangeable|Foreign government/i.test(p.text))).toBe(
      true,
    );
    expect(claim('ATLAS-CON-002').exact_claim).toMatch(
      /without transaction-class branching is false/i,
    );
  });

  it('preserves notification≠prohibition and acquisition-event distinctions', () => {
    const baseline = RESEARCH_INSIGHTS.find((i) => i.id === 'baseline-oversight');
    expect(baseline?.evidenceReading).toMatch(/Notification is not prohibition/i);
    expect(
      baseline?.propositions.some((p) => /not an automatic prohibition/i.test(p.text)),
    ).toBe(true);

    const acquisition = RESEARCH_INSIGHTS.find((i) => i.id === 'acquisition-events-distinct');
    const ids = insightClaimIds(acquisition!);
    expect(ids).toEqual(
      expect.arrayContaining(['ATLAS-EMP-007', 'ATLAS-ADM-003', 'ATLAS-LEG-008']),
    );
  });

  it('distinguishes maintained assumptions from empirical findings in evidence readings', () => {
    const baseline = RESEARCH_INSIGHTS.find((i) => i.id === 'baseline-oversight');
    expect(baseline?.evidenceReading).toMatch(/framing assumption/i);
    expect(baseline?.evidenceReading).toMatch(/verified legal facts/i);

    const capacity = RESEARCH_INSIGHTS.find((i) => i.id === 'capacity-not-welfare');
    expect(capacity?.evidenceReading).toMatch(/methodological separation/i);
    expect(capacity?.evidenceReading).toMatch(/chronology empirics/i);
  });

  it('does not offer an unsupported policy recommendation', () => {
    const text = [
      ...RESEARCH_INSIGHTS.flatMap((i) => [
        i.title,
        i.limitation,
        i.evidenceReading,
        ...i.propositions.map((p) => p.text),
      ]),
      ...RESEARCH_BOUNDARIES.map((b) => b.statement),
    ].join('\n');
    expect(text).not.toMatch(/should adopt/i);
    expect(text).not.toMatch(/recommended policy/i);
    expect(text).not.toMatch(/policy winner/i);
    expect(text).toMatch(/No justified quantified ranking/i);
  });
});

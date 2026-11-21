import { describe, expect, it } from 'vitest';
import { allClaims } from '../../src/data/researchDataset';
import { EMPTY_FILTERS, filterClaims } from '../../src/research/queries';

function claim(id: string) {
  const found = allClaims.find((c) => c.claim_id === id);
  if (!found) {
    throw new Error(`Missing claim ${id}`);
  }
  return found;
}

describe('research-specific regression checks', () => {
  it('ATLAS-HYP-004 is absence_of_finding, not unresolved_hypothesis (prefix ≠ status)', () => {
    const c = claim('ATLAS-HYP-004');
    expect(c.status).toBe('absence_of_finding');
    expect(c.status).not.toBe('unresolved_hypothesis');
    expect(c.claim_id.startsWith('ATLAS-HYP-')).toBe(true);

    const unresolved = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      statuses: ['unresolved_hypothesis'],
    });
    expect(unresolved.some((row) => row.claim_id === 'ATLAS-HYP-004')).toBe(false);

    const absence = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      statuses: ['absence_of_finding'],
    });
    expect(absence.some((row) => row.claim_id === 'ATLAS-HYP-004')).toBe(true);
  });

  it('ATLAS-CON-001 preserves corrected uniform FIRB delay premise', () => {
    const c = claim('ATLAS-CON-001');
    expect(c.status).toBe('contested_claim');
    expect(c.exact_claim).toContain('60–240 months');
    expect(c.exact_claim).toContain('unusable as a description of current Australian law');
    expect(c.limitations_external_validity).toContain('right-tail files');
    expect(c.competing_mechanism_or_contrary_evidence).toContain('not as medians');
  });

  it('ATLAS-CON-002 rejects uniform FIRB screening premise', () => {
    const c = claim('ATLAS-CON-002');
    expect(c.status).toBe('contested_claim');
    expect(c.exact_claim).toMatch(/Uniform FIRB screening/i);
    expect(c.exact_claim).toMatch(/without transaction-class branching is false/i);
  });

  it('ATLAS-LEG-003 distinguishes notification thresholds from typical conditions', () => {
    const c = claim('ATLAS-LEG-003');
    expect(c.status).toBe('verified_legal_fact');
    expect(c.exact_claim).toMatch(/notifiable at a \$0 monetary threshold/i);
    expect(c.exact_claim).toMatch(/typical Treasurer productive-use/i);
    expect(c.admissibility_conditions).toMatch(
      /notification trigger and typical conditions as distinct/i,
    );
    expect(c.limitations_external_validity.length).toBeGreaterThan(40);
  });

  it('ATLAS-EMP-002 preserves limitations concerning land banking findings', () => {
    const c = claim('ATLAS-EMP-002');
    expect(c.status).toBe('absence_of_finding');
    expect(c.exact_claim).toMatch(/did not determine case-by-case/i);
    expect(c.exact_claim).toMatch(/land banking/i);
    expect(c.admissibility_conditions).toMatch(/absence of finding is not proof/i);
    expect(c.limitations_external_validity).toContain('Inquiry design limits');
  });

  it('ATLAS-HYP-002 remains a qualitative hypothesis with distinct admissibility=no', () => {
    const c = claim('ATLAS-HYP-002');
    expect(c.status).toBe('unresolved_hypothesis');
    expect(c.admissible_in_policy_comparison).toBe('no');
    expect(c.exact_claim).toMatch(/Conditional mechanisms/i);
    expect(c.admissibility_conditions).toMatch(/Not admissible as a validated analytical result/i);
    expect(c.admissibility_conditions).toMatch(/labelled qualitative caution/i);
    expect(c.limitations_external_validity).toMatch(/unidentified/i);
    expect(c.limitations_external_validity).toMatch(/omitted prices\/welfare\/exit/i);
    expect(c.exact_claim.length).toBeGreaterThan(400);
  });

  it('ATLAS-HYP-001 / CON-003 / POL-001 keep status and admissibility distinct', () => {
    const hyp001 = claim('ATLAS-HYP-001');
    expect(hyp001.status).toBe('unresolved_hypothesis');
    expect(hyp001.admissible_in_policy_comparison).toBe('conditional');

    const con003 = claim('ATLAS-CON-003');
    expect(con003.status).toBe('contested_claim');
    expect(con003.admissible_in_policy_comparison).toBe('yes');
    expect(con003.exact_claim).toMatch(/Inferring consumer welfare/i);
    expect(con003.exact_claim).toMatch(/not supported/i);
    expect(con003.limitations_external_validity).toMatch(
      /Does not deny that entry can raise welfare/i,
    );

    const pol001 = claim('ATLAS-POL-001');
    expect(pol001.status).toBe('maintained_assumption');
    expect(pol001.admissible_in_policy_comparison).toBe('conditional');
    expect(pol001.admissibility_conditions).toMatch(/Layer D counterfactual/i);
  });

  it('ATLAS-HYP-003 keeps empty primary URL without fabricating a link', () => {
    const c = claim('ATLAS-HYP-003');
    expect(c.primary_source_url).toBe('');
    expect(c.hasPrimarySourceUrl).toBe(false);
    expect(c.status).toBe('unresolved_hypothesis');
    expect(c.admissible_in_policy_comparison).toBe('no');
  });
});

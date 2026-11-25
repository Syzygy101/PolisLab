import { describe, expect, it } from 'vitest';
import { GAPS_REGISTRY } from '../../src/research/gapsRequirements';
import { GAPS_REGISTRY_VERSION } from '../../src/research/gapsSchema';
import { getMechanismProfileContent } from '../../src/research/mechanismProfiles';
import { COMPARISON_DATASET } from '../../src/research/comparisonDataset';

describe('Build 08 research interpretation corrections', () => {
  it('uses registry version b08', () => {
    expect(GAPS_REGISTRY_VERSION).toBe('2026.11.22-b08');
    expect(GAPS_REGISTRY.provenance.registryVersion).toBe('2026.11.22-b08');
  });

  it('labels Case 1 competing explanations with correct M1a/M1b/M5a taxonomy', () => {
    const c1 = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C1-01')!;
    expect(c1.competingExplanations.some((t) => /Planning delay \(M1b\)/.test(t))).toBe(true);
    expect(c1.competingExplanations.some((t) => /option value.*\(M5a\)/i.test(t))).toBe(true);
    expect(c1.competingExplanations.some((t) => /scarcity.*\(M1a\)/i.test(t))).toBe(true);
    expect(c1.competingExplanations.join('\n')).not.toMatch(/Planning delay \(M1a\)/);

    const c3 = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C1-03')!;
    expect(c3.competingExplanations.some((t) => /Planning delay \(M1b\)/.test(t))).toBe(true);
    expect(c3.competingExplanations.some((t) => /\(M5a\)/.test(t))).toBe(true);
  });

  it('associates Case 2 FIRB requirements with M6a not M5a', () => {
    for (const id of ['REQ-C2-01', 'REQ-C2-02', 'REQ-C2-03'] as const) {
      const req = GAPS_REGISTRY.requirements.find((r) => r.id === id)!;
      expect(req.associatedMechanismIds).toContain('M6a');
      expect(req.associatedMechanismIds).not.toContain('M5a');
    }
  });

  it('does not cite LEG-004/005 as Layer C commencement support', () => {
    const req = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C2-05')!;
    expect(req.referencedClaimIds).toEqual([]);
    expect(req.qualification).toMatch(/LEG-004|LEG-005/);
  });

  it('cites LEG-007 for the 2030 sunset requirement', () => {
    const req = GAPS_REGISTRY.requirements.find((r) => r.id === 'REQ-C4-05')!;
    expect(req.referencedClaimIds).toEqual(['ATLAS-LEG-007']);
    expect(req.referencedClaimIds).not.toContain('ATLAS-LEG-008');
  });

  it('treats M2a EMP-003 note as citation not metadata', () => {
    const m2a = getMechanismProfileContent('M2a');
    const emp = m2a.alternativeExplanations.find((e) =>
      e.sources.some((s) => s.kind === 'claim' && s.id === 'ATLAS-EMP-003'),
    );
    expect(emp?.relation).toBe('citation');
  });

  it('hedges Case 4 GAP-003 pathways as plausible / unestablished', () => {
    const paths = COMPARISON_DATASET.pathways.filter((p) =>
      p.sources.some((s) => s.kind === 'claim' && s.id === 'ATLAS-GAP-003'),
    );
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      expect(p.summary).toMatch(/[Pp]lausible|not established|ATLAS-GAP-003/);
    }
  });
});

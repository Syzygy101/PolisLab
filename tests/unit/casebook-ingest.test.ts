import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CASEBOOK_SOURCE_PATH,
  EXPECTED_TOTAL_SECTIONS,
  V011_EXPECTED_BODY_CLAIM_SETS,
  V011_EXPECTED_CASE_MEMBERSHIP_SETS,
  extractClaimIdsFromMarkdown,
  ingestAtlasCsv,
  ingestCasebookMarkdown,
  validateCasebookDataset,
  type CaseId,
} from '../../src/research/index.ts';
import { V011_EXPECTED_CASE_TITLES } from '../../src/research/referenceExpectations.ts';
import { casebookDataset } from '../../src/data/casebookDataset.ts';
import { allClaims } from '../../src/data/researchDataset.ts';
import { ATLAS_SOURCE_PATH } from '../../src/research/constants.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function loadPublishedCasebook(): string {
  return readFileSync(path.join(root, CASEBOOK_SOURCE_PATH), 'utf8');
}

function loadAtlasMembership(): Map<CaseId, Set<string>> {
  const csv = readFileSync(path.join(root, ATLAS_SOURCE_PATH), 'utf8');
  const dataset = ingestAtlasCsv(csv, { expectPublishedCount: true });
  const map = new Map<CaseId, Set<string>>();
  for (const claim of dataset.claims) {
    for (const caseId of claim.cases) {
      const set = map.get(caseId as CaseId) ?? new Set<string>();
      set.add(claim.claim_id);
      map.set(caseId as CaseId, set);
    }
  }
  return map;
}

describe('casebook source fidelity', () => {
  const markdown = loadPublishedCasebook();
  const atlasMembership = loadAtlasMembership();
  const knownIds = new Set(allClaims.map((c) => c.claim_id));
  const parsed = ingestCasebookMarkdown(markdown, {
    knownClaimIds: knownIds,
    atlasMembershipByCase: atlasMembership,
  });

  it('preserves four exact published case titles', () => {
    expect(parsed.cases).toHaveLength(4);
    for (const researchCase of parsed.cases) {
      expect(researchCase.title).toBe(V011_EXPECTED_CASE_TITLES[researchCase.id]);
    }
  });

  it('preserves ten analytical sections per case (40 total)', () => {
    expect(parsed.provenance.sectionCount).toBe(EXPECTED_TOTAL_SECTIONS);
    for (const researchCase of parsed.cases) {
      expect(researchCase.sections).toHaveLength(10);
      researchCase.sections.forEach((section, index) => {
        expect(section.number).toBe(index + 1);
        expect(section.heading.startsWith(`${index + 1}.`)).toBe(true);
      });
    }
  });

  it('preserves substantive section text and table cells from the source Markdown', () => {
    const case1 = parsed.cases.find((c) => c.id === 'Case1')!;
    const sec1 = case1.sections.find((s) => s.number === 1)!;
    expect(sec1.markdown).toMatch(/Develop-or-release/i);
    expect(sec1.markdown).toMatch(/Exclusivity restriction/i);
    const sec3 = case1.sections.find((s) => s.number === 3)!;
    expect(sec3.markdown).toContain('release');
    expect(sec3.markdown).toMatch(/Grocery exclusivity/i);
    expect(sec3.markdown).toContain('Layer D');
    expect(sec3.markdown).toMatch(/That released sites go to rivals/i);
    const sec6 = case1.sections.find((s) => s.number === 6)!;
    expect(sec6.markdown).toContain('R (develop-or-release)');
    expect(sec6.markdown).toContain('E (exclusivity restriction)');
    expect(sec6.markdown).toContain('Favourable');
    expect(sec6.markdown).toContain('Unfavourable');
    expect(sec6.markdown).toContain('Null');

    const case2 = parsed.cases.find((c) => c.id === 'Case2')!;
    expect(case2.sections[2].markdown).toContain('CF-A');
    expect(case2.sections[2].markdown).toContain('CF-D');
    expect(case2.sections[1].markdown).toContain('T1');
    expect(case2.sections[1].markdown).toContain('FGI contrast');
  });

  it('keeps front matter and closing material accessible', () => {
    expect(parsed.frontMatterMarkdown).toContain('How to use this casebook');
    expect(parsed.frontMatterMarkdown).toContain('Layer A');
    expect(parsed.closingParts.some((p) => p.id === 'four-case-comparison-table')).toBe(true);
    expect(parsed.closingParts.some((p) => p.id.includes('completeness'))).toBe(true);
    const comparison = parsed.closingParts.find((p) => p.id === 'four-case-comparison-table')!;
    expect(comparison.markdown).toContain('Policy winner?');
    expect(comparison.markdown).toContain('None declared');
  });

  it('resolves every extracted atlas ID against the published atlas', () => {
    for (const researchCase of parsed.cases) {
      for (const id of researchCase.membershipClaimIds) {
        expect(knownIds.has(id), id).toBe(true);
      }
    }
  });

  it('matches exact direct-citation membership sets from the authoritative CSV', () => {
    for (const caseId of Object.keys(V011_EXPECTED_CASE_MEMBERSHIP_SETS) as CaseId[]) {
      const expected = [...V011_EXPECTED_CASE_MEMBERSHIP_SETS[caseId]];
      const fromAtlas = [...(atlasMembership.get(caseId) ?? [])].sort();
      const fromParse = parsed.cases.find((c) => c.id === caseId)!.membershipClaimIds;
      expect(fromAtlas).toEqual(expected);
      expect(fromParse).toEqual(expected);
      expect(fromParse).toEqual(casebookDataset.cases.find((c) => c.id === caseId)!.membershipClaimIds);
    }
  });

  it('incorporates common all-case rules correctly', () => {
    expect(parsed.commonRuleClaimIds).toEqual(['ATLAS-ASM-002', 'ATLAS-CON-003']);
    // Case1/Case3 already cite CON-003 in body; ASM-002 is front-matter-only addition.
    expect(V011_EXPECTED_BODY_CLAIM_SETS.Case1).toContain('ATLAS-CON-003');
    expect(V011_EXPECTED_BODY_CLAIM_SETS.Case1).not.toContain('ATLAS-ASM-002');
    expect(V011_EXPECTED_BODY_CLAIM_SETS.Case2).not.toContain('ATLAS-ASM-002');
    expect(V011_EXPECTED_BODY_CLAIM_SETS.Case2).not.toContain('ATLAS-CON-003');
    for (const researchCase of parsed.cases) {
      expect(researchCase.bodyClaimIds).toEqual([
        ...V011_EXPECTED_BODY_CLAIM_SETS[researchCase.id],
      ]);
    }
  });

  it('records source checksum and validates generated data', () => {
    expect(parsed.provenance.sourceContentSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(casebookDataset.provenance.sourceContentSha256).toBe(
      parsed.provenance.sourceContentSha256,
    );
    expect(() => validateCasebookDataset(casebookDataset, allClaims)).not.toThrow();
  });

  it('does not copy unpublished research/01–09 material into application data', () => {
    // Published casebook may *cite* paths such as research/04_pilot_sample.csv.
    // Application artefacts must not embed unpublished file bodies.
    for (const name of [
      '01_research_question.md',
      '02_literature_review.md',
      '09_synthesis.md',
    ]) {
      const unpublished = path.join(root, 'research', name);
      if (existsSync(unpublished)) {
        const body = readFileSync(unpublished, 'utf8').slice(0, 200);
        if (body.length > 40) {
          expect(JSON.stringify(casebookDataset)).not.toContain(body);
        }
      }
    }
    expect(casebookDataset.provenance.sourceFile).toBe(CASEBOOK_SOURCE_PATH);
    expect(casebookDataset.cases.every((c) => !c.markdown.includes('Phase 0A raw notes'))).toBe(
      true,
    );
  });

  it('extracts claim IDs via AST-oriented helpers including compact ranges', () => {
    const ids = extractClaimIdsFromMarkdown(
      'See **ATLAS-LEG-001**–**005** and ATLAS-EMP-003.',
    );
    expect(ids).toContain('ATLAS-LEG-001');
    expect(ids).toContain('ATLAS-LEG-005');
    expect(ids).toContain('ATLAS-EMP-003');
  });
});

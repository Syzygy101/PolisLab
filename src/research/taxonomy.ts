/**
 * Canonical research taxonomies grounded in the published v0.1.1 casebook
 * and atlas vocabulary. Presentation counts must be derived from data, not
 * hardcoded into UI components.
 */

import type { ClaimStatus } from './constants';

export const CASEBOOK_PROVENANCE =
  'research/10_policy_assessment_casebook.md' as const;

export const CASE_IDS = ['Case1', 'Case2', 'Case3', 'Case4'] as const;
export type CaseId = (typeof CASE_IDS)[number];

export interface ResearchCase {
  id: CaseId;
  /** Exact published casebook title (without the "Case N —" prefix). */
  title: string;
  /** Casebook heading used as provenance anchor. */
  casebookHeading: string;
  /** Concise research question grounded in the casebook §1 text. */
  researchQuestion: string;
  themes: readonly string[];
}

export const RESEARCH_CASES: readonly ResearchCase[] = [
  {
    id: 'Case1',
    title: 'Undeveloped supermarket sites',
    casebookHeading: '## Case 1 — Undeveloped supermarket sites',
    researchQuestion:
      'Relative to current Australian law, would develop-or-release or exclusivity-restriction instruments be expected — on existing evidence — to improve rival market access (O1) and productive capacity (O2) at undeveloped supermarket-capable sites?',
    themes: [
      'Site pipelines and planning',
      'Strategic foreclosure hypotheses',
      'Layer D site instruments',
    ],
  },
  {
    id: 'Case2',
    title: 'Foreign greenfield grocery investment',
    casebookHeading: '## Case 2 — Foreign greenfield grocery investment',
    researchQuestion:
      'For a private foreign grocery retailer seeking greenfield Australian capacity, which FIRB/FATA requirements apply, and when could a binding requirement change entry timing or cost — without inventing a uniform multi-year screening obstacle?',
    themes: [
      'Transaction-class FDI branching',
      'Greenfield vs acquisition modes',
      'Administrative processing performance',
    ],
  },
  {
    id: 'Case3',
    title: 'Differentiated entry and scale-up',
    casebookHeading: '## Case 3 — Differentiated entry and scale-up',
    researchQuestion:
      'Using ALDI’s Australian history and established entry literature, what can be said — without new causal identification — about differentiated foreign grocery scale-up, and which O1–O6 outcomes that history can and cannot discipline?',
    themes: [
      'Distribution before stores',
      'Format differentiation',
      'External-validity limits of chronology',
    ],
  },
  {
    id: 'Case4',
    title: 'Supermarket acquisition oversight',
    casebookHeading: '## Case 4 — Supermarket acquisition oversight',
    researchQuestion:
      'What do ACCC notification, acquisition determinations, and notification waivers establish about major-supermarket site control — and what are the limits of using merger enforcement as evidence for market-wide competitive outcomes?',
    themes: [
      'Part 3 notification duties',
      'Determinations vs waivers',
      'Local vs nationwide inference',
    ],
  },
] as const;

export const OUTCOME_STAGE_IDS = ['O1', 'O2', 'O3', 'O4', 'O5', 'O6'] as const;
export type OutcomeStageId = (typeof OUTCOME_STAGE_IDS)[number];

export interface OutcomeStage {
  id: OutcomeStageId;
  label: string;
  meaning: string;
  /** Clearly labelled illustrative indicator — not a measured PolisLab metric. */
  illustrativeExample: string;
  /** Limitation on inferring subsequent stages. */
  subsequentStageLimitation: string;
}

export const OUTCOME_STAGES: readonly OutcomeStage[] = [
  {
    id: 'O1',
    label: 'Market access',
    meaning:
      'Whether rivals can obtain commercially usable rights to enter or expand in a relevant grocery setting (sites, leases, or equivalent access).',
    illustrativeExample:
      'Ability to secure a supermarket-capable site or lease interest without exclusionary contractual blocks.',
    subsequentStageLimitation:
      'Access alone does not establish that stores open, remain viable, survive rivalry, constrain incumbents, or raise consumer welfare.',
  },
  {
    id: 'O2',
    label: 'Productive capacity',
    meaning:
      'Whether entrants actually deploy operating capacity — stores, distribution, or related productive assets — after access is obtained.',
    illustrativeExample:
      'Opened stores or delivered distribution centres in a chronology (for example ALDI state DC-before-stores sequencing).',
    subsequentStageLimitation:
      'Capacity does not by itself establish commercial viability, survival under rivalry, durable competitive constraint, or consumer welfare.',
  },
  {
    id: 'O3',
    label: 'Commercial viability',
    meaning:
      'Whether deployed capacity can cover costs and generate sustainable commercial performance under observed demand and cost conditions.',
    illustrativeExample:
      'Sustained store-level or network economics sufficient to continue operating without relying on one-off subsidies.',
    subsequentStageLimitation:
      'Viability does not guarantee survival through incumbent response, durable competitive constraint, or consumer-welfare gains.',
  },
  {
    id: 'O4',
    label: 'Survival',
    meaning:
      'Whether an entrant or rival remains in the market after competitive responses, shocks, or exit pressures.',
    illustrativeExample:
      'Continued operation after incumbent pricing, assortment, or site responses that could force exit.',
    subsequentStageLimitation:
      'Survival is not equivalent to durable competitive constraint on incumbents, nor to measured consumer-welfare improvement.',
  },
  {
    id: 'O5',
    label: 'Durable competitive constraint',
    meaning:
      'Whether rivals exert ongoing competitive pressure that materially disciplines incumbent conduct over time.',
    illustrativeExample:
      'Persistent local rivalry that constrains price, quality, or assortment choices of major supermarket operators.',
    subsequentStageLimitation:
      'Constraint cannot be inferred from entry counts, planning approvals, or acquisition notifications alone; O6 does not follow automatically.',
  },
  {
    id: 'O6',
    label: 'Consumer welfare',
    meaning:
      'Whether consumers are better off — through prices, quality, convenience, or related welfare-relevant outcomes — as a result of the competitive process.',
    illustrativeExample:
      'Estimated local price or surplus effects under identified diversion and pass-through (not available as calibrated Australian parameters in this release).',
    subsequentStageLimitation:
      'This release contains no calibrated Australian diversion ratios or welfare estimates; earlier stages do not establish O6 without further evidence.',
  },
] as const;

export const MECHANISM_FAMILY_IDS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'] as const;
export type MechanismFamilyId = (typeof MECHANISM_FAMILY_IDS)[number];

/**
 * Exact atlas-tagged submechanism identifiers (12).
 * Does not include contextual Case 2 prose subdivisions M5a-1 / M5a-2.
 */
export const MECHANISM_SUBMECHANISM_IDS = [
  'M1a',
  'M1b',
  'M1c',
  'M2a',
  'M2b',
  'M3a',
  'M3b',
  'M4a',
  'M4b',
  'M5a',
  'M6a',
  'M6b',
] as const;
export type MechanismSubmechanismId = (typeof MECHANISM_SUBMECHANISM_IDS)[number];

/** Any navigable mechanism profile ID (family or exact atlas submechanism). */
export type MechanismId = MechanismFamilyId | MechanismSubmechanismId;

export interface MechanismFamily {
  id: MechanismFamilyId;
  label: string;
  shorthand: string;
  /** Short published role description grounded in casebook / atlas usage. */
  definition: string;
  /** Atlas-exact child tags registered under this family (excludes the family tag itself). */
  childIds: readonly MechanismSubmechanismId[];
  provenance: string;
}

export interface MechanismSubmechanism {
  id: MechanismSubmechanismId;
  parentId: MechanismFamilyId;
  label: string;
  /**
   * Published usage gloss. Where the casebook lacks a dedicated prose definition,
   * label + definition note the limitation rather than inventing theory.
   */
  definition: string;
  definitionLimitation?: string;
  provenance: string;
}

/**
 * Contextual Case 2 subdivisions of M5a — not atlas tags, not filterable IDs.
 * Do not assign fabricated claim counts or treat all M5a claims as evidence for either.
 */
export const MECHANISM_CONTEXTUAL_SUBDIVISIONS = [
  {
    id: 'M5a-1',
    parentExactTag: 'M5a' as const,
    label: 'Irreversible investment',
    note: 'Case 2 §4 distinguishes irreversible investment from financing scarcity. This is a contextual conceptual subdivision, not an atlas mechanism_ids tag.',
    provenance: 'Case 2 §4 Affected causal mechanisms',
  },
  {
    id: 'M5a-2',
    parentExactTag: 'M5a' as const,
    label: 'Financing scarcity',
    note: 'Case 2 §4 notes financing scarcity (M5a-2) is weakened for large internationals per ACCC. Not an atlas tag; do not equate all M5a co-tags with this subdivision.',
    provenance: 'Case 2 §4 Affected causal mechanisms; ATLAS-EMP-003',
  },
] as const;

/**
 * Explicit parent→child registry for family-expanded filtering.
 * Validated against published atlas tags — no substring matching.
 */
export const MECHANISM_FAMILY_CHILDREN: Record<
  MechanismFamilyId,
  readonly MechanismSubmechanismId[]
> = {
  M1: ['M1a', 'M1b', 'M1c'],
  M2: ['M2a', 'M2b'],
  M3: ['M3a', 'M3b'],
  M4: ['M4a', 'M4b'],
  M5: ['M5a'],
  M6: ['M6a', 'M6b'],
};

/** Casebook mechanism shorthand (families) plus published child registry. */
export const MECHANISM_FAMILIES: readonly MechanismFamily[] = [
  {
    id: 'M1',
    label: 'Site access, planning and foreclosure',
    shorthand: 'site/planning/foreclosure',
    definition:
      'Constraints and strategies around supermarket-capable sites: commercial scarcity, planning/zoning, and possible strategic foreclosure — kept as competing explanations.',
    childIds: MECHANISM_FAMILY_CHILDREN.M1,
    provenance: 'Casebook mechanism shorthand; Case 1 §4 required M1a ≠ M1b ≠ M1c separation',
  },
  {
    id: 'M2',
    label: 'Scale and logistics',
    shorthand: 'scale/logistics',
    definition:
      'Minimum efficient scale and distribution logistics as candidate constraints on grocery network expansion.',
    childIds: MECHANISM_FAMILY_CHILDREN.M2,
    provenance: 'Casebook mechanism shorthand; Case 2–3 §4 M2a/M2b usage',
  },
  {
    id: 'M3',
    label: 'Demand and format',
    shorthand: 'demand/format',
    definition:
      'Demand-side substitution and format differentiation (including limited-assortment hard discount) as distinct from logistics or site control.',
    childIds: MECHANISM_FAMILY_CHILDREN.M3,
    provenance: 'Casebook mechanism shorthand; Case 3 §4 M3b; atlas M3a/M3b tags',
  },
  {
    id: 'M4',
    label: 'Incumbent response',
    shorthand: 'incumbent response',
    definition:
      'Incumbent competitive conduct ranging from ordinary rivalry to exclusionary response — kept distinct from site-foreclosure hypotheses.',
    childIds: MECHANISM_FAMILY_CHILDREN.M4,
    provenance: 'Casebook mechanism shorthand; Case 1 §4 M4a vs M4b; Case 4 §4',
  },
  {
    id: 'M5',
    label: 'Finance, sunk costs and exit',
    shorthand: 'finance/sunk/exit',
    definition:
      'Irreversible investment, option value under uncertainty, and financing constraints that may affect entry timing or vacant control.',
    childIds: MECHANISM_FAMILY_CHILDREN.M5,
    provenance: 'Casebook mechanism shorthand; Case 1–3 §4 M5a usage',
  },
  {
    id: 'M6',
    label: 'Foreign investment mode and frictions',
    shorthand: 'FDI mode/frictions',
    definition:
      'Transaction-specific foreign-investment notification or call-in frictions, and the distinction between greenfield capacity and acquisition-based entry.',
    childIds: MECHANISM_FAMILY_CHILDREN.M6,
    provenance: 'Casebook mechanism shorthand; Case 2 §4 M6a/M6b',
  },
] as const;

/** Exact atlas submechanisms with labels grounded in published casebook / atlas usage. */
export const MECHANISM_SUBMECHANISMS: readonly MechanismSubmechanism[] = [
  {
    id: 'M1a',
    parentId: 'M1',
    label: 'Physical / commercial scarcity',
    definition:
      'Unused or controlled sites may reflect genuine scarcity of other viable parcels rather than exclusionary intent.',
    provenance: 'Case 1 §4 mechanism table',
  },
  {
    id: 'M1b',
    parentId: 'M1',
    label: 'Planning / zoning',
    definition:
      'Holding or delay may track permission delay, contamination, liquor, or centre design — not exclusion.',
    provenance: 'Case 1 §4 mechanism table',
  },
  {
    id: 'M1c',
    parentId: 'M1',
    label: 'Strategic foreclosure',
    definition:
      'Holding, options, or covenants may raise rivals’ costs — treated as a live hypothesis, not a proven general pattern (ATLAS-HYP-001).',
    provenance: 'Case 1 §4 mechanism table; ATLAS-HYP-001',
  },
  {
    id: 'M2a',
    parentId: 'M2',
    label: 'Scale / MES',
    definition:
      'Scale and capital requirements for large-network grocery entry; ACCC material treats capital as unlikely binding for large internationals while time-to-scale remains material.',
    provenance: 'Case 2 §4 M2a/M2b; Case 3 §4; ATLAS-EMP-003',
  },
  {
    id: 'M2b',
    parentId: 'M2',
    label: 'Distribution / logistics',
    definition:
      'Distribution-centre sequencing relative to store openings — observed chronology is distinct from a claim that logistics was the binding constraint (ATLAS-EMP-005; ATLAS-HYP-004).',
    provenance: 'Case 3 §4–5; ATLAS-EMP-005; ATLAS-HYP-004',
  },
  {
    id: 'M3a',
    parentId: 'M3',
    label: 'Demand / diversion',
    definition:
      'Atlas tag associated with demand-side diversion and related identification gaps (e.g. revenue diversion without incumbent price effects in foreign Supercenter evidence).',
    definitionLimitation:
      'The published casebook does not establish a standalone M3a prose definition separate from the M3 demand/format family shorthand; label follows atlas usage (ATLAS-LIT-001; ATLAS-GAP-002).',
    provenance: 'Atlas tags on ATLAS-LIT-001 and ATLAS-GAP-002; casebook M3 shorthand',
  },
  {
    id: 'M3b',
    parentId: 'M3',
    label: 'Format differentiation',
    definition:
      'Limited-assortment hard-discount and related format differentiation — direct consumer benefits possible; incomplete incumbent price constraint.',
    provenance: 'Case 3 §4 mechanism table; ATLAS-EMP-004',
  },
  {
    id: 'M4a',
    parentId: 'M4',
    label: 'Ordinary rivalry',
    definition:
      'Competitive expansion or pricing rivalry with possible exit-risk side effects — distinct from strategic foreclosure (M1c) and exclusionary response (M4b).',
    provenance: 'Case 1 §4; Case 4 §4 Kalgoorlie ordinary expansion (ATLAS-ADM-002)',
  },
  {
    id: 'M4b',
    parentId: 'M4',
    label: 'Exclusionary response',
    definition:
      'Preemption via sites, covenants, or acquisitions of nascent competitive constraints.',
    provenance: 'Case 1 §4 mechanism table; Case 4 §4 M4b/M1c discussion',
  },
  {
    id: 'M5a',
    parentId: 'M5',
    label: 'Irreversible investment / option value',
    definition:
      'Vacant control or multi-year irreversible investment can reflect efficient waiting under uncertainty; Case 2 additionally distinguishes irreversible investment (M5a-1) from financing scarcity (M5a-2) as contextual subdivisions — not atlas tags.',
    provenance: 'Case 1 §4; Case 2 §4; Case 3 §4; ATLAS-EMP-003; ATLAS-EMP-005',
  },
  {
    id: 'M6a',
    parentId: 'M6',
    label: 'Transaction-specific FDI frictions',
    definition:
      'Foreign-investment notification or call-in frictions that apply only when a deal is notifiable or called in — not a uniform multi-year barrier for all private grocery starts.',
    provenance: 'Case 2 §4; ATLAS-LEG-001–005; ATLAS-CON-001',
  },
  {
    id: 'M6b',
    parentId: 'M6',
    label: 'Greenfield vs acquisition mode',
    definition:
      'Ownership transfer is not interchangeable with new productive capacity; greenfield and M&A FDI modes remain distinct (ATLAS-LIT-005).',
    provenance: 'Case 2 §4; Case 3 §4; ATLAS-LIT-005',
  },
] as const;

export const INSTITUTIONAL_LAYER_IDS = ['A', 'B', 'C', 'D'] as const;
export type InstitutionalLayerId = (typeof INSTITUTIONAL_LAYER_IDS)[number];

export interface InstitutionalLayer {
  id: InstitutionalLayerId;
  label: string;
  meaning: string;
  example: string;
  caution: string;
}

export const INSTITUTIONAL_LAYERS: readonly InstitutionalLayer[] = [
  {
    id: 'A',
    label: 'Law in force at the cutoff',
    meaning:
      'Statutory and regulatory rules treated as operative at the institutional/legal cutoff (20 November 2026).',
    example:
      'Example: FATA/FIRB transaction pathways and ACCC Determination Part 3 supermarket notification duties (atlas legal facts).',
    caution:
      'Layer A statements are dated to the research cutoff; visiting the application later does not refresh the legal baseline.',
  },
  {
    id: 'B',
    label: 'Administrative practice and observed outcomes',
    meaning:
      'Observed administrative decisions, processing statistics, or inquiry findings — not automatic restatements of legal rights.',
    example:
      'Example: Treasury approved-commercial median processing times, or the ACCC Kalgoorlie acquisition determination.',
    caution:
      'Administrative observations are cohort- or case-specific; they are not statutory guarantees or nationwide doctrines.',
  },
  {
    id: 'C',
    label: 'Announced reforms',
    meaning:
      'Announced policy or institutional changes that are not treated as current entitlements in the synthesis.',
    example:
      'Example: announced low-risk foreign-investment streamlining discussed as overlapping but not identical to Layer D greenfield-preference ideas.',
    caution:
      'Layer C is not presented as existing legal rights or duties.',
  },
  {
    id: 'D',
    label: 'Hypothetical PolisLab interventions',
    meaning:
      'Counterfactual instruments defined for assessment (for example develop-or-release or exclusivity restriction) that are additional to the baseline.',
    example:
      'Example: a domestic develop-or-release rule for strategically controlled supermarket sites (ATLAS-POL-001) — explicitly hypothetical.',
    caution:
      'Layer D instruments are not law in force; effectiveness and legal feasibility may remain unverified.',
  },
] as const;

export const STATUS_LABELS: Record<ClaimStatus, string> = {
  verified_legal_fact: 'Verified legal fact',
  administrative_determination: 'Administrative determination',
  empirical_finding: 'Empirical finding',
  absence_of_finding: 'Absence of finding',
  maintained_assumption: 'Maintained assumption',
  contested_claim: 'Contested claim',
  unresolved_hypothesis: 'Unresolved hypothesis',
};

export function isCaseId(value: string): value is CaseId {
  return (CASE_IDS as readonly string[]).includes(value);
}

export function isOutcomeStageId(value: string): value is OutcomeStageId {
  return (OUTCOME_STAGE_IDS as readonly string[]).includes(value);
}

export function isMechanismFamilyId(value: string): value is MechanismFamilyId {
  return (MECHANISM_FAMILY_IDS as readonly string[]).includes(value);
}

export function isMechanismSubmechanismId(
  value: string,
): value is MechanismSubmechanismId {
  return (MECHANISM_SUBMECHANISM_IDS as readonly string[]).includes(value);
}

export function isMechanismId(value: string): value is MechanismId {
  return isMechanismFamilyId(value) || isMechanismSubmechanismId(value);
}

export function isContextualMechanismSubdivision(value: string): boolean {
  return MECHANISM_CONTEXTUAL_SUBDIVISIONS.some((item) => item.id === value);
}

export function getResearchCase(id: CaseId): ResearchCase {
  const found = RESEARCH_CASES.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Unknown case id: ${id}`);
  }
  return found;
}

export function getOutcomeStage(id: OutcomeStageId): OutcomeStage {
  const found = OUTCOME_STAGES.find((s) => s.id === id);
  if (!found) {
    throw new Error(`Unknown outcome stage: ${id}`);
  }
  return found;
}

export function getMechanismFamily(id: MechanismFamilyId): MechanismFamily {
  const found = MECHANISM_FAMILIES.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown mechanism family: ${id}`);
  }
  return found;
}

export function getMechanismSubmechanism(
  id: MechanismSubmechanismId,
): MechanismSubmechanism {
  const found = MECHANISM_SUBMECHANISMS.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown mechanism submechanism: ${id}`);
  }
  return found;
}

/**
 * Exact tags included in a family-expanded filter: family ID plus registered children.
 * Uses the explicit registry — never substring matching (M1 must not match M10).
 */
export function expandMechanismFamilyTags(
  familyId: MechanismFamilyId,
): readonly string[] {
  return [familyId, ...MECHANISM_FAMILY_CHILDREN[familyId]];
}

/** Parent family for an exact atlas tag (family tags are their own parent). */
export function getMechanismParentFamily(
  id: MechanismId,
): MechanismFamilyId {
  if (isMechanismFamilyId(id)) {
    return id;
  }
  return getMechanismSubmechanism(id).parentId;
}

export function mechanismProfileHref(id: MechanismId | string): string {
  return `/mechanisms/${id}`;
}

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

export interface MechanismFamily {
  id: MechanismFamilyId;
  label: string;
  shorthand: string;
}

/** Casebook mechanism shorthand (families), not exact atlas sub-tags. */
export const MECHANISM_FAMILIES: readonly MechanismFamily[] = [
  {
    id: 'M1',
    label: 'Site, planning and foreclosure',
    shorthand: 'site/planning/foreclosure',
  },
  {
    id: 'M2',
    label: 'Scale and logistics',
    shorthand: 'scale/logistics',
  },
  {
    id: 'M3',
    label: 'Demand and format',
    shorthand: 'demand/format',
  },
  {
    id: 'M4',
    label: 'Incumbent response',
    shorthand: 'incumbent response',
  },
  {
    id: 'M5',
    label: 'Finance, sunk cost and exit',
    shorthand: 'finance/sunk/exit',
  },
  {
    id: 'M6',
    label: 'FDI mode and frictions',
    shorthand: 'FDI mode/frictions',
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

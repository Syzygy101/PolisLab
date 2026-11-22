/**
 * Curated mechanism-profile content (Build 05).
 *
 * Separate exact source facts (atlas tags, casebook citations) from curated
 * explanatory prose. Every substantive curated proposition references a valid
 * atlas claim or published casebook section. Do not assign one evidentiary
 * status to an entire family.
 */

import type { CaseId, MechanismId } from './taxonomy';
import {
  MECHANISM_CONTEXTUAL_SUBDIVISIONS,
  getMechanismFamily,
  getMechanismParentFamily,
  getMechanismSubmechanism,
  isMechanismFamilyId,
  isMechanismSubmechanismId,
} from './taxonomy';

export type MechanismRelationType =
  | 'taxonomy'
  | 'metadata'
  | 'citation'
  | 'hypothesised'
  | 'competing_explanation';

export interface MechanismSourceRef {
  kind: 'claim' | 'case_section';
  /** Atlas claim ID or CaseN §k label. */
  id: string;
  caseId?: CaseId;
  section?: number;
}

export interface MechanismProfileContent {
  id: MechanismId;
  alternativeExplanations: Array<{
    text: string;
    relation: MechanismRelationType;
    sources: MechanismSourceRef[];
  }>;
  outcomeNotes: Array<{
    text: string;
    sources: MechanismSourceRef[];
  }>;
  casebookPassages: Array<{
    caseId: CaseId;
    section: number;
    label: string;
    note: string;
  }>;
  limitations: string[];
  /** When true, profile shows taxonomy + linked evidence only. */
  sparseExplanation?: boolean;
}

const PROFILES: Record<string, MechanismProfileContent> = {
  M1: {
    id: 'M1',
    alternativeExplanations: [
      {
        text: 'Commercial scarcity, planning/zoning, and strategic foreclosure are competing — and potentially concurrent — explanations for undeveloped supermarket-capable sites. They must not be collapsed.',
        relation: 'competing_explanation',
        sources: [
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
          { kind: 'claim', id: 'ATLAS-EMP-001' },
          { kind: 'claim', id: 'ATLAS-EMP-002' },
          { kind: 'claim', id: 'ATLAS-HYP-001' },
          { kind: 'claim', id: 'ATLAS-GAP-001' },
        ],
      },
      {
        text: 'Option value / irreversible investment under uncertainty (M5a) can also explain vacant control without proving foreclosure.',
        relation: 'competing_explanation',
        sources: [
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'Family co-tagging with O1–O6 indicates research association in the atlas, not measured transmission or causal identification of site mechanisms.',
        sources: [
          { kind: 'case_section', id: 'Case1 §7', caseId: 'Case1', section: 7 },
          { kind: 'claim', id: 'ATLAS-ASM-002' },
        ],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case1',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'Required M1a ≠ M1b ≠ M1c separation; option value listed alongside.',
      },
      {
        caseId: 'Case1',
        section: 5,
        label: 'Evidence supports / contradicts',
        note: 'Pipeline facts vs absence of nationwide foreclosure determination.',
      },
    ],
    limitations: [
      'General family tags do not independently establish association with a particular submechanism.',
      'No Australian public causal decomposition of M1a/M1b/M1c is registered (ATLAS-GAP-001).',
      'Co-tagged claims include legal facts, empirical findings, hypotheses, assumptions, and gaps — not a single evidentiary status.',
    ],
  },
  M1a: {
    id: 'M1a',
    alternativeExplanations: [
      {
        text: 'Unused sites may reflect genuine scarcity of other viable parcels — distinct from planning delay and from strategic foreclosure.',
        relation: 'competing_explanation',
        sources: [
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
          { kind: 'claim', id: 'ATLAS-EMP-001' },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'Scarcity explanations speak primarily to whether rivals can obtain usable access (O1); they do not establish welfare effects.',
        sources: [
          { kind: 'case_section', id: 'Case1 §7', caseId: 'Case1', section: 7 },
          { kind: 'claim', id: 'ATLAS-CON-003' },
        ],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case1',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M1a physical/commercial scarcity row.',
      },
      {
        caseId: 'Case2',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'Site/planning often still bind after FDI clearance.',
      },
    ],
    limitations: [
      'Table 3.3 pipeline counts are compatible with scarcity, planning, and foreclosure simultaneously (ATLAS-EMP-001; ATLAS-EMP-002).',
    ],
  },
  M1b: {
    id: 'M1b',
    alternativeExplanations: [
      {
        text: 'Holding may track permission delay, contamination, liquor, or centre design — not exclusion.',
        relation: 'competing_explanation',
        sources: [
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
          { kind: 'claim', id: 'ATLAS-LIT-006' },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'Planning associations in foreign evidence remain external-validity constrained for Australian inference.',
        sources: [{ kind: 'claim', id: 'ATLAS-LIT-006' }],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case1',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M1b planning/zoning row.',
      },
      {
        caseId: 'Case4',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'Oversight ≠ planning reform.',
      },
    ],
    limitations: [
      'Planning delay does not prove strategic foreclosure; release instruments may change little if M1b remains binding (Case 1 §6).',
    ],
  },
  M1c: {
    id: 'M1c',
    alternativeExplanations: [
      {
        text: 'Strategic foreclosure via holding, options, or covenants is a live hypothesis (ATLAS-HYP-001), not a proven general Australian pattern.',
        relation: 'hypothesised',
        sources: [
          { kind: 'claim', id: 'ATLAS-HYP-001' },
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
        ],
      },
      {
        text: 'ACCC absence of a land-banking determination does not prove foreclosure is false nationwide; it is an absence of finding (ATLAS-EMP-002).',
        relation: 'competing_explanation',
        sources: [{ kind: 'claim', id: 'ATLAS-EMP-002' }],
      },
    ],
    outcomeNotes: [
      {
        text: 'Even if foreclosure raises rivals’ costs at some sites, consumer-welfare inference from site counts remains forbidden (ATLAS-CON-003).',
        sources: [{ kind: 'claim', id: 'ATLAS-CON-003' }],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case1',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M1c strategic foreclosure — live hypothesis.',
      },
      {
        caseId: 'Case1',
        section: 5,
        label: 'Evidence supports / contradicts',
        note: 'Does not support a nationwide foreclosure premise.',
      },
    ],
    limitations: [
      'Exact M1c tags include legal notification rules, hypotheses, gaps, and policy instruments — not uniform proof of foreclosure.',
      'Do not treat every M1c-tagged claim as evidence that foreclosure occurred.',
    ],
  },
  M2: {
    id: 'M2',
    alternativeExplanations: [
      {
        text: 'Observed distribution-project / opening order is distinct from the hypothesis that logistics was the binding constraint on SA/WA timing.',
        relation: 'hypothesised',
        sources: [
          { kind: 'claim', id: 'ATLAS-EMP-005' },
          { kind: 'claim', id: 'ATLAS-HYP-004' },
          { kind: 'case_section', id: 'Case3 §4', caseId: 'Case3', section: 4 },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'ALDI chronology best disciplines O2 sequencing observations; it does not establish O5/O6 from store counts.',
        sources: [
          { kind: 'case_section', id: 'Case3 §7', caseId: 'Case3', section: 7 },
          { kind: 'claim', id: 'ATLAS-EMP-006' },
        ],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case3',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M2a/M2b observed O2 order.',
      },
      {
        caseId: 'Case3',
        section: 5,
        label: 'Evidence supports / contradicts',
        note: 'Chronology vs identification.',
      },
    ],
    limitations: [
      'Do not infer that logistics bound entry because DC projects preceded openings.',
    ],
  },
  M2a: {
    id: 'M2a',
    alternativeExplanations: [
      {
        text: 'ACCC material treats capital as unlikely binding for large internationals while sites and time-to-scale remain material.',
        relation: 'citation',
        sources: [
          { kind: 'claim', id: 'ATLAS-EMP-003' },
          { kind: 'case_section', id: 'Case2 §4', caseId: 'Case2', section: 4 },
        ],
      },
    ],
    outcomeNotes: [],
    casebookPassages: [
      {
        caseId: 'Case3',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'Scale content paired with M2b chronology.',
      },
    ],
    limitations: [
      'Scale tags do not calibrate Australian MES parameters.',
    ],
  },
  M2b: {
    id: 'M2b',
    alternativeExplanations: [
      {
        text: 'Distribution sequencing is observed; bindingness of logistics for SA/WA timing is not identified (ATLAS-HYP-004).',
        relation: 'hypothesised',
        sources: [
          { kind: 'claim', id: 'ATLAS-EMP-005' },
          { kind: 'claim', id: 'ATLAS-HYP-004' },
        ],
      },
    ],
    outcomeNotes: [],
    casebookPassages: [
      {
        caseId: 'Case3',
        section: 5,
        label: 'Evidence supports / contradicts',
        note: 'Regency Park / Jandakot chronology table.',
      },
    ],
    limitations: [
      'Chronology ≠ causal identification of a logistics bottleneck.',
    ],
  },
  M3: {
    id: 'M3',
    alternativeExplanations: [
      {
        text: 'Format differentiation can yield direct consumer benefits even where incumbent-price responses are limited or incomplete.',
        relation: 'citation',
        sources: [
          { kind: 'claim', id: 'ATLAS-EMP-004' },
          { kind: 'case_section', id: 'Case3 §4', caseId: 'Case3', section: 4 },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'O1–O6 is a conceptual progression, not a mandatory causal chain every entrant must complete.',
        sources: [{ kind: 'claim', id: 'ATLAS-ASM-002' }],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case3',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M3b limited-assortment hard discount.',
      },
    ],
    limitations: [
      'No verified Australian household-level diversion ratios (ATLAS-GAP-002).',
    ],
  },
  M3a: {
    id: 'M3a',
    alternativeExplanations: [
      {
        text: 'Foreign Supercenter evidence separates large revenue diversion from null incumbent price effects — not a calibrated Australian diversion ratio.',
        relation: 'citation',
        sources: [{ kind: 'claim', id: 'ATLAS-LIT-001' }],
      },
    ],
    outcomeNotes: [
      {
        text: 'Associated with O5/O6 identification gaps in Australian public data (ATLAS-GAP-002).',
        sources: [{ kind: 'claim', id: 'ATLAS-GAP-002' }],
      },
    ],
    casebookPassages: [],
    limitations: [
      'Published casebook does not establish a standalone M3a prose definition; profile rests on atlas tags and linked claims.',
    ],
    sparseExplanation: true,
  },
  M3b: {
    id: 'M3b',
    alternativeExplanations: [
      {
        text: 'Limited-assortment hard discount may deliver direct consumer benefits while incompletely constraining majors on all dimensions.',
        relation: 'citation',
        sources: [
          { kind: 'claim', id: 'ATLAS-EMP-004' },
          { kind: 'case_section', id: 'Case3 §4', caseId: 'Case3', section: 4 },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'Format-contingent incumbent price responses abroad contradict universal entry⇒lower incumbent prices (ATLAS-LIT-002).',
        sources: [{ kind: 'claim', id: 'ATLAS-LIT-002' }],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case3',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M3b row.',
      },
    ],
    limitations: [
      'Do not convert format benefits into measured Australian O6 without diversion evidence.',
    ],
  },
  M4: {
    id: 'M4',
    alternativeExplanations: [
      {
        text: 'Ordinary rivalry (M4a), exclusionary response (M4b), revenue diversion, pricing response, and prospective local exit risk must be kept distinct.',
        relation: 'competing_explanation',
        sources: [
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
          { kind: 'case_section', id: 'Case3 §4', caseId: 'Case3', section: 4 },
          { kind: 'case_section', id: 'Case4 §4', caseId: 'Case4', section: 4 },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'Incumbent price response is not measured for SA/WA 2016–18 in PolisLab evidence (Case 3 §4).',
        sources: [
          { kind: 'case_section', id: 'Case3 §4', caseId: 'Case3', section: 4 },
        ],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case4',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M4a Kalgoorlie ordinary expansion; M4b/M1c notification deterrence hypotheses.',
      },
    ],
    limitations: [
      'Jurisdictional and identification limits: local prospective SLC ≠ market-wide O5.',
    ],
  },
  M4a: {
    id: 'M4a',
    alternativeExplanations: [
      {
        text: 'Kalgoorlie illustrates ordinary rivalry / leasehold expansion with a prospective ACCC theory of harm — distinct from M1c foreclosure.',
        relation: 'citation',
        sources: [
          { kind: 'claim', id: 'ATLAS-ADM-002' },
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
        ],
      },
    ],
    outcomeNotes: [],
    casebookPassages: [
      {
        caseId: 'Case4',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M4a ordinary expansion refused (ADM-002).',
      },
    ],
    limitations: [
      'Tribunal final merits reasons for Kalgoorlie were not located as of the release pass.',
    ],
  },
  M4b: {
    id: 'M4b',
    alternativeExplanations: [
      {
        text: 'Exclusionary response via preemption remains distinct from ordinary rivalry; Part 3 causal evaluation of deterrence is a registered gap (ATLAS-GAP-003).',
        relation: 'hypothesised',
        sources: [
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
          { kind: 'claim', id: 'ATLAS-GAP-003' },
        ],
      },
    ],
    outcomeNotes: [],
    casebookPassages: [
      {
        caseId: 'Case4',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M4b/M1c notification may deter preemptive grabs — hypothesis.',
      },
    ],
    limitations: [
      'Notification process coverage is not proof of market-wide foreclosure reduction.',
    ],
  },
  M5: {
    id: 'M5',
    alternativeExplanations: [
      {
        text: 'Case 2 distinguishes irreversible investment (M5a-1) from financing scarcity (M5a-2) as contextual subdivisions of M5a — not atlas tags.',
        relation: 'competing_explanation',
        sources: [
          { kind: 'case_section', id: 'Case2 §4', caseId: 'Case2', section: 4 },
        ],
      },
    ],
    outcomeNotes: [],
    casebookPassages: [
      {
        caseId: 'Case1',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M5a option value.',
      },
      {
        caseId: 'Case2',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M5a-1 vs M5a-2 contextual split.',
      },
    ],
    limitations: [
      'Do not assign fabricated claim counts to M5a-1/M5a-2 or treat all M5a claims as evidence for either subdivision.',
      'Only M5a (not M5b) appears as an exact atlas tag in this release.',
    ],
  },
  M5a: {
    id: 'M5a',
    alternativeExplanations: [
      {
        text: 'Vacant control can be efficient waiting under uncertainty (option value) — competing with foreclosure explanations.',
        relation: 'competing_explanation',
        sources: [
          { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
        ],
      },
      {
        text: 'Financing scarcity is weakened for large internationals per ACCC descriptive anchors; irreversible investment remains distinct.',
        relation: 'citation',
        sources: [
          { kind: 'claim', id: 'ATLAS-EMP-003' },
          { kind: 'case_section', id: 'Case2 §4', caseId: 'Case2', section: 4 },
        ],
      },
    ],
    outcomeNotes: [],
    casebookPassages: [
      {
        caseId: 'Case3',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'Multi-year irreversible investment.',
      },
    ],
    limitations: [
      'Exact M5a tags: ATLAS-EMP-003 and ATLAS-EMP-005 only — do not invent subdivision counts.',
      ...MECHANISM_CONTEXTUAL_SUBDIVISIONS.map((item) => item.note),
    ],
  },
  M6: {
    id: 'M6',
    alternativeExplanations: [
      {
        text: 'Separate actual binding notification or call-in frictions from site/planning and distribution constraints that may remain after clearance.',
        relation: 'competing_explanation',
        sources: [
          { kind: 'case_section', id: 'Case2 §4', caseId: 'Case2', section: 4 },
          { kind: 'claim', id: 'ATLAS-LEG-001' },
          { kind: 'claim', id: 'ATLAS-CON-001' },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'FDI liberalisation alone does not establish durable competition (ATLAS-HYP-003 remains open).',
        sources: [{ kind: 'claim', id: 'ATLAS-HYP-003' }],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case2',
        section: 2,
        label: 'Legal / institutional baseline',
        note: 'Transaction-class FIRB tree.',
      },
      {
        caseId: 'Case2',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M6a/M6b and residual site/logistics constraints.',
      },
    ],
    limitations: [
      'FDI constraints are transaction-specific — not a uniform multi-year barrier.',
    ],
  },
  M6a: {
    id: 'M6a',
    alternativeExplanations: [
      {
        text: 'Private start-business pathways are not generally notifiable; approved-commercial medians contradict uniform multi-year FIRB folklore.',
        relation: 'citation',
        sources: [
          { kind: 'claim', id: 'ATLAS-LEG-001' },
          { kind: 'claim', id: 'ATLAS-ADM-001' },
          { kind: 'claim', id: 'ATLAS-CON-001' },
        ],
      },
    ],
    outcomeNotes: [],
    casebookPassages: [
      {
        caseId: 'Case2',
        section: 3,
        label: 'Counterfactual instruments',
        note: 'CF-A–D pathways are deal-structure dependent.',
      },
    ],
    limitations: [
      'Approval probabilities by pathway are not established.',
    ],
  },
  M6b: {
    id: 'M6b',
    alternativeExplanations: [
      {
        text: 'Greenfield network addition is not interchangeable with acquisition of an incumbent (ATLAS-LIT-005).',
        relation: 'citation',
        sources: [
          { kind: 'claim', id: 'ATLAS-LIT-005' },
          { kind: 'case_section', id: 'Case3 §4', caseId: 'Case3', section: 4 },
        ],
      },
    ],
    outcomeNotes: [
      {
        text: 'Acquisition pathways may leave fascia counts unchanged even when ownership transfers.',
        sources: [
          { kind: 'case_section', id: 'Case2 §7', caseId: 'Case2', section: 7 },
        ],
      },
    ],
    casebookPassages: [
      {
        caseId: 'Case2',
        section: 4,
        label: 'Affected causal mechanisms',
        note: 'M6b greenfield vs acquisition mode.',
      },
    ],
    limitations: [
      'Mode distinction is conceptual/evidence-backed; not a welfare ranking of entry modes.',
    ],
  },
};

export function getMechanismProfileContent(
  id: MechanismId,
): MechanismProfileContent {
  const found = PROFILES[id];
  if (!found) {
    throw new Error(`Missing mechanism profile content for ${id}`);
  }
  return found;
}

export function mechanismDisplayTitle(id: MechanismId): string {
  if (isMechanismFamilyId(id)) {
    return getMechanismFamily(id).label;
  }
  return getMechanismSubmechanism(id).label;
}

export function mechanismDisplayDefinition(id: MechanismId): string {
  if (isMechanismFamilyId(id)) {
    return getMechanismFamily(id).definition;
  }
  return getMechanismSubmechanism(id).definition;
}

export function mechanismProvenance(id: MechanismId): string {
  if (isMechanismFamilyId(id)) {
    return getMechanismFamily(id).provenance;
  }
  return getMechanismSubmechanism(id).provenance;
}

export function mechanismDefinitionLimitation(
  id: MechanismId,
): string | undefined {
  if (isMechanismSubmechanismId(id)) {
    return getMechanismSubmechanism(id).definitionLimitation;
  }
  return undefined;
}

export { getMechanismParentFamily };

export const RELATION_TYPE_LABELS: Record<MechanismRelationType, string> = {
  taxonomy: 'Taxonomy membership',
  metadata: 'Metadata co-tagging',
  citation: 'Published casebook / claim citation',
  hypothesised: 'Hypothesised mechanism',
  competing_explanation: 'Competing explanation',
};

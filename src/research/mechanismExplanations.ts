/**
 * Curated conditional mechanism explanations (Build 05).
 *
 * Structured pathways — not causal graphs with weights, signs presented as
 * established facts, or forecasts. Edge semantics are explicit.
 */

import type { MechanismRelationType, MechanismSourceRef } from './mechanismProfiles';

export interface PathwayNode {
  id: string;
  label: string;
  detail: string;
  relation?: MechanismRelationType;
}

export interface PathwayEdge {
  from: string;
  to: string;
  relation: MechanismRelationType;
  label: string;
}

export interface MechanismExplanation {
  id: string;
  title: string;
  summary: string;
  conditions: string;
  inferentialLimitations: string[];
  qualitativeWording: string;
  sources: MechanismSourceRef[];
  nodes: PathwayNode[];
  edges: PathwayEdge[];
  /** Mechanism profiles this explanation anchors. */
  relatedMechanismIds: string[];
}

export const MECHANISM_EXPLANATIONS: readonly MechanismExplanation[] = [
  {
    id: 'site-control-identification',
    title: 'Site-control identification problem',
    summary:
      'Undeveloped supermarket-capable sites are compatible with commercial scarcity, planning/zoning delay, strategic foreclosure, and efficient waiting / option value — competing or potentially concurrent explanations.',
    conditions:
      'Applies where unused or controlled sites are observed without parcel-level identification of intent (Case 1 framing).',
    inferentialLimitations: [
      'Explanations are not exhaustive or mutually exclusive.',
      'Pipeline counts do not establish foreclosure prevalence (ATLAS-EMP-001; ATLAS-EMP-002).',
      'Strategic foreclosure remains a live hypothesis (ATLAS-HYP-001), not a proven general pattern.',
      'No AU public causal decomposition of M1a/M1b/M1c is registered (ATLAS-GAP-001).',
    ],
    qualitativeWording:
      'Treat M1a / M1b / M1c / option value as competing explanations; do not infer that unused sites are predominantly strategic foreclosure.',
    sources: [
      { kind: 'case_section', id: 'Case1 §4', caseId: 'Case1', section: 4 },
      { kind: 'claim', id: 'ATLAS-EMP-001' },
      { kind: 'claim', id: 'ATLAS-EMP-002' },
      { kind: 'claim', id: 'ATLAS-HYP-001' },
      { kind: 'claim', id: 'ATLAS-GAP-001' },
    ],
    relatedMechanismIds: ['M1', 'M1a', 'M1b', 'M1c', 'M5a'],
    nodes: [
      {
        id: 'obs',
        label: 'Observed unused / controlled sites',
        detail: 'ACCC pipeline facts — counts without why.',
        relation: 'citation',
      },
      {
        id: 'm1a',
        label: 'M1a Commercial scarcity',
        detail: 'Other viable parcels may be scarce.',
        relation: 'competing_explanation',
      },
      {
        id: 'm1b',
        label: 'M1b Planning / zoning',
        detail: 'Permission delay, contamination, liquor, centre design.',
        relation: 'competing_explanation',
      },
      {
        id: 'm1c',
        label: 'M1c Strategic foreclosure',
        detail: 'Live hypothesis — may raise rivals’ costs.',
        relation: 'hypothesised',
      },
      {
        id: 'opt',
        label: 'M5a Option value',
        detail: 'Efficient waiting under uncertainty.',
        relation: 'competing_explanation',
      },
    ],
    edges: [
      {
        from: 'obs',
        to: 'm1a',
        relation: 'competing_explanation',
        label: 'compatible with',
      },
      {
        from: 'obs',
        to: 'm1b',
        relation: 'competing_explanation',
        label: 'compatible with',
      },
      {
        from: 'obs',
        to: 'm1c',
        relation: 'hypothesised',
        label: 'possible explanation for the observed site pattern',
      },
      {
        from: 'obs',
        to: 'opt',
        relation: 'competing_explanation',
        label: 'compatible with',
      },
    ],
  },
  {
    id: 'foreign-investment',
    title: 'Foreign investment frictions vs residual constraints',
    summary:
      'Separate transaction-specific notification or call-in frictions (M6a) and greenfield vs acquisition mode (M6b) from site/planning and distribution constraints that often remain after FDI clearance.',
    conditions:
      'Applies to private foreign grocery entry pathways assessed in Case 2 — deal-structure dependent.',
    inferentialLimitations: [
      'FDI constraints are transaction-specific, not a uniform multi-year barrier.',
      'Private start-business is not generally notifiable (ATLAS-LEG-001).',
      'Acquisition-based entry is not interchangeable with greenfield capacity (ATLAS-LIT-005).',
      'Liberalising FDI alone does not establish durable competition (ATLAS-HYP-003 open).',
    ],
    qualitativeWording:
      'Ask whether a binding notification or call-in was on the critical path for the contemplated deal before attributing delay to FIRB.',
    sources: [
      { kind: 'case_section', id: 'Case2 §2', caseId: 'Case2', section: 2 },
      { kind: 'case_section', id: 'Case2 §3', caseId: 'Case2', section: 3 },
      { kind: 'case_section', id: 'Case2 §4', caseId: 'Case2', section: 4 },
      { kind: 'claim', id: 'ATLAS-LEG-001' },
      { kind: 'claim', id: 'ATLAS-CON-001' },
      { kind: 'claim', id: 'ATLAS-LIT-005' },
      { kind: 'claim', id: 'ATLAS-EMP-003' },
    ],
    relatedMechanismIds: ['M6', 'M6a', 'M6b', 'M1', 'M2'],
    nodes: [
      {
        id: 'deal',
        label: 'Foreign grocery deal structure',
        detail: 'Pathway depends on transaction class.',
        relation: 'citation',
      },
      {
        id: 'm6a',
        label: 'M6a FDI frictions',
        detail: 'Only if notifiable or called in.',
        relation: 'hypothesised',
      },
      {
        id: 'm6b',
        label: 'M6b Entry mode',
        detail: 'Greenfield ≠ acquisition capacity.',
        relation: 'citation',
      },
      {
        id: 'site',
        label: 'M1a/M1b residual',
        detail: 'Often still bind after clearance.',
        relation: 'competing_explanation',
      },
      {
        id: 'log',
        label: 'M2a/M2b residual',
        detail: 'Scale / distribution may bind.',
        relation: 'competing_explanation',
      },
    ],
    edges: [
      {
        from: 'deal',
        to: 'm6a',
        relation: 'hypothesised',
        label: 'may trigger',
      },
      {
        from: 'deal',
        to: 'm6b',
        relation: 'taxonomy',
        label: 'mode choice',
      },
      {
        from: 'm6a',
        to: 'site',
        relation: 'competing_explanation',
        label: 'clearance ≠ site access',
      },
      {
        from: 'm6a',
        to: 'log',
        relation: 'competing_explanation',
        label: 'clearance ≠ logistics',
      },
    ],
  },
  {
    id: 'scale-logistics',
    title: 'Scale and logistics — chronology vs bindingness',
    summary:
      'ALDI state DC projects completed in sequence with first openings establish an observed O2 order. That chronology does not establish that logistics was the binding SA/WA timing constraint.',
    conditions:
      'Applies to Case 3 differentiated-entry chronology (SA/WA 2014–2018 evidence window).',
    inferentialLimitations: [
      'Observed order ≠ identified binding constraint (ATLAS-HYP-004).',
      'Store counts do not establish O5/O6 (ATLAS-CON-003; Case 3 §7).',
      'Sites/planning appear in ALDI submissions nationally but are not identified as the SA/WA timing cause.',
    ],
    qualitativeWording:
      'Report the distribution-before-stores chronology as an O2 observation; keep binding-logistics as a non-identified hypothesis.',
    sources: [
      { kind: 'case_section', id: 'Case3 §4', caseId: 'Case3', section: 4 },
      { kind: 'case_section', id: 'Case3 §5', caseId: 'Case3', section: 5 },
      { kind: 'case_section', id: 'Case3 §7', caseId: 'Case3', section: 7 },
      { kind: 'claim', id: 'ATLAS-EMP-005' },
      { kind: 'claim', id: 'ATLAS-HYP-004' },
    ],
    relatedMechanismIds: ['M2', 'M2a', 'M2b'],
    nodes: [
      {
        id: 'dc',
        label: 'DC projects delivered',
        detail: 'Regency Park / Jandakot chronology.',
        relation: 'citation',
      },
      {
        id: 'open',
        label: 'First state openings',
        detail: 'Observed O2 order.',
        relation: 'citation',
      },
      {
        id: 'bind',
        label: 'Logistics binding?',
        detail: 'Not identified (HYP-004).',
        relation: 'hypothesised',
      },
    ],
    edges: [
      {
        from: 'dc',
        to: 'open',
        relation: 'citation',
        label: 'observed sequence',
      },
      {
        from: 'dc',
        to: 'bind',
        relation: 'hypothesised',
        label: 'does not establish',
      },
    ],
  },
  {
    id: 'incumbent-response',
    title: 'Incumbent competitive response distinctions',
    summary:
      'Distinguish ordinary rivalry, strategic exclusionary response, revenue diversion, pricing response, and prospective local exit risk — with jurisdictional and identification limits preserved.',
    conditions:
      'Applies across Cases 3–4 where incumbent conduct is discussed without market-wide O5 identification.',
    inferentialLimitations: [
      'Incumbent price response not measured for SA/WA 2016–18 in PolisLab evidence.',
      'Revenue diversion ≠ price cuts (ATLAS-LIT-001).',
      'Local prospective SLC (Kalgoorlie) ≠ market-wide competitive constraint.',
      'Notification volumes are not a competition KPI.',
    ],
    qualitativeWording:
      'Keep M4a ordinary rivalry distinct from M4b exclusionary response and from M1c site foreclosure; refuse nationwide inference from local determinations.',
    sources: [
      { kind: 'case_section', id: 'Case3 §4', caseId: 'Case3', section: 4 },
      { kind: 'case_section', id: 'Case3 §6', caseId: 'Case3', section: 6 },
      { kind: 'case_section', id: 'Case4 §4', caseId: 'Case4', section: 4 },
      { kind: 'claim', id: 'ATLAS-ADM-002' },
      { kind: 'claim', id: 'ATLAS-LIT-001' },
      { kind: 'claim', id: 'ATLAS-GAP-003' },
    ],
    relatedMechanismIds: ['M4', 'M4a', 'M4b', 'M1c'],
    nodes: [
      {
        id: 'm4a',
        label: 'M4a Ordinary rivalry',
        detail: 'e.g. Kalgoorlie leasehold expansion.',
        relation: 'citation',
      },
      {
        id: 'm4b',
        label: 'M4b Exclusionary response',
        detail: 'Preemption hypotheses; GAP-003.',
        relation: 'hypothesised',
      },
      {
        id: 'div',
        label: 'Revenue diversion',
        detail: 'May occur without price cuts.',
        relation: 'citation',
      },
      {
        id: 'price',
        label: 'Pricing response',
        detail: 'Format-contingent abroad; AU gap.',
        relation: 'metadata',
      },
      {
        id: 'exit',
        label: 'Prospective local exit risk',
        detail: 'Case-specific ACCC theory.',
        relation: 'citation',
      },
    ],
    edges: [
      {
        from: 'm4a',
        to: 'exit',
        relation: 'citation',
        label: 'may accompany',
      },
      {
        from: 'div',
        to: 'price',
        relation: 'competing_explanation',
        label: 'does not imply',
      },
      {
        from: 'm4b',
        to: 'm4a',
        relation: 'competing_explanation',
        label: 'distinct from',
      },
    ],
  },
] as const;

export function explanationsForMechanism(
  mechanismId: string,
): MechanismExplanation[] {
  return MECHANISM_EXPLANATIONS.filter((item) =>
    item.relatedMechanismIds.includes(mechanismId),
  );
}

/**
 * Curated Overview synthesis — separate from raw atlas claim text.
 * Every claim_id must resolve against the loaded atlas.
 * Proposition-level citations attach evidence to the statement it supports.
 */

import type { CaseId } from './taxonomy';

export interface InsightProposition {
  /** Distinct proposition within the insight. */
  text: string;
  /** Atlas IDs that substantiate this proposition. */
  claimIds: readonly string[];
}

export interface ResearchInsight {
  id: string;
  title: string;
  propositions: readonly InsightProposition[];
  limitation: string;
  /**
   * How to read the cited material (assumption vs empirical/legal fact).
   * Not an evidence-strength score.
   */
  evidenceReading: string;
}

export interface ResearchBoundary {
  id: string;
  statement: string;
  claimIds: readonly string[];
}

/** Five source-linked research insights for Overview section E. */
export const RESEARCH_INSIGHTS: readonly ResearchInsight[] = [
  {
    id: 'baseline-oversight',
    title: 'Institutional baseline already includes site-acquisition oversight',
    evidenceReading:
      'Mix of a maintained institutional framing assumption (ASM-001) and verified legal facts on targeted notification duties. Notification is not prohibition.',
    propositions: [
      {
        text: 'Existing site-acquisition and competition oversight must be included in the institutional baseline: post-2026 settings already combine transaction-specific foreign-investment pathways with mandatory ACCC merger notification.',
        claimIds: ['ATLAS-ASM-001'],
      },
      {
        text: 'Part 3 major-supermarket notification is targeted to Coles/Woolworths and connected entities only (not a general market-share trigger), and covers qualifying supermarket-business and land/lease acquisitions meeting size tests — with carve-outs and a 30 June 2030 sunset unless renewed.',
        claimIds: ['ATLAS-LEG-006', 'ATLAS-LEG-007'],
      },
      {
        text: 'Notification is a suspensory reporting duty, not an automatic prohibition; substantive refusal still requires an SLC assessment under the competition framework.',
        claimIds: ['ATLAS-LEG-007'],
      },
    ],
    limitation:
      'ASM-001 is a dated framing assumption, not effectiveness evidence. Legal facts describe notification architecture as at the cutoff; they do not show that oversight is competitively sufficient or welfare-improving.',
  },
  {
    id: 'site-constraints-unresolved',
    title: 'Site constraints matter; scarcity, planning and foreclosure remain distinct',
    evidenceReading:
      'Empirical pipeline and entry findings sit alongside an absence of inquiry finding, an unresolved foreclosure hypothesis, and a registered evidence gap. These are not interchangeable.',
    propositions: [
      {
        text: 'Inquiry evidence documents large undeveloped/unused supermarket site pipelines and treats suitable sites and planning as material entry constraints.',
        claimIds: ['ATLAS-EMP-001', 'ATLAS-EMP-003'],
      },
      {
        text: 'Scarcity (M1a), planning/zoning delay (M1b), and strategic foreclosure (M1c) remain distinct candidate explanations; public evidence does not isolate their relative roles.',
        claimIds: ['ATLAS-HYP-001', 'ATLAS-GAP-001'],
      },
      {
        text: 'The ACCC inquiry did not determine case-by-case whether undeveloped sites constituted land banking; that absence of finding is not proof that exclusionary holding is absent.',
        claimIds: ['ATLAS-EMP-002'],
      },
    ],
    limitation:
      'Pipeline counts are descriptive. Strategic foreclosure remains a live hypothesis without a verified nationwide determination. No registered AU reduced-form separation of planning delay from strategic holding.',
  },
  {
    id: 'fdi-branching',
    title: 'Foreign-investment constraints are transaction-specific',
    evidenceReading:
      'Verified legal pathway facts and contested uniform-screening claims, plus administrative processing statistics and external literature on FDI modes — not a single barrier magnitude.',
    propositions: [
      {
        text: 'Private foreign persons starting a non-national-security Australian business are not generally subject to mandatory s 47 notification, though the action remains a reviewable national-security action (call-in / voluntary notification).',
        claimIds: ['ATLAS-LEG-001'],
      },
      {
        text: 'Foreign government investors face a different start-business rule: starting an Australian business is both significant and notifiable under FATR s 56(1)(b).',
        claimIds: ['ATLAS-LEG-002'],
      },
      {
        text: 'Vacant commercial land, developed-land thresholds, and longer lease/licence interests (including >5-year limbs and agreement/option timing) are distinct asset-structure pathways — not one uniform multi-year screen.',
        claimIds: ['ATLAS-LEG-003', 'ATLAS-LEG-005', 'ATLAS-CON-002'],
      },
      {
        text: 'Greenfield FDI and merger/acquisition FDI are not interchangeable modes in the entry literature; mode choice matters for how barriers bind.',
        claimIds: ['ATLAS-LIT-005'],
      },
      {
        text: 'Uniform multi-year FIRB-delay folklore is unusable as a current baseline; approved-commercial medians in one reported quarter were about one month, as cohort statistics rather than guarantees.',
        claimIds: ['ATLAS-CON-001', 'ATLAS-ADM-001'],
      },
    ],
    limitation:
      'Approval probabilities by pathway remain unidentified. Administrative medians are approval-cohort statistics, not supermarket-specific or national-security guarantees. LIT-005 is not Australian grocery-specific.',
  },
  {
    id: 'capacity-not-welfare',
    title: 'Capacity does not establish durable competition or welfare',
    evidenceReading:
      'Maintained methodological separation of O1–O6 (ASM-002), contested inference restrictions (CON-003), ALDI chronology empirics (EMP-005), mechanism-test absence (HYP-004), and diversion-ratio gap (GAP-002).',
    propositions: [
      {
        text: 'The O1–O6 chain is contingent at each step: access ≠ capacity ≠ viability ≠ survival ≠ durable constraint ≠ welfare.',
        claimIds: ['ATLAS-ASM-002'],
      },
      {
        text: 'Store expansion and productive capacity — including observed ALDI SA/WA distribution-before-stores chronology — do not independently establish durable competitive constraint or consumer welfare.',
        claimIds: ['ATLAS-EMP-005', 'ATLAS-CON-003'],
      },
      {
        text: 'Public ALDI chronology cannot discriminate distribution/scale constraints from ordinary investment sequencing, nor identify exclusivity/planning reforms as the binding cause of 2013–18 timing.',
        claimIds: ['ATLAS-HYP-004'],
      },
      {
        text: 'No verified Australian household-level diversion ratios between majors and specialty/Asian/hard-discount formats were registered for this release.',
        claimIds: ['ATLAS-GAP-002'],
      },
    ],
    limitation:
      'ASM-002 is a methodological convention, not an empirical estimate. EMP-005 establishes sequencing facts without causal identification. Welfare inference from entry counts remains unsupported (CON-003).',
  },
  {
    id: 'acquisition-events-distinct',
    title: 'Notifications, waivers and determinations are distinct events',
    evidenceReading:
      'Verified legal distinctions among notification, waiver and determination; a single administrative determination; Tribunal review status at release; and register-sample empirics with stated limits.',
    propositions: [
      {
        text: 'Part 3 duties, notification waivers, and individual acquisition determinations are distinct institutional events. A waiver grant removes the need to notify but leaves s 50 in place; waiver refusal is not itself a prohibition of the deal.',
        claimIds: ['ATLAS-LEG-006', 'ATLAS-LEG-008'],
      },
      {
        text: 'The Kalgoorlie determination is a local administrative outcome with a published prospective SLC theory; it is not nationwide foreclosure doctrine or an aggregate competition metric.',
        claimIds: ['ATLAS-ADM-002', 'ATLAS-CON-003'],
      },
      {
        text: 'As of the research release retrieval, Coles’ Tribunal review of that determination had a listed substantive hearing window, and final Tribunal orders/reasons had not been located on the official listing.',
        claimIds: ['ATLAS-ADM-003'],
      },
      {
        text: 'A project-scoped public-register sample of Coles/Woolworths land/lease events mixes determinations and waivers and does not demonstrate deal-to-development links or market-wide outcomes.',
        claimIds: ['ATLAS-EMP-007'],
      },
    ],
    limitation:
      'Case-level administrative outcomes and incomplete register samples cannot be summed into nationwide competitive effects. Final Kalgoorlie Tribunal merits disposition was not verified for the release.',
  },
] as const;

export const RESEARCH_BOUNDARIES: readonly ResearchBoundary[] = [
  {
    id: 'no-diversion-welfare',
    statement:
      'No calibrated Australian diversion ratios or consumer-welfare estimates are available in this release.',
    claimIds: ['ATLAS-CON-003', 'ATLAS-GAP-002'],
  },
  {
    id: 'no-causal-release-part3',
    statement:
      'No established causal effectiveness of compulsory site release or Part 3 notification is claimed; Layer D develop-or-release remains additional to the baseline with unverified effectiveness.',
    claimIds: ['ATLAS-POL-001', 'ATLAS-GAP-003'],
  },
  {
    id: 'no-nationwide-landbanking',
    statement:
      'No demonstrated nationwide exclusionary land-banking finding is recorded; the ACCC inquiry did not determine case-by-case land banking, and that absence of finding is not proof of absence.',
    claimIds: ['ATLAS-EMP-002'],
  },
  {
    id: 'no-policy-ranking',
    statement:
      'No justified quantified ranking of hypothetical policy packages is supported; Phase 0D.2-style propositions remain qualitative caution only.',
    claimIds: ['ATLAS-HYP-002'],
  },
  {
    id: 'kalgoorlie-tribunal',
    statement:
      'The final Kalgoorlie Tribunal merits outcome was not verified for the research release (evidence cutoff 20 November 2026; correction pass 21 November 2026).',
    claimIds: ['ATLAS-ADM-002', 'ATLAS-ADM-003'],
  },
] as const;

/** Flatten all claim IDs cited by an insight (proposition order, deduped). */
export function insightClaimIds(insight: ResearchInsight): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const proposition of insight.propositions) {
    for (const id of proposition.claimIds) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
}

/** All curated claim IDs referenced by Overview synthesis content. */
export function allCuratedClaimIds(): string[] {
  const ids = new Set<string>();
  for (const insight of RESEARCH_INSIGHTS) {
    for (const id of insightClaimIds(insight)) {
      ids.add(id);
    }
  }
  for (const boundary of RESEARCH_BOUNDARIES) {
    for (const id of boundary.claimIds) {
      ids.add(id);
    }
  }
  return [...ids].sort((a, b) => a.localeCompare(b));
}

export function caseExploreLabel(caseId: CaseId): string {
  return `Explore ${caseId} cited claims`;
}

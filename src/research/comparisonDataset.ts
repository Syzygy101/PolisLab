/**
 * Policy Comparison Laboratory (Build 06) — curated qualitative dataset.
 *
 * Source: research/10_policy_assessment_casebook.md, published v0.1.1
 * (§§2–9 of each case, plus the four-case comparison table), with atlas claim
 * IDs as cited in the casebook. Nothing here is a ranking, score, probability
 * or effect size; the casebook declares no policy winner in any case.
 *
 * Conventions
 * - Layer A law in force · B administrative practice/observed · C announced
 *   reforms (not entitlements) · D hypothetical PolisLab instruments.
 * - Pathway `variantIds: null` means a case-level shared pathway: the
 *   published §6 text does not tie that clause to a single variant. A pathway
 *   carries variant IDs only where the published text assigns it.
 * - O1–O6 stay separate: access ≠ capacity ≠ viability ≠ survival ≠ durable
 *   constraint ≠ welfare (ATLAS-ASM-002; ATLAS-CON-003).
 */

import { CASEBOOK_SOURCE_PATH } from './casebookConstants';
import {
  COMPARISON_DATASET_VERSION,
  ComparisonDatasetSchema,
  comparisonSectionRefId,
  type ComparisonBaseline,
  type ComparisonDataset,
  type ComparisonPathway,
  type ComparisonSourceRef,
  type CaseComparisonOrientation,
  type EvidenceUse,
  type InterventionVariant,
  type OutcomeAssessment,
} from './comparisonSchema';
import type { CaseId } from './taxonomy';

/** SHA-256 of research/10_policy_assessment_casebook.md at published v0.1.1. */
export const COMPARISON_SOURCE_CONTENT_SHA256 =
  '3da0e29c56f05f76b9cd0c663d3372140122ca39c71d5a202a298cf7c7ca4c08' as const;

const claim = (id: string): ComparisonSourceRef => ({ kind: 'claim', id });
const sec = (caseId: CaseId, section: number): ComparisonSourceRef => ({
  kind: 'case_section',
  id: comparisonSectionRefId(caseId, section),
  caseId,
  section,
});

const SHARED = null;

/* -------------------------------------------------------------------------- */
/* Baselines                                                                  */
/* -------------------------------------------------------------------------- */

const baselines: ComparisonBaseline[] = [
  /* Case 1 */
  {
    id: 'C1-BASE-2026',
    caseId: 'Case1',
    label: 'Current Australian law at undeveloped supermarket sites',
    layer: 'A',
    description:
      'Not a site-control vacuum after 1 January 2026. Coles/Woolworths connected entities face mandatory ACCC notification under the Determination (ss 1-7, 3-1–3-3; size tests; carve-outs; sunset 30 Jun 2030). The CCA can reach anti-competitive provisions and historical undertakings exist, but there is no verified comprehensive statutory grocery-exclusion ban. Foreign vacant commercial land is generally $0 notifiable, with separately described typical productive-use / ~5-year construction conditions for foreign acquirers (not a domestic incumbent release statute). No numeric local site-share cap is verified in statute; a 40% cap is Layer D only. What remains additional is automatic release, numeric caps, and a blanket exclusivity ban beyond case-by-case CCA and merger tools.',
    datedNote: 'Foundation cutoff 20 November 2026 (institutional/legal).',
    sources: [
      sec('Case1', 2),
      claim('ATLAS-ASM-001'),
      claim('ATLAS-LEG-003'),
      claim('ATLAS-LEG-006'),
      claim('ATLAS-LEG-007'),
      claim('ATLAS-POL-001'),
      claim('ATLAS-POL-002'),
      claim('ATLAS-POL-004'),
    ],
  },
  {
    id: 'C1-BASE-ACCC-PIPELINE',
    caseId: 'Case1',
    label: 'ACCC-documented undeveloped site pipelines',
    layer: 'B',
    description:
      'The ACCC inquiry documented undeveloped/unused pipelines intended for future supermarket use: ALDI 17, Coles 59, Woolworths 105 (Coles+Woolworths 164). This is descriptive, not a divestiture order. The inquiry did not determine case-by-case land banking (outside scope): an absence of finding, not proof that foreclosure is absent. The counts are compatible with scarcity, planning, and foreclosure explanations.',
    datedNote: 'ACCC supermarkets inquiry, as pinned in the atlas (Table 3.3; pp 160–165).',
    sources: [
      sec('Case1', 2),
      sec('Case1', 4),
      claim('ATLAS-EMP-001'),
      claim('ATLAS-EMP-002'),
    ],
  },

  /* Case 2 */
  {
    id: 'C2-BASE-2026',
    caseId: 'Case2',
    label: 'Post-2026 FIRB/FATA baseline, branched by transaction class',
    layer: 'A',
    description:
      'Not a regulatory vacuum. T1 start an Australian grocery business without land/business acquisition: not generally notifiable under s 47, but reviewable NS action under s 55E(2) (call-in / voluntary notification). T2 freehold vacant commercial land: generally $0 notifiable; typical productive-use / ~5-year construction conditions are a separate Guidance Note 4 practice point. T3 freehold developed non-sensitive commercial land: certain FTA private threshold >$1,498m (1 Jan 2026 summary), so many store-level sites may fall below. T5/T6 long lease / AFL / option: may be a land interest (s 12 >5-year limb; s 15 agreement-option rules), after which vacant vs developed thresholds apply. T8/T9 acquire an existing retailer: different pathways, not greenfield capacity addition. FGI contrast: start-business must notify (FATR s 56(1)(b)); land generally $0. ACCC Part 3 supermarket rules apply to Coles/Woolworths connected entities, not automatically to a foreign entrant. Commonwealth FIRB/ACCC clearance does not substitute for State/local development consent.',
    datedNote:
      'Private non-FGI entrant; Japanese-formed private acquirer eligible for certain FTA thresholds unless stated. Foundation cutoff 20 November 2026.',
    sources: [
      sec('Case2', 2),
      claim('ATLAS-ASM-001'),
      claim('ATLAS-CON-002'),
      claim('ATLAS-LEG-001'),
      claim('ATLAS-LEG-002'),
      claim('ATLAS-LEG-003'),
      claim('ATLAS-LEG-004'),
      claim('ATLAS-LEG-005'),
      claim('ATLAS-LEG-006'),
      claim('ATLAS-LIT-005'),
    ],
  },
  {
    id: 'C2-BASE-ADMIN-2026',
    caseId: 'Case2',
    label: 'Observed FIRB processing for approved commercial proposals',
    layer: 'B',
    description:
      'For approved commercial proposals in Apr–Jun 2026, Treasury reports a 31-day median and that 50% were decided in 30 days or less. These are approval-cohort statistics, not guarantees, and not grocery-specific processing distributions. They reject the MVP 60–240 month baseline.',
    datedNote: 'Treasury quarterly report, Apr–Jun 2026.',
    sources: [sec('Case2', 2), claim('ATLAS-ADM-001'), claim('ATLAS-CON-001')],
  },
  {
    id: 'C2-BASE-ANNOUNCED-2027',
    caseId: 'Case2',
    label: 'Announced low-risk streamlining targets (not entitlements)',
    layer: 'C',
    description:
      'Announced 1 Jan 2027 low-risk 30-day performance targets are Layer C. They are not treated as current entitlements, and confirmation of commencement dates on the Federal Register is outstanding. CF-C overlaps this announced streamlining but is not identical to it.',
    datedNote: 'Announced for 1 January 2027; commencement unconfirmed in the casebook release.',
    sources: [sec('Case2', 3), sec('Case2', 8), sec('Case2', 9)],
  },

  /* Case 3 */
  {
    id: 'C3-BASE-2026',
    caseId: 'Case3',
    label: 'Current baseline for a new differentiated entrant',
    layer: 'A',
    description:
      'Private FDI branching as in Case 2. The entrant is not a Determination s 1-7 major supermarket by default. From 1 July 2026, very large retailers (covered revenue >$30b prior FY) are subject to the Food and Grocery Code excessive-pricing prohibition under s 45B’s “in all the circumstances” standard: a conduct rule, not a measured price effect. The ACCC inquiry characterisation of ALDI as an important but limited-range constraint remains the Australian institutional reading.',
    datedNote: 'Foundation cutoff 20 November 2026; Code prohibition from 1 July 2026.',
    sources: [
      sec('Case3', 2),
      claim('ATLAS-ASM-001'),
      claim('ATLAS-EMP-004'),
      claim('ATLAS-LEG-009'),
    ],
  },
  {
    id: 'C3-BASE-ALDI-2016',
    caseId: 'Case3',
    label: 'ALDI SA/WA 2016 chronology (observed O2 benchmark)',
    layer: 'B',
    description:
      'ALDI’s SA/WA expansion (announced 2013; openings 2016) occurred under pre-2026 merger settings and is used as a historical mechanism test, not a description of today’s Determination Part 3. Observed order: Regency Park (SA) DC contract completion November 2015; Jandakot (WA) DC duration late 2014 – early 2016; first SA stores 3 Feb 2016; first WA stores 8 Jun 2016; end-2018 aggregates of 29 SA, 41 WA and 526 nationally. This is an O2 benchmark, not a causal estimate.',
    datedNote: 'Pre-2026 observations; end-2018 aggregates from the ALDI Economic Impact Report.',
    sources: [
      sec('Case3', 2),
      sec('Case3', 5),
      claim('ATLAS-EMP-005'),
      claim('ATLAS-EMP-006'),
      claim('ATLAS-HYP-004'),
    ],
  },

  /* Case 4 */
  {
    id: 'C4-BASE-2026',
    caseId: 'Case4',
    label: 'Post-1 Jan 2026 ACCC notification regime',
    layer: 'A',
    description:
      'Mandatory notification from 1 January 2026, Part 3 supermarket land/business rules, and case-by-case SLC assessment. Determination Part 3 (ss 1-7, 3-1–3-3) adds notification duties for Coles/Woolworths connected entities acquiring supermarket businesses or qualifying land/lease interests. General Part 2 thresholds require broad suspensory notification when revenue/value tests are met. Part 3 sunsets on 30 Jun 2030. Notification, waiver, determination, and store opening are distinct steps.',
    datedNote: 'Foundation cutoff 20 November 2026.',
    sources: [
      sec('Case4', 2),
      sec('Case4', 3),
      claim('ATLAS-ASM-001'),
      claim('ATLAS-LEG-005'),
      claim('ATLAS-LEG-006'),
      claim('ATLAS-LEG-007'),
      claim('ATLAS-LEG-008'),
    ],
  },
  {
    id: 'C4-BASE-KALGOORLIE-2026',
    caseId: 'Case4',
    label: 'Kalgoorlie Phase 2 (voluntary notification, local prospective theory)',
    layer: 'B',
    description:
      'Coles notified a leasehold on 27 November 2025, when notification under the new regime was permitted but voluntary. The ACCC determination (30 June 2026; public 1 July 2026) is that the acquisition must not be put into effect, on a prospective theory of harm via independent asset-exit risk. Tribunal matter ACT 1 of 2026 was listed for hearing 9–12 and 16–19 November 2026; final merits orders/reasons were not located for the release pass. A 24 September 2026 Tribunal determination on interim evidentiary applications is not final disposition. It is not an example of compulsory Part 3 notification and is not classified as land banking.',
    datedNote:
      'Tribunal status dated from the official listing at the v0.1.1 release pass (21 November 2026).',
    sources: [
      sec('Case4', 2),
      sec('Case4', 5),
      claim('ATLAS-ADM-002'),
      claim('ATLAS-ADM-003'),
    ],
  },
  {
    id: 'C4-BASE-REGISTER-SAMPLE-2026',
    caseId: 'Case4',
    label: 'Nine-event ACCC register pilot (process illustration only)',
    layer: 'B',
    description:
      'Under documented filters (Coles or Woolworths party; event date 1 Jul–30 Sep 2026; supermarket land/lease inclusion; MN-65028 Paydock excluded as non-site), nine events were coded with public register URLs. The mix includes notification determinations and waiver decisions; anticipated openings are mostly 2027–2033; completion/opening is not independently established. It is an identified sample, not a census; MN and WA must never be pooled.',
    datedNote: 'Events dated 1 Jul–30 Sep 2026 under the stated filters.',
    sources: [sec('Case4', 5), claim('ATLAS-EMP-007')],
  },
];

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

const variants: InterventionVariant[] = [
  /* Case 1 */
  {
    id: 'C1-VAR-R',
    caseId: 'Case1',
    label: 'R — Develop-or-release',
    shortCode: 'R',
    definition:
      'Layer D. If a designated controller holds exclusive undeveloped control of a qualifying supermarket-capable site past a statutory milestone, it must develop (open or commence continuous development under defined criteria) or release control into an open assignment process. Not claimed: that released sites go to rivals; that deadlines are constitutionally settled; that R restates FIRB practice. Legal feasibility of compulsory release and property-rights characterisation remains UNVERIFIED specialist territory.',
    baselineId: 'C1-BASE-2026',
    conditions: [
      'A designated controller of a strategically important undeveloped supermarket site',
      'Exclusive undeveloped control of a qualifying supermarket-capable site',
      'Control continues past a stated deadline / statutory milestone',
      'Develop (open or commence continuous development under defined criteria) or release control into an open assignment process',
    ],
    retainedConstraints: [
      'Physical/commercial scarcity of other viable parcels (M1a) is not addressed by the instrument',
      'Planning/zoning (M1b) may remain binding: holding may track permission delay, contamination, liquor, or centre design rather than exclusion',
    ],
    sources: [
      sec('Case1', 1),
      sec('Case1', 3),
      sec('Case1', 4),
      claim('ATLAS-POL-001'),
    ],
  },
  {
    id: 'C1-VAR-E',
    caseId: 'Case1',
    label: 'E — Exclusivity restriction',
    shortCode: 'E',
    definition:
      'Layer D. Grocery exclusivity clauses / covenants that prevent rival supermarket use on the controlled parcel or designated centre are void or prohibited, subject to any transitional carve-outs. Not claimed: that E is costless for landlord development inducement; that E equals R.',
    baselineId: 'C1-BASE-2026',
    conditions: [
      'Clauses or covenants that prevent rival supermarket use on the controlled parcel or designated centre',
      'Such clauses are void or prohibited (a categorical limit or ban beyond case-by-case CCA reach)',
      'Subject to any transitional carve-outs',
    ],
    retainedConstraints: [
      'Physical/commercial scarcity (M1a) and planning/zoning (M1b) remain competing explanations for non-entry',
      'A contractual ban alone does not restrict fee-simple vacant control (the premise of the published substitution pathway)',
    ],
    sources: [
      sec('Case1', 1),
      sec('Case1', 3),
      sec('Case1', 4),
      claim('ATLAS-POL-001'),
      claim('ATLAS-POL-002'),
    ],
  },

  /* Case 2 */
  {
    id: 'C2-VAR-CF-A',
    caseId: 'Case2',
    label: 'CF-A — Lighter private vacant-land notification/conditions',
    shortCode: 'CF-A',
    definition:
      'Lower scrutiny / faster process for private vacant-commercial notifications, or milder productive-use conditions.',
    baselineId: 'C2-BASE-2026',
    conditions: [
      'Legal object: private acquisition of freehold vacant commercial land (T2), generally $0 notifiable; typical productive-use / ~5-year construction conditions are a separate Guidance Note 4 practice point',
      'Relevant only where FIRB notification or conditions were on the critical path of the entrant’s actual deal',
    ],
    retainedConstraints: [
      'Planning clocks',
      'Site scarcity',
      'DC (distribution centre) investment',
    ],
    sources: [
      sec('Case2', 3),
      claim('ATLAS-POL-003'),
      claim('ATLAS-LEG-003'),
    ],
  },
  {
    id: 'C2-VAR-CF-B',
    caseId: 'Case2',
    label: 'CF-B — Assurance on s 55E call-in residual for start-business',
    shortCode: 'CF-B',
    definition:
      'Statutory or policy assurance reducing s 55E call-in residual anxiety for ordinary grocery start-business.',
    baselineId: 'C2-BASE-2026',
    conditions: [
      'Legal object: starting an Australian grocery business without land/business acquisition (T1): not generally notifiable under s 47, but reviewable NS action under s 55E(2) (call-in / voluntary notification)',
    ],
    retainedConstraints: ['Land notifications where thresholds bite'],
    sources: [
      sec('Case2', 3),
      claim('ATLAS-POL-003'),
      claim('ATLAS-LEG-001'),
    ],
  },
  {
    id: 'C2-VAR-CF-C',
    caseId: 'Case2',
    label: 'CF-C — Competition-purposive greenfield preference',
    shortCode: 'CF-C',
    definition:
      'Competition-purposive greenfield preference relative to acquisitions. Layer D; overlaps announced low-risk streamlining (Layer C) but is not identical to it.',
    baselineId: 'C2-BASE-2026',
    conditions: [
      'Mode choice: new stores/DCs (greenfield capacity) versus buying an incumbent chain',
      'Acquisition pathways (T8/T9) are different pathways and are not greenfield capacity addition',
    ],
    retainedConstraints: ['National-security review', 'FGI rules'],
    sources: [
      sec('Case2', 2),
      sec('Case2', 3),
      claim('ATLAS-POL-003'),
      claim('ATLAS-LIT-005'),
    ],
  },
  {
    id: 'C2-VAR-CF-D',
    caseId: 'Case2',
    label: 'CF-D — FGI treated like a private investor for start-business',
    shortCode: 'CF-D',
    definition:
      'Treating a foreign government investor (FGI) like a private investor for start-business notification.',
    baselineId: 'C2-BASE-2026',
    conditions: [
      'Contrast in baseline: an FGI start-business must notify (FATR s 56(1)(b)); land is generally $0 notifiable',
    ],
    retainedConstraints: ['Broader national-interest/security tools'],
    sources: [
      sec('Case2', 2),
      sec('Case2', 3),
      claim('ATLAS-POL-003'),
      claim('ATLAS-LEG-002'),
    ],
  },

  /* Case 3 */
  {
    id: 'C3-VAR-SITE-FDI',
    caseId: 'Case3',
    label: 'Site-access / FDI friction-lowering policy class',
    shortCode: 'SITE-FDI',
    definition:
      'Not a single statute. A policy class that lowers site-access or FDI frictions for a differentiated foreign format, holding constant the need to build distribution capacity.',
    baselineId: 'C3-BASE-2026',
    conditions: [
      'Lowers site-access frictions and/or FDI frictions for a differentiated foreign format',
    ],
    retainedConstraints: [
      'The need to build distribution capacity (M2a/M2b) is held constant',
    ],
    sources: [sec('Case3', 3), claim('ATLAS-HYP-004')],
  },
  {
    id: 'C3-VAR-FDI-ONLY',
    caseId: 'Case3',
    label: 'Analytical comparator — a world that only liberalises FDI',
    shortCode: 'FDI-ONLY',
    definition:
      'Analytical comparator only (not a fully specified legislative instrument). Stated comparator world: policy only liberalises FDI. No further definition is published.',
    baselineId: 'C3-BASE-2026',
    conditions: ['Only FDI is liberalised'],
    retainedConstraints: [],
    sources: [sec('Case3', 3)],
  },
  {
    id: 'C3-VAR-MERGER-ONLY',
    caseId: 'Case3',
    label: 'Analytical comparator — a world that only tightens merger notification',
    shortCode: 'MERGER-ONLY',
    definition:
      'Analytical comparator only (not a fully specified legislative instrument). Stated comparator world: policy only tightens merger notification. No further definition is published.',
    baselineId: 'C3-BASE-2026',
    conditions: ['Only merger notification is tightened'],
    retainedConstraints: [],
    sources: [sec('Case3', 3)],
  },

  /* Case 4 */
  {
    id: 'C4-VAR-B0',
    caseId: 'Case4',
    label: 'B0 — Current notification regime',
    shortCode: 'B0',
    definition:
      'Baseline B0: post-1 Jan 2026 mandatory notification, Part 3 supermarket land/business rules, and case-by-case SLC assessment.',
    baselineId: 'C4-BASE-2026',
    conditions: [
      'Notification: Part 3 imposes extra notification duties on Coles/Woolworths connected entities acquiring supermarket businesses or qualifying land/lease interests; general Part 2 thresholds apply when revenue/value tests are met',
      'Determination: decides whether a notified acquisition may or must not be put into effect; it does not establish settlement, construction, or opening',
      'Waiver: decides whether notification is required; a grant removes the need to notify but s 50 still applies; refusal leaves any applicable notification and standstill obligations in place; it is not a substantive clearance',
      'Openings: completion and store opening are separate later events, not established by notification, waiver, or determination',
    ],
    retainedConstraints: [
      'Oversight of acquisitions does not create zoned sites or shorten planning clocks (M1a/M1b)',
      'Case-by-case SLC assessment remains the substantive test',
    ],
    sources: [
      sec('Case4', 2),
      sec('Case4', 3),
      sec('Case4', 4),
      claim('ATLAS-ASM-001'),
      claim('ATLAS-LEG-006'),
      claim('ATLAS-LEG-007'),
      claim('ATLAS-LEG-008'),
    ],
  },
  {
    id: 'C4-VAR-CF-STRONGER',
    caseId: 'Case4',
    label: 'CF-stronger — Layer D rules beyond case-by-case SLC',
    shortCode: 'CF-stronger',
    definition:
      'Layer D presumptions against incumbent acquisition of challengers/sites, numeric caps, or automatic release (beyond SLC). The published alternatives are kept separate rather than blended.',
    baselineId: 'C4-BASE-2026',
    conditions: [
      'Alternative 1: presumptions against incumbent acquisition of challengers/sites',
      'Alternative 2: numeric caps',
      'Alternative 3: automatic release',
    ],
    retainedConstraints: [
      'Oversight of acquisitions does not create zoned sites or shorten planning clocks (M1a/M1b)',
    ],
    sources: [
      sec('Case4', 3),
      sec('Case4', 4),
      claim('ATLAS-GAP-003'),
    ],
  },
  {
    id: 'C4-VAR-CF-WEAKER',
    caseId: 'Case4',
    label: 'CF-weaker — Sunset without replacement / waiver treated as assurance',
    shortCode: 'CF-weaker',
    definition:
      'Sunset or non-renewal of Part 3 after 30 Jun 2030 without replacement, or treating waiver grants as sufficient competition assurance. The published alternatives are kept separate rather than blended.',
    baselineId: 'C4-BASE-2026',
    conditions: [
      'Alternative 1: sunset/non-renewal of Part 3 after 30 Jun 2030 without replacement',
      'Alternative 2: treating waiver grants as sufficient competition assurance',
    ],
    retainedConstraints: [
      'Under a waiver grant, s 50 still applies: the waiver removes only the need to notify',
      'Oversight of acquisitions does not create zoned sites or shorten planning clocks (M1a/M1b)',
    ],
    sources: [
      sec('Case4', 2),
      sec('Case4', 3),
      sec('Case4', 4),
      claim('ATLAS-LEG-007'),
      claim('ATLAS-LEG-008'),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Pathways (published §6)                                                    */
/* -------------------------------------------------------------------------- */

const pathways: ComparisonPathway[] = [
  /* Case 1 — R column */
  {
    id: 'C1-PATH-R-FAV-1',
    caseId: 'Case1',
    variantIds: ['C1-VAR-R'],
    polarity: 'favourable',
    summary:
      'Forces productive use or frees control where M1c strategic holding was the binding block; rivals obtain released sites and open (O1→O2).',
    sources: [sec('Case1', 6), claim('ATLAS-HYP-001')],
  },
  {
    id: 'C1-PATH-R-UNFAV-1',
    caseId: 'Case1',
    variantIds: ['C1-VAR-R'],
    polarity: 'unfavourable',
    summary:
      'Destroys efficient option value: vacant control can be efficient waiting under uncertainty (M5a).',
    sources: [sec('Case1', 4), sec('Case1', 6), sec('Case1', 10)],
  },
  {
    id: 'C1-PATH-R-UNFAV-2',
    caseId: 'Case1',
    variantIds: ['C1-VAR-R'],
    polarity: 'unfavourable',
    summary: 'Premature or low-productivity development.',
    sources: [sec('Case1', 6), sec('Case1', 10)],
  },
  {
    id: 'C1-PATH-R-UNFAV-3',
    caseId: 'Case1',
    variantIds: ['C1-VAR-R'],
    polarity: 'unfavourable',
    summary:
      'Incumbent self-develops after release and still excludes rivals (re-acquisition or re-bidding after release).',
    sources: [sec('Case1', 5), sec('Case1', 6), sec('Case1', 10), claim('ATLAS-HYP-002')],
  },
  {
    id: 'C1-PATH-R-UNFAV-4',
    caseId: 'Case1',
    variantIds: ['C1-VAR-R'],
    polarity: 'unfavourable',
    summary: 'Planning (M1b) remains binding, so release changes little.',
    sources: [sec('Case1', 6), claim('ATLAS-EMP-003')],
  },
  {
    id: 'C1-PATH-R-NULL-1',
    caseId: 'Case1',
    variantIds: ['C1-VAR-R'],
    polarity: 'null_path',
    summary:
      'Sites were never commercially viable for rivals (scarcity or planning).',
    sources: [sec('Case1', 6), claim('ATLAS-EMP-001'), claim('ATLAS-EMP-003')],
  },
  {
    id: 'C1-PATH-R-NULL-2',
    caseId: 'Case1',
    variantIds: ['C1-VAR-R'],
    polarity: 'null_path',
    summary: 'Release auctions are won by incumbents.',
    sources: [sec('Case1', 6), claim('ATLAS-HYP-002')],
  },
  {
    id: 'C1-PATH-R-NULL-3',
    caseId: 'Case1',
    variantIds: ['C1-VAR-R'],
    polarity: 'null_path',
    summary: 'No change in fascia counts or prices.',
    sources: [sec('Case1', 6), sec('Case1', 7)],
  },

  /* Case 1 — E column */
  {
    id: 'C1-PATH-E-FAV-1',
    caseId: 'Case1',
    variantIds: ['C1-VAR-E'],
    polarity: 'favourable',
    summary:
      'Removes contractual blocks while the landlord still develops; rivals enter centres previously locked (O1).',
    sources: [sec('Case1', 6), claim('ATLAS-POL-002')],
  },
  {
    id: 'C1-PATH-E-UNFAV-1',
    caseId: 'Case1',
    variantIds: ['C1-VAR-E'],
    polarity: 'unfavourable',
    summary:
      'Landlord willingness to support development falls where exclusivity was an inducement; idle capacity results. The inducement channel is a qualitative hypothesis anchored to Schneier’s exclusive-dealing research, not equilibrium proof.',
    sources: [sec('Case1', 5), sec('Case1', 6), claim('ATLAS-HYP-002')],
  },
  {
    id: 'C1-PATH-E-UNFAV-2',
    caseId: 'Case1',
    variantIds: ['C1-VAR-E'],
    polarity: 'unfavourable',
    summary:
      'Substitution into ownership/option holding if E bans contracts but not fee-simple vacant control.',
    sources: [sec('Case1', 5), sec('Case1', 6), claim('ATLAS-HYP-002')],
  },
  {
    id: 'C1-PATH-E-NULL-1',
    caseId: 'Case1',
    variantIds: ['C1-VAR-E'],
    polarity: 'null_path',
    summary: 'Exclusivity was not the binding constraint.',
    sources: [sec('Case1', 6)],
  },
  {
    id: 'C1-PATH-E-NULL-2',
    caseId: 'Case1',
    variantIds: ['C1-VAR-E'],
    polarity: 'null_path',
    summary: 'The CCA already constrained the worst clauses.',
    sources: [sec('Case1', 6), claim('ATLAS-POL-002')],
  },
  {
    id: 'C1-PATH-E-NULL-3',
    caseId: 'Case1',
    variantIds: ['C1-VAR-E'],
    polarity: 'null_path',
    summary: 'Centres redesign around other barriers.',
    sources: [sec('Case1', 6)],
  },

  /* Case 2 — clauses the published text assigns to a named counterfactual */
  {
    id: 'C2-PATH-CFA-FAV-1',
    caseId: 'Case2',
    variantIds: ['C2-VAR-CF-A'],
    polarity: 'favourable',
    summary:
      'Speeds vacant-land approvals where FIRB notification or conditions were on the critical path.',
    sources: [sec('Case2', 6), claim('ATLAS-LEG-003')],
  },
  {
    id: 'C2-PATH-CFC-FAV-1',
    caseId: 'Case2',
    variantIds: ['C2-VAR-CF-C'],
    polarity: 'favourable',
    summary:
      'Shifts marginal foreign capital from acquiring incumbents to building stores/DCs (O2).',
    sources: [sec('Case2', 6), claim('ATLAS-LIT-005')],
  },
  {
    id: 'C2-PATH-CFD-FAV-1',
    caseId: 'Case2',
    variantIds: ['C2-VAR-CF-D'],
    polarity: 'favourable',
    summary:
      'FGI-specific relaxation unlocks state-linked capital that was notification-blocked.',
    sources: [sec('Case2', 6), claim('ATLAS-LEG-002')],
  },
  /* Case 2 — shared (not assigned to a single counterfactual in published §6) */
  {
    id: 'C2-PATH-UNFAV-1',
    caseId: 'Case2',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary:
      'Faster vacant-land approval without planning reform produces land banking under weak conditions.',
    sources: [sec('Case2', 6), claim('ATLAS-POL-003')],
  },
  {
    id: 'C2-PATH-UNFAV-2',
    caseId: 'Case2',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary: 'Greenfield preference is gamed via nominal restructuring.',
    sources: [sec('Case2', 6)],
  },
  {
    id: 'C2-PATH-UNFAV-3',
    caseId: 'Case2',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary:
      'Acquisition of a failing independent is blocked while the independent exits anyway.',
    sources: [sec('Case2', 6)],
  },
  {
    id: 'C2-PATH-NULL-1',
    caseId: 'Case2',
    variantIds: SHARED,
    polarity: 'null_path',
    summary:
      'Binding constraints were sites, planning, or DC minimum efficient scale rather than FIRB.',
    sources: [sec('Case2', 6), claim('ATLAS-EMP-003')],
  },
  {
    id: 'C2-PATH-NULL-2',
    caseId: 'Case2',
    variantIds: SHARED,
    polarity: 'null_path',
    summary:
      'FIRB was not on the critical path for the private entrant’s actual deal structure.',
    sources: [sec('Case2', 6), claim('ATLAS-POL-003')],
  },
  {
    id: 'C2-PATH-NULL-3',
    caseId: 'Case2',
    variantIds: SHARED,
    polarity: 'null_path',
    summary: 'Call-in was never used for ordinary grocery starts.',
    sources: [sec('Case2', 6), claim('ATLAS-LEG-001')],
  },

  /* Case 3 — all hypothetical, shared; distinct from the observed chronology */
  {
    id: 'C3-PATH-FAV-1',
    caseId: 'Case3',
    variantIds: SHARED,
    polarity: 'favourable',
    summary:
      'Hypothetical (§6), not chronology: a differentiated entrant obtains sites, builds a DC, and opens stores.',
    sources: [sec('Case3', 6), claim('ATLAS-HYP-004')],
  },
  {
    id: 'C3-PATH-FAV-2',
    caseId: 'Case3',
    variantIds: SHARED,
    polarity: 'favourable',
    summary:
      'Hypothetical O6 pathway (§6), not observed: direct consumer benefit via the entrant’s own prices/variety even if majors’ basket prices barely move.',
    sources: [sec('Case3', 4), sec('Case3', 6), claim('ATLAS-CON-003')],
  },
  {
    id: 'C3-PATH-FAV-3',
    caseId: 'Case3',
    variantIds: SHARED,
    polarity: 'favourable',
    summary:
      'Hypothetical partial O5 pathway (§6), not observed: the entrant eventually constrains overlapping SKUs.',
    sources: [sec('Case3', 6), claim('ATLAS-EMP-004'), claim('ATLAS-GAP-002')],
  },
  {
    id: 'C3-PATH-UNFAV-1',
    caseId: 'Case3',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary:
      'Site rules intended to help entrants trigger Sadun-style incumbent format shifts.',
    sources: [sec('Case3', 6), sec('Case3', 10), claim('ATLAS-LIT-002')],
  },
  {
    id: 'C3-PATH-UNFAV-2',
    caseId: 'Case3',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary: 'Entrant scale-up stalls without DC minimum efficient scale.',
    sources: [sec('Case3', 6), claim('ATLAS-EMP-005')],
  },
  {
    id: 'C3-PATH-UNFAV-3',
    caseId: 'Case3',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary:
      'Majors’ local price response is null while revenue diversion weakens independents.',
    sources: [sec('Case3', 6), claim('ATLAS-LIT-001')],
  },
  {
    id: 'C3-PATH-NULL-1',
    caseId: 'Case3',
    variantIds: SHARED,
    polarity: 'null_path',
    summary:
      'FDI/site liberalisation does not change DC economics; announce-to-open still takes years.',
    sources: [sec('Case3', 6), claim('ATLAS-EMP-003')],
  },
  {
    id: 'C3-PATH-NULL-2',
    caseId: 'Case3',
    variantIds: SHARED,
    polarity: 'null_path',
    summary:
      'Store growth occurs without detectable incumbent price or welfare metrics.',
    sources: [sec('Case3', 6), claim('ATLAS-CON-003')],
  },

  /* Case 4 — shared */
  {
    id: 'C4-PATH-FAV-1',
    caseId: 'Case4',
    variantIds: SHARED,
    polarity: 'favourable',
    summary: 'Notification catches anticompetitive site/lease grabs.',
    sources: [sec('Case4', 6), claim('ATLAS-GAP-003')],
  },
  {
    id: 'C4-PATH-FAV-2',
    caseId: 'Case4',
    variantIds: SHARED,
    polarity: 'favourable',
    summary:
      'Kalgoorlie-type refusals preserve differentiated local constraints (O5 locally).',
    sources: [sec('Case4', 5), sec('Case4', 6), claim('ATLAS-ADM-002')],
  },
  {
    id: 'C4-PATH-FAV-3',
    caseId: 'Case4',
    variantIds: SHARED,
    polarity: 'favourable',
    summary: 'Transparency enables scrutiny.',
    sources: [sec('Case4', 6), claim('ATLAS-EMP-007')],
  },
  {
    id: 'C4-PATH-UNFAV-1',
    caseId: 'Case4',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary: 'Parties shift earlier to non-notifiable structures.',
    sources: [sec('Case4', 6), claim('ATLAS-GAP-003')],
  },
  {
    id: 'C4-PATH-UNFAV-2',
    caseId: 'Case4',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary:
      'The waiver pathway is used for deals that still raise concerns (the s 50 residual is costly to enforce).',
    sources: [sec('Case4', 6), claim('ATLAS-LEG-008')],
  },
  {
    id: 'C4-PATH-UNFAV-3',
    caseId: 'Case4',
    variantIds: SHARED,
    polarity: 'unfavourable',
    summary:
      'Refusal preserves a local independent but forgoes short-run capacity/consumer gains the ACCC itself acknowledged.',
    sources: [sec('Case4', 6), claim('ATLAS-ADM-002')],
  },
  {
    id: 'C4-PATH-NULL-1',
    caseId: 'Case4',
    variantIds: SHARED,
    polarity: 'null_path',
    summary:
      'Most notified deals would have been cleared anyway; pipelines and openings are unchanged.',
    sources: [sec('Case4', 6), claim('ATLAS-GAP-003')],
  },
  {
    id: 'C4-PATH-NULL-2',
    caseId: 'Case4',
    variantIds: SHARED,
    polarity: 'null_path',
    summary:
      'Market-wide concentration is driven by M2a sunk costs / M1b planning rather than acquirable sites.',
    sources: [sec('Case4', 6), sec('Case4', 4)],
  },
];

/* -------------------------------------------------------------------------- */
/* Outcome assessments (published §7, with §8–§9 limits)                      */
/* -------------------------------------------------------------------------- */

const outcomeAssessments: OutcomeAssessment[] = [
  /* Case 1 */
  {
    id: 'C1-OUT-O1',
    caseId: 'Case1',
    variantId: null,
    outcomeId: 'O1',
    assessability: 'partial',
    scope: 'case_wide',
    judgment:
      'Partially assessable, qualitatively: pipeline facts and notification coverage of new major acquisitions bear on rival market access; covenant text is largely non-public.',
    limitations:
      'Pipeline counts are compatible with scarcity, planning, and foreclosure; no Australian decomposition exists. Release or exclusivity bans do not show who obtains the site. Release ≠ rival access.',
    changeEvidenceRefs: [sec('Case1', 9), claim('ATLAS-GAP-001')],
    sources: [
      sec('Case1', 7),
      sec('Case1', 8),
      claim('ATLAS-EMP-001'),
      claim('ATLAS-GAP-001'),
    ],
  },
  {
    id: 'C1-OUT-R-O2',
    caseId: 'Case1',
    variantId: 'C1-VAR-R',
    outcomeId: 'O2',
    assessability: 'partial',
    scope: 'variant',
    judgment:
      'Weakly assessable: release/develop rules speak to whether capacity appears, but who operates it is unidentified.',
    limitations:
      'Capacity is not viability, survival, or welfare. The published §7 row addresses release/develop rules; no parallel E-specific O2 statement is published.',
    changeEvidenceRefs: [sec('Case1', 9)],
    sources: [sec('Case1', 7), claim('ATLAS-ASM-002')],
  },
  {
    id: 'C1-OUT-O3',
    caseId: 'Case1',
    variantId: null,
    outcomeId: 'O3',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment: 'Not assessable from instrument text alone; demand evidence is needed.',
    limitations: 'No Australian demand or rivalry evidence is registered for these instruments.',
    changeEvidenceRefs: [],
    sources: [sec('Case1', 7), claim('ATLAS-ASM-002')],
  },
  {
    id: 'C1-OUT-O4',
    caseId: 'Case1',
    variantId: null,
    outcomeId: 'O4',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment: 'Not assessable from instrument text alone; rivalry evidence is needed.',
    limitations: 'No Australian demand or rivalry evidence is registered for these instruments.',
    changeEvidenceRefs: [],
    sources: [sec('Case1', 7), claim('ATLAS-ASM-002')],
  },
  {
    id: 'C1-OUT-O5',
    caseId: 'Case1',
    variantId: null,
    outcomeId: 'O5',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment:
      'Not assessable: there are no Australian diversion or welfare estimates, and inference from site counts is forbidden.',
    limitations:
      'US/UK magnitudes are not Australian parameters. R cannot be ranked against E.',
    changeEvidenceRefs: [],
    sources: [sec('Case1', 7), sec('Case1', 8), claim('ATLAS-CON-003')],
  },
  {
    id: 'C1-OUT-O6',
    caseId: 'Case1',
    variantId: null,
    outcomeId: 'O6',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment:
      'Not assessable: it cannot be concluded that R or E would raise consumer welfare.',
    limitations:
      'There are no Australian welfare estimates, and inference from site counts is forbidden.',
    changeEvidenceRefs: [],
    sources: [sec('Case1', 7), sec('Case1', 8), claim('ATLAS-CON-003')],
  },

  /* Case 2 */
  {
    id: 'C2-OUT-O1',
    caseId: 'Case2',
    variantId: null,
    outcomeId: 'O1',
    assessability: 'partial',
    scope: 'case_wide',
    judgment:
      'Assessable qualitatively for notification incidence by transaction pathway; the result depends on deal structure.',
    limitations:
      'No approval probabilities by pathway; no deal-specific critical-path effects; no grocery-specific FIRB processing distributions.',
    changeEvidenceRefs: [sec('Case2', 9)],
    sources: [sec('Case2', 7), sec('Case2', 5), claim('ATLAS-ADM-001')],
  },
  {
    id: 'C2-OUT-O2',
    caseId: 'Case2',
    variantId: null,
    outcomeId: 'O2',
    assessability: 'partial',
    scope: 'case_wide',
    judgment:
      'Assessable only if greenfield capacity is the mode; acquisition pathways may leave fascia counts unchanged.',
    limitations:
      'Acquisition is not capacity addition. Sites, planning, and distribution scale may still bind after FDI clearance.',
    changeEvidenceRefs: [sec('Case2', 9)],
    sources: [sec('Case2', 7), claim('ATLAS-LIT-005'), claim('ATLAS-EMP-003')],
  },
  ...(['O3', 'O4', 'O5', 'O6'] as const).map(
    (o): OutcomeAssessment => ({
      id: `C2-OUT-${o}`,
      caseId: 'Case2',
      variantId: null,
      outcomeId: o,
      assessability: 'not_assessable',
      scope: 'case_wide',
      judgment:
        o === 'O5' || o === 'O6'
          ? 'Not assessable from FIRB relaxation alone; O5/O6 remain unidentified and welfare gains from any of CF-A to CF-D cannot be inferred.'
          : 'Not assessable from FIRB relaxation alone.',
      limitations:
        'Format substitution and local rivalry are unidentified in Australia; there are no Australian diversion ratios.',
      changeEvidenceRefs: [],
      sources: [
        sec('Case2', 7),
        sec('Case2', 8),
        claim('ATLAS-GAP-002'),
        claim('ATLAS-CON-003'),
      ],
    }),
  ),

  /* Case 3 */
  {
    id: 'C3-OUT-O1',
    caseId: 'Case3',
    variantId: null,
    outcomeId: 'O1',
    assessability: 'partial',
    scope: 'case_wide',
    judgment:
      'Assessable only narratively at national level; not identified for SA/WA timing.',
    limitations:
      'Sites, planning, and exclusivity appear in ALDI submissions nationally but are not identified as the binding SA/WA timing cause.',
    changeEvidenceRefs: [sec('Case3', 9)],
    sources: [sec('Case3', 7), sec('Case3', 4), claim('ATLAS-HYP-004')],
  },
  {
    id: 'C3-OUT-O2',
    caseId: 'Case3',
    variantId: null,
    outcomeId: 'O2',
    assessability: 'assessable',
    scope: 'case_wide',
    judgment:
      'Best-supported outcome: the observed order of DC-project completion and first openings, followed by densification to the end-2018 aggregates (29 SA, 41 WA, 526 nationally).',
    limitations:
      'An observed benchmark, not a causal estimate. It does not identify whether logistics, site assembly, or ordinary sequencing was the binding constraint, and it is pre-2026 history.',
    changeEvidenceRefs: [sec('Case3', 9), claim('ATLAS-HYP-004')],
    sources: [
      sec('Case3', 7),
      sec('Case3', 8),
      claim('ATLAS-EMP-005'),
      claim('ATLAS-EMP-006'),
      claim('ATLAS-HYP-004'),
    ],
  },
  {
    id: 'C3-OUT-O3',
    caseId: 'Case3',
    variantId: null,
    outcomeId: 'O3',
    assessability: 'partial',
    scope: 'case_wide',
    judgment: 'Weakly assessable (queues; survival of format).',
    limitations: 'Not structural demand.',
    changeEvidenceRefs: [],
    sources: [sec('Case3', 7)],
  },
  {
    id: 'C3-OUT-O4',
    caseId: 'Case3',
    variantId: null,
    outcomeId: 'O4',
    assessability: 'partial',
    scope: 'case_wide',
    judgment: 'Observed persistence through the end-2018 aggregates.',
    limitations: 'Not a causal survival model.',
    changeEvidenceRefs: [],
    sources: [sec('Case3', 7), claim('ATLAS-EMP-006')],
  },
  {
    id: 'C3-OUT-O5',
    caseId: 'Case3',
    variantId: null,
    outcomeId: 'O5',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment:
      'No causal Australian price-constraint estimate; only the ACCC’s limited-range characterisation exists. The hypothetical O5 pathway in §6 is not part of the observed chronology.',
    limitations:
      'No Australian diversion ratios between majors and hard-discount or specialty formats; incumbent price response was not measured for SA/WA 2016–18 in PolisLab evidence.',
    changeEvidenceRefs: [sec('Case3', 9), claim('ATLAS-GAP-002')],
    sources: [
      sec('Case3', 7),
      sec('Case3', 4),
      claim('ATLAS-EMP-004'),
      claim('ATLAS-GAP-002'),
    ],
  },
  {
    id: 'C3-OUT-O6',
    caseId: 'Case3',
    variantId: null,
    outcomeId: 'O6',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment:
      'Not assessable: inference from store counts is forbidden. The hypothetical O6 pathway in §6 is not part of the observed chronology.',
    limitations:
      'No O5/O6 number can be derived from the 29/41 store counts; US mile radii or Costco price elasticities are not Australian forecasts.',
    changeEvidenceRefs: [sec('Case3', 9)],
    sources: [sec('Case3', 7), sec('Case3', 8), claim('ATLAS-CON-003')],
  },

  /* Case 4 */
  {
    id: 'C4-OUT-O1',
    caseId: 'Case4',
    variantId: null,
    outcomeId: 'O1',
    assessability: 'partial',
    scope: 'case_wide',
    judgment:
      'Process O1 only: attempts to acquire control that enter the ACCC register.',
    limitations:
      'The register sample is an identified nine-event sample under stated filters, not a census; MN and WA must never be pooled; anticipated openings are mostly 2027–2033 and completion/opening is not independently established.',
    changeEvidenceRefs: [sec('Case4', 9)],
    sources: [
      sec('Case4', 7),
      sec('Case4', 5),
      claim('ATLAS-EMP-007'),
    ],
  },
  {
    id: 'C4-OUT-O2',
    caseId: 'Case4',
    variantId: null,
    outcomeId: 'O2',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment:
      'Not yet assessable for the 2026 land/lease cohort: openings are largely future-dated.',
    limitations:
      'Notification approvals do not mean stores will open; notification concerns control transactions while productive capacity requires later development.',
    changeEvidenceRefs: [sec('Case4', 9)],
    sources: [sec('Case4', 7), sec('Case4', 4), claim('ATLAS-EMP-007')],
  },
  {
    id: 'C4-OUT-B0-O3',
    caseId: 'Case4',
    variantId: 'C4-VAR-B0',
    outcomeId: 'O3',
    assessability: 'partial',
    scope: 'variant',
    judgment:
      'Case-specific only: the Kalgoorlie prospective ACCC reasoning, local in scope.',
    limitations:
      'ACCC prospective theory, not final Tribunal law; final merits reasons for ACT 1 of 2026 were not located. Not a market-wide finding.',
    changeEvidenceRefs: [sec('Case4', 9), claim('ATLAS-ADM-003')],
    sources: [
      sec('Case4', 7),
      sec('Case4', 5),
      claim('ATLAS-ADM-002'),
      claim('ATLAS-ADM-003'),
    ],
  },
  {
    id: 'C4-OUT-B0-O4',
    caseId: 'Case4',
    variantId: 'C4-VAR-B0',
    outcomeId: 'O4',
    assessability: 'partial',
    scope: 'variant',
    judgment:
      'Case-specific only: the Kalgoorlie prospective ACCC reasoning on independent asset-exit risk, local in scope.',
    limitations:
      'ACCC prospective theory, not final Tribunal law; Kalgoorlie was a voluntary notification and is not an example of compulsory Part 3 filing.',
    changeEvidenceRefs: [sec('Case4', 9), claim('ATLAS-ADM-003')],
    sources: [
      sec('Case4', 7),
      sec('Case4', 5),
      claim('ATLAS-ADM-002'),
      claim('ATLAS-ADM-003'),
    ],
  },
  {
    id: 'C4-OUT-B0-O5',
    caseId: 'Case4',
    variantId: 'C4-VAR-B0',
    outcomeId: 'O5',
    assessability: 'partial',
    scope: 'variant',
    judgment:
      'Local prospective SLC assessments are possible, as in Kalgoorlie; this is a local, ACCC-reasoned scope only.',
    limitations:
      'Short-run capacity/consumer gains forgone by refusal were acknowledged by the ACCC itself; Tribunal merits are unresolved in the release.',
    changeEvidenceRefs: [sec('Case4', 9), claim('ATLAS-ADM-003')],
    sources: [
      sec('Case4', 7),
      sec('Case4', 6),
      claim('ATLAS-ADM-002'),
      claim('ATLAS-ADM-003'),
    ],
  },
  {
    id: 'C4-OUT-O5',
    caseId: 'Case4',
    variantId: null,
    outcomeId: 'O5',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment: 'Market-wide O5 is not identified.',
    limitations:
      'No causal evaluation of Part 3 on foreclosure or prices exists; diversion and welfare magnitudes remain unidentified. Market-wide improvement from Part 3’s existence cannot be inferred.',
    changeEvidenceRefs: [sec('Case4', 9), claim('ATLAS-GAP-003')],
    sources: [
      sec('Case4', 7),
      sec('Case4', 8),
      claim('ATLAS-GAP-002'),
      claim('ATLAS-GAP-003'),
    ],
  },
  {
    id: 'C4-OUT-O6',
    caseId: 'Case4',
    variantId: null,
    outcomeId: 'O6',
    assessability: 'not_assessable',
    scope: 'case_wide',
    judgment: 'Not assessable from notification counts.',
    limitations: 'The public register is not a competition scoreboard.',
    changeEvidenceRefs: [],
    sources: [sec('Case4', 7), sec('Case4', 10), claim('ATLAS-CON-003')],
  },
];

/* -------------------------------------------------------------------------- */
/* Evidence uses                                                              */
/* -------------------------------------------------------------------------- */

const evidenceUses: EvidenceUse[] = [
  /* Case 1 */
  {
    id: 'C1-EVID-EMP-001',
    claimId: 'ATLAS-EMP-001',
    supportsProposition:
      'Large unused incumbent pipelines are documented descriptively; the counts are compatible with scarcity, planning, and foreclosure explanations.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-EMP-001'), sec('Case1', 2), sec('Case1', 4)],
  },
  {
    id: 'C1-EVID-EMP-002',
    claimId: 'ATLAS-EMP-002',
    supportsProposition:
      'The ACCC made no land-banking determination: an absence of finding, which is not proof that foreclosure is absent.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-EMP-002'), sec('Case1', 2), sec('Case1', 5)],
  },
  {
    id: 'C1-EVID-EMP-003',
    claimId: 'ATLAS-EMP-003',
    supportsProposition:
      'Sites are a material candidate constraint: suitable sites are limited, majors are advantaged, and planning/zoning can deter entry.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-EMP-003'), sec('Case1', 5)],
  },
  {
    id: 'C1-EVID-LIT-006',
    claimId: 'ATLAS-LIT-006',
    supportsProposition:
      'UK evidence associates more restrictive planning with fewer large-format stores and Town Centre First with less productive store locations (transfer mechanism, not Australian magnitudes).',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-LIT-006'), sec('Case1', 5)],
  },
  {
    id: 'C1-EVID-LIT-004',
    claimId: 'ATLAS-LIT-004',
    supportsProposition:
      'UK CC: controlled land can be a barrier to entry in highly concentrated local markets; the absence of systematic sole-purpose holding is an absence of finding, not contrary proof.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-LIT-004'), sec('Case1', 5)],
  },
  {
    id: 'C1-EVID-LIT-003',
    claimId: 'ATLAS-LIT-003',
    supportsProposition:
      'Sign-reversal caution: restricting large formats can induce chain format shifts that harm independents (qualitative caution, not an Australian estimate).',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-LIT-003'), sec('Case1', 5)],
  },
  {
    id: 'C1-EVID-HYP-001',
    claimId: 'ATLAS-HYP-001',
    supportsProposition:
      'Strategic foreclosure (M1c) is a live hypothesis, not a proven general pattern.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-HYP-001'), sec('Case1', 4)],
  },
  {
    id: 'C1-EVID-HYP-002-R',
    claimId: 'ATLAS-HYP-002',
    supportsProposition:
      'Incumbent re-bidding after release is a qualitative hypothesis, not Phase 0D.2 equilibrium proof.',
    caseId: 'Case1',
    variantId: 'C1-VAR-R',
    sources: [claim('ATLAS-HYP-002'), sec('Case1', 5)],
  },
  {
    id: 'C1-EVID-HYP-002-E',
    claimId: 'ATLAS-HYP-002',
    supportsProposition:
      'Reduced development incentives if exclusivity is banned in sparse markets, and substitution between holding and exclusivity, are qualitative hypotheses anchored to Schneier’s exclusive-dealing research, not equilibrium proof.',
    caseId: 'Case1',
    variantId: 'C1-VAR-E',
    sources: [claim('ATLAS-HYP-002'), sec('Case1', 5)],
  },
  {
    id: 'C1-EVID-LEG-003-R',
    claimId: 'ATLAS-LEG-003',
    supportsProposition:
      'Foreign vacant-land conditions apply to foreign acquirers where FIRB is triggered; they are not a domestic incumbent release statute, so R does not restate them.',
    caseId: 'Case1',
    variantId: 'C1-VAR-R',
    sources: [claim('ATLAS-LEG-003'), sec('Case1', 2), sec('Case1', 3)],
  },
  {
    id: 'C1-EVID-POL-002-E',
    claimId: 'ATLAS-POL-002',
    supportsProposition:
      'The CCA can reach anti-competitive provisions and historical undertakings exist, but there is no verified comprehensive statutory grocery-exclusion ban matching a blanket rule.',
    caseId: 'Case1',
    variantId: 'C1-VAR-E',
    sources: [claim('ATLAS-POL-002'), sec('Case1', 2)],
  },
  {
    id: 'C1-EVID-POL-001',
    claimId: 'ATLAS-POL-001',
    supportsProposition:
      'What remains additional to current law is automatic release, numeric caps, and a blanket exclusivity ban beyond case-by-case CCA and merger tools.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-POL-001'), sec('Case1', 2)],
  },
  {
    id: 'C1-EVID-POL-004',
    claimId: 'ATLAS-POL-004',
    supportsProposition:
      'No numeric local site-share cap is verified in statute; a 40% cap is Layer D only and is not one of the R or E instruments.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-POL-004'), sec('Case1', 2)],
  },
  {
    id: 'C1-EVID-ADM-002',
    claimId: 'ATLAS-ADM-002',
    supportsProposition:
      'Leasehold expansion can be ordinary rivalry with exit-risk side effects (Kalgoorlie, M4a); this is distinct from strategic foreclosure (M1c).',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-ADM-002'), sec('Case1', 4)],
  },
  {
    id: 'C1-EVID-GAP-001',
    claimId: 'ATLAS-GAP-001',
    supportsProposition:
      'No Australian public causal decomposition of scarcity, planning, and foreclosure is registered.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-GAP-001'), sec('Case1', 5)],
  },
  {
    id: 'C1-EVID-GAP-004',
    claimId: 'ATLAS-GAP-004',
    supportsProposition:
      'UK CLO effectiveness for consumer outcomes is not verified; the 2026 Aldi/Lidl designation is institutional only.',
    caseId: 'Case1',
    variantId: null,
    sources: [claim('ATLAS-GAP-004'), sec('Case1', 5)],
  },

  /* Case 2 */
  {
    id: 'C2-EVID-LEG-001-CFB',
    claimId: 'ATLAS-LEG-001',
    supportsProposition:
      'Starting an Australian grocery business without land/business acquisition is not generally notifiable under s 47 but is reviewable NS action under s 55E(2).',
    caseId: 'Case2',
    variantId: 'C2-VAR-CF-B',
    sources: [claim('ATLAS-LEG-001'), sec('Case2', 2), sec('Case2', 5)],
  },
  {
    id: 'C2-EVID-LEG-002-CFD',
    claimId: 'ATLAS-LEG-002',
    supportsProposition:
      'An FGI start-business must notify (FATR s 56(1)(b)) while land is generally $0; private and FGI entrants do not face the same screen.',
    caseId: 'Case2',
    variantId: 'C2-VAR-CF-D',
    sources: [claim('ATLAS-LEG-002'), sec('Case2', 2), sec('Case2', 8)],
  },
  {
    id: 'C2-EVID-LEG-003-CFA',
    claimId: 'ATLAS-LEG-003',
    supportsProposition:
      'Freehold vacant commercial land is generally $0 notifiable; typical productive-use / ~5-year construction conditions are a separate Guidance Note 4 practice point (trigger is not conditions).',
    caseId: 'Case2',
    variantId: 'C2-VAR-CF-A',
    sources: [claim('ATLAS-LEG-003'), sec('Case2', 2)],
  },
  {
    id: 'C2-EVID-LEG-004',
    claimId: 'ATLAS-LEG-004',
    supportsProposition:
      'Developed non-sensitive commercial land has a certain-FTA private threshold above $1,498m; many store-level sites may fall below it.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-LEG-004'), sec('Case2', 2), sec('Case2', 8)],
  },
  {
    id: 'C2-EVID-LEG-005',
    claimId: 'ATLAS-LEG-005',
    supportsProposition:
      'A long lease, AFL, or option may be a land interest (s 12 >5-year limb; s 15), after which vacant vs developed thresholds apply.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-LEG-005'), sec('Case2', 2)],
  },
  {
    id: 'C2-EVID-LEG-006',
    claimId: 'ATLAS-LEG-006',
    supportsProposition:
      'Part 3 supermarket rules apply to Coles/Woolworths connected entities, not automatically to a foreign entrant.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-LEG-006'), sec('Case2', 2)],
  },
  {
    id: 'C2-EVID-ADM-001',
    claimId: 'ATLAS-ADM-001',
    supportsProposition:
      'Approved commercial proposals in Apr–Jun 2026 had a 31-day median and 50% were decided in 30 days or less: approval-cohort statistics, not guarantees.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-ADM-001'), sec('Case2', 2), sec('Case2', 5)],
  },
  {
    id: 'C2-EVID-CON-001',
    claimId: 'ATLAS-CON-001',
    supportsProposition:
      'The MVP 60–240 month FIRB delay baseline is unusable, and “turn off FIRB for 5–20 years” is a rejected counterfactual.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-CON-001'), sec('Case2', 3), sec('Case2', 5)],
  },
  {
    id: 'C2-EVID-CON-002',
    claimId: 'ATLAS-CON-002',
    supportsProposition:
      'Transaction pathways must be branched; a single uniform FIRB parameter is not available.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-CON-002'), sec('Case2', 2), sec('Case2', 8)],
  },
  {
    id: 'C2-EVID-EMP-003',
    claimId: 'ATLAS-EMP-003',
    supportsProposition:
      'ACCC: sites and time-to-scale are material while capital is unlikely to be binding for large internationals; large-scale new chain entry is unlikely in the short/medium term.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-EMP-003'), sec('Case2', 4), sec('Case2', 5)],
  },
  {
    id: 'C2-EVID-LIT-005-CFC',
    claimId: 'ATLAS-LIT-005',
    supportsProposition:
      'Greenfield and M&A FDI are not interchangeable: ownership transfer is not new capacity.',
    caseId: 'Case2',
    variantId: 'C2-VAR-CF-C',
    sources: [claim('ATLAS-LIT-005'), sec('Case2', 4), sec('Case2', 5)],
  },
  {
    id: 'C2-EVID-HYP-003',
    claimId: 'ATLAS-HYP-003',
    supportsProposition:
      'Whether FDI liberalisation alone produces durable competition is an open thesis question, not established.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-HYP-003'), sec('Case2', 5)],
  },
  {
    id: 'C2-EVID-POL-003',
    claimId: 'ATLAS-POL-003',
    supportsProposition:
      'Relaxation helps only where a binding, correctly identified requirement is removed, and the counterfactual must be chosen explicitly (not blended).',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-POL-003'), sec('Case2', 3), sec('Case2', 10)],
  },
  {
    id: 'C2-EVID-GAP-002',
    claimId: 'ATLAS-GAP-002',
    supportsProposition:
      'Format substitution and local rivalry are unidentified in Australia; O3–O6 cannot be assessed from FIRB relaxation alone.',
    caseId: 'Case2',
    variantId: null,
    sources: [claim('ATLAS-GAP-002'), sec('Case2', 7)],
  },

  /* Case 3 */
  {
    id: 'C3-EVID-EMP-005',
    claimId: 'ATLAS-EMP-005',
    supportsProposition:
      'Contributes to the published ALDI SA/WA chronology: state DC projects completed/delivered in sequence with first openings (an observed O2 order, not a causal estimate).',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-EMP-005'), sec('Case3', 5), sec('Case3', 10)],
  },
  {
    id: 'C3-EVID-EMP-006',
    claimId: 'ATLAS-EMP-006',
    supportsProposition:
      'Contributes to the published ALDI chronology and end-2018 aggregates (29 SA, 41 WA, 526 nationally); store counts do not license O5/O6 inference.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-EMP-006'), sec('Case3', 5), sec('Case3', 7)],
  },
  {
    id: 'C3-EVID-EMP-003',
    claimId: 'ATLAS-EMP-003',
    supportsProposition:
      'ACCC descriptive anchors: sites/planning material; capital unlikely binding for large internationals; ALDI took over 20 years nationally.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-EMP-003'), sec('Case3', 5)],
  },
  {
    id: 'C3-EVID-EMP-004',
    claimId: 'ATLAS-EMP-004',
    supportsProposition:
      'The ACCC characterises ALDI as an important but limited-range (limited-dimensional) constraint.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-EMP-004'), sec('Case3', 2), sec('Case3', 5)],
  },
  {
    id: 'C3-EVID-HYP-004',
    claimId: 'ATLAS-HYP-004',
    supportsProposition:
      'The SA/WA chronology could not discriminate distribution (H1) from ordinary sequencing (H4), and site access (H2) is not shown as the binding timing constraint.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-HYP-004'), sec('Case3', 5), sec('Case3', 8)],
  },
  {
    id: 'C3-EVID-LIT-001',
    claimId: 'ATLAS-LIT-001',
    supportsProposition:
      'International transfer mechanism only: revenue diversion is not incumbent price cuts.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-LIT-001'), sec('Case3', 5)],
  },
  {
    id: 'C3-EVID-LIT-002',
    claimId: 'ATLAS-LIT-002',
    supportsProposition:
      'International transfer mechanism only: format entry can raise, null, or lower incumbent prices depending on format.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-LIT-002'), sec('Case3', 5), sec('Case3', 10)],
  },
  {
    id: 'C3-EVID-LIT-005',
    claimId: 'ATLAS-LIT-005',
    supportsProposition:
      'Foreign greenfield network addition and acquisition of a major are different modes and are not interchangeable.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-LIT-005'), sec('Case3', 4)],
  },
  {
    id: 'C3-EVID-LEG-009',
    claimId: 'ATLAS-LEG-009',
    supportsProposition:
      'From 1 July 2026 the Code’s excessive-pricing prohibition applies to very large retailers: a conduct rule, not a measured price effect.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-LEG-009'), sec('Case3', 2)],
  },
  {
    id: 'C3-EVID-PILOT-001',
    claimId: 'ATLAS-PILOT-001',
    supportsProposition:
      'Planning-approval storytelling is cautioned: planning applications are not projects.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-PILOT-001'), sec('Case3', 5)],
  },
  {
    id: 'C3-EVID-GAP-002',
    claimId: 'ATLAS-GAP-002',
    supportsProposition:
      'No Australian diversion ratios between majors and hard-discount or specialty formats exist.',
    caseId: 'Case3',
    variantId: null,
    sources: [claim('ATLAS-GAP-002'), sec('Case3', 9)],
  },

  /* Case 4 */
  {
    id: 'C4-EVID-LEG-005',
    claimId: 'ATLAS-LEG-005',
    supportsProposition:
      'Cited in the §2 source list alongside the Part 3 rules; the atlas pin concerns FATA ss 12 and 15 (a long lease or option as a land interest), which is separate from the ACCC Determination.',
    caseId: 'Case4',
    variantId: null,
    sources: [claim('ATLAS-LEG-005'), sec('Case4', 2)],
  },
  {
    id: 'C4-EVID-LEG-006-B0',
    claimId: 'ATLAS-LEG-006',
    supportsProposition:
      'Part 3 adds notification duties for Coles/Woolworths connected entities; it does not establish that notified deals are blocked or that entrants face the same duties.',
    caseId: 'Case4',
    variantId: 'C4-VAR-B0',
    sources: [claim('ATLAS-LEG-006'), sec('Case4', 2)],
  },
  {
    id: 'C4-EVID-LEG-007-B0',
    claimId: 'ATLAS-LEG-007',
    supportsProposition:
      'The Determination’s notification rules (ss 3-1–3-3) for qualifying land/lease interests under the current regime.',
    caseId: 'Case4',
    variantId: 'C4-VAR-B0',
    sources: [claim('ATLAS-LEG-007'), sec('Case4', 2)],
  },
  {
    id: 'C4-EVID-LEG-007-WEAKER',
    claimId: 'ATLAS-LEG-007',
    supportsProposition:
      'Part 3 carries a 30 Jun 2030 sunset, which is the premise of the non-renewal alternative.',
    caseId: 'Case4',
    variantId: 'C4-VAR-CF-WEAKER',
    sources: [claim('ATLAS-LEG-007'), sec('Case4', 3), sec('Case4', 9)],
  },
  {
    id: 'C4-EVID-LEG-008-B0',
    claimId: 'ATLAS-LEG-008',
    supportsProposition:
      'A waiver decides whether notification is required; a grant removes the need to notify but s 50 still applies, and refusal leaves notification and standstill obligations in place.',
    caseId: 'Case4',
    variantId: 'C4-VAR-B0',
    sources: [claim('ATLAS-LEG-008'), sec('Case4', 2), sec('Case4', 5)],
  },
  {
    id: 'C4-EVID-LEG-008-WEAKER',
    claimId: 'ATLAS-LEG-008',
    supportsProposition:
      'Treating a waiver grant as competition assurance is qualified: a grant is not a substantive clearance and s 50 continues to apply.',
    caseId: 'Case4',
    variantId: 'C4-VAR-CF-WEAKER',
    sources: [claim('ATLAS-LEG-008'), sec('Case4', 2), sec('Case4', 8)],
  },
  {
    id: 'C4-EVID-ADM-002-B0',
    claimId: 'ATLAS-ADM-002',
    supportsProposition:
      'Kalgoorlie: a voluntarily notified (27 Nov 2025) Coles leasehold was refused on an ACCC prospective independent asset-exit theory; it is not a compulsory Part 3 filing example and is not classified as land banking.',
    caseId: 'Case4',
    variantId: 'C4-VAR-B0',
    sources: [claim('ATLAS-ADM-002'), sec('Case4', 2), sec('Case4', 5)],
  },
  {
    id: 'C4-EVID-ADM-003-B0',
    claimId: 'ATLAS-ADM-003',
    supportsProposition:
      'Tribunal status is dated from the official listing: ACT 1 of 2026 listed for hearing in Nov 2026, final merits reasons not located, and the 24 Sep 2026 determination is interim evidentiary only.',
    caseId: 'Case4',
    variantId: 'C4-VAR-B0',
    sources: [claim('ATLAS-ADM-003'), sec('Case4', 5)],
  },
  {
    id: 'C4-EVID-EMP-007',
    claimId: 'ATLAS-EMP-007',
    supportsProposition:
      'The nine-event Jul–Sep 2026 pilot is a process illustration of an identified sample, not a census; MN and WA must never be pooled and completion/opening is not independently established.',
    caseId: 'Case4',
    variantId: null,
    sources: [claim('ATLAS-EMP-007'), sec('Case4', 5), sec('Case4', 7)],
  },
  {
    id: 'C4-EVID-GAP-003',
    claimId: 'ATLAS-GAP-003',
    supportsProposition:
      'No causal evaluation of Part 3 on foreclosure or prices exists; effects of stronger or weaker rules on pre-emptive site acquisition are unidentified.',
    caseId: 'Case4',
    variantId: null,
    sources: [claim('ATLAS-GAP-003'), sec('Case4', 4), sec('Case4', 5)],
  },
  {
    id: 'C4-EVID-GAP-002',
    claimId: 'ATLAS-GAP-002',
    supportsProposition:
      'Diversion and welfare magnitudes remain unidentified in Australia.',
    caseId: 'Case4',
    variantId: null,
    sources: [claim('ATLAS-GAP-002'), sec('Case4', 5)],
  },
];

/* -------------------------------------------------------------------------- */
/* Orientations (four-case comparison table)                                  */
/* -------------------------------------------------------------------------- */

const orientations: CaseComparisonOrientation[] = [
  {
    caseId: 'Case1',
    coreQuestion:
      'Do develop-or-release or exclusivity bans improve rival access?',
    baselineHinge: 'Not a site-control vacuum post-2026.',
    leadMechanisms: ['M1a', 'M1b', 'M1c', 'Option value', 'M4a vs M4b'],
    bestSupportedFinding:
      'Large unused pipelines exist; exclusionary intent is unproven.',
    signReversalRisks: [
      'Release is not rival access',
      'An exclusivity ban may cut development inducement',
      'Sadun-style adaptation by incumbents',
    ],
    assessableNow: ['Qualitative O1 competing explanations'],
    notInferable: ['Welfare ranking of R vs E'],
    policyWinnerDeclared: false,
    sources: [
      sec('Case1', 1),
      sec('Case1', 2),
      sec('Case1', 7),
      sec('Case1', 8),
      sec('Case1', 10),
    ],
  },
  {
    caseId: 'Case2',
    coreQuestion:
      'Which FIRB requirements apply, and when could a binding one matter?',
    baselineHinge:
      'Transaction-class FIRB tree; private ≠ FGI; trigger ≠ conditions.',
    leadMechanisms: ['M6a', 'M6b', 'Then M1/M2'],
    bestSupportedFinding:
      'A uniform multi-year FIRB barrier is false for many private steps.',
    signReversalRisks: [
      'Liberalising the wrong pathway',
      'Gaming of greenfield labels',
    ],
    assessableNow: ['Qualitative O1 by pathway'],
    notInferable: ['Welfare from “loosen FIRB”'],
    policyWinnerDeclared: false,
    sources: [
      sec('Case2', 1),
      sec('Case2', 2),
      sec('Case2', 6),
      sec('Case2', 7),
      sec('Case2', 8),
      sec('Case2', 10),
    ],
  },
  {
    caseId: 'Case3',
    coreQuestion:
      'What does ALDI history plus the entry literature discipline?',
    baselineHinge: 'Pre-2026 history vs today’s entrant rules.',
    leadMechanisms: ['M2', 'M3b', 'M5a'],
    bestSupportedFinding:
      'Observed DC-project / opening order; 29/41/526 end-2018 counts.',
    signReversalRisks: ['Store growth without price discipline'],
    assessableNow: ['O2 chronology'],
    notInferable: [
      'O5/O6 from store counts',
      'Bindingness of logistics',
    ],
    policyWinnerDeclared: false,
    sources: [
      sec('Case3', 1),
      sec('Case3', 2),
      sec('Case3', 7),
      sec('Case3', 8),
      sec('Case3', 10),
    ],
  },
  {
    caseId: 'Case4',
    coreQuestion:
      'What do notification, waiver, and determinations prove?',
    baselineHinge:
      'MN ≠ WA ≠ opening; Kalgoorlie was a voluntary notification.',
    leadMechanisms: ['M4a', 'M4b', 'Process O1'],
    bestSupportedFinding:
      'Part 3 covers majors; a waiver is not clearance; Kalgoorlie shows leasehold refusal power after voluntary notification.',
    signReversalRisks: [
      'Blocking expansion forgoes short-run capacity',
      'Waiver complacency',
    ],
    assessableNow: [
      'Process O1',
      'Case-level prospective ACCC SLC assessment (local)',
    ],
    notInferable: [
      'Market-wide competition from notification volumes',
    ],
    policyWinnerDeclared: false,
    sources: [
      sec('Case4', 1),
      sec('Case4', 2),
      sec('Case4', 7),
      sec('Case4', 8),
      sec('Case4', 10),
    ],
  },
];

/* -------------------------------------------------------------------------- */

export const COMPARISON_DATASET: ComparisonDataset =
  ComparisonDatasetSchema.parse({
    provenance: {
      sourceFile: CASEBOOK_SOURCE_PATH,
      researchRelease: 'v0.1.1',
      sourceContentSha256: COMPARISON_SOURCE_CONTENT_SHA256,
      datasetVersion: COMPARISON_DATASET_VERSION,
    },
    baselines,
    variants,
    pathways,
    outcomeAssessments,
    evidenceUses,
    orientations,
  });

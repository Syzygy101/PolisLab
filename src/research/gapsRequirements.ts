/**
 * Evidence Gaps research-requirements registry (Build 07).
 *
 * Each entry preserves one numbered §9 item from the published casebook
 * (v0.1.1). Curated fields are organisational / interpretive aids and must
 * remain visually distinct from original source wording in the UI.
 *
 * Counts (published numbered source entries, not studies): Case1=5, Case2=5,
 * Case3=4, Case4=5 → 19 total.
 */

import { CASEBOOK_SOURCE_PATH } from './casebookConstants';
import {
  GAPS_REGISTRY_VERSION,
  GapsRegistrySchema,
  type GapsRegistry,
  type ResearchRequirement,
} from './gapsSchema';
import type { CaseId } from './taxonomy';

/** SHA-256 of research/10_policy_assessment_casebook.md at published v0.1.1. */
export const GAPS_SOURCE_CONTENT_SHA256 =
  '3da0e29c56f05f76b9cd0c663d3372140122ca39c71d5a202a298cf7c7ca4c08' as const;

const PROVENANCE = {
  sourceFile: CASEBOOK_SOURCE_PATH,
  researchRelease: 'v0.1.1' as const,
  sourceContentSha256: GAPS_SOURCE_CONTENT_SHA256,
};

function req(
  partial: Omit<
    ResearchRequirement,
    'sectionNumber' | 'researchRelease' | 'sourceFile' | 'sourceContentSha256'
  >,
): ResearchRequirement {
  return {
    ...partial,
    sectionNumber: 9,
    researchRelease: 'v0.1.1',
    sourceFile: CASEBOOK_SOURCE_PATH,
    sourceContentSha256: GAPS_SOURCE_CONTENT_SHA256,
  };
}

/* -------------------------------------------------------------------------- */
/* Case 1 — Undeveloped supermarket sites (5)                                 */
/* -------------------------------------------------------------------------- */

const CASE1: ResearchRequirement[] = [
  req({
    id: 'REQ-C1-01',
    caseId: 'Case1',
    itemNumber: 1,
    sourceText:
      'Parcel-level findings (ACCC/court) establishing exclusionary intent in a material share of long-held sites — or systematic rejection of that characterisation.  ',
    referencedClaimIds: ['ATLAS-EMP-002', 'ATLAS-HYP-001'],
    associatedMechanismIds: ['M1c'],
    associatedOutcomeIds: ['O1'],
    requirementType: 'competing_mechanism_discrimination',
    observationRole: 'strengthen_or_undermine',
    curatedLabel: 'Parcel-level exclusionary-intent findings',
    relevantProposition:
      'Whether long-held undeveloped sites reflect strategic foreclosure (M1c) versus planning delay, option value, or scarcity (Case 1 / ATLAS-HYP-001).',
    remainsUncertain:
      'Public inquiry materials did not determine case-by-case land banking; parcel-level intent remains unobservable on published sources (ATLAS-EMP-002).',
    competingExplanations: [
      'Strategic foreclosure / exclusionary holding (M1c)',
      'Planning delay (M1a)',
      'Efficient option value / capital rationing (M1b family caveats)',
      'Physical scarcity or landlord preference without blocking motive',
    ],
    assessmentChangingNote:
      'Parcel-level ACCC/court findings establishing exclusionary intent in a material share of long-held sites — or systematic rejection of that characterisation.',
    qualification:
      'Descriptive site data and inquiry non-findings are not identification of foreclosure. Absence of an ACCC land-banking finding is not proof that foreclosure is absent.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C1-02',
    caseId: 'Case1',
    itemNumber: 2,
    sourceText:
      'Observed assignment of released sites to non-incumbents with subsequent openings.  ',
    referencedClaimIds: ['ATLAS-HYP-002'],
    associatedMechanismIds: ['M1c', 'M4b'],
    associatedOutcomeIds: ['O1', 'O2'],
    requirementType: 'realisation_outcome',
    observationRole: 'assess_additional_outcomes',
    curatedLabel: 'Released sites → non-incumbent openings',
    relevantProposition:
      'Whether a develop-or-release instrument would assign released sites to rivals who then open stores (Case 1 instrument R pathways).',
    remainsUncertain:
      'Release does not imply rival acquisition or subsequent productive capacity; observed assignment and openings are not yet established in the published research.',
    competingExplanations: [
      'Release auctions may still award sites to incumbents',
      'Assignment without subsequent opening leaves capacity unrealised',
    ],
    assessmentChangingNote:
      'Observed assignment of released sites to non-incumbents with subsequent openings.',
    qualification:
      'An observation of assignment/opening clarifies realisation pathways; it does not by itself establish consumer welfare (O6) or durable competitive constraint (O5).',
    falsificationUnspecified: false,
    comparisonVariantIds: ['C1-VAR-R'],
  }),
  req({
    id: 'REQ-C1-03',
    caseId: 'Case1',
    itemNumber: 3,
    sourceText:
      'AU quasi-experiment decomposing planning delay vs holding vs exclusivity.  ',
    referencedClaimIds: ['ATLAS-GAP-001', 'ATLAS-EMP-001', 'ATLAS-EMP-002'],
    associatedMechanismIds: ['M1a', 'M1b', 'M1c'],
    associatedOutcomeIds: ['O1'],
    requirementType: 'empirical_identification',
    observationRole: 'distinguish_mechanisms',
    curatedLabel: 'AU design decomposing M1a / M1b / M1c',
    relevantProposition:
      'Whether Australian site outcomes are driven by planning delay, strategic holding, or exclusivity — mechanisms that co-exist as competing explanations (ATLAS-GAP-001).',
    remainsUncertain:
      'No verified Australian reduced-form study isolating planning delay from strategic site holding was registered (ATLAS-GAP-001).',
    competingExplanations: [
      'Planning delay (M1a)',
      'Strategic holding / foreclosure (M1c)',
      'Exclusivity / covenant channel',
      'Option value without exclusionary intent (M1b caveats)',
    ],
    assessmentChangingNote:
      'AU quasi-experiment decomposing planning delay vs holding vs exclusivity (atlas observation: credible AU design decomposing M1a/M1b/M1c).',
    qualification:
      'Site-control description is distinct from identification of foreclosure. Co-tagging M1a/M1b/M1c in the atlas is metadata, not causal separation.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C1-04',
    caseId: 'Case1',
    itemNumber: 4,
    sourceText:
      'Credible evaluation of exclusivity bans’ effects on *developed* grocery capacity (inducement channel).  ',
    referencedClaimIds: ['ATLAS-HYP-002', 'ATLAS-POL-002'],
    associatedMechanismIds: ['M1c', 'M4b'],
    associatedOutcomeIds: ['O1', 'O2'],
    requirementType: 'empirical_identification',
    observationRole: 'assess_additional_outcomes',
    curatedLabel: 'Exclusivity bans → developed capacity',
    relevantProposition:
      'Whether exclusivity restrictions (Case 1 instrument E) induce developed grocery capacity rather than only changing ownership form.',
    remainsUncertain:
      'Inducement effects on developed capacity are not identified in the published Australian evidence base; ATLAS-HYP-002 remains qualitative caution only.',
    competingExplanations: [
      'Substitution between ownership foreclosure and exclusivity tools',
      'Null path: bans change contracting form without adding capacity',
    ],
    assessmentChangingNote:
      'Credible evaluation of exclusivity bans’ effects on developed grocery capacity (inducement channel).',
    qualification:
      'ATLAS-HYP-002 is an unresolved hypothesis with admissibility=no (qualitative caution only) — not a validated equilibrium result.',
    falsificationUnspecified: false,
    comparisonVariantIds: ['C1-VAR-E'],
  }),
  req({
    id: 'REQ-C1-05',
    caseId: 'Case1',
    itemNumber: 5,
    sourceText: 'Specialist confirmation of a lawful, administrable release regime.',
    referencedClaimIds: ['ATLAS-POL-001'],
    associatedMechanismIds: [],
    associatedOutcomeIds: [],
    requirementType: 'legal_institutional_verification',
    observationRole: 'legal_feasibility',
    curatedLabel: 'Lawful administrable release regime',
    relevantProposition:
      'Whether a develop-or-release regime can be designed as a lawful, administrable Layer D instrument.',
    remainsUncertain:
      'Legal and administrative feasibility of a release regime remains specialist-unverified in the published research.',
    competingExplanations: [],
    assessmentChangingNote:
      'Specialist confirmation of a lawful, administrable release regime.',
    qualification:
      'Legal / institutional verification is not empirical falsification of an economic hypothesis. The published research does not specify a sufficient empirical falsification test for this requirement.',
    falsificationUnspecified: true,
    comparisonVariantIds: ['C1-VAR-R'],
  }),
];

/* -------------------------------------------------------------------------- */
/* Case 2 — Foreign greenfield grocery investment (5)                         */
/* -------------------------------------------------------------------------- */

const CASE2: ResearchRequirement[] = [
  req({
    id: 'REQ-C2-01',
    caseId: 'Case2',
    itemNumber: 1,
    sourceText:
      'Grocery-specific FIRB processing distributions by vacant land / lease / start-business / FGI.  ',
    referencedClaimIds: ['ATLAS-ADM-001', 'ATLAS-LEG-001', 'ATLAS-LEG-002'],
    associatedMechanismIds: ['M5a'],
    associatedOutcomeIds: ['O1'],
    requirementType: 'descriptive_observation',
    observationRole: 'clarify_scope_or_measurement',
    curatedLabel: 'Grocery-specific FIRB processing distributions',
    relevantProposition:
      'Whether foreign-investment processing frictions bind differentially across vacant land, lease, start-business, and FGI pathways (Case 2).',
    remainsUncertain:
      'Grocery-specific processing-time distributions by pathway are not published; FDI frictions remain transaction-specific.',
    competingExplanations: [
      'Ordinary administrative processing without a binding constraint',
      'Pathway-specific binding notification or condition',
    ],
    assessmentChangingNote:
      'Grocery-specific FIRB processing distributions by vacant land / lease / start-business / FGI.',
    qualification:
      'Do not present a FIRB delay estimate without transaction-specific evidence. Distributions would clarify measurement; they are not themselves a welfare result.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C2-02',
    caseId: 'Case2',
    itemNumber: 2,
    sourceText:
      'Documented call-in (or routine voluntary notification) of ordinary private grocery starts.  ',
    referencedClaimIds: ['ATLAS-LEG-001', 'ATLAS-CON-001'],
    associatedMechanismIds: ['M5a'],
    associatedOutcomeIds: ['O1'],
    requirementType: 'descriptive_observation',
    observationRole: 'clarify_scope_or_measurement',
    curatedLabel: 'Call-in of ordinary private grocery starts',
    relevantProposition:
      'Whether ordinary private grocery starts are called in or routinely voluntarily notified — distinct from foreign-government investor pathways.',
    remainsUncertain:
      'Documented call-in or routine voluntary notification of ordinary private grocery starts is not established in the published casebook evidence.',
    competingExplanations: [
      'Private vs foreign-government investor (FGI) pathways remain institutionally distinct',
      'Trigger vs condition distinctions in FIRB practice',
    ],
    assessmentChangingNote:
      'Documented call-in (or routine voluntary notification) of ordinary private grocery starts.',
    qualification:
      'Ordinary administrative processing is distinct from evidence that a requirement was binding for a contemplated deal.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C2-03',
    caseId: 'Case2',
    itemNumber: 3,
    sourceText:
      'Case studies where FIRB conditions were the marginal cause of abandonment after sites/planning were secured.  ',
    referencedClaimIds: ['ATLAS-ADM-001', 'ATLAS-LIT-005'],
    associatedMechanismIds: ['M5a'],
    associatedOutcomeIds: ['O1', 'O2'],
    requirementType: 'empirical_identification',
    observationRole: 'distinguish_mechanisms',
    curatedLabel: 'FIRB conditions as marginal abandonment cause',
    relevantProposition:
      'Whether FIRB conditions were the marginal cause of project abandonment after sites and planning were already secured.',
    remainsUncertain:
      'Marginal causation of abandonment by FIRB conditions is not identified in the published Australian grocery evidence.',
    competingExplanations: [
      'Site or planning failure independent of FIRB',
      'Commercial demand / capital reasons for abandonment',
      'Binding FIRB condition as the marginal cause',
    ],
    assessmentChangingNote:
      'Case studies where FIRB conditions were the marginal cause of abandonment after sites/planning were secured.',
    qualification:
      'Transaction-specific legal rules matter. A delay estimate without pathway- and deal-specific evidence is not supported.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C2-04',
    caseId: 'Case2',
    itemNumber: 4,
    sourceText:
      'Mode-specific AU evidence on greenfield vs acquisition competitive effects.  ',
    referencedClaimIds: ['ATLAS-HYP-003', 'ATLAS-POL-003', 'ATLAS-LIT-005'],
    associatedMechanismIds: ['M6a', 'M6b'],
    associatedOutcomeIds: ['O5', 'O6'],
    requirementType: 'empirical_identification',
    observationRole: 'assess_additional_outcomes',
    curatedLabel: 'Greenfield vs acquisition competitive effects',
    relevantProposition:
      'Whether greenfield entry and acquisition modes have different competitive effects in Australian grocery markets (Case 2 mode pathways).',
    remainsUncertain:
      'Mode-specific Australian competitive-effect evidence is not registered; ATLAS-HYP-003 remains an unresolved thesis framing.',
    competingExplanations: [
      'Greenfield entry effects',
      'Acquisition / consolidation effects',
      'Soft rivalry or sunk-cost explanations unrelated to FDI mode',
    ],
    assessmentChangingNote:
      'Mode-specific AU evidence on greenfield vs acquisition competitive effects.',
    qualification:
      'Greenfield and acquisition FDI are not interchangeable modes (ATLAS-LIT-005). Do not import foreign diversion magnitudes as Australian parameters when assessing mode effects; Australian diversion measurement is a separate §9 item (REQ-C3-03 / ATLAS-GAP-002).',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C2-05',
    caseId: 'Case2',
    itemNumber: 5,
    sourceText:
      'Confirmation of Layer C streamlining commencement dates on the Federal Register.',
    referencedClaimIds: ['ATLAS-LEG-004', 'ATLAS-LEG-005'],
    associatedMechanismIds: [],
    associatedOutcomeIds: [],
    requirementType: 'legal_institutional_verification',
    observationRole: 'legal_feasibility',
    curatedLabel: 'Layer C streamlining commencement dates',
    relevantProposition:
      'Whether announced Layer C FDI streamlining measures have commenced on the Federal Register (law-in-force status).',
    remainsUncertain:
      'Commencement dates for Layer C streamlining remain to be confirmed on the Federal Register; announced reforms are not entitlements.',
    competingExplanations: [],
    assessmentChangingNote:
      'Confirmation of Layer C streamlining commencement dates on the Federal Register.',
    qualification:
      'Legal / institutional verification of commencement is not empirical falsification of an entry hypothesis. Layer C announcements must not be restated as Layer A baselines.',
    falsificationUnspecified: true,
    comparisonVariantIds: null,
  }),
];

/* -------------------------------------------------------------------------- */
/* Case 3 — Differentiated entry and scale-up (4)                             */
/* -------------------------------------------------------------------------- */

const CASE3: ResearchRequirement[] = [
  req({
    id: 'REQ-C3-01',
    caseId: 'Case3',
    itemNumber: 1,
    sourceText:
      'Store-level opening panel linked to local revenue **and** prices (AEMS-style) around ALDI (or other) openings.  ',
    referencedClaimIds: ['ATLAS-EMP-005', 'ATLAS-HYP-004', 'ATLAS-GAP-002'],
    associatedMechanismIds: ['M2', 'M3a', 'M3b'],
    associatedOutcomeIds: ['O2', 'O5', 'O6'],
    requirementType: 'empirical_identification',
    observationRole: 'assess_additional_outcomes',
    curatedLabel: 'Store-level openings × revenue and prices',
    relevantProposition:
      'Whether differentiated entrant openings (e.g. ALDI) change local revenue and prices — requiring linked store-level panels (Case 3).',
    remainsUncertain:
      'Public SA/WA ALDI chronology is an O2 benchmark and does not identify price/welfare effects; actual O6 remains not assessable.',
    competingExplanations: [
      'Distribution / scale constraints (H1)',
      'Ordinary investment sequencing (H4)',
      'Soft rivalry without durable price effects',
    ],
    assessmentChangingNote:
      'Store-level opening panel linked to local revenue and prices (AEMS-style) around ALDI (or other) openings.',
    qualification:
      'Observed investment order (DC-before-stores chronology) does not identify a binding logistics constraint. Do not infer welfare from fascia counts.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C3-02',
    caseId: 'Case3',
    itemNumber: 2,
    sourceText:
      'Documented announced-vs-opened catchment census with refusal/exclusivity reasons.  ',
    referencedClaimIds: ['ATLAS-EMP-005', 'ATLAS-HYP-004'],
    associatedMechanismIds: ['M1', 'M2'],
    associatedOutcomeIds: ['O1', 'O2'],
    requirementType: 'descriptive_observation',
    observationRole: 'distinguish_mechanisms',
    curatedLabel: 'Announced-vs-opened catchment census',
    relevantProposition:
      'Whether announced catchments fail to open because of refusal/exclusivity versus ordinary sequencing or demand.',
    remainsUncertain:
      'A documented announced-versus-opened catchment census with refusal/exclusivity reasons is not available in the published research.',
    competingExplanations: [
      'Exclusivity / site refusal',
      'Ordinary investment sequencing',
      'Demand or planning barriers unrelated to exclusivity',
    ],
    assessmentChangingNote:
      'Documented announced-vs-opened catchment census with refusal/exclusivity reasons.',
    qualification:
      'Announced catchments are not openings. Chronology without refusal reasons cannot discriminate exclusivity from sequencing.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C3-03',
    caseId: 'Case3',
    itemNumber: 3,
    sourceText:
      'AU diversion ratios between majors and hard-discount / specialty formats (**ATLAS-GAP-002**).  ',
    referencedClaimIds: ['ATLAS-GAP-002'],
    associatedMechanismIds: ['M3a', 'M3b'],
    associatedOutcomeIds: ['O5', 'O6'],
    requirementType: 'measurement_parameter',
    observationRole: 'clarify_scope_or_measurement',
    curatedLabel: 'Australian diversion ratios (ATLAS-GAP-002)',
    relevantProposition:
      'Australian household-level diversion ratios between majors and hard-discount / specialty formats (explicitly ATLAS-GAP-002).',
    remainsUncertain:
      'No verified Australian household-level diversion ratios were registered; international findings remain format- and identification-conditional.',
    competingExplanations: [
      'Foreign Supercenter-style diversion magnitudes (not AU parameters)',
      'Format-specific Australian substitution patterns (unmeasured)',
    ],
    assessmentChangingNote:
      'AU diversion ratios between majors and hard-discount / specialty formats (ATLAS-GAP-002); atlas observation: licensed AU scanner/household panel with credible local entry timing design.',
    qualification:
      'Do not treat foreign diversion estimates as Australian calibration. ATLAS-GAP-002 is an absence_of_finding — not proof that diversion is zero.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C3-04',
    caseId: 'Case3',
    itemNumber: 4,
    sourceText:
      'Evidence of sustainable multi-store state presence *without* local DCs (would weaken H1).  ',
    referencedClaimIds: ['ATLAS-HYP-004', 'ATLAS-EMP-005'],
    associatedMechanismIds: ['M2'],
    associatedOutcomeIds: ['O1', 'O2'],
    requirementType: 'competing_mechanism_discrimination',
    observationRole: 'weaken_proposition',
    curatedLabel: 'Multi-store presence without local DCs',
    relevantProposition:
      'Hypothesis H1: distribution / scale constraints bind entrant expansion (Case 3 / ATLAS-HYP-004 competing frame).',
    remainsUncertain:
      'Public chronology cannot discriminate distribution/scale constraints (H1) from ordinary investment sequencing (H4) (ATLAS-HYP-004 — absence_of_finding, not unresolved_hypothesis).',
    competingExplanations: [
      'Binding logistics / DC constraint (H1)',
      'Ordinary investment sequencing (H4)',
      'Site access or exclusivity constraints (M1 family)',
    ],
    assessmentChangingNote:
      'Evidence of sustainable multi-store state presence without local DCs (would weaken H1). The published research states this directional implication explicitly.',
    qualification:
      'ATLAS-HYP-004 retains status absence_of_finding. Observing multi-store presence without DCs would weaken H1; it would not automatically prove H4 or establish welfare effects.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
];

/* -------------------------------------------------------------------------- */
/* Case 4 — Supermarket acquisition oversight (5)                             */
/* -------------------------------------------------------------------------- */

const CASE4: ResearchRequirement[] = [
  req({
    id: 'REQ-C4-01',
    caseId: 'Case4',
    itemNumber: 1,
    sourceText: 'Final Tribunal merits reasons in ACT 1 of 2026.  ',
    referencedClaimIds: [],
    associatedMechanismIds: [],
    associatedOutcomeIds: [],
    requirementType: 'legal_institutional_verification',
    observationRole: 'legal_feasibility',
    curatedLabel: 'Final Tribunal merits reasons (ACT 1 of 2026)',
    relevantProposition:
      'Institutional status and reasoning of ACT 1 of 2026 before the Tribunal.',
    remainsUncertain:
      'Final Tribunal merits reasons in ACT 1 of 2026 were not located in the published research package; listing and interim materials only.',
    competingExplanations: [],
    assessmentChangingNote: 'Final Tribunal merits reasons in ACT 1 of 2026.',
    qualification:
      'Legal / institutional verification of Tribunal reasons is not a causal evaluation of Part 3 notification effects. No atlas claim establishes those final merits reasons; related notification records (e.g. ATLAS-ADM-002) are not substituted here as tribunal reasoning.',
    falsificationUnspecified: true,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C4-02',
    caseId: 'Case4',
    itemNumber: 2,
    sourceText:
      'Matured realisation study: notified/waiver sites → verified open / not open by date *T*.  ',
    referencedClaimIds: ['ATLAS-GAP-003', 'ATLAS-EMP-007'],
    associatedMechanismIds: ['M4b', 'M1c'],
    associatedOutcomeIds: ['O1', 'O2'],
    requirementType: 'realisation_outcome',
    observationRole: 'assess_additional_outcomes',
    curatedLabel: 'Notification/waiver → verified openings',
    relevantProposition:
      'Whether notified or waived supermarket acquisition sites subsequently open (realised development), distinct from notification activity itself.',
    remainsUncertain:
      'Jul–Sep 2026 sample openings were mostly unrealised; no matured realisation panel linked to local outcomes is published (ATLAS-GAP-003 / ATLAS-EMP-007).',
    competingExplanations: [
      'Notification/waiver without subsequent opening',
      'Opening after notification (realised development)',
      'Sites never intended for near-term opening',
    ],
    assessmentChangingNote:
      'Matured realisation study: notified/waiver sites → verified open / not open by date T (atlas: matured realisation panel linked to local outcomes under pre-specified rules).',
    qualification:
      'Notification activity is not realised market competition. Waiver, determination, completion, and opening remain distinct stages.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C4-03',
    caseId: 'Case4',
    itemNumber: 3,
    sourceText:
      'Causal design on Part 3’s effect on site preemption (hard on public data).  ',
    referencedClaimIds: ['ATLAS-GAP-003', 'ATLAS-LEG-008'],
    associatedMechanismIds: ['M4b', 'M1c'],
    associatedOutcomeIds: ['O1', 'O5', 'O6'],
    requirementType: 'empirical_identification',
    observationRole: 'distinguish_mechanisms',
    curatedLabel: 'Part 3 effect on site preemption',
    relevantProposition:
      'Whether post-2026 supermarket-targeted notification (Part 3) affects site foreclosure / preemption, entry, prices, or welfare (ATLAS-GAP-003).',
    remainsUncertain:
      'No public causal evaluation of Part 3’s effect on site foreclosure, entry, prices, or welfare was registered (ATLAS-GAP-003). The casebook notes this design is hard on public data.',
    competingExplanations: [
      'Part 3 prevents preemptive acquisitions',
      'Part 3 changes notification form without altering preemption',
      'Preemption driven by forces outside Part 3',
    ],
    assessmentChangingNote:
      'Causal design on Part 3’s effect on site preemption (hard on public data).',
    qualification:
      'Existence of notifications is not proof of foreclosure prevention. Kalgoorlie remains a local prospective ACCC assessment, not a general realised causal finding. This §9 item is case-wide — not assigned to a single Case 4 comparison variant.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C4-04',
    caseId: 'Case4',
    itemNumber: 4,
    sourceText:
      'Systematic covenant/exclusivity discovery beyond notification registers.  ',
    referencedClaimIds: ['ATLAS-EMP-007', 'ATLAS-GAP-003'],
    associatedMechanismIds: ['M1c'],
    associatedOutcomeIds: ['O1'],
    requirementType: 'descriptive_observation',
    observationRole: 'clarify_scope_or_measurement',
    curatedLabel: 'Covenant/exclusivity beyond notification registers',
    relevantProposition:
      'Whether restrictive covenants and exclusivity arrangements exist beyond what notification registers reveal.',
    remainsUncertain:
      'Systematic covenant/exclusivity discovery beyond notification registers is not available in the published research.',
    competingExplanations: [
      'Register-visible transactions only',
      'Off-register exclusivity / covenant constraints',
    ],
    assessmentChangingNote:
      'Systematic covenant/exclusivity discovery beyond notification registers.',
    qualification:
      'Notification registers are an incomplete window on exclusivity. Discovery would improve measurement; it is not itself a welfare estimate.',
    falsificationUnspecified: false,
    comparisonVariantIds: null,
  }),
  req({
    id: 'REQ-C4-05',
    caseId: 'Case4',
    itemNumber: 5,
    sourceText: 'Remake or repeal decisions around the 2030 sunset.',
    referencedClaimIds: ['ATLAS-LEG-008'],
    associatedMechanismIds: [],
    associatedOutcomeIds: [],
    requirementType: 'legal_institutional_verification',
    observationRole: 'legal_feasibility',
    curatedLabel: '2030 sunset remake or repeal',
    relevantProposition:
      'Institutional path of the supermarket notification regime around the 2030 sunset (remake or repeal).',
    remainsUncertain:
      'Remake or repeal decisions around the 2030 sunset have not occurred and are not predicted by this laboratory.',
    competingExplanations: [],
    assessmentChangingNote: 'Remake or repeal decisions around the 2030 sunset.',
    qualification:
      'Future legislative remake/repeal is legal / institutional verification, not an empirical falsification of past notification effects. Do not invent completion dates or effectiveness findings.',
    falsificationUnspecified: true,
    comparisonVariantIds: null,
  }),
];

export const ALL_RESEARCH_REQUIREMENTS: ResearchRequirement[] = [
  ...CASE1,
  ...CASE2,
  ...CASE3,
  ...CASE4,
];

export const V011_EXPECTED_REQUIREMENT_COUNTS: Record<CaseId, number> = {
  Case1: 5,
  Case2: 5,
  Case3: 4,
  Case4: 5,
};

export const V011_EXPECTED_REQUIREMENT_TOTAL = 19 as const;

/** Organisational research-agenda groupings — not newly published findings. */
export const RESEARCH_AGENDA_PROGRAMMES = [
  {
    id: 'sites-planning-holding' as const,
    label: 'Sites, planning and strategic holding',
    description:
      'Organisational grouping of Case 1 §9 requirements on exclusionary intent, release realisation, and M1a/M1b/M1c discrimination.',
    organisationalOnly: true as const,
    requirementIds: ['REQ-C1-01', 'REQ-C1-02', 'REQ-C1-03', 'REQ-C1-04'],
  },
  {
    id: 'foreign-investment-pathways' as const,
    label: 'Foreign-investment pathways',
    description:
      'Organisational grouping of Case 2 §9 requirements on FIRB processing, call-in practice, binding conditions, and mode effects.',
    organisationalOnly: true as const,
    requirementIds: ['REQ-C2-01', 'REQ-C2-02', 'REQ-C2-03', 'REQ-C2-04'],
  },
  {
    id: 'distribution-scale-up' as const,
    label: 'Distribution and scale-up',
    description:
      'Organisational grouping of Case 3 §9 items that engage ALDI chronology, catchment realisation, and H1 logistics discrimination.',
    organisationalOnly: true as const,
    requirementIds: ['REQ-C3-01', 'REQ-C3-02', 'REQ-C3-04'],
  },
  {
    id: 'demand-substitution-welfare' as const,
    label: 'Demand substitution and welfare',
    description:
      'Organisational grouping centred on Australian diversion measurement (ATLAS-GAP-002) and price/revenue panels needed for O5/O6.',
    organisationalOnly: true as const,
    requirementIds: ['REQ-C3-01', 'REQ-C3-03'],
  },
  {
    id: 'acquisition-oversight-realisation' as const,
    label: 'Acquisition oversight and realised development',
    description:
      'Organisational grouping of Case 4 §9 requirements on realisation panels, Part 3 identification, and off-register exclusivity.',
    organisationalOnly: true as const,
    requirementIds: ['REQ-C4-02', 'REQ-C4-03', 'REQ-C4-04'],
  },
  {
    id: 'legal-feasibility-institutional' as const,
    label: 'Legal feasibility and institutional verification',
    description:
      'Organisational grouping of requirements that call for legal or institutional verification rather than empirical falsification.',
    organisationalOnly: true as const,
    requirementIds: [
      'REQ-C1-05',
      'REQ-C2-05',
      'REQ-C4-01',
      'REQ-C4-05',
    ],
  },
];

export const GAPS_REGISTRY: GapsRegistry = GapsRegistrySchema.parse({
  provenance: {
    ...PROVENANCE,
    registryVersion: GAPS_REGISTRY_VERSION,
    expectedRequirementCount: 19,
  },
  requirements: ALL_RESEARCH_REQUIREMENTS,
  agendaProgrammes: RESEARCH_AGENDA_PROGRAMMES,
});

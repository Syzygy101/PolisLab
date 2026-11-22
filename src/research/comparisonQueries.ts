/**
 * Policy Comparison Laboratory (Build 06) — read helpers and integrity checks.
 *
 * Helpers never aggregate, score, or rank. `compareVariants` places two
 * variants side by side and carries only source-grounded qualitative records.
 */

import { COMPARISON_DATASET } from './comparisonDataset';
import {
  COMPARISON_DATASET_VERSION,
  ComparisonDatasetSchema,
  comparisonSectionRefId,
  type ComparisonBaseline,
  type ComparisonDataset,
  type ComparisonPathway,
  type ComparisonSourceRef,
  type EvidenceUse,
  type InterventionVariant,
  type OutcomeAssessment,
} from './comparisonSchema';
import type { Claim } from './schema';
import {
  CASE_IDS,
  OUTCOME_STAGE_IDS,
  isCaseId,
  type CaseId,
} from './taxonomy';

/* -------------------------------------------------------------------------- */
/* Lookups                                                                    */
/* -------------------------------------------------------------------------- */

export function listVariants(
  caseId?: CaseId,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): InterventionVariant[] {
  return dataset.variants.filter((v) => !caseId || v.caseId === caseId);
}

export function getVariant(
  id: string,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): InterventionVariant | undefined {
  return dataset.variants.find((v) => v.id === id);
}

export function getBaseline(
  id: string,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): ComparisonBaseline | undefined {
  return dataset.baselines.find((b) => b.id === id);
}

export function baselinesForCase(
  caseId: CaseId,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): ComparisonBaseline[] {
  return dataset.baselines.filter((b) => b.caseId === caseId);
}

/** Pathways explicitly assigned to this variant (variantIds includes it). */
export function pathwaysForVariant(
  variantId: string,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): ComparisonPathway[] {
  return dataset.pathways.filter(
    (p) => p.variantIds !== null && p.variantIds.includes(variantId),
  );
}

/** Case-level shared pathways (variantIds === null). */
export function pathwaysShared(
  caseId: CaseId,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): ComparisonPathway[] {
  return dataset.pathways.filter(
    (p) => p.caseId === caseId && p.variantIds === null,
  );
}

/** Variant-scoped outcome assessments for this variant only. */
export function assessmentsForVariant(
  variantId: string,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): OutcomeAssessment[] {
  return dataset.outcomeAssessments.filter((a) => a.variantId === variantId);
}

/** Case-wide outcome assessments (not specific to any variant). */
export function assessmentsCaseWide(
  caseId: CaseId,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): OutcomeAssessment[] {
  return dataset.outcomeAssessments.filter(
    (a) => a.caseId === caseId && !a.variantId,
  );
}

/** Evidence uses attached to this variant specifically. */
export function evidenceUsesForVariant(
  variantId: string,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): EvidenceUse[] {
  return dataset.evidenceUses.filter((e) => e.variantId === variantId);
}

/** Case-level evidence uses (no variant attached). */
export function evidenceUsesCaseLevel(
  caseId: CaseId,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): EvidenceUse[] {
  return dataset.evidenceUses.filter(
    (e) => e.caseId === caseId && !e.variantId,
  );
}

export function getOrientation(
  caseId: CaseId,
  dataset: ComparisonDataset = COMPARISON_DATASET,
) {
  return dataset.orientations.find((o) => o.caseId === caseId);
}

/* -------------------------------------------------------------------------- */
/* Side-by-side comparison                                                    */
/* -------------------------------------------------------------------------- */

export interface VariantComparisonSide {
  variant: InterventionVariant;
  baseline: ComparisonBaseline | undefined;
  pathways: ComparisonPathway[];
  assessments: OutcomeAssessment[];
  evidenceUses: EvidenceUse[];
}

export interface VariantComparison {
  a: VariantComparisonSide | null;
  b: VariantComparisonSide | null;
  sameCase: boolean;
  sameBaseline: boolean;
  /** Case-level shared records, populated only when both variants share a case. */
  shared: {
    caseId: CaseId;
    pathways: ComparisonPathway[];
    assessments: OutcomeAssessment[];
    evidenceUses: EvidenceUse[];
  } | null;
  notices: string[];
  /** The casebook declares no policy winner; no ranking is ever produced. */
  policyWinnerDeclared: false;
}

function side(
  variant: InterventionVariant,
  dataset: ComparisonDataset,
): VariantComparisonSide {
  return {
    variant,
    baseline: getBaseline(variant.baselineId, dataset),
    pathways: pathwaysForVariant(variant.id, dataset),
    assessments: assessmentsForVariant(variant.id, dataset),
    evidenceUses: evidenceUsesForVariant(variant.id, dataset),
  };
}

export function compareVariants(
  a: string | null | undefined,
  b: string | null | undefined,
  dataset: ComparisonDataset = COMPARISON_DATASET,
): VariantComparison {
  const va = a ? getVariant(a, dataset) : undefined;
  const vb = b ? getVariant(b, dataset) : undefined;
  const notices: string[] = [];

  if (a && !va) notices.push(`Unknown variant ID "${a}" ignored for slot a.`);
  if (b && !vb) notices.push(`Unknown variant ID "${b}" ignored for slot b.`);
  if (va && vb && va.id === vb.id) {
    notices.push('Comparison requires two distinct variants.');
  }

  const sameCase = !!va && !!vb && va.caseId === vb.caseId;
  const sameBaseline = !!va && !!vb && va.baselineId === vb.baselineId;
  if (va && vb && !sameCase) {
    notices.push(
      'These variants belong to different cases. They may differ in institutional scope, target actors, policy objective, baseline, and outcome assessment basis. Cross-case pairing does not imply that the instruments are mutually exclusive, directly substitutable, or jointly implementable.',
    );
  }

  return {
    a: va ? side(va, dataset) : null,
    b: vb ? side(vb, dataset) : null,
    sameCase,
    sameBaseline,
    shared:
      va && vb && sameCase
        ? {
            caseId: va.caseId,
            pathways: pathwaysShared(va.caseId, dataset),
            assessments: assessmentsCaseWide(va.caseId, dataset),
            evidenceUses: evidenceUsesCaseLevel(va.caseId, dataset),
          }
        : null,
    notices,
    policyWinnerDeclared: false,
  };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export interface ComparisonValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface ComparisonValidationResult {
  ok: boolean;
  issues: ComparisonValidationIssue[];
}

/** Keys that would imply fabricated quantification. */
const FORBIDDEN_KEY_RE =
  /(^|_)(score|scores|rank|ranking|rating|probability|prob|weight|utility|effect|effectsize|elasticity|ordinal)($|_)|^(score|rank|ranking|rating|probability|weight|utility)/i;

/** Text patterns that assert a number as a score/rank/probability/effect size. */
const FABRICATED_TEXT_PATTERNS: readonly RegExp[] = [
  /\bscor(?:e|es|ed|ing)\b\s*(?:of|[:=])?\s*-?\d/i,
  /\brank(?:ed|ing)?\s*(?:#|no\.?|:|of)?\s*\d/i,
  /\bprobabilit(?:y|ies)\b\s*(?:of|[:=])\s*\d/i,
  /\d+(?:\.\d+)?\s*%\s*(?:chance|probability|likelihood)/i,
  /\beffect size\b\s*(?:of|[:=])\s*-?\d/i,
];

function walkForQuantification(
  value: unknown,
  path: string,
  issues: ComparisonValidationIssue[],
): void {
  if (typeof value === 'number') {
    if (!/\.section$/.test(path)) {
      issues.push({
        code: 'fabricated_numeric',
        path,
        message:
          'Numeric values are not permitted in the qualitative dataset (only section numbers).',
      });
    }
    return;
  }
  if (typeof value === 'string') {
    for (const re of FABRICATED_TEXT_PATTERNS) {
      if (re.test(value)) {
        issues.push({
          code: 'fabricated_quantification_text',
          path,
          message: `Text appears to assert a score, rank, probability, or effect size: "${value.slice(0, 80)}"`,
        });
        break;
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkForQuantification(v, `${path}[${i}]`, issues));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_KEY_RE.test(k)) {
        issues.push({
          code: 'forbidden_field',
          path: `${path}.${k}`,
          message: `Field "${k}" implies a score, rank, probability, or effect size.`,
        });
      }
      walkForQuantification(v, `${path}.${k}`, issues);
    }
  }
}

function duplicateIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dups.add(id);
    seen.add(id);
  }
  return [...dups];
}

/**
 * Validate the curated dataset against the atlas claims.
 *
 * Checks: schema shape; unique IDs; every claim ref resolves to an atlas claim
 * that lists the record's case in `casebook_cases`; every case_section ref is
 * well-formed; baselines exist and share the variant's case; pathway variant
 * assignments only where `variantIds` names real same-case variants; outcome
 * and evidence references; O1–O6 coverage and honest O5/O6 bounds; no
 * fabricated scores, ranks, probabilities or effect sizes; no declared winner.
 */
export function validateComparisonDataset(
  dataset: ComparisonDataset,
  claims: readonly Pick<Claim, 'claim_id' | 'cases'>[],
): ComparisonValidationResult {
  const issues: ComparisonValidationIssue[] = [];
  const add = (code: string, path: string, message: string) =>
    issues.push({ code, path, message });

  const parsed = ComparisonDatasetSchema.safeParse(dataset);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      add('schema', issue.path.join('.') || '(root)', issue.message);
    }
    // Structural access below assumes valid shape.
    return { ok: false, issues };
  }

  const claimMap = new Map(claims.map((c) => [c.claim_id, c]));
  const variantMap = new Map(dataset.variants.map((v) => [v.id, v]));
  const baselineMap = new Map(dataset.baselines.map((b) => [b.id, b]));

  if (dataset.provenance.datasetVersion !== COMPARISON_DATASET_VERSION) {
    add('provenance', 'provenance.datasetVersion', 'Unexpected dataset version.');
  }

  // Unique IDs per collection.
  const collections: [string, readonly { id: string }[]][] = [
    ['baselines', dataset.baselines],
    ['variants', dataset.variants],
    ['pathways', dataset.pathways],
    ['outcomeAssessments', dataset.outcomeAssessments],
    ['evidenceUses', dataset.evidenceUses],
  ];
  for (const [name, items] of collections) {
    for (const dup of duplicateIds(items.map((i) => i.id))) {
      add('duplicate_id', name, `Duplicate id "${dup}".`);
    }
  }
  for (const dup of duplicateIds(dataset.orientations.map((o) => o.caseId))) {
    add('duplicate_id', 'orientations', `Duplicate orientation for ${dup}.`);
  }
  // IDs must be unique across baselines/variants (both are referenced by ID).
  for (const dup of duplicateIds([
    ...dataset.baselines.map((b) => b.id),
    ...dataset.variants.map((v) => v.id),
  ])) {
    add('duplicate_id', 'baselines+variants', `ID "${dup}" reused across baselines and variants.`);
  }

  const checkRefs = (
    refs: readonly ComparisonSourceRef[],
    path: string,
    caseId: CaseId,
  ) => {
    refs.forEach((ref, i) => {
      const p = `${path}[${i}]`;
      if (ref.kind === 'claim') {
        const claim = claimMap.get(ref.id);
        if (!claim) {
          add('unresolved_claim_ref', p, `Claim "${ref.id}" does not exist in the atlas.`);
        } else if (!claim.cases.includes(caseId)) {
          add(
            'claim_not_in_case',
            p,
            `Claim "${ref.id}" is not a direct-citation member of ${caseId}.`,
          );
        }
        if (ref.caseId && ref.caseId !== caseId) {
          add('ref_case_mismatch', p, `Ref caseId ${ref.caseId} differs from record case ${caseId}.`);
        }
      } else {
        if (!ref.caseId || !isCaseId(ref.caseId) || ref.section === undefined) {
          add('unresolved_section_ref', p, 'case_section ref lacks a valid caseId/section.');
        } else {
          if (ref.id !== comparisonSectionRefId(ref.caseId, ref.section)) {
            add('unresolved_section_ref', p, `Malformed section ref id "${ref.id}".`);
          }
          if (ref.caseId !== caseId) {
            add('ref_case_mismatch', p, `Section ref ${ref.caseId} differs from record case ${caseId}.`);
          }
        }
      }
    });
  };

  dataset.baselines.forEach((b, i) =>
    checkRefs(b.sources, `baselines[${i}].sources`, b.caseId),
  );

  dataset.variants.forEach((v, i) => {
    checkRefs(v.sources, `variants[${i}].sources`, v.caseId);
    const base = baselineMap.get(v.baselineId);
    if (!base) {
      add('missing_baseline', `variants[${i}].baselineId`, `Baseline "${v.baselineId}" does not exist.`);
    } else if (base.caseId !== v.caseId) {
      add('baseline_case_mismatch', `variants[${i}].baselineId`, `Baseline "${base.id}" belongs to ${base.caseId}, not ${v.caseId}.`);
    }
  });

  dataset.pathways.forEach((p, i) => {
    checkRefs(p.sources, `pathways[${i}].sources`, p.caseId);
    if (p.variantIds !== null) {
      p.variantIds.forEach((vid) => {
        const v = variantMap.get(vid);
        if (!v) {
          add('missing_variant', `pathways[${i}].variantIds`, `Variant "${vid}" does not exist.`);
        } else if (v.caseId !== p.caseId) {
          add('variant_case_mismatch', `pathways[${i}].variantIds`, `Variant "${vid}" belongs to ${v.caseId}, not ${p.caseId}.`);
        } else if (!pathwaysForVariant(vid, dataset).some((x) => x.id === p.id)) {
          // Defensive: the query layer must agree with the assignment.
          add('pathway_assignment_inconsistent', `pathways[${i}]`, `Pathway "${p.id}" is not returned for assigned variant "${vid}".`);
        }
      });
    }
  });

  // No variant may receive a pathway whose variantIds omits it.
  for (const v of dataset.variants) {
    for (const p of pathwaysForVariant(v.id, dataset)) {
      if (p.variantIds === null || !p.variantIds.includes(v.id)) {
        add('pathway_assignment_inconsistent', `variants.${v.id}`, `Pathway "${p.id}" assigned without listing the variant.`);
      }
    }
  }

  const assessmentKeys = new Set<string>();
  dataset.outcomeAssessments.forEach((a, i) => {
    const path = `outcomeAssessments[${i}]`;
    checkRefs(a.sources, `${path}.sources`, a.caseId);
    checkRefs(a.changeEvidenceRefs, `${path}.changeEvidenceRefs`, a.caseId);
    if (a.variantId) {
      const v = variantMap.get(a.variantId);
      if (!v) {
        add('missing_variant', `${path}.variantId`, `Variant "${a.variantId}" does not exist.`);
      } else if (v.caseId !== a.caseId) {
        add('variant_case_mismatch', `${path}.variantId`, `Variant "${a.variantId}" belongs to ${v.caseId}, not ${a.caseId}.`);
      }
    }
    const key = `${a.caseId}|${a.variantId ?? ''}|${a.outcomeId}`;
    if (assessmentKeys.has(key)) {
      add('duplicate_assessment', path, `Duplicate assessment for ${key}.`);
    }
    assessmentKeys.add(key);
    // ATLAS-CON-003: no welfare from counts; casebook never marks these assessable.
    if (a.outcomeId === 'O6' && a.assessability !== 'not_assessable') {
      add('overclaim', path, 'O6 must remain not_assessable (ATLAS-CON-003).');
    }
    if (a.outcomeId === 'O5' && a.assessability === 'assessable') {
      add('overclaim', path, 'O5 may not be marked assessable (ATLAS-CON-003).');
    }
  });

  for (const caseId of CASE_IDS) {
    for (const outcome of OUTCOME_STAGE_IDS) {
      if (
        !dataset.outcomeAssessments.some(
          (a) => a.caseId === caseId && a.outcomeId === outcome,
        )
      ) {
        add('missing_outcome', 'outcomeAssessments', `${caseId} lacks an ${outcome} assessment.`);
      }
    }
    if (!dataset.orientations.some((o) => o.caseId === caseId)) {
      add('missing_orientation', 'orientations', `${caseId} lacks an orientation.`);
    }
    if (!dataset.variants.some((v) => v.caseId === caseId)) {
      add('missing_variants', 'variants', `${caseId} has no variants.`);
    }
  }

  dataset.evidenceUses.forEach((e, i) => {
    const path = `evidenceUses[${i}]`;
    checkRefs(e.sources, `${path}.sources`, e.caseId);
    if (!claimMap.has(e.claimId)) {
      add('unresolved_claim_ref', `${path}.claimId`, `Claim "${e.claimId}" does not exist in the atlas.`);
    } else if (!claimMap.get(e.claimId)!.cases.includes(e.caseId)) {
      add('claim_not_in_case', `${path}.claimId`, `Claim "${e.claimId}" is not a direct-citation member of ${e.caseId}.`);
    }
    if (!e.sources.some((s) => s.kind === 'claim' && s.id === e.claimId)) {
      add('evidence_source_mismatch', path, 'sources must include the claim being used.');
    }
    if (e.variantId) {
      const v = variantMap.get(e.variantId);
      if (!v) {
        add('missing_variant', `${path}.variantId`, `Variant "${e.variantId}" does not exist.`);
      } else if (v.caseId !== e.caseId) {
        add('variant_case_mismatch', `${path}.variantId`, `Variant "${e.variantId}" belongs to ${v.caseId}, not ${e.caseId}.`);
      }
    }
  });

  dataset.orientations.forEach((o, i) =>
    checkRefs(o.sources, `orientations[${i}].sources`, o.caseId),
  );

  // No fabricated quantification anywhere (provenance holds a hash string only).
  walkForQuantification(dataset, 'dataset', issues);

  return { ok: issues.length === 0, issues };
}

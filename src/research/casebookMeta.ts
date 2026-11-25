/**
 * Derived casebook navigation metadata — kept explicitly separate from
 * original source Markdown. Summaries are source-grounded orientation only.
 */

import type { CaseId } from './taxonomy';
import { RESEARCH_CASES } from './taxonomy';

export interface CaseDerivedMeta {
  id: CaseId;
  /** Concise orientation for the case header (not a substitute for §1–§10). */
  orientation: string;
  /** Principal analytical focus. */
  analyticalFocus: string;
  /** Main conclusion / assessment boundary from the published §10. */
  assessmentBoundary: string;
}

/**
 * Short orientation strings paraphrased tightly from published casebook
 * questions and conclusions. Full original text remains in generated Markdown.
 */
export const CASE_DERIVED_META: Record<CaseId, CaseDerivedMeta> = {
  Case1: {
    id: 'Case1',
    orientation:
      'Assesses Layer D develop-or-release (R) and exclusivity-restriction (E) instruments against the post-2026 baseline — without ranking them or claiming welfare gains.',
    analyticalFocus:
      'Site pipelines, competing M1a/M1b/M1c explanations, option value, and separate R/E pathways.',
    assessmentBoundary:
      'Neither R nor E can be ranked as a welfare-improving reform on existing evidence; release does not imply rival access.',
  },
  Case2: {
    id: 'Case2',
    orientation:
      'Maps FIRB/FATA requirements by transaction pathway for private greenfield grocery entry, rejecting a uniform multi-year screening baseline.',
    analyticalFocus:
      'Transaction-class branching (T1–T9 / FGI), notification triggers versus typical conditions, and CF-A–D counterfactuals.',
    assessmentBoundary:
      'A serious FDI counterfactual must name the transaction class; loosening FIRB does not by itself deliver durable competition or O5/O6.',
  },
  Case3: {
    id: 'Case3',
    orientation:
      'Uses ALDI’s SA/WA chronology and entry literature as an external-validity object — historical pre-2026 observations distinct from today’s entrant baseline.',
    analyticalFocus:
      'Observed DC-before-stores order, format differentiation, and identification limits (H1 vs H4).',
    assessmentBoundary:
      'Strong O2 scale-up benchmark; weak O5/O6 guide — store counts do not establish welfare or binding logistics causality.',
  },
  Case4: {
    id: 'Case4',
    orientation:
      'Separates mandatory notification, waivers, substantive determinations, completion, and store opening in supermarket acquisition oversight.',
    analyticalFocus:
      'Part 3 duties, waiver ≠ clearance, Kalgoorlie voluntary notification pathway, and process versus market-wide outcomes.',
    assessmentBoundary:
      'Merger oversight is real and outcome-incomplete; register activity is not a competition scoreboard; Tribunal merits remain release-dated.',
  },
};

export function getCaseDerivedMeta(id: CaseId): CaseDerivedMeta {
  return CASE_DERIVED_META[id];
}

export function caseDirectoryEntries() {
  return RESEARCH_CASES.map((c) => ({
    ...c,
    meta: CASE_DERIVED_META[c.id],
  }));
}

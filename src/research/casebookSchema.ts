import { z } from 'zod';
import { CASE_IDS } from './taxonomy';

export const CaseSectionSchema = z.object({
  number: z.number().int().min(1).max(10),
  /** Published section title without the leading "N. " prefix. */
  title: z.string().min(1),
  /** Full published heading text (e.g. "1. Precise policy question"). */
  heading: z.string().min(1),
  /** Stable in-page anchor id. */
  anchor: z.string().min(1),
  /** Original Markdown body for this section (excluding the heading line). */
  markdown: z.string(),
  /** Distinct ATLAS claim IDs appearing explicitly in this section body. */
  explicitClaimIds: z.array(z.string()),
});

export type CaseSection = z.infer<typeof CaseSectionSchema>;

export const ParsedCaseSchema = z.object({
  id: z.enum(CASE_IDS),
  /** Published short title after the em dash. */
  title: z.string().min(1),
  /** Full case heading line text without leading "## ". */
  heading: z.string().min(1),
  /** Original Markdown for the entire case (heading + ten sections). */
  markdown: z.string().min(1),
  sections: z.array(CaseSectionSchema).length(10),
  /** Distinct ATLAS IDs cited explicitly somewhere in the case body (ten sections). */
  bodyClaimIds: z.array(z.string()),
  /**
   * Direct-citation membership for this case: body citations plus common
   * all-case front-matter rules that apply even when not repeated in the body.
   */
  membershipClaimIds: z.array(z.string()),
});

export type ParsedCase = z.infer<typeof ParsedCaseSchema>;

export const CasebookDocumentPartSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Original Markdown including the heading line. */
  markdown: z.string(),
});

export type CasebookDocumentPart = z.infer<typeof CasebookDocumentPartSchema>;

export const CasebookProvenanceSchema = z.object({
  sourceFile: z.string(),
  researchRelease: z.string(),
  researchCutoff: z.string(),
  correctionPass: z.string(),
  sourceContentSha256: z.string(),
  generatedAt: z.string(),
  caseCount: z.number().int(),
  sectionCount: z.number().int(),
});

export type CasebookProvenance = z.infer<typeof CasebookProvenanceSchema>;

export const CasebookDatasetSchema = z.object({
  provenance: CasebookProvenanceSchema,
  /** Front matter Markdown above the first case heading. */
  frontMatterMarkdown: z.string(),
  /** Common all-case rule claim IDs extracted from front matter. */
  commonRuleClaimIds: z.array(z.string()),
  cases: z.array(ParsedCaseSchema).length(4),
  /** Closing / methodology parts after Case 4 (cross-ref, comparison, etc.). */
  closingParts: z.array(CasebookDocumentPartSchema),
});

export type CasebookDataset = z.infer<typeof CasebookDatasetSchema>;

import Papa from 'papaparse';
import { createHash } from 'node:crypto';
import {
  ATLAS_SOURCE_FIELDS,
  ATLAS_SOURCE_PATH,
  EXPECTED_CLAIM_COUNT,
  KNOWN_MISSING_PRIMARY_URL_CLAIM_IDS,
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from './constants';
import {
  AtlasRawClaimSchema,
  assertExactHeaders,
  enrichRawClaim,
  type AtlasRawClaim,
  type Claim,
  type ResearchDataset,
  type ResearchProvenance,
} from './schema';

export class ResearchIngestError extends Error {
  readonly issues: string[];

  constructor(message: string, issues: string[] = []) {
    super(issues.length ? `${message}: ${issues.join('; ')}` : message);
    this.name = 'ResearchIngestError';
    this.issues = issues;
  }
}

export function sha256Hex(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

function normaliseCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function rowToRawClaim(row: Record<string, unknown>, rowIndex: number): AtlasRawClaim {
  const payload: Record<string, string> = {};
  for (const field of ATLAS_SOURCE_FIELDS) {
    payload[field] = normaliseCell(row[field]);
  }

  const parsed = AtlasRawClaimSchema.safeParse(payload);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'row'}: ${issue.message}`)
      .join(', ');
    throw new ResearchIngestError(`Invalid claim at data row ${rowIndex}`, [detail]);
  }
  return parsed.data;
}

export interface IngestOptions {
  /** When true, enforce the published v0.1.1 claim count (43). */
  expectPublishedCount?: boolean;
  /**
   * When true (default for published atlas), require that only known claim IDs
   * may have an empty primary_source_url.
   */
  enforceKnownMissingUrls?: boolean;
  sourceFile?: string;
  researchRelease?: string;
  researchCutoff?: string;
  correctionPass?: string;
  generatedAt?: string;
}

export function ingestAtlasCsv(
  csvText: string,
  options: IngestOptions = {},
): ResearchDataset {
  const {
    expectPublishedCount = false,
    enforceKnownMissingUrls = false,
    sourceFile = ATLAS_SOURCE_PATH,
    researchRelease = RESEARCH_RELEASE,
    researchCutoff = RESEARCH_CUTOFF,
    correctionPass = RESEARCH_CORRECTION_PASS,
  } = options;

  // Content-addressed stamp: identical CSV input yields identical generated JSON.
  const generatedAt =
    options.generatedAt ?? `content-sha256:${sha256Hex(csvText)}`;

  const parsed = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    throw new ResearchIngestError(
      'Malformed CSV',
      parsed.errors.map(
        (err) =>
          `${err.type}${err.code ? `/${err.code}` : ''} at row ${err.row ?? '?'}: ${err.message}`,
      ),
    );
  }

  assertExactHeaders(parsed.meta.fields);

  const claims: Claim[] = [];
  const seenIds = new Set<string>();
  const issues: string[] = [];

  parsed.data.forEach((row, index) => {
    const rowNumber = index + 2; // header is row 1
    try {
      const raw = rowToRawClaim(row, rowNumber);
      if (seenIds.has(raw.claim_id)) {
        issues.push(`Duplicate claim_id "${raw.claim_id}" at data row ${rowNumber}`);
        return;
      }
      seenIds.add(raw.claim_id);

      if (
        enforceKnownMissingUrls &&
        raw.primary_source_url.trim() === '' &&
        !(KNOWN_MISSING_PRIMARY_URL_CLAIM_IDS as readonly string[]).includes(raw.claim_id)
      ) {
        issues.push(
          `Unexpected empty primary_source_url for "${raw.claim_id}" at data row ${rowNumber}`,
        );
      }

      claims.push(enrichRawClaim(raw));
    } catch (error) {
      if (error instanceof ResearchIngestError) {
        issues.push(...error.issues);
      } else if (error instanceof Error) {
        issues.push(error.message);
      } else {
        issues.push(String(error));
      }
    }
  });

  if (issues.length > 0) {
    throw new ResearchIngestError('Atlas validation failed', issues);
  }

  if (expectPublishedCount && claims.length !== EXPECTED_CLAIM_COUNT) {
    throw new ResearchIngestError(
      `Expected ${EXPECTED_CLAIM_COUNT} claims, got ${claims.length}`,
    );
  }

  // Deterministic sort by claim_id for reproducible consumers.
  claims.sort((a, b) => a.claim_id.localeCompare(b.claim_id));

  const provenance: ResearchProvenance = {
    sourceFile,
    researchRelease,
    researchCutoff,
    correctionPass,
    sourceContentSha256: sha256Hex(csvText),
    claimCount: claims.length,
    generatedAt,
    fields: [...ATLAS_SOURCE_FIELDS],
  };

  return { provenance, claims };
}

export function getClaimById(dataset: ResearchDataset, claimId: string): Claim | undefined {
  return dataset.claims.find((claim) => claim.claim_id === claimId);
}

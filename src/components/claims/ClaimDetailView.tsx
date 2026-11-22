import { Link } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import type { Claim } from '@/research/schema';
import { ATLAS_SOURCE_FIELDS } from '@/research/constants';
import { compareHref } from '@/research/compareUrl';
import { findClaimsSharingSourceUrl } from '@/research/relatedEvidence';
import { isSafeHttpUrl } from '@/research/safeUrl';
import { claimsExplorerHref } from '@/research/urlFilters';
import { gapsHref } from '@/research/gapsUrl';
import { requirementsReferencingClaim } from '@/research/gapsQueries';
import { AdmissibilityBadge, admissibilityExpandedLabel } from './AdmissibilityBadge';
import type { ExplorerReturnState } from './ClaimsTable';
import { RelatedEvidencePanel } from './RelatedEvidencePanel';
import { StatusBadge, statusTone } from './StatusBadge';
import { IdChipList } from './IdChip';

const FIELD_LABELS: Record<(typeof ATLAS_SOURCE_FIELDS)[number], string> = {
  claim_id: 'Claim ID',
  exact_claim: 'Exact claim',
  mechanism_ids: 'Mechanism IDs (source)',
  outcome_ids: 'Outcome IDs (source)',
  institutional_geographic_scope: 'Institutional / geographic scope',
  status: 'Status',
  primary_source_title: 'Primary source title',
  primary_source_url: 'Primary source URL',
  source_date_or_version: 'Source date or version',
  pinpoint: 'Pinpoint',
  what_source_establishes: 'What the source establishes',
  limitations_external_validity: 'Limitations / external validity',
  competing_mechanism_or_contrary_evidence: 'Competing mechanism or contrary evidence',
  observation_that_would_alter_assessment: 'Observation that would alter assessment',
  admissible_in_policy_comparison: 'Admissible in policy comparison',
  admissibility_conditions: 'Admissibility conditions',
  casebook_cases: 'Casebook cases (source)',
  literature_src_ids: 'Literature source IDs (source)',
};

function FieldBlock({
  field,
  claim,
  heading,
}: {
  field: (typeof ATLAS_SOURCE_FIELDS)[number];
  claim: Claim;
  heading?: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {heading ?? FIELD_LABELS[field]}
        <span className="ml-2 font-mono text-[10px] normal-case tracking-normal text-ink-subtle">
          {field}
        </span>
      </h3>
      <div className="whitespace-pre-wrap break-words text-sm text-ink">
        <FieldValue claim={claim} field={field} />
      </div>
    </div>
  );
}

export function ClaimDetailView({
  claim,
  explorerReturnState,
}: {
  claim: Claim;
  explorerReturnState?: ExplorerReturnState | null;
}) {
  const sharedUrlClaims = findClaimsSharingSourceUrl(claim, allClaims);
  const linkedRequirements = requirementsReferencingClaim(claim.claim_id);

  return (
    <article className="space-y-6">
      <header className="space-y-3 border border-line bg-paper-raised p-5">
        <p className="font-mono text-xs text-ink-subtle">{claim.claim_id}</p>
        <h1 className="font-display text-2xl font-semibold leading-snug text-ink">
          {claim.exact_claim}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={claim.status} />
          <AdmissibilityBadge value={claim.admissible_in_policy_comparison} />
        </div>
        <p className="text-sm text-ink-muted">{statusTone(claim.status)}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={compareHref({ a: claim.claim_id })}
            state={explorerReturnState ?? undefined}
            className="border border-line px-3 py-1.5 text-sm text-ink no-underline hover:bg-neutral-soft"
          >
            Compare with another claim
          </Link>
          {claim.cases.map((caseId) => (
            <Link
              key={`casebook-${caseId}`}
              to={`/casebook/${caseId}`}
              className="border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm text-accent no-underline hover:bg-accent-soft"
              data-testid={`claim-casebook-link-${caseId}`}
            >
              Open {caseId} investigation
            </Link>
          ))}
          {claim.cases[0] ? (
            <Link
              to={claimsExplorerHref({ cases: [claim.cases[0]] })}
              className="border border-line px-3 py-1.5 text-sm text-ink no-underline hover:bg-neutral-soft"
            >
              {claim.cases[0]} evidence subset
            </Link>
          ) : null}
          <Link
            to={gapsHref({ claimId: claim.claim_id })}
            className="border border-line px-3 py-1.5 text-sm text-ink no-underline hover:bg-neutral-soft"
            data-testid="claim-gaps-link"
          >
            Related research requirements
            {linkedRequirements.length > 0 ? ` (${linkedRequirements.length})` : ''}
          </Link>
        </div>
      </header>

      <section
        aria-labelledby="establishes-heading"
        className="space-y-3 border border-line bg-paper-raised p-5"
      >
        <h2 id="establishes-heading" className="text-sm font-semibold text-ink">
          What the source establishes
        </h2>
        <FieldBlock field="what_source_establishes" claim={claim} heading="Source establishes" />
      </section>

      <section
        aria-labelledby="provenance-heading"
        className="space-y-3 border border-line bg-paper-raised p-5"
      >
        <h2 id="provenance-heading" className="text-sm font-semibold text-ink">
          Source provenance and pinpoint
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FieldBlock field="primary_source_title" claim={claim} />
          <FieldBlock field="source_date_or_version" claim={claim} />
          <FieldBlock field="primary_source_url" claim={claim} />
          <FieldBlock field="pinpoint" claim={claim} />
          <FieldBlock field="institutional_geographic_scope" claim={claim} />
        </div>
        <p className="text-xs text-ink-subtle">
          Source types in the atlas include legislation, guidance, administrative determinations,
          descriptive evidence, literature, and PolisLab synthesis. This build does not
          auto-classify source type when the atlas does not state one.
        </p>
      </section>

      <section
        aria-labelledby="limitations-heading"
        className="space-y-3 border border-line bg-paper-raised p-5"
      >
        <h2 id="limitations-heading" className="text-sm font-semibold text-ink">
          Limitations and competing evidence
        </h2>
        <FieldBlock field="limitations_external_validity" claim={claim} />
        <FieldBlock field="competing_mechanism_or_contrary_evidence" claim={claim} />
      </section>

      <aside
        aria-labelledby="admissibility-heading"
        className="space-y-2 border border-line-strong bg-neutral-soft px-4 py-3"
      >
        <h2 id="admissibility-heading" className="text-sm font-semibold text-ink">
          Policy-comparison admissibility and conditions
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <AdmissibilityBadge value={claim.admissible_in_policy_comparison} />
          <span className="font-mono text-xs text-ink-muted">
            admissible_in_policy_comparison = {claim.admissible_in_policy_comparison}
          </span>
        </div>
        <p className="text-sm text-ink">
          <span className="font-medium">{claim.admissible_in_policy_comparison}</span>
          <span className="text-ink-muted">
            {' '}
            (
            {claim.admissible_in_policy_comparison === 'yes'
              ? 'yes — may be used in policy comparison under the stated conditions'
              : claim.admissible_in_policy_comparison === 'no'
                ? 'no — not admissible as a validated analytical result'
                : 'conditional — only under the stated conditions'}
            )
          </span>
        </p>
        <p className="text-xs text-ink-muted">
          Admissibility is not a truth verdict. <span className="font-medium">yes</span> does not
          mean the claim is established fact; <span className="font-medium">no</span> does not mean
          the claim is false. Status and admissibility remain distinct fields. Inadmissibility for
          a validated analytical use does not necessarily prohibit a qualified qualitative
          discussion. {admissibilityExpandedLabel(claim.admissible_in_policy_comparison)}.
        </p>
        <FieldBlock field="admissibility_conditions" claim={claim} />
      </aside>

      <section
        aria-labelledby="alter-heading"
        className="space-y-3 border border-line bg-paper-raised p-5"
      >
        <h2 id="alter-heading" className="text-sm font-semibold text-ink">
          Observation that would alter the assessment
        </h2>
        <FieldBlock field="observation_that_would_alter_assessment" claim={claim} />
        {linkedRequirements.length > 0 ? (
          <div className="space-y-1" data-testid="claim-linked-requirements">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Linked casebook §9 requirements
            </p>
            <ul className="space-y-1 text-sm">
              {linkedRequirements.map((req) => (
                <li key={req.id}>
                  <Link
                    to={`/gaps/${req.id}`}
                    className="font-mono text-xs text-accent no-underline hover:underline"
                  >
                    {req.id}
                  </Link>
                  <span className="text-ink-muted"> — {req.curatedLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section
        aria-labelledby="tags-heading"
        className="space-y-3 border border-line bg-paper-raised p-5"
      >
        <h2 id="tags-heading" className="text-sm font-semibold text-ink">
          Mechanisms, outcomes, and case membership
        </h2>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Mechanisms</p>
            <div className="mt-1">
              <IdChipList values={claim.mechanisms} linkMechanisms />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Outcomes</p>
            <div className="mt-1">
              <IdChipList values={claim.outcomes} />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Cases</p>
            <div className="mt-1">
              <IdChipList values={claim.cases} />
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <FieldBlock field="mechanism_ids" claim={claim} />
          <FieldBlock field="outcome_ids" claim={claim} />
          <FieldBlock field="casebook_cases" claim={claim} />
        </div>
      </section>

      <section
        aria-labelledby="literature-heading"
        className="space-y-3 border border-line bg-paper-raised p-5"
      >
        <h2 id="literature-heading" className="text-sm font-semibold text-ink">
          Literature-source identifiers and record metadata
        </h2>
        <FieldBlock field="literature_src_ids" claim={claim} />
        <FieldBlock field="claim_id" claim={claim} />
        <FieldBlock field="status" claim={claim} />
        {claim.literatureSources.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {claim.literatureSources.map((id) => (
              <Link
                key={id}
                to={claimsExplorerHref({ literatureSources: [id] })}
                className="border border-line px-2 py-1 font-mono text-xs text-accent no-underline hover:bg-neutral-soft"
              >
                Filter by {id}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-subtle">No literature-source identifiers on this record.</p>
        )}
        {claim.primary_source_url.trim() ? (
          <div className="space-y-2">
            <p className="text-xs text-ink-muted">
              Records sharing this exact primary source URL (titles alone do not merge documents;
              shared URL does not imply the same proposition):
            </p>
            {sharedUrlClaims.length === 0 ? (
              <p className="text-sm text-ink-subtle">No other claims share this URL.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {sharedUrlClaims.map((other) => (
                  <li key={other.claim_id}>
                    <Link to={`/claims/${other.claim_id}`} className="font-mono text-xs">
                      {other.claim_id}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={claimsExplorerHref({ sourceUrl: claim.primary_source_url.trim() })}
              className="inline-block text-sm text-accent"
            >
              Open research subset for this exact source URL
            </Link>
          </div>
        ) : null}
      </section>

      <RelatedEvidencePanel claim={claim} claims={allClaims} />

      <section aria-labelledby="source-fields-heading" className="space-y-3">
        <h2
          id="source-fields-heading"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          All 18 source fields
        </h2>
        <p className="text-xs text-ink-subtle">
          Complete original atlas record. No independently generated summaries replace source text.
        </p>
        <dl className="divide-y divide-line border border-line bg-paper-raised">
          {ATLAS_SOURCE_FIELDS.map((field) => (
            <div key={field} className="grid gap-1 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4">
              <dt className="text-xs font-medium text-ink-muted">
                <span className="block">{FIELD_LABELS[field]}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-ink-subtle">{field}</span>
              </dt>
              <dd className="break-words whitespace-pre-wrap text-sm text-ink">
                <FieldValue claim={claim} field={field} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}

function FieldValue({
  claim,
  field,
}: {
  claim: Claim;
  field: (typeof ATLAS_SOURCE_FIELDS)[number];
}) {
  const value = claim[field];

  if (field === 'primary_source_url') {
    const url = value.trim();
    if (!url) {
      return (
        <span className="text-ink-muted">
          No public primary URL in the published atlas
          {claim.claim_id === 'ATLAS-HYP-003'
            ? ' (internal thesis / project framing for ATLAS-HYP-003; unpublished local materials are not exposed).'
            : '.'}
        </span>
      );
    }
    if (!isSafeHttpUrl(url)) {
      return (
        <span className="break-all text-ink-muted" title="URL scheme is not http(s); not linked">
          {url}
        </span>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="break-all">
        {url}
      </a>
    );
  }

  if (field === 'status') {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="font-mono text-xs">{value}</span>
        <StatusBadge status={claim.status} />
      </span>
    );
  }

  if (value.trim() === '') {
    return <span className="text-ink-subtle">(empty)</span>;
  }

  return <>{value}</>;
}

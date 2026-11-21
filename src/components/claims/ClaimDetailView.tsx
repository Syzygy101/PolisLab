import type { Claim } from '@/research/schema';
import { ATLAS_SOURCE_FIELDS } from '@/research/constants';
import { isSafeHttpUrl } from '@/research/safeUrl';
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

const ADMISSIBILITY_LABEL: Record<Claim['admissible_in_policy_comparison'], string> = {
  yes: 'yes — may be used in policy comparison under the stated conditions',
  no: 'no — not admissible as a validated analytical result',
  conditional: 'conditional — only under the stated conditions',
};

export function ClaimDetailView({ claim }: { claim: Claim }) {
  return (
    <article className="space-y-6">
      <header className="space-y-3 border border-line bg-paper-raised p-5">
        <p className="font-mono text-xs text-ink-subtle">{claim.claim_id}</p>
        <h1 className="font-display text-2xl font-semibold leading-snug text-ink">
          {claim.exact_claim}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={claim.status} />
          <p className="text-sm text-ink-muted">{statusTone(claim.status)}</p>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Mechanisms</p>
            <div className="mt-1">
              <IdChipList values={claim.mechanisms} />
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
      </header>

      <aside
        aria-labelledby="admissibility-heading"
        className="space-y-2 border border-line-strong bg-neutral-soft px-4 py-3"
      >
        <h2 id="admissibility-heading" className="text-sm font-semibold text-ink">
          Policy-comparison admissibility
        </h2>
        <p className="text-sm text-ink">
          <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
            admissible_in_policy_comparison
          </span>
          <span className="mx-2 text-ink-subtle">=</span>
          <span className="font-medium">{claim.admissible_in_policy_comparison}</span>
          <span className="text-ink-muted">
            {' '}
            ({ADMISSIBILITY_LABEL[claim.admissible_in_policy_comparison]})
          </span>
        </p>
        <p className="text-xs text-ink-muted">
          Admissibility is not a truth verdict. <span className="font-medium">yes</span> does not
          mean the claim is established fact; <span className="font-medium">no</span> does not mean
          the claim is false. Status and admissibility remain distinct fields.
        </p>
        {claim.admissibility_conditions.trim() !== '' ? (
          <p className="whitespace-pre-wrap text-sm text-ink">
            <span className="font-medium text-ink-muted">Conditions: </span>
            {claim.admissibility_conditions}
          </p>
        ) : null}
      </aside>

      <section aria-labelledby="source-fields-heading" className="space-y-3">
        <h2 id="source-fields-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          All 18 source fields
        </h2>
        <dl className="divide-y divide-line border border-line bg-paper-raised">
          {ATLAS_SOURCE_FIELDS.map((field) => (
            <div key={field} className="grid gap-1 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4">
              <dt className="text-xs font-medium text-ink-muted">
                <span className="block">{FIELD_LABELS[field]}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-ink-subtle">{field}</span>
              </dt>
              <dd className="text-sm text-ink whitespace-pre-wrap break-words">
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
            ? ' (known internal thesis framing for ATLAS-HYP-003).'
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

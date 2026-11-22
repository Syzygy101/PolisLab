import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import type { CompareSlot, CompareState } from '@/research/compareUrl';
import { compareHref } from '@/research/compareUrl';
import { isSafeHttpUrl } from '@/research/safeUrl';
import { AdmissibilityBadge } from './AdmissibilityBadge';
import { IdChipList } from './IdChip';
import { StatusBadge } from './StatusBadge';

const COMPARE_FIELDS: {
  key: keyof Claim;
  label: string;
}[] = [
  { key: 'exact_claim', label: 'Exact claim' },
  { key: 'status', label: 'Evidentiary status' },
  { key: 'what_source_establishes', label: 'What the source establishes' },
  { key: 'limitations_external_validity', label: 'Limitations / external validity' },
  {
    key: 'competing_mechanism_or_contrary_evidence',
    label: 'Competing mechanism or contrary evidence',
  },
  {
    key: 'admissible_in_policy_comparison',
    label: 'Admissibility in policy comparison',
  },
  { key: 'admissibility_conditions', label: 'Admissibility conditions' },
  {
    key: 'observation_that_would_alter_assessment',
    label: 'Observation that would alter assessment',
  },
  { key: 'primary_source_title', label: 'Source title' },
  { key: 'primary_source_url', label: 'Source URL' },
  { key: 'pinpoint', label: 'Pinpoint' },
];

interface CompareViewProps {
  state: CompareState;
  onSetSlot: (param: 'a' | 'b', claimId: string | null) => void;
}

export function CompareView({ state, onSetSlot }: CompareViewProps) {
  const { slotA, slotB, identicalIds, isCompleteDistinctPair } = state;

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Two-claim evidence comparison
        </h1>
        <p className="max-w-3xl text-sm text-ink-muted">
          Side-by-side inspection of original atlas fields for human comparison. This view does
          not adjudicate truth, detect contradictions, score confidence, or recommend policy.
        </p>
        {identicalIds ? (
          <p className="text-sm text-warn" role="status" data-testid="compare-identical-notice">
            Both slots use the same claim ID. Comparison requires two distinct claims — replace or
            clear one slot.
          </p>
        ) : null}
        {!isCompleteDistinctPair && !identicalIds ? (
          <p className="text-sm text-ink-muted" role="status">
            Select up to two distinct claim IDs. Shareable URL uses{' '}
            <span className="font-mono">a</span> and <span className="font-mono">b</span>{' '}
            parameters.
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <CompareSlotPanel
          slot={slotA}
          otherClaimId={slotB.rawId}
          onClear={() => onSetSlot('a', null)}
          onReplace={(id) => onSetSlot('a', id)}
        />
        <CompareSlotPanel
          slot={slotB}
          otherClaimId={slotA.rawId}
          onClear={() => onSetSlot('b', null)}
          onReplace={(id) => onSetSlot('b', id)}
        />
      </div>

      {slotA.claim || slotB.claim ? (
        <div className="space-y-3" data-testid="compare-fields">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Field-by-field comparison
          </h2>
          <div className="space-y-3">
            {COMPARE_FIELDS.map((field) => (
              <div
                key={field.key}
                className="grid gap-3 border border-line bg-paper-raised p-3 lg:grid-cols-[10rem_1fr_1fr]"
              >
                <p className="text-xs font-medium text-ink-muted">{field.label}</p>
                <CompareFieldValue claim={slotA.claim} field={field.key} />
                <CompareFieldValue claim={slotB.claim} field={field.key} />
              </div>
            ))}
            <div className="grid gap-3 border border-line bg-paper-raised p-3 lg:grid-cols-[10rem_1fr_1fr]">
              <p className="text-xs font-medium text-ink-muted">Mechanisms / outcomes / cases</p>
              <TagBundle claim={slotA.claim} />
              <TagBundle claim={slotB.claim} />
            </div>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-ink-subtle">
        Curated research pairs for acceptance testing (not hardcoded contradictions): EMP-001 vs
        EMP-002; EMP-005 vs HYP-004; LEG-001 vs LEG-002; HYP-001 vs POL-001.
      </p>
    </div>
  );
}

function CompareSlotPanel({
  slot,
  otherClaimId,
  onClear,
  onReplace,
}: {
  slot: CompareSlot;
  otherClaimId: string | null;
  onClear: () => void;
  onReplace: (claimId: string) => void;
}) {
  return (
    <section
      aria-label={`Comparison slot ${slot.param.toUpperCase()}`}
      className="space-y-3 border border-line bg-paper-raised p-4"
      data-testid={`compare-slot-${slot.param}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">
          Slot {slot.param.toUpperCase()}
          {slot.rawId ? (
            <span className="ml-2 font-mono text-xs font-normal text-ink-muted">{slot.rawId}</span>
          ) : null}
        </h2>
        <div className="flex flex-wrap gap-2">
          {slot.rawId ? (
            <button
              type="button"
              onClick={onClear}
              className="border border-line px-2 py-1 text-xs text-ink-muted hover:bg-neutral-soft"
            >
              Remove
            </button>
          ) : null}
          <Link
            to="/claims"
            className="border border-line px-2 py-1 text-xs text-ink no-underline hover:bg-neutral-soft"
          >
            Pick from explorer
          </Link>
        </div>
      </div>

      {slot.status === 'empty' ? (
        <EmptySlotForm
          param={slot.param}
          otherClaimId={otherClaimId}
          onReplace={onReplace}
        />
      ) : null}

      {slot.status === 'invalid' ? (
        <p className="text-sm text-warn" role="status">
          No atlas claim matches <span className="font-mono">{slot.rawId}</span>.
        </p>
      ) : null}

      {slot.claim ? (
        <div className="space-y-2">
          <p className="font-mono text-xs text-accent">
            <Link to={`/claims/${slot.claim.claim_id}`}>{slot.claim.claim_id}</Link>
          </p>
          <p className="text-sm leading-snug text-ink">{slot.claim.exact_claim}</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={slot.claim.status} />
            <AdmissibilityBadge value={slot.claim.admissible_in_policy_comparison} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function EmptySlotForm({
  param,
  otherClaimId,
  onReplace,
}: {
  param: 'a' | 'b';
  otherClaimId: string | null;
  onReplace: (claimId: string) => void;
}) {
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const id = String(data.get('claimId') ?? '').trim();
        if (id) {
          onReplace(id);
        }
      }}
    >
      <label htmlFor={`compare-input-${param}`} className="sr-only">
        Claim ID for slot {param}
      </label>
      <input
        id={`compare-input-${param}`}
        name="claimId"
        type="text"
        placeholder="e.g. ATLAS-EMP-001"
        className="min-w-[14rem] flex-1 border border-line bg-paper px-2 py-1.5 font-mono text-sm"
        defaultValue=""
      />
      <button
        type="submit"
        className="border border-accent bg-accent-soft px-3 py-1.5 text-sm text-accent"
      >
        Set claim
      </button>
      {otherClaimId ? (
        <p className="w-full text-xs text-ink-subtle">
          Other slot: <span className="font-mono">{otherClaimId}</span>. Suggested pairs use{' '}
          <Link
            to={compareHref({
              a: param === 'a' ? 'ATLAS-EMP-001' : otherClaimId,
              b: param === 'b' ? 'ATLAS-EMP-002' : otherClaimId,
            })}
            className="text-accent"
          >
            EMP-001 / EMP-002
          </Link>
          .
        </p>
      ) : null}
    </form>
  );
}

function CompareFieldValue({
  claim,
  field,
}: {
  claim: Claim | undefined;
  field: keyof Claim;
}) {
  if (!claim) {
    return <p className="text-sm text-ink-subtle">—</p>;
  }

  if (field === 'status') {
    return (
      <div className="space-y-1">
        <span className="font-mono text-xs">{claim.status}</span>
        <div>
          <StatusBadge status={claim.status} />
        </div>
      </div>
    );
  }

  if (field === 'admissible_in_policy_comparison') {
    return (
      <div className="space-y-1">
        <span className="font-mono text-xs">{claim.admissible_in_policy_comparison}</span>
        <div>
          <AdmissibilityBadge value={claim.admissible_in_policy_comparison} />
        </div>
      </div>
    );
  }

  if (field === 'primary_source_url') {
    const url = claim.primary_source_url.trim();
    if (!url) {
      return (
        <p className="text-sm text-ink-muted">
          No public primary URL
          {claim.claim_id === 'ATLAS-HYP-003' ? ' (ATLAS-HYP-003).' : '.'}
        </p>
      );
    }
    if (!isSafeHttpUrl(url)) {
      return <p className="break-all text-sm text-ink-muted">{url}</p>;
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-sm"
      >
        {url}
      </a>
    );
  }

  const value = claim[field];
  if (typeof value !== 'string' || value.trim() === '') {
    return <p className="text-sm text-ink-subtle">(empty)</p>;
  }
  return <p className="whitespace-pre-wrap break-words text-sm text-ink">{value}</p>;
}

function TagBundle({ claim }: { claim: Claim | undefined }) {
  if (!claim) {
    return <p className="text-sm text-ink-subtle">—</p>;
  }
  return (
    <div className="space-y-2 text-sm">
      <div>
        <span className="text-xs text-ink-subtle">Mechanisms </span>
        <IdChipList values={claim.mechanisms} linkMechanisms />
      </div>
      <div>
        <span className="text-xs text-ink-subtle">Outcomes </span>
        <IdChipList values={claim.outcomes} />
      </div>
      <div>
        <span className="text-xs text-ink-subtle">Cases </span>
        <IdChipList values={claim.cases} />
      </div>
      <div>
        <span className="text-xs text-ink-subtle">Literature </span>
        <IdChipList values={claim.literatureSources} />
      </div>
    </div>
  );
}

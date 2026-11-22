import { Link } from 'react-router-dom';
import type { ResearchRequirement } from '@/research/gapsSchema';
import { gapsHref } from '@/research/gapsUrl';
import type { CaseId } from '@/research/taxonomy';

function RequirementItems({
  requirements,
  emptyLabel,
}: {
  requirements: ResearchRequirement[];
  emptyLabel: string;
}) {
  if (requirements.length === 0) {
    return <p className="text-xs text-ink-subtle">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-1 text-xs">
      {requirements.map((req) => (
        <li key={req.id}>
          <Link
            to={`/gaps/${req.id}`}
            className="font-mono text-accent underline underline-offset-2"
          >
            {req.id}
          </Link>
          <span className="text-ink-muted"> — {req.curatedLabel}</span>
        </li>
      ))}
    </ul>
  );
}

/** Variant-specific requirements only (used in each comparison side column). */
export function VariantSpecificRequirements({
  requirements,
  variantId,
}: {
  requirements: ResearchRequirement[];
  variantId: string;
}) {
  return (
    <section className="space-y-2" data-testid={`comparison-gaps-${variantId}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Variant-specific research requirements
      </h3>
      <p className="text-[11px] text-ink-subtle">
        Shown only where the published source supports a variant link. Case-wide §9 items appear
        once in the shared panel when both variants are from the same case.
      </p>
      <RequirementItems
        requirements={requirements}
        emptyLabel="No variant-specific research requirements for this intervention."
      />
    </section>
  );
}

/** Cross-case: full case scope for one side (case-wide + variant-specific). */
export function CrossCaseSideRequirements({
  requirements,
  variantId,
  caseId,
}: {
  requirements: ResearchRequirement[];
  variantId: string;
  caseId: CaseId;
}) {
  return (
    <section className="space-y-2" data-testid={`comparison-gaps-${variantId}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Research requirements ({caseId})
      </h3>
      <p className="text-[11px] text-ink-subtle">
        Cross-case comparison: each side keeps its original case scope. No mutual exclusivity or
        shared research agenda is implied.
      </p>
      <RequirementItems
        requirements={requirements}
        emptyLabel={`No curated research requirements for ${caseId}.`}
      />
      <Link
        to={gapsHref({ cases: [caseId] })}
        className="text-xs text-accent underline underline-offset-2"
      >
        All {caseId} research requirements
      </Link>
    </section>
  );
}

/** Same-case shared case-wide §9 requirements (rendered once). */
export function SharedCaseWideRequirements({
  caseId,
  requirements,
}: {
  caseId: CaseId;
  requirements: ResearchRequirement[];
}) {
  return (
    <div className="space-y-2" data-testid="comparison-gaps-shared">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Shared case-wide research requirements ({caseId})
      </h3>
      <p className="text-[11px] text-ink-subtle">
        Displayed once for this case. Not assigned to a single intervention unless separately listed
        as variant-specific.
      </p>
      <RequirementItems
        requirements={requirements}
        emptyLabel="No case-wide research requirements recorded for this case."
      />
      <Link
        to={gapsHref({ cases: [caseId] })}
        className="text-xs text-accent underline underline-offset-2"
      >
        All {caseId} research requirements
      </Link>
    </div>
  );
}

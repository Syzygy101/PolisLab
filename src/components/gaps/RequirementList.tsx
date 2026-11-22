import { Link } from 'react-router-dom';
import { displayRequirementText } from '@/research/gapsParse';
import {
  OBSERVATION_ROLE_LABELS,
  RESEARCH_REQUIREMENT_TYPE_LABELS,
  type ResearchRequirement,
} from '@/research/gapsSchema';
import { requirementHref } from '@/research/gapsQueries';

export function RequirementList({
  requirements,
  returnSearch,
}: {
  requirements: ResearchRequirement[];
  returnSearch?: string;
}) {
  if (requirements.length === 0) {
    return (
      <p className="text-sm text-ink-muted" data-testid="gaps-empty">
        No research requirements match the current filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line border border-line bg-paper-raised" data-testid="gaps-requirement-list">
      {requirements.map((req) => {
        const to = returnSearch
          ? `${requirementHref(req.id)}?from=${encodeURIComponent(returnSearch)}`
          : requirementHref(req.id);
        return (
          <li key={req.id} className="px-4 py-3" data-testid={`gaps-req-${req.id}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link
                to={to}
                className="font-mono text-xs text-accent no-underline hover:underline"
              >
                {req.id}
              </Link>
              <span className="text-[11px] text-ink-subtle">
                {req.caseId} §9.{req.itemNumber} ·{' '}
                {RESEARCH_REQUIREMENT_TYPE_LABELS[req.requirementType]}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-ink">{req.curatedLabel}</p>
            <p className="mt-1 text-sm text-ink-muted">
              <span className="text-[11px] uppercase tracking-wide text-ink-subtle">
                Source:{' '}
              </span>
              {displayRequirementText(req.sourceText)}
            </p>
            <p className="mt-1 text-[11px] text-ink-subtle">
              Observation role: {OBSERVATION_ROLE_LABELS[req.observationRole]}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

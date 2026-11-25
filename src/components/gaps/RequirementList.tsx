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
      <p className="notice" data-testid="gaps-empty" role="status">
        No research requirements match the current filters. Clear a filter to see more of the
        published entries.
      </p>
    );
  }

  return (
    <ol className="req-list" data-testid="gaps-requirement-list">
      {requirements.map((req) => {
        const to = returnSearch
          ? `${requirementHref(req.id)}?from=${encodeURIComponent(returnSearch)}`
          : requirementHref(req.id);
        return (
          <li key={req.id} className="req-item" data-testid={`gaps-req-${req.id}`}>
            <div className="req-item-head">
              <Link to={to} className="id-link" style={{ fontWeight: 600 }}>
                {req.id}
              </Link>
              <span className="meta-line">
                {req.caseId} §9.{req.itemNumber} ·{' '}
                {RESEARCH_REQUIREMENT_TYPE_LABELS[req.requirementType]}
              </span>
            </div>
            <h3>{req.curatedLabel}</h3>
            <p className="req-source">
              <span className="req-source-label">Source wording</span>
              {displayRequirementText(req.sourceText)}
            </p>
            <p className="meta-line">
              Observation role: {OBSERVATION_ROLE_LABELS[req.observationRole]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

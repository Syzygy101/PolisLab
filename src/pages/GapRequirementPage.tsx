import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { RequirementDetailView } from '@/components/gaps/RequirementDetailView';
import {
  getResearchRequirement,
  isKnownRequirementId,
} from '@/research/gapsQueries';
import { gapsOverviewReturnHref } from '@/research/gapsUrl';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export type GapsReturnState = {
  gapsSearch?: string;
};

function gapsReturnHref(state: unknown, fromParam: string | null): string {
  if (fromParam && fromParam.length > 0) {
    return gapsOverviewReturnHref(fromParam);
  }
  if (state && typeof state === 'object') {
    const gapsSearch = (state as GapsReturnState).gapsSearch;
    if (typeof gapsSearch === 'string') {
      return gapsOverviewReturnHref(gapsSearch);
    }
  }
  return '/gaps';
}

export function GapRequirementPage() {
  const { requirementId } = useParams<{ requirementId: string }>();
  useDocumentTitle(requirementId ? requirementId : 'Research requirement');
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get('from');
  const returnHref = gapsReturnHref(location.state, fromParam);

  if (!requirementId || !isKnownRequirementId(requirementId)) {
    return (
      <div data-testid="requirement-not-found">
        <p className="page-kicker">Research gaps</p>
        <h1 className="page-title">Research requirement not found</h1>
        <p className="lede">
          No published §9 research requirement matches{' '}
          <span className="mono">{requirementId ?? '(missing id)'}</span>.
        </p>
        <Link to={returnHref} className="btn btn--secondary">
          Back to research gaps
        </Link>
      </div>
    );
  }

  const requirement = getResearchRequirement(requirementId)!;

  return (
    <div>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to={returnHref} data-testid="return-to-gaps">
          Research gaps
        </Link>
        <span aria-hidden="true">/</span>
        <span className="mono">{requirement.id}</span>
      </nav>
      <RequirementDetailView requirement={requirement} />
    </div>
  );
}

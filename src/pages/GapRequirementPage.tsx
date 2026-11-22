import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { RequirementDetailView } from '@/components/gaps/RequirementDetailView';
import {
  getResearchRequirement,
  isKnownRequirementId,
} from '@/research/gapsQueries';
import { gapsOverviewReturnHref } from '@/research/gapsUrl';

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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get('from');
  const returnHref = gapsReturnHref(location.state, fromParam);

  if (!requirementId || !isKnownRequirementId(requirementId)) {
    return (
      <div
        className="space-y-4 border border-dashed border-line-strong bg-paper-raised p-6"
        data-testid="requirement-not-found"
      >
        <h1 className="font-display text-2xl font-semibold text-ink">
          Research requirement not found
        </h1>
        <p className="text-sm text-ink-muted">
          No published §9 research requirement matches{' '}
          <span className="font-mono text-ink">{requirementId ?? '(missing id)'}</span>.
        </p>
        <Link to={returnHref} className="text-sm font-medium text-accent no-underline hover:underline">
          Back to Evidence Gaps
        </Link>
      </div>
    );
  }

  const requirement = getResearchRequirement(requirementId)!;

  return (
    <div className="space-y-4">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted"
      >
        <Link
          to={returnHref}
          className="no-underline hover:underline"
          data-testid="return-to-gaps"
        >
          Evidence Gaps
        </Link>
        <span>/</span>
        <span className="font-mono text-ink">{requirement.id}</span>
      </nav>
      <RequirementDetailView requirement={requirement} />
    </div>
  );
}

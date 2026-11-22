import { Link, useParams } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import { MechanismProfileView } from '@/components/mechanisms/MechanismProfileView';
import { isNavigableMechanismId } from '@/research/mechanismQueries';

export function MechanismDetailPage() {
  const { mechanismId } = useParams<{ mechanismId: string }>();

  if (!mechanismId || !isNavigableMechanismId(mechanismId)) {
    return (
      <div
        className="space-y-4 border border-dashed border-line-strong bg-paper-raised p-6"
        data-testid="mechanism-not-found"
      >
        <h1 className="font-display text-2xl font-semibold text-ink">Mechanism not found</h1>
        <p className="text-sm text-ink-muted">
          No published mechanism family or exact atlas submechanism matches{' '}
          <span className="font-mono text-ink">{mechanismId ?? '(missing id)'}</span>. Contextual
          subdivisions such as <span className="font-mono">M5a-1</span> are documented on the{' '}
          <Link to="/mechanisms/M5a#contextual-subdivisions" className="text-accent">
            M5a profile
          </Link>
          , not as standalone routes.
        </p>
        <Link to="/mechanisms" className="text-sm font-medium text-accent no-underline hover:underline">
          Back to Mechanism Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
        <Link to="/mechanisms" className="no-underline hover:underline">
          Mechanisms
        </Link>
        <span>/</span>
        <span className="font-mono text-ink">{mechanismId}</span>
      </nav>
      <MechanismProfileView mechanismId={mechanismId} claims={allClaims} />
    </div>
  );
}

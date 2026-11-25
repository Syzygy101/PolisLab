import { Link, useParams } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import { MechanismProfileView } from '@/components/mechanisms/MechanismProfileView';
import { isNavigableMechanismId } from '@/research/mechanismQueries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function MechanismDetailPage() {
  const { mechanismId } = useParams<{ mechanismId: string }>();
  useDocumentTitle(mechanismId ? `Mechanism ${mechanismId}` : 'Mechanism');

  if (!mechanismId || !isNavigableMechanismId(mechanismId)) {
    return (
      <div data-testid="mechanism-not-found">
        <p className="page-kicker">Mechanisms</p>
        <h1 className="page-title">Mechanism not found</h1>
        <p className="lede">
          No published mechanism family or exact atlas submechanism matches{' '}
          <span className="mono">{mechanismId ?? '(missing id)'}</span>. Contextual subdivisions
          such as <span className="mono">M5a-1</span> are documented on the{' '}
          <Link to="/mechanisms/M5a#contextual-subdivisions">M5a profile</Link>, not as standalone
          routes.
        </p>
        <Link to="/mechanisms" className="btn btn--secondary">
          Back to mechanisms
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/mechanisms">Mechanisms</Link>
        <span aria-hidden="true">/</span>
        <span className="mono">{mechanismId}</span>
      </nav>
      <MechanismProfileView mechanismId={mechanismId} claims={allClaims} />
    </div>
  );
}

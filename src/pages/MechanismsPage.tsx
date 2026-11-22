import { Link } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import { MechanismFamilyOverview } from '@/components/mechanisms/MechanismFamilyOverview';
import { MechanismOutcomeMatrix } from '@/components/mechanisms/MechanismOutcomeMatrix';
import { MechanismPathway } from '@/components/mechanisms/MechanismPathway';
import { MECHANISM_EXPLANATIONS } from '@/research/mechanismExplanations';
import { RELATION_TYPE_LABELS } from '@/research/mechanismProfiles';

export function MechanismsPage() {
  return (
    <div className="space-y-10" data-testid="mechanisms-page">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-semibold text-ink">Mechanism Explorer</h1>
        <p className="max-w-3xl text-sm text-ink-muted">
          Investigate the economic mechanisms, competing explanations, and outcome associations
          represented in the published research. This module distinguishes research metadata
          associations from hypothesised economic relationships and established causal effects. It
          is not a structural economic model, causal-inference engine, or calibrated simulator.
        </p>
        <p className="max-w-3xl text-xs text-ink-subtle">
          Relationship types used in this explorer:{' '}
          {Object.values(RELATION_TYPE_LABELS).join(' · ')}. Directed arrows are not used for
          generic metadata co-tagging.
        </p>
      </header>

      <MechanismFamilyOverview claims={allClaims} />

      <MechanismOutcomeMatrix claims={allClaims} />

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="font-display text-xl font-semibold text-ink">
            Conditional mechanism explanations
          </h2>
          <p className="max-w-3xl text-sm text-ink-muted">
            A small set of source-grounded pathways. Prefer these structured diagrams to an
            indiscriminate network graph. Each pathway states conditions, inferential limitations,
            and qualitative wording.
          </p>
        </div>
        <div className="space-y-4">
          {MECHANISM_EXPLANATIONS.map((explanation) => (
            <MechanismPathway key={explanation.id} explanation={explanation} />
          ))}
        </div>
      </section>

      <p className="text-sm text-ink-muted">
        Continue in the{' '}
        <Link to="/claims" className="text-accent no-underline hover:underline">
          Claims Explorer
        </Link>{' '}
        or{' '}
        <Link to="/casebook" className="text-accent no-underline hover:underline">
          Casebook
        </Link>{' '}
        for source evidence and case investigations.
      </p>
    </div>
  );
}

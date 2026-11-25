import { Link } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import { MechanismFamilyOverview } from '@/components/mechanisms/MechanismFamilyOverview';
import { MechanismOutcomeMatrix } from '@/components/mechanisms/MechanismOutcomeMatrix';
import { MechanismPathway, RelationChip } from '@/components/mechanisms/MechanismPathway';
import { MECHANISM_EXPLANATIONS } from '@/research/mechanismExplanations';
import { RELATION_TYPE_LABELS } from '@/research/mechanismProfiles';
import type { MechanismRelationType } from '@/research/mechanismProfiles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function MechanismsPage() {
  useDocumentTitle('Mechanisms');

  return (
    <div data-testid="mechanisms-page">
      <p className="page-kicker">Analysis</p>
      <h1 className="page-title">Mechanisms</h1>
      <p className="lede" style={{ maxWidth: '60rem' }}>
        Investigate the economic mechanisms, competing explanations, and outcome associations
        represented in the published research. This module distinguishes research metadata
        associations from hypothesised economic relationships and established causal effects. It is
        not a structural economic model, causal-inference engine, or calibrated simulator.
      </p>

      <section
        className="panel panel--muted"
        style={{ marginBottom: '1.5rem' }}
        aria-labelledby="relation-types-heading"
        data-testid="mechanism-relation-types"
      >
        <h2 id="relation-types-heading" className="panel-title">
          Relationship types used in this module
        </h2>
        <ul className="tag-list" style={{ marginBottom: '0.5rem' }}>
          {(Object.keys(RELATION_TYPE_LABELS) as MechanismRelationType[]).map((relation) => (
            <li key={relation}>
              <RelationChip relation={relation} />
            </li>
          ))}
        </ul>
        <p className="small-note">
          Directed arrows are not used for generic metadata co-tagging.
        </p>
      </section>

      <nav aria-label="On this page" style={{ marginBottom: '2rem' }}>
        <ul className="tag-list">
          <li>
            <a className="tag-link" href="#mechanism-families">
              Mechanism families
            </a>
          </li>
          <li>
            <a className="tag-link" href="#mechanism-matrix">
              Mechanism–outcome matrix
            </a>
          </li>
          <li>
            <a className="tag-link" href="#mechanism-pathways">
              Conditional explanations
            </a>
          </li>
        </ul>
      </nav>

      <div className="stack stack--loose">
        <MechanismFamilyOverview claims={allClaims} />

        <MechanismOutcomeMatrix claims={allClaims} />

        <section
          id="mechanism-pathways"
          className="stack"
          style={{ scrollMarginTop: '1.5rem' }}
          aria-labelledby="mechanism-pathways-heading"
        >
          <div>
            <h2 id="mechanism-pathways-heading" className="section-title">
              Conditional mechanism explanations
            </h2>
            <p className="small-note">
              A small set of source-grounded pathways. Prefer these structured diagrams to an
              indiscriminate network graph. Each pathway states conditions, inferential
              limitations, and qualitative wording.
            </p>
          </div>
          <div className="stack">
            {MECHANISM_EXPLANATIONS.map((explanation) => (
              <MechanismPathway key={explanation.id} explanation={explanation} />
            ))}
          </div>
        </section>

        <p className="small-note">
          Continue in the{' '}
          <Link to="/claims" className="underline underline-offset-2">
            Evidence library
          </Link>{' '}
          or the{' '}
          <Link to="/casebook" className="underline underline-offset-2">
            investigations
          </Link>{' '}
          for source evidence and case analysis.
        </p>
      </div>
    </div>
  );
}

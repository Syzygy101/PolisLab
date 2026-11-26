import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SourceRefList } from '@/components/comparison/SourceRefList';
import { compareVariants } from '@/research/comparisonQueries';
import { comparisonHref } from '@/research/comparisonUrl';
import { RESEARCH_CUTOFF, RESEARCH_RELEASE } from '@/research/constants';
import type { ResearchRequirement } from '@/research/gapsSchema';
import type { CaseId } from '@/research/taxonomy';
import { FIELD_GUIDE } from './content';
import { ACQUISITION, GUIDED_COMPARISONS, ROLLOUT, TRANSACTIONS, type EvidenceStep } from './investigations';

type GuidedCaseId = Exclude<CaseId, 'Case1'>;

const MECHANISM = {
  Case2: { heading: 'Which screening rules could apply?', instruction: 'Choose an investor and a transaction. The published baseline is dated to the research cutoff.', group: 'Transaction' },
  Case3: { heading: 'How did investment and openings line up?', instruction: 'Choose a state and follow the milestones of ALDI’s expansion. Spacing shows order, with dates printed on each step.', group: 'Rollout milestones' },
  Case4: { heading: 'What can each record establish?', instruction: 'Inspect the administrative routes and the later observations separately. The pathway can end before completion or opening.', group: 'Acquisition milestones' },
} as const;

function EvidenceInspector({ step }: { step: EvidenceStep }) {
  return (
    <div id="guided-observation" className="site-inspector">
      <p className="sr-only" role="status">Selected evidence · {step.label} {step.context}</p>
      {step.context && <p className="site-kicker">{step.context}</p>}
      <h3>{step.heading}</h3>
      <p>{step.summary}</p>
      <p><strong>Evidence limit.</strong> {step.limit}</p>
      <details key={step.heading}>
        <summary>Sources and technical detail</summary>
        <a href={`#section-${step.section}`}>Read the published casebook section</a>
        {step.claim && <Link to={`/claims/${step.claim}`}>Open the cited atlas claim <span className="mono">{step.claim}</span></Link>}
      </details>
    </div>
  );
}

export function GuidedInvestigation({ caseId, requirements }: {
  caseId: GuidedCaseId;
  requirements: readonly ResearchRequirement[];
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const guide = FIELD_GUIDE[caseId];
  const mechanism = MECHANISM[caseId];
  const comparison = GUIDED_COMPARISONS[caseId];
  const { a, b, shared } = compareVariants(comparison.a, comparison.b);
  const government = params.get('investor') === 'government';
  const western = params.get('state') === 'wa';
  const steps: readonly EvidenceStep[] = caseId === 'Case2'
    ? TRANSACTIONS[government ? 'government' : 'private']
    : caseId === 'Case3' ? ROLLOUT[western ? 'wa' : 'sa'] : ACQUISITION;
  const active = steps.find(({ id }) => id === params.get('step')) ?? steps[0];

  function select(key: 'investor' | 'state' | 'step', value: string) {
    if (params.get(key) === value) return;
    params.set(key, value);
    if (key === 'investor') params.delete('step');
    navigate({ search: params.toString(), hash: location.hash }, { preventScrollReset: true });
  }

  return (
    <div className="site-lab" data-testid={`guided-${caseId}`}>
      <header className="site-lab-header">
        <p className="site-kicker">{guide.topic}</p>
        <h1>{guide.question}</h1>
        <p>{guide.description}</p>
      </header>
      <nav className="site-lab-nav" aria-label="Investigation guide">
        <a href="#guided-investigation">Explore the evidence</a>
        <a href="#guided-comparison">Compare approaches</a>
        <a href="#guided-evidence">Follow the evidence</a>
        <a href="#published-investigation">Published investigation</a>
      </nav>
      <section id="guided-investigation" className="site-room" aria-labelledby="guided-investigation-heading">
        <div className="site-room-header">
          <h2 id="guided-investigation-heading">{mechanism.heading}</h2>
          <p>{mechanism.instruction}</p>
        </div>
        {caseId === 'Case2' && (
          <div className="site-mode-switch" role="group" aria-label="Investor type">
            <button type="button" aria-pressed={!government} onClick={() => select('investor', 'private')}>Private investor</button>
            <button type="button" aria-pressed={government} onClick={() => select('investor', 'government')}>Foreign government investor</button>
          </div>
        )}
        {caseId === 'Case3' && (
          <div className="site-mode-switch" role="group" aria-label="Expansion state">
            <button type="button" aria-pressed={!western} onClick={() => select('state', 'sa')}>South Australia</button>
            <button type="button" aria-pressed={western} onClick={() => select('state', 'wa')}>Western Australia</button>
          </div>
        )}
        <div className={`site-investigation-grid guide-workbench guide-workbench--${caseId}`}>
          <div className="guide-steps" role="group" aria-label={mechanism.group}>
            {steps.map((step) => (
              <button key={step.id} type="button" aria-pressed={active.id === step.id}
                aria-controls="guided-observation" onClick={() => select('step', step.id)}>
                {step.context && <span>{step.context}</span>}
                <strong>{step.label}</strong>
              </button>
            ))}
          </div>
          <EvidenceInspector step={active} />
        </div>
        <p className="site-boundary">Published research {RESEARCH_RELEASE} · cutoff {RESEARCH_CUTOFF}</p>
      </section>

      <section id="guided-comparison" className="site-room site-room--comparison" aria-labelledby="guided-comparison-heading">
        <div className="site-room-header">
          <h2 id="guided-comparison-heading">{comparison.question}</h2>
          <p>{comparison.summary}</p>
        </div>
        <div className="site-policy-grid">
          {[a, b].map((side, index) => side && (
            <article key={side.variant.id}>
              <h3>{comparison.labels[index]}</h3>
              <details className="guide-disclosure">
                <summary>Published definition and sources</summary>
                <p>{side.variant.definition}</p>
                <ul className="site-policy-evidence">
                  {side.variant.conditions.map((condition) => <li key={condition}>{condition}</li>)}
                </ul>
                <SourceRefList sources={side.variant.sources} />
              </details>
            </article>
          ))}
        </div>
        {shared && shared.pathways.length > 0 && (
          <details className="guide-disclosure guide-shared">
            <summary>Plausible pathways assessed across the case</summary>
            <ul className="site-policy-evidence">
              {shared.pathways.map((pathway) => (
                <li key={pathway.id}>
                  <p>{pathway.summary}</p>
                  <SourceRefList sources={pathway.sources} roleNote="References include evidence that limits the pathway." />
                </li>
              ))}
            </ul>
          </details>
        )}
        <div className="site-comparison-links">
          <a href="#section-2">Read the dated legal baseline</a>
          <Link to={comparisonHref({ a: comparison.a, b: comparison.b })}>Open the full policy comparison</Link>
        </div>
      </section>

      <section id="guided-evidence" className="site-room site-room--evidence" aria-labelledby="guided-evidence-heading">
        <div className="site-room-header">
          <h2 id="guided-evidence-heading">What would change the answer?</h2>
          <p>Explore the observations the published investigation calls for.</p>
        </div>
        <div className="site-evidence-list">
          {requirements.map((requirement) => (
            <details key={requirement.id}>
              <summary>{requirement.curatedLabel}</summary>
              <p>{requirement.sourceText.trim()}</p>
              <p>{requirement.remainsUncertain}</p>
              <p>{requirement.qualification}</p>
              <Link to={`/gaps/${requirement.id}`}>Open the research requirement</Link>
            </details>
          ))}
        </div>
        <div className="site-comparison-links">
          <a href="#section-1">Read the published investigation</a>
          <a href="#cited-evidence">Inspect its cited evidence</a>
        </div>
      </section>
    </div>
  );
}

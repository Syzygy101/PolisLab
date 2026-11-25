import { Link, useLocation, useNavigate } from 'react-router-dom';
import { findClaimById } from '@/data/researchDataset';
import { SourceRefList } from '@/components/comparison/SourceRefList';
import { compareVariants } from '@/research/comparisonQueries';
import { comparisonHref } from '@/research/comparisonUrl';
import { RESEARCH_CUTOFF, RESEARCH_RELEASE } from '@/research/constants';
import { STATUS_LABELS } from '@/research/taxonomy';
import type { ResearchRequirement } from '@/research/gapsSchema';
import { CASE_ONE_QUESTION, CaseOneSitePlan } from './CaseOneSitePlan';

const EXPLANATIONS = [
  {
    id: 'viability',
    title: 'Site viability',
    heading: 'There may be too few viable sites.',
    summary: 'A supermarket needs suitable space, access and enough local demand. An empty parcel can be a poor fit for a particular retailer or format.',
    observation: 'Find the sites retailers could actually have used, including sites they considered and rejected.',
    claimId: 'ATLAS-EMP-003',
    claimLabel: 'ACCC findings on entry barriers',
    requirementId: 'REQ-C1-03',
  },
  {
    id: 'permission',
    title: 'Planning permission',
    heading: 'The project may still face development barriers.',
    summary: 'Rezoning, consent, remediation or centre design can take time even where the site could support a store.',
    observation: 'Trace dated permissions and development milestones, then compare projects exposed to different administrative timing.',
    claimId: 'ATLAS-GAP-001',
    claimLabel: 'The Australian evidence gap on planning and holding',
    requirementId: 'REQ-C1-03',
  },
  {
    id: 'waiting',
    title: 'Waiting to invest',
    heading: 'Waiting may be a commercial decision.',
    summary: 'An operator may keep the option to build while it waits for demand or cost conditions to improve. Opening a store commits spending that can be difficult to recover.',
    observation: 'Compare the commercial conditions the operator faced with its actual commitments and timing. The duration of vacancy alone cannot reveal why it waited.',
    claimId: 'ATLAS-EMP-002',
    claimLabel: 'What the ACCC inquiry did and did not determine',
    requirementId: 'REQ-C1-01',
  },
  {
    id: 'control',
    title: 'Site control',
    heading: 'Control could prevent a rival from getting access.',
    summary: 'A lease, option or restrictive covenant can keep a rival from using a viable site. Ordinary investment delay and site scarcity remain competing explanations.',
    observation: 'Verify who held control, whether a viable rival wanted the site, and whether a restriction actually blocked access.',
    claimId: 'ATLAS-HYP-001',
    claimLabel: 'The strategic foreclosure hypothesis',
    requirementId: 'REQ-C1-01',
  },
] as const;

const POLICY_VIEWS = [
  { id: 'help', label: 'How it could help', polarity: 'favourable' },
  { id: 'fail', label: 'Where it could fail', polarity: 'unfavourable' },
  { id: 'null', label: 'If little changes', polarity: 'null_path' },
  { id: 'evidence', label: 'Evidence needed', polarity: null },
] as const;

const COMPARE = compareVariants('C1-VAR-R', 'C1-VAR-E');
const COMPARISON_LINK = comparisonHref({ a: 'C1-VAR-R', b: 'C1-VAR-E' });

const POLICIES = [
  {
    title: 'Develop or release',
    definition: 'Require the controller of a qualifying site to develop it by a deadline or release control through an open process.',
    help: 'A viable site could become available to a rival if strategic holding was blocking access and the rival subsequently opened.',
    fail: 'The deadline could cut short useful waiting or lead to premature development. Planning might still block a store, or an incumbent might take the site again.',
    null: 'Little may change where rivals cannot use the sites, incumbents win the release process, or the mix of operators and prices stays the same.',
    side: COMPARE.a,
  },
  {
    title: 'Restrict exclusivity',
    definition: 'Limit or prohibit clauses that prevent rival grocery use of a site or centre, subject to transitional carve-outs.',
    help: 'A rival could gain access if an exclusive contract was the barrier and the landlord still developed the centre.',
    fail: 'A landlord could shelve development if exclusivity helped make it viable. A controller might shift from contracts to ownership or options.',
    null: 'Little may change where exclusivity was already constrained, another barrier was binding, or centres are redesigned around it.',
    side: COMPARE.b,
  },
] as const;

export function CaseOneLab({ requirements }: { requirements: readonly ResearchRequirement[] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const explanation = EXPLANATIONS.find(({ id }) => id === params.get('site')) ?? EXPLANATIONS[0];
  const view = POLICY_VIEWS.find(({ id }) => id === params.get('lens')) ?? POLICY_VIEWS[0];
  const claim = findClaimById(explanation.claimId);
  const observation = requirements.find(({ id }) => id === explanation.requirementId);

  function select(key: 'site' | 'lens', value: string) {
    if (params.get(key) === value) return;
    params.set(key, value);
    navigate({ search: params.toString(), hash: location.hash }, { preventScrollReset: true });
  }

  return (
    <div className="site-lab">
      <header className="site-lab-header">
        <p className="site-kicker">Undeveloped supermarket sites</p>
        <h1>{CASE_ONE_QUESTION}</h1>
        <p>Explore why an unused site may not become a store, then compare two proposals for changing who can use it.</p>
      </header>
      <nav className="site-lab-nav" aria-label="Site investigation">
        <a href="#site-investigation">Examine the site</a>
        <a href="#site-comparison">Compare proposals</a>
        <a href="#site-evidence">Follow the evidence</a>
      </nav>

      <section id="site-investigation" className="site-room" aria-labelledby="site-investigation-heading">
        <div className="site-room-header">
          <h2 id="site-investigation-heading">Why might a site stay empty?</h2>
          <p>Choose an explanation to see what you would need to check. Several can apply at once.</p>
        </div>
        <div className="site-investigation-grid">
          <CaseOneSitePlan focus={explanation.id}>
            <div className="site-plan-controls" role="group" aria-label="Competing explanations">
              {EXPLANATIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`site-pin site-pin--${item.id}`}
                  aria-pressed={explanation.id === item.id}
                  aria-controls="site-explanation"
                  onClick={() => select('site', item.id)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </CaseOneSitePlan>
          <div id="site-explanation" className="site-inspector">
            <p className="sr-only" role="status">Selected explanation · {explanation.title}</p>
            <p className="site-kicker">{explanation.title}</p>
            <h3>{explanation.heading}</h3>
            <p>{explanation.summary}</p>
            <h4>What you would check</h4>
            <p>{explanation.observation}</p>
            {observation && <Link to={`/gaps/${observation.id}`}>Read the published research requirement</Link>}
            {claim && (
              <details key={claim.claim_id}>
                <summary>Evidence and limits</summary>
                <p><strong>{STATUS_LABELS[claim.status]}.</strong> {claim.limitations_external_validity}</p>
                <p>{claim.admissibility_conditions}</p>
                <Link to={`/claims/${claim.claim_id}`}>{explanation.claimLabel}</Link>
                {explanation.id === 'waiting' && <a href="#section-4">Read the casebook on the option to wait</a>}
              </details>
            )}
          </div>
        </div>
        <p className="site-boundary">
          The {RESEARCH_RELEASE} evidence does not establish which explanation predominates, whether a rival would open, or what shoppers would pay.
        </p>
      </section>

      <section id="site-comparison" className="site-room site-room--comparison" aria-labelledby="site-comparison-heading">
        <div className="site-room-header">
          <h2 id="site-comparison-heading">Could a change in site rules help a rival open?</h2>
          <p>Compare two hypothetical proposals against the Australian baseline at the {RESEARCH_CUTOFF} research cutoff.</p>
        </div>
        <p className="site-boundary">These are qualitative pathways. The published research cannot rank the proposals or infer a welfare gain from site access alone.</p>
        <div className="site-mode-switch" role="group" aria-label="Comparison lens">
          {POLICY_VIEWS.map((item) => (
            <button key={item.id} type="button" aria-pressed={view.id === item.id} aria-controls="site-policy-pair" onClick={() => select('lens', item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="sr-only" role="status">Comparison lens · {view.label}</p>
        <div id="site-policy-pair" className="site-policy-grid">
          {POLICIES.map((policy) => {
            const viewRequirements = requirements.filter(({ comparisonVariantIds }) =>
              comparisonVariantIds?.some((id) => id === policy.side?.variant.id),
            );
            return (
              <article key={policy.title}>
                <h3>{policy.title}</h3>
                <p>{policy.definition}</p>
                {view.id === 'evidence' ? (
                  <ul className="site-policy-evidence">
                    {viewRequirements.map((item) => (
                      <li key={item.id}><Link to={`/gaps/${item.id}`}>{item.sourceText.trim()}</Link></li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <p className="site-policy-result">{policy[view.id]}</p>
                    <details key={view.id}>
                      <summary>Published pathways and citations</summary>
                      <ul className="site-policy-evidence">
                        {policy.side?.pathways.filter((item) => item.polarity === view.polarity).map((item) => (
                          <li key={item.id}>
                            <p>{item.summary}</p>
                            <SourceRefList sources={item.sources} roleNote="References include evidence that limits the pathway." />
                          </li>
                        ))}
                      </ul>
                    </details>
                  </>
                )}
              </article>
            );
          })}
        </div>
        <div className="site-comparison-links">
          <a href="#section-2">Read the dated legal baseline</a>
          <Link to={COMPARISON_LINK}>Open the full policy comparison</Link>
        </div>
      </section>

      <section id="site-evidence" className="site-room site-room--evidence" aria-labelledby="site-evidence-heading">
        <div className="site-room-header">
          <h2 id="site-evidence-heading">What would change the answer?</h2>
          <p>These are the published research requirements for this investigation.</p>
        </div>
        <div className="site-evidence-list">
          {requirements.map((item) => (
            <details key={item.id}>
              <summary>{item.sourceText.trim()}</summary>
              <p>{item.remainsUncertain}</p>
              <p>{item.qualification}</p>
              <Link to={`/gaps/${item.id}`}>Open requirement {item.id}</Link>
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

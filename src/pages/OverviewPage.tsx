import { version as appVersion } from '../../package.json';
import { Link } from 'react-router-dom';
import { FIELD_GUIDE, RESEARCH_MODULES } from '@/components/field-guide/content';
import { researchDataset, findClaimById } from '@/data/researchDataset';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';
import { computeResearchCoverage } from '@/research/coverage';
import { GAPS_REGISTRY } from '@/research/gapsRequirements';
import {
  RESEARCH_BOUNDARIES,
  RESEARCH_INSIGHTS,
} from '@/research/overviewContent';
import {
  INSTITUTIONAL_LAYERS,
  MECHANISM_FAMILIES,
  RESEARCH_CASES,
  STATUS_LABELS,
} from '@/research/taxonomy';
import { claimsExplorerHref } from '@/research/urlFilters';
import { gapsHref } from '@/research/gapsUrl';
import { ProgrammeVisual } from '@/components/overview/ProgrammeVisual';
import { StatusDistribution } from '@/components/overview/StatusDistribution';
import { OutcomeStageExplorer } from '@/components/overview/OutcomeStageExplorer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const SECTION_NAV = [
  { href: '#policy-investigations', label: 'Investigations' },
  { href: '#scope-methodology', label: 'Scope' },
  { href: '#how-to-investigate', label: 'How to investigate' },
  { href: '#evidence-composition', label: 'Evidence' },
  { href: '#research-insights', label: 'Insights' },
  { href: '#outcome-stages', label: 'Outcomes O1–O6' },
  { href: '#institutional-layers', label: 'Methodology' },
  { href: '#research-boundaries', label: 'Boundaries' },
  { href: '#research-provenance', label: 'Provenance' },
] as const;

const CLAIM_ID_LINK_CLASS =
  'inline-flex border border-accent/30 bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] text-accent no-underline hover:border-accent hover:underline';

export function OverviewPage() {
  useDocumentTitle('Research Overview');
  const { provenance, claims } = researchDataset;
  const coverage = computeResearchCoverage(claims);
  const requirementCount = GAPS_REGISTRY.requirements.length;

  return (
    <article data-testid="overview-page">
      <header className="field-guide-hero" aria-labelledby="orientation-heading">
        <div>
          <p className="site-kicker">Australian grocery competition</p>
          <h1 id="orientation-heading">PolisLab Research Laboratory</h1>
          <p className="field-guide-deck">
            Investigate how supermarkets gain access to sites, enter new markets and compete.
            Follow the published evidence from policy rules to the outcomes that can be verified.
          </p>
          <div className="field-guide-actions">
            <a href="#policy-investigations" className="field-guide-action" data-testid="overview-enter">
              Explore the investigations
            </a>
            <Link to="/claims" data-testid="overview-evidence-library">Open evidence library</Link>
          </div>
        </div>
        <nav className="lab-index" aria-label="Research tools">
          <h2>Research tools</h2>
          <ul>
            {RESEARCH_MODULES.map(({ title, href, description }) => (
              <li key={href}>
                <Link to={href}><strong>{title}</strong><span>{description}</span></Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <hr className="hairline" />

      {/* B. Programme and four policy investigations */}
      <section
        id="policy-investigations"
        className="scroll-mt-6"
        aria-labelledby="programme-heading"
      >
        <h2 id="programme-heading" className="section-title">
          Australian grocery competition research programme
        </h2>
        <p className="lede" style={{ marginBottom: '1rem' }}>
          Four published investigations examine how site control, foreign investment screening,
          differentiated entry, and acquisition oversight interact with rival market access —
          each with dated institutional baselines and explicit limits on inference.
        </p>
        <ol className="investigation-list field-guide-cards">
          {RESEARCH_CASES.map((researchCase) => {
            const cited = coverage.caseMembershipCounts[researchCase.id];
            const guide = FIELD_GUIDE[researchCase.id];
            return (
              <li
                key={researchCase.id}
                className="investigation-item"
                data-testid={`case-card-${researchCase.id}`}
              >
                <p className="site-kicker">{guide.topic}</p>
                <h3>{guide.question}</h3>
                <p>{guide.description}</p>
                <details className="guide-disclosure">
                  <summary>Published scope and citations</summary>
                  <p>{researchCase.researchQuestion}</p>
                  <p className="meta-line">
                    {researchCase.title !== guide.topic && <><span>{researchCase.title}</span> · </>}
                    {researchCase.id} · Direct cited claims{' '}
                    <strong data-testid={`case-count-${researchCase.id}`}>{cited}</strong>
                    {' · '}{researchCase.themes.join(' · ')}
                  </p>
                </details>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/casebook/${researchCase.id}`}
                    className="btn btn--secondary"
                    data-testid={`case-investigate-link-${researchCase.id}`}
                  >
                    {researchCase.id === 'Case1' ? 'Investigate the site' : 'Open investigation'}
                  </Link>
                  <Link
                    to={claimsExplorerHref({ cases: [researchCase.id] })}
                    className="btn btn--ghost"
                    data-testid={`case-claims-link-${researchCase.id}`}
                  >
                    Inspect cited claims
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="meta-line">
          Direct citation membership (including applicable common rules) — not exhaustive
          relevance. Memberships overlap; do not sum them as unique claims. Open each complete
          case investigation in the Casebook, or inspect its cited claims in the Evidence
          library.
        </p>

        <p className="meta-line" data-testid="case-membership-note">
          Sum of direct memberships: {coverage.summedCaseMemberships}; unique claims with any case
          tag: {coverage.uniqueCaseMembers}.
        </p>
      </section>

      <hr className="hairline" />

      <section className="lab-roadmap" aria-labelledby="lab-roadmap-heading">
        <h2 id="lab-roadmap-heading" className="section-title">Future research workspaces</h2>
        <p>
          The <Link to="/sandbox" className="underline underline-offset-2">Analytical Sandbox</Link>
          {' '}is planned for approved assumption tests.
          A spatial Simulation Studio would build on validated site and network evidence.
          Both workspaces are planned capabilities.
        </p>
      </section>

      <ProgrammeVisual claimCount={coverage.claimCount} requirementCount={requirementCount} />

      {/* C. Scope, methodology, dated evidence */}
      <section
        id="scope-methodology"
        className="scroll-mt-6"
        aria-labelledby="scope-heading"
      >
        <h2 id="scope-heading" className="section-title">
          Scope, methodology, and limitations
        </h2>
        <p className="site-kicker">Independent economic research laboratory</p>
        <p className="meta-line" data-testid="overview-version-line">
          Research Overview · app v{appVersion} · research {RESEARCH_RELEASE}
        </p>
        <p>
          PolisLab publishes source-grounded evidence on Australian grocery competition and
          related institutional rules, with tools for investigating competing explanations.
        </p>
        <div
          className="coverage-strip"
          role="group"
          aria-label="Published coverage measures"
          data-testid="coverage-strip"
        >
          <div className="coverage-item">
            <strong>{coverage.claimCount}</strong>
            <span>published claims</span>
          </div>
          <div className="coverage-item">
            <strong>{coverage.caseCount}</strong>
            <span>policy investigations</span>
          </div>
          <div className="coverage-item">
            <strong>{requirementCount}</strong>
            <span>research-requirement entries</span>
          </div>
        </div>
        <p className="meta-line">
          Coverage measures for the {RESEARCH_RELEASE} evidence baseline — not success metrics.
          Evidence cutoff {RESEARCH_CUTOFF}; correction pass {RESEARCH_CORRECTION_PASS}.
          Application development v0.2 is separate from the research release.
        </p>
        <p style={{ maxWidth: '68ch', color: 'var(--color-ink-muted)' }}>
          Evidence is dated to the published cutoff. Claims retain source pinpoints,
          admissibility conditions, and competing mechanisms. Policy comparison is qualitative:
          pathways and outcome assessments are not probabilities, welfare forecasts, or policy
          rankings. Full casebook source and methodology remain available for verification.
        </p>
        <p style={{ maxWidth: '68ch', color: 'var(--color-ink-muted)' }}>
          PolisLab is an interactive research laboratory over a dated Australian
          grocery-competition evidence synthesis. Inspect claims, case investigations,
          mechanisms, qualitative policy variants and research requirements — without treating
          this as a calibrated simulator, legal advice, policy-ranking tool or original causal
          study.
        </p>
        <p className="meta-line" style={{ maxWidth: '68ch' }}>
          Research baseline {RESEARCH_RELEASE} · evidence cutoff {RESEARCH_CUTOFF} · correction
          pass {RESEARCH_CORRECTION_PASS}. Application development v0.2 is separate from the
          research release.
        </p>
        <div className="flex flex-wrap gap-3" style={{ marginTop: '1rem' }}>
          <Link to="/casebook/source" className="btn btn--secondary">
            Methodology &amp; full source
          </Link>
          <Link to="/gaps" className="btn btn--ghost">
            Research gaps ({requirementCount})
          </Link>
          <a href="#research-provenance" className="btn btn--ghost">
            Research provenance
          </a>
        </div>
      </section>

      <nav
        aria-label="On this page"
        className="flex flex-wrap gap-x-3 gap-y-1 border-y border-line py-2 text-sm"
        style={{ marginTop: '2rem' }}
        data-testid="overview-section-nav"
      >
        {SECTION_NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-accent underline underline-offset-2"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <hr className="hairline" />

      {/* D. How to investigate — access to the full workspace */}
      <section
        id="how-to-investigate"
        className="scroll-mt-6"
        aria-labelledby="how-heading"
      >
        <h2 id="how-heading" className="section-title">
          How to investigate
        </h2>
        <p className="lede" style={{ marginBottom: '1rem' }}>
          Start from a policy case, then move between evidence and institutional pathways. Each
          workspace module serves a different job.
        </p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="space-y-1 border-t border-line pt-2">
            <dt className="font-medium text-ink">
              <Link to="/casebook" className="text-accent underline underline-offset-2">
                Investigations (Casebook)
              </Link>
            </dt>
            <dd className="text-ink-muted">
              The four complete policy-case investigations, with methodology and the full
              casebook source.
            </dd>
          </div>
          <div className="space-y-1 border-t border-line pt-2">
            <dt className="font-medium text-ink">
              <Link to="/claims" className="text-accent underline underline-offset-2">
                Evidence library
              </Link>
              {' · '}
              evidence comparison
            </dt>
            <dd className="text-ink-muted">
              Filter, open and compare atlas claims side by side (status, admissibility, sources).
              Shareable filter URLs preserve the evidence subset.
            </dd>
          </div>
          <div className="space-y-1 border-t border-line pt-2">
            <dt className="font-medium text-ink">
              <Link to="/comparison" className="text-accent underline underline-offset-2">
                Policy Comparison Laboratory
              </Link>
            </dt>
            <dd className="text-ink-muted">
              Compare qualitative intervention variants and baselines from the casebook — not a
              second claim-compare engine, and not a ranking of policy winners.
            </dd>
          </div>
          <div className="space-y-1 border-t border-line pt-2">
            <dt className="font-medium text-ink">
              <Link to="/mechanisms" className="text-accent underline underline-offset-2">
                Mechanism Explorer
              </Link>
            </dt>
            <dd className="text-ink-muted">
              Inspect M1–M6 families, competing explanations and outcome associations.
            </dd>
          </div>
          <div className="space-y-1 border-t border-line pt-2">
            <dt className="font-medium text-ink">
              <Link to="/gaps" className="text-accent underline underline-offset-2">
                Evidence Gaps
              </Link>
            </dt>
            <dd className="text-ink-muted">
              Nineteen published casebook §9 research requirements — what would change an
              assessment, including legal verification versus empirical falsification.
            </dd>
          </div>
        </dl>
      </section>

      <hr className="hairline" />

      {/* E. Research coverage detail */}
      <section className="scroll-mt-6" aria-labelledby="coverage-heading" id="research-coverage">
        <h2 id="coverage-heading" className="section-title">
          Research coverage
        </h2>
        <p className="meta-line" style={{ maxWidth: '68ch' }}>
          Coverage of the published release — not policy performance, confidence scores, or
          evidence-strength ratings.
        </p>
        <dl
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          data-testid="coverage-metrics"
        >
          <CoverageStat label="Published claims" value={coverage.claimCount} hint="Atlas rows" />
          <CoverageStat label="Policy cases" value={coverage.caseCount} hint="Casebook investigations" />
          <CoverageStat
            label="Mechanism families"
            value={coverage.mechanismFamilyCount}
            hint="M1–M6 taxonomy"
          />
          <CoverageStat
            label="Outcome stages"
            value={coverage.outcomeStageCount}
            hint="O1–O6 taxonomy"
          />
        </dl>
        <p className="meta-line">
          {MECHANISM_FAMILIES.map((m) => `${m.id} ${m.shorthand}`).join(' · ')}
        </p>
      </section>

      <hr className="hairline" />

      {/* F. Evidence composition */}
      <section
        id="evidence-composition"
        className="scroll-mt-6 space-y-3"
        aria-labelledby="evidence-heading"
      >
        <h2 id="evidence-heading" className="section-title">
          Evidence composition
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
          Distribution across published status classifications (
          {CLAIM_STATUSES_READABLE}). Machine-readable codes remain available on hover.
        </p>
        <StatusDistribution counts={coverage.statusCounts} total={coverage.claimCount} />
      </section>

      <hr className="hairline" />

      {/* G. What the research supports */}
      <section
        id="research-insights"
        className="scroll-mt-6 space-y-4"
        aria-labelledby="insights-heading"
      >
        <h2 id="insights-heading" className="section-title">
          What the research supports
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
          Source-linked synthesis themes — not verbatim claim text and not a policy ranking.
          Citations sit with the proposition they support. Limitations stay visible.
        </p>
        <ol className="space-y-5">
          {RESEARCH_INSIGHTS.map((insight, index) => (
            <li
              key={insight.id}
              className="space-y-3 border-t border-line pt-4 first:border-t-0 first:pt-0"
              data-testid={`insight-${insight.id}`}
            >
              <h3 className="font-display text-base font-semibold text-ink">
                <span className="text-ink-subtle">{index + 1}.</span> {insight.title}
              </h3>
              <p className="text-xs text-ink-subtle">{insight.evidenceReading}</p>
              <ul className="space-y-3">
                {insight.propositions.map((proposition) => (
                  <li key={proposition.text.slice(0, 48)} className="space-y-1.5">
                    <p className="text-sm leading-relaxed text-ink">{proposition.text}</p>
                    <ul className="flex flex-wrap gap-2">
                      {proposition.claimIds.map((claimId) => {
                        const claim = findClaimById(claimId);
                        return (
                          <li key={claimId}>
                            <Link
                              to={`/claims/${claimId}`}
                              className={CLAIM_ID_LINK_CLASS}
                              title={claim?.exact_claim.slice(0, 140)}
                            >
                              {claimId}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-ink-muted">
                <span className="font-medium text-ink">Limitation: </span>
                {insight.limitation}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <hr className="hairline" />

      {/* H. Interactive O1–O6 framework */}
      <section
        id="outcome-stages"
        className="scroll-mt-6 space-y-3"
        aria-labelledby="outcomes-heading"
      >
        <h2 id="outcomes-heading" className="section-title">
          Interactive O1–O6 framework
        </h2>
        <OutcomeStageExplorer claims={claims} />
      </section>

      <hr className="hairline" />

      {/* I. Institutional layers */}
      <section
        id="institutional-layers"
        className="scroll-mt-6 space-y-4"
        aria-labelledby="layers-heading"
      >
        <h2 id="layers-heading" className="section-title">
          Institutional layers
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
          Casebook methodology. Layers cannot be inferred from evidence status alone. Layer C and
          Layer D are not existing legal rights or duties.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {INSTITUTIONAL_LAYERS.map((layer) => (
            <article
              key={layer.id}
              className="space-y-2 border-t border-line pt-3"
              data-testid={`layer-${layer.id}`}
            >
              <h3 className="text-sm font-semibold text-ink">
                Layer {layer.id} — {layer.label}
              </h3>
              <p className="text-sm text-ink-muted">{layer.meaning}</p>
              <p className="text-xs text-ink-subtle">{layer.example}</p>
              <p className="text-xs text-warn">{layer.caution}</p>
            </article>
          ))}
        </div>
      </section>

      <hr className="hairline" />

      {/* J. Research boundaries */}
      <section
        id="research-boundaries"
        className="scroll-mt-6 space-y-4"
        aria-labelledby="boundaries-heading"
      >
        <h2 id="boundaries-heading" className="section-title">
          Research boundaries
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
          Limitations relative to research release {RESEARCH_RELEASE} (cutoff {RESEARCH_CUTOFF};
          correction pass {RESEARCH_CORRECTION_PASS}) — not claims about later developments.
        </p>
        <ul className="space-y-3">
          {RESEARCH_BOUNDARIES.map((boundary) => (
            <li
              key={boundary.id}
              className="space-y-1.5 border-t border-line pt-3"
              data-testid={`boundary-${boundary.id}`}
            >
              <p className="text-sm text-ink">{boundary.statement}</p>
              <ul className="flex flex-wrap gap-2">
                {boundary.claimIds.map((claimId) => (
                  <li key={claimId}>
                    <Link to={`/claims/${claimId}`} className={CLAIM_ID_LINK_CLASS}>
                      {claimId}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-muted">
          See the Policy Assessment Casebook methodology, institutional layers above,
          claim-level limitations in the{' '}
          <Link to="/claims" className="font-medium text-accent underline underline-offset-2">
            Evidence library
          </Link>
          , and source-grounded research requirements in{' '}
          <Link
            to={gapsHref()}
            className="font-medium text-accent underline underline-offset-2"
          >
            Evidence Gaps
          </Link>
          .
        </p>
      </section>

      <hr className="hairline" />

      {/* K. Research provenance */}
      <section
        id="research-provenance"
        className="scroll-mt-6 space-y-3"
        aria-labelledby="provenance-heading"
      >
        <h2 id="provenance-heading" className="section-title">
          Research provenance
        </h2>
        <div className="space-y-2 text-sm text-ink-muted">
          <p>
            <span className="font-medium text-ink">Research release</span> {RESEARCH_RELEASE}
            {' · '}
            <span className="font-medium text-ink">Application</span> development v0.2 (Build 08P)
          </p>
          <p>
            <span className="font-medium text-ink">Institutional/legal cutoff</span> {RESEARCH_CUTOFF}
            {' · '}
            <span className="font-medium text-ink">Correction pass</span> {RESEARCH_CORRECTION_PASS}
          </p>
          <p>
            The historical legal baseline is fixed to that cutoff; visiting later does not refresh
            it automatically.
          </p>
          <p>
            Primary artefacts:{' '}
            <span className="font-mono text-xs">{provenance.sourceFile}</span> and{' '}
            <span className="font-mono text-xs">research/10_policy_assessment_casebook.md</span>.
            Atlas SHA-256{' '}
            <span className="font-mono text-xs break-all">
              {provenance.sourceContentSha256}
            </span>
            .
          </p>
          <p>
            Research text licensed{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              CC BY 4.0
            </a>{' '}
            (
            <span className="font-mono text-xs">LICENSE</span>
            ). Application software{' '}
            <a
              href="https://www.apache.org/licenses/LICENSE-2.0"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              Apache 2.0
            </a>{' '}
            (
            <span className="font-mono text-xs">LICENSE-SOFTWARE</span>
            ). Third-party materials are not relicensed. Methodology and full casebook source:{' '}
            <Link to="/casebook/source" className="text-accent underline underline-offset-2">
              Casebook methodology
            </Link>
            . Unpublished local working files are not exposed. Published release commit{' '}
            <span className="font-mono text-xs break-all">
              a1922f8a8d08f59749d34de306e1b7406f9fe10b
            </span>
            .
          </p>
        </div>
      </section>

      <hr className="hairline" />

      <section className="space-y-1 text-sm text-ink-muted" aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="text-base font-semibold text-ink">
          Laboratory modules
        </h2>
        <p>
          Mechanism Explorer:{' '}
          <Link to="/mechanisms" className="text-accent underline underline-offset-2">
            /mechanisms
          </Link>
          . Policy Comparison:{' '}
          <Link to="/comparison" className="text-accent underline underline-offset-2">
            /comparison
          </Link>
          . Evidence Gaps:{' '}
          <Link to="/gaps" className="text-accent underline underline-offset-2">
            /gaps
          </Link>
          . Casebook:{' '}
          <Link to="/casebook" className="text-accent underline underline-offset-2">
            /casebook
          </Link>
          . The Analytical Sandbox is a future gated capability and is not an active research
          workflow in v0.2.
        </p>
      </section>
    </article>
  );
}

const CLAIM_STATUSES_READABLE = Object.values(STATUS_LABELS).join(', ');

function CoverageStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="border-t border-line pt-2">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">{label}</dt>
      <dd className="mt-1">
        <span className="font-display text-2xl font-semibold tabular-nums text-ink">{value}</span>
        <span className="mt-0.5 block text-[11px] text-ink-subtle">{hint}</span>
      </dd>
    </div>
  );
}

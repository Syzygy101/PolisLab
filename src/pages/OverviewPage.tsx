import { Link } from 'react-router-dom';
import { researchDataset, findClaimById } from '@/data/researchDataset';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';
import { computeResearchCoverage } from '@/research/coverage';
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
import { StatusDistribution } from '@/components/overview/StatusDistribution';
import { OutcomeStageExplorer } from '@/components/overview/OutcomeStageExplorer';

const SECTION_NAV = [
  { href: '#policy-investigations', label: 'Investigations' },
  { href: '#evidence-composition', label: 'Evidence' },
  { href: '#research-insights', label: 'Insights' },
  { href: '#outcome-stages', label: 'Outcomes O1–O6' },
  { href: '#institutional-layers', label: 'Methodology' },
  { href: '#research-boundaries', label: 'Boundaries' },
  { href: '#research-provenance', label: 'Provenance' },
] as const;

export function OverviewPage() {
  const { provenance, claims } = researchDataset;
  const coverage = computeResearchCoverage(claims);

  return (
    <div className="space-y-8">
      {/* A. Research orientation */}
      <section className="space-y-3" aria-labelledby="orientation-heading">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
          Research Overview · app development v0.2 · research {RESEARCH_RELEASE}
        </p>
        <h1
          id="orientation-heading"
          className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl"
        >
          Institutions, market entry and grocery competition
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-ink-muted">
          Investigate competing mechanisms, source-supported claims, institutional constraints and
          hypothetical interventions for Australian grocery-market entry — without treating this as
          a calibrated simulator, legal advice, policy-ranking tool or original causal study.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            to="/claims"
            className="inline-flex border border-accent bg-accent px-4 py-2 text-sm font-medium text-white no-underline hover:opacity-90"
          >
            Open Claims Explorer
          </Link>
          <a
            href="#policy-investigations"
            className="inline-flex border border-accent/40 bg-paper-raised px-4 py-2 text-sm font-medium text-accent no-underline hover:bg-accent-soft"
          >
            Four policy investigations
          </a>
          <a
            href="#institutional-layers"
            className="inline-flex border border-line bg-paper-raised px-4 py-2 text-sm font-medium text-ink no-underline hover:bg-neutral-soft"
          >
            Methodology
          </a>
        </div>
      </section>

      <nav
        aria-label="On this page"
        className="flex flex-wrap gap-x-3 gap-y-1 border-y border-line py-2 text-sm"
        data-testid="overview-section-nav"
      >
        {SECTION_NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-accent no-underline hover:underline"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* B. Research coverage */}
      <section className="space-y-3" aria-labelledby="coverage-heading" id="research-coverage">
        <h2 id="coverage-heading" className="font-display text-xl font-semibold text-ink">
          Research coverage
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
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
        <p className="text-xs text-ink-subtle">
          {MECHANISM_FAMILIES.map((m) => `${m.id} ${m.shorthand}`).join(' · ')}
        </p>
      </section>

      {/* C. Four policy investigations — prominent */}
      <section
        id="policy-investigations"
        className="scroll-mt-6 space-y-4"
        aria-labelledby="cases-heading"
      >
        <div className="space-y-2 border-l-4 border-accent pl-4">
          <h2 id="cases-heading" className="font-display text-2xl font-semibold text-ink">
            Four policy investigations
          </h2>
          <p className="max-w-3xl text-sm text-ink-muted">
            Direct citation membership (including applicable common rules) — not exhaustive
            relevance. Memberships overlap; do not sum them as unique claims. Full Casebook Explorer
            deferred to Build 04.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {RESEARCH_CASES.map((researchCase, index) => {
            const cited = coverage.caseMembershipCounts[researchCase.id];
            return (
              <article
                key={researchCase.id}
                className="flex flex-col space-y-3 border border-line-strong bg-paper-raised p-4 shadow-[0_1px_0_rgba(28,36,48,0.04)]"
                data-testid={`case-card-${researchCase.id}`}
              >
                <header className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">
                    Investigation {index + 1}
                    <span className="ml-2 font-mono font-normal normal-case text-ink-subtle">
                      {researchCase.id}
                    </span>
                  </p>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {researchCase.title}
                  </h3>
                </header>
                <p className="flex-1 text-sm leading-relaxed text-ink-muted">
                  {researchCase.researchQuestion}
                </p>
                <p className="text-sm text-ink">
                  <span className="text-ink-subtle">Direct cited claims </span>
                  <span
                    className="font-display text-lg font-semibold tabular-nums"
                    data-testid={`case-count-${researchCase.id}`}
                  >
                    {cited}
                  </span>
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {researchCase.themes.map((theme) => (
                    <li
                      key={theme}
                      className="bg-neutral-soft px-2 py-0.5 text-[11px] text-ink-muted"
                    >
                      {theme}
                    </li>
                  ))}
                </ul>
                <Link
                  to={claimsExplorerHref({ cases: [researchCase.id] })}
                  className="inline-flex w-fit border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white no-underline hover:opacity-90"
                  data-testid={`case-claims-link-${researchCase.id}`}
                >
                  Explore cited claims
                </Link>
              </article>
            );
          })}
        </div>
        <p className="text-xs text-ink-subtle" data-testid="case-membership-note">
          Sum of direct memberships: {coverage.summedCaseMemberships}; unique claims with any case
          tag: {coverage.uniqueCaseMembers}.
        </p>
      </section>

      {/* D. Evidence composition */}
      <section
        id="evidence-composition"
        className="scroll-mt-6 space-y-3"
        aria-labelledby="evidence-heading"
      >
        <h2 id="evidence-heading" className="font-display text-xl font-semibold text-ink">
          Evidence composition
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
          Distribution across published status classifications (
          {CLAIM_STATUSES_READABLE}). Machine-readable codes remain available on hover.
        </p>
        <StatusDistribution counts={coverage.statusCounts} total={coverage.claimCount} />
      </section>

      {/* E. What the research supports */}
      <section
        id="research-insights"
        className="scroll-mt-6 space-y-4"
        aria-labelledby="insights-heading"
      >
        <h2 id="insights-heading" className="font-display text-xl font-semibold text-ink">
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
                              className="inline-flex border border-accent/30 bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] text-accent no-underline hover:border-accent hover:underline"
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

      {/* F. Interactive O1–O6 framework */}
      <section
        id="outcome-stages"
        className="scroll-mt-6 space-y-3"
        aria-labelledby="outcomes-heading"
      >
        <h2 id="outcomes-heading" className="font-display text-xl font-semibold text-ink">
          Interactive O1–O6 framework
        </h2>
        <OutcomeStageExplorer claims={claims} />
      </section>

      {/* G. Institutional layers */}
      <section
        id="institutional-layers"
        className="scroll-mt-6 space-y-4"
        aria-labelledby="layers-heading"
      >
        <h2 id="layers-heading" className="font-display text-xl font-semibold text-ink">
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

      {/* H. Research boundaries */}
      <section
        id="research-boundaries"
        className="scroll-mt-6 space-y-4"
        aria-labelledby="boundaries-heading"
      >
        <h2 id="boundaries-heading" className="font-display text-xl font-semibold text-ink">
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
                    <Link
                      to={`/claims/${claimId}`}
                      className="inline-flex border border-accent/30 bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] text-accent no-underline hover:border-accent hover:underline"
                    >
                      {claimId}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-muted">
          See the Policy Assessment Casebook methodology, institutional layers above, and
          claim-level limitations in the{' '}
          <Link to="/claims" className="font-medium text-accent underline-offset-2 hover:underline">
            Claims Explorer
          </Link>
          .
        </p>
      </section>

      {/* I. Research provenance */}
      <section
        id="research-provenance"
        className="scroll-mt-6 space-y-3"
        aria-labelledby="provenance-heading"
      >
        <h2 id="provenance-heading" className="font-display text-xl font-semibold text-ink">
          Research provenance
        </h2>
        <div className="space-y-2 text-sm text-ink-muted">
          <p>
            <span className="font-medium text-ink">Research release</span> {RESEARCH_RELEASE}
            {' · '}
            <span className="font-medium text-ink">Application</span> development v0.2 (Build 03)
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
            <span className="font-mono text-xs">{provenance.sourceContentSha256}</span>.
          </p>
          <p>
            Research text licensed{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              CC BY 4.0
            </a>
            . Third-party materials are not relicensed. Unpublished local working files are not
            exposed. Published release commit{' '}
            <span className="font-mono text-xs">a1922f8a8d08f59749d34de306e1b7406f9fe10b</span>.
          </p>
        </div>
      </section>

      <section className="space-y-1 border-t border-line pt-5 text-sm text-ink-muted">
        <h2 className="text-base font-semibold text-ink">Deferred modules</h2>
        <p>
          Casebook Explorer, Mechanism Explorer, Policy Comparison Laboratory, Evidence Gaps, and
          the gated Analytical Sandbox remain deferred (navigation labelled “later”).
        </p>
      </section>
    </div>
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
      <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">{value}</dd>
      <p className="mt-0.5 text-[11px] text-ink-subtle">{hint}</p>
    </div>
  );
}

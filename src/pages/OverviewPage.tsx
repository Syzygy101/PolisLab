import { Link } from 'react-router-dom';
import { researchDataset } from '@/data/researchDataset';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';

export function OverviewPage() {
  const { provenance, claims } = researchDataset;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="font-display text-3xl font-semibold text-ink">Research Overview</h1>
        <p className="max-w-3xl text-base leading-relaxed text-ink-muted">
          PolisLab is an interactive research laboratory for examining competing institutional
          and economic mechanisms affecting grocery-market entry and competition. It is not an
          Australian economic forecasting tool and does not rank policies or simulate welfare
          effects.
        </p>
      </section>

      <section className="grid gap-4 border border-line bg-paper-raised p-5 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Research baseline
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-ink">
            <li>Release: {RESEARCH_RELEASE}</li>
            <li>Evidence cutoff: {RESEARCH_CUTOFF}</li>
            <li>Correction pass: {RESEARCH_CORRECTION_PASS}</li>
            <li>Atlas claims available: {claims.length}</li>
            <li>Source fields: {provenance.fields.length}</li>
            <li className="font-mono text-xs text-ink-subtle">
              SHA-256 {provenance.sourceContentSha256}
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Integrity distinctions
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
            <li>Established legal or institutional information vs hypotheses</li>
            <li>Observed empirical / administrative information vs absence of finding</li>
            <li>Restrictions on inference (contested claims)</li>
            <li>
              Admissibility is not a truth verdict — <span className="font-medium">yes</span> ≠
              established fact; <span className="font-medium">no</span> ≠ falsity
            </li>
            <li>Law in force, administrative practice, announced reforms, hypothetical instruments</li>
            <li>Outcomes O1–O6 are not interchangeable</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Available in this build</h2>
        <p className="text-sm text-ink-muted">
          Build 01 provides the application foundation and a fully functional Claims Explorer over
          the authentic v0.1.1 atlas.
        </p>
        <Link
          to="/claims"
          className="inline-flex border border-accent bg-accent px-4 py-2 text-sm font-medium text-white no-underline hover:opacity-90"
        >
          Open Claims Explorer
        </Link>
      </section>

      <section className="space-y-2 text-sm text-ink-muted">
        <h2 className="text-lg font-semibold text-ink">Deferred modules</h2>
        <p>
          Casebook Explorer, Mechanism Explorer, Policy Comparison Laboratory, Evidence Gaps, and
          the gated Analytical Sandbox are scaffolded in navigation only.
        </p>
      </section>
    </div>
  );
}

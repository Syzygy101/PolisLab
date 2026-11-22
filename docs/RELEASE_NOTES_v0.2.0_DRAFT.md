# PolisLab v0.2.0 — release notes draft (local RC)

**Status:** Draft for **local** release-candidate review. **Not** a public release announcement.  
**Application:** v0.2.0 candidate · **Research baseline:** v0.1.1  
**Build:** 08F (licence application and release documentation) on top of 08P design adoption  
**Research commit:** `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026

## What this is

PolisLab v0.2 is the first interactive research application over the published Australian grocery-competition evidence synthesis. It is a laboratory for inspecting claims, cases, mechanisms, qualitative policy variants, and research requirements.

It is **not** legal advice, **not** a validated economic forecasting engine, **not** a calibrated simulator, and **does not** declare a policy winner.

## Coverage (inventory counts — not quality scores)

| Item | Count |
| --- | ---: |
| Laboratory modules | 6 |
| Atlas claims | 43 |
| Policy cases | 4 |
| Case sections (Explorer) | 40 |
| Mechanism families | 6 |
| Registered submechanisms | 12 |
| Policy variants / comparators | 12 |
| Casebook §9 research requirements | 19 |

## Modules

1. **Overview** — orientation, coverage, insights, O1–O6 and Layers A–D, provenance
2. **Claims Explorer** — filterable atlas, claim detail, two-claim **evidence** comparison
3. **Casebook Explorer** — four investigations, section anchors, methodology & source
4. **Mechanism Explorer** — six families, twelve submechanisms, profiles
5. **Policy Comparison Laboratory** — qualitative variant comparison (`/comparison`)
6. **Evidence Gaps** — nineteen published research requirements

The Analytical Sandbox remains a **future** gated capability (`/sandbox` stub only).

## Search and data behaviour

- Claims search uses **deterministic** matching: case-insensitive substring, with same-field whole-word fallback (`src/research/queries.ts`).
- Sorting and filter URL contracts are stable and tested.
- Published CSV and Markdown remain sources of truth; `src/data/*.generated.json` is reproducible via `npm run ingest`.

## Evidence scope and interpretation

- Institutional/legal baseline is **dated** to the published cutoff; visiting later does not refresh law automatically.
- Status vocabulary is **release-scoped** (e.g. registered legal facts, empirical findings, **absence of finding**) — not a claim of universal non-existence.
- Status ≠ admissibility; metadata co-tagging ≠ causal identification.
- Announced reforms ≠ law in force; notification activity ≠ realised competition.
- **No established welfare ranking** across instruments.

## Licences (Build 08F)

| Layer | Licence | File |
| --- | --- | --- |
| Application software | Apache 2.0 | `LICENSE-SOFTWARE` |
| Published research | CC BY 4.0 | `LICENSE` |

See `NOTICE`, `CONTRIBUTING.md`, and `docs/THIRD_PARTY_NOTICES.md`.

## Local verification scope (08P / 08F)

| Check | Result (local) | Caveat |
| --- | --- | --- |
| `validate` / `validate:release` | PASS | Research pins unchanged |
| Typecheck | PASS | |
| Vitest | PASS (280 tests) | |
| Playwright | PASS (54), Chromium | Dev server port 4173 |
| Production build | PASS | |
| `npm audit` (omit dev) | 0 vulnerabilities | Point-in-time |

### Browser and accessibility scope (explicit limits)

- Interactive testing and developer accessibility checks were performed primarily in **Chromium** (Playwright + manual DevTools/a11y inspection).
- **No formal WCAG 2.x conformance audit** or certification was performed.
- **Firefox, WebKit, Safari, and VoiceOver** were not formal acceptance gates for this RC.
- Playwright WebKit ≠ Safari; green Chromium e2e does not guarantee Safari behaviour.

## Not included in this RC

- Public deploy or domain go-live (see `docs/HOSTING_READINESS.md` — **09B**)
- Remote CI re-run in this Build 08F session (owner / canonical pipeline)
- Analytical Sandbox productisation
- Research v0.1.2+ content changes

## Related documentation

- [README](../README.md)
- [HOSTING_READINESS.md](HOSTING_READINESS.md)
- [SOFTWARE_LICENCE_DECISION.md](SOFTWARE_LICENCE_DECISION.md)
- [DEVELOPMENT_LEDGER.md](DEVELOPMENT_LEDGER.md)
- [RESEARCH_INVARIANTS.md](RESEARCH_INVARIANTS.md)
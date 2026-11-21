# PolisLab Development Ledger

Local development record for the interactive application layer. Research artefacts remain authoritative in `research/10_*` and the published v0.1.1 release.

**Checkpoint:** Build 01F (foundation freeze)  
**Branch:** `feat/v0.2-foundation`  
**Research baseline:** v0.1.1 / commit `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026

## Product purpose

PolisLab is an interactive research laboratory for examining competing institutional and economic mechanisms affecting grocery-market entry and competition in Australia. It presents authenticated research claims with provenance and limitations. It is not legal advice, not an economic forecasting tool, and does not rank policies or simulate welfare effects.

## Product horizons (H0–H4)

| Horizon | Intent | Status |
| --- | --- | --- |
| **H0** | Published evidence synthesis (atlas + casebook) as the immutable research baseline | Released as v0.1.1 |
| **H1** | Application foundation + Claims Explorer over the authentic atlas | Accepted (Build 01 / 01R); frozen in Build 01F |
| **H2** | Research Overview as a durable orientation surface for the laboratory | Next: Build 02 |
| **H3** | Interactive Casebook Explorer and Mechanism Explorer | Deferred |
| **H4** | Policy Comparison Laboratory, Evidence Gaps / falsification surfaces, gated Analytical Sandbox | Deferred |

## Build 01 and Build 01R scope

### Build 01

- Vite + React + TypeScript application shell
- Deterministic CSV → JSON ingestion of `research/10_policy_claims_atlas.csv`
- Claims Explorer: search, exact-tag filters, claim detail routes
- Validation CLI that fails on atlas integrity violations
- Unit (Vitest) and smoke (Playwright) tests
- Navigation stubs for deferred modules

### Build 01R

Independent acceptance audit of Build 01. Verified data fidelity against the published commit, research-specific adversarial checks, test quality, browser/UX behaviour, and clean-install reproducibility. Corrected material defects without starting Build 02.

## Acceptance results (Build 01R → 01F)

| Gate | Result |
| --- | --- |
| Independent Python atlas fidelity (43 × 18 fields) | PASS (0 mismatches) |
| Atlas / casebook / LICENSE byte-identical to v0.1.1 | PASS |
| `npm run validate` (CSV + generated JSON sync) | PASS |
| Typecheck | PASS |
| Vitest | PASS (39) |
| Playwright | PASS (2) |
| Production build | PASS |
| Clean `npm ci` reproducibility | PASS |
| `npm audit` | 0 vulnerabilities (at audit time) |

**Milestone verdict:** Build 01 accepted for foundation purposes; Build 01F creates the local Git checkpoint.

## Technical architecture

- **Source of truth:** published CSV (`research/10_policy_claims_atlas.csv`)
- **Generated consumer artefact:** `src/data/claims.generated.json` (must not be hand-edited)
- **Ingest / validate:** `scripts/ingest-research.ts`, `scripts/validate-research.ts`
- **Domain library:** `src/research/*` (schema, ingest, queries, safe URL, drift checks)
- **UI:** React Router SPA — Overview stub depth for Build 01; Claims list + detail
- **Tooling:** Vite 8, TypeScript 7, Vitest 5, Playwright, Tailwind 4, Zod 4, Papa Parse
- **Node engines:** `^22.12.0 || >=24` (tested Node 22.23.1 / npm 10.9.8)
- **Routing:** `BrowserRouter`; production hosts need SPA `index.html` fallback for deep links

## Material defects corrected in Build 01R

1. Validation ignored corrupted/stale generated JSON — now fails on drift.
2. Admissibility was easy to misread as truth — prominent detail callout + disclaimer.
3. Mechanism/outcome/case filters were exact-tag but labelled ambiguously — clarified in UI and README.
4. Unpublished `research/01–09` and `references/` were untracked publication risks — gitignored.
5. Missing regressions for HYP-004 prefix≠status, exact-tag M1, whitespace search, safe URL schemes.
6. External primary URLs lacked http(s)-only linking.

## Changes in Build 01F (since 01R)

- Deterministic content-addressed `generatedAt` (`content-sha256:<atlas sha>`) so unchanged CSV regenerates identical JSON.
- Declared Node engines reconciled to the installed Vitest/Vite toolchain (`^22.12.0 || >=24`).
- Added this ledger and `docs/RESEARCH_INVARIANTS.md`.

## Outstanding technical debt

- Mechanism **family** queries (e.g. M1 includes M1a/M1b/M1c) not implemented; exact-tag only.
- Application/software licence for the code layer remains undecided (research remains CC BY 4.0).
- Claims table uses `role="link"` on rows (keyboard works; not a native `<a>`).
- Overview page is informational only; Build 02 will deepen Research Overview.
- Hosting SPA fallback not packaged as provider-specific config (documented only).
- Atlas text may *mention* unpublished path strings; unpublished file bodies must never be bundled or committed.

## Research integrity constraints

See `docs/RESEARCH_INVARIANTS.md`. Do not edit authoritative `research/10_*` in application builds. Do not stage `research/01–09` or `references/`.

## Deferred features

- Casebook Explorer
- Mechanism Explorer
- Policy Comparison Laboratory
- Evidence Gaps and Falsification
- Analytical Sandbox (gated)

## Next milestone

**Build 02 — Research Overview:** enrich the laboratory orientation surface without weakening atlas fidelity or inventing unsupported analytical results.

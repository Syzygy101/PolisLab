# PolisLab Development Ledger

Local development record for the interactive application layer. Research artefacts remain authoritative in `research/10_*` and the published v0.1.1 release.

**Checkpoint:** Build 02F (Research Overview accepted locally)  
**Branch:** `feat/v0.2-overview`  
**Foundation checkpoint:** `45d23a1d32547efe7d7d9139c2b5225937872ba0`  
**Research baseline:** v0.1.1 / commit `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026  
**Application version:** development v0.2 (Build 02)

## Product purpose

PolisLab is an interactive research laboratory for examining competing institutional and economic mechanisms affecting grocery-market entry and competition in Australia. It presents authenticated research claims with provenance and limitations. It is not legal advice, not an economic forecasting tool, and does not rank policies or simulate welfare effects.

## Product horizons (H0–H4)

| Horizon | Intent | Status |
| --- | --- | --- |
| **H0** | Published evidence synthesis (atlas + casebook) as the immutable research baseline | Released as v0.1.1 |
| **H1** | Application foundation + Claims Explorer over the authentic atlas | Accepted (Build 01 / 01R); frozen in Build 01F |
| **H2** | Research Overview as a durable orientation surface for the laboratory | **Accepted (Build 02 / 02R → 02F)** |
| **H3** | Interactive Casebook Explorer and Mechanism Explorer | Deferred (Casebook → Build 04) |
| **H4** | Policy Comparison Laboratory, Evidence Gaps / falsification surfaces, gated Analytical Sandbox | Deferred |

## Build 01 acceptance (summary)

Build 01 / 01R / 01F established the Vite+React shell, atlas ingestion, Claims Explorer, validation, and research invariants. Foundation SHA: `45d23a1`.

## Build 02 — Research Overview

### Scope delivered

- Full Research Overview (sections A–I) with in-page section navigation
- Shared typed taxonomies: cases, outcome stages, mechanism families, institutional layers
- Curated synthesis with **proposition-level** claim citations and evidence-reading notes (assumption vs empirical/legal)
- Dynamic coverage / status / case counts from the loaded dataset
- URL filter contract (`q`, `status`, `case`, `outcome`, `mechanism`) with Overview deep-links
- Accessible O1–O6 toggle buttons (`aria-pressed`; no incomplete tab semantics)
- Authoritative `research/10_*` unchanged

### Build 02R refinements

1. **Insight provenance:** notification≠prohibition and Coles/Woolworths connected-entity scope; scarcity/planning/foreclosure kept distinct; FDI cites LEG-002, LEG-005, LIT-005; capacity/welfare cites EMP-005 and GAP-002; acquisition oversight cites EMP-007 and ADM-003.
2. **UX:** shortened orientation copy; on-page nav; investigations emphasised; human-readable status labels; clearer interactive link affordances; reduced redundant boxed chrome.
3. **URL state:** committed filters = URL; search uses a short local draft then replace-updates `q`. Overview→Claims while already on `/claims` rehydrates from the query string. Invalid status/case/outcome ignored (notice); unknown mechanism tags retained as exact-tag filters.
4. **Accessibility:** O1–O6 uses pressed toggle buttons with programmatic names; all stages remain in tab order.

### Acceptance results (Build 02R → 02F)

| Gate | Result |
| --- | --- |
| Starting foundation | `45d23a1` |
| Independent Python atlas fidelity | PASS (0 mismatches; SHA `cdb874f2…`) |
| Atlas / casebook / LICENSE vs v0.1.1 | PASS (byte-identical / clean) |
| `npm run validate` | PASS |
| Typecheck | PASS |
| Vitest | PASS (76) |
| Playwright | PASS (7) |
| Production build | PASS |
| Screenshots (local, unstaged) | `docs/screenshots/build-02/` |

**Milestone verdict:** Build 02 accepted for local checkpoint purposes (02F). Do not push, merge to public main, or deploy from this step alone.

## Technical architecture

- **Source of truth:** published CSV (`research/10_policy_claims_atlas.csv`)
- **Generated consumer artefact:** `src/data/claims.generated.json` (must not be hand-edited)
- **Ingest / validate:** `scripts/ingest-research.ts`, `scripts/validate-research.ts`
- **Domain library:** `src/research/*` (schema, ingest, queries, taxonomy, coverage, urlFilters, overviewContent, safe URL, drift checks)
- **UI:** React Router SPA — Research Overview + Claims list + detail; deferred module stubs
- **Tooling:** Vite 8, TypeScript 7, Vitest 5, Playwright, Tailwind 4, Zod 4, Papa Parse
- **Node engines:** `^22.12.0 || >=24`
- **Routing:** `BrowserRouter`; production hosts need SPA `index.html` fallback for deep links

## Outstanding technical debt

- Mechanism **family** queries (e.g. M1 includes M1a/M1b/M1c) not implemented; exact-tag only.
- Application/software licence for the code layer remains undecided (research remains CC BY 4.0).
- Claims table uses `role="link"` on rows (keyboard works; not a native `<a>`).
- Hosting SPA fallback not packaged as provider-specific config (documented only).
- Atlas text may *mention* unpublished path strings; unpublished file bodies must never be bundled or committed.
- Search URL updates are debounced (~200ms); extremely rapid navigation away mid-debounce can briefly omit the latest `q` character until the next commit (non-search dimensions are immediate).
- Local screenshots under `docs/screenshots/` are intentionally unstaged.

## Research integrity constraints

See `docs/RESEARCH_INVARIANTS.md`. Do not edit authoritative `research/10_*` in application builds. Do not stage `research/01–09` or `references/`.

## Deferred features

- Casebook Explorer (Build 04)
- Mechanism Explorer
- Policy Comparison Laboratory
- Evidence Gaps and Falsification
- Analytical Sandbox (gated)

## Next milestone

**Build 03** (not started). Do not begin until explicitly requested after this checkpoint.

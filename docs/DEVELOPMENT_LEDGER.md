# PolisLab Development Ledger

Local development record for the interactive application layer. Research artefacts remain authoritative in `research/10_*` and the published v0.1.1 release.

**Checkpoint:** Build 03F (Evidence Investigation Workspace accepted locally)  
**Branch:** `feat/v0.2-claims-workspace`  
**Starting checkpoint (Build 02F):** `e89735a7af6e4ed733a11365c32798a8421241b0`  
**Foundation checkpoint:** `45d23a1d32547efe7d7d9139c2b5225937872ba0`  
**Research baseline:** v0.1.1 / commit `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026  
**Application version:** development v0.2 (Build 03)

## Product purpose

PolisLab is an interactive research laboratory for examining competing institutional and economic mechanisms affecting grocery-market entry and competition in Australia. It presents authenticated research claims with provenance and limitations. It is not legal advice, not an economic forecasting tool, and does not rank policies or simulate welfare effects.

## Product horizons (H0–H4)

| Horizon | Intent | Status |
| --- | --- | --- |
| **H0** | Published evidence synthesis (atlas + casebook) as the immutable research baseline | Released as v0.1.1 |
| **H1** | Application foundation + Claims Explorer over the authentic atlas | Accepted (Build 01 / 01R); frozen in Build 01F |
| **H2** | Research Overview as a durable orientation surface for the laboratory | Accepted (Build 02 / 02R → 02F) |
| **H2.5** | Evidence investigation workspace (search, admissibility, compare, related evidence) | **Accepted (Build 03 / 03R → 03F)** |
| **H3** | Interactive Casebook Explorer and Mechanism Explorer | Deferred (Casebook → Build 04) |
| **H4** | Policy Comparison Laboratory, Evidence Gaps / falsification surfaces, gated Analytical Sandbox | Deferred |

## Build 01–02 acceptance (summary)

- Build 01 / 01R / 01F: Vite+React shell, atlas ingestion, Claims Explorer, validation, research invariants. Foundation SHA: `45d23a1`.
- Build 02 / 02R / 02F: Research Overview, taxonomies, URL filter contract, Overview deep-links. Checkpoint SHA: `e89735a`.

## Build 03 — Evidence Investigation Workspace

### Scope delivered

- Admissibility filter distinct from evidentiary status
- Active filter chips, reset, copy-link (commits pending search first)
- Sort by claim ID or primary source title
- Literature exact-tag + exact `source_url` filters
- Hierarchical claim inspection with all 18 source fields retained
- Two-claim comparison at `/claims/compare?a=&b=`
- Related evidence with dimension filter + progressive disclosure
- Native claim anchors in the results table; explorer return state via location state + committed URL

### Build 03R audit findings and corrections

| Finding | Severity | Correction |
| --- | --- | --- |
| ASM-002 related list = 42 associations (unwieldy) | Material | Dimension filter + show-8 / expand disclosure |
| Claim preview used simulated button navigation | Material | Native `<Link>` anchors for ID and preview |
| Mid-debounce navigate/copy could drop or race search | Material | Explicit `commitPendingSearch` (replaceState + sync); mounted guard on debounce |
| Breadcrumb `/claims` dropped investigation subset | Material | Explorer return state (`explorerSearch`) on claim/compare routes |
| Admissibility `yes` used ok/green styling (pass/fail read) | Material | Neutral accent treatment for yes/conditional; muted for no |
| HYP-004 buried beyond initial related window | Test/UX | Disclosure control; acceptance journey expands before navigate |

Integrity spot-checks (pairs not treated as contradictions): EMP-001/002, EMP-005/HYP-004, LEG-001/002, HYP-001/POL-001; HYP-002 analytical-use limits; HYP-003 missing URL. All 18 fields recoverable in detail and comparison.

### Acceptance results (Build 03R → 03F)

| Gate | Result |
| --- | --- |
| Starting checkpoint | `e89735a` |
| Independent Python atlas fidelity | PASS (0 mismatches; SHA `cdb874f2…`) |
| Atlas / casebook / LICENSE | Unchanged |
| `npm run validate` | PASS |
| Typecheck | PASS |
| Vitest | PASS (110) |
| Playwright | PASS (16) |
| Production build | PASS |
| Screenshots (local, unstaged) | `docs/screenshots/build-03/` |

**Milestone verdict:** Build 03 accepted for local checkpoint purposes (03F). Do not push, merge to public main, or deploy from this step alone.

## Technical architecture

- **Source of truth:** published CSV (`research/10_policy_claims_atlas.csv`)
- **Generated consumer artefact:** `src/data/claims.generated.json` (must not be hand-edited)
- **Ingest / validate:** `scripts/ingest-research.ts`, `scripts/validate-research.ts`
- **Domain library:** `src/research/*` (schema, ingest, queries, taxonomy, coverage, urlFilters, compareUrl, relatedEvidence, overviewContent, safe URL, drift checks)
- **UI:** React Router SPA — Overview + Claims list/detail + two-claim compare; deferred module stubs
- **Tooling:** Vite 8, TypeScript 7, Vitest 5, Playwright, Tailwind 4, Zod 4, Papa Parse
- **Node engines:** `^22.12.0 || >=24`
- **Routing:** `BrowserRouter`; production hosts need SPA `index.html` fallback for deep links

## Outstanding technical debt

- Mechanism **family** queries (e.g. M1 includes M1a/M1b/M1c) not implemented; exact-tag only (Build 05).
- Application/software licence for the code layer remains undecided (research remains CC BY 4.0).
- Hosting SPA fallback not packaged as provider-specific config (documented only).
- Atlas text may *mention* unpublished path strings; unpublished file bodies must never be bundled or committed.
- Related-evidence lists remain long for widely tagged claims even with disclosure (by design; no relevance score).
- Local screenshots under `docs/screenshots/` are intentionally unstaged.

## Research integrity constraints

See `docs/RESEARCH_INVARIANTS.md`. Do not edit authoritative `research/10_*` in application builds. Do not stage `research/01–09` or `references/`.

## Deferred features

- Casebook Explorer (Build 04)
- Mechanism Explorer / mechanism graph (later; family expansion Build 05)
- Policy Comparison Laboratory (`/comparison` stub; distinct from `/claims/compare`)
- Evidence Gaps and Falsification
- Analytical Sandbox (gated)

## Next milestone

**Build 04** (Casebook Explorer) when explicitly requested after this checkpoint.

# PolisLab Development Ledger

Local development record for the interactive application layer. Research artefacts remain authoritative in `research/10_*` and the published v0.1.1 release.

**Checkpoint:** Build 04F (Casebook Explorer accepted locally)  
**Branch:** `feat/v0.2-casebook`  
**Starting checkpoint (Build 03F):** `4a502a41f964d08aef5298ac1fbf93550892a085`  
**Overview checkpoint (Build 02F):** `e89735a7af6e4ed733a11365c32798a8421241b0`  
**Foundation checkpoint:** `45d23a1d32547efe7d7d9139c2b5225937872ba0`  
**Research baseline:** v0.1.1 / commit `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026  
**Application version:** development v0.2 (Build 04)

## Product purpose

PolisLab is an interactive research laboratory for examining competing institutional and economic mechanisms affecting grocery-market entry and competition in Australia. It presents authenticated research claims with provenance and limitations. It is not legal advice, not an economic forecasting tool, and does not rank policies or simulate welfare effects.

## Product horizons (H0–H4)

| Horizon | Intent | Status |
| --- | --- | --- |
| **H0** | Published evidence synthesis (atlas + casebook) as the immutable research baseline | Released as v0.1.1 |
| **H1** | Application foundation + Claims Explorer over the authentic atlas | Accepted (Build 01 / 01R); frozen in Build 01F |
| **H2** | Research Overview as a durable orientation surface for the laboratory | Accepted (Build 02 / 02R → 02F) |
| **H2.5** | Evidence investigation workspace (search, admissibility, compare, related evidence) | Accepted (Build 03 / 03R → 03F) |
| **H3** | Interactive Casebook Explorer | **Accepted (Build 04 / 04R → 04F)** |
| **H3b** | Mechanism Explorer | Deferred (Build 05+) |
| **H4** | Policy Comparison Laboratory, Evidence Gaps / falsification surfaces, gated Analytical Sandbox | Deferred |

## Build 01–03 acceptance (summary)

- Build 01 / 01R / 01F: Vite+React shell, atlas ingestion, Claims Explorer, validation, research invariants. Foundation SHA: `45d23a1`.
- Build 02 / 02R / 02F: Research Overview, taxonomies, URL filter contract, Overview deep-links. Checkpoint SHA: `e89735a`.
- Build 03 / 03R / 03F: Evidence investigation workspace, admissibility filters, compare, related evidence. Checkpoint SHA: `4a502a4`.

## Build 04 — Interactive Casebook Explorer

### Scope delivered

- Deterministic Markdown casebook ingest → `src/data/casebook.generated.json` with SHA-256 provenance
- Routes `/casebook`, `/casebook/:caseId`, `/casebook/source`, section anchors
- Exact membership sets Case1=20, Case2=17, Case3=14, Case4=12
- Safe GFM rendering + claim-ID leaf linking; case→claim→case/section return
- Overview / claim-detail Casebook wiring; existing `/claims/compare` unchanged
- Independent verifier: `scripts/independent_verify_casebook.py` (substantive anchors + exact section bodies)

### Build 04R audit findings and corrections

| Finding | Severity | Correction |
| --- | --- | --- |
| Independent Python verifier checked headings/counts only | Material | Added independent section extract, substantive text anchors, exact generated↔extract body compare, front matter / comparison checks |
| Playwright flakes on port 5173 with `reuseExistingServer` + parallel workers | Material | Dedicated port **4173**, `--strictPort`, `reuseExistingServer: false`, `workers: 1`; `npm run test:e2e` documents serial config |
| Lazy-loaded casebook screenshots captured “Loading casebook…” | Material | E2E waits for case page / directory testids before screenshots |
| Inline claim navigation lacked return to originating section | Material | `caseReturn` location state + “Back to CaseN §k” on claim detail |
| Linkify wrapped siblings in `<span>` | Minor | Use `Fragment`; preserve surrounding text/qualifications |
| Stale generated casebook could be overlooked | Material | Drift checks + unit tests; validate fails before regeneration when SHA corrupted |
| Main JS bundle ~783 kB | Debt | Route-level code-split for casebook; main ~511 kB; markdown/data chunks deferred |

Integrity spot-checks (rendered source): Case1 §6 R/E pathways; Case2 §§2–3 T1–FGI + CF-A–D; Case3 §§5/7/10 chronology vs identification; Case4 §§2/10 waiver≠clearance, voluntary Kalgoorlie, release-dated Tribunal; source view common rules + four-case comparison.

### Acceptance results (Build 04R → 04F)

| Gate | Result |
| --- | --- |
| Starting checkpoint | `4a502a4` |
| Independent Python atlas fidelity | PASS (0 mismatches; SHA `cdb874f2…`) |
| Independent Python casebook fidelity | PASS (SHA `3da0e29c…`; substantive + membership) |
| Atlas / casebook / LICENSE | Byte-identical to `a1922f8` |
| Validate before regeneration | PASS; corrupted generated SHA fails |
| Typecheck | PASS |
| Vitest | PASS (148) |
| Playwright | PASS (24) via documented serial / port-4173 config |
| Production build | PASS |
| Screenshots (local, unstaged) | `docs/screenshots/build-04/` |

**Milestone verdict:** Build 04 accepted for local checkpoint purposes (04F). Do not push, merge to public main, or deploy from this step alone.

### Bundle measurements (production build)

| Asset | Raw | Gzip |
| --- | --- | --- |
| `index-*.js` (main) | ~511 kB | ~149 kB |
| `CasebookMarkdown-*.js` | ~167 kB | ~50 kB |
| `casebookDataset-*.js` | ~88 kB | ~19 kB |
| `CaseDetailPage-*.js` | ~11 kB | ~3.4 kB |
| `index-*.css` | ~27 kB | ~5.9 kB |

Main chunk still >500 kB (claims/overview payload); further splitting deferred.

## Technical architecture

- **Source of truth:** `research/10_policy_claims_atlas.csv` + `research/10_policy_assessment_casebook.md`
- **Generated artefacts:** `src/data/claims.generated.json`, `src/data/casebook.generated.json`
- **Ingest / validate / verify:** `npm run ingest`, `npm run validate`, `npm run verify:research`
- **E2E:** Playwright workers=1, Vite `--port 4173 --strictPort`, no server reuse
- **UI:** Overview + Claims + Casebook (lazy); deferred stubs for mechanisms/comparison/gaps/sandbox

## Outstanding technical debt

- Mechanism **family** queries not implemented (Build 05).
- Application/software licence undecided (research remains CC BY 4.0).
- Hosting SPA fallback not packaged as provider-specific config.
- Main bundle still >500 kB after casebook split.
- Local screenshots under `docs/screenshots/` intentionally unstaged.
- Invalid `#section-*` hashes soft-fail (no dedicated not-found panel).

## Deferred features

- Mechanism Explorer / mechanism graph (Build 05+)
- Policy Comparison Laboratory (`/comparison` stub; distinct from `/claims/compare`)
- Evidence Gaps register (Build 07; case §9 already navigable)
- Analytical Sandbox (gated)

## Next milestone

**Build 05** (Mechanism Explorer) when explicitly requested after this checkpoint.

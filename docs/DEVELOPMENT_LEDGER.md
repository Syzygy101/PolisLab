# PolisLab Development Ledger

Local development record for the interactive application layer. Research artefacts remain authoritative in `research/10_*` and the published v0.1.1 release.

**Checkpoint:** Builds 05–06 accepted (Mechanism Explorer + Policy Comparison Laboratory)  
**Branch:** `feat/v0.2-mechanisms`  
**Acceptance commit (this checkpoint):** local `feat: complete audited mechanism and qualitative policy comparison laboratories` on `feat/v0.2-mechanisms` (record SHA from `git rev-parse HEAD` after commit)  
**Starting checkpoint (Build 04F):** `c19ea5f660d7e6f008eea5b6157fface2fc633fa`  
**Claims workspace checkpoint (Build 03F):** `4a502a41f964d08aef5298ac1fbf93550892a085`  
**Overview checkpoint (Build 02F):** `e89735a7af6e4ed733a11365c32798a8421241b0`  
**Foundation checkpoint:** `45d23a1d32547efe7d7d9139c2b5225937872ba0`  
**Research baseline:** v0.1.1 / commit `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026  
**Application version:** development v0.2 (Builds 05–06 accepted)

## Product purpose

PolisLab is an interactive research laboratory for examining competing institutional and economic mechanisms affecting grocery-market entry and competition in Australia. It presents authenticated research claims with provenance and limitations. It is not legal advice, not an economic forecasting tool, and does not rank policies or simulate welfare effects.

## Product horizons (H0–H4)

| Horizon | Intent | Status |
| --- | --- | --- |
| **H0** | Published evidence synthesis (atlas + casebook) as the immutable research baseline | Released as v0.1.1 |
| **H1** | Application foundation + Claims Explorer over the authentic atlas | Accepted (Build 01 / 01R); frozen in Build 01F |
| **H2** | Research Overview as a durable orientation surface for the laboratory | Accepted (Build 02 / 02R → 02F) |
| **H2.5** | Evidence investigation workspace (search, admissibility, compare, related evidence) | Accepted (Build 03 / 03R → 03F) |
| **H3** | Interactive Casebook Explorer | Accepted (Build 04 / 04R → 04F) |
| **H3b** | Mechanism Explorer | **Accepted (Build 05 + audit remediations)** |
| **H4a** | Policy Comparison Laboratory | **Accepted (Build 06; focused Case 3 independent review retained)** |
| **H4b** | Evidence Gaps / falsification surfaces, gated Analytical Sandbox | Deferred — next milestone Build 07 |

## Build 01–04 acceptance (summary)

- Build 01 / 01R / 01F: Vite+React shell, atlas ingestion, Claims Explorer, validation, research invariants. Foundation SHA: `45d23a1`.
- Build 02 / 02R / 02F: Research Overview, taxonomies, URL filter contract, Overview deep-links. Checkpoint SHA: `e89735a`.
- Build 03 / 03R / 03F: Evidence investigation workspace, admissibility filters, compare, related evidence. Checkpoint SHA: `4a502a4`.
- Build 04 / 04R / 04F: Interactive Casebook Explorer. Checkpoint SHA: `c19ea5f`.

## Build 05 — Interactive Mechanism Explorer (+ audit remediations) — ACCEPTED

### Scope delivered

- Extended shared taxonomy with explicit M1–M6 parent→child registry (12 exact atlas submechanisms)
- Contextual M5a-1 / M5a-2 documented as non-atlas subdivisions (no fabricated counts)
- Family-expanded filtering via `mechanism_family=` while preserving exact-tag `mechanism=` URLs
- Routes `/mechanisms` and `/mechanisms/:mechanismId`; Mechanisms activated in global nav
- Family overview with exact + family-expanded coverage counts (dynamic)
- Interactive 6×6 mechanism–outcome coverage matrix with keyboard-accessible cells
- Source-grounded mechanism profiles and four curated pathways
- Casebook AST-based mechanism linkification (grouped tags preserved; M5a-1/M5a-2 → M5a contextual anchor)
- Claim-detail / table / compare mechanism chips link to profiles
- Independent Python verifier + CSV fixture for exact/family/matrix ID-set expectations
- Release pin gate (`validate:release`) rejecting edited published sources even after regeneration

### Independent audit findings (six reproducible defects) and remediation

| # | Independent finding | Remediation verified at acceptance | Regression coverage |
| --- | --- | --- | --- |
| 1 | Alter generated ADM-001 mechanism arrays without changing source SHA went undetected | Complete generated drift covers enriched claims arrays | `generated-complete-validation.test.ts` |
| 2 | Clear generated casebook `closingParts` without changing source SHA went undetected | Casebook drift covers closing parts / citation metadata | same |
| 3 | Edited pinned source + regenerate could pass ordinary validate | `validate:release` pins atlas/casebook/LICENSE; rejects after regen | `release-gate.test.ts` |
| 4 | M6 → M1, pending search, Back, debounce race overwrote prior family | Draft + timer scoped to creating location | `navigation-commit.test.tsx` |
| 5 | Pathway relationship wording risked reversed causality | Human-readable relation sentences; M1 foreclosure as possible explanation | `mechanism-pathways.test.tsx` |
| 6 | Unregistered tags / partial citation-token matches; range collapse | Reject unexpected tags; preserve compact ranges; reject partial IDs | `mechanism-id-sets.test.ts`, `citation-linkify.test.ts` |

Acceptance re-ran the six targeted regressions (20 tests) on isolated/synthetic mutations — all PASS. Release validation is confirmed to run against on-disk artefacts **before** regeneration in the acceptance workflow (`validate` then `validate:release` before `build`’s ingest).

### Acceptance gates (Build 05 — final)

| Gate | Result |
| --- | --- |
| Starting checkpoint | `c19ea5f` on `feat/v0.2-mechanisms` |
| Independent Python atlas / casebook / mechanisms | PASS |
| Atlas / casebook / LICENSE | Unchanged vs `a1922f8` |
| `validate` / `validate:release` | PASS |
| Typecheck | PASS |
| Six audit regression files | PASS (20) |
| Vitest (full suite with Build 06) | PASS (209) |
| Playwright | PASS (34) |
| Production build | PASS |

**Verdict:** Build 05 **accepted**.

## Build 06 — Policy Comparison Laboratory — ACCEPTED

### Scope delivered

- Versioned, validated qualitative comparison dataset keyed to pinned casebook SHA `3da0e29c…`
- Separate records: baselines, intervention variants, pathways, outcome assessments, evidence uses
- Cases 1–4 §§2–9 populated: C1 R/E; C2 CF-A–D; C3 site-access/FDI class + observed O2 + analytical comparators; C4 B0 / CF-stronger / CF-weaker
- Route `/comparison` with shareable `?a=&b=` variant IDs; `/claims/compare` unchanged
- Orientation table from the published four-case comparison; side-by-side qualitative compare
- Evidence uses resolve atlas status / admissibility / conditions; limitations beside judgments
- Negatives: unsupported variant assignment, broken refs, invalid URL state, evidence beyond case membership
- Cross-case pairing notice: institutional scope, target actors, policy objective, baseline, outcome basis; no mutual exclusivity / substitutability / joint implementability implied

### Focused independent review retained (Case 3)

Independent Case 3 review previously passed and is retained at acceptance:

- Historical ALDI chronology is an observed O2 benchmark (not today’s Determination Part 3).
- Possible direct consumer benefits remain visible as **hypothetical** pathways.
- Actual welfare effects remain unidentified (`O6` not_assessable).
- FDI-only and merger-notification-only are labelled **analytical comparators**, not fully specified legislative instruments.

### Targeted interpretive audit (Cases 1–4) at acceptance

| Case | Checks | Result |
| --- | --- | --- |
| 1 | R and E separate; favourable/adverse/null columns retained; release does not imply rival acquisition or productive capacity; HYP-002 never treated as validated equilibrium (`admissible=no`, qualitative caution only) | PASS |
| 2 | CF-A–D distinct; case-wide vs variant-specific pathways; no unsupported assignment; private vs FGI; trigger vs condition; Layer C vs D | PASS |
| 3 | Retains Case 3 independent corrections above | PASS |
| 4 | B0 dated institutional baseline; stronger/weaker nested alternatives; notification/waiver/determination/completion/opening distinct; Kalgoorlie local prospective ACCC assessment only | PASS |

**Evidence-use note:** Structural validators confirm claim/case membership, ref integrity, O5/O6 overclaim bans, and forbid fabricated scores. They do **not** automatically verify economic truth. Substantive propositions were spot-checked against cited atlas/casebook passages at acceptance.

### Acceptance gates (Build 06 — final)

| Gate | Result |
| --- | --- |
| Independent Python atlas / casebook / mechanisms | PASS |
| Atlas / casebook / LICENSE | Unchanged vs `a1922f8` |
| `validate` before regeneration | PASS |
| `validate:release` | PASS |
| Typecheck | PASS |
| Vitest | PASS (**209**) |
| Playwright (port 4173, workers=1) | PASS (**34**) |
| Production build | PASS |
| Screenshots (local, **unstaged**) | `docs/screenshots/build-05/`, `docs/screenshots/build-06/` |

**Bundle (production):** main `index-*.js` ~522 kB / gzip ~152 kB; `ComparisonPage-*.js` ~81 kB / gzip ~21 kB (lazy). Chunk-size warning alone is not a blocker.

**Verdict:** Build 06 **accepted**.

## Remaining uncertainty

- Schema/structural validation ≠ substantive research review; economic truth is not auto-verified.
- Casebook §6 favourable pathways remain hypothetical mechanism stories; instrument definitions separately disclaim that release implies rival acquisition.
- Interactive assumption-testing (toggle retained constraints / nested alternatives live) is **not implemented** — recorded as a deferred extension, not shipped in Builds 05–06.
- Application/software licence and production-host SPA fallback remain separate release decisions.

## Technical architecture

- **Source of truth:** `research/10_policy_claims_atlas.csv` + `research/10_policy_assessment_casebook.md`
- **Generated artefacts:** `src/data/claims.generated.json`, `src/data/casebook.generated.json`
- **Ingest / validate / verify:** `npm run ingest`, `npm run validate`, `npm run validate:release`, `npm run verify:research`
- **E2E:** Playwright workers=1, Vite `--port 4173 --strictPort`, no server reuse
- **UI:** Overview + Claims + Casebook (lazy) + Mechanisms (lazy) + Comparison (lazy); deferred stubs for gaps/sandbox

## Outstanding technical debt

- Main bundle >500 kB (eager claims/overview routes); mechanisms/comparison are lazy-loaded.
- Application/software licence undecided (research remains CC BY 4.0).
- Hosting SPA fallback not packaged as provider-specific config.
- Local screenshots under `docs/screenshots/` intentionally unstaged.
- Invalid `#section-*` hashes soft-fail (no dedicated not-found panel).
- Interactive assumption-testing extension deferred.

## Deferred features

- Evidence Gaps register and falsification surfaces (**Build 07** — next milestone)
- Analytical Sandbox (gated)
- Interactive assumption-testing extension for comparison variants
- Numerical simulation, policy rankings, composite scores (explicitly out of scope)

## Next milestone

**Build 07 — Evidence Gaps and Falsification.** Do not commence until explicitly requested. Leave pushing, merging, deployment, retagging and publication for separate authorization.

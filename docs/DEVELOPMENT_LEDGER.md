# PolisLab Development Ledger

Local development record for the interactive application layer. Research artefacts remain authoritative in `research/10_*` and the published v0.1.1 release.

**Checkpoint:** Build 09B — Local release remediation and hosted preview checks\
**Branch:** `release/v0.2.0-candidate`  
**Build 09AR clean publication parent:** `78631d41b241c44af0a48736c5c372e9bf13e237`\
**Research baseline:** v0.1.1 / commit `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026  
**Application version:** v0.2.0 release candidate (publication branch; not final tagged release)  
**Design authority:** refined Direction C (local design-exploration materials; not published) + independent 08D2 review (locally retained)  
**Findings register:** `docs/08A_FINDINGS_REGISTER.md`  
**Local preserved (not published):** `feat/v0.2-release-candidate` @ `91d89b73e51005267130fc7b77bdc60160c2e789` — excluded from public ancestry because the original freeze docs contained private machine paths

## Build 09B — Release remediation

**Verified:** 25 November 2026\
**Starting public candidate:** `8bbd55eff682eaa679a746ed6e90f2d364c2e6ed` · PR #1 open with green CI at that revision.

- Rapid policy selections now preserve both slots before the router commits. The regression reproduced the lost first selection and now checks the final pair, displayed results and browser history.
- Casebook generation metadata is content-addressed and checked against a fresh ingest. Two consecutive regenerations reproduced both generated JSON files byte-for-byte. The published v0.1.1 corpus and research licence match the pinned Git blobs.
- The README and hosting checklist use valid deep-link examples and the current Node pin. Wrangler state is ignored. The production Playwright profile accepts a deployed HTTPS origin, with a dedicated local preview as its default.
- Local verification passed four independent research verifiers, both validators, typecheck, 291 Vitest tests, the build and artifact scan, 54 Chromium tests, and 12 production-preview tests. An isolated negative npm run accepted regenerated data under the ordinary validator and rejected the edited atlas under the release pins.
- The existing Cloudflare preview passed 12 hosted Chromium tests, including cold deep links, refresh, history and hashed asset loading. Run the same checks against the exact remediated deployment before release.
- AgentHarness replayed the historical native pass at `91d89b7`. Its committed-control comparison found the public candidate's Node CI and engine changes. Browser and npm subprocess checks ran in a separate verification copy with dedicated loopback servers and fresh Chromium contexts. AgentHarness's standing isolation profile and native receipt still cover its reviewed revision and scope.
- Public acceptance remains pending CI and hosted verification for the remediated commit, the intended host's security-header policy, and owner authorisation. The unresolved Federal Court source gap remains in the evidence boundary.

After release acceptance, the roadmap is Impeccable-assisted UX and interaction work, then the Horizon 2 economic research charter, literature review, original mathematical modelling and empirical validation. The Analytical Sandbox and spatial Simulation Studio follow, then multi-scale economic and institutional modelling. Parallel academic publications cover the research software, methodology and substantive findings.

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
| **H3b** | Mechanism Explorer | Accepted (Build 05 + audit remediations) |
| **H4a** | Policy Comparison Laboratory | Accepted (Build 06) |
| **H4b** | Evidence Gaps / falsification surfaces | Accepted (Build 07 / 07R) |
| **H4b+** | Gated Analytical Sandbox | Deferred — not part of Build 08/08P |

## Build 01–08 RC (summary)

- Build 01–07: foundation through Evidence Gaps. Accepted at `78631d4`.
- Build 08 RC: product integration on `feat/v0.2-release-candidate` (uncommitted working tree at HEAD `78631d4`).
- Build 08D2: Direction C design exploration approved with targeted fixes (isolated prototype + review packet).

## Build 08P — Production Design Adoption — PENDING ACCEPTANCE

### Scope

Apply the approved refined Direction C visual system and interaction architecture across the complete functional Build 08 release candidate. Preserve full research functionality and methodological safeguards. No new research modules, Horizon 2 sandbox, assumption engine, publish, deploy, commit, merge, or retag.

### Stages delivered (local)

| Stage | Result |
| --- | --- |
| **08P.1** Shared design system + shell | PASS — Direction C tokens/components in `src/index.css`; workspace rail; mobile drawer with focus return; brand lockup; nav: Research / Analysis / Evidence |
| **08P.2A** Policy Comparison Laboratory | PASS — section-aligned bands; selectors above fold; orientation secondary; shared baseline/outcomes once; full RC qualifications retained |
| **08P.2B** Evidence library | PASS — master–detail ≥1100px; compact toolbar + advanced filters; inspector; compare tray; all 43×18 fields; URL/debounce/history preserved |
| **Search enhancement** | PASS — substring + same-field whole-word fallback in `queries.ts`; independent CSV-derived tests |
| **08P.2C** Two-claim evidence comparison | PASS — aligned field bands; full original text; no automatic adjudication |
| **08P.3A** Overview | PASS — editorial entrance + ProgrammeVisual; substantive insights/boundaries/provenance retained |
| **08P.3B** Casebook | PASS — all four cases; section rail + mobile jump; 40 sections; published markdown unchanged |
| **08P.3C** Mechanisms | PASS — families, 12 submechanisms, matrix states, profiles; no causal arrows |
| **08P.3D** Research gaps | PASS — 19 requirements; filters; exact text; return links |

### Licence decision (08P: approved; 08F: applied)

- **Research:** CC BY 4.0 retained (root `LICENSE` byte-identical to `a1922f8`; `research/10_*` unchanged).
- **Application software:** Apache 2.0 applied in Build 08F — `LICENSE-SOFTWARE`, `NOTICE`, `CONTRIBUTING.md`, `docs/THIRD_PARTY_NOTICES.md`, README and in-app footer updates. See `docs/SOFTWARE_LICENCE_DECISION.md`.

## Build 09AR — Publication history remediation (clean branch)

**Completed:** 23 November 2026  
**Context:** Build 09A stopped before push after detecting private machine paths in `docs/08A_FINDINGS_REGISTER.md` on the original freeze (`c594edd` / tip `91d89b7`). A forward redaction on that branch would leave the paths reachable in Git history. This clean branch is cut from verified parent `78631d4`, reapplies the accepted 08F freeze tree with sanitised audit references, and excludes `c594edd` and `91d89b7` from public ancestry. Original local RC branch preserved untouched. No merge of `feat/v0.2-release-candidate`, no final tag, no deploy.

**CI Node pin (09AR follow-up):** GitHub Actions initially failed Vitest on Node `22.12.0` because locked `jsdom@31` / `undici@8` require `^22.22.2` / `>=22.19` (`TypeError` in `undici` decompress interceptor when workers start). Workflow and `package.json` engines aligned to **22.23.1** / `^22.22.2 || >=24` — the locally verified runtime. Research gates unchanged.

## Build 08F — Final audit remediation, licensing, local release freeze — COMPLETE (local)

**Completed:** 22 November 2026  
**Context:** Closed material 08A findings; Apache 2.0 applied; local freeze prepared. Research pin unchanged. Public publication deferred to Build 09AR clean branch (see above).

### Material remediations

| Finding | Result |
| --- | --- |
| F-01 CI artifact gate false positives | `scripts/check-artifact-safety.ts` + `npm run check:artifacts`; positive/negative fixtures |
| F-02 Absence wording | Release-scoped language in `comparisonDataset.ts` |
| F-03 Case 3 Sadun / LIT association | `C3-PATH-UNFAV-1` names LIT-003 comparatively; no LIT-002 as Sadun support |
| F-04/F-05 Accessible names + dl | ClaimsTable / OutcomeStageExplorer / CoverageStat |
| F-06 Semantics | Underlines, unique table regions, requirement heading levels |
| F-07 Citation boundaries | Whole-token CLAIM_ID_RE / CLAIM_RANGE_RE |
| F-08 Preview journeys | Real controls, required compare, exact CSV IDs |
| F-09 Licence / staging | Apache applied; `.gitignore` hardened |

### Licence / docs

| Item | Result |
| --- | --- |
| `LICENSE-SOFTWARE` | Official Apache 2.0 (sha256 `cfc7749b…`; matches apache.org) |
| Root `LICENSE` | CC BY 4.0 research — byte-identical to pin |
| `NOTICE`, `CONTRIBUTING.md`, `docs/THIRD_PARTY_NOTICES.md` | Present |
| Hosting | `docs/HOSTING_READINESS.md` — Build **09B** checklist only |

### Acceptance gates (08F — local)

| Gate | Result |
| --- | --- |
| Starting → clean publication parent | `78631d4` (accepted gaps laboratory; public ancestry root for this freeze) |
| Clean publication branch | `release/v0.2.0-candidate` — 08F tree with sanitised findings-register references (Build 09AR) |
| `research/10_*` / root `LICENSE` | Unmodified vs `a1922f8` |
| Independent Python verifiers (4) | PASS |
| `validate` / `validate:release` | PASS |
| Typecheck | PASS |
| Vitest | PASS (**289**; was 280 @ 08A) |
| Playwright Chromium | PASS (**54**) |
| Production-preview journeys | PASS (**7**) |
| Production build + `check:artifacts` | PASS |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Axe retest | label-content-name-mismatch **0**; definition-list **0**; heading-order **0**; residual link-in-text-block / landmark debt documented |
| Remote CI / hosted origin / owner auth | **PENDING** (external) |

**Local RC verdict:** PASS (conditional on documented residual a11y debt not blocking).  
**Public-release readiness:** NOT READY (remote CI, 09B host verification, owner authorisation).

### Acceptance gates (Build 08P — local)

| Gate | Result |
| --- | --- |
| Starting HEAD | `78631d4` on `feat/v0.2-release-candidate` (uncommitted 08P work) |
| Independent Python atlas / casebook / mechanisms / gaps | PASS |
| Atlas / casebook / LICENSE | Unchanged vs `a1922f8` |
| `validate` / `validate:release` | PASS |
| Typecheck | PASS |
| Vitest | PASS (**280**) |
| Playwright Chromium (dev 4173) | PASS (**54**) |
| Production-preview journeys A–E + stubs | PASS (**7**) |
| Production build | PASS |
| `npm audit` (omit dev) | 0 vulnerabilities |
| Screenshots (unstaged) | `docs/screenshots/build-08p/` (45 native-resolution PNGs) |

**Bundle (08P vs Build 08 RC):**

| Chunk | Build 08 RC | Build 08P |
| --- | ---: | ---: |
| Eager `index-*.js` | ~283 kB / ~85 gz | **333 kB / 97 gz** |
| Shared vendor/research | ~224 / ~66 | **224 / 66** |
| CSS | (smaller Tailwind-only) | **60 / 11** |
| Initial `/` (index+shared) | ~507 / ~151 | **~557 / ~163** |
| `ComparisonPage` lazy | ~86 / 22 | **22 / 6** (+ `comparisonQueries` 66 / 18) |

Growth is from the adopted design-system CSS and denser shell/claims/overview on the eager path. No `chunkSizeWarningLimit` increase. Design-exploration artefacts are not in `dist/`.

**Verdict:** Build 08P local implementation complete — **pending independent release-candidate acceptance**. Not committed, merged, pushed, published or deployed.

### Production differences from approved prototype (intentional)

- Full RC research depth retained (evidence-use qualifications, gap partitioning, mechanism profiles, all Overview substantive sections) — prototype was a vertical slice.
- Orientation matrix kept as complete `OrientationTable` inside secondary `<details>`, not a shortened list.
- Page titles use human-readable labels (Evidence library, Investigations, Research gaps) while canonical routes are unchanged.
- Overview keeps Build 08 research insights, boundaries, outcome explorer, and provenance below the editorial entrance.
- Mechanisms/Gaps are full production modules, not prototype stubs.
- Two-claim compare uses band layout with complete atlas fields (not the thin stub).

### Remaining deficiencies / release blockers

- **External hosting / SPA fallback** verification on chosen host (**Build 09B**).
- **Owner release authorisation** / publish / deploy.
- Playwright Firefox/WebKit not installed in this environment (Chromium only); Playwright WebKit ≠ Safari.
- Developer inspection only — not formal WCAG certification or user testing.
- Occasional Vitest fake-timer flake risk in `navigation-commit` under parallel load (assertion hardened with `waitFor`).
- Remote GitHub Actions not executed in this session.

### Deferred (explicit non-goals)

- Horizon 2 Analytical Sandbox / assumption-evaluation engine
- Further research modules
- Exact pixel cloning of the limited prototype

## Technical architecture

- **Source of truth:** `research/10_policy_claims_atlas.csv` + `research/10_policy_assessment_casebook.md`
- **Gaps registry:** `src/research/gapsRequirements.ts` (version `2026.11.22-b08`)
- **UI shell:** Direction C workspace rail (desktop) + dialog drawer (mobile); Overview editorial (no rail)
- **Search:** substring + same-field whole-word fallback (`src/research/queries.ts`)
- **Ingest / validate / verify:** `npm run ingest`, `validate`, `validate:release`, `verify:research`
- **CI:** `.github/workflows/verify.yml` (no deploy)

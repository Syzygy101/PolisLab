# Build 08A findings register — Build 08F remediation

Independent Build 08A audit report (locally retained audit evidence; not published with this release).  
Branch at audit: `feat/v0.2-release-candidate` @ `78631d41b241c44af0a48736c5c372e9bf13e237`

| ID | Severity | Finding | Affected path(s) | Reproduction | Correction | Regression | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | High · public CI | Artifact gate false-fails on pinned public citation strings | `.github/workflows/verify.yml`; `scripts/check-artifact-safety.ts` | Clean build; `rg` match on `research/04_pilot_sample.csv` etc. in dist JS (local audit evidence: ci-artifact-gate.log) | Allowlist tokens present in pinned published corpus; fail on real unpublished files and unapproved embedded tokens | `tests/unit/build08f-audit-remediation.test.ts` positive + two negatives; `npm run check:artifacts` | Closed |
| F-02 | Medium · research interpretation | Broad absence claims (“…exist”) for diversion / Part 3 causal eval | `src/research/comparisonDataset.ts` (outcome + evidence associations) | Rendered Case 3/4 cards; dataset strings at former L902/965/1045/1168/1565/1657 | Release-scoped “registered in the published release” language aligned to ATLAS-GAP-002/003 | `build08f-audit-remediation.test.ts` absence wording | Closed |
| F-03 | Medium · evidence association | Case 3 Sadun pathway cited ATLAS-LIT-002 (warehouse-club) | `comparisonDataset.ts` `C3-PATH-UNFAV-1` | Policy Comparison Laboratory pathway sources | Cite ATLAS-LIT-003 as UK comparative warning; explicitly exclude LIT-002 as Sadun support | `build08f-audit-remediation.test.ts` Case 3 pathway | Closed |
| F-04 | Medium · a11y | Evidence-library accessible names omit visible labels (86@1440 / 43@390) | `ClaimsTable.tsx` | axe `label-content-name-mismatch` on `/claims` (local accessibility audit: axe.log) | Remove overriding `aria-label`; visible text is name; claim ID via `aria-describedby` | Updated layout/e2e selectors; axe retest | Closed |
| F-05 | Medium · a11y | Overview outcome buttons label mismatch; invalid description-list | `OutcomeStageExplorer.tsx`; `OverviewPage.tsx` `CoverageStat` | axe on `/` | Drop colon `aria-label`; put coverage hint inside `<dd>` | axe retest | Closed |
| F-06 | Low · interface semantics | Inline links without persistent non-colour cue; repeated table region names; skipped heading levels | Overview/Mechanisms/Gaps/Comparison links; `CasebookMarkdown.tsx`; `ComparisonRequirements.tsx` | axe `link-in-text-block`, `landmark-unique`, `heading-order` | Persistent underline; unique table region labels; `h4`→`h3` for requirements | axe retest | Closed |
| F-07 | Low · citation parsing | Embedded IDs linkified (`XATLAS-LEG-001`, `ATLAS-LEG-001ABC`) | `casebookCitations.ts` | Local citation audit: citations.log | Whole-token boundaries (leading + trailing alphanumerics) shared by extract/linkify | `build08f-audit-remediation.test.ts` + existing citation suite | Closed |
| F-08 | Low · acceptance coverage | Preview journeys jump routes; Journey E may skip compare; subset equality app-vs-app | `tests/e2e/investigation-journeys.spec.ts` | Audit observation | Strengthen journeys: real controls, required compare, exact CSV expected IDs | e2e preview suite | Closed |
| F-09 | Low · public copy / staging | README said software licence undecided; staging risk for screenshots/design | `README.md`; `.gitignore`; licence files | README L86 vs `SOFTWARE_LICENCE_DECISION.md` | Apply Apache 2.0 (`LICENSE-SOFTWARE`); update README/NOTICE/footer; ignore screenshots | Licence hash check; docs review | Closed |

## Source-side issues (not application defects; future research release)

| ID | Note | Action in 08F |
| --- | --- | --- |
| S-01 | Case 4 §2 lists LEG-005 beside notifications/waivers/Part 3; atlas pin is FATA land interests | Curated explanation already distinguishes; research bytes unchanged |
| S-02 | Case 1 §4 pairs EMP-001/EMP-002 with planning wording; EMP-001 atlas tags are M1a/M1c only | Keep pin byte-exact; record for future research release |

## Resolution rule

A finding is **Closed** only when the specific defect is corrected **and** a targeted regression would fail if the defect returned. Existing green tests alone do not close a finding.

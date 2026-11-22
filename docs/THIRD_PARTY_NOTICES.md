# Third-party notices (inventory summary)

**Build:** 08F (local release candidate)  
**Purpose:** Summarize dependency licence classes for redistribution planning.  
**Authoritative detail:** `package-lock.json` and `npx license-checker` (run before public release).

## Runtime dependencies (`dependencies`)

Predominantly **MIT**, including:

| Package family | Role | Typical licence |
| --- | --- | --- |
| `react`, `react-dom` | UI runtime | MIT |
| `react-router-dom` | Client routing | MIT |
| `zod` | Structured validation | MIT |
| `papaparse` | Atlas CSV parsing (ingest) | MIT |
| `unified`, `remark-parse`, `remark-gfm`, `react-markdown`, `mdast-util-to-string`, `unist-util-visit` | Markdown / casebook rendering | MIT |

Exact versions are pinned in `package-lock.json`. This document does not duplicate version numbers.

## Build and test dependencies (`devDependencies`)

Used for development, CI, and producing `dist/`. Not shipped as application logic in the static build, but relevant for **source** redistribution:

| Licence (class) | Approx. count (transitive tree) | Examples |
| --- | ---: | --- |
| MIT | majority | Vite, Vitest, Tailwind, many plugins |
| Apache-2.0 | several | TypeScript, Playwright, `aria-query` |
| ISC | few | `picocolors`, `saxes` |
| BSD-2-Clause / BSD-3-Clause | few | `entities`, `source-map-js`, `tough-cookie` |
| MPL-2.0 | few | `lightningcss` (+ platform binary) |
| BlueOak-1.0.0 | few | `lru-cache`, `graceful-fs` |
| 0BSD | few | `tslib` |

Counts shift with lockfile updates. Last summarized classes (Build 08F): MIT 215, Apache-2.0 9, ISC 3, BSD-2-Clause 2, BlueOak-1.0.0 2, MPL-2.0 2, BSD-3-Clause 2, 0BSD 1, plus the root package metadata.

## Root package metadata

`package.json` currently lists `"private": true` and may report `UNLICENSED` to `license-checker` for the workspace package itself. **Redistribution of the PolisLab application source is governed by LICENSE-SOFTWARE (Apache 2.0) and NOTICE**, not by the npm `license` field alone. Aligning `package.json` `"license": "Apache-2.0"` is optional housekeeping for a future commit; it was not required for Build 08F licence application.

## Fonts (not npm packages)

Loaded at runtime from **Google Fonts** (remote):

| Family | Licence |
| --- | --- |
| Source Sans 3 | SIL Open Font License 1.1 |
| Source Serif 4 | SIL Open Font License 1.1 |
| IBM Plex Mono | SIL Open Font License 1.1 |

Binary font files are **not** vendored in `dist/`. Hosted deployments depend on Google's font CDN (or a self-hosted mirror if the operator chooses one — not configured in this RC).

## Research and external content

- **Published research** in `research/10_*` is **CC BY 4.0** (see root `LICENSE`). Third-party primary sources cited therein are **not** relicensed.
- **Generated JSON** under `src/data/` encodes CC BY research content; treat redistribution of that content under CC BY attribution rules.

## Icons and brand assets

No proprietary icon library is bundled. The geometric PolisLab mark is an original application asset (see NOTICE).

## Unresolved / verify before public release

| Item | Action |
| --- | --- |
| Full transitive licence text collection | Run `npx license-checker --production` and `--development` (or SPDX export) and archive output with the release |
| MPL-2.0 (`lightningcss`) | Confirm compliance expectations for source distribution if shipping full dev tree |
| Google Fonts remote loading | Privacy / GDPR and availability policies for the chosen host; optional self-hosting |
| Playwright browser binaries | Separate Microsoft/Google terms when distributing CI tooling; not part of `dist/` |
| Cited legislation and web primary sources | Link-only; no bundled copies — rights remain with publishers |

Do not guess ownership or institutional affiliation for external materials. When in doubt, flag for owner review rather than asserting clearance.
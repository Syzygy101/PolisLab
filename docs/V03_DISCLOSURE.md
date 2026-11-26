# v0.3 candidate disclosure inventory

The baseline is the exact v0.2.1 production commit `8972f8dfdcf32e29655c8f9fdd51866d8a127ee2`. The candidate adds the following source and test files. Inherited public files retain their existing treatment.

| Exact path | Purpose and licence |
| --- | --- |
| `src/components/retail-development/retail.ts` | Symmetric retail stage, Apache 2.0 |
| `src/components/retail-development/strategic.ts` | Two-action support checks and continuation selection, Apache 2.0 |
| `src/components/retail-development/endogenous.ts` | Three-date development, contracts and ledgers, Apache 2.0 |
| `src/components/retail-development/experiment.ts` | Four synthetic presets and versioned replay, Apache 2.0 |
| `src/pages/RetailDevelopmentPage.tsx` | Guided route and reader-facing explanations, Apache 2.0 |
| `src/pages/retail-development.css` | Route layout, Apache 2.0 |
| `scripts/replay-retail.ts` | Executable replay across every permitted setting, Apache 2.0 |
| `scripts/check-v03-disclosure.py` | Source and asset allowlist check, Apache 2.0 |
| `tests/unit/retail-development.test.ts` | Scientific regressions against the independent references, Apache 2.0 |
| `tests/e2e/retail-development.spec.ts` | Browser journey, Apache 2.0 |
| `tests/fixtures/retail-1-reference.json` | Standalone synthetic verification data, CC BY 4.0 |
| `docs/RETAIL_DEVELOPMENT_METHODS.md` | Standalone model methods, CC BY 4.0 |
| `public/third-party-notices.txt` | Exact upstream browser licence texts and versions |
| `docs/V03_DISCLOSURE.md` | Review inventory and acceptance procedure, Apache 2.0 |

Modified public integration files are `src/App.tsx`, `src/pages/OverviewPage.tsx`, `tests/unit/overview.test.tsx`, `tests/e2e/investigation-journeys.spec.ts`, `playwright.preview.config.ts`, `package.json`, `package-lock.json`, `NOTICE`, `docs/RESEARCH_INVARIANTS.md`, `src/components/layout/AppShell.tsx`, `README.md`, `docs/ROUTE_INVENTORY.md` `docs/MASTER_ROADMAP.md`, `docs/DEVELOPMENT_LEDGER.md`, `playwright.config.ts`, `vite.config.ts` and `.github/workflows/verify.yml`. The lockfile change updates the app version. There are no new dependencies or bundled images. The site retains its inherited Google Fonts requests, listed in NOTICE. Replay controls and computations are local to the browser.

The pinned CC BY 4.0 atlas, casebook and root research licence keep their published hashes. Candidate sources and assets exclude private working papers, scientific sweeps, H3, private fixtures, unpublished case records, the full internal Sandbox and raw acceptance evidence. No source maps are distributed. The generated-asset check permits the existing production chunk roles and the new retail development route's script and stylesheet. Run `python3 scripts/check-v03-disclosure.py` before regeneration, then repeat with `--built` after building and run the inherited `check:artifacts` gate. The checker also pins the reviewed lock and browser notices.

## Dependency and notice review

The lock has 321 package entries. All 236 locally installed package versions and declared licences match it. The 85 absent entries are optional packages for other platforms. Lock entries use MIT, Apache-2.0, MPL-2.0, ISC, 0BSD, BSD-2-Clause, BlueOak-1.0.0 or BSD-3-Clause. Node packages are installed by the build and test workflow. The release does not ship node_modules.

The Vite production module inventory identifies 75 npm packages contributing retained JavaScript. The browser notice also covers Tailwind CSS and the generated Vite and Rolldown runtime helpers, for 78 packages in total under MIT or ISC. The full applicable upstream texts accompany the actual artifact. The Google Fonts families retain their upstream OFL 1.1 terms and are fetched on demand. See the upstream notices for [IBM Plex Mono](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt), [Source Sans 3](https://github.com/google/fonts/blob/main/ofl/sourcesans3/OFL.txt) and [Source Serif 4](https://github.com/google/fonts/blob/main/ofl/sourceserif4/OFL.txt).

## Human acceptance procedure

Record the exact source commit and SHA-256 build inventory. For each run record the device, operating system, browser and assistive technology versions, viewport or zoom, each observed outcome and any reproduction steps. Local automated results and human observations each have their own evidence.

1. **Physical devices.** On iOS Safari and Android Chrome, open the comparison and operate each control by touch in portrait and landscape. On desktop Safari and on Windows Chromium or Firefox, repeat with a keyboard and at 200% browser zoom. Enlarge device text on mobile. Check that signs, timelines and account columns remain readable. Traverse history with Back, then reopen the exact replay and compare against the values in the methods.
2. **Assistive technology.** Use actual VoiceOver with macOS Safari and iOS Safari, NVDA on Windows, and TalkBack on Android. Locate the main heading and comparison controls by landmarks. Change the scenario and the horizon, check the result announcement and retained focus, read the two timelines and actor table in order, then open methods and the exact replay. Test linear navigation and table row and column headers. Record actual speech, focus loss or missed state changes when useful.
3. **Formative comprehension.** Give participants the experiment link and separate tasks before explaining the model. Ask them to find when a store opens, explain the differences between lease signing and approval, reproduce the denial link and explain why the fee appears even when approval is denied. Ask what the two- and three-year comparisons imply and what the numbers can establish about an Australian market. Record unprompted successes, errors, requests for help and relevant verbatim observations with permission. Report the sample size, devices and sampling limitations. Require usable recovery of the timeline and a clear distinction between synthetic outputs and published evidence. Repair serious failures and retest the affected task.
4. **Promotion gate.** Review the exact candidate, notice/provenance and discrepancy log. Exact-candidate CI, hosted verification and preview acceptance require the appropriate authorization and run evidence. Physical-device, live assistive-technology and participant outcomes remain open until observed.

The public candidate is for local engineering and scientific review. Production and any subsequent preview have separate approval gates.

# Software licensing decision note (application layer)

**Research licence:** Creative Commons Attribution 4.0 International (CC BY 4.0) — see root `LICENSE`. **Do not alter.**

**Software / application layer:** **Apache License 2.0 — applied (Build 08F).**

Recorded during Build 08D2 (Direction C design milestone), 22 November 2026.  
Reconfirmed during Build 08P (production design adoption).  
**Applied during Build 08F:** official Apache 2.0 text in `LICENSE-SOFTWARE`; attribution in `NOTICE`; contributing and third-party notice docs updated.

## Decision

| Layer | Licence | Status |
| --- | --- | --- |
| Published research artefacts | CC BY 4.0 | Retained unchanged (root `LICENSE`; `research/10_*`) |
| Application software | Apache 2.0 | **Applied** (`LICENSE-SOFTWARE`, `NOTICE`, `CONTRIBUTING.md`) |

Research and software licences remain **separate files**. The research `LICENSE` was not modified in 08F.

## Rationale (owner)

Apache 2.0 preferred for explicit patent grant and institutional contribution clarity, while remaining compatible with separate CC BY 4.0 research artefacts.

## What Build 08F delivered

1. `LICENSE-SOFTWARE` — unmodified Apache License 2.0 text from https://www.apache.org/licenses/LICENSE-2.0.txt
2. `NOTICE` — copyright and attribution for software, research, generated data, fonts, and dependencies
3. `CONTRIBUTING.md` — Apache 2.0 contribution terms (no separate CLA)
4. `docs/THIRD_PARTY_NOTICES.md` — dependency and font inventory summary
5. README, in-app footer, and release documentation updated to reflect **applied** licences (local RC; not a public release announcement)

## Dependency / asset overview

| Category | Notes |
| --- | --- |
| Runtime deps | React, React DOM, React Router, Zod, PapaParse, unified/remark/mdast stack — predominantly MIT |
| Build / test | Vite, Vitest, Playwright, Tailwind, TypeScript — predominantly MIT / Apache-2.0 (+ MPL-2.0 for lightningcss) |
| Fonts | Source Sans 3, Source Serif 4, IBM Plex Mono via Google Fonts (SIL OFL 1.1); remote load, not binary redistribution in `dist/` |
| Icons | Original geometric mark; no proprietary icon pack |
| Research text | CC BY 4.0 (attribution required when redistributing research content) |

Run `npx license-checker --summary` (or equivalent) before public release for an authoritative inventory archive.

## Remaining gates (public release — not Build 08F)

Public release and hosted deployment remain blocked pending:

1. **Remote CI** execution on the canonical host (GitHub Actions or successor) with owner visibility
2. **Hosting / SPA fallback** verification on the chosen production origin (Build **09B** checklist — see `docs/HOSTING_READINESS.md`)
3. **Owner release authorisation** (tag, publish, deploy)

Licence application for software is **no longer** a blocker for local RC documentation; hosting and owner auth still are.
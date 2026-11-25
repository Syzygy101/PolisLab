# Contributing to PolisLab

Thank you for your interest in PolisLab. This document describes how to
contribute to the **application software** layer. It does not change the
licence on published research.

## Licences

| Layer | Licence | File |
| --- | --- | --- |
| Application software | Apache License 2.0 | [LICENSE-SOFTWARE](LICENSE-SOFTWARE) |
| Published research (`research/10_*`) | CC BY 4.0 | [LICENSE](LICENSE) |

See [NOTICE](NOTICE) for attribution summary and [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md) for dependency notes.

## Contributor licence terms (software)

By submitting a contribution to the application software (code, tests, or
documentation that is part of the software release), you agree that your
contribution is licensed under the **Apache License 2.0**, consistent with the
project's software licence.

There is **no separate Contributor Licence Agreement (CLA)**. Apache 2.0's
contribution terms apply via submission to the repository.

## Published research

- Do **not** edit `research/10_*`, the root research `LICENSE`, or other
  pinned research artefacts without explicit owner coordination and the
  research release process (`npm run validate:release` enforces pins).
- Unpublished material under `research/01–09` and `references/` must not be
  staged or published.

## Before you open a change

1. Run `npm ci`, `npm run validate`, and `npm run validate:release`.
2. Run `npm run typecheck` and `npm run test` (and `npm run test:e2e` when UI
   routes or shell behaviour change).
3. Preserve research invariants in [docs/RESEARCH_INVARIANTS.md](docs/RESEARCH_INVARIANTS.md).
4. Do not add policy rankings, welfare forecasts, simulated economic effects,
   or features that contradict the methodological boundaries in the README.

## Pull requests and commits

- Keep changes focused; separate software changes from any future research-release work.
- Document user-visible behaviour in README or module docs when appropriate.
- Do not commit local screenshots, design-exploration prototypes, or audit
  packets unless the owner explicitly requests them for publication.

## Questions

For licence or research-boundary questions, refer to
[docs/SOFTWARE_LICENCE_DECISION.md](docs/SOFTWARE_LICENCE_DECISION.md) and the
development ledger. Public release and hosting remain separate owner gates.
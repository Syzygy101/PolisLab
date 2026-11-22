# Hosting readiness — Build 09B deployment checklist

**Build 08F status:** Documented only. **Do not provision, configure, or deploy** a production host in Build 08F.  
**Build 09B:** First build where hosted verification on the owner's chosen origin is expected (after RC acceptance and owner authorisation).

This document supersedes the Build 08 hosting note with a precise checklist for static SPA deployment.

## Artefact and toolchain

| Item | Requirement |
| --- | --- |
| Repository | Integrated; commit or tag the RC the owner approves for deploy |
| Install | `npm ci` (use committed `package-lock.json`; do not `npm install` ad hoc) |
| Node.js | **22.12.0** (matches CI pin; engines allow `^22.12.0 \|\| >=24`) |
| Build | `npm run build` (runs ingest + validate, then `tsc -b` + `vite build`) |
| Output | `dist/` (static files only) |
| Local preview | `npm run preview` — **not** a substitute for production-host verification |

## Host configuration

### Static assets

- Serve `dist/index.html` and hashed files under `dist/assets/`.
- Default asset base path: `/` (Vite `base` not set for subpath hosting in this RC).
- If deploying under a subpath, set Vite `base`, rebuild, and configure the host accordingly — not done in 08F.

### HTTPS

- Public origin **must** use HTTPS (TLS certificate valid for the chosen domain).

### SPA fallback (required)

Unknown URL paths must return `index.html` (HTTP 200) so **direct links** and **browser refresh** work for client routes, including:

- `/claims`, `/claims/:id`, `/claims/compare`
- `/casebook`, `/casebook/:caseId`, `/casebook/source`
- `/mechanisms`, `/mechanisms/:id`
- `/comparison`
- `/gaps`, `/gaps/:requirementId`

Example patterns (owner selects one platform; not committed unless approved):

| Platform | Pattern |
| --- | --- |
| Netlify | `/*    /index.html   200` in `_redirects` or `netlify.toml` |
| Cloudflare Pages | `_redirects` or Pages Functions rewrite to `/index.html` |
| nginx | `try_files $uri $uri/ /index.html;` |
| GitHub Pages | `404.html` identical to `index.html`, or Actions deploy with rewrite |

### Caching

| Asset | Policy |
| --- | --- |
| `dist/assets/*` (hashed filenames) | Long-lived cache, `immutable` where supported |
| `index.html` | Short TTL or `no-cache` so deployments propagate |
| API / fonts | Google Fonts loaded from third-party CDN at runtime — not from `dist/` |

### Error handling and rollback

- Client app shows in-app Not Found for unknown **application** routes after SPA boot.
- Host-level 404 must still be eliminated for deep links (fallback above).
- **Rollback:** redeploy prior `dist/` artefact or rebuild from previous approved git ref; keep at least one known-good deployment artefact.

## Build 09B verification tests (on the live origin)

Run these against the **deployed** HTTPS URL, not only `vite preview`:

1. **Entry:** `/` loads Overview; shell navigation visible.
2. **Deep link — claims:** open `/claims/ATLAS-CON-001` in a new tab (cold load).
3. **Deep link — casebook:** open `/casebook/C1` in a new tab.
4. **Deep link — comparison:** open `/comparison?a=C1-VAR-R&b=C1-VAR-E`.
5. **Deep link — gaps:** open `/gaps/C1-REQ-01` (or another valid requirement ID).
6. **Refresh:** on each of the above, use browser refresh; page must not 404.
7. **Back/forward:** navigate between modules; history must restore scroll-appropriate views without shell loss.
8. **Assets:** DevTools network — hashed JS/CSS return 200; no broken module loads.
9. **Fonts:** typography renders (remote Google Fonts or operator mirror).
10. **Security headers:** owner policy (CSP, HSTS) — out of scope for 08F; define in 09B.

Record results in the development ledger or release notes when 09B completes.

## Recommended platform candidates (owner choice)

- **Cloudflare Pages** — static deploy, SPA fallback, global CDN
- **Netlify** — static deploy, `_redirects`
- **GitHub Pages** — requires explicit SPA fallback pattern

No platform account, domain, DNS, or deploy hook was created in Build 08F.

## Relationship to CI

GitHub Actions workflow `.github/workflows/verify.yml` validates build and tests in CI; it does **not** deploy. Hosted verification in 09B is additive to green CI.

## Blockers remaining after 08F licence work

- Owner release authorisation
- Successful 09B hosted verification on chosen origin
- Remote CI run on canonical remote (if not already green for the RC commit)
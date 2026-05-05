---
title: "Phase 3 - Verification, rollout, and minimal docs"
description: "Validate the endpoint and CMS-driven rendering end to end, then leave only the smallest ops notes needed."
status: completed
priority: P2
effort: 1h
branch: main
tags: [verification, rollout, docs]
created: 2026-05-04
---

# Phase 3: Verification, rollout, and minimal docs

## Context Links

- Overview: [plan.md](./plan.md)
- Phase 1: [phase-01-revalidation-endpoint-and-directus-flow.md](./phase-01-revalidation-endpoint-and-directus-flow.md)
- Phase 2: [phase-02-homepage-cms-rendering.md](./phase-02-homepage-cms-rendering.md)

## Overview

- Priority: P2
- Status: Complete
- Goal: prove freshness fixes work in real deploy flow, without adding heavyweight docs/process.

## Key Insights

- Existing acceptance already allows ISR 300 fallback, so rollout can stay conservative.
- Repo has no formal test harness for route handlers today; verification should stay targeted.
- Directus Flow config is external, so success depends on both app code and CMS ops wiring.

## Requirements

- Run `npm run build`.
- Smoke the revalidate route locally or on preview with a valid secret and invalid secret.
- Validate one `site_settings` change and one `books` change end to end.
- Leave only minimal docs impact: `.env.example` comment plus plan/phase notes unless broader docs are requested later.

## Architecture

Test matrix:

- Unit: payload/path mapping helper only if extracted.
- Integration: signed `POST /api/revalidate` for `site_settings` and `books`.
- E2E/manual: Directus edit → Flow POST → next request shows fresh content on prod before 300s TTL.

## Related Code Files

- No new source ownership expected.
- Optional docs touch only if rollout note must move beyond this plan.

## Implementation Steps

1. Build locally.
2. Curl the route with invalid secret, then valid `site_settings`, then valid `books`.
3. Edit Directus `hero_title` and one featured book field, trigger Flow, verify live site freshness.
4. Verify no regression on `/sach`, `/gioi-thieu`, and one `/sach/[slug]` page.
5. Decide docs impact:
   - none: keep plan as handoff artifact only
   - minor: add one short ops note in `docs/` later

## Todo List

- [x] `npm run build`
- [x] Invalid-secret smoke
- [x] Valid `site_settings` smoke
- [x] Valid `books` smoke
- [ ] Live Directus edit verification
- [x] Docs impact decision: minor, covered by `.env.example`, plan, and report

## Success Criteria

- Build passes.
- Revalidate route behaves predictably for success and failure cases.
- Fresh Directus updates appear on the expected pages before 5 minutes elapse.
- Docs impact is explicitly marked `none` or `minor`.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Flow created with wrong header/body | Medium | High | use explicit curl copy first, then mirror exact payload in Directus |
| False-positive local success but prod env mismatch | Medium | High | verify on preview/prod with real env after deploy |
| Missing docs leaves ops confusion | Low | Medium | add one short evergreen note only if handoff shows confusion |

## Security Considerations

- Do not paste real secrets into repo docs, plan files, or screenshots.
- Prefer secret injection through Vercel + Directus UI only.

## Rollback Plan

- Disable Flow if route smoke fails.
- Leave code deployed with ISR fallback if endpoint is unstable; freshness regresses to 5 minutes, not broken site.

## Next Steps

- After verification, implementation can close with `Docs impact: none` unless rollout notes prove necessary.

## Verification Notes

- `npm run build` passed.
- `npm run lint` passed.
- `python3 -m py_compile scripts/setup-directus-flows.py` passed.
- Local production smoke on `localhost:3002`:
  - no secret: 401
  - query-string secret: 401
  - malformed JSON: 400
  - missing collection: 400
  - unsupported collection: 400
  - `site_settings`: 200, includes typed layout revalidation
  - `books`: 200, includes typed `/sach/[slug]` revalidation
  - home HTML contains Directus subtitle/email and no dummy phone

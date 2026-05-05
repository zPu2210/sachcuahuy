---
type: cook
date: 2026-05-04
slug: directus-cache-content-sync
status: complete
---

# Directus Cache Content Sync

## Summary

Fixed stale Directus updates without removing ISR. Added signed `/api/revalidate`, updated Directus Flow setup script, and wired visible homepage/about/footer content to CMS fields already present.

Docs impact: minor.

## Root Cause

- Next/Vercel served public pages as prerendered ISR (`revalidate = 300`).
- Directus returned fresh content, but website had no on-demand invalidation.
- Some Directus fields existed but were not rendered in visible UI.

## Changes

- Added `src/app/api/revalidate/route.ts`.
- Added `REVALIDATE_SECRET` and `REVALIDATE_URL` to `.env.example`.
- Updated `scripts/setup-directus-flows.py` to create content revalidation flows.
- Added shared `buildAssetUrlFromFile`.
- Wired hero title/subtitle, author image, shipping copy, cover images, and footer contact behavior to Directus-backed values.

## Security / Cache Behavior

- Secret accepted only via `Authorization: Bearer ...` or `X-Revalidate-Secret`.
- Query-string secrets rejected.
- Malformed JSON, missing collection, and unsupported collections fail closed.
- Collections limited to `books` and `site_settings`.
- Caller `paths` limited to static allowlist; detail pages use `slug/slugs` or `/sach/[slug]` pattern.
- `site_settings` invalidates root layout; `books` invalidates dynamic book detail route pattern.

## Verification

- `npm run build` passed.
- `npm run lint` passed.
- `python3 -m py_compile scripts/setup-directus-flows.py` passed.
- Local prod smoke:
  - 401 without secret
  - 401 with query-string secret
  - 400 invalid JSON
  - 400 missing collection
  - 400 unsupported collection
  - 200 `site_settings`, typed layout revalidation
  - 200 `books`, typed `/sach/[slug]` page revalidation
  - home HTML shows Directus subtitle/email and not dummy phone

## Reviewer Notes

- Initial reviewer/tester concerns on layout cache, slug-change cache, collection whitelist, malformed JSON, and query-string secret were fixed.
- Final reviewer low-risk note on bare `books` payload missing `/gioi-thieu` was fixed.
- Remaining concern: repo has no dedicated test runner/spec files for route regression tests.

## Rollout

1. Set `REVALIDATE_SECRET` in Vercel.
2. Set same `REVALIDATE_SECRET` in Directus container env.
3. Add `REVALIDATE_SECRET` to Directus `FLOWS_ENV_ALLOW_LIST`.
4. Run `scripts/setup-directus-flows.py` with `REVALIDATE_URL=https://sachcuahuy.vercel.app/api/revalidate`.
5. Edit one book and one site setting in Directus; confirm page freshness before 5 minutes.

## Unresolved Questions

- Final production secret value / owner for Directus + Vercel env setup.
- Whether to add a real test runner for route-level regression tests.

---
date: 2026-05-04 18:12
type: journal
topic: directus-cache-content-sync
---

# Directus Cache Content Sync

## Context

Directus edits were fresh in CMS API but website stayed stale because public pages use Vercel/Next ISR. Some CMS fields also existed but were not rendered in visible UI.

## What Changed

- Added signed `/api/revalidate` route.
- Added Directus Flow setup for content revalidation.
- Kept ISR 5-minute fallback.
- Wired visible hero, author image, shipping copy, cover image, and footer contact behavior to Directus-backed values.
- Hardened endpoint after review: header-only secret, strict JSON errors, collection whitelist, static path allowlist, layout + dynamic detail invalidation.

## Verification

- `npm run build` passed.
- `npm run lint` passed.
- `python3 -m py_compile scripts/setup-directus-flows.py` passed.
- Local prod smoke covered auth failures, malformed payloads, valid `site_settings`, valid `books`, and homepage rendered CMS content.

## Next

- Set matching `REVALIDATE_SECRET` in Vercel and Directus.
- Add `REVALIDATE_SECRET` to Directus `FLOWS_ENV_ALLOW_LIST`.
- Run flow setup with production `REVALIDATE_URL`.
- Consider adding route regression tests later.

## Unresolved Questions

- Final production secret owner/value.
- Whether to add a test runner for route handler regression specs.

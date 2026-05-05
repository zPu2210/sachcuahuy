---
title: "Directus cache + content sync"
description: "Add authenticated on-demand revalidation and wire remaining homepage content to Directus."
status: completed
priority: P1
effort: 4.5h
branch: main
tags: [nextjs, directus, isr, cms]
created: 2026-05-04
relatedPlan: plans/260502-2024-sachcuahuy-production-launch/
---

# Plan: Directus cache + content sync

## Goal

Fix stale CMS updates on Vercel without removing ISR. Add signed `/api/revalidate`, keep `revalidate = 300`, and replace avoidable homepage hardcoded copy with `site_settings` and featured book data.

## Scope

- In: `src/app/api/revalidate/route.ts`, `src/app/page.tsx`, homepage/home-layout components using `site_settings`, `.env.example`, rollout note for Directus Flow payload.
- Out: schema migrations, new CMS collections, broad copy rewrite outside current homepage/layout touchpoints, new test framework.

## Data Flow

- Directus Flow sends signed `POST /api/revalidate` with `collection` and optional `slug`.
- Route validates secret, whitelists collections, derives allowed paths, calls `revalidatePath`, returns invalidated paths.
- Existing ISR 300 stays as fallback if webhook/Flow misses.
- Home/layout pages keep server reads from Directus; `page.tsx` passes `site_settings` and featured book props into UI so visible content reflects CMS values.

## Phases

| Phase | Status | File | Ownership | Blockers |
|---|---|---|---|---|
| 1 | Complete | [phase-01-revalidation-endpoint-and-directus-flow.md](./phase-01-revalidation-endpoint-and-directus-flow.md) | `src/app/api/revalidate/route.ts`, `.env.example` | None |
| 2 | Complete | [phase-02-homepage-cms-rendering.md](./phase-02-homepage-cms-rendering.md) | `src/app/page.tsx`, `src/components/home/*`, `src/components/layout/footer.tsx`, `src/lib/directus-assets.ts` | None |
| 3 | Complete | [phase-03-verification-rollout-and-docs.md](./phase-03-verification-rollout-and-docs.md) | verification notes | None |

## Dependencies

- No blocking dependency from existing plans; this is a narrow follow-up to the production-launch plan, which already ships with ISR fallback.
- Phase 1 and Phase 2 are parallel-safe because file ownership does not overlap.
- Directus Flow setup depends on the Phase 1 payload contract and shared secret env existing in Vercel.

## Success Criteria

- Invalid `POST /api/revalidate` requests fail closed; valid requests invalidate the expected paths.
- `/`, `/sach`, `/gioi-thieu`, `/sach/[slug]` remain ISR 300.
- Homepage hero, author, features, and footer use Directus-backed values where fields exist, with narrow fallbacks only for empty CMS fields.
- `npm run build` passes.

## Validation

- Unit/helper: path mapping and payload validation if helper extraction is used.
- Integration: local/preview signed `POST` smoke for `site_settings` and `books`.
- E2E/manual: edit Directus, fire Flow, verify fresh prod content before the 5-minute TTL expires.

## Risks / Rollback

- Secret leak or arbitrary invalidation: mitigate with header secret, collection whitelist, derived paths only. Rollback: remove env + disable Flow + revert route.
- Empty CMS fields causing weaker UI: keep current fallback strings/images. Rollback: revert Phase 2 only.
- Missing book `slug` in Flow body: fallback invalidates list/home/about routes; detail page still refreshes via ISR 300.

## Open Questions

- Need final production `REVALIDATE_SECRET` value set in both Vercel and Directus.
- Need run `scripts/setup-directus-flows.py` with `REVALIDATE_URL=https://sachcuahuy.vercel.app/api/revalidate` after deploy.

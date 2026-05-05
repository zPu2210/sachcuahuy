---
title: "Phase 1 - Revalidation endpoint + Directus Flow"
description: "Add a signed route handler that maps Directus changes to safe Next.js revalidation paths."
status: completed
priority: P1
effort: 1.5h
branch: main
tags: [nextjs, directus, isr, security]
created: 2026-05-04
---

# Phase 1: Revalidation endpoint + Directus Flow

## Context Links

- Overview: [plan.md](./plan.md)
- Related plan: [../260502-2024-sachcuahuy-production-launch/plan.md](../260502-2024-sachcuahuy-production-launch/plan.md)
- Current readers: [src/app/page.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/app/page.tsx), [src/app/layout.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/app/layout.tsx)

## Overview

- Priority: P1
- Status: Complete
- Goal: cut stale-content window from 5 minutes to next-request-on-webhook, while preserving ISR fallback.

## Key Insights

- Build already passes; root bug is cache invalidation, not fetch failure.
- Vercel serves `PRERENDER`; Directus is already fresh.
- Route must not accept arbitrary paths from the webhook body.

## Requirements

- Add `src/app/api/revalidate/route.ts`.
- Accept signed requests authenticated by `Authorization: Bearer ...` or `X-Revalidate-Secret`.
- Support only the collections the site actually renders now: `site_settings`, `books`.
- Keep `revalidate = 300` untouched on existing pages.

## Architecture

| Stage | Input | Transform | Output |
|---|---|---|---|
| Auth | `x-revalidate-secret` header | compare to env `REVALIDATE_SECRET` | 401/403 on failure |
| Parse | JSON `{ collection, slug? }` | schema-check, whitelist | normalized event payload |
| Invalidate | normalized payload | derive fixed path list | `revalidatePath(...)` calls |
| Respond | invalidated paths | JSON summary | ops visibility without leaking secret |

Suggested mapping:

- `site_settings` → `revalidatePath("/", "layout")` and `revalidatePath("/")`
- `books` → `revalidatePath("/")`, `revalidatePath("/sach")`, `revalidatePath("/gioi-thieu")`, plus `revalidatePath("/sach/{slug}")` when slug exists

## Related Code Files

- Create: [src/app/api/revalidate/route.ts](/Users/pu/Documents/Playground/sachcuahuy/src/app/api/revalidate/route.ts)
- Modify: [.env.example](/Users/pu/Documents/Playground/sachcuahuy/.env.example)
- No other phase edits these files.

## Implementation Steps

1. Add env contract in `.env.example` for `REVALIDATE_SECRET` and `REVALIDATE_URL`.
2. Build minimal route handler using `revalidatePath`, `NextRequest`, `NextResponse`, and existing `zod` dependency if needed.
3. Derive allowed paths from collection + optional slug; reject unsupported collections.
4. Return `{ ok, invalidated, skipped }` JSON for Flow logs and curl smoke tests.
5. Document Directus Flow payload and headers inside the phase handoff note:
   - Header: `X-Revalidate-Secret: <same value as Vercel env>`
   - Body example: `{"collection":"books","slug":"mien-nam-cua-huy"}`

## Todo List

- [x] Add `REVALIDATE_SECRET` / `REVALIDATE_URL` example env
- [x] Create signed `/api/revalidate`
- [x] Whitelist `site_settings` and `books`
- [x] Return path list for observability
- [x] Draft Flow payload/header note in setup script/env comments

## Success Criteria

- Bad secret, missing secret, malformed JSON, missing collection, or unsupported collection all fail closed.
- Valid `site_settings` request invalidates layout/home paths.
- Valid `books` request invalidates home/list/order/sitemap plus dynamic detail route pattern and detail path when slug exists.
- No page loses ISR fallback.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Secret misconfigured between Directus and Vercel | Medium | High | fail closed, verify with curl before enabling Flow |
| Arbitrary cache purge abuse | Low | High | derive paths server-side only, no user-supplied path pass-through |
| Missing slug in webhook body | Medium | Low | invalidate `/sach/[slug]` route pattern plus shared book surfaces |

## Security Considerations

- Never echo configured secret in body, logs, or response.
- Keep endpoint server-only; no `NEXT_PUBLIC_*` secret.
- Prefer exact header match + method check before body work.

## Rollback Plan

- Disable Directus Flow first.
- Remove `REVALIDATE_SECRET` env if needed.
- Revert `src/app/api/revalidate/route.ts`; ISR 300 keeps site functional.

## Next Steps

- Hand Phase 1 payload contract to Phase 3 verification for curl + Flow smoke.

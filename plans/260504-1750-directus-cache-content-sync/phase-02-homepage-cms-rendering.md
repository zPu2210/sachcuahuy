---
title: "Phase 2 - Homepage CMS rendering"
description: "Replace avoidable homepage/layout hardcoded copy with Directus-backed values while keeping safe fallbacks."
status: completed
priority: P1
effort: 2h
branch: main
tags: [nextjs, directus, homepage, ui]
created: 2026-05-04
---

# Phase 2: Homepage CMS rendering

## Context Links

- Overview: [plan.md](./plan.md)
- Readers: [src/app/page.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/app/page.tsx), [src/app/layout.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/app/layout.tsx)
- Components: [hero-section.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/components/home/hero-section.tsx), [author-section.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/components/home/author-section.tsx), [features-section.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/components/home/features-section.tsx), [footer.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/components/layout/footer.tsx)

## Overview

- Priority: P1
- Status: Complete
- Goal: make homepage-visible copy reflect Directus `site_settings` and featured book data, not stale literals.

## Key Insights

- Home page already loads `getBooks()` + `getSiteSettings()` server-side.
- `hero_title` / `hero_subtitle` affect metadata only today; visible hero still hardcoded.
- `author_image` exists in `site_settings` but no component renders it.
- Shipping feature copy is hardcoded although settings already contain threshold, cities, and flat fee.

## Requirements

- Keep current visual structure; no broad redesign.
- Render Directus values only where practical in current schema.
- Preserve readable fallbacks for empty optional fields.
- Avoid schema changes; use current `SiteSettings` and featured `Book`.

## Architecture

| Source | Transform | Consumer | Exit |
|---|---|---|---|
| `site_settings.hero_title`, `hero_subtitle` | map into hero props | `HeroSection` | visible title/subtitle |
| featured `Book` | keep title/price/slug/description | `HeroSection`, `CTASection` | book CTA unchanged, copy fresher |
| `site_settings.author_*` | map image + short bio | `AuthorSection` | real avatar or initials fallback |
| `shipping_*` + contact fields | format localized copy | `FeaturesSection`, `Footer` | service/footer text from CMS |

## Related Code Files

- Modify: [src/app/page.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/app/page.tsx)
- Modify: [src/components/home/hero-section.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/components/home/hero-section.tsx)
- Modify: [src/components/home/author-section.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/components/home/author-section.tsx)
- Modify: [src/components/home/features-section.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/components/home/features-section.tsx)
- Modify: [src/components/layout/footer.tsx](/Users/pu/Documents/Playground/sachcuahuy/src/components/layout/footer.tsx)
- Modify if needed: [src/lib/types-directus.ts](/Users/pu/Documents/Playground/sachcuahuy/src/lib/types-directus.ts)

## Implementation Steps

1. Extend home-page props so `HeroSection` receives CMS title/subtitle plus featured book.
2. Replace visible hero literals with CMS values; keep current hardcoded strings only as empty-field fallback.
3. Update `AuthorSection` to render Directus image via existing asset URL helper, else keep initials avatar.
4. Generate shipping feature copy from `shipping_threshold`, `shipping_free_cities`, `shipping_flat_fee` instead of fixed text.
5. Leave footer fallback behavior intact, but ensure populated CMS phone/email/social values always win.

## Todo List

- [x] Pass hero title/subtitle from `page.tsx`
- [x] Render `author_image` when present
- [x] Convert shipping copy to derived text
- [x] Confirm footer still handles empty fields gracefully
- [x] Keep file sizes small; avoid side refactors

## Success Criteria

- Home hero text changes when Directus `hero_title` / `hero_subtitle` change.
- Author section shows real CMS image when provided.
- Shipping/service copy reflects current settings values.
- Empty CMS fields still produce a clean homepage with current fallback experience.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CMS text too long for current layout | Medium | Medium | keep existing wrappers/classes; manual viewport smoke on home |
| Missing/broken Directus image | Medium | Low | retain initials fallback path |
| Overreaching into unrelated pages | Low | Medium | limit edits to listed files only |

## Security Considerations

- No new secrets in this phase.
- Reuse existing server-fetched data; do not move CMS reads client-side.

## Rollback Plan

- Revert homepage/layout component edits only.
- Keep Phase 1 live; stale-content fix still stands even if UI mapping reverts.

## Next Steps

- Hand derived copy list to Phase 3 for final smoke on `/`, `/sach`, `/gioi-thieu`.

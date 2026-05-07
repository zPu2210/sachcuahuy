# Magical UI/UX Overhaul Progress Summary

**Date**: 2026-05-08  
**Plan**: `plans/260506-2335-magical-uiux-overhaul/`  
**Latest commit**: `1f3b2be`

## Completed Phases

### Phase 0: Audit
- Full UI/UX audit with P0–P3 severity classification
- A11y compliance gaps documented
- Design token inconsistencies catalogued
- Fix plan: `plans/reports/audit-260504-2119-website-uiux/fix-plan.md`

### QW Sprint (Pre-Phase 1)
- Critical a11y fixes
- Focus management implementation
- Form accessibility improvements

### Session F
- Form a11y + focus management polish
- Mobile menu focus trap
- Sanitizer security improvements

### Phase 1: Home (Shipped — Trimmed Surface Pass)
- Terracotta/cobalt design token migration
- Primitives applied: WatercolorWash, PaperTexture, HandDrawnDividers
- A11y contrast fixes
- **Deferred**: AI hero assets, Directus scene/author fields

### Phase 2: /sach + /sach/[slug] (Shipped — Trimmed Surface Pass)
- Token migration on catalog and detail pages
- Consistent primitive placement
- Focus management on navigation
- **Deferred**: AI book cover art, dynamic chapter illustrations

### Phase 3: /gioi-thieu + /podcast (Shipped — Trimmed Surface Pass)
- Token migration on author intro and podcast pages
- Mixed-language markup (`lang="en"` for English labels in Vietnamese context)
- A11y fix: card label contrast bump `text-ink/50` → `text-ink/70`
- **Deferred**: About subcomponents dir, podcast episode list expansion, subscribe CTA

## Why Trimmed Surface Passes

Chose surface-only pattern to:
1. **Avoid scope creep** — AI asset generation is 4–8 hours per page; deferred to keep shipped work honest
2. **Preserve perf** — no new large images without Lighthouse baseline
3. **Keep contract clear** — "shipped" means tokens + primitives + a11y compliant, not "aspirational features added"

## Key Commits

| Hash | Description |
|------|-------------|
| `1f3b2be` | A11y: card label contrast bump |
| `c7f30ad` | Phase 3 surface pass /gioi-thieu + /podcast |
| `90da699` | Phase 2 magical overhaul /sach + /sach/[slug] |
| `f6fb303` | A11y: mobile-menu focus trap |
| `832af5d` | Session F review findings |
| `df69d23` | Session F form a11y + focus management |

## Deferred Backlog

**AI Assets:**
- Hero images for home, /gioi-thieu
- Chapter scene illustrations
- Podcast cover art

**Directus Schema:**
- `scene_image` field on books
- `author_hero_image` field on site_settings
- Podcast episodes collection

**Features:**
- `/components/about/` directory structure
- Podcast episode list expansion
- Subscribe CTA (Spotify, Apple, Google)

**SEO/Perf (Phase 4):**
- Lighthouse baseline + gate
- JSON-LD Person, PodcastSeries schemas
- Sitemap/dynamic route verification
- OG/meta review
- Gold token cleanup
- `htmlToParagraphs` Vietnamese named entity fix

## Known Unresolved

- **htmlToParagraphs bug**: Vietnamese named entities with middle initials (e.g., "Trọng H. Huy") may split incorrectly on period
- **No push yet**: Changes committed locally but not pushed to origin
- **Dirty plans/** state: Unrelated deleted/modified plans files untouched per instruction
- **Asset generation approach**: AI-generated vs real author photos TBD — affects Phase 4 timeline 2–4x

## Next: Phase 4 SEO/Perf Gate

Scope pending confirmation. Prioritized items:
1. Lighthouse baseline on /, /sach, /sach/[slug], /gioi-thieu, /podcast
2. JSON-LD schemas if missing
3. Sitemap/dynamic route checks
4. OG/meta review
5. Deprecated gold token cleanup
6. `htmlToParagraphs` fix if low-risk

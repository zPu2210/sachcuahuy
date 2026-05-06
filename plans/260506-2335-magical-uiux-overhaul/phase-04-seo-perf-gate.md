---
phase: 4
title: "SEO & Perf Gate (final)"
status: pending
priority: P1
effort: "3h"
dependencies: [2, 3]
---

# Phase 4: SEO & Performance Gate

## Context Links

- Brainstorm: `plans/reports/brainstorm-260506-2335-magical-uiux-overhaul.md` (section 8 — SEO image optimization)
- Phase 1-3 outputs (all pages refactored, all assets generated)
- Existing SEO: `src/app/layout.tsx`, `src/components/seo/json-ld.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`

## Overview

Final gate phase: SEO infrastructure (custom OG images per page, JSON-LD Book + Person + PodcastSeries), final Lighthouse audit (≥85 all 4 pages), gold token cleanup, design system documentation. Locks down brand consistency và search visibility.

## Key Insights

- **OG images**: hiện chỉ 1 generic `/images/book-cover-front.png`. Mỗi page cần custom 1200×630.
- **JSON-LD**: existing có `Organization` schema only (`json-ld.tsx`). Cần thêm `Book`, `Person`, `PodcastSeries`.
- **Sitemap** (`src/app/sitemap.ts`) chưa có image entries → cần thêm `<image:image>` cho rich Google indexing.
- **Gold token cleanup**: tất cả 4 phases done → safe remove `gold` từ tailwind config + grep cho leftover usage.
- **Design system doc** (`docs/design-system.md`) là long-term reference cho future contributors / Huy maintain.

## Requirements

### Functional

1. **Custom OG images per page** (1200×630 WebP each)
   - Home: book hero + signature + tag "Sách Của Huy — Tác phẩm văn học của Trọng Huy"
   - /sach (catalog): "Tủ sách của Huy" với 2 book covers + watercolor backdrop
   - /sach/[slug] per book: book cover + title + author + accent quote (dynamic via Next.js OG image generation)
   - /gioi-thieu: cinematic author hero + "Tác giả Trọng Huy"
   - /podcast: microphone monoline + "Podcast của Trọng Huy"

2. **JSON-LD schemas**
   - `Book` schema cho `/sach/[slug]/page.tsx` (per-book): isbn (if exists), author, datePublished, image, description, offers (price + availability)
   - `Person` schema cho `/gioi-thieu/page.tsx`: name, jobTitle, image, sameAs (social), description
   - `PodcastSeries` schema cho `/podcast/page.tsx` (if scope justifies)
   - All validate via schema.org tester

3. **Sitemap enhancement**
   - Add `<image:image>` per page entry với location + caption
   - Verify all 4 pages indexed
   - Add `/sach/[slug]` dynamic entries (per book)

4. **Final Lighthouse audit**
   - Mobile + desktop, throttled
   - 4 pages: home, /sach, /sach/[slug] (1 book), /gioi-thieu, /podcast
   - All categories ≥85 (perf, a11y, best-practices, SEO)
   - Document scores trong report

5. **Gold token cleanup**
   - Remove `gold` from `tailwind.config.ts`
   - Grep `text-gold|bg-gold|gold-` across codebase, replace any leftover
   - Final build pass

6. **Design system documentation**
   - Create `docs/design-system.md`
   - Token reference table (semantic name → hex → usage rule)
   - Typography hierarchy
   - Component spec cho 4 shared (HandDrawnDivider, WatercolorWash, PaperTexture, SignatureFlourish) + about/book subcomponents
   - Color a11y matrix (which on-which combos pass AA)
   - Image guidelines (filename, alt text format, size targets, storage decisions)
   - Brand tone notes (Indochine literary indie, "magical/poetic")

### Non-functional

- Lighthouse pass all 4 pages mobile ≥85
- All schemas validate qua schema.org tester
- OG images load <500ms each
- Design system doc <800 lines (per CLAUDE.md docs.maxLoc)
- No "AI slop" detectable in final assets (em curate prevent)

## Architecture

```
src/
├── app/
│   ├── layout.tsx                       [MODIFY] update default OG image
│   ├── sitemap.ts                       [MODIFY] add image entries
│   ├── opengraph-image.tsx              [CREATE] dynamic home OG
│   ├── sach/
│   │   ├── opengraph-image.tsx          [CREATE] catalog OG
│   │   └── [slug]/
│   │       └── opengraph-image.tsx      [CREATE] per-book OG (dynamic)
│   ├── gioi-thieu/
│   │   └── opengraph-image.tsx          [CREATE] author OG
│   └── podcast/
│       └── opengraph-image.tsx          [CREATE] podcast OG
└── components/
    └── seo/
        ├── json-ld.tsx                  [MODIFY] expand to Book + Person + PodcastSeries
        ├── json-ld-book.tsx             [CREATE]
        ├── json-ld-person.tsx           [CREATE]
        └── json-ld-podcast.tsx          [CREATE-if-podcast-scope]

tailwind.config.ts                       [MODIFY] remove gold token
docs/design-system.md                    [CREATE]
plans/reports/phase-04-lighthouse-final.md [CREATE]
plans/reports/phase-04-screenshots/      [CREATE-DIR]
```

### OG Image Generation Strategy

Use Next.js 15 built-in `opengraph-image.tsx` route handlers:
- Per route: `app/{route}/opengraph-image.tsx`
- Returns ImageResponse with JSX template
- Static (home, sach, gioi-thieu, podcast) — pre-rendered build time
- Dynamic (`/sach/[slug]`) — params-based, ISR cache
- Use existing local fonts (Cormorant Garamond from layout.tsx) hoặc fetch from Google Fonts in image route

## Related Code Files

### Create
- `src/app/opengraph-image.tsx` (~80 LOC)
- `src/app/sach/opengraph-image.tsx` (~80 LOC)
- `src/app/sach/[slug]/opengraph-image.tsx` (~100 LOC, dynamic)
- `src/app/gioi-thieu/opengraph-image.tsx` (~80 LOC)
- `src/app/podcast/opengraph-image.tsx` (~80 LOC)
- `src/components/seo/json-ld-book.tsx` (~50 LOC)
- `src/components/seo/json-ld-person.tsx` (~40 LOC)
- `src/components/seo/json-ld-podcast.tsx` (~40 LOC, if scope)
- `docs/design-system.md` (~500-700 lines)
- `plans/reports/phase-04-lighthouse-final.md`
- `plans/reports/phase-04-screenshots/*.png` (final visual record)

### Modify
- `src/app/layout.tsx` (default OG fallback updated)
- `src/app/sitemap.ts` (add `<image:image>` per page)
- `src/app/sach/[slug]/page.tsx` (mount JsonLdBook)
- `src/app/gioi-thieu/page.tsx` (mount JsonLdPerson)
- `src/app/podcast/page.tsx` (mount JsonLdPodcast if scope)
- `src/components/seo/json-ld.tsx` (still Organization, no change but verify)
- `tailwind.config.ts` (remove gold)

### Delete
- None (clean retire of gold via removal from config)

## Implementation Steps

### 4.1 — Custom OG images (1h)

**Skill**: `/ck:frontend-design` cho design templates

1. **Home OG** (`app/opengraph-image.tsx`):
   ```tsx
   import { ImageResponse } from "next/og";
   export const size = { width: 1200, height: 630 };
   export const contentType = "image/webp";
   export default async function OGImage() {
     return new ImageResponse(
       <div style={{ background: "linear-gradient(135deg, #1E2B4D, #C75D2C)" }}>
         <h1 style={{ fontFamily: "Cormorant" }}>Sách Của Huy</h1>
         <p style={{ fontStyle: "italic" }}>Tác phẩm văn học của Trọng Huy</p>
         {/* book cover thumbnail + signature */}
       </div>,
       size
     );
   }
   ```
2. **Catalog OG** (`app/sach/opengraph-image.tsx`): "Tủ sách của Huy" + 2 book covers
3. **Per-book OG** (`app/sach/[slug]/opengraph-image.tsx`): dynamic — fetch book by slug, render cover + title + accent quote
4. **About OG** (`app/gioi-thieu/opengraph-image.tsx`): cinematic author + "Tác giả Trọng Huy"
5. **Podcast OG** (`app/podcast/opengraph-image.tsx`): microphone + "Podcast của Trọng Huy"
6. **Test**: `curl http://localhost:3000/opengraph-image` → verify WebP returned
7. **Validate**: opengraph.xyz online checker per route

### 4.2 — JSON-LD schemas (45 min)

**Skill**: `/ck:docs-seeker` cho schema.org reference

1. **Book schema** (`json-ld-book.tsx`):
   ```tsx
   export function JsonLdBook({ book }: { book: Book }) {
     const data = {
       "@context": "https://schema.org",
       "@type": "Book",
       name: book.title,
       author: { "@type": "Person", name: book.author },
       isbn: book.isbn ?? undefined,
       datePublished: book.published_date ?? undefined,
       image: bookImageUrl,
       description: book.short_description,
       offers: {
         "@type": "Offer",
         price: book.price,
         priceCurrency: "VND",
         availability: book.stock_status === "in_stock" 
           ? "https://schema.org/InStock"
           : "https://schema.org/OutOfStock",
       },
     };
     return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
   }
   ```
2. **Person schema** (`json-ld-person.tsx`): name, jobTitle, image, sameAs, description
3. **PodcastSeries schema** (`json-ld-podcast.tsx`): if scope justifies
4. **Mount** trong respective pages
5. **Validate**: schema.org tester per page

### 4.3 — Sitemap enhancement (15 min)

1. Update `src/app/sitemap.ts`:
   - For each entry, add `images` array với url + caption
   - Add `/sach/[slug]` dynamic entries (loop fetched books)
   - Verify Next.js sitemap output handles `<image:image>` (may need custom XML rendering)
2. **Test**: `curl http://localhost:3000/sitemap.xml` → verify image entries

### 4.4 — Gold token cleanup (15 min)

1. Grep codebase: `rg "(text-gold|bg-gold|gold-|#C9A962)" src/`
2. Replace any leftover with `accent` tokens
3. Remove `gold: "#C9A962"` from `tailwind.config.ts`
4. Build pass: `npm run build` — verify no Tailwind warnings

### 4.5 — Final Lighthouse audit (30 min)

1. Build production: `npm run build && npm run start`
2. Lighthouse CLI mobile + desktop per page (4 pages × 2 viewports = 8 runs):
   ```bash
   for url in / /sach /sach/mien-nam-cua-huy /gioi-thieu /podcast; do
     lighthouse "http://localhost:3000$url" --preset=desktop --output=json --output-path="./reports/lighthouse-$(echo $url | tr / -)-desktop.json"
     lighthouse "http://localhost:3000$url" --preset=mobile --output=json --output-path="./reports/lighthouse-$(echo $url | tr / -)-mobile.json"
   done
   ```
3. Verify all scores ≥85
4. Document trong `plans/reports/phase-04-lighthouse-final.md`:
   - Score table per page × category × viewport
   - Compared to Phase 0 baseline (audit lighthouse)
   - Improvements / regressions

### 4.6 — Design system documentation (45 min)

**Skill**: `/ck:docs` cho structure

Sections trong `docs/design-system.md`:

```markdown
# Design System — sachcuahuy.com

## Brand identity
- Vibe: magical, poetic, ấm, sáng tạo, Indochine văn nghệ sĩ indie
- Author: Trọng Huy
- Source materials: ~/Downloads/sachcuahuy/ (mood reference)

## Colors

### Tokens
| Token | Hex | Usage rule |
|---|---|---|
| primary.DEFAULT | #1E2B4D | Headings, buttons, body emphasis |
| primary.light/dark | #2D3F66/#141D36 | Hover states, depth |
| accent.DEFAULT | #C75D2C | Headings, large badges (AA large only) |
| accent.dark | #A04420 | Inline links, body accents (AA normal) |
| accent.light | #E27A4F | Hover states |
| cobalt.DEFAULT | #3856B0 | Decorative, watercolor wash, book spine |
| cobalt.light/dark | #5C7AC9/#27408C | Variations |
| cream | #F8F6F3 | Default page bg |
| paper | #FAF6EC | Warm alt bg (sections) |
| ink | #142849 | Hand-drawn line art (SVG) |

### A11y matrix
| FG ↓ \ BG → | cream | paper | primary | white |
|---|---|---|---|---|
| primary | 12:1 ✅ | 12:1 ✅ | — | 12:1 ✅ |
| accent.DEFAULT | 4.5:1 ⚠️ AA-large | 4.4:1 ⚠️ | 5:1 ✅ | 4.6:1 ⚠️ |
| accent.dark | 6.5:1 ✅ | 6.3:1 ✅ | 3:1 ❌ | 6.7:1 ✅ |
| cobalt.DEFAULT | 6.2:1 ✅ | 6:1 ✅ | 1.4:1 ❌ | 6.4:1 ✅ |

## Typography

| Role | Font | Size | Weight | Usage |
|---|---|---|---|---|
| H1 hero | Cormorant Garamond | 5xl-7xl | 700 | Hero titles |
| H2 section | Cormorant Garamond | 3xl-5xl | 700 | Section headings |
| Body | Inter | base-lg | 400-500 | Paragraphs |
| Quote | Dancing Script | 2xl-3xl | 400-600 | Pull-quotes |
| Caption | Inter | xs-sm | 400 | Image captions, meta |
| Drop cap | Cormorant Garamond | 7xl | 700 | First letter of synopsis/excerpts |

## Components

### Shared (4)
- HandDrawnDivider — variants: wave, sparkle, leaf, dots
- WatercolorWash — colors: cobalt, terracotta, sunset
- PaperTexture — opacity 0.04 default
- SignatureFlourish — Trọng Huy ký SVG

### Domain
- BookCard, BookDetailHero, BookSynopsis, BookExcerpt, RelatedBooks
- AuthorHero, AuthorBioChapter, AuthorPullQuote, AuthorTimeline
- SoundwaveDivider (podcast)

## Imagery

### Storage decision
- Static: `/public/images/motifs/` (decoratives, dividers, signature, hero ambient)
- Static: `/public/images/scenes/` (open-book, page-turn reusables)
- Static: `/public/images/about/` (chapter scenes)
- Static: `/public/images/podcast/` (podcast assets)
- Directus: book covers (real Huy artwork), book scenes per slug, author portraits

### Filename convention
- kebab-case Vietnamese descriptive
- Format: `{subject}-{location-or-action}-{style}.webp`
- Example: `mien-nam-cua-huy-saigon-parasol-watercolor.webp`

### Alt text convention
- Vietnamese, descriptive, semantic context
- Format: "[Subject] [Action] [Setting]" — "Tác giả Trọng Huy ngồi đọc sách bên cửa sổ Sài Gòn"

### Size targets
- Hero scenes: <200KB WebP @ 1280w
- Decorative motifs (SVG): <5KB optimized
- OG images: <300KB WebP @ 1200×630
- Author portraits: <150KB WebP @ 1024w

## Tone & Voice
(text excerpts...)

## Generation prompt templates
(monoline / watercolor / portrait template strings)

## Development workflow
- New asset: gen → curate → optimize → place → alt text → verify
- New page: scout → token check → reuse Phase 1 components → audit findings pickup → Lighthouse gate
```

### 4.7 — Final review (15 min)

Em present:
- All 4 pages final screenshots (mobile + desktop)
- Lighthouse score table
- OG images preview (5 pages)
- JSON-LD validation screenshots
- Design system doc link
- Gold cleanup confirmation
- Total time + token budget actual vs estimated

## Todo List

- [ ] 4.1 Create home OG image route
- [ ] 4.1 Create /sach OG image route
- [ ] 4.1 Create /sach/[slug] dynamic OG
- [ ] 4.1 Create /gioi-thieu OG
- [ ] 4.1 Create /podcast OG
- [ ] 4.1 Validate all OG via opengraph.xyz
- [ ] 4.2 Create json-ld-book component
- [ ] 4.2 Create json-ld-person component
- [ ] 4.2 Create json-ld-podcast (if scope)
- [ ] 4.2 Mount per page
- [ ] 4.2 Validate via schema.org tester
- [ ] 4.3 Update sitemap with image entries
- [ ] 4.3 Add /sach/[slug] dynamic sitemap
- [ ] 4.4 Grep + replace gold token leftover
- [ ] 4.4 Remove gold from tailwind.config.ts
- [ ] 4.4 Build pass
- [ ] 4.5 Lighthouse 4 pages × 2 viewports
- [ ] 4.5 Document scores in report
- [ ] 4.6 Write docs/design-system.md
- [ ] 4.7 Final review presentation

## Success Criteria

- [ ] 5 OG images custom shipped (home, sach, sach-slug, gioi-thieu, podcast)
- [ ] All OG validate via opengraph.xyz
- [ ] JSON-LD Book + Person + (PodcastSeries) ship + validate
- [ ] Sitemap has image entries
- [ ] Gold token removed completely (grep clean)
- [ ] Lighthouse mobile ≥85 all 4 pages all categories
- [ ] LCP <2.8s all pages
- [ ] Design system doc shipped at docs/design-system.md
- [ ] Final report `plans/reports/phase-04-lighthouse-final.md`
- [ ] Anh approve final state → ship merge to main

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Next.js OG image route fails (font loading) | Med | Med | Use base64-embedded font subset, test build prod |
| schema.org validator rejects schema | Low | Low | Use schema.org/validator.schema.org/ pre-ship; common fixes well-documented |
| Lighthouse mobile rớt < 85 sau full overhaul | Med | High | Diagnose: image opt, lazy-load, reduce JS bundle. Worst case: descope 1 ambient image. |
| Sitemap `<image:image>` Next.js native chưa support | Low | Low | Custom XML route handler nếu cần |
| Gold leftover discovery (hardcoded inline styles) | Med | Low | Grep covers most; manual visual scan home + 4 pages catches rest |
| Design system doc lan man → quá 800 LOC | Med | Low | Split nếu cần (design-system-tokens.md + design-system-components.md). KISS: tables over prose. |
| OG image cache không invalidate trên FB/Twitter | Low | Med | Use Facebook Sharing Debugger to force re-scrape post-deploy |

## Security Considerations

- OG images endpoint không leak sensitive data
- JSON-LD không expose unindex'd info (no email, phone)
- Sitemap không include `/dat-hang/*` (transactional, noindex via robots.txt verify)
- robots.txt + meta robots verify final

## Next Steps

After Phase 4 approval:
1. Commit all phases sequentially via `/ck:git`
2. Push to main → Vercel deploy
3. Post-deploy:
   - Verify production opengraph.xyz checks
   - Verify Google Search Console submitted sitemap re-crawl
   - Final Lighthouse production check
   - Cleanup audit dummy order (if not done Phase 0)
4. Mark plan status → completed
5. `/ck:journal` close-out entry
6. Update `docs/development-roadmap.md` + `docs/project-changelog.md` (per documentation-management.md)

## Out-of-scope tracking

- Twitter card validator deep test (skip, OG covers most)
- Bing Webmaster Tools sitemap submit (defer)
- Google Rich Results Test all queries (do basic only, defer comprehensive)
- AMP version (out of scope, MVP)
- Internationalization English/Vietnamese toggle (defer)

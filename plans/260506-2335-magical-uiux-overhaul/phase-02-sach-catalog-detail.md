---
phase: 2
title: "Sach Catalog & Detail"
status: pending
priority: P1
effort: "5h"
dependencies: [1]
---

# Phase 2: /sach Catalog & /sach/[slug] Detail

## Context Links

- Brainstorm: `plans/reports/brainstorm-260506-2335-magical-uiux-overhaul.md`
- Audit integration: `plans/260506-2335-magical-uiux-overhaul/audit-integration-notes.md`
- Phase 1 outputs (tokens + 4 shared components) — REUSE
- Existing files: `src/app/sach/page.tsx`, `src/app/sach/[slug]/page.tsx`, `src/components/book/book-card.tsx`

## Overview

Apply validated Phase 1 patterns sang `/sach` (catalog grid) + `/sach/[slug]` (book detail). Tokens locked, 4 shared components reused. Generate 8-10 scene-specific watercolor assets cho 2 books (Miền Nam, Góc Phần Tư). Detail page = nơi reader read excerpts + commit-to-buy → cinematic storytelling priority.

## Key Insights

- **/sach (catalog)** hiện đơn giản: page header + grid of BookCard. Chỉ cần page-header watercolor banner + reuse PaperTexture + corner doodles.
- **/sach/[slug] (detail)** là trang quan trọng nhất cho conversion. Hiện chưa scout — em sẽ scout đầu Phase 2.
- **BookCard** hiện đã polished với 3D hover, gold-accent badges. Migrate sang terracotta tokens, không restructure.
- **Per-book scene illustrations** = differentiator. Mỗi book 1 hero scene + 2 inline scenes cho excerpts.
- **Book covers giữ nguyên** (Phase 0 decision) — AI chỉ generate ambient + scene art.

## Requirements

### Functional

1. **/sach catalog page**
   - Page-header banner watercolor (terracotta + cream wash)
   - PaperTexture overlay
   - 1 corner monoline doodle (top-right)
   - Title section: "Tủ Sách" + watercolor brush stroke divider
   - BookCard migration: gold tokens → terracotta tokens (no structural change)
   - Empty state: improved illustration (book + sparkles)

2. **/sach/[slug] detail page** (scout first, then build)
   - Hero: 3D book mockup + watercolor scene backdrop (per-book unique)
   - Synopsis section: PaperTexture + drop cap (font-serif large terracotta)
   - Excerpt sections: 2 inline scene illustrations (watercolor) interleaved với prose
   - Author byline: small portrait + signature flourish
   - Price + CTA: terracotta accent + cobalt outline alt
   - Related books / "Tác phẩm khác" carousel
   - JSON-LD `Book` schema (deferred to Phase 4)

3. **8-10 scene-specific assets**
   - **Miền Nam của Huy** (3-4 assets):
     - 1 hero watercolor scene (Saigon street, parasol, cobalt-terracotta palette)
     - 2 inline scenes (memory of childhood / quiet moment)
     - 1 reusable doodle (parasol or fish from cover)
   - **Góc Phần Tư** (3-4 assets):
     - 1 hero watercolor scene (cyclist sunset, mirror cover style)
     - 2 inline scenes (pensive young man, mountain horizon)
     - 1 reusable doodle (bicycle or mountain)
   - **Reusable** (2 assets):
     - Open-book monoline SVG (header for related books section)
     - Page-turn SVG decoration

### Non-functional

- Lighthouse `/sach` + `/sach/[slug]` mobile ≥85
- LCP <2.8s mỗi page
- Hero scene ≤200KB WebP
- Reuse ≥80% Phase 1 components — không tạo shared component mới (trừ khi block)
- Audit findings P0/P1 trên catalog/detail pickup

## Architecture

```
src/
├── app/
│   └── sach/
│       ├── page.tsx                  [MODIFY] catalog page-header + tokens
│       └── [slug]/
│           ├── page.tsx              [MODIFY-after-scout] detail full refactor
│           └── (subcomponents?)      [scout reveals]
└── components/
    └── book/
        ├── book-card.tsx             [MODIFY] tokens migration only
        ├── book-detail-hero.tsx      [CREATE-if-needed] 3D book + watercolor scene
        ├── book-synopsis.tsx         [CREATE-if-needed] drop cap + paper texture
        ├── book-excerpt.tsx          [CREATE-if-needed] inline scenes
        └── related-books.tsx         [CREATE-if-needed] carousel

public/images/motifs/                 [REUSE Phase 1]
public/images/scenes/                 [CREATE-DIR]
└── (reusable open-book + page-turn SVGs)

(via Directus assets)
└── books_extra collection?           [SCOUT-phase-2-start]
   - hero_scene per book
   - inline_scene_1 per book  
   - inline_scene_2 per book
```

### Schema decision (post-scout)

Hiện `books` collection chỉ có `cover_image` (single). Để chứa scene art per book có 2 options:

| Option | Pros | Cons |
|---|---|---|
| **A. Add fields tới `books`** (`hero_scene`, `excerpt_scene_1`, `excerpt_scene_2`) | Tight coupling per-book | Schema migration Directus |
| **B. m2m `book_assets`** (separate collection, type enum) | Flexible, scalable | Schema migration + relation |
| **C. Static** `public/images/books/{slug}/` | No CMS work | Huy không edit, deploy required |

→ **Default: A** (3 fields trên `books`) — simplest, anh có 2 books, không scale issue. Schema migration ~10 min via `scripts/setup-directus-schema.py`.

## Related Code Files

### Create
- `src/components/book/book-detail-hero.tsx` (~80 LOC)
- `src/components/book/book-synopsis.tsx` (~50 LOC)
- `src/components/book/book-excerpt.tsx` (~60 LOC)
- `src/components/book/related-books.tsx` (~70 LOC) — only if scout reveals related section needed
- `public/images/scenes/open-book-monoline.svg`
- `public/images/scenes/page-turn-decoration.svg`
- `scripts/add-book-scene-fields.py` (Directus schema migration)

### Modify
- `src/app/sach/page.tsx` (page header + tokens)
- `src/app/sach/[slug]/page.tsx` (full refactor — scope decided post-scout)
- `src/components/book/book-card.tsx` (token migration only)
- `src/lib/types-directus.ts` (add hero_scene/excerpt_scene_1/2 fields if option A chosen)
- `src/lib/books.ts` (fetch new scene fields)

### Directus
- 3 new fields trên `books` collection: `hero_scene` (file), `excerpt_scene_1` (file), `excerpt_scene_2` (file)
- Upload 8-10 generated scenes
- Link scenes per-book

## Implementation Steps

### 2.0 — Scout `/sach/[slug]/page.tsx` (30 min)

**Skill**: `/ck:scout`

1. Read `src/app/sach/[slug]/page.tsx` full
2. Identify sections: hero, synopsis, excerpts, author, related, CTA
3. Identify hardcoded colors / gold leftover
4. Document current heading hierarchy + image count
5. Decide subcomponent extraction strategy (book-detail-hero.tsx, etc.)
6. Confirm scene-storage option (default A: 3 fields trên books)

### 2.1 — Schema migration (15 min)

**Skill**: existing `scripts/setup-directus-schema.py` pattern

1. Write `scripts/add-book-scene-fields.py`:
   - Add 3 fields to `books`: `hero_scene` (file), `excerpt_scene_1` (file), `excerpt_scene_2` (file)
   - Idempotent (check existing fields first)
2. Run + verify via Directus admin UI
3. Update `src/lib/types-directus.ts` Book type
4. Update `src/lib/books.ts` fetch query

### 2.2 — Image generation per-book (2h)

**Skill**: `/ckm:design` + `/ck:ai-artist`

Reference 2 book covers as style anchor:
- Miền Nam cover (cobalt + cream + monoline doodles): hero scene = Saigon street parasol mood, watercolor terracotta accents
- Góc Phần Tư cover (terracotta sunset cyclist): hero scene = pensive cyclist horizon, watercolor warm

For each book: 4 variants per scene → curate top 1.

Style prompts per book:

```
Miền Nam của Huy:
- Hero: "Watercolor scene of Saigon street with conical hat parasol vendor, terracotta sunset, cream paper texture, cobalt deep shadow accents, soft brush strokes, Vietnamese folk Indochine literary aesthetic"
- Inline 1: "Quiet watercolor of young Vietnamese poet writing at wooden desk, window light, terracotta + cream palette, intimate scene"
- Inline 2: "Childhood memory watercolor, boy on bicycle through alley, Saigon 1990s, soft warm light"

Góc Phần Tư:
- Hero: "Watercolor of Vietnamese young man cycling on mountain road at sunset, terracotta sky, mountain silhouette, painterly soft edges, mirror mood of Góc Phần Tư book cover"
- Inline 1: "Pensive young Vietnamese poet sitting at quarter-corner of room, watercolor, melancholic warm tones"
- Inline 2: "Watercolor mountain horizon with single bicycle rider, terracotta + dusty rose"
```

Reusable doodles (monoline) — 1 from each book:
- Parasol from Miền Nam cover (single-stroke cobalt ink)
- Bicycle from Góc Phần Tư (single-stroke cobalt ink)

Open-book SVG + page-turn SVG: monoline cobalt, generic decoration.

Convert: WebP for raster scenes (`cwebp -q 80`), SVGO for monoline.

Filename SEO:
- `mien-nam-cua-huy-hero-saigon-parasol-watercolor.webp`
- `mien-nam-cua-huy-excerpt-poet-desk-watercolor.webp`
- `goc-phan-tu-hero-cyclist-sunset-watercolor.webp`
- etc.

Anh review trước upload.

### 2.3 — Upload Directus + link scenes (15 min)

Use existing `scripts/upload-images-to-directus.sh` pattern:
1. Upload 6 scene WebPs to Directus folder `book-scenes/`
2. PATCH `books/{id}.hero_scene`, `excerpt_scene_1`, `excerpt_scene_2`
3. Verify via Directus admin

### 2.4 — `/sach` catalog refactor (1h)

**Skill**: `/ck:frontend-design`

1. Page header: add `<WatercolorWash color="terracotta" />` + `<PaperTexture />`
2. H1 "Tủ Sách": replace gold accent → `text-accent-dark`
3. Watercolor brush stroke divider below H1 (new asset or reuse Phase 1 divider)
4. Top-right corner doodle (`<HandDrawnDivider variant="leaf" />`)
5. BookCard migration:
   - `bg-[#7A6125]` "Mới" badge → `bg-accent-dark`
   - Hover state shadow tint cobalt
   - Token cleanup, no structural change
6. Empty state: "Chưa có sách nào" + parasol monoline SVG
7. Audit findings catalog pickup

### 2.5 — `/sach/[slug]` detail refactor (2h)

**Skill**: `/ck:frontend-design`

Subcomponent extraction (post-scout decision):

1. **BookDetailHero**:
   - 3D book mockup (reuse pattern từ HeroSection home)
   - Backdrop: `<WatercolorWash color="sunset" />` + book hero_scene image overlay với mix-blend
   - Title font-serif terracotta accent on large heading
   - Author byline: small portrait + signature flourish
   - Sparkle SVG corners

2. **BookSynopsis**:
   - PaperTexture bg
   - Drop cap first-letter (`first-letter:text-7xl first-letter:font-serif first-letter:text-accent first-letter:float-left first-letter:mr-3 first-letter:leading-none`)
   - Italic pull-quote highlight section accent
   - HandDrawnDivider variant="wave" cuối section

3. **BookExcerpt** (per excerpt block):
   - Inline scene image float-right (lg viewport) hoặc full-width (mobile)
   - Cormorant serif text 18-20pt
   - Watercolor wash subtle backdrop
   - Page-turn SVG decoration cuối block

4. **RelatedBooks** (if section exists post-scout):
   - "Tác phẩm khác" heading
   - HandDrawnDivider variant="dots"
   - 2-column grid BookCards (already migrated step 2.4)

5. CTA bottom: reuse CTASection pattern (navy + terracotta sunset gradient) hoặc inline button group

### 2.6 — A11y + perf gate (30 min)

1. Lighthouse mobile `/sach` ≥85
2. Lighthouse mobile `/sach/[slug]` (specific book) ≥85
3. axe scan
4. LCP <2.8s
5. Smoke test: catalog → detail → add to cart flow
6. Before/after screenshots

### 2.7 — Anh review

Em present:
- /sach before/after screenshots
- /sach/[slug] before/after per book (Miền Nam + Góc Phần Tư)
- 8 generated assets gallery
- Lighthouse scores
- Any audit findings carry-over

## Todo List

- [ ] 2.0 Scout `/sach/[slug]/page.tsx` + decide subcomponent extraction
- [ ] 2.1 Add 3 scene fields to `books` Directus collection
- [ ] 2.1 Update Book type + fetch query
- [ ] 2.2 Lock per-book prompt templates
- [ ] 2.2 Generate 6 scene WebPs per 2 books (4 variants each → curate)
- [ ] 2.2 Generate 2 reusable monoline doodles
- [ ] 2.2 Generate open-book + page-turn SVGs
- [ ] 2.2 Anh review 8-10 assets
- [ ] 2.3 Upload Directus + link per-book scenes
- [ ] 2.4 Refactor `/sach` page header + corner doodle
- [ ] 2.4 Migrate BookCard tokens
- [ ] 2.4 Improved empty state
- [ ] 2.5 Create BookDetailHero
- [ ] 2.5 Create BookSynopsis (drop cap)
- [ ] 2.5 Create BookExcerpt (inline scenes)
- [ ] 2.5 Create RelatedBooks (if needed)
- [ ] 2.5 Refactor `/sach/[slug]/page.tsx` to use subcomponents
- [ ] 2.5 Audit findings detail pickup
- [ ] 2.6 Lighthouse + axe + LCP gates
- [ ] 2.6 Smoke test catalog → detail → CTA
- [ ] 2.6 Before/after screenshots
- [ ] 2.7 Anh review

## Success Criteria

- [ ] `/sach` page header + BookCard tokens migrated, no gold leftover
- [ ] `/sach/[slug]` per-book scene art live (Miền Nam + Góc Phần Tư)
- [ ] 8-10 scene assets approved, organized
- [ ] BookDetailHero, BookSynopsis, BookExcerpt subcomponents ship
- [ ] Lighthouse mobile ≥85 each page
- [ ] LCP <2.8s
- [ ] No regression: catalog → detail → CTA → /dat-hang flow
- [ ] Reuse ≥80% Phase 1 components confirmed
- [ ] Anh approve

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scout reveals detail page complex (custom SEO/JSON-LD already done) | Med | Med | Em surface ngay, scope drop nếu cần |
| Schema migration breaks existing 2 books | Low | High | Idempotent script + verify trước commit. Backup Directus DB. |
| Per-book scenes không match cover style (vibe lệch) | Med | High | 4 variants per scene, anh review trước upload. Re-prompt nếu lệch. |
| Drop cap a11y (screen reader confused) | Low | Low | `aria-hidden` cho first-letter visual, full text vẫn announce |
| Inline scene images bloat detail page LCP | Med | Med | Lazy-load tất cả scene art (chỉ hero priority). Smaller srcset (768/1280). |
| Phase 2 + Phase 3 parallel race condition trên Directus | Low | Low | Em sequence Phase 2 trước Phase 3 nếu cùng tuần |

## Security Considerations

- Schema migration cần admin token (paste-on-demand như Phase 0 launch)
- Uploaded images: alt text Vietnamese descriptive, no PII
- No new API routes, no auth changes

## Next Steps

After Phase 2 approval:
1. Phase 3 (gioi-thieu + podcast) start — có thể parallel với Phase 2 review nếu Phase 2 Done
2. Phase 4 (SEO/perf) chỉ sau cả Phase 2 + 3 ship

## Out-of-scope tracking

- Reviews/ratings UI (defer)
- Reading sample PDF preview (defer)
- Wishlist (defer, không có user system)

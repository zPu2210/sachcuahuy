---
phase: 3
title: "Gioi-thieu & Podcast"
status: surface-shipped
priority: P1
effort: "1h (surface) / 4h (full)"
dependencies: [1]
---

> **Trimmed Surface-Only Pass (2026-05-07):** This phase was executed as a focused surface pass — token migration, Phase 1 primitives, a11y fixes. AI-generated assets, Directus schema changes, email signup form, and new about/ component directory are DEFERRED. See "Shipped" vs "Deferred" sections below.

# Phase 3: /gioi-thieu (About) & /podcast

## Context Links

- Brainstorm: `plans/reports/brainstorm-260506-2335-magical-uiux-overhaul.md`
- Audit integration: `plans/260506-2335-magical-uiux-overhaul/audit-integration-notes.md`
- Phase 1 outputs (tokens + 4 shared components) — REUSE
- Existing files: `src/app/gioi-thieu/page.tsx`, `src/app/podcast/page.tsx`, `src/components/podcast/*`

## Shipped (Surface Pass)

### /gioi-thieu
- [x] Token sweep: `bg-paper`, `text-navy`, `text-ink/70`, `text-accent`
- [x] Hero atmosphere: WatercolorWash (cobalt) + PaperTexture
- [x] Bio section: PaperTexture bg, HandDrawnDivider (sparkle), cream cards
- [x] Works section: WatercolorWash (sunset), HandDrawnDivider (leaf), SignatureFlourish
- [x] Mixed-language fix: `<span lang="en">Voice Talent</span>` (2 places)
- [x] Enhanced card borders: `border-accent/10` + `shadow-sm`

### /podcast (coming-soon-hero)
- [x] Token sweep: `bg-paper`, `text-navy`, `text-ink/70`, `text-accent`, `text-accent-dark`
- [x] P0-4 contrast fix: replaced `#7A6125` → `text-accent-dark` (badge) + `text-accent` (title accent)
- [x] Atmosphere: WatercolorWash (cobalt) + PaperTexture
- [x] Added HandDrawnDivider (wave) before CTAs
- [x] Removed hardcoded `bg-[#FDFBF7]` → `bg-paper` token

## Deferred (Full Implementation)

The following from original plan are NOT shipped and should be addressed in future:

- **AI-generated assets**: author hero portrait, chapter scenes, podcast hero, soundwave divider
- **New components**: `src/components/about/` directory (AuthorHero, AuthorBioChapter, AuthorTimeline, AuthorPullQuote)
- **Directus schema**: `author_hero_image` field
- **Podcast expansion**: episode list, subscribe links, email signup form
- **JSON-LD**: Person + PodcastSeries schemas (Phase 4)

## Overview

Apply Phase 1 patterns sang `/gioi-thieu` (author about page) + `/podcast` (audio content). Less commerce-driven, more storytelling — focus emotional connection with reader. **Scout `/podcast` first** vì brainstorm chưa có visibility. Generate 6-8 assets: hero portrait + chapter scenes + podcast hero.

## Key Insights

- **/gioi-thieu** = nơi reader fall in love với tác giả. Long-form storytelling friendly. Watercolor scenes + cinematic portrait shine.
- **/podcast** scope unknown until scout. Could be: simple landing page, episode list, embedded player, or all of above.
- **Author timeline** opportunity: career milestones với illustration per chapter.
- **Soundwave decoration** unique cho podcast page — monoline với cobalt/terracotta gradient.

## Requirements

### Functional

1. **/gioi-thieu page**
   - Large author hero portrait (cinematic enhanced từ existing)
   - Author quote / pull-quote section (Cormorant italic, accent color)
   - Bio long-form with watercolor scene illustrations interleaved (3-4 chapters)
   - Timeline component (career milestones, monoline icons + dates)
   - Signature flourish at end ("Trọng Huy")
   - Social links / contact
   - Optional: "Đọc tác phẩm" CTA → /sach
   - JSON-LD `Person` schema (deferred Phase 4)

2. **/podcast page** (post-scout decision)
   - Hero: podcast title + "Nghe Trọng Huy đọc" subtitle + cobalt watercolor backdrop
   - Microphone + book monoline icon (NEW asset)
   - Soundwave decoration divider (NEW asset, monoline cobalt-terracotta)
   - Episode list (if scout reveals): cards với play buttons + duration
   - Embedded player (if exists)
   - Subscribe links (Spotify/Apple Podcast)
   - JSON-LD `PodcastSeries` schema (deferred Phase 4)

3. **6-8 generated assets**
   - 1 large author hero portrait (cinematic, 1600x900) — img2img từ existing portraits
   - 3-4 watercolor chapter scenes (life moments / writing journey)
   - 1 signature flourish — REUSE Phase 1
   - 1 podcast hero (microphone + book + cobalt backdrop)
   - 1 soundwave monoline divider

### Non-functional

- Lighthouse mobile ≥85 mỗi page
- LCP <2.8s
- Reuse Phase 1 + Phase 2 patterns ≥80%
- Audit findings P0/P1 trên gioi-thieu + podcast pickup

## Architecture

```
src/
├── app/
│   ├── gioi-thieu/
│   │   └── page.tsx                  [MODIFY] full refactor
│   └── podcast/
│       └── page.tsx                  [SCOUT-then-MODIFY]
└── components/
    ├── about/                        [CREATE-DIR-if-needed]
    │   ├── author-hero.tsx           [CREATE]
    │   ├── author-bio-chapter.tsx    [CREATE]
    │   ├── author-timeline.tsx       [CREATE]
    │   └── author-pull-quote.tsx     [CREATE]
    └── podcast/                      [EXISTING-CHECK]
        ├── (existing components)
        └── soundwave-divider.tsx     [CREATE-if-needed]

public/images/motifs/                 [REUSE Phase 1]
public/images/scenes/                 [REUSE Phase 2]
public/images/about/                  [CREATE-DIR]
└── chapter-scenes (3-4 SVG/WebP)

public/images/podcast/                [CREATE-DIR]
├── microphone-book-monoline.svg
└── soundwave-cobalt-terracotta.svg

(via Directus)
└── author-hero-cinematic-large.webp  [UPLOAD, link site_settings.author_hero_image (NEW field)]
```

### Schema decision

Hiện `site_settings.author_image` only. Cần thêm `author_hero_image` cho large variant?

| Option | Pros | Cons |
|---|---|---|
| **A. Reuse author_image (single)** | No schema change | Single size — phải gen large variant đủ tốt cho cả home avatar + about hero |
| **B. Add `author_hero_image` field** | 2 distinct assets, Directus transform handle sizes | Schema migration ~5 min |

→ **Default B**: Add `author_hero_image` field. Author home avatar (square crop, intimate) ≠ about hero (landscape, cinematic).

## Related Code Files

### Create
- `src/components/about/author-hero.tsx` (~70 LOC)
- `src/components/about/author-bio-chapter.tsx` (~60 LOC, reusable per chapter)
- `src/components/about/author-timeline.tsx` (~80 LOC)
- `src/components/about/author-pull-quote.tsx` (~40 LOC)
- `src/components/podcast/soundwave-divider.tsx` (~30 LOC, post-scout)
- `public/images/podcast/microphone-book-monoline.svg`
- `public/images/podcast/soundwave-cobalt-terracotta.svg`
- `public/images/about/chapter-scene-1-hanoi.webp`
- `public/images/about/chapter-scene-2-saigon.webp`
- `public/images/about/chapter-scene-3-radio-studio.webp`
- `scripts/add-author-hero-field.py` (Directus schema migration if option B)

### Modify
- `src/app/gioi-thieu/page.tsx` (full refactor)
- `src/app/podcast/page.tsx` (refactor — scope post-scout)
- `src/lib/types-directus.ts` (add `author_hero_image` field)
- `src/lib/site-config.ts` (fetch new field)
- `src/components/podcast/*` (existing components — minor token migration)

### Directus
- Add field `site_settings.author_hero_image` (file)
- Upload large cinematic author portrait
- Audit findings discoveries

## Implementation Steps

### 3.0 — Scout `/podcast/page.tsx` + `src/components/podcast/*` (30 min)

**Skill**: `/ck:scout`

1. Read podcast `page.tsx` full
2. Identify: simple landing? episode list? embedded player? subscribe section?
3. Read all `src/components/podcast/*.tsx`
4. Check Directus: có `podcast_episodes` collection không? Hay hardcoded?
5. Check audit findings podcast-related
6. Document scope (small / medium / large) → adjust effort estimate

### 3.1 — Schema migration (10 min)

If option B chosen:
1. Write `scripts/add-author-hero-field.py` (idempotent)
2. Run + verify
3. Update Site type + fetch query

### 3.2 — Image generation (1.5h)

**Skill**: `/ckm:design` + `/ck:ai-artist`

**Author hero (img2img enhance)**:
- Input: existing author portrait từ source images (e.g. `z7770348137829_*.jpg` Huy biting books)
- Prompt: "Cinematic portrait, dreamy bokeh, warm cream + cobalt tones, vintage film grain, intimate Vietnamese poet writer, 35mm, soft side light, contemplative expression"
- Aspect: 1600×900 landscape
- 4 variants → curate 1

**Chapter scenes** (3 watercolor scenes for bio):
- Chapter 1: "Hanoi childhood watercolor, French colonial street, terracotta + cream, soft brush, atmospheric morning"
- Chapter 2: "Young writer Saigon studio watercolor, papers + typewriter + window light, warm Indochine palette"
- Chapter 3: "Radio studio watercolor, microphone + headphones, blue + cream, cinematic mood, voice talent moment"
- Each: 4 variants → curate 1

**Podcast hero (monoline)**:
- "Single-stroke cobalt ink line drawing of vintage microphone with open book at base, simple Vietnamese folk illustration, transparent bg"
- 4 variants → curate 1, vector to SVG

**Soundwave divider (monoline)**:
- "Single-stroke cobalt ink soundwave pattern with terracotta highlights, organic flowing wave, decorative divider, simple line art"
- 4 variants → curate 1, vector to SVG

Convert + optimize, filename SEO Vietnamese.

Anh review trước commit/upload.

### 3.3 — Upload + link assets (15 min)

1. Author hero → Directus, link `site_settings.author_hero_image`
2. Chapter scenes → `public/images/about/`
3. Podcast assets → `public/images/podcast/`

### 3.4 — `/gioi-thieu` refactor (1.5h)

**Skill**: `/ck:frontend-design`

Sections:

1. **AuthorHero** (above fold):
   - Large landscape portrait (cinematic)
   - Title: "Tác giả Trọng Huy" font-serif large
   - Subtitle "Voice Talent • Writer" italic terracotta
   - Watercolor wash backdrop (sunset)
   - Sparkle corner decorations
   - LCP target: this image priority=true

2. **AuthorPullQuote**:
   - Massive Cormorant italic quote (60-72pt)
   - Terracotta accent on key word
   - Hand-drawn divider above + below
   - Centered, paper texture bg

3. **AuthorBioChapter** ×3 (reusable component):
   - Alternating left/right layout (image + text)
   - Watercolor scene image (chapter scene 1, 2, 3)
   - Cormorant body 18pt
   - Drop cap first chapter
   - Subtle paper texture overlay

4. **AuthorTimeline**:
   - Vertical timeline với cobalt line + monoline year markers
   - 5-7 milestones (book published, podcast launched, etc.)
   - Hand-drawn icon per milestone

5. **Closing**:
   - Signature flourish
   - "Đọc tác phẩm của Huy" CTA → /sach
   - Social links (if exist)

### 3.5 — `/podcast` refactor (1h, scope-dependent)

**Skill**: `/ck:frontend-design`

Based on scout (default minimal):

1. **Podcast hero**:
   - Title: "Podcast"
   - Subtitle: "Nghe Trọng Huy kể chuyện"
   - Microphone + book monoline SVG (large)
   - Cobalt watercolor wash backdrop

2. **Soundwave divider** between sections

3. **Episode list** (if exists post-scout):
   - Episode cards với play button + duration
   - Token migration: gold → terracotta
   - Hover state cobalt

4. **Subscribe section**:
   - Spotify + Apple Podcast badges (existing or add)
   - "Theo dõi để không bỏ lỡ" CTA

5. Audit findings podcast pickup

### 3.6 — A11y + perf gate (30 min)

1. Lighthouse `/gioi-thieu` mobile ≥85
2. Lighthouse `/podcast` mobile ≥85
3. axe scan
4. LCP <2.8s mỗi page
5. Smoke test navigation (header → about, header → podcast)
6. Before/after screenshots

### 3.7 — Anh review

Em present:
- /gioi-thieu before/after (full page screenshots)
- /podcast before/after
- 6-8 generated assets gallery
- Lighthouse scores
- Audit findings carry-over

## Todo List

- [ ] 3.0 Scout `/podcast/page.tsx` + components → scope decision
- [ ] 3.1 Add `author_hero_image` field to Directus (option B)
- [ ] 3.1 Update Site type + fetch
- [ ] 3.2 Lock prompts (author hero, chapter scenes, podcast hero, soundwave)
- [ ] 3.2 Generate 8 assets (4 variants each → curate)
- [ ] 3.2 Anh review assets
- [ ] 3.3 Upload Directus + link author_hero_image
- [ ] 3.3 Place chapter + podcast assets static
- [ ] 3.4 Create AuthorHero component
- [ ] 3.4 Create AuthorPullQuote component
- [ ] 3.4 Create AuthorBioChapter component (reusable)
- [ ] 3.4 Create AuthorTimeline component
- [ ] 3.4 Refactor `/gioi-thieu/page.tsx`
- [ ] 3.4 Audit findings about pickup
- [ ] 3.5 Refactor podcast hero
- [ ] 3.5 Add SoundwaveDivider
- [ ] 3.5 Migrate podcast tokens
- [ ] 3.5 Audit findings podcast pickup
- [ ] 3.6 Lighthouse + axe + LCP gates
- [ ] 3.6 Smoke test navigation
- [ ] 3.6 Before/after screenshots
- [ ] 3.7 Anh review

## Success Criteria

- [ ] `/gioi-thieu` full refactor: hero + pull-quote + 3 chapters + timeline + signature
- [ ] `/podcast` refactor matches scope (minimum viable hero + token migration)
- [ ] 6-8 assets approved, organized
- [ ] 4 about subcomponents shipped
- [ ] Lighthouse mobile ≥85 each page
- [ ] LCP <2.8s
- [ ] Reuse ≥80% Phase 1 + Phase 2 patterns
- [ ] No regression: header nav still works
- [ ] Anh approve

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Podcast scope larger than expected (full episode CMS) | Med | Med | Scout 3.0 surface scope ngay, em adjust effort 4h → 6h hoặc descope |
| Author timeline content (milestones) chưa có | High | Low | Em request anh từ Huy 5-7 milestones với year. Default placeholder nếu chưa có. |
| Author hero img2img không cinematic enough | Med | High | 4 variants, anh review. Re-prompt với film grain emphasis. |
| Chapter scenes feel disconnected từ bio text | Med | Med | Match prompt với section content (Hanoi/Saigon/Radio match Hanoi childhood/Saigon writing/Radio voice). Anh review pairing. |
| Timeline component over-engineered | Med | Low | KISS: vertical line + year + 1-line description. No tooltips, no anim hover. |
| Long-form gioi-thieu LCP rớt | Med | Med | Lazy-load chapter scenes, priority chỉ author hero. Smaller srcset (768/1280). |

## Security Considerations

- Author hero schema migration (admin token)
- Bio content sources: Huy provide (assume not sensitive)
- Social links: validate URLs

## Next Steps

After Phase 3 approval:
1. Phase 4 SEO/perf gate cuối cùng

## Out-of-scope tracking

- Comments / guestbook (defer)
- Newsletter signup (defer, no backend)
- Author photo gallery (defer)
- Podcast transcript pages (defer)

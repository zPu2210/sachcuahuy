---
phase: 1
title: "Home Vertical Slice (gate phase)"
status: completed
priority: P1
effort: "6-10h (depends on audit re-scope)"
dependencies: [0]
shipped_commit: 9482eab
---

# Phase 1: Home Vertical Slice — Gate Phase

## Context Links

- Brainstorm report: `plans/reports/brainstorm-260506-2335-magical-uiux-overhaul.md` (sections 5, 6, 7 most relevant)
- Audit integration notes: `plans/260506-2335-magical-uiux-overhaul/audit-integration-notes.md` (Phase 0 output)
- Source images: `~/Downloads/sachcuahuy/` (20 images, mood board references)
- Existing home: `src/app/page.tsx`, `src/components/home/*.tsx`, `src/components/layout/header.tsx`

## Overview

Vertical slice MVP: complete makeover của home page với token refactor (navy + terracotta + cobalt + ink + paper), 4 shared components, 5 sections refactor, 8-10 generated assets, signature SVG. **Gate phase** — anh approve before Phase 2-3 scale.

## Key Insights

- **Tokens hard switch**: replace gold → terracotta. Keep gold ONE phase as fallback rollback safety, remove ở Phase 4.
- **A11y borderline**: terracotta on cream ~4.5:1 → AA large only. Body text dùng `accent.dark` (~6.5:1) hoặc `text-gray-700`.
- **Hardcoded colors trong components**: hero-section.tsx có `#7A6125`, `#1a237e`, `#FDFBF7`, `#0f1629` — phải migrate sang tokens.
- **Existing 3D book hero**: keep as-is, chỉ change spine color navy hardcoded → cobalt token.
- **Paper texture inline SVG**: data URI để zero HTTP request, tăng perf.
- **Shared component reuse**: HandDrawnDivider sẽ dùng 4-5 lần across sections + Phase 2-3 cũng reuse.

## Requirements

### Functional

1. **Token refactor** (`tailwind.config.ts` + `src/app/globals.css`)
   - Add: `accent` (terracotta family), `cobalt`, `ink`, `paper` tokens
   - Keep: `gold` token deprecated (rollback safety, remove Phase 4)
   - Add CSS utilities: `.paper-texture`, `.watercolor-wash-cobalt`, `.watercolor-wash-terracotta`
2. **4 shared components** (`src/components/ui/`)
   - `<HandDrawnDivider variant="wave|sparkle|leaf|dots" />` — inline SVG monoline
   - `<WatercolorWash color="cobalt|terracotta|sunset" position="..." />` — atmospheric backdrop layer
   - `<PaperTexture />` — subtle grain overlay (data URI SVG)
   - `<SignatureFlourish />` — Trọng Huy ký SVG (em generate Phase 1.2)
3. **5 home sections refactor**
   - HeroSection: ambient backdrop + terracotta accents + cobalt 3D spine + corner sparkles
   - AuthorSection: paper texture bg + terracotta brush stroke border + signature flourish
   - BooksSection: watercolor brush stroke underline (replace gold) + corner monoline doodles
   - FeaturesSection: cobalt watercolor circle backdrop cho icons
   - CTASection: navy + terracotta sunset gradient + ambient backdrop
4. **8-10 generated assets**
   - 1 hero ambient backdrop (cobalt + terracotta wash, full-bleed atmospheric)
   - 1 author portrait variant (cinematic grading từ existing) — img2img
   - 6 monoline SVG motifs (corner ornaments × 2, dividers × 2, sparkles × 2) — em hand-curate via Nano Banana
   - 1 signature SVG ("Trọng Huy" hand-drawn)
   - 1 CTA backdrop (sunset terracotta wash)
5. **Audit findings pickup** (qua audit-integration-notes.md)
   - Home P0/P1 audit findings merge vào scope refactor

### Non-functional

- Lighthouse home mobile ≥85 (perf, a11y, best-practices, SEO each)
- LCP <2.8s on 4G throttled
- No regression: order flow + checkout vẫn work (smoke test)
- Bundle size delta < +30KB gzipped
- Visual: side-by-side before/after screenshot per section

## Architecture

```
src/
├── app/
│   ├── globals.css              [MODIFY] +utilities: paper-texture, watercolor-wash
│   └── page.tsx                 [READ-ONLY] no change
├── components/
│   ├── home/
│   │   ├── hero-section.tsx     [MODIFY] tokens, ambient, sparkles
│   │   ├── author-section.tsx   [MODIFY] paper texture, signature, terracotta
│   │   ├── books-section.tsx    [MODIFY] watercolor underline, corner doodles
│   │   ├── features-section.tsx [MODIFY] cobalt watercolor circles
│   │   └── cta-section.tsx      [MODIFY] sunset gradient, ambient
│   ├── layout/
│   │   └── header.tsx           [MODIFY] tokens cleanup nếu có gold
│   └── ui/
│       ├── fade-in.tsx          [READ-ONLY]
│       ├── hand-drawn-divider.tsx   [CREATE] 4-variant SVG
│       ├── watercolor-wash.tsx      [CREATE] atmospheric layer
│       ├── paper-texture.tsx        [CREATE] grain overlay
│       └── signature-flourish.tsx   [CREATE] Trọng Huy ký
└── lib/                          [READ-ONLY] no change

public/images/motifs/             [CREATE-DIR]
├── hero-ambient-cobalt-terracotta.webp     [CREATE]
├── cta-sunset-wash.webp                    [CREATE]
├── corner-doodle-saigon.svg                [CREATE]
├── corner-doodle-flower.svg                [CREATE]
├── divider-wave-monoline.svg               [CREATE]
├── divider-leaf-monoline.svg               [CREATE]
├── sparkle-cluster-1.svg                   [CREATE]
├── sparkle-cluster-2.svg                   [CREATE]
└── signature-trong-huy.svg                 [CREATE]

(via Directus, NOT public/)
└── author-portrait-cinematic.webp          [CREATE in Directus, link via author_image]

tailwind.config.ts                          [MODIFY] tokens
```

### Token migration map

| Old | New | Reason |
|---|---|---|
| `text-[#7A6125]` (gold-on-cream borderline) | `text-accent-dark` | A11y AA normal |
| `bg-[#1a237e]` (book spine hardcoded) | `bg-cobalt-dark` | Token |
| `bg-[#FDFBF7]` (hero bg) | `bg-paper` | Token |
| `bg-[#0f1629]` (book back hardcoded) | `bg-primary-dark` | Token |
| `bg-accent/20` (gold blur) | `bg-accent/15` (terracotta blur, lower opacity) | New palette warmer |
| `bg-accent/10` (badge bg) | `bg-accent/15` | Adjust for terracotta |

## Related Code Files

### Create
- `src/components/ui/hand-drawn-divider.tsx` (~50 LOC, props: variant, className)
- `src/components/ui/watercolor-wash.tsx` (~40 LOC, props: color, position, className)
- `src/components/ui/paper-texture.tsx` (~30 LOC, inline SVG data URI)
- `src/components/ui/signature-flourish.tsx` (~30 LOC, inline SVG)
- `public/images/motifs/` directory + 9 asset files (8 SVG + 2 WebP)

### Modify
- `tailwind.config.ts` (+10 LOC tokens)
- `src/app/globals.css` (+30 LOC CSS utilities)
- `src/components/home/hero-section.tsx` (~40 LOC delta)
- `src/components/home/author-section.tsx` (~25 LOC delta)
- `src/components/home/books-section.tsx` (~15 LOC delta)
- `src/components/home/features-section.tsx` (~20 LOC delta)
- `src/components/home/cta-section.tsx` (~25 LOC delta)
- `src/components/layout/header.tsx` (~5 LOC delta nếu có gold)

### Delete
- None (gold token kept as deprecated until Phase 4)

## Implementation Steps

### 1.1 — Design system tokens (1h)

**Skill**: `/ck:ui-ux-pro-max` cho color system + a11y validation

1. Update `tailwind.config.ts`:
   ```ts
   accent: { DEFAULT: "#C75D2C", light: "#E27A4F", dark: "#A04420" },
   cobalt: { DEFAULT: "#3856B0", light: "#5C7AC9", dark: "#27408C" },
   ink: "#142849",
   paper: "#FAF6EC",
   gold: "#C9A962",  // DEPRECATED, remove Phase 4
   ```
2. Update `src/app/globals.css` add utilities:
   ```css
   .paper-texture { background-image: url("data:image/svg+xml,..."); opacity: 0.04; }
   .watercolor-wash-cobalt { background: radial-gradient(...) }
   .watercolor-wash-terracotta { background: radial-gradient(...) }
   .watercolor-wash-sunset { background: linear-gradient(135deg, terracotta, navy) }
   ```
3. **A11y validate** với Lighthouse axe: terracotta-on-cream contrast trên all variants
4. Build check: `npm run build` — verify no Tailwind errors

### 1.2 — Image generation sprint (2-3h)

**Skill**: `/ckm:design` orchestrator + `/ck:ai-artist` (Nano Banana) engine

1. **Lock prompt templates** (3 categories):
   - **Monoline motifs**: "Single-stroke cobalt #3856B0 ink on white background, hand-drawn Vietnamese woodblock book illustration style, no shading, simple line art, 512x512, transparent background"
   - **Watercolor scenes**: "Soft watercolor wash, terracotta sunset palette, painterly Vietnamese folk style with cream paper texture visible, atmospheric, inspired by Góc Phần Tư book cover"
   - **Author portraits**: "Cinematic film grain, dreamy bokeh, warm cream tone, intimate poet writer in studio with soft side light, vintage Vietnamese aesthetic"

2. **Batch generate via Nano Banana** (parallel với gemini CLI hoặc ai-artist skill):
   - Hero ambient backdrop: 4 variants → curate 1
   - CTA sunset wash: 3 variants → curate 1
   - Corner doodle Saigon (parasol/người gánh hàng rong): 4 variants → curate 1
   - Corner doodle hoa/cá (folk motif): 4 variants → curate 1
   - Divider wave monoline: 3 variants → curate 1
   - Divider leaf monoline: 3 variants → curate 1
   - Sparkle clusters: 4 variants → curate 2
   - Signature "Trọng Huy" SVG: 4 variants → curate 1
   - Author portrait img2img (input: existing `author-trong-huy.webp` Directus): 4 variants → curate 1

3. **Convert + optimize**:
   - Raster (hero ambient, CTA sunset, author portrait) → WebP `cwebp -q 80`
   - SVG (motifs, dividers, sparkles, signature) → SVGO optimize (`npx svgo -i ...`)
   - Filename SEO Vietnamese descriptive: `hero-ambient-cobalt-terracotta-saigon.webp`

4. **Storage**:
   - Static (motifs/dividers/sparkles/signature/CTA wash) → `public/images/motifs/`
   - Hero ambient (large, full-bleed) → `public/images/motifs/` (still static, không cần CMS edit)
   - Author portrait variant → upload Directus, update `site_settings.author_image`

5. **Anh review** trước commit. Em show 9 final assets side-by-side. Anh approve / regenerate variants nếu cần.

### 1.3 — 4 shared components (1.5h)

**Skill**: `/ck:frontend-design` cho code reproduction

1. **HandDrawnDivider** (`src/components/ui/hand-drawn-divider.tsx`):
   ```tsx
   type Variant = "wave" | "sparkle" | "leaf" | "dots";
   export function HandDrawnDivider({ variant = "wave", className }: { variant?: Variant; className?: string }) {
     // Map variant → inline SVG path
     // Stroke: currentColor (so parent text-color controls)
     // Default: text-accent text-2xl
   }
   ```
2. **WatercolorWash** (`src/components/ui/watercolor-wash.tsx`):
   ```tsx
   type Color = "cobalt" | "terracotta" | "sunset";
   export function WatercolorWash({ color, position, className }: { color: Color; position?: string; className?: string }) {
     // Renders absolute-positioned div with gradient + blur + low opacity
     // Pointer-events: none
   }
   ```
3. **PaperTexture** (`src/components/ui/paper-texture.tsx`):
   ```tsx
   export function PaperTexture({ className, opacity = 0.04 }) {
     // Returns <div> with inline SVG data URI for grain texture
     // Pointer-events: none, mix-blend-multiply
   }
   ```
4. **SignatureFlourish** (`src/components/ui/signature-flourish.tsx`):
   ```tsx
   export function SignatureFlourish({ className }) {
     // Inline SVG of "Trọng Huy" handwritten signature (from gen step 1.2)
     // Stroke: currentColor for theming
   }
   ```
5. Build check: `npm run lint && npm run build`

### 1.4 — 5 home sections refactor (2-3h)

**Skill**: `/ck:frontend-design` cho per-section reproduction

Sequence (order matters cho LCP hero first):

1. **HeroSection** (`hero-section.tsx`):
   - Replace `bg-[#FDFBF7]` → `bg-paper`
   - Replace gold sparkle badge `text-[#7A6125]` → `text-accent-dark` + `bg-accent/15` + `ring-accent/30`
   - Replace book spine `bg-[#1a237e]` → `bg-cobalt-dark`
   - Replace book back `bg-[#0f1629]` → `bg-primary-dark`
   - Add `<WatercolorWash color="cobalt" position="absolute top-0 right-0" />` behind book
   - Add 2 corner sparkles via inline SVG (top-left, bottom-right)
   - Title accent (italic span): replace `text-[#7A6125]` → `text-accent` (large heading OK 4.5:1)
   - Underline path: keep, change `text-accent/30` → `text-accent/40` (warmer)
   - Pickup audit findings P0/P1 trên hero

2. **AuthorSection** (`author-section.tsx`):
   - Add `<PaperTexture />` overlay
   - Replace `border-accent/20` (gold ring) → `border-accent/30` watercolor brush stroke (CSS or inline SVG)
   - Add `<SignatureFlourish className="absolute bottom-0 right-0 text-accent-dark opacity-60" />`
   - Replace gold accent `text-[#7A6125]` → `text-accent-dark`
   - Watermark giữ font-script, opacity giảm 0.10 → 0.08

3. **BooksSection** (`books-section.tsx`):
   - Replace `bg-accent/30` (gold underline) → custom watercolor brush SVG (inline) cobalt or terracotta
   - Add corner monoline doodle (`<HandDrawnDivider variant="leaf" />`) phía top-left section
   - Replace `text-[#7A6125]` → `text-accent-dark`
   - Audit findings P0/P1 pickup

4. **FeaturesSection** (`features-section.tsx`):
   - Icon backdrop: replace `bg-primary/5` rounded-2xl → `<WatercolorWash color="cobalt" />` circle behind icon
   - Card hover: replace shadow gold tint → cobalt tint
   - Add `<HandDrawnDivider variant="dots" />` between cards on mobile

5. **CTASection** (`cta-section.tsx`):
   - Replace `bg-[#1E2B4D]` flat → linear-gradient navy → terracotta sunset (135deg)
   - Replace `bg-accent/10` blur (gold) → `bg-accent/20` (terracotta) + `bg-cobalt/10` second layer
   - Add cubes texture replace với paper-texture overlay (warmer)
   - Sparkles icon `text-accent` (terracotta-on-navy ratio: ~5:1, AA OK)
   - Button "Đặt Hàng Ngay": stays white-on-navy (highest contrast)
   - Hover state button: `hover:bg-accent` → terracotta

6. **Header** (`layout/header.tsx`):
   - Search for any gold/accent leftover → migrate to new tokens
   - Logo book icon: keep navy primary

### 1.5 — Audit findings overlap (variable, 0-2h)

Per `audit-integration-notes.md` Phase 0 output:
- Pickup home-related P0/P1 findings không overlap với refactor
- Common categories: form a11y (no forms on home, skip), focus management (header nav), keyboard nav, image alt text, heading hierarchy

### 1.6 — A11y + perf gate (1h)

**Skills**: `/ck:web-design-guidelines` cho a11y, Lighthouse cho perf

1. Run Lighthouse mobile home → verify ≥85 each category
2. axe-core scan → fix any new violations
3. LCP measure on 4G throttle → verify <2.8s
4. Visual regression: before/after screenshots saved trong `plans/reports/phase-01-screenshots/`
5. Smoke test order flow: click "Đặt Hàng Ngay" → reach `/dat-hang` → no console errors
6. Bundle size diff: `next build` log compare baseline

### 1.7 — Anh review gate (manual)

Em present:
- Side-by-side before/after screenshot per 5 sections (mobile + desktop)
- Lighthouse before/after scores
- Bundle size delta
- 9 generated assets gallery
- Open questions / risks if any

Anh approve → Phase 1 complete, sang Phase 2-3. Anh reject specific element → em iterate trong Phase 1, không sang phase mới.

## Todo List (shipped subset — commits 9482eab, 92ffbb6)

- [x] 1.1 Update tailwind.config.ts với new tokens
- [x] 1.1 Update globals.css với CSS utilities
- [x] 1.1 A11y validate token contrast (accent.dark ~6.5:1 on cream — AA Normal)
- [x] 1.3 Create HandDrawnDivider component
- [x] 1.3 Create WatercolorWash component
- [x] 1.3 Create PaperTexture component
- [x] 1.3 Create SignatureFlourish component
- [x] 1.3 Build + lint pass
- [x] 1.4 Refactor HeroSection
- [x] 1.4 Refactor AuthorSection
- [x] 1.4 Refactor BooksSection
- [x] 1.4 Refactor FeaturesSection
- [x] 1.4 Refactor CTASection
- [x] 1.4 Cleanup Header
- [x] 1.5 Pickup audit P0/P1 home findings (folded into QW commits 0daaa1f + b5834bc + 92ffbb6)
- [x] 1.6 Smoke test order flow (no regression — verified through Phase 2 work)
- [x] 1.7 Anh review gate (passed — Phase 2 unlocked + shipped)

### Deferred to backlog (separate session, not blocking Phase 3/4)

- [ ] 1.2 Lock 3 prompt templates (monoline, watercolor, portrait)
- [ ] 1.2 Generate 9 assets via Nano Banana (batch + curate) — current build uses inline SVG primitives in HandDrawnDivider + globals.css data-URI textures instead
- [ ] 1.2 Convert WebP + optimize SVG
- [ ] 1.2 Upload author portrait Directus, link via site_settings
- [ ] 1.2 Anh review 9 assets
- [ ] 1.6 Lighthouse mobile home ≥85 verify (folded into Phase 4 SEO/Perf gate)
- [ ] 1.6 axe-core scan + fix (folded into Phase 4)
- [ ] 1.6 LCP <2.8s verify (folded into Phase 4)
- [ ] 1.6 Capture before/after screenshots (deferred — live preview used during review)

## Success Criteria

### Shipped (this phase)
- [x] Tokens shipped: terracotta replaced gold, cobalt added, ink + paper added (gold deprecated, kept for rollback)
- [x] 5 home sections refactored, no hardcoded color leftover on home surfaces
- [x] 4 shared components shipped tại `src/components/ui/` (HandDrawnDivider, WatercolorWash, PaperTexture, SignatureFlourish)
- [x] No regression: order flow smoke test pass
- [x] Anh approve home → Phase 2-3 unlocked

### Deferred (backlog)
- [ ] 9 generated assets approve, organized at `/public/images/motifs/` + 1 in Directus
- [ ] Lighthouse home mobile ≥85 each category (Phase 4)
- [ ] LCP <2.8s on 4G throttled (Phase 4)
- [ ] Bundle size delta <+30KB gzipped (Phase 4)
- [ ] Before/after side-by-side screenshots per section

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Terracotta a11y borderline | High | Med | Validate Phase 1.1 trước section refactor; dùng dark variant cho body |
| Generated images không đẹp | Med | High | 4 variants per asset, em curate, anh review trước commit |
| Lighthouse rớt < 85 | Med | Med | Lazy-load aggressive, inline SVG, preconnect Directus, test mỗi section |
| Bundle bloat | Low | Med | Tree-shake icons, prefer SVG inline, no new deps |
| Visual chia rẽ với Phase 2-3 (palette không nhất quán) | Low | High | Lock tokens Phase 1, no further changes Phase 2-3 |
| Anh không thích direction | Low | High | Vertical slice → git revert dễ. Phase 1 commit per-section để rollback granular. |
| Time creep | High | Med | Hard cap 8h (extend đến 10h nếu audit re-scope). Skip nice-to-have. |

## Security Considerations

- No credential changes
- Directus author portrait upload qua `DIRECTUS_API_ORDERS_TOKEN` (existing token, scope=site_settings write)
- All assets static or via existing Directus permissions
- No new API routes
- No PII in generated images

## Next Steps

After Phase 1 approval:
1. Phase 2 + Phase 3 có thể chạy parallel (different files, no overlap)
2. Hoặc sequential nếu em muốn Phase 2 validate detail page treatment trước Phase 3
3. Phase 4 chốt cuối tất cả

## Out-of-scope tracking

Audit findings không pickup trong Phase 1 (parking lot or defer):
- (TBD post Phase 0)

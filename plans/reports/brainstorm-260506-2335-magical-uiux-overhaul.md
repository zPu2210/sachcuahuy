---
title: "Magical UI/UX Overhaul — sachcuahuy.com"
type: brainstorm
date: 2026-05-06
slug: magical-uiux-overhaul
project: sachcuahuy
status: agreed
approach: B (Vertical Slice MVP)
relates_to:
  - 260502-2024-sachcuahuy-production-launch (parent — site đã launch)
  - 260504-2119-website-uiux-audit (audit-only sibling, chưa execute)
---

# Brainstorm: Magical UI/UX Overhaul — sachcuahuy.com

## 1. Problem statement

Site hiện tại đã production, palette navy + gold + cream + serif/script fonts polished nhưng **lệch tone với chính source materials của tác giả**. Vibe Huy thật trong source: hand-drawn calligraphy, watercolor, cobalt + terracotta, Indochine văn nghệ sĩ indie. Site hiện tại trông như brochure khách sạn boutique — lạnh, formal, sparse imagery.

**Mục tiêu:** Reset visual language cho match đúng linh hồn tác giả — magical, poetic, ấm, sáng tạo — đồng thời giữ conversion (đặt sách) và Lighthouse ≥85.

## 2. Source-material insights

| Source asset | Vibe signal |
|---|---|
| `z7770338796353_*.jpg` (Miền Nam cover) | Cobalt deep + cream form, lettering "miền nam của Huy" hand-drawn cùng doodles (nón, hoa, fish, mưa) → monoline ink calligraphy với playful illustrations |
| `gocphantu.jpg` (Góc Phần Tư cover) | Watercolor terracotta sunset, nhân vật đạp xe, núi xa, palette ấm — painterly nostalgic |
| `z7770348137829_*.jpg` (Author portrait) | Studio cobalt backdrop, áo cream, Huy cắn chồng sách — intimate selfie-style, không formal |

**Verdict:** Brand visual đã sẵn — site chưa khai thác.

## 3. Decisions agreed (qua AskUserQuestion)

| Axis | Decision |
|---|---|
| Aesthetic | **Hybrid** — Navy primary + Terracotta accent (replace gold) + Cobalt secondary |
| Illustration style | **Mixed** — Monoline ink (motifs) + Watercolor painterly (scenes) |
| Image storage | **Mixed** — `/public/images/motifs/` static + Directus CMS cho scenes/portraits |
| Page scope | **Toàn site** (home + /sach + /sach/[slug] + /gioi-thieu + /podcast) |
| Performance | **Moderate** — Lighthouse ≥85, LCP <2.8s, lazy-load aggressive |
| Image generation | Decorative motifs + ambient backdrops + scene illustrations + author portrait variants + WebP/AVIF + SEO |
| Approach | **B — Vertical Slice MVP** (home first, validate, scale) |

## 4. Approaches evaluated

### Approach A — Foundation-first (rejected)

Sequential: tokens → assets → page rollout → SEO/perf.  
Pros: Asset library full trước, page rollout nhanh.  
Cons: Anh không thấy vibe đến phase 3, miss adjustment window. **Rejected.**

### Approach B — Vertical Slice MVP ✅ chosen

Home complete trước (tokens + 8-10 assets + 5 sections + decorative). Validate → nhân rộng /sach → /gioi-thieu → /podcast. Cuối cùng SEO/perf gate.  
Pros: Magic visible ngay phase 1. Patterns validate trước scale. Reuse motifs sang page sau. Risk rollback nhỏ.  
Cons: Một số decorative có thể remake nhỏ ở phase 2-3 — chấp nhận được.

### Approach C — Asset-sprint parallel (rejected)

Gen 30+ assets cùng lúc, parallel page rollout.  
Pros: Wall-time ngắn nhất.  
Cons: Risk cao — assets không khớp layout thực tế phải remake. Cần coordinator strict, không phù hợp solo dev. **Rejected.**

## 5. Final design system (palette + typography)

### Color tokens

```ts
// tailwind.config.ts (proposed)
colors: {
  primary: { DEFAULT: "#1E2B4D", light: "#2D3F66", dark: "#141D36" },  // navy (keep)
  accent:  { DEFAULT: "#C75D2C", light: "#E27A4F", dark: "#A04420" },  // terracotta (NEW, replaces gold)
  cobalt:  { DEFAULT: "#3856B0", light: "#5C7AC9", dark: "#27408C" },  // cobalt (NEW, support)
  cream:   "#F8F6F3",                                                  // (keep)
  ink:     "#142849",                                                  // hand-drawn line art (NEW)
  paper:   "#FAF6EC",                                                  // warm paper (NEW, alt bg)
}
```

### A11y guard rails

- `accent.DEFAULT (#C75D2C)` on cream → ~4.5:1 → **AA large only** → dùng cho headings, badges, accents large
- `accent.dark (#A04420)` on cream → ~6.5:1 → **AA normal** → dùng cho inline links, body accents
- Body text giữ `text-gray-700` (~10:1) hoặc `primary.dark`
- Replace tất cả `text-[#7A6125]` (gold-on-cream borderline) → `text-accent-dark`

### Typography (giữ nguyên)

- Cormorant Garamond — hero/h1/h2 (poetic serif)
- Inter — body, navigation
- Dancing Script — script accents/quotes
- **NEW:** Add custom hand-drawn signature SVG cho author byline

## 6. Image inventory & generation pipeline

### Total: ~28-32 assets across 4 phases

**Phase 1 — Home (10-12 assets)**
- 1 hero ambient backdrop (cobalt + terracotta watercolor wash, atmospheric)
- 1 author portrait variant (cinematic grading từ existing)
- 6 monoline SVG motifs (corner ornaments × 2, dividers × 2, sparkles × 2)
- 1 hand-drawn signature ("Trọng Huy")
- 1 paper-texture overlay SVG
- 1 CTA backdrop (sunset terracotta wash)

**Phase 2 — /sach + /sach/[slug] (8-10 assets)**
- 1 catalog page-header watercolor banner
- Per book (×2): 1 hero watercolor scene + 2 inline scene art (chapter/excerpt)
- 2 reusable monoline doodles (open-book, page-turn)

**Phase 3 — /gioi-thieu (6-8 assets)**
- 1 large author hero portrait (enhanced)
- 1 timeline backdrop wash
- 3 watercolor chapter illustrations (life moments / writing journey)
- 1 signature flourish

**Phase 4 — /podcast (3-5 assets)**
- 1 podcast hero (microphone + book + cobalt backdrop)
- 1 ambient soundwave divider (monoline)
- Episode thumbnail template

### Generation pipeline

```
20 source images (~/Downloads/sachcuahuy/) ─ mood board references
                          │
                          ▼
                /ckm:design (orchestrator)
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
  Monoline motifs    Watercolor scenes   Author portraits
  (Nano Banana       (Nano Banana        (Nano Banana
   text-to-image)     img2img dùng        img2img dùng
                      Góc Phần Tư         author selfies)
                      cover làm style ref)
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
                   cwebp -q 80 + AVIF
                          │
                          ▼
                Filename SEO + alt VN
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       /public/images/motifs/   Directus CMS
       (static, CDN cache)      (scenes + portraits, editable)
```

### Lock style guide cho prompts

- **Monoline motifs**: "thin even ink line, single-stroke calligraphy, no shading, cobalt #3856B0 line, optional terracotta #C75D2C splash, white background, vintage Vietnamese woodblock book illustration vibe"
- **Watercolor scenes**: "soft watercolor wash, terracotta sunset palette, painterly Vietnamese folk style, soft edges, paper texture visible, Indochine literary cover art reference Góc Phần Tư"
- **Author portraits**: "cinematic film grain, dreamy bokeh, warm cream tone, intimate poet writer in studio, soft side light"

## 7. Implementation considerations

### Phase 1 home structure (vertical slice MVP)

1. **Token refactor** (tailwind.config.ts + globals.css)
   - Add terracotta + cobalt + ink + paper
   - Keep gold ONE release as deprecated fallback (rollback safety) → remove ở phase 4
   - Add CSS utilities: `.paper-texture`, `.watercolor-wash`, `.handdrawn-underline`
2. **New shared components** (`src/components/ui/`)
   - `<HandDrawnDivider />` — reusable monoline SVG (4 variants: wave, sparkle, leaf, dots)
   - `<WatercolorWash />` — atmospheric backdrop layer (positioned absolute behind sections)
   - `<PaperTexture />` — subtle grain overlay (data URI SVG)
   - `<SignatureFlourish />` — Trọng Huy ký SVG
3. **Section refactor** (5 home sections)
   - HeroSection: Add ambient backdrop, replace gold → terracotta, add monoline corner sparkles, soften 3D book backdrop từ navy hardcoded → cobalt token
   - AuthorSection: Add paper texture bg, replace circle border gold → terracotta brush stroke, add signature flourish bottom right
   - BooksSection: Replace gold underline (`bg-accent/30`) → watercolor brush stroke PNG, add corner doodles
   - FeaturesSection: Replace icon-tile primary/5 → watercolor circle (cobalt wash), softer card shadow
   - CTASection: Replace navy + gold gradient → navy + terracotta sunset gradient, add ambient backdrop
4. **Skill orchestration**
   - `/ck:ui-ux-pro-max` → design tokens + component spec (Phase 1.1)
   - `/ckm:design` → image generation orchestrator (Phase 1.2)
   - `/ck:ai-artist` (Nano Banana) → img2img engine (Phase 1.2)
   - `/ck:frontend-design` → screen reproduction code (Phase 1.3)
   - `/ck:web-design-guidelines` → a11y/UX gate (Phase 1.4)

### Phase 2-4 reuse strategy

Sau home, mỗi page subsequent reuse:
- Cùng tokens (no refactor)
- Cùng shared components (HandDrawnDivider, WatercolorWash, etc.)
- Cùng Nano Banana prompt template (chỉ thay subject)
- Cùng SEO image checklist (filename, alt, sizes, OG)

→ Phase 1 = ~6-8h. Mỗi phase sau ~3-4h.

## 8. SEO image optimization (anh thêm vào)

### Per asset

- **Filename**: descriptive kebab-case Vietnamese
  - ❌ `IMG_2438.webp`
  - ✅ `mien-nam-cua-huy-watercolor-saigon-parasol.webp`
- **WebP primary + AVIF variant + PNG fallback** (next/image handle automatically với `<Image>`)
- **srcset sizes**: 480w, 768w, 1280w, 1920w (next/image)
- **alt text Vietnamese** với context — ví dụ "Tác giả Trọng Huy ngồi đọc sách bên cửa sổ Sài Gòn, ánh nắng vàng terracotta"
- **lazy loading**: priority=true chỉ cho above-fold hero, rest lazy

### Per page

- **OG image 1200×630** custom mỗi page (home, /sach, /sach/[slug], /gioi-thieu, /podcast)
- **JSON-LD schema**:
  - `/sach/[slug]` → `Book` schema (author, isbn, datePublished, image, description)
  - `/gioi-thieu` → `Person` schema (author, image, sameAs social links)
  - `/podcast` → `PodcastSeries` schema
- **Canonical** (already present)
- **Sitemap** add image entries (`<image:image>`)

### Site-wide

- `<link rel="preconnect" href="cms.sachcuahuy.com" />` cho Directus assets
- `Cache-Control: public, max-age=31536000, immutable` cho `/public/images/motifs/` (static)
- Monitor Web Vitals qua existing `@vercel/speed-insights`

## 9. Risks & mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Terracotta a11y borderline trên cream | High | Med | Dùng `accent.dark` cho body inline, `accent.DEFAULT` chỉ cho large/heading. Audit Lighthouse a11y phase 4. |
| AI images không nhất quán style → "AI slop" | Med | High | Lock prompt template per category (monoline / watercolor / portrait), batch gen 3-4 variants, curate keep top 1-2. Anh review trước commit. |
| Lighthouse perf rớt < 85 do imagery nặng | Med | Med | Lazy-load ambient + scenes, priority chỉ hero. Inline SVG motifs (no extra request). Preconnect Directus. Test Lighthouse cuối mỗi phase. |
| 30+ images bloat repo / Directus | Low | Low | Motifs static < 50KB tổng, scenes Directus optimized < 200KB each. Tổng <5MB. |
| Vibe quá đậm → bị "noisy", che content | Med | Med | Phase 1 home validate với anh trước scale. Decorative dùng `opacity` thấp (0.05-0.15) cho ambient layer. |
| User không thích direction sau phase 1 | Low | High | Vertical slice cho phép rollback git revert phase 1 → quay lại trạng thái production hiện tại. Tokens hard-switch nhưng có thể swap back. |
| Time creep — lan man fine-tune | High | Med | Chốt success criteria mỗi phase, không tự thêm work. Phase 1 ≤ 8h hard cap. |

## 10. Success criteria

### Phase 1 (Home) — gate phase, anh approve mới sang Phase 2

- [ ] Tokens refactor ship: terracotta replaced gold, cobalt added, ink + paper tokens added
- [ ] 5 home sections refactor xong, visual side-by-side before/after screenshot per section
- [ ] 8-10 generated assets approve, organized at `/public/images/motifs/` + Directus
- [ ] 4 shared components shipped (`HandDrawnDivider`, `WatercolorWash`, `PaperTexture`, `SignatureFlourish`)
- [ ] Lighthouse home mobile ≥85 (perf, a11y, best-practices, SEO each)
- [ ] LCP < 2.8s on 4G throttled
- [ ] No regression: order flow + checkout vẫn work (smoke test)
- [ ] Anh review desktop + mobile screenshots → approve

### Phase 2-4 mỗi phase

- [ ] Page makeover xong, before/after screenshot
- [ ] Reuse ≥80% Phase 1 components, không tự thêm shared component mới (ngoại trừ điều cần thiết)
- [ ] Lighthouse trên page đó ≥85
- [ ] No regression on transactional flows

### Final (Phase 4 SEO/perf gate)

- [ ] All 4 pages Lighthouse ≥85 mobile
- [ ] OG images custom 4 pages, validate qua opengraph.xyz
- [ ] JSON-LD `Book` + `Person` validate qua Schema.org tester
- [ ] Sitemap có image entries
- [ ] All decorative assets WebP + alt text Vietnamese
- [ ] Design system doc mới ở `docs/design-system.md`

## 11. Next steps (after approval)

1. Anh approve brainstorm này → em invoke `/ck:plan` với context = file này để generate plan multi-phase chi tiết tại `plans/260506-2335-magical-uiux-overhaul/`
2. Plan sẽ có 4 phases:
   - phase-01-home-vertical-slice.md (token refactor + 8-10 assets + 5 sections)
   - phase-02-sach-catalog-detail.md (catalog + book detail per-slug)
   - phase-03-gioi-thieu-podcast.md (about + podcast)
   - phase-04-seo-perf-gate.md (OG images + JSON-LD + Lighthouse audit)
3. Em sẽ delegate Nano Banana generation qua `/ck:ai-artist` skill, code work qua `/ck:frontend-design`, design review qua `/ck:ui-ux-pro-max`
4. Sau approve plan, anh fire `/ck:cook plans/260506-2335-magical-uiux-overhaul/phase-01-home-vertical-slice.md` để start

## 12. Final decisions (round 2)

| # | Question | Anh chốt |
|---|---|---|
| 1 | Book covers Miền Nam + Góc Phần Tư có AI-enhance? | **Giữ nguyên** — cover thật là tác phẩm Huy. AI chỉ gen ambient + scene + motifs, không touch cover. |
| 2 | Existing audit plan `260504-2119-website-uiux-audit` xử lý sao? | **Run audit trước** — execute audit plan để có baseline findings, rồi /ck:plan overhaul reference findings. Plan magical overhaul sẽ có Phase 0 = audit execution (delegate to existing plan) hoặc audit chạy như separate session trước. |
| 3 | Hand-drawn signature source? | **Em generate SVG monoline** — match Dancing Script + monoline ink direction. Anh review trước ship. |
| 4 | Next step? | **Invoke /ck:plan ngay** — em fire `/ck:plan` với context = brainstorm này. |

## 13. Plan sequence (updated)

```
Phase 0: Execute audit (delegate to plans/260504-2119-website-uiux-audit)
   └─ Output: findings-visual.md, findings-a11y.md, findings-perf.md, fix-plan.md
Phase 1: Home vertical slice (token refactor + 8-10 assets + 5 sections + signature SVG)
   └─ Audit P0/P1 findings on home merge into Phase 1 scope
Phase 2: /sach catalog + /sach/[slug] detail
Phase 3: /gioi-thieu + /podcast (scout podcast page first khi vào)
Phase 4: SEO/perf gate (OG images + JSON-LD Book/Person + Lighthouse audit + design system doc)
```

## 14. Remaining open items (handle in /ck:plan)

1. Podcast scope — Em scout `/src/app/podcast/page.tsx` ở phase 3 entrance, không giả định trước.
2. A/B test — Em assume hard-cutover (site nhỏ, A/B overkill). Anh raise nếu cần.
3. Audit findings có thể discover scope ngoài magical overhaul (ex: form a11y, checkout flow bugs) → handle như separate fix queue, không nhồi vào overhaul plan.

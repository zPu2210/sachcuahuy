---
title: "Magical UI/UX Overhaul — sachcuahuy.com"
status: pending
priority: P1
created: 2026-05-06
slug: magical-uiux-overhaul
brainstorm: plans/reports/brainstorm-260506-2335-magical-uiux-overhaul.md
mode: implementation
approach: "B — Vertical Slice MVP"
blockedBy:
  - 260504-2119-website-uiux-audit
relates_to:
  - 260502-2024-sachcuahuy-production-launch (parent — site đã launch)
phases:
  - phase-00-audit-execution
  - phase-01-home-vertical-slice
  - phase-02-sach-catalog-detail
  - phase-03-gioi-thieu-podcast
  - phase-04-seo-perf-gate
---

# Plan: Magical UI/UX Overhaul — sachcuahuy.com

## Goal

Reset visual language toàn site cho match đúng linh hồn tác giả Trọng Huy — magical, poetic, ấm, sáng tạo — đồng thời giữ conversion (đặt sách) và Lighthouse ≥85 mobile. Hard switch palette navy/gold → navy/terracotta, layer hand-drawn motifs + watercolor scenes inspired bởi 20 source images đã có.

## Approach

**B — Vertical Slice MVP**: Home complete trước (validate vibe), rồi nhân rộng /sach → /gioi-thieu → /podcast. SEO/perf gate chốt cuối.

```
Phase 0 (audit, ~1h)  →  Phase 1 (home, ~8h)  ┐
                                              ├─ validate gate trước scale
                         Phase 2 (sach, ~5h)  ┤
                         Phase 3 (gioi+pod, ~4h)
                         Phase 4 (SEO/perf, ~3h)
```

Phase 1 = gate phase. Anh approve home before phases 2-4.

## Phases

| # | Phase | Status | Effort | Owner | Depends |
|---|---|---|---|---|---|
| 0 | [Audit Execution](phase-00-audit-execution.md) | completed | ~1h (~50min wall actual) | em (delegate to 260504-2119) | — |
| 1 | [Home Vertical Slice](phase-01-home-vertical-slice.md) | pending | ~8h | em | 0 |
| 2 | [Sach Catalog & Detail](phase-02-sach-catalog-detail.md) | pending | ~5h | em | 1 |
| 3 | [Gioi-thieu & Podcast](phase-03-gioi-thieu-podcast.md) | pending | ~4h | em | 1 |
| 4 | [SEO & Perf Gate](phase-04-seo-perf-gate.md) | pending | ~3h | em | 2,3 |

**Total wall: ~21h | Token budget: ~600K aggregate, ~150K main context**

## Scope

### In scope
- 4 public pages (`/`, `/sach`, `/sach/[slug]`, `/gioi-thieu`, `/podcast`)
- Token refactor (palette navy + terracotta + cobalt + ink + paper; deprecate gold)
- 25-32 generated images (monoline motifs static + watercolor scenes/portraits via Directus)
- 4 shared components (HandDrawnDivider, WatercolorWash, PaperTexture, SignatureFlourish)
- SEO: WebP/AVIF, descriptive filenames Vietnamese alt, OG images per page, JSON-LD Book + Person
- Lighthouse ≥85 mobile per page
- Design system doc at `docs/design-system.md`

### Out of scope
- Transactional pages `/dat-hang`, `/xac-nhan/*` (function-first, không vibe)
- API routes `/api/*`
- Backend Directus schema changes (existing `cover_image`, `author_image` enough)
- A/B testing infrastructure (hard cutover after Phase 1 approval)
- New product types/SKUs (out of scope for visual overhaul)
- Cross-browser test (Chromium only)
- Real device test (DevTools emulation)

## Design System (chốt)

### Colors

```ts
primary: { DEFAULT: "#1E2B4D", light: "#2D3F66", dark: "#141D36" }  // navy (keep)
accent:  { DEFAULT: "#C75D2C", light: "#E27A4F", dark: "#A04420" }  // terracotta (NEW)
cobalt:  { DEFAULT: "#3856B0", light: "#5C7AC9", dark: "#27408C" }  // cobalt (NEW)
cream:   "#F8F6F3"                                                  // (keep)
ink:     "#142849"                                                  // hand-drawn line art (NEW)
paper:   "#FAF6EC"                                                  // warm paper bg (NEW)
```

Gold (`#C9A962`) deprecated — keep ONE phase as fallback rollback safety, remove cuối Phase 4.

### Typography (giữ nguyên)
- Cormorant Garamond — hero/h1/h2
- Inter — body, navigation
- Dancing Script — script accents/quotes

### A11y guard rails
- `accent.DEFAULT` on cream → ~4.5:1 → AA large only → headings/badges/decoratives
- `accent.dark` on cream → ~6.5:1 → AA normal → inline links, body accents
- Body text giữ `text-gray-700` hoặc `primary.dark`

## Success Criteria (cross-phase)

- [ ] All 4 pages Lighthouse mobile ≥85 (perf, a11y, best-practices, SEO)
- [ ] LCP <2.8s on 4G throttled per page
- [ ] No regression on `/dat-hang` order flow + `/xac-nhan/*` confirmation (smoke test)
- [ ] OG images custom 4 pages, validate qua opengraph.xyz
- [ ] JSON-LD Book schema `/sach/[slug]` + Person schema `/gioi-thieu` validate qua schema.org tester
- [ ] Sitemap có image entries
- [ ] All assets WebP, descriptive filenames, alt text Vietnamese
- [ ] `docs/design-system.md` shipped với token mapping + component spec
- [ ] Gold token removed completely from codebase
- [ ] Anh approve before/after side-by-side screenshots per phase

## Brand Baseline (reference cho all phases)

- **Vibe**: magical, poetic, ấm, sáng tạo, Indochine văn nghệ sĩ indie
- **Source materials**: 20 images at `~/Downloads/sachcuahuy/` (cobalt portrait, watercolor cover Góc Phần Tư, monoline calligraphy Miền Nam)
- **Books**: Miền Nam Của Huy (mới ra), Góc Phần Tư
- **Author**: Trọng Huy — voice talent, writer
- **Lang**: vi-VN

## Risks (cross-phase)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Terracotta a11y borderline trên cream | High | Med | Dùng `accent.dark` cho body inline, `accent.DEFAULT` chỉ heading/large. A11y gate Phase 4. |
| AI images không nhất quán → "AI slop" | Med | High | Lock prompt template per category, batch gen 3-4 variants, curate keep top 1-2. Anh review trước commit. |
| Lighthouse perf rớt < 85 | Med | Med | Lazy-load aggressive, priority chỉ hero, inline SVG motifs, preconnect Directus. Test cuối mỗi phase. |
| Anh không thích direction sau Phase 1 | Low | High | Vertical slice cho phép git revert phase 1 → quay lại production hiện tại. |
| Time creep — fine-tune lan man | High | Med | Hard cap 8h Phase 1, success criteria cho mỗi phase, không tự thêm work. |
| Audit findings (Phase 0) ngoài scope overhaul | Med | Med | Track qua separate fix queue, không nhồi vào overhaul plan. Phase 1 chỉ pickup audit findings overlap với home. |

## Dependencies

- **Phase 0 → existing audit plan** `260504-2119-website-uiux-audit` (status=pending)
  - Em delegate / coordinate execution của plan đó trước Phase 1
  - Output: `plans/reports/audit-260504-2119-website-uiux/` (findings + fix-plan)
  - Audit plan's frontmatter cần update `blocks: [260506-2335-magical-uiux-overhaul]`
- **Phase 2,3 → Phase 1** (token + shared components ready)
- **Phase 4 → Phase 2,3** (all pages ship before SEO/perf gate)

## Brainstorm reference

`plans/reports/brainstorm-260506-2335-magical-uiux-overhaul.md` — full context, 14 sections, decisions log, image inventory, design system, risks.

## Next Steps

1. Anh review plan.md + 5 phase files
2. Approve → em start Phase 0 (delegate audit execution)
3. Phase 0 done → em present audit findings summary, request Phase 1 approval
4. Phase 1 done → em present home before/after, request Phase 2-3 approval
5. Phase 2-3 done parallel-ish → em present, request Phase 4 (SEO/perf gate)
6. Phase 4 done → final Lighthouse + design system doc → ship

## Unresolved

1. Audit findings sẽ thay đổi Phase 1 scope — em re-scope Phase 1 sau Phase 0 done, có thể bump effort 6h → 10h tùy P0/P1 audit findings.
2. Podcast page hiện chỉ có `page.tsx` đơn — Phase 3 entrance scout mới biết content depth.
3. Image generation API key (Nano Banana) — cần verify ai-artist skill chạy được không trước Phase 1.

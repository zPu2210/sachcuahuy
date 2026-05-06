---
type: audit-executive-summary
date: 2026-05-07 00:34 (Asia/Saigon)
audit-plan: plans/260504-2119-website-uiux-audit
overhaul-plan: plans/260506-2335-magical-uiux-overhaul (Phase 0)
target: https://sachcuahuy.com (production)
---

# Audit Report — sachcuahuy.com UI/UX

**Date:** 2026-05-07 00:25 (Asia/Saigon)
**Scope:** 8 pages × 2 viewports + 6 interactive states + Lighthouse 3 priority pages + 1 competitor skim
**Method:** Multi-agent parallel — `ui-ux-designer` (visual) + `code-reviewer` (a11y) + `debugger` (perf)
**Wall time:** ~30 min capture + ~7-9 min sub-agents (parallel) + ~10 min consolidation = ~50 min total

---

## TL;DR

Site visually disciplined về palette + typography (no drift detected), Lighthouse a11y/BP perfect, perf borderline (Home Perf 84, LCP 4.2s = poor tier). NHƯNG có **3 conversion-killers cần fix bất kể magical overhaul**: (1) raw HTML tags rendered as text in book descriptions, (2) plain navy block thay vì hero book cover, (3) form validation invisible. Recommend isolating "Quick Wins stabilization sprint" (~5h) trước khi launch Phase 1 overhaul.

## Severity Totals (deduplicated)

| Sev | Total | Visual | A11y | Perf |
|---|---|---|---|---|
| **P0 Critical** | 8 | 3 | 4 | 2 |
| **P1 High** | 22 | 11 | 7 | 6 |
| **P2 Medium** | 16 | 9 | 5 | 3 |
| **P3 Low** | 9 | 5 | 2 | 2 |
| **Total** | **55** | 28 | 18 | 13 |

(1 cross-agent overlap merged: form validation visible/invisible = Visual P0 #3 + A11y P0 #2 same root cause.)

---

## 🔥 Top 10 Findings (curated cross-concern)

| # | Severity | Issue | Page | Source | Fix Effort |
|---|---|---|---|---|---|
| 1 | P0 | Raw HTML tags `<p>`, `<br>`, `<strong>` rendered as plain text in book descriptions | /sach/[slug] | Visual | S |
| 2 | P0 | Plain navy block thay vì hero book cover image (50% viewport empty) | / | Visual | S |
| 3 | P0 | Form validation invisible: no inline errors, no aria-invalid wiring | /dat-hang | Visual + A11y | M |
| 4 | P0 | Home LCP 4.2s — `preserve-3d`/`perspective` on hero `<Link>` blocks paint 3.2s (77% of LCP) | / | Perf | S |
| 5 | P0 | Gold #C9A962 on cream contrast 2.4:1 (4 raw `text-accent` spots remain) | /sach/[slug], /xac-nhan, /podcast | A11y | S |
| 6 | P0 | Missing skip link → keyboard users tab through 5-7 header items every page | all | A11y | S |
| 7 | P0 | /dat-hang missing `alternates.canonical` → SEO 58 (canonical fails) | /dat-hang | Perf | XS |
| 8 | P1 | "Sẽ cập nhật sau" placeholder visible in production footer (Mạng Xã Hội column) | all | Visual | S |
| 9 | P1 | Mobile order summary placed below submit button — user pays without seeing total | /dat-hang | Visual | M |
| 10 | P1 | Mobile menu toggle missing aria-expanded + Esc + focus trap | all (mobile) | A11y | M |

---

## Lighthouse Scores (mobile, simulated 4G)

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| / | **84** ⚠️ | 100 | 100 | 100 | **4.2s** ❌ | 0 | 30ms |
| /sach | **89** | 100 | 100 | 100 | **3.3s** ⚠️ | 0 | 200ms |
| /dat-hang | 92 | 100 | 100 | **58** ⚠️ | 3.0s | 0 | 30ms |

**Red flags:**
- Home **LCP 4.2s** > 4s "poor" threshold — single biggest perf issue
- Home Perf **84** < overhaul target ≥85 (will resolve after LCP fix)
- /dat-hang SEO **58** = intentional `noindex` on checkout (P0 #7 fixes canonical only → ~75)

JSONs at `lighthouse/{home,sach,dat-hang}.json`.

---

## Recommended Next Actions

1. **Anh review** `fix-plan.md` (10 min read) — focus on P0 + Quick Wins sections
2. **Approve "Session A — Quick Wins Stabilization"** (~5h) → em /ck:cook qua separate session before Phase 1 launch.
3. **Approve `audit-integration-notes.md`** (in overhaul plan dir) → routes findings to correct overhaul phases
4. **Decide unresolved** (see fix-plan.md "Unresolved Questions"): cart icon keep/remove, "100+ Đã đọc" placeholder?, color token refactor timing
5. **Delete dummy order** via Directus admin (info below)

After Session A done → start Phase 1 Home Vertical Slice with confidence (perf gate passable, a11y baseline solid, no placeholder copy).

---

## Quick Wins Bucket (recommend FIRST cook session)

13 high-impact + low-effort items, ~5h total:

1. Add skip link to layout.tsx body (P0)
2. Replace 4 raw `text-accent` → `text-[#7A6125]` (P0)
3. Fix raw HTML rendering in book descriptions (P0)
4. Add `alternates.canonical: "/dat-hang"` (P0)
5. Remove `preserve-3d`/`perspective` from hero `<Link>` (P0 — biggest LCP win)
6. Self-host `transparenttextures.com` PNGs to `/public/textures/` (P1)
7. Replace 3 Dicebear API calls với local SVGs (P1)
8. Hide "Sẽ cập nhật sau" footer placeholder (P1)
9. Add `aria-hidden="true"` to ~20 decorative Lucide icons (P1)
10. Add `aria-label` to each `<nav>` (P1)
11. Bump `text-white/40` → `text-white/70` in CTA footnote (P1)
12. Reduce Cormorant + Dancing Script weights + `display: "optional"` (P1)
13. Add `<button disabled>` instead of `<Link aria-disabled>` for OOS (P1)

**Outcome estimate:** Home Perf 84 → ~90, LCP 4.2s → ~2.2s, A11y violations cleared, no placeholder text trong production.

---

## File Index

```
plans/reports/audit-260504-2119-website-uiux/
├── README.md                 # this file (5-min executive read)
├── fix-plan.md               # full backlog với severity matrix + cook sessions
├── findings-visual.md        # 28 findings — ui-ux-designer agent
├── findings-a11y.md          # 18 findings — code-reviewer agent (WCAG SC cited)
├── findings-perf.md          # 13 findings — debugger agent (LCP element analysis included)
├── findings-competitor.md    # Nhã Nam UX patterns + 5 recs cho overhaul
├── baseline-manifest.md      # capture inventory + Lighthouse summary + dummy order info
├── screenshots/              # 16 baseline (8 pages × 2 viewports)
│   └── interactive/          # 6 states (form validation, hovers, order confirm)
└── lighthouse/               # 3 JSON reports
```

---

## Dummy Order Cleanup ⚠️

Anh delete via Directus admin (Collections → orders → filter `[AUDIT-DUMMY]`):

- **Order code:** `SCH-260506-6774`
- **Order token:** `t458gvsbfeez2ztz`
- **Customer:** `[AUDIT-DUMMY] Test Audit`
- **Phone:** 0900000000
- **Email:** audit-dummy@test.local
- **Item:** Góc Phần Tư × 1 = 124,000đ
- **Confirmation URL:** /xac-nhan/t458gvsbfeez2ztz

---

## Unresolved Questions

### Decision needed (anh)
1. **Color token refactor timing:** Fix gold contrast NOW vs wait Phase 1 magical palette redefine? Em recommend: do quick win now, Phase 1 supersedes anyway.
2. **Cart icon:** Keep for future multi-SKU? Add counter badge? Or remove for header simplicity?
3. **Hero "100+ Đã đọc":** Real number or placeholder?
4. **Out-of-stock CTA pattern:** `<button disabled>` or hide CTA?
5. **Phase 1 scope:** Copy polish included or visual-only?
6. **Session F (form a11y / parking lot) priority:** When schedule?

### Investigation needed (em can do later)
- Directus rich-text sanitizer config (for P0-1 fix)
- Umami script injection source (Vercel dashboard?)
- Confirm `preserve-3d` is sole LCP cause vs hydration co-contributor
- Directus AVIF transform support
- ISR cold-miss TTFB

---

## Out-of-Scope (intentionally not audited)

- Cross-browser test (Chromium only)
- Real-device test (DevTools emulation only)
- Load test / stress test
- Backend Directus performance
- Apply code fixes (audit-only — anh review qua /ck:cook sau)
- Implement dark mode (P3 missing flag only)
- Deep competitor analysis (lightweight skim only)

## Method Notes

- **Capture:** Playwright 1.59 + cached Chromium 1217, locale `vi-VN`, realistic UA, no Cloudflare bot block. 22 PNGs total (16 baseline + 6 interactive). Vietnamese diacritics rendered correctly (verified).
- **Lighthouse:** v12 via npx, mobile form-factor, simulate throttling, headless Chrome.
- **Sub-agents:** 3 parallel (single message, 3 Agent tool blocks). Each independent 200K context. Total wall ~9 min (longest agent), main token cost ~30K (prompts + summaries).
- **De-duplication:** Em scanned 3 finding files, identified overlap on form validation issue (Visual + A11y both surface same root cause "no inline error rendering"). Counted at P0 once.

## Status

- **Audit plan** `260504-2119-website-uiux-audit`: all 3 phases ✓ → status will flip → completed after this README writes.
- **Overhaul Phase 0** `260506-2335-magical-uiux-overhaul/phase-00`: in-progress → completed after audit-integration-notes.md writes + frontmatter status flip.
- **Phase 1 entry** blocked until anh review audit-integration-notes.md + approve adjusted scope.

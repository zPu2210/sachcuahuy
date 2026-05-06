---
type: audit-fix-plan
date: 2026-05-07 00:34 (Asia/Saigon)
inputs:
  - findings-visual.md (28 findings)
  - findings-a11y.md (18 findings)
  - findings-perf.md (13 findings)
  - findings-competitor.md (Nhã Nam patterns)
deduplicated: ~5 cross-agent overlaps merged
---

# Fix Plan — sachcuahuy.com UI/UX Audit

## Severity Distribution

| Sev | Total (deduped) | Visual | A11y | Perf |
|---|---|---|---|---|
| **P0 Critical** | 8 | 3 | 4 | 2 |
| **P1 High** | 22 | 11 | 7 | 6 |
| **P2 Medium** | 16 | 9 | 5 | 3 |
| **P3 Low** | 9 | 5 | 2 | 2 |
| **Total** | **55** | 28 | 18 | 13 |

Note: 1 multi-agent overlap (form validation = Visual P0 #3 + A11y P0 #2 = same root cause "no inline error rendering / aria-invalid"). Counted once at P0 level.

---

## 🔥 P0 Critical (Fix immediately — blocks conversion or accessibility)

| # | Finding | Source | Page | Effort | Owner |
|---|---|---|---|---|---|
| P0-1 | **Raw HTML tags rendered in book description** (`<p>`, `<br>`, `<strong>` shown as plain text) | Visual | /sach/[slug] | S | Phase 2 |
| P0-2 | **Plain navy hero block instead of book cover image** | Visual | / | S (temp swap), M (proper) | Phase 1 |
| P0-3 | **Form validation invisible** (no inline errors, no aria-invalid, missing field error wiring) | Visual + A11y | /dat-hang | M | Parking (out-of-scope of overhaul) |
| P0-4 | **Gold #C9A962 on cream contrast 2.4:1** (4 spots: sach/[slug] price, xac-nhan total ×2, podcast hero) | A11y | /sach/[slug], /xac-nhan, /podcast | S | Phase 2 + Phase 3 + Parking |
| P0-5 | **Missing skip link** ("Bỏ qua đến nội dung chính") | A11y | all | S | Phase 1 (global layout) |
| P0-6 | **Decorative step numbers inside `<h2>`** (`<span>1</span> Thông Tin...` reads as "1 Thông Tin") | A11y | /dat-hang | S | Parking |
| P0-7 | **Home LCP 4.2s — `preserve-3d`/`perspective` on hero `<Link>` blocks paint 3.2s** | Perf | / | S | Phase 1 |
| P0-8 | **/dat-hang missing `alternates.canonical`** → SEO 58 (canonical audit fails) | Perf | /dat-hang | XS | Phase 4 (SEO gate) |

**P0 estimated effort: ~5h total. Most are S. Phase 1 picks 3 P0s (#2, #5, #7).**

---

## ⚡ Quick Wins (1-day batch — high impact + low effort, mọi severity)

Recommended *first* /ck:cook session — máy hơn cả Phase 1 entry. Prep work hoặc pre-Phase-1 cleanup.

| # | Finding | Source/Sev | Effort | Impact |
|---|---|---|---|---|
| QW-1 | Add skip link to layout.tsx body | A11y P0 | S (5 min) | High (a11y compliance) |
| QW-2 | Replace 4 raw `text-accent` → `text-[#7A6125]` (sach/[slug]:162, xac-nhan:246,306, coming-soon-hero:29,42) | A11y P0 | S | High (WCAG AA) |
| QW-3 | Fix raw HTML rendering in book descriptions | Visual P0 | S | High (kill credibility issue) |
| QW-4 | Add `alternates.canonical: "/dat-hang"` | Perf P0 | XS | Med (SEO 58→75) |
| QW-5 | Remove `preserve-3d`/`perspective` from hero `<Link>` wrapper | Perf P0 | S | Very High (LCP −1.5s) |
| QW-6 | Self-host `transparenttextures.com` PNGs to `/public/textures/` | Perf P1 | XS | Med (−116ms cross-origin) |
| QW-7 | Replace 3 Dicebear API calls với local SVGs | Perf P1 | XS | Med (−500ms, eliminate 3rd-party) |
| QW-8 | Hide "Sẽ cập nhật sau" footer placeholder | Visual P1 | S (5 min) | Med (professionalism) |
| QW-9 | Add `aria-hidden="true"` to ~20 decorative Lucide icons | A11y P1 | M | Med (a11y) |
| QW-10 | Add `aria-label` to each `<nav>` ("Chính", "Đường dẫn", "Di động") | A11y P1 | S | Med (a11y) |
| QW-11 | Bump `text-white/40` → `text-white/70` in CTA footnote | A11y P1 | XS | Med (WCAG AA) |
| QW-12 | Reduce Cormorant + Dancing Script weights + `display: "optional"` | Perf P1 | S | Med (font −40KB) |
| QW-13 | Add `<button disabled>` instead of `<Link aria-disabled>` for OOS | A11y P1 | S | Med (keyboard fix) |

**Quick Wins batch effort: ~4-5h total. Recommend isolating as a "stabilization sprint" before Phase 1.**

---

## 📋 P1 Sprint (1-2 days — important but not blocking)

### Visual P1 (11 findings)
- Footer "Sẽ cập nhật sau" placeholder → QW-8 above (or hide column entirely)
- Mobile order summary placement (move above submit button) — `/dat-hang` parking
- Hero CTA hover state missing visual feedback — Phase 1
- Header nav hover/active indicator weak — Phase 1
- Repeated identical CTA blocks ăn brand impact (top hero + bottom band) — Phase 1
- Trust signals tiny grey on /sach/[slug] right column — Phase 2
- Mobile header touch targets ambiguous (cart icon + hamburger ≥44px) — Phase 1 global
- Mobile detail sticky bottom CTA missing — Phase 2
- /gioi-thieu hero solid navy block + tiny avatar — Phase 3
- Listing "Mới" badge tiny/low contrast — Phase 1 (home featured) + Phase 2 (listing)
- Generic `alt="avatar"` (Visual + A11y P1 overlap, listed once)

### A11y P1 (7 findings)
- Mobile menu toggle missing aria-expanded + Esc + focus trap — Phase 1 global
- Out-of-stock `<Link aria-disabled>` broken on Enter — Phase 2 (sach detail)
- White/40 footnote contrast — QW-11 above
- BookCard `<h2>` heading rank conflicts (3 sibling h2 under section h2) — Phase 2 (related books) + Phase 1 (home featured)
- Generic alt="avatar" on hero social-proof — Phase 1 (overlaps Visual)
- Decorative Lucide icons — QW-9 above
- (1 more covered by QWs)

### Perf P1 (6 findings)
- Unused JS chunk 988 (Framer Motion 90% unused) — Phase 4 perf gate
- /sach render-blocking CSS 620ms savings — QW-12 (font fix) + Phase 4 cleanup
- Font bundle 295KB → reduce weights — QW-12 above
- /sach LCP load delay 1.6s (preload hint needed) — Phase 4
- External textures preconnect — QW-6 above
- External Dicebear avatars — QW-7 above

---

## 🗂 P2/P3 Backlog (long-tail polish)

Group cụ thể trong findings-{visual,a11y,perf}.md. Highlights:

**Brand/visual polish (Phase 4 cleanup or post-launch):**
- Two serif fonts blur hierarchy on hero (Cormorant subhead → Inter) — Phase 1
- "Còn hàng" availability badge subtle — Phase 2
- Detail meta strip awkward rhythm — Phase 2
- /sach listing subhead 2-line dense — Phase 2
- Email field ambiguous (no asterisk, no "tuỳ chọn") — Parking (/dat-hang)
- Podcast page tiny content footprint — Phase 3
- 404 generic, opportunity for literary microcopy — Phase 1 global
- VND price formatter inconsistency (dot vs comma) — Phase 4 audit
- "Phí ship" tiny grey buried — Parking (/dat-hang)
- Confirm "Xác Minh" button looks disabled — Parking (/xac-nhan)

**A11y polish:**
- Footer heading hierarchy + sr-only "Chân trang" — Phase 1
- Payment radio `checked readOnly` confusing — Parking
- Tooltip Info icon `title` only → button + aria-describedby — Parking
- Cart icon p-2 → p-3 (44×44 touch target) — QW (could promote)
- Order summary `<aside>` landmark — Parking

**Perf polish:**
- /dat-hang Speed Index 4.0s (form skeleton) — Parking
- ISR `revalidate=300` → 600 — Phase 4
- Home Perf 84 → expected 88-92 after P0 fix (no separate action)
- `preload-lcp-image` audit verify — Phase 4

**Mixed-language `lang="en"` markup, spinner aria-hidden** — Phase 1 + Parking

---

## Cross-cutting Themes (pattern observations across multiple findings)

1. **Form a11y systemic gap** — Both forms (`OrderForm`, `VerifyForm`) have form-level `role="alert"` correctly wired. Field-level `aria-invalid`, `aria-describedby`, inline error rendering missing. **Recommendation:** Build a shared `FormField` component encapsulating label + input + error text + ARIA wiring. Apply to all 8 fields trên /dat-hang + verify form. Estimate: M (initial) + S (apply) = ~2-3h. Note: This is mostly /dat-hang and /xac-nhan, both transactional → parking lot of overhaul, but cross-cuts because pattern deserves consistent solution.

2. **Brand color token mismatch** — Anh đã chuẩn hoá `text-[#7A6125]` cho ~6 spots manually. Còn raw `text-accent` ở 4 spots. **Recommendation:** Either centralize via Tailwind config (`accent-text: #7A6125` token) hoặc redefine `accent` → darker hex. Phase 1 magical overhaul sẽ replace gold → terracotta anyway, nên anh có thể defer đến Phase 1 và define new tokens cleanly từ đầu. **Decision needed:** fix gold contrast NOW (separate quick win) vs wait for Phase 1 token refactor.

3. **Decorative-icon labelling inconsistent** — Only `Info` (order-form:257) và `404` heading have `aria-hidden`. ~20 other Lucide icons unmarked. Apply globally as a one-shot pattern fix.

4. **Empty hero blocks systemic** — Home hero cover side, /gioi-thieu hero block, /podcast page-wide use solid navy as placeholder. Phase 1 magical overhaul (watercolor scenes) will absorb these.

5. **No `:focus-visible` styles beyond `.btn-primary` and `.input`** — Plain `<a>`, breadcrumb, footer rely on browser default. Add global `:focus-visible` rule trong globals.css.

6. **Trust signals minimal across commerce flow** — Shipping policy buried, no return policy, no payment security badges, no Zalo support visible, no real social URLs. Vietnamese ecommerce expects trust-heavy scaffolding. Recommendation: dedicated mini-pass post-overhaul.

7. **CTA language drift** — "Đặt Hàng Ngay" / "Mua Ngay" / "Mua Sách" / "Đặt Hàng" = 4 verbs. Standardize trong design system doc + apply across phases.

---

## Suggested /ck:cook Sessions

### Session A — Quick Wins Stabilization (~4-5h, recommended FIRST)
**Goal:** Fix conversion-blockers + a11y gaps + perf P0s before/parallel to magical overhaul.
- QW-1 to QW-13 (13 fixes)
- Touch: layout.tsx, hero-section.tsx, sach/[slug]/page.tsx, xac-nhan/[token]/page.tsx, coming-soon-hero.tsx, dat-hang/page.tsx, footer.tsx, header.tsx, layouts.tsx fonts, public/textures + public/avatars
- **Outcome:** Home Perf 84 → ~90, A11y violations cleared, no placeholder text, fast LCP

### Session B — Phase 1 Home Magical Overhaul (~8h, per overhaul plan)
**Goal:** Magical visual identity on home page.
- Token refactor (navy + terracotta + cobalt + ink + paper)
- Hero watercolor scene + book cover treatment (replaces P0-2 plain block permanently)
- Hand-drawn motif components
- Cross-cutting CTA hover + nav active state polish
- Visual P1 home-relevant findings absorbed

### Session C — Phase 2 Sach Catalog & Detail (~5h)
**Goal:** Apply magical overhaul + fix /sach + /sach/[slug] findings.
- Listing card with new badge style (P1 "Mới" badge)
- Detail page raw-HTML fix (P0-1, mostly already in QW-3)
- Trust signals badge redesign (P1)
- Mobile sticky CTA (P1)
- BookCard heading-level prop (A11y P1)
- Out-of-stock `<button disabled>` (A11y P1, partly in QW-13)

### Session D — Phase 3 Gioi-thieu & Podcast (~4h)
**Goal:** Apply magical overhaul to author + podcast pages.
- /gioi-thieu hero redesign (Visual P1) + content depth
- /podcast expand from single card to multi-section (Visual P2) + sign-up form
- Coming-soon-hero contrast fix (P0-4 partial)

### Session E — Phase 4 SEO/Perf Gate (~3h)
**Goal:** Final perf + SEO compliance.
- Lighthouse re-run all 4 pages, ≥85 mobile per page
- Framer Motion dynamic import (Perf P1)
- Font bundle reduction final
- /sach LCP preload hint
- VND formatter audit (Visual P2)
- Sitemap image entries
- JSON-LD Book + Person validate
- OG images custom per page

### Session F — Parking Lot (separate /ck:cook, NOT part of overhaul) (~3-4h)
**Goal:** Fix /dat-hang + /xac-nhan transactional issues out of overhaul scope.
- Form validation visible (P0-3) — biggest item, most-complex
- Decorative step numbers in h2 (P0-6)
- Email field "(tuỳ chọn)" label (P2)
- Mobile order summary placement (P1)
- Payment radio fix (P2)
- Tooltip Info icon (P2)
- Confirm "Xác Minh" disabled state (P2)
- Order summary `<aside>` landmark (P2)
- /dat-hang Speed Index skeleton (P2)

---

## Recommended Order

1. **Session A (Quick Wins)** — first, before Phase 1 — clears P0 baseline + fast LCP
2. **Session B (Phase 1 Home)** — overhaul vertical slice — anh gate decision
3. **Sessions C + D parallel** — Phase 2 & 3
4. **Session E (Phase 4 SEO/Perf)** — gate
5. **Session F (Parking)** — anytime, separate from overhaul

**Critical:** Session A reduces risk for Phase 1 (no perf surprises, no a11y debt to track during overhaul). Strongly recommend NOT skip.

---

## Unresolved Questions (consolidated from 3 agents)

### Decision needed (anh)
1. **Color token refactor timing:** Fix gold contrast NOW (quick win) hoặc wait Phase 1 magical overhaul to redefine palette cleanly? Em recommend: do quick win now, Phase 1 supersedes anyway.
2. **Cart icon:** Keep for future multi-SKU expansion → add badge counter? Or remove → simplify header? Phase 1 decision.
3. **Hero "100+ Đã đọc":** Real number or aspirational placeholder? If placeholder → hide until truthful. Phase 1 decision.
4. **Out-of-stock CTA pattern:** `<button disabled>` (A11y fix) or hide CTA + status text only? Phase 2 decision.
5. **Phase 1 scope:** Re-translation/copy polish included or visual-only repaint? Some findings (P3 author page line, microcopy warmth, CTA verb standardization) are copy-level.
6. **Form validation a11y fix priority:** Out of magical overhaul scope. Schedule Session F when?

### Investigation needed (em can do later)
1. Directus rich-text field sanitizer config option vs client-render side — for P0-1 fix.
2. Umami script source location (Vercel dashboard injection?) — for full perf control.
3. Render Delay on home: confirm `preserve-3d` is sole cause vs hydration co-contributor — needs Chrome Performance trace.
4. Directus AVIF transform support — affects overhaul image budget.
5. ISR cold-miss TTFB under real traffic.

---

## Output Inventory

```
plans/reports/audit-260504-2119-website-uiux/
├── README.md                 # Executive summary (separate file)
├── fix-plan.md               # this file
├── findings-visual.md        # ui-ux-designer (28 findings)
├── findings-a11y.md          # code-reviewer (18 findings)
├── findings-perf.md          # debugger (13 findings)
├── findings-competitor.md    # Phase 1 competitor skim (Nhã Nam)
├── baseline-manifest.md      # Phase 1 capture inventory
├── screenshots/
│   ├── 01-home-{mobile,desktop}.png ... 08-not-found-*.png  (16 baseline)
│   └── interactive/          # 6 interactive states
└── lighthouse/
    ├── home.json
    ├── sach.json
    └── dat-hang.json
```

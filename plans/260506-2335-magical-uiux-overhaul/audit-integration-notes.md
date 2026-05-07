---
type: audit-overhaul-integration
date: 2026-05-07 00:34 (Asia/Saigon)
audit-source: plans/reports/audit-260504-2119-website-uiux/
related:
  - plan.md (overhaul plan)
  - phase-00-audit-execution.md
status: pending-anh-review
---

# Audit findings → Overhaul phase routing

Em filter 56 unique audit findings (post-dedup, post-reclass) → route per overhaul phase. Out-of-scope findings → parking lot (separate /ck:cook session).

**Critical decision point:** Anh review trước approve Phase 1 entry. Audit findings có thể bump Phase 1 effort 8h → 10-12h tuỳ pickup level.

---

## 🔥 Pre-Phase 1: "Quick Wins Stabilization Sprint" (NEW — recommended)

**Why separate sprint:** 6 P0/P1 fixes nằm CROSS-cutting (layout.tsx, fonts, header, footer) hoặc PARKING-lot pages (/sach/[slug] price contrast, /xac-nhan total). Nếu nhồi vào Phase 1 home, Phase 1 effort balloons + scope creep. Tách ra clean.

**Target wall: ~5h. Em recommend launch BEFORE Phase 1.**

### Items
| ID | Finding | Source/Sev | Effort |
|---|---|---|---|
| QW-1 | Add skip link to `layout.tsx` body | A11y P0 | S |
| QW-2 | Replace 4 raw `text-accent` → `text-[#7A6125]` | A11y P0 | S |
| QW-3 | Fix raw HTML rendering trong `/sach/[slug]` description | Visual P0 | S |
| QW-4 | Remove `preserve-3d`/`perspective` from hero `<Link>` wrapper | Perf P0 | S |
| QW-5 | Self-host `transparenttextures.com` PNGs to `/public/textures/` | Perf P1 | XS |
| QW-6 | Replace 3 Dicebear API calls với local SVGs | Perf P1 | XS |
| QW-7 | Hide "Sẽ cập nhật sau" footer placeholder | Visual P1 | S |
| QW-8 | Add `aria-hidden="true"` to ~20 decorative Lucide icons | A11y P1 | M |
| QW-9 | Add `aria-label` to each `<nav>` | A11y P1 | S |
| QW-10 | Bump `text-white/40` → `text-white/70` in CTA footnote | A11y P1 | XS |
| QW-11 | Reduce Cormorant + Dancing Script weights + `display: "optional"` | Perf P1 | S |
| QW-12 | Add `<button disabled>` instead of `<Link aria-disabled>` for OOS | A11y P1 | S |

(Previous QW-4 "/dat-hang `alternates.canonical`" removed — reclassified P0→P3 since `noindex` is intentional. See Phase 4 SEO section + parking lot for handling. Renumbered remaining items.)

### Outcome estimate (scoped)
- Home Perf 84 → ~90 (passes overhaul gate ≥85)
- LCP 4.2s → ~2.2s (within "good" tier)
- **Global + home A11y P0 baseline cleared** (skip link + 4 gold/cream contrast spots fixed)
- No placeholder text in production
- Font budget −40KB
- 4 cross-origin connections eliminated

### Remains open after QW Sprint (NOT cleared, deferred to Session F)
- **P0-3** Form validation invisible (`/dat-hang`) — needs shared FormField component, M effort
- **P0-6** Decorative step numbers `<span>1</span>` inside `<h2>` (`/dat-hang`) — S effort

Both are transactional-page A11y P0s. Out of magical overhaul scope (per overhaul plan §Out-of-scope: `/dat-hang`, `/xac-nhan/*`). Phase 1 not blocked, but anh should schedule Session F separately. **Do not interpret QW Sprint as "all P0s cleared" — only global + home P0s.**

**Decision needed (anh):**
- [ ] Approve QW sprint as separate /ck:cook session?
- [ ] Or merge selective QWs into Phase 1 home (only those touching home)?
- [ ] Or skip QW sprint, accept findings carry into Phase 1?

Em recommend **Option 1** (separate sprint) — clean baseline + better measurement signal Phase 1 changes.

---

## Phase 1 — Home Vertical Slice — pickup these findings

### Visual (home-specific)
- **[P0-2] Plain navy hero block** → Phase 1 watercolor scene + book cover treatment **AUTO-SOLVES** (already in plan)
- **[P1] Hero CTA hover state missing** — pickup explicitly (hero-section.tsx hover spec)
- **[P1] Header nav hover/active indicator weak** — pickup explicitly (header.tsx underline animation)
- **[P1] Repeated identical CTA blocks ăn brand impact** — pickup (bottom band differentiation: testimonial / urgency / gift framing)
- **[P1] Mobile header touch targets ambiguous** — pickup (cart + hamburger ≥44px)
- **[P1] Listing "Mới" badge tiny/low contrast** — pickup home featured cards (Phase 2 pickup `/sach`)
- **[P2] Two serif fonts blur hierarchy on hero** — pickup (sub-line Inter italic, reserve Cormorant heading-only)
- **[P2] 404 generic, opportunity for literary microcopy** — pickup (small touch in Phase 1 global polish)
- **[P3] Hero "100+ Đã đọc" buried** — pickup (reposition closer to CTA) — **DECISION NEEDED:** real number or placeholder?
- **[P3] Generic `alt="avatar"` on hero avatars** — pickup (decorative, alt="")

### A11y (home + global layout)
- **[P0-5] Missing skip link** → covered by QW-1, NOT Phase 1
- **[P1] Mobile menu toggle aria-expanded + Esc + focus trap** — pickup (header.tsx Phase 1 polish)
- **[P1] Generic `alt="avatar"` on hero social-proof** — duplicates Visual P3
- **[P1] BookCard `<h2>` heading rank** — pickup home featured (parameterize headingLevel)
- **[P1] Decorative Lucide icons unmarked** → covered by QW-8, NOT Phase 1
- **[P3] Mixed-language `lang="en"` markup (header tagline)** — pickup (small)

### Perf (home)
- **[P0-7] Home LCP 4.2s preserve-3d** → covered by QW-4, NOT Phase 1
- **[P1] External textures + Dicebear** → covered by QW-5, QW-6
- **[P1] Font bundle reduction** → covered by QW-11

### Bumped Phase 1 effort
- Original plan: 8h
- After audit pickup: ~9-10h (small +1-2h cho hover polish + nav active + header touch + heading levels + hero subline + alt fixes)

**Phase 1 explicit additions to plan:**
1. Hover state spec: hero CTA + nav links + book card → terracotta accent + underline animation
2. Mobile header: ≥44px tap targets, mobile menu Esc/aria-expanded, focus trap
3. BookCard prop: `headingLevel: 2 | 3` (defaults 3, /sach uses 2 nếu top-level)
4. Hero typography: subline → Inter italic, paragraph → Inter regular
5. 404 page: literary microcopy + watercolor doodle
6. Hero avatars: `alt=""`, social-proof reposition (pending real-number decision)

---

## Phase 2 — Sach Catalog & Detail — pickup these findings

### Visual
- **[P0-1] Raw HTML rendering** → covered by QW-3, but verify post-overhaul still works
- **[P0-2] Plain navy block** = home only, n/a Phase 2
- **[P1] Trust signals tiny grey on right column** — pickup (Phase 2 detail trust badges với terracotta icons)
- **[P1] Mobile detail sticky bottom CTA missing** — pickup (Phase 2)
- **[P1] Listing "Mới" badge tiny/low contrast** — pickup (`/sach` listing cards in new palette)
- **[P2] "Còn hàng" availability badge subtle** — pickup (Phase 2 detail, larger green dot + stock)
- **[P2] Detail meta strip awkward rhythm** — pickup
- **[P2] /sach listing subhead 2-line dense** — pickup (tighten copy)
- **[P3] "Sách Khác Của Tác Giả" 1-card layout awkward** — pickup (constrain width or add filler)

### A11y
- **[P0-4 partial] `text-accent` on `/sach/[slug]:162` price** → covered by QW-2
- **[P1] Out-of-stock CTA `<Link aria-disabled>` broken** → covered by QW-12 OR pickup explicitly (Phase 2 BookCard refactor)
- **[P1] BookCard `<h2>` heading rank** — pickup (related books → h3, parameterize)

### Perf
- **[P1] /sach LCP load delay 1.6s preload hint** — pickup (Phase 2 listing performance fix)
- **[P1] /sach render-blocking CSS 620ms** → mostly covered by QW-11 fonts; verify Phase 2

### Bumped Phase 2 effort
- Original: 5h
- After audit pickup: ~6-7h

---

## Phase 3 — Gioi-thieu & Podcast — pickup these findings

### Visual
- **[P1] /gioi-thieu hero solid navy block + tiny avatar** → Phase 3 magical overhaul **AUTO-SOLVES**
- **[P2] /podcast page tiny content footprint** → Phase 3 expand to multi-section + email signup form
- **[P3] /gioi-thieu "Tin thêm thân ở kênh trình..." awkward Vietnamese** — pickup (rewrite line, confirm với anh)
- **[P3] Mixed-language "Voice Talent"** — pickup (`<span lang="en">Voice Talent</span>`)

### A11y
- **[P0-4 partial] `text-accent` on `/podcast/coming-soon-hero.tsx:29,42`** → covered by QW-2
- **[P2] /gioi-thieu MapPin/BookOpen/Mic icons unmarked** → covered by QW-8

### Perf
- None /gioi-thieu or /podcast specific — magical overhaul image budget concern is general (covered by Phase 4 perf gate).

### Bumped Phase 3 effort
- Original: 4h
- After audit pickup: ~4.5h (mostly absorbed by overhaul; few small picks)

---

## Phase 4 — SEO/Perf Gate — pickup these findings

### Perf
- **[P0-7] Home LCP fix** — already in QW-4; Phase 4 verify ≥85 holds
- **[P1] Unused JS chunk 988 (Framer Motion 90% unused)** — pickup (Phase 4 dynamic import or CSS replacement)
- **[P1] /sach LCP load delay preload hint** — pickup explicit Phase 4 (Phase 2 lays groundwork, Phase 4 verifies)
- **[P2] /dat-hang Speed Index 4.0s form skeleton** → parking (out of overhaul scope)
- **[P2] ISR `revalidate=300` → 600** — pickup (5-min change, big consistency win)
- **[P3] Verify `<link rel=preload>` on home** — pickup (verification only)

### SEO (overhaul plan already includes — verify alignment)
- OG images custom 4 pages — already in plan
- JSON-LD Book + Person — already in plan
- Sitemap image entries — already in plan
- WebP/AVIF alt text Vietnamese — already in plan
- `alternates.canonical: "/dat-hang"` → **reclassified P0→P3** (perf agent flagged P0 but `noindex` is intentional, SEO 58 expected behavior). Optional 1-line hygiene only — pickup if convenient, drop if not.
- VND price formatter consistency — pickup (Phase 4 audit + lock util)

### Visual / A11y polish (consolidate cuối)
- VND formatter inconsistency — pickup
- Footer heading hierarchy + sr-only "Chân trang" — pickup (small)
- Global `:focus-visible` style trong globals.css — pickup (small)

### Bumped Phase 4 effort
- Original: 3h
- After audit pickup: ~4h

---

## 🗂 Parking Lot (out of overhaul scope — separate /ck:cook session needed)

These findings are P0/P1 BUT touch transactional flows (`/dat-hang`, `/xac-nhan`) that are **explicitly out of scope** per overhaul plan. Schedule "Session F — Form A11y + Transactional Polish" sau khi overhaul ship hoặc parallel.

### /dat-hang
- **[P0-3] Form validation invisible** (Visual + A11y same root) — biggest item, M effort, needs shared FormField component
- **[P0-6] Decorative step numbers `<span>1</span>` in `<h2>` reads as heading text** — S
- **[P1] Mobile order summary placement (move above submit button)** — M
- **[P2] Email field "(tuỳ chọn)"/asterisk ambiguous** — XS
- **[P2] Payment radio `checked readOnly` confusing** — S
- **[P2] Tooltip Info icon `title` only → button + aria-describedby** — S
- **[P2] Order summary sidebar should be `<aside>` landmark** — S
- **[P2] /dat-hang Speed Index 4.0s form skeleton** — M
- **[P3] Spinner SVG aria-hidden** — XS

### /xac-nhan
- **[P0-4 partial] `text-accent` on xac-nhan total** → already covered by QW-2 (1 of the 4 spots)
- **[P2] "Xác Minh" button looks disabled by default** — S

### Header global (some)
- **[P2] Cart icon p-2 → p-3 (44×44 touch target)** — promote to QW or pickup Phase 1 mobile pass

### Estimated parking effort: ~4-5h total (Session F).

**Anh decide:**
- [ ] Schedule Session F BEFORE overhaul Phase 1?
- [ ] Or defer until POST overhaul ship?
- [ ] Or selectively promote critical items (P0-3 form validation) to QW sprint?

Em recommend **defer post overhaul** unless P0-3 form invisible is currently bleeding orders — anh check Vercel Analytics conversion drop?

---

## Summary Table — effort impact per phase

| Phase | Original | After audit pickup | Delta | Status decision |
|---|---|---|---|---|
| QW Sprint (NEW) | — | ~5h | NEW | Anh approve |
| Phase 1 Home | 8h | 9-10h | +1-2h | Bump or absorb |
| Phase 2 Sach | 5h | 6-7h | +1-2h | Bump |
| Phase 3 Gioi+Pod | 4h | 4.5h | +0.5h | Absorb |
| Phase 4 SEO/Perf | 3h | 4h | +1h | Bump |
| Parking (Session F) | — | 4-5h | NEW | Defer or schedule |
| **Total** | **20h** | **27-30.5h** | **+7-10.5h** | — |

Audit-driven scope grew ~50% nhưng most landed in QW sprint (sidesteps overhaul entanglement).

---

## Cross-cutting concerns NOT yet routed

1. **Form a11y systemic gap** — both forms (`OrderForm`, `VerifyForm`) need shared `FormField` component. Belongs Session F (parking).
2. **Brand color token refactor** — `accent #C9A962` → `accent-text` darkened token, OR redefine `accent` itself. **Phase 1 magical overhaul will replace gold → terracotta anyway** — em recommend Phase 1 token refactor handle this from scratch (define `accent.DEFAULT` + `accent.dark` clearly, no `text-[#7A6125]` raw hex). Carries from QW-2 (temporary fix on baseline gold) to Phase 1 (permanent palette redefine).
3. **Decorative-icon labelling** — global apply, covered by QW-8.
4. **`:focus-visible` global rule** — covered by Phase 4 polish.
5. **CTA language drift** ("Đặt Hàng Ngay" / "Mua Ngay" / "Mua Sách") — Phase 1 design system doc lock + apply across phases.
6. **Trust signals scaffolding** — Phase 2 detail picks up Vietnamese-ecommerce trust bar; consider Phase 1 home CTA section reinforce too.

---

## Decision points cho anh review

### Approve / reject
- [ ] **QW Sprint** as separate /ck:cook session before Phase 1?
- [ ] **Phase 1 effort bump** 8h → 9-10h?
- [ ] **Phase 2 effort bump** 5h → 6-7h?
- [ ] **Phase 4 effort bump** 3h → 4h?
- [ ] **Session F (parking lot)** schedule: pre-overhaul / post-overhaul / parallel?

### Open product decisions
- [ ] Cart icon: keep + counter badge / remove?
- [ ] Hero "100+ Đã đọc": real number / placeholder / hide?
- [ ] CTA verb standardization ("Mua Ngay" cho immediate / "Đặt Hàng" cho form)?
- [ ] Phase 1 scope: copy polish included / visual repaint only?
- [ ] OOS CTA pattern: `<button disabled>` / hide CTA?

### Audit followups (em do later if approved)
- [ ] Investigate Directus rich-text sanitizer config (P0-1)
- [ ] Locate Umami script injection source (Vercel dashboard?)
- [ ] Confirm `preserve-3d` sole LCP cause vs hydration (Chrome perf trace)
- [ ] Test Directus AVIF transform support
- [ ] Measure ISR cold-miss TTFB

---

## Status

- **Audit plan** `260504-2119-website-uiux-audit`: 3 phases ✓ → status flips → **completed**
- **Overhaul Phase 0** `260506-2335-magical-uiux-overhaul/phase-00`: in-progress → **completed** after anh review this file
- **Phase 1 entry**: BLOCKED until anh review + approve scope adjustments above

## Outputs delivered

```
plans/reports/audit-260504-2119-website-uiux/    # audit deliverables (~50 min wall)
├── README.md                       # exec summary 5-min read
├── fix-plan.md                     # full backlog
├── findings-{visual,a11y,perf,competitor}.md
├── baseline-manifest.md
├── screenshots/ (16 + 6)
└── lighthouse/ (3 JSONs)

plans/260506-2335-magical-uiux-overhaul/         # overhaul plan
├── plan.md                         # status updates after anh review
├── phase-00-audit-execution.md     # status: completed (after this file approved)
└── audit-integration-notes.md      # this file
```

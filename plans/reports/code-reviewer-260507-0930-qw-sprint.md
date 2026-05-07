---
type: code-review
date: 2026-05-07 09:30 (Asia/Saigon)
reviewer: code-reviewer
scope: QW Sprint Session A (12 quick-win fixes ahead of magical UI overhaul)
verdict: DONE_WITH_CONCERNS
build: PASS (next build clean, tsc clean)
---

# Code Review — QW Sprint Session A

## 1. QW-by-QW Spec Compliance

| QW | Spec | Status | Notes |
|----|------|--------|-------|
| 1 | Skip link in `layout.tsx` | OK | `layout.tsx:103-108` matches audit recommendation verbatim. `<main id="main-content">` wired. |
| 2 | 4 raw `text-accent` → `text-[#7A6125]` | OK | All 4 spots fixed: `sach/[slug]:162`, `xac-nhan:246,306`, `coming-soon-hero:29,42` (the `text-accent` remaining on `coming-soon-hero:22` is `<Mic>` icon — colour token on icon BG, not failing-contrast text). |
| 3 | Raw HTML in book description | OK | `htmlToParagraphs()` replaces `split("\n\n")`. **Concern Q4 below.** |
| 4 | Remove `preserve-3d`/`perspective` from hero `<Link>` | PARTIAL | Inline style + `transform-style-3d` removed from `<Link>` ✓, BUT `perspective-1000` still present on parent flex container at `hero-section.tsx:144`. **See Q2 below — this is the right call structurally, but the spine/back panels are now broken visually.** |
| 5 | Self-host textures | OK | `cubes.png` (633B) and `leather.png` (77KB) saved. Both PNGs valid. CSS paths updated to `/textures/...`. |
| 6 | Local avatar SVGs | OK | 3 SVG files saved to `/public/avatars/`, paths wired. |
| 7 | Hide "Sẽ cập nhật sau" placeholder | OK + concern | Whole social column now conditional. **See Q6 — grid layout regression.** |
| 8 | `aria-hidden` on decorative Lucide icons | OK | All ~22 icons in changed files marked. Verified spot-coverage: footer (4 Lucide + 2 SVG), header (4), hero (2), cta (2), books (1), author (2), features (1), 404 (3), sach/[slug] (4), sach (1), dat-hang (1), gioi-thieu (3), coming-soon (3). |
| 9 | `aria-label` on each `<nav>` | OK | "Chính" / "Di động" / "Đường dẫn" applied to header desktop+mobile, breadcrumbs on dat-hang/sach/sach[slug]. |
| 10 | `text-white/40` → `text-white/70` | OK | `cta-section:60` bumped. |
| 11 | Cormorant `[400,700]` + Dancing `[400]` + `display:optional` | OK | `layout.tsx:18-27` matches spec exactly. Inter intentionally left as-is (no weight restriction in spec). |
| 12 | OOS `<button disabled>` instead of `<Link aria-disabled>` | OK + concern | Replaced on `sach/[slug]:186-201`. **See Q3 — `.btn` styling regression.** Note: `book-card.tsx:31,121` coming-soon `<Link href="#">` was NOT touched (audit listed it as same anti-pattern but you scoped to OOS only — acceptable per QW-12 wording). |

**Build/Type check:** `npm run build` passes clean, `tsc --noEmit` clean. No regressions in compiled output.

---

## 2. Hero 3D Collapse (Q2)

**File:** `/Users/pu/Documents/Playground/sachcuahuy/src/components/home/hero-section.tsx:144-181`

The parent flex container at line 144 still has `perspective-1000` (defines viewing distance), but the inner `<Link>` at line 148 lost both `transform-style-3d` and the inline `transformStyle: preserve-3d`.

**Effect:** Without `preserve-3d` on the `<Link>`, its child elements (spine at line 152, back panel at line 159, cover at line 167, deep-back at line 180) flatten into the `<Link>`'s 2D plane. The `translate-z-[-12px]`/`rotate-y-[-90deg]` arbitrary-value classes on those children become **no-ops** because there's no 3D context to interpret Z translation in.

**Visual outcome (predicted, not measured):**
- Spine panel (line 152): renders as a thin vertical bar to the left of the cover at full opacity, NOT angled away. Will look like an unintended decorative stripe.
- Back panel (line 159): renders as a thin vertical bar to the right of the cover with the gradient stripes, also not angled.
- Deep-back panel (line 180): `inset-0` + `translate-z-[-12px]` → now sits exactly on top of the cover at line 167 (z-order ambiguous). Could either be hidden behind cover (good) or peek through (bad) depending on DOM order — line 180 comes AFTER cover so it'll likely paint ON TOP, hiding the cover. **This is the highest-risk visual regression.**
- Hover `rotate-y-[-10deg] rotate-x-[5deg]` on the `<Link>`: still works as a 2D pseudo-rotation (CSS rotateY without perspective looks like horizontal squash, not 3D flip).

**Recommendation (pick one):**

A. **Hide the spine + back + deep-back panels with `hidden` class** — the audit's LCP win is real and worth keeping. The spine illusion is a flourish that can return in Phase 1 magical overhaul with a cleaner implementation. Smallest diff, lowest risk. Do this now.

B. **Move 3D context to a non-LCP-blocking sibling** — wrap only the spine/back panels in a separate `<div>` with `transform-style-3d perspective-1000`, leave the cover image's parent flat. Preserves illusion, may not regress LCP because the cover `<img>` is no longer inside the 3D stacking context. Riskier — needs Lighthouse re-test.

C. **Accept flattened spine** — let users see the visual artifact until Phase 1. NOT recommended; the deep-back panel painting over the cover is a regression that's worse than "subtly broken 3D".

**My take:** Go with A. Five-minute fix, ships the LCP win cleanly, defers the illusion to magical overhaul (which will replace the hero entirely anyway per fix-plan Phase 1).

---

## 3. OOS Button Styling (Q3)

**File:** `/Users/pu/Documents/Playground/sachcuahuy/src/app/sach/[slug]/page.tsx:186-193`

`.btn` (`globals.css:60-62`) has NO `:disabled` selector. `.btn-outline` (line 72-74) has `hover:bg-primary hover:text-white` — these will fire on a disabled `<button>` because Tailwind's `hover:` does not auto-respect `:disabled`.

**Current state evaluation:**
- `opacity-50` ✓ visually distinct from enabled
- `cursor-not-allowed` ✓ correct cursor
- BUT on hover: button background flips to navy + text to white anyway. Looks "interactive" despite being disabled.
- `disabled` attribute ✓ keyboard and click both blocked correctly (browser native)

**Recommendation:** Add `disabled:pointer-events-none` (best) OR `disabled:hover:bg-transparent disabled:hover:text-primary` to the inline className. Or, for kit-wide cleanliness, add `:disabled` rule in `globals.css`:

```css
.btn:disabled {
  @apply opacity-50 cursor-not-allowed pointer-events-none;
}
```

Latter avoids per-instance className noise and benefits the (also-disabled) submit-button states elsewhere. Minor — `disabled:pointer-events-none` on the one OOS button is sufficient for QW scope.

---

## 4. `htmlToParagraphs` Regex Approach (Q4)

**File:** `/Users/pu/Documents/Playground/sachcuahuy/src/lib/utils.ts:27-43`

**Entity coverage check** (Vietnamese Directus rich-text emits):
- ✓ `&nbsp;` `&amp;` `&lt;` `&gt;` `&quot;` `&#39;` covered.
- ✗ Missing common entities Directus + TinyMCE may produce: `&apos;`, `&hellip;` (…), `&mdash;` (—), `&ndash;` (–), `&ldquo;` (") `&rdquo;` ("), `&lsquo;` (') `&rsquo;` ('). **`&rsquo;` is high-risk** for Vietnamese content with apostrophes. `&hellip;` is also common in tản văn.
- ✗ Numeric entities other than `&#39;`: `&#8217;` (rsquo), `&#8230;` (hellip), `&#8211;` (ndash), `&#8212;` (mdash) and the hex form `&#xNNNN;` — all unhandled.

**Recommendation:** Either (a) add the curly-quote/dash entities explicitly, or (b) use a generic numeric-entity decoder:

```ts
.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
```

Plus the named ones: `&apos; &hellip; &mdash; &ndash; &ldquo; &rdquo; &lsquo; &rsquo;`.

**Safer alternative without DOMPurify dep:** Server-side, use `DOMParser` (not avail in Node SSR) — but you can use Node's built-in entity decoder via the `he` package (~3KB) or, since this runs on RSC server, just import `entities` (smaller, ~5KB). Both are pure JS, no DOM.

For QW scope: add the 8 missing entities + numeric handler. Don't add a dep. Inline regex is acceptable until Phase 2 introduces a proper sanitizer.

**Other concerns with current implementation:**
- Replaces `</p>` with `\n\n` but does NOT strip opening `<p>` first → after the `replace(/<[^>]+>/g, "")` strip, opening tags ARE removed — OK, no double newlines.
- `<br>` → `\n` — fine, but consecutive `<br><br>` becomes `\n\n` which IS interpreted as paragraph break. Probably intended.
- Does not handle `<li>` — list items will all flow together as one paragraph after strip. Low priority unless Directus content uses lists.
- No script/style guard — if `<script>...</script>` ever lands in `book.description`, the inner JS text leaks. Directus rich-text editor doesn't allow script tags by default, but worth noting if the field accepts arbitrary HTML.

---

## 5. Avatar `<img>` + ESLint Disable (Q5)

**File:** `/Users/pu/Documents/Playground/sachcuahuy/src/components/home/hero-section.tsx:127-134`

Correct call. Next.js `<Image>` requires `dangerouslyAllowSVG: true` in `next.config.ts` to serve SVGs through the `/_next/image` proxy — and even then, SVG support carries XSS risk if the SVG source isn't trusted (your locally-saved Dicebear SVGs are static, but the config flag applies to ALL SVGs site-wide). Sticking with plain `<img>` + ESLint disable is the right tradeoff:
- Files are local (`/avatars/avatar-N.svg`) → no cross-origin penalty
- 36×36 fixed size, `loading="lazy"` ✓
- `alt=""` + parent `aria-hidden="true"` per audit's recommendation ✓

**Minor:** `width={36}` `height={36}` while wrapper is `w-10 h-10` (40×40). Image will render at 36px inside a 40px circle — asymmetric padding. Audit's recommendation said `width={36} height={36}` so spec-compliant, but visual layout-wise the wrapper container fills the gap with `bg-gray-200` showing through. Tolerable.

---

## 6. Footer Grid Collapse (Q6)

**File:** `/Users/pu/Documents/Playground/sachcuahuy/src/components/layout/footer.tsx:23,112`

Grid is `grid-cols-1 md:grid-cols-4`. Brand column is `md:col-span-1` (line 25). Quick Links + Contact are 1 column each. Social is conditionally rendered: when ALL three socials are absent, only 3 columns render — CSS Grid will leave the 4th column slot as empty space (the implicit grid distributes the 3 children across 4 column tracks, starting at column 1, leaving column 4 empty).

**Visual outcome:** Brand | Liên Kết | Liên Hệ | _empty_. The right side has a gap. Not broken, just asymmetric — the 3 columns hug the left, no centering. Whether this matters depends on container width; on the `container-custom max-w-6xl` it'll be a noticeable empty quarter on desktop.

**Options:**
- **Accept** — it's not a hard regression, and the social URLs will likely be filled in soon. Empty grid track is honest about absent content.
- **Conditional grid columns:** `md:grid-cols-3` when no socials, `md:grid-cols-4` when present. Cleanest visual; small className conditional.
- **Center the 3 columns:** add `justify-center` or move brand to span-2 when no socials.
- **Keep placeholder column** as you mentioned — but that re-introduces the "Sẽ cập nhật sau." problem the QW was meant to fix.

**Recommendation:** Conditional grid `md:grid-cols-3 / md:grid-cols-4`. One-liner, preserves alignment when socials get added later.

---

## 7. Other Findings

### Aria-hidden audit — all icons inspected are decorative
No false positives. Every `aria-hidden="true"` I traced sits on a Lucide/SVG paired with adjacent visible text label OR is a purely decorative element (Sparkles, Feather, ChevronRight, ArrowLeft/Right). The `<X>` close icon and `<Menu>` burger icon in `header.tsx:95,98` are correctly `aria-hidden` because the parent `<button>` carries `aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}`. ✓

### Nav landmark labels
All 3 navs disambiguated. One missed page: I don't see the breadcrumb on the `xac-nhan/[token]` page at `/Users/pu/Documents/Playground/sachcuahuy/src/app/xac-nhan/[token]/page.tsx` — there is no breadcrumb on this page (intentional — terminal confirmation page). No regression.

### Social SVG `aria-hidden` on parent vs child
Footer social `<a aria-label="Facebook">` wraps `<svg aria-hidden="true">`. Correct: link gets the accessible name, SVG doesn't double-announce. ✓

### `/podcast` page text-accent on `<Mic>` icon (line 22) NOT changed
The audit listed coming-soon-hero:29,42 as the failing-contrast spots. Line 22 has `text-accent` on `<Mic>` SVG inside `bg-accent/10` ring — the AUDIT didn't flag it because icons (UI components) only need 3:1 not 4.5:1, and at 2.4:1 it's still failing (UI element minimum). Out of QW scope, but worth tracking for Phase 3 (Session D). Not a regression you introduced.

### `/gioi-thieu` `dangerouslySetInnerHTML={{__html: bioHtml}}` (line 92)
Untouched by your changes. Pre-existing XSS risk if Directus admin is compromised. Audit didn't flag. Not yours to fix in this sprint, but flagging for awareness — Phase 4 SEO/Perf gate or Session F should consider sanitizing.

### Removed `transform-style-3d` className but utility still defined in `globals.css:113-115`
Dead utility class now. Tailwind PurgeCSS will strip it from production CSS since no template references it after your change. No action needed. Good.

### `next.config.ts` Dicebear pattern removed (Q5 follow-on)
Clean. `images.remotePatterns` now only allows the Directus host + `img.vietqr.io` — tight whitelist. ✓

### Cubes.png is 633 bytes (audit said 1,150B)
Probably a recompression difference — audit number was Lighthouse-reported transfer size with HTTP overhead. File-size discrepancy is fine. Both PNGs verified valid via `file` command.

### `<a href="#main-content">` skip link
Works, but on pages where `#main-content` is in a nested layout (it isn't here — `<main>` is in root layout, all pages compose under it), the anchor jump bypasses focus management. Browser will move focus only if user activates with Enter (not Tab-then-Enter on URL bar). Standard skip-link behaviour. ✓

---

## Status Summary

**Status:** DONE_WITH_CONCERNS

**Summary:** All 12 QW items implemented per spec. Build clean, types clean. Three concerns require follow-up before merge: (1) hero 3D children flatten/overlap on Q4 fix — recommend hiding spine + back + deep-back panels until Phase 1; (2) OOS disabled `<button>` still triggers `hover:bg-primary` — add `disabled:pointer-events-none` or `:disabled` rule in `.btn`; (3) `htmlToParagraphs` missing 8 common entities (`&rsquo;`, `&hellip;`, etc.) Vietnamese Directus content will hit. Footer grid collapse (Q6) is cosmetic — recommend conditional `md:grid-cols-3/4`.

**Concerns/Blockers:**
- **Blocking on hero visual:** the deep-back `<div className="absolute inset-0 ...translate-z-[-12px]">` at `hero-section.tsx:180` will likely paint ON TOP of the cover image (line 167) once 3D context is gone, because it's later in DOM order with full inset-0. This needs visual verification (load `/` in browser) before declaring Q4 ship-ready. Predicted but not measured.
- **Non-blocking but high-priority:** OOS button hover regression — 2-line fix.
- **Non-blocking:** `htmlToParagraphs` entity gaps will cause garbled apostrophes/ellipses in book descriptions — fix before any new Directus content lands.

## Unresolved Questions

1. Should the hero spine/back/deep-back panels be hidden (`hidden` class) immediately, or kept visible with the visual regression until Phase 1 magical overhaul replaces the hero entirely?
2. For the `.btn:disabled` rule — fix at component level (one-off) or globals.css (kit-wide)? Globals is DRYer if you anticipate more disabled buttons in checkout flow.
3. Footer grid: conditional column count, or accept the asymmetry until socials are added? (Probably weeks not months given email/phone are placeholder too.)
4. `htmlToParagraphs` — extend regex now or accept the gap until a HTML sanitizer dep is introduced (Phase 2 likely)? `&rsquo;` and `&hellip;` are common enough in Vietnamese tản văn that I'd argue extend now.

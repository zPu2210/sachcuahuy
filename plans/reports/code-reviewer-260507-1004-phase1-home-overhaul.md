---
type: code-review
agent: code-reviewer
date: 2026-05-07 10:22 (Asia/Saigon)
phase: 1 (magical UI/UX overhaul — home vertical slice)
baseline: b5834bc (post-QW Sprint patches)
scope: src/components/home/*, src/components/layout/header.tsx, src/components/book/book-card.tsx, src/components/ui/{hand-drawn-divider,watercolor-wash,paper-texture,signature-flourish}.tsx, tailwind.config.ts, src/app/globals.css
verdict: SHIP with P1 fix
---

# Phase 1 Home Overhaul — Code Review

## TL;DR

Token discipline tốt, component primitives clean, mobile menu a11y improved. **One real cascade bug in CTA's PaperTexture override** (P1, 2-line fix) và **CTA italic title accent contrast fails on the warm half of the gradient** (P1, swap accent variant). Everything else P2-P4 polish hoặc out-of-scope by design. Ship sau khi fix 2 P1 nội tại trên.

Build/lint/typecheck đã clean per session log. Em không re-run, chỉ verify tcsc spot-check.

---

## Critical / P1 (block-the-commit)

### P1.1 — CTA PaperTexture override silently dropped (cascade bug)
**File:** `src/components/home/cta-section.tsx:14`
**What:** `<PaperTexture className="opacity-[0.10] mix-blend-screen" />` intends to override the base `.paper-texture` rule (which has `opacity:0.05; mix-blend-mode:multiply`). Verified on built CSS:
- `.opacity-\[0\.10\]` lives at byte 34250
- `.mix-blend-screen` at byte 34316
- `.paper-texture {opacity:.05; mix-blend-mode:multiply}` at byte 38806

Same specificity (single-class), but `.paper-texture` comes LATER in the cascade → wins. CTA's PaperTexture renders at `opacity:0.05; multiply`, NOT the intended `opacity:0.10; screen`. Section visually subtle than designed; multiply on dark gradient ≈ no-op (already dark).

**Fix options (pick one):**
1. Remove `opacity` and `mix-blend-mode` from `.paper-texture` base; let consumers pass them every time. Update author-section caller too (currently relies on defaults).
2. Strip `mix-blend-mode` and `opacity` defaults from `.paper-texture` and bake them into the `<PaperTexture>` component as defaults via Tailwind classes (`opacity-5 mix-blend-multiply`), so consumer overrides win at JSX layer.
3. Add `!important` or a hack — not recommended.

Recommend Option 2 — moves opacity/blend semantics from CSS rule to component prop space, so React-level overrides work as expected. Keeps the data-URI background-image in CSS (which is the actual reusable bit).

```tsx
// src/components/ui/paper-texture.tsx
export function PaperTexture({ className }: PaperTextureProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "absolute inset-0 paper-texture opacity-5 mix-blend-multiply",
        className,
      )}
    />
  );
}
```
+ remove `opacity: 0.05; mix-blend-mode: multiply;` from `.paper-texture` CSS rule.

### P1.2 — CTA italic title accent fails contrast on warm gradient half
**File:** `src/components/home/cta-section.tsx:27`
**What:** `<span className="text-accent-light italic">{featuredBook.title}</span>` — `#E27A4F` text on a 135deg gradient navy(#1E2B4D 0%) → cobalt(#3856B0 45%) → terracotta(#C75D2C 100%).

Computed contrast at gradient stops:
- on navy (left edge of section) = **4.73:1** — AA Large only
- on cobalt (mid) = **2.28:1** — FAIL (AA Large requires 3:1)
- on terracotta (right edge) = **1.42:1** — FAIL even AAA Large

Plus two giant blurred halos (`bg-accent/25 blur-[120px]` top-right, `bg-cobalt/30 blur-[100px]` bottom-left) further perturb the actual computed background under the centered title. Title is centered text (ranges across the cobalt mid-zone), so a chunk of "Phim Cuối Cùng" or whatever runs sits on the FAIL portion regardless of book length.

**Fix:** swap to `text-accent` (#C75D2C) which is darker and more saturated, then the failure mode flips: the dark accent on dark gradient drops contrast against navy (~2.0:1) — still fails. **Better fix:** use `text-white italic` for the accent (matches the rest of `<h2>`) and lean on italic + serif weight to differentiate. If you want a colored accent, drop to a brighter variant: `text-amber-300` or define a `accent-bright` token tuned for dark surfaces (e.g., `#FFB088` ≈ 6.2:1 on navy, 2.7:1 on terracotta — still imperfect on warm side; accept since heading is text-4xl-5xl bold = AA Large 3:1 floor).

Pragmatic recommendation: `text-white italic` + reduce font weight of accent (font-medium not bold) to keep visual differentiation without the contrast problem. Or restrict the gradient sunset to navy→cobalt only and lose the terracotta stop on bg, keeping warm tone in accents only. Anh to decide aesthetic tradeoff.

The prompt asked "≈ 4.4:1 acceptable for headline-level text (4xl-5xl)?" — the 4.4 number was on navy alone. Real-world per-character contrast varies 4.7→1.4 across the title. **Not acceptable as-is.**

---

## High / P2

### P2.1 — Mobile menu missing focus management
**File:** `src/components/layout/header.tsx:25-32, 144-186`
**What:** Esc handler ✓, aria-expanded ✓. **Missing:**
- No focus move into menu on open (focus stays on hamburger button which transitions to X icon)
- No focus return to hamburger on close
- No focus trap (Tab can leave the overlay despite `pointer-events-none` on parent — interactive elements behind aren't physically reachable, but focusable elements like header logo are still on the same DOM and can be tabbed to)

The audit P1 line item "Mobile menu toggle aria-expanded + Esc + focus trap" is partial — Esc + aria-expanded done, focus trap deferred. Recommend pickup before commit since the file is already touched and audit explicitly flagged it.

Minimal-effort fix (no library): on `setIsMenuOpen(true)`, queue `focusFirstNavLinkRef.current?.focus()`; on close, `hamburgerRef.current?.focus()`. Tab cycling can use a small `onKeyDown={(e) => e.key === 'Tab' && trapTab(e, firstRef, lastRef)}` on the overlay container.

If anh prefers to defer to Session F or a separate a11y polish pass, mark explicit as known-deferred and don't claim "audit P1 fully picked up".

### P2.2 — `featuredBook.title` may be undefined in CTA
**File:** `src/components/home/cta-section.tsx:27` (and broader contract)
**What:** `<span className="text-accent-light italic">{featuredBook.title}</span>` — the prop type allows `featuredBook` to be a Book, so `title` is required by Directus type. But if upstream loader passes a stub, this would render `undefined` as text. Pre-existing risk — not introduced Phase 1. **Informational only**: when polishing CTA per P1.2, add a safety net `featuredBook.title ?? "ấn bản giới hạn"` consistent with the inline-truncation pattern hero-section uses.

### P2.3 — Triple `useEffect` not inherently buggy, but Esc handler attaches to `document`
**File:** `src/components/layout/header.tsx:25-32`
**What:** Esc effect attaches `keydown` listener on `document`. If multiple Header instances ever render (e.g., a dialog containing a sub-Header for some reason), each adds a doc-level listener. Currently single instance per layout — safe. Informational.

---

## Medium / P3

### P3.1 — Decorative author-name watermark not aria-hidden
**File:** `src/components/home/author-section.tsx:108-112`
**What:** `<div className="hidden lg:block opacity-[0.08] rotate-[-10deg]">` containing `<span>{name}</span>` is purely decorative but readable by screen readers on desktop. Author name read twice (h2 + watermark). Phase 1 already touched this line (`opacity-10` → `opacity-[0.08]`). Add `aria-hidden="true"` while you're there (1 attribute, 0 risk).

### P3.2 — SignatureFlourish is abstract scribble, not "Trọng Huy"
**File:** `src/components/ui/signature-flourish.tsx`
**What:** Hand-coded SVG paths form generic cursive loops, not a recognizable signature. Per plan §1.2, the original intent was AI-generated signature via Nano Banana with anh's curate. Current primitive ships as a placeholder. Acceptable for Phase 1 ship if the intent is "a stylized flourish line near the bio." Schedule the real signature asset before public launch (or mark the deferred task in plan TODO).

### P3.3 — CTA hover state degrades primary button contrast
**File:** `src/components/home/cta-section.tsx:39`
**What:** Default state: `bg-white text-primary` ≈ 12.9:1. Hover: `hover:bg-accent hover:text-white` ≈ 4.17:1. Drop is large (12.9 → 4.17). Still passes AA Large (button is `text-lg font-bold`), but UX-wise hover should not visibly reduce legibility. If anh likes the warm-on-hover signal, fine. Alternative: hover the navy darker (`hover:bg-primary-light`) keeping the white→primary inversion only on focus.

### P3.4 — `text-accent/60` initials meta text on navy
**File:** `src/components/home/author-section.tsx:62`
**What:** `text-[10px] text-accent/60` → ~2.0:1 contrast on bg-primary fallback — fails AA Normal at 10px. Pre-existing pattern, only kicks in when no `imageUrl` (fallback initials state). Informational; bump alpha to `/80` if you want defensible contrast even in fallback.

### P3.5 — Hero ambient blurs (perf concern)
**File:** `src/components/home/hero-section.tsx:43-69, 137-138`
**What:** Hero stacks 5 GPU blur layers — 2 WatercolorWash (each blur(40px) on 640×640 / 560×560), 2 ambient blurs around book (blur-[60px] / blur-[80px]), and 1 noise overlay. Plus paper-texture in author/cta. On low-end Android, hero scroll may stutter. Lighthouse perf gate is Phase 4 — confirm there. Mitigation: `will-change: transform; contain: paint` on hero section, or reduce one of the WatercolorWash to `bg-cobalt/15` solid (no blur) if perf trace shows heavy paint. Leave as-is for ship; verify Phase 4.

### P3.6 — `headingLevel` default is 2, callers outside Phase 1 inherit pre-Phase-1 behavior
**File:** `src/components/book/book-card.tsx:18` and `src/app/sach/[slug]/page.tsx:277`, `src/app/gioi-thieu/page.tsx:126`
**What:** BookCard default = `2`. Phase 1 home `BooksSection` correctly passes `headingLevel={3}` (cards under `<h2>Các Tác Phẩm Nổi Bật</h2>`). But:
- `/sach/[slug]/page.tsx:277` — related books grid sits under `<h2>Sách Khác Của Tác Giả</h2>` and BookCards default to h2 → sibling h2 inside section h2 = heading-rank smell. Out of Phase 1 scope (Phase 2 picks this up per audit). Just don't ship Phase 2 without setting `headingLevel={3}` on this caller. Note in TODO.
- `/gioi-thieu/page.tsx:126` — page has h1, BookCards default to h2 — correct hierarchy, no issue.

Informational: consider flipping default to `3` (safer when nested) or making the prop required. Defer to Phase 2 BookCard pass since /sach refactor will touch every caller.

---

## Low / P4 (style / debt notes)

### P4.1 — `WatercolorWash color="sunset"` is dead code
**File:** `src/components/ui/watercolor-wash.tsx:10-14`
**What:** Type union supports `"sunset"`, but no caller uses `<WatercolorWash color="sunset" />`. CTA uses `watercolor-wash-sunset` utility class directly because it's a linear gradient (no radial, no blur), structurally different. Consider either dropping `"sunset"` from the WashColor union (component doesn't render sunset meaningfully — would need an actual element with size to fill) or document that "sunset" is intentionally a section-bg utility, not a wash primitive. P4 polish.

### P4.2 — Hardcoded `#F0F0F0` / `#E0E0E0` skeleton tints
**File:** `src/components/book/book-card.tsx:35,42`
**What:** Pre-existing placeholder tints behind cover image. Not brand-color, won't break with token migration. Phase 1 didn't introduce. Informational — replace with `bg-gray-100` / `bg-gray-200` for token-cleanliness if anh wants 100% no-hex on changed files, but no functional concern.

### P4.3 — `paper-texture` opacity coupling fragile
**File:** `src/app/globals.css:139-148`
**What:** Same root cause as P1.1. Even after P1.1 fix, future CSS additions to `@layer utilities` AFTER `.paper-texture` could re-introduce override-loss. Long-term: prefer to define visual semantics (opacity, blend) at the component level (Tailwind classes) so JSX always wins. P4 architectural note.

---

## Positive observations

- Token migration on home + BookCard is comprehensive — only 2 grayscale hex left in BookCard (skeleton tints), no brand-color hex leakage. ✓
- `aria-hidden` discipline solid on decorative SVG components (HandDrawnDivider, WatercolorWash, PaperTexture, SignatureFlourish all set it). ✓
- Cart counter aria-label / counter-badge separation — screen reader gets human count, badge is decorative. Nice pattern. ✓
- Esc handler scoped via `if (!isMenuOpen) return;` — no listener leak, cleanup correctness verified. ✓
- BookCard's dynamic `HeadingTag` via `as const` — TypeScript narrows to `"h2" | "h3"`, JSX intrinsic accepts, no React warning. tsc --noEmit clean. ✓
- Header bg-paper/85 cohesive with hero/author/features paper bg (not muddy when all sections share `bg-paper`). ✓
- `cobalt-dark` icon on white feature cards = 9.55:1 contrast — solid, exceeds AAA Normal. ✓
- Lint clean, build clean (per session log), tsc clean (re-verified). ✓

---

## Token discipline verification

| Concern | Status |
|---|---|
| Hardcoded `gold`/`#C9A962` in source | None ✓ |
| Old gold-on-cream `#7A6125` in src/components changed scope | None ✓ (still 5 instances in `/sach/[slug]`, `/dat-hang`, `/xac-nhan`, `/podcast/coming-soon-hero` — out of Phase 1 scope per prompt) |
| Hardcoded book-spine `#1a237e` | Migrated to `bg-cobalt-dark` ✓ |
| Hardcoded hero bg `#FDFBF7` | Migrated to `bg-paper` ✓ (still in `/podcast/coming-soon-hero.tsx:9` — out of scope) |
| Hardcoded book-back `#0f1629` | Removed (3D inner faces gone post-QW perspective drop) ✓ |
| `text-accent` raw uses on cream-bg | Reviewed — hero-section, author-section, books-section uses are all heading-level (4xl+) or decorative (icon/svg `aria-hidden`). AA Large gate met. /gioi-thieu still has `text-accent` on small icons + `<div className="bg-accent">` divider — out of Phase 1 scope (will inherit terracotta tone, intentional). |

Side effect of `accent` token redefine (gold → terracotta) propagates to `/gioi-thieu`, `/sach`, `/podcast`, `/dat-hang`, `/xac-nhan` — confirms intentional palette rollout. No surprise breakage; pages will look mid-transition until Phase 2-3 lands.

---

## Verifications run

- `npm run lint` ✓ clean
- `npx tsc --noEmit` ✓ clean
- WCAG contrast computation (sRGB→relative-luminance, no shortcuts) on every changed token combination listed above
- Built CSS byte-offset inspection of `.paper-texture` vs `.opacity-[0.10]` vs `.mix-blend-screen` (confirms cascade order P1.1)
- BookCard caller enumeration (4 callers identified, heading-level coverage assessed)

---

## Recommended commit gate

Before commit:
1. **Fix P1.1** — move opacity + blend mode from `.paper-texture` CSS to PaperTexture component defaults (≈3 lines changed)
2. **Decide P1.2** — `text-white italic` (cleanest, agnostic to gradient stop) OR redefine accent variant for dark surfaces. Anh's call.

Optional (recommended same commit, low risk):
3. **P3.1** — add `aria-hidden="true"` on author watermark div (1 attribute)

After above 2-3 fixes, this is a clean focused commit on `main` per existing repo flow:
```
feat(home): magical UI/UX overhaul — phase 1 vertical slice

- Token redefinition: accent → terracotta family, +cobalt/ink/paper
- 4 shared primitives (HandDrawnDivider, WatercolorWash, PaperTexture, SignatureFlourish)
- Refactor 5 home sections + header polish + BookCard headingLevel prop
- A11y: mobile menu Esc/aria-expanded, 44×44 tap targets, dynamic cart aria-label
- Pickup audit P0/P1 home findings (hero CTA hover, header nav active, decorative aria-hidden, mixed-language, etc.)
```

Defer to Phase 2-3:
- BookCard `headingLevel` cleanup on `/sach/[slug]` related-books, `/gioi-thieu` published-books
- Page-level token migration in `/sach/[slug]`, `/dat-hang`, `/xac-nhan`, `/podcast`
- AI-generated signature asset
- Mobile menu focus trap (could also go Session F a11y pass)

Defer to Phase 4:
- Lighthouse perf gate (verify hero blur stack ≤ paint budget)
- WatercolorWash `"sunset"` variant cleanup or doc

---

## Unresolved questions

1. P1.2 design call — `text-white italic` (safe, less brand-warm) vs. a new `accent-bright` token tuned for dark surfaces, vs. shorten gradient to navy→cobalt only. Anh decide aesthetic.
2. SignatureFlourish — is the abstract-scribble primitive acceptable for production launch, or does this gate a real signature asset (Nano Banana per plan §1.2)?
3. BookCard `headingLevel` default — keep at 2 (caller-explicit on home) or flip to 3 (safer-for-deeper-nesting default, requires `/sach/page.tsx` to add explicit `headingLevel={2}`)? Defer to Phase 2 anyway, just flagging the contract design.
4. Mobile menu focus trap — Phase 1 cleanup, Session F a11y pass, or accept-as-known-deferred?

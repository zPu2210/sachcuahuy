# Design System — sachcuahuy.com

> Code-derived. Source of truth: [`tailwind.config.ts`](../tailwind.config.ts) + [`src/app/globals.css`](../src/app/globals.css).
> Machine-readable mirror: [`assets/design-tokens.json`](../assets/design-tokens.json) (W3C Design Tokens draft format).
> Last extracted: 2026-05-11. Re-extract by re-reading the two source files; do not hand-edit tokens here.

## Contents

- [Tokens](#tokens)
  - [Color](#color)
  - [Typography](#typography)
  - [Shadow](#shadow)
  - [Radius](#radius)
  - [Motion](#motion)
  - [Spacing](#spacing)
  - [Scrollbar](#scrollbar)
- [Vietnamese diacritic coverage](#vietnamese-diacritic-coverage)
- [Patterns](#patterns)
  - [Watercolor wash](#pattern-watercolor-wash)
  - [Paper texture](#pattern-paper-texture)
  - [Hand-drawn divider](#pattern-hand-drawn-divider)
  - [Signature flourish](#pattern-signature-flourish)
- [Component inventory](#component-inventory) — see [`component-inventory.md`](./component-inventory.md)

---

## Tokens

### Color

| Swatch | Token | Hex | Notes |
|---|---|---|---|
| ![#1E2B4D](https://placehold.co/24x24/1E2B4D/1E2B4D.png) | `primary.DEFAULT` / `navy` | `#1E2B4D` | Main brand. Buttons, headings, focus. |
| ![#2D3F66](https://placehold.co/24x24/2D3F66/2D3F66.png) | `primary.light` | `#2D3F66` | Primary hover. |
| ![#141D36](https://placehold.co/24x24/141D36/141D36.png) | `primary.dark` | `#141D36` | Deepest navy; rare. |
| ![#F8F6F3](https://placehold.co/24x24/F8F6F3/F8F6F3.png) | `secondary.DEFAULT` / `cream` | `#F8F6F3` | Page background. |
| ![#EDE9E3](https://placehold.co/24x24/EDE9E3/EDE9E3.png) | `secondary.dark` | `#EDE9E3` | Subtle elevation on cream. |
| ![#C75D2C](https://placehold.co/24x24/C75D2C/C75D2C.png) | `accent.DEFAULT` | `#C75D2C` | Terracotta. AA Large on cream. Headings, badges, decoratives. |
| ![#E27A4F](https://placehold.co/24x24/E27A4F/E27A4F.png) | `accent.light` | `#E27A4F` | Terracotta hover. |
| ![#A04420](https://placehold.co/24x24/A04420/A04420.png) | `accent.dark` | `#A04420` | AA Normal on cream. Inline body links. Scrollbar thumb. |
| ![#3856B0](https://placehold.co/24x24/3856B0/3856B0.png) | `cobalt.DEFAULT` | `#3856B0` | Watercolor wash + sunset gradient mid-stop. |
| ![#5C7AC9](https://placehold.co/24x24/5C7AC9/5C7AC9.png) | `cobalt.light` | `#5C7AC9` | |
| ![#27408C](https://placehold.co/24x24/27408C/27408C.png) | `cobalt.dark` | `#27408C` | |
| ![#142849](https://placehold.co/24x24/142849/142849.png) | `ink` | `#142849` | Deeper navy for type where contrast matters. |
| ![#FAF6EC](https://placehold.co/24x24/FAF6EC/FAF6EC.png) | `paper` | `#FAF6EC` | Warm paper; scrollbar track, paper-texture base. |

Aliases:
- `navy` ≡ `primary.DEFAULT`
- `cream` ≡ `secondary.DEFAULT`
- `scrollbar.track` ≡ `paper`
- `scrollbar.thumb` ≡ `accent.dark`
- `scrollbar.thumbHover` ≡ `accent.DEFAULT`

### Typography

Three families, all loaded via `next/font/google` with `subsets: ["latin", "vietnamese"]`.

| Token | CSS variable | Family | Weights | Use |
|---|---|---|---|---|
| `fontFamily.serif` | `--font-cormorant` | Cormorant Garamond | 400, 700 | Headings (h1–h6), display copy |
| `fontFamily.sans` | `--font-inter` | Inter | 400 (default) | Body, UI, buttons |
| `fontFamily.script` | `--font-dancing` | Dancing Script | 400 | Signature flourish, decorative sign-offs |

CSS class shorthand:
- `font-serif` → Cormorant
- `font-sans` → Inter
- `font-script` → Dancing Script

Body baseline (`globals.css` `@layer base`):
- `body { @apply bg-cream text-gray-800 antialiased; }`
- `h1..h6 { @apply font-serif text-primary; }`

### Shadow

| Token | Value | Use |
|---|---|---|
| `shadow.book` | `8px 8px 24px -4px rgb(0 0 0 / 0.2)` | Hero book cover. Asymmetric offset suggests a physical object on a surface. |

Tailwind default shadows (`shadow-sm`, `shadow-lg`, `shadow-xl`) are also used; see [Tailwind docs](https://tailwindcss.com/docs/box-shadow).

### Radius

No custom overrides. Used from Tailwind default scale + one custom (scrollbar):

| Token | Value | Use |
|---|---|---|
| `radius.lg` | `0.5rem` | `.btn`, `.input` |
| `radius.2xl` | `1rem` | `.card` |
| `radius.scrollbar` | `4px` | `::-webkit-scrollbar-thumb` |

Full scale: <https://tailwindcss.com/docs/border-radius>.

### Motion

| Token | Value | Use |
|---|---|---|
| `motion.float.duration` | `4s` | Hero book floating animation |
| `motion.float.keyframes` | `0/100% → translateY(0); 50% → translateY(-12px)` | Defined in `globals.css` `@keyframes float` |
| `motion.btn.duration` | `200ms` ease-out | `.btn transition-all` |
| `motion.card.duration` | `300ms` ease-out | `.card transition-all` |
| `motion.input.duration` | `200ms` | `.input transition-all` |
| `motion.reducedMotion` | `prefers-reduced-motion: reduce` → `0.01ms` | Global override in `globals.css` |

### Spacing

No Tailwind scale overrides. Two semantic utilities:

| Class | Resolves to | Use |
|---|---|---|
| `.section` | `py-8 md:py-16 lg:py-24` (2 / 4 / 6 rem vertical) | Page section padding |
| `.container-custom` | `max-w-6xl mx-auto px-4 md:px-8` (72 rem max, 1 / 2 rem inset) | Content container |

Tailwind default spacing scale: <https://tailwindcss.com/docs/customizing-spacing>.

### Scrollbar

WebKit-only (`globals.css`):

```css
::-webkit-scrollbar       { width: 8px; }
::-webkit-scrollbar-track { background: #faf6ec; }              /* paper */
::-webkit-scrollbar-thumb { background: #a04420; border-radius: 4px; }  /* accent.dark */
::-webkit-scrollbar-thumb:hover { background: #c75d2c; }        /* accent.DEFAULT */
```

---

## Vietnamese diacritic coverage

`scripts/check-vietnamese-glyphs.cjs` verifies all three font imports in `src/app/layout.tsx` declare the `vietnamese` subset. As of 2026-05-11, all three pass:

```
[PASS] All fonts declare `vietnamese` subset in src/app/layout.tsx:
  - Inter: ok
  - Cormorant_Garamond: ok
  - Dancing_Script: ok
```

Run: `node scripts/check-vietnamese-glyphs.cjs`. Visual confirmation pending Phase 4 screenshot capture.

Glyphs required: `ăâđêôơưĂÂĐÊÔƠƯ` + tone variants on `aeiouy` (74 chars total — see script source).

---

## Patterns

Four named visual patterns drive the magical/watercolor aesthetic. Each is a single React component, absolutely positioned, `aria-hidden`, `pointer-events: none` — purely decorative.

### Pattern: Watercolor wash

- **Source:** [`src/components/ui/watercolor-wash.tsx`](../src/components/ui/watercolor-wash.tsx)
- **CSS utilities:** `.watercolor-wash-cobalt`, `.watercolor-wash-terracotta`, `.watercolor-wash-sunset` ([`globals.css`](../src/app/globals.css) lines 161–175)
- **Purpose:** Soft atmospheric color blobs behind hero/section content. `cobalt` + `terracotta` are radial gradients (35% alpha, 40px blur). `sunset` is a 135° linear gradient through three brand colors — used as a full-bleed background.
- **Tokens used:** [`cobalt.DEFAULT`](#color) `#3856B0`, [`accent.DEFAULT`](#color) `#C75D2C`, [`primary.DEFAULT`](#color) `#1E2B4D`
- **Props:** `color: "cobalt" | "terracotta" | "sunset"`, `className?: string`
- **Usage locations:**
  - `src/app/gioi-thieu/page.tsx` — about hero (`cobalt`), CTA band (`sunset`)
  - `src/app/sach/page.tsx` — catalog hero (2× `cobalt` + `terracotta`)
  - `src/app/sach/[slug]/page.tsx` — book detail hero
  - `src/components/home/author-section.tsx` — author intro background (2 washes)
  - `src/components/podcast/coming-soon-hero.tsx` — podcast placeholder
- **Snippet:**
  ```tsx
  <WatercolorWash color="cobalt" className="inset-0 opacity-30" />
  ```

### Pattern: Paper texture

- **Source:** [`src/components/ui/paper-texture.tsx`](../src/components/ui/paper-texture.tsx)
- **CSS utility:** `.paper-texture` ([`globals.css`](../src/app/globals.css) lines 154–158) — inline SVG fractal-noise data URI (zero HTTP request)
- **Purpose:** Subtle grain overlay simulating laid paper. Default opacity `0.05`, `mix-blend-multiply` for warm tinting on cream surfaces.
- **Tokens used:** ink-toned noise (RGB ≈ `0.55 / 0.45 / 0.30`, alpha 0.6 in filter matrix) — visually pairs with [`paper`](#color) `#FAF6EC` and [`cream`](#color) `#F8F6F3`
- **Props:** `className?: string` (override opacity/blend)
- **Usage locations:**
  - `src/app/gioi-thieu/page.tsx` — about hero + middle band
  - `src/app/sach/page.tsx`, `src/app/sach/[slug]/page.tsx` — catalog + detail
  - `src/components/home/author-section.tsx` — author background
  - `src/components/home/cta-section.tsx` — CTA band (lifted to `opacity-[0.10] mix-blend-screen` for dark bg)
  - `src/components/podcast/coming-soon-hero.tsx`
- **Snippet:**
  ```tsx
  <PaperTexture />
  <PaperTexture className="opacity-[0.10] mix-blend-screen" />
  ```

### Pattern: Hand-drawn divider

- **Source:** [`src/components/ui/hand-drawn-divider.tsx`](../src/components/ui/hand-drawn-divider.tsx)
- **Purpose:** Inline SVG ink stroke separating sections. Four variants suggest a hand-sketched feel matching the editorial voice.
- **Tokens used:** [`accent.dark`](#color) `#A04420` via default Tailwind class `text-accent-dark`; consumers override with `text-accent/70`, `text-accent/60`, etc.
- **Props:** `variant?: "wave" | "sparkle" | "leaf" | "dots"` (default `wave`), `width?: number` (default `188`), `className?: string`
- **Variants:**
  - `wave` — quadratic-curve undulation (used between sections at the top of a page)
  - `sparkle` — central star + dots (used in about page hero accents)
  - `leaf` — line + leaflet motif (used as botanical sign-off in about)
  - `dots` — varied-radius circle row (used between hero and books grid)
- **Usage locations:**
  - `src/app/sach/page.tsx` (`wave`), `src/app/sach/[slug]/page.tsx` (`dots`)
  - `src/app/gioi-thieu/page.tsx` (`sparkle`, `leaf`)
  - `src/components/home/books-section.tsx` (`dots`)
  - `src/components/podcast/coming-soon-hero.tsx` (`wave`)
- **Snippet:**
  ```tsx
  <HandDrawnDivider variant="dots" className="text-accent/60" width={140} />
  ```

### Pattern: Signature flourish

- **Source:** [`src/components/ui/signature-flourish.tsx`](../src/components/ui/signature-flourish.tsx)
- **Purpose:** SVG calligraphic sign-off rendered with `text-accent-dark` strokes — pairs with the [`script` typeface](#typography) (Dancing Script) without needing live text. Fixed 200×60 viewBox; scale via `className` width utilities.
- **Tokens used:** [`accent.dark`](#color) `#A04420`
- **Props:** `className?: string`
- **Usage locations:**
  - `src/app/gioi-thieu/page.tsx` — closing sign-off (`w-48 md:w-56`)
  - `src/components/home/author-section.tsx` — author intro (`w-32 ... opacity-70`)
- **Snippet:**
  ```tsx
  <SignatureFlourish className="w-48 md:w-56" />
  ```

**Visual previews:** Each pattern is visible in `docs/screen-snapshots/` (Phase 4). Watercolor wash → `gioi-thieu-desktop.png` hero; paper texture → any cream-bg page; hand-drawn dividers → `sach-catalog-desktop.png` between sections; signature flourish → `gioi-thieu-desktop.png` footer.

---

## Component inventory

Deferred to Phase 3 → will live at [`docs/component-inventory.md`](./component-inventory.md).

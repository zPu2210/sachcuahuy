---
phase: 1
title: "Token audit & extraction"
status: pending
priority: P2
effort: "3h"
dependencies: []
---

# Phase 1: Token Audit & Extraction

## Overview
Audit `tailwind.config.ts` + `src/app/globals.css`, extract all design tokens (color, typography, spacing, radii, shadow, motion), and generate `assets/design-tokens.json` in W3C Design Tokens format. Document tokens section of `docs/design-system.md`.

## Requirements

**Functional:**
- Read source files exhaustively (no symbol skipped)
- Output W3C-formatted JSON (`$value`, `$type`, `$description`)
- Generate human-readable markdown tokens table (color swatches, font samples)
- Confirm Vietnamese glyph coverage for Cormorant + Inter (script check)

**Non-functional:**
- Zero code modifications (read-only)
- Tokens.json must validate against W3C schema (informal — no published canonical schema yet, document deviations)
- Markdown tokens table renders correctly in GitHub flavored markdown

## Architecture

**Source files (read):**
- `tailwind.config.ts` — colors, fontFamily, boxShadow, theme.extend
- `src/app/globals.css` — keyframes, scrollbar colors, base layer (body bg, h1-h6 font), btn variants, prefers-reduced-motion

**Token categories to extract:**

| Category | Sources | Examples from current code |
|---|---|---|
| Color | tailwind colors block | `primary.DEFAULT/light/dark`, `accent.*`, `cobalt.*`, `cream`, `paper`, `navy`, `ink` |
| Typography | tailwind fontFamily + globals h1-h6 | `serif: Cormorant`, `sans: Inter`, `script: Dancing Script` |
| Spacing | implicit Tailwind defaults (note: no extend) | confirm whether to capture defaults or only overrides |
| Radius | tailwind theme + btn `rounded-lg` usage | `lg` for buttons, scrollbar `4px` |
| Shadow | tailwind boxShadow + scrollbar | `book: 8px 8px 24px -4px rgba(0,0,0,0.2)` |
| Motion | globals @keyframes + transition durations | `float 4s ease-in-out infinite`, btn `200ms ease-out`, prefers-reduced-motion override |

**Output structure (W3C):**
```json
{
  "color": {
    "primary": {
      "DEFAULT": { "$value": "#1E2B4D", "$type": "color", "$description": "Navy — main brand" },
      "light": { "$value": "#2D3F66", "$type": "color" },
      "dark": { "$value": "#141D36", "$type": "color" }
    }
  },
  "fontFamily": {
    "serif": { "$value": "var(--font-cormorant), Georgia, serif", "$type": "fontFamily" }
  },
  "shadow": {
    "book": { "$value": "8px 8px 24px -4px rgba(0,0,0,0.2)", "$type": "shadow" }
  }
}
```

## Related Code Files

- **Read:**
  - `tailwind.config.ts`
  - `src/app/globals.css`
  - `src/app/layout.tsx` (font CSS variable wiring — `--font-cormorant`, `--font-inter`, `--font-dancing`)
- **Create:**
  - `assets/design-tokens.json`
  - `docs/design-system.md` (tokens section only this phase)
  - `scripts/check-vietnamese-glyphs.cjs` (Node script using `fontkit` or `opentype.js` to verify Cormorant + Inter cover `ă đ ê ô ơ ư` + diacritics)
- **Modify:** none (read-only phase)

## Implementation Steps

1. **Read sources**: `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx` (font wiring)
2. **Extract color tokens**: enumerate all colors with semantic names, document hex + intended use (from comments in tailwind config)
3. **Extract typography tokens**: capture font families, weights, line-heights from globals h1-h6 + body
4. **Extract motion tokens**: keyframes (`float`), transition durations (`200ms`), prefers-reduced-motion behavior
5. **Extract shadow tokens**: `book` shadow + scrollbar colors
6. **Decide spacing strategy**: document Tailwind default scale OR only overrides (recommend: only overrides + reference Tailwind default URL)
7. **Decide radius strategy**: same — overrides only + document `rounded-lg` (8px) common usage
8. **Write `assets/design-tokens.json`** in W3C format with `$description` annotations
9. **Write tokens section of `docs/design-system.md`** with color swatches (markdown), font samples, shadow examples
10. **Write `scripts/check-vietnamese-glyphs.cjs`** — verify Cormorant TTF/WOFF2 + Inter cover Vietnamese diacritics; output report
11. **Run glyph check**, attach result to `docs/design-system.md` Vietnamese support section
12. **Self-review**: confirm zero code edits outside `docs/`, `assets/`, `scripts/`

## Success Criteria

- [ ] `assets/design-tokens.json` exists with all 6 categories populated
- [ ] All colors from `tailwind.config.ts` present as W3C tokens (12+ entries: primary×3 + accent×3 + cobalt×3 + cream + navy + ink + paper)
- [ ] All 3 font families captured with CSS variable references
- [ ] `book` shadow + scrollbar colors documented
- [ ] `float` animation + transition durations documented
- [ ] `docs/design-system.md` tokens section renders with visible color swatches in markdown preview
- [ ] `scripts/check-vietnamese-glyphs.cjs` exits 0 with all required glyphs found, OR exits 1 with specific gap report
- [ ] No files modified outside `docs/`, `assets/`, `scripts/`

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Tailwind default tokens (spacing, radius) too noisy if all captured | Document only overrides + reference Tailwind default URL |
| Font CSS vars not resolvable at build time (only at runtime in Next.js) | Document as `var(...)` strings; consumers resolve via `next/font` system |
| Glyph check requires font files not in repo (Google Fonts via next/font) | Download Cormorant + Inter WOFF2 to `scripts/font-cache/` for check; gitignore the cache |
| W3C format spec evolving — no canonical schema published | Use latest community-group format; pin format date in `$description` for reproducibility |

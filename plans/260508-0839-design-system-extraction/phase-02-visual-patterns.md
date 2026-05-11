---
phase: 2
title: "Visual patterns documentation"
status: completed
priority: P2
effort: "2h"
dependencies: [1]
---

# Phase 2: Visual Patterns Documentation

## Overview
Document 4 named visual patterns that define the magical/watercolor aesthetic: watercolor wash, paper texture, hand-drawn divider, signature flourish. Each pattern gets purpose, implementation source, usage locations, and code snippet.

## Requirements

**Functional:**
- Document each pattern: visual purpose, technical implementation (component file), token references (from Phase 1), CSS/SVG details, usage locations across pages
- Include reproducible code snippet per pattern (Tailwind classes + props)
- Cross-reference Phase 1 tokens (e.g., "uses `accent.dark` for stroke")

**Non-functional:**
- Patterns section in `docs/design-system.md` (append, do not overwrite Phase 1 tokens section)
- Visual examples: embed PNG previews extracted from screenshots (Phase 4 dependency? No — use static asset captures or component-level screenshots taken now)

## Architecture

**4 patterns to document:**

| Pattern | Source File | Visual Description |
|---|---|---|
| Watercolor wash | `src/components/ui/watercolor-wash.tsx` | Soft color blob backgrounds, hero/section accents |
| Paper texture | `src/components/ui/paper-texture.tsx` | Subtle grain overlay on cream backgrounds |
| Hand-drawn divider | `src/components/ui/hand-drawn-divider.tsx` | SVG ink stroke between sections |
| Signature flourish | `src/components/ui/signature-flourish.tsx` | Calligraphic sign-off (Dancing Script + SVG) |

**Per-pattern documentation template:**

```markdown
### Pattern: {name}

**Source:** `src/components/ui/{file}.tsx`
**Purpose:** {1-line visual purpose}
**Tokens used:** {color/font tokens from Phase 1}
**Props/variants:** {if any}
**Usage locations:**
- `src/app/page.tsx` — between hero and books section
- `src/app/sach/page.tsx` — section dividers
**Snippet:**
```tsx
<HandDrawnDivider variant="wave" color="accent" />
```
**Visual:** ![preview](docs/design-system/patterns/{name}.png)
```

## Related Code Files

- **Read:**
  - `src/components/ui/watercolor-wash.tsx`
  - `src/components/ui/paper-texture.tsx`
  - `src/components/ui/hand-drawn-divider.tsx`
  - `src/components/ui/signature-flourish.tsx`
  - All consumer files (`src/app/**/*.tsx`, `src/components/home/*.tsx`) — grep for imports to find usage locations
- **Create:**
  - `docs/design-system/patterns/watercolor.png` (or skip if Phase 4 covers it)
  - `docs/design-system/patterns/paper.png`
  - `docs/design-system/patterns/hand-drawn-divider.png`
  - `docs/design-system/patterns/signature.png`
- **Modify:**
  - `docs/design-system.md` (append patterns section after Phase 1 tokens section)

## Implementation Steps

1. **Read all 4 pattern source components** + extract: imports, props interface, internal SVG/CSS, Tailwind classes used
2. **Grep for usage**: `grep -r "WatercolorWash" src/`, `grep -r "PaperTexture" src/`, etc. → list consumer files
3. **For each pattern, write entry** in `docs/design-system.md` with template above
4. **Map token references**: identify Phase 1 tokens used (e.g., `accent.dark` for hand-drawn divider stroke) and inline-link
5. **Capture pattern-only screenshots** (component in isolation):
   - Option A: Storybook-less approach — temporary route `src/app/_design-debug/page.tsx` rendering each pattern, screenshot, delete route
   - Option B: Crop pattern from full-page screenshots taken in Phase 4
   - **Decision deferred to phase start**; recommend Option B (less code churn)
6. **Embed snippets**: minimal usage examples showing typical props
7. **Cross-link**: each pattern references back to tokens table in same doc
8. **Self-review**: ensure all 4 patterns covered, no missing usage locations

## Success Criteria

- [ ] All 4 patterns documented in `docs/design-system.md` with consistent template
- [ ] Each pattern entry references ≥1 Phase 1 token
- [ ] Each pattern has ≥1 usage location identified
- [ ] Each pattern has snippet showing minimal use
- [ ] Visual previews embedded (PNG or inline SVG)
- [ ] No code modifications outside `docs/`

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Pattern component has dynamic SVG generation that doesn't render statically | Capture runtime screenshot; document generation parameters |
| Usage locations too many to enumerate | Cap at top 5 per pattern + "...and N more" |
| Pattern visually identical across props (e.g., divider variant=`wave` vs `straight`) | Document all variants with side-by-side previews |
| `_design-debug` route accidentally committed | Use Option B (crop from Phase 4 screenshots), avoid temp route entirely |

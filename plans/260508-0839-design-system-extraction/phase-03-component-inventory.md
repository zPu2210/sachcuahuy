---
phase: 3
title: "Component inventory"
status: pending
priority: P2
effort: "3h"
dependencies: [1]
---

# Phase 3: Component Inventory

## Overview
Catalog all reusable components in `src/components/**` with props, variants, dependencies, and primary usage locations. Output `docs/component-inventory.md` as a navigable reference for future Pencil reproduction (Phase 2 of pipeline) and Claude Design onboarding (Phase 3 of pipeline).

## Requirements

**Functional:**
- List ≥10 components with TypeScript props interfaces extracted verbatim
- Group by domain: layout, home, ui (primitives), book, checkout, podcast, seo
- For each: imports, dependencies on other components, where rendered
- Identify "atomic" vs "composite" classification

**Non-functional:**
- Single markdown file with anchor links per component
- Code snippets minimal — link to source for full impl
- No grading/critique — pure documentation

## Architecture

**Inventory categories:**

| Domain | Folder | Expected components |
|---|---|---|
| Layout | `src/components/layout/` | Header, Footer |
| Home sections | `src/components/home/` | HeroSection, AuthorSection, BooksSection, FeaturesSection, CTASection |
| UI primitives | `src/components/ui/` | FadeIn, HandDrawnDivider, PaperTexture, SignatureFlourish, WatercolorWash |
| Book | `src/components/book/` | (audit during phase) |
| Checkout | `src/components/checkout/` | (audit during phase) |
| Podcast | `src/components/podcast/` | (audit during phase) |
| SEO | `src/components/seo/` | (audit during phase) |

**Per-component entry template:**

```markdown
### {ComponentName}

- **File:** `src/components/{domain}/{file}.tsx`
- **Type:** atomic | composite
- **Props:**
  ```ts
  interface {ComponentName}Props {
    // copied from source
  }
  ```
- **Dependencies (internal):** `<ChildA>`, `<ChildB>`
- **Dependencies (external):** `framer-motion`, `lucide-react/{IconName}`, etc.
- **Used in:**
  - `src/app/page.tsx`
  - `src/components/home/hero-section.tsx`
- **Variants/states:** {if any — e.g., default vs collapsed mobile}
- **Notes:** {anything Pencil reproduction will need to know}
```

## Related Code Files

- **Read (exhaustive):**
  - All `*.tsx` files under `src/components/**`
  - `src/app/**/*.tsx` (for usage location grep)
- **Create:**
  - `docs/component-inventory.md`
- **Modify:** none

## Implementation Steps

1. **Enumerate components**: `find src/components -name "*.tsx" -type f` → full list
2. **For each component**:
   - Extract props interface from TS source (regex or AST — manual read OK for ≤20 components)
   - Identify imports (internal components, external libs)
   - Determine atomic/composite (does it render other components?)
3. **Grep usage**: `grep -rn "<ComponentName" src/app src/components` → list consumer files
4. **Identify variants/states**: read JSX for conditional rendering, prop-driven layouts
5. **Group by domain folder**: write inventory file with section per domain
6. **Add navigation TOC** at top of `component-inventory.md` linking to each component anchor
7. **Cross-link to design-system.md tokens** where component uses specific tokens (e.g., Header uses `primary.DEFAULT` bg)
8. **Self-review**: count components — should be ≥10 (10 already known: Header, Footer, 5 home sections, 5 ui primitives = 12)

## Success Criteria

- [ ] `docs/component-inventory.md` exists with TOC
- [ ] ≥10 components documented (target: ~15-20 once book/checkout/podcast/seo audited)
- [ ] Each entry has: file path, props (verbatim), dependencies, ≥1 usage location
- [ ] Components grouped by domain folder
- [ ] Atomic vs composite classification applied to all
- [ ] Cross-links to `docs/design-system.md` tokens where applicable
- [ ] Zero code modifications

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Component count >> 20 (book/checkout subcomponents) | Cap depth: top-level component + 1 nesting level fully documented; deeper nested noted as "(uses internal sub-components — see source)" |
| Props interface uses Pick/Omit/Generic (hard to flatten) | Copy verbatim, document the source generic; don't try to expand |
| Components without explicit Props interface (untyped) | Document as `Props: untyped` with note to add types in follow-up |
| Internal helpers misclassified as components | Filter: only `.tsx` files exporting a default or named React component |
| Usage location grep misses dynamic imports | Note dynamic-import patterns separately |

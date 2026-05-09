---
title: "Code → Pencil Migration — Prompt Template"
purpose: "Curated prompt patterns for recreating sachcuahuy.com production code as Pencil designs"
sources:
  - https://docs.pencil.dev/design-and-code/design-to-code
  - https://docs.pencil.dev/core-concepts/code-on-canvas
  - https://www.pencil.dev/prompts
last_updated: 2026-05-08
---

# Code → Pencil Migration — Prompt Template

Curated prompt patterns for the **Code → Design** direction in Pencil. Use these in `Cmd/Ctrl + K` AI chat after opening `designs/sachcuahuy.pen` in same workspace as code.

## Prerequisites

- `.pen` file lives in same workspace as `src/` and `tailwind.config.ts` (AI agent must access both)
- Pencil app/CLI running with auth completed (`pencil login`)
- Phase 1 outputs ready: `assets/design-tokens.json`, `docs/component-inventory.md`

## Phase 2A — Variables Import (run first, once)

```text
Create Pencil variables from src/app/globals.css and tailwind.config.ts.
Group by:
- color (primary/secondary/accent/cobalt/cream/paper/navy/ink with light/dark variants)
- font (serif=Cormorant, sans=Inter, script=Dancing Script — preserve var(--font-*) refs)
- shadow (book: 8px 8px 24px -4px rgba(0,0,0,0.2))
- motion (float keyframe 4s ease-in-out, btn transition 200ms ease-out)
Use the W3C Design Tokens structure from assets/design-tokens.json as reference.
```

**Verification:** `get_variables()` should return tokens matching `assets/design-tokens.json`.

## Phase 2B — Component Recreation (one prompt per component)

Pattern:
```text
Recreate the {ComponentName} component from src/components/{path}.tsx as a reusable Pencil component.
Use the Pencil variables imported earlier (don't hardcode colors/fonts).
Preserve: prop variants, internal layout, framer-motion animations as static representations,
lucide-react icons (use Pencil's built-in Lucide library).
Mark as reusable:true and place in the canvas Components section.
```

**Recommended order (atomic → composite):**

1. UI primitives (atomic):
   ```
   Recreate the FadeIn component from src/components/ui/fade-in.tsx
   Recreate the WatercolorWash component from src/components/ui/watercolor-wash.tsx
   Recreate the PaperTexture component from src/components/ui/paper-texture.tsx
   Recreate the HandDrawnDivider component from src/components/ui/hand-drawn-divider.tsx
   Recreate the SignatureFlourish component from src/components/ui/signature-flourish.tsx
   ```

2. Layout (composite):
   ```
   Recreate the Header from src/components/layout/header.tsx as a reusable Pencil component
   Recreate the Footer from src/components/layout/footer.tsx as a reusable Pencil component
   ```

3. Home sections (composite — use UI primitives recreated above):
   ```
   Recreate the HeroSection from src/components/home/hero-section.tsx
   Recreate the AuthorSection from src/components/home/author-section.tsx
   Recreate the BooksSection from src/components/home/books-section.tsx
   Recreate the FeaturesSection from src/components/home/features-section.tsx
   Recreate the CTASection from src/components/home/cta-section.tsx
   ```

4. Domain-specific (audit Phase 3 output, then prompt one per real component found):
   ```
   Recreate the BookCard from src/components/book/book-card.tsx
   Recreate the OrderForm from src/components/checkout/order-form.tsx
   ...
   ```

## Phase 2C — Screen Composition (one frame per route × viewport)

Pattern:
```text
Compose a screen frame for route {/route-path} at {desktop|mobile} viewport ({1440|375}px wide).
Use the Header + Footer reusable components.
Place sections in this order: {list from src/app/{route}/page.tsx}.
Match layout to docs/screen-snapshots/{route-slug}-{viewport}.png as visual reference.
Position the frame {desktop on left, mobile to right of desktop} with 100px gap.
```

**14 frames to build (7 routes × 2 viewports):**

| # | Route | Slug | Desktop prompt | Mobile prompt |
|---|---|---|---|---|
| 1-2 | `/` | home | Compose Home desktop... | Compose Home mobile... |
| 3-4 | `/sach` | sach-catalog | ... | ... |
| 5-6 | `/sach/[slug]` | sach-detail | ... | ... |
| 7-8 | `/gioi-thieu` | gioi-thieu | ... | ... |
| 9-10 | `/podcast` | podcast | ... | ... |
| 11-12 | `/dat-hang` | dat-hang | ... | ... |
| 13-14 | `/xac-nhan` | xac-nhan | ... | ... |

## Phase 2D — Verification & Export

After each frame:
```text
Take a screenshot of the {frame-name} frame and compare to docs/screen-snapshots/{slug}-{viewport}.png.
Report any diffs >2px in: spacing, color, font size, alignment.
```

Then export:
```text
Export frame {frame-name} as PNG to designs/exports/{slug}-{viewport}.png at 2x resolution.
```

## Phase 2E — Sync Maintenance Prompts

For ongoing two-way sync:

```text
# When code changes — sync into Pencil
Reimport {ComponentName} from src/components/{path}.tsx and update the Pencil component.
Highlight changes vs current Pencil version.
```

```text
# When tokens change in code
Sync Pencil variables with assets/design-tokens.json.
Report any tokens that exist in code but not Pencil, or vice versa.
```

```text
# When design changes in Pencil — propagate to code
Update src/components/{path}.tsx to match the {ComponentName} Pencil component.
Generate a unified diff for review before applying.
```

## Tips & Gotchas

- **Always specify framework**: "using Tailwind CSS" — Pencil supports many stacks
- **Reference snapshots in prompts**: include `docs/screen-snapshots/{name}.png` as visual ground truth
- **Avoid generic prompts**: "Recreate the layout" → too vague. Always cite source file + token file
- **Batch related components**: e.g., all UI primitives in one session before moving to composite
- **MCP stability**: Pencil MCP drops every ~15-20 ops; if AI seems stuck, re-run `pencil status`
- **Subagent limitation**: Pencil MCP only works in main Claude Code session — don't delegate to subagents
- **Vietnamese fonts**: verify Cormorant + Inter render `ă đ ê ô ơ ư` in Pencil before screen composition
- **Lucide icons**: Pencil has built-in Lucide library — match codebase's `lucide-react` icon names exactly

## Source References

- [Pencil docs index](../pencil-docs/index.md)
- [Design ↔ Code workflow](../pencil-docs/design-and-code-design-to-code.md)
- [Code on Canvas concept](../pencil-docs/core-concepts-code-on-canvas.md)
- [Variables](../pencil-docs/core-concepts-variables.md)
- [Pencil CLI](../pencil-docs/for-developers-pencil-cli.md)
- [pencil.dev/prompts gallery](index.md) — example prompts from Pencil team

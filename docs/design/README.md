# Design System — sachcuahuy.com

> Code-derived design system. Source of truth: `tailwind.config.ts` + `src/app/globals.css`.
> Machine-readable mirror: [`assets/design-tokens.json`](../../assets/design-tokens.json) (W3C Design Tokens draft).
> Generated: 2026-05-11. Plan: [`plans/260508-0839-design-system-extraction/`](../../plans/260508-0839-design-system-extraction/plan.md).

## Artifacts

| Artifact | Purpose |
|---|---|
| [`assets/design-tokens.json`](../../assets/design-tokens.json) | Machine-readable tokens (W3C format) — feeds Pencil and Claude Design |
| [`docs/design-system.md`](../design-system.md) | Human-readable tokens + 4 named patterns |
| [`docs/component-inventory.md`](../component-inventory.md) | Component catalog (16 components, 7 domains) |
| [`docs/screen-snapshots/`](../screen-snapshots/README.md) | 14 production PNGs (7 routes × desktop/mobile) |

## Patterns

The four named visual patterns powering the magical/watercolor aesthetic:

- [Watercolor wash](../design-system.md#pattern-watercolor-wash) — soft color blobs / sunset gradient
- [Paper texture](../design-system.md#pattern-paper-texture) — SVG fractal-noise grain overlay
- [Hand-drawn divider](../design-system.md#pattern-hand-drawn-divider) — 4 variants: wave / sparkle / leaf / dots
- [Signature flourish](../design-system.md#pattern-signature-flourish) — SVG calligraphic sign-off

## Components

See [`component-inventory.md`](../component-inventory.md). Grouped by domain:

- **Layout** — Header, Footer
- **Home** — HeroSection, BooksSection, AuthorSection, FeaturesSection, CTASection
- **UI primitives** — FadeIn, WatercolorWash, PaperTexture, HandDrawnDivider, SignatureFlourish
- **Book** — BookCard
- **Checkout** — OrderForm
- **Podcast** — ComingSoonHero
- **SEO** — JsonLdOrganization, JsonLdBook, JsonLdPerson (single file, three exports)

## Screen Snapshots

14 captures from `https://sachcuahuy.com`. See [`screen-snapshots/README.md`](../screen-snapshots/README.md) for the full route × viewport matrix and re-capture instructions.

## Pipeline Position

**Phase 1 of 5** in the Pencil pipeline. Subsequent phases:

| Phase | Goal | Status |
|---|---|---|
| 1 | Design system extraction (this) | in progress → near complete |
| 2 | Pencil `.pen` v1 — mirror live site 1:1 | not started |
| 3 | Claude Design onboarding | not started |
| 4 | Hybrid maintenance playbook | not started |
| 5 | Sync tooling (Tailwind ↔ tokens.json ↔ Pencil) | not started |

Full context: [brainstorm report](../../plans/reports/brainstorm-260508-0839-sachcuahuy-design-system-pencil-pipeline.md).

## Re-Generation Commands

```bash
# Re-capture screenshots from production
npm run capture:snapshots

# Validate all design system artifacts
npm run validate:design

# Vietnamese glyph subset coverage check (Phase 1)
node scripts/check-vietnamese-glyphs.cjs
```

Tokens are hand-curated from `tailwind.config.ts` + `src/app/globals.css`. When those source files change, update `assets/design-tokens.json` + `docs/design-system.md` together — no extraction script yet (deferred to Phase 5 of the pipeline).

## Constraints (recap from plan)

- Source of truth = code. Do not hand-edit `design-tokens.json` independently of Tailwind config.
- Read-only extraction. No app code modifications during this pipeline phase.
- W3C tokens draft format. Deviations documented in `$description` fields.
- Vietnamese diacritics: all three fonts (Cormorant, Inter, Dancing Script) declare the `vietnamese` subset.

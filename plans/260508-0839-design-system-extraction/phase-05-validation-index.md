---
phase: 5
title: "Validation & docs index"
status: pending
priority: P2
effort: "1h"
dependencies: [1, 3]
---

# Phase 5: Validation & Docs Index

## Overview
Validate `assets/design-tokens.json` against W3C-style schema, cross-link all artifacts via `docs/design/README.md` entrypoint, and run final consistency checks. Closeout phase — no new content creation, only verification + linking.

## Requirements

**Functional:**
- JSON schema validation: `design-tokens.json` parses + matches expected token structure
- Cross-references valid: every link in design-system.md / component-inventory.md resolves
- Vietnamese glyph check passes (from Phase 1 script)
- Index doc lists all artifacts with one-line description

**Non-functional:**
- Single source of navigation: `docs/design/README.md`
- Fail-loud on broken cross-refs (script reports specific link that broke)
- All artifacts referenced from index OR explicitly excluded with reason

## Architecture

**Validation matrix:**

| Check | Tool | Pass criteria |
|---|---|---|
| `design-tokens.json` parses | `node -e "JSON.parse(...)"` or `ajv` | Exit 0 |
| `design-tokens.json` structure | Custom schema (top-level keys: color, fontFamily, shadow, motion, spacing?, radius?) | All required keys present |
| Markdown link integrity | `markdown-link-check` or simple grep + file existence | Zero broken links |
| Vietnamese glyph | `scripts/check-vietnamese-glyphs.cjs` (Phase 1) | Exit 0 |
| Component count | grep heading count in inventory | ≥10 |
| Pattern count | grep heading count in design-system.md patterns section | =4 |

**`docs/design/README.md` structure:**

```markdown
# Design System — sachcuahuy.com

> Code-derived design system. Source of truth: `assets/design-tokens.json`.
> Generated: {date}. Re-generation: see scripts/ section below.

## Artifacts

- [Design tokens (JSON)](../../assets/design-tokens.json) — machine-readable, W3C format
- [Design system reference (markdown)](../design-system.md) — tokens + patterns
- [Component inventory](../component-inventory.md) — component catalog
- [Screen snapshots](../screen-snapshots/) — 14 production page captures

## Patterns

- [Watercolor wash](../design-system.md#pattern-watercolor-wash)
- [Paper texture](../design-system.md#pattern-paper-texture)
- [Hand-drawn divider](../design-system.md#pattern-hand-drawn-divider)
- [Signature flourish](../design-system.md#pattern-signature-flourish)

## Components

See [component-inventory.md](../component-inventory.md) — grouped by domain (layout, home, ui, book, checkout, podcast, seo).

## Pipeline Position

This is **Phase 1 of 5** in the Pencil pipeline. Subsequent phases:

- Phase 2: Pencil v1 build (mirror live site 1:1)
- Phase 3: Claude Design onboarding
- Phase 4: Hybrid maintenance playbook
- Phase 5: Sync tooling (Tailwind ↔ tokens.json ↔ Pencil)

See [brainstorm report](../../plans/reports/brainstorm-260508-0839-sachcuahuy-design-system-pencil-pipeline.md) for full context.

## Re-Generation

```bash
# Re-extract tokens from code (when Tailwind config changes)
node scripts/extract-design-tokens.cjs  # if created in Phase 1

# Re-capture screenshots (when site visually changes)
npm run capture:snapshots

# Validate everything
node scripts/validate-design-system.cjs
```
```

## Related Code Files

- **Read (validate):**
  - `assets/design-tokens.json`
  - `docs/design-system.md`
  - `docs/component-inventory.md`
  - `docs/screen-snapshots/README.md`
  - `docs/screen-snapshots/*.png` (existence check, not content)
- **Create:**
  - `docs/design/README.md`
  - `scripts/validate-design-system.cjs` (orchestrates all checks above)
- **Modify:** none (no content changes)

## Implementation Steps

1. **Write `scripts/validate-design-system.cjs`**:
   - Parse `design-tokens.json` (must succeed)
   - Check structure: top-level keys present, every leaf has `$value` + `$type`
   - Walk markdown files: collect all `](path)` links, verify each path exists relative to file
   - Run Phase 1 glyph script
   - Count headings: components ≥10, patterns =4
   - Output report: `[PASS] | [FAIL: reason]` per check
2. **Run validation**: `node scripts/validate-design-system.cjs` — fix any failures
3. **Write `docs/design/README.md`** using structure above
4. **Add npm script**: `"validate:design": "node scripts/validate-design-system.cjs"`
5. **Final manual review**: open `docs/design/README.md` in markdown preview, click every link, confirm navigation works
6. **Update plan.md**: mark all 5 phases as `completed` (via direct edit since `ck plan check` not available in this CLI version)
7. **Self-review**: confirm zero code edits outside `docs/`, `scripts/`, `package.json`

## Success Criteria

- [ ] `scripts/validate-design-system.cjs` exists and exits 0
- [ ] `docs/design/README.md` exists with all artifact links resolving
- [ ] All cross-refs in design-system.md and component-inventory.md resolve
- [ ] `package.json` has `validate:design` script
- [ ] Vietnamese glyph check passes
- [ ] Component count ≥10, pattern count =4
- [ ] Manual click-through of README.md works without 404s

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Validation script over-engineered | Keep it simple: 6 checks, single file, no test framework |
| Markdown link grep false positives (URL fragments) | Filter to relative paths only; allow URL anchors as warnings, not fails |
| W3C schema not finalized — strict validation impossible | Document expected structure inline in script; loose validation with descriptive errors |
| Missing screenshots break index | Validation script lists missing files; phase 4 must complete first (declared dependency) |
| Plan.md status update conflicts with future ck CLI | Manual edit acceptable; if ck adds `plan check`, future plans use it |

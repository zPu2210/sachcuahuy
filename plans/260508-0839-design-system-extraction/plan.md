---
title: "Design System Extraction — sachcuahuy.com"
created: 2026-05-08
status: pending
priority: P2
total_effort: 1-2 days
mode: auto
source_brainstorm: plans/reports/brainstorm-260508-0839-sachcuahuy-design-system-pencil-pipeline.md
parent_initiative: "Pencil UI Pipeline — Phase 1 of 5"
related_plans:
  - 260502-2024-sachcuahuy-production-launch (in-progress, no overlap — site live, this is post-launch doc work)
  - 260506-2335-magical-uiux-overhaul (completed — current visual language source)
---

# Design System Extraction — sachcuahuy.com

> **Phase 1 of broader Pencil pipeline.** Phases 2-5 (Pencil v1, Claude Design onboarding, maintenance playbook, sync tooling) will be planned separately after Phase 1 cook completes. See [brainstorm report](../reports/brainstorm-260508-0839-sachcuahuy-design-system-pencil-pipeline.md) §4 for full pipeline.

Extract design tokens, visual patterns, component inventory, and screen snapshots from production code at `sachcuahuy.com`. Establish `assets/design-tokens.json` as machine-readable single source of truth feeding future Pencil designs and Claude Design exploration.

## Goal

100% of in-use design language documented as code-derived artifacts: tokens (W3C format), patterns (4 named: watercolor wash, paper texture, hand-drawn divider, signature flourish), component catalog, and 14 screen PNGs (7 routes × desktop 1440 + mobile 375).

## Phases

| # | Phase | Status | Effort | Output |
|---|-------|--------|--------|--------|
| 1 | [Token audit & extraction](phase-01-token-audit.md) | pending | 3h | `assets/design-tokens.json` + tokens section of `docs/design-system.md` |
| 2 | [Visual patterns documentation](phase-02-visual-patterns.md) | pending | 2h | patterns section of `docs/design-system.md` |
| 3 | [Component inventory](phase-03-component-inventory.md) | pending | 3h | `docs/component-inventory.md` |
| 4 | [Screenshot capture](phase-04-screenshot-capture.md) | pending | 2h | `docs/screen-snapshots/*.png` (14 files) |
| 5 | [Validation & docs index](phase-05-validation-index.md) | pending | 1h | `docs/design/README.md` + JSON schema validation |

**Sequential dependencies:** 1 → 2 (patterns reference tokens), 1 + 3 → 5 (validation needs both). Phase 4 parallel after Phase 1.

## Non-Goals (out of scope)

- Pencil `.pen` file build → Phase 2 of pipeline
- Claude Design integration → Phase 3 of pipeline
- Maintenance playbook authoring → Phase 4 of pipeline
- Sync scripts (Tailwind ↔ Pencil) → Phase 5 of pipeline
- Tablet viewport (768) — desktop + mobile only for v1
- New component creation, refactor, or design changes — read-only documentation pass

## Key Constraints

- **Source of truth = code**: `tailwind.config.ts` + `src/app/globals.css` drive `design-tokens.json`. No hand-written tokens.
- **Live site screenshots**: capture from `https://sachcuahuy.com` (production), not local dev. Verify CDN serves fresh content (cache-bust if needed).
- **Vietnamese diacritics**: confirm Cormorant + Inter render `ă đ ê ô ơ ư` etc. correctly in screenshots; flag fallback need if missing.
- **W3C Design Tokens format**: prefer for `design-tokens.json` per <https://design-tokens.github.io/community-group/format/>; document deviations.
- **Read-only**: NO code changes during extraction. If audit reveals issues (typos, dead CSS), file follow-up tickets, do not fix inline.

## Success Criteria (plan-level)

- [ ] All 5 phase files completed (phase-01 through phase-05)
- [ ] `assets/design-tokens.json` exists and validates against W3C schema
- [ ] `docs/design-system.md` covers tokens + 4 named patterns
- [ ] `docs/component-inventory.md` lists ≥10 components with props/variants/usage
- [ ] `docs/screen-snapshots/` contains 14 PNG files matching naming `{route-slug}-{viewport}.png`
- [ ] `docs/design/README.md` cross-links all artifacts
- [ ] Vietnamese diacritic render confirmed in ≥1 screenshot per font
- [ ] Zero code modifications outside `docs/`, `assets/`, and `scripts/` (extraction tooling only)

## Risk Register

| Risk | Mitigation |
|---|---|
| Live CDN serves stale content | Cache-bust with `?v={timestamp}` query, or capture from Vercel preview URL |
| W3C format incompatibility with edge cases | Document deviations in `design-tokens.json` `$description` field |
| Component count >> 10 (scope creep) | Cap inventory at top-level + 1 nesting; deeper components noted but not catalogued |
| Vietnamese font glyph gap | Run check script in Phase 1; if gap, add Noto Serif/Sans Vietnamese fallback note (do NOT fix inline) |
| Playwright unavailable in env | Fallback to Chrome MCP or manual screenshot via DevTools |

## Q&A Resolutions (2026-05-08 Round 2)

User clarifications resolved upstream brainstorm questions:

- **Claude Max**: ✅ subscription confirmed → Claude Design Labs accessible (Phase 3 of pipeline)
- **CDN cache stale**: ✅ mitigation = `?_snapshot=${Date.now()}` query string in Phase 4 capture script
- **Brand assets**: defer to separate plan (`260508-XXXX-brand-asset-system`); proposed structure documented in brainstorm §9
- **Pencil mock data for dynamic content**: pattern decided = Pencil G() with real source images + asset manifest tracking. Pattern saved to `~/.claude/skills/pencil/knowledge/06-dynamic-content-with-real-sources.md` for reuse. Implementation in Phase 2 of pipeline.
- **Pencil docs**: ✅ all 18 pages crawled to `docs/pencil-docs/` + curated prompt template at `docs/pencil-prompts/prompt-template-code-to-pencil.md`

## Next Steps After Plan Cook

1. Phase 2 plan: `plans/260508-XXXX-pencil-v1-build/` — incorporate G()+source-image pattern from skill knowledge
2. Plan `260508-XXXX-brand-asset-system` — version control structure for logos/textures
3. Update `docs/design/README.md` to reference Phase 2 output
4. Trigger Claude Design onboarding (Phase 3) when ready

## Source

[Brainstorm report](../reports/brainstorm-260508-0839-sachcuahuy-design-system-pencil-pipeline.md) — full 5-phase pipeline rationale, risk analysis, Q&A resolutions log §10.

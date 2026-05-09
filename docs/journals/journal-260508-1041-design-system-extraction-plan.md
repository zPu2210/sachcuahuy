# Design System Extraction Plan Locked — 5-Phase Pencil Pipeline Established

**Date**: 2026-05-08 10:41  
**Component**: Design System + Pencil Pipeline  
**Status**: Plan complete, ready for Phase 1 cook  

## What Happened

3-hour brainstorm + planning session to establish a long-term design pipeline for `sachcuahuy.com` (live production). Brainstormed 5-phase approach: extract design system → build Pencil mirror → onboard Claude Design → establish maintenance playbook → tooling. Locked decisions on source of truth, viewport strategy, and hybrid maintenance model. Produced detailed brainstorm report + scaffolded Phase 1 plan with 5 sub-phases.

Core work:
- Brainstorm: researched Pencil MCP docs (18 pages, 12K words saved to `docs/pencil-docs/`), Claude Design beta capabilities, Code↔Design native sync patterns
- Research discovery: Pencil natively supports `"Recreate Header from src/components/layout/header.tsx"` prompts via MCP — eliminates manual frame-by-frame building for Phase 2
- Evaluated 3 approaches (manual Pencil, Pencil-only, code-first hybrid) → chose **code-first with Claude Design sandbox + Pencil mirror** per user preference
- Locked critical decisions: source of truth = `design-tokens.json` (generated from Tailwind), viewports = 1440 (desktop) + 375 (mobile) only, fidelity = 1:1 live site (no redesign)
- Scaffolded Phase 1: 5 sub-phases (token audit, visual patterns, component inventory, screenshot capture, validation) = 11 estimated hours
- Created curated Pencil Code→Design prompt template at `docs/pencil-prompts/prompt-template-code-to-pencil.md` for Phase 2 reuse
- Saved Pencil skill insight: `~/.claude/skills/pencil/knowledge/06-dynamic-content-with-real-sources.md` — pattern for handling dynamic content (book covers, podcasts) using G() with real source images + asset manifest tracking (addresses Directus mock data concern)

## The Brutal Truth

This session felt like intellectual work paying off. We researched our way out of multiple wrong approaches (manual Pencil building would've wasted 2–3 days) and found Pencil's native Code→Design support right when we needed it. But that efficiency is *because* we had the constraints and the user's preferences crystal clear from the get-go.

What's humbling: the brainstorm was necessary. If we'd guessed at Pencil capabilities without reading the actual docs, we'd have defaulted to manual frame building. The 18-page doc crawl felt excessive at the time but saved us from a design pipeline that would've been 5x slower.

The deferred scope is also now explicit and documented: tablet viewport, Pencil CLI CI/CD, Storybook, brand asset versioning, mobile interaction states. That's the kind of "we'll revisit this later" that actually *stays* revisited because it's in writing.

## Technical Details

### Pipeline Structure (5 Phases, 6–7.5 days total upfront)

| Phase | Duration | Output | Status |
|---|---|---|---|
| 1 — Token audit | 1-2 days | `assets/design-tokens.json` + tokens section of `docs/design-system.md` | Plan locked, ready for cook |
| 2 — Pencil v1 build | 2-3 days (Code→Design native speeds this up) | `designs/sachcuahuy.pen` with 14 screen frames (7 routes × 2 viewports) + components | Phase plan TBD post-Phase-1 |
| 3 — Claude Design onboarding | 1 day | Claude Design project + `docs/claude-design-workflow.md` + export validation | Phase plan TBD |
| 4 — Maintenance playbook | 0.5 day | `docs/design-maintenance-playbook.md` with change router + sync rituals | Phase plan TBD |
| 5 — Sync tooling | 1 day | Scripts: `sync-design-tokens.cjs`, `screenshot-diff.cjs`, Pencil CLI wrapper | Phase plan TBD |

**Sequential gate:** Phase 1 complete before Phases 2–3 start. Phases 3–5 can run parallel after Phase 2.

### Key Decisions Locked

**Source of truth = Code (Tailwind → tokens.json)**
```
tailwind.config.ts + globals.css
  ↓ (sync script Phase 5)
assets/design-tokens.json (W3C format)
  ↓ (input to)
Pencil variables + Claude Design + future tooling
```
No hand-authored tokens; everything derived from live config.

**Hybrid maintenance by change type:**
- Spacing/color tweaks → code first, Pencil syncs weekly
- Bug fixes → code first, batch Pencil update
- New features/pages → Pencil first (exploration), Claude Design explore, code implements
- Token changes → `design-tokens.json` SoT mandatory + Tailwind + Pencil vars in same PR

**Pencil as visual contract, not SoT:** 1:1 fidelity mirrors live site within ±2px. Claude Design = exploration sandbox (can diverge for ideation, but doesn't drive code).

**Viewports:** Desktop 1440 + mobile 375 only. Tablet (768) deferred post-Phase-2 if analytics show usage.

### Routes Captured in Phase 1

7 routes × 2 viewports = 14 PNG snapshots:
1. `/` — home
2. `/sach` — catalog
3. `/sach/[slug]` — book detail (sample: "Lính Đáo" or first book)
4. `/gioi-thieu` — author intro
5. `/podcast` — podcast hub
6. `/dat-hang` — checkout page
7. `/xac-nhan` — confirmation page

Desktop: 1440px viewport. Mobile: 375px viewport.

### Risks Identified & Mitigated

| Risk | Likelihood | Mitigation |
|---|---|---|
| Pencil MCP drops every 15-20 ops | High | Small batches (max 15–20), frequent state check, export per frame, main session only |
| Claude Design save errors / lag on large codebase | Medium | Local artifact backup per session, rules of engagement to avoid vendor lock-in |
| Token drift Tailwind ↔ Pencil ↔ Claude Design | High | `design-tokens.json` as SoT, sync script in Phase 5, pre-commit check enforces alignment |
| Vietnamese diacritics rendering fail | Low | Test Cormorant + Inter glyph coverage in Phase 1 screenshots; fallback note if needed (no inline fixes) |
| CDN serves stale screenshots | Medium | Cache-bust with `?_snapshot=${Date.now()}` query string in Phase 4 script |

### Pencil Docs + Skill Knowledge

Curated knowledge artifacts saved for team reuse:
- **Pencil docs home:** `docs/pencil-docs/` (18 pages, searchable, HTML extracted)
- **Pencil prompts template:** `docs/pencil-prompts/prompt-template-code-to-pencil.md` — ready-to-use Code→Design prompts
- **Pencil skill:** `~/.claude/skills/pencil/knowledge/06-dynamic-content-with-real-sources.md` — pattern for G() image generation with real source files + asset manifest, addresses Directus dynamic content challenge

## What We Tried

1. **Manual Pencil building approach** (initial instinct):
   - Build every frame thủ công from scratch using Pencil MCP `batch_design`
   - Pros: max control
   - Cons: 5x slower, fragile when MCP drops
   - **Pivot**: Discovered Pencil Code→Design native MCP support in docs → dropped manual approach

2. **Pencil-only (skip Claude Design)** (alternative considered):
   - Use Pencil MCP G() for AI variations, avoid Claude Design
   - Pros: less vendor dependency
   - Cons: limited exploration (G() not as capable as Claude Design for ideation)
   - **Rejected**: User explicitly wants Claude Design layer for exploration

3. **Code-first hybrid + Claude Design sandbox + Pencil mirror** ✅ (chosen):
   - Tokens live in code (Tailwind SoT)
   - Claude Design = exploration/ideation sandbox (not SoT, protects from vendor lock)
   - Pencil = visual contract + handoff archive (mirrors code 1:1)
   - **Rationale**: Matches user's risk profile (code as source of truth) + vendor lock mitigation + visual contract for team handoff

## Root Cause Analysis

Why this pipeline needed designing *before* building Pencil:

1. **Pencil MCP unreliability** (drops every 15–20 ops): manual frame building would've been 2–3 failed attempts before getting right. Native Code→Design support eliminates most of this friction.

2. **Claude Design beta maturity**: save errors and performance lag on large codebases meant we couldn't treat it as source of truth. Requires architectural decision (Pencil as visual contract, Claude Design as sandbox) before building.

3. **Token drift risk**: without explicit SoT decision + sync script, tokens would've drifted across Tailwind config (code), Pencil variables, and Claude Design extract. Locked the decision upfront to prevent 3–4 hours of reconciliation work in Phase 2–3.

4. **Dynamic content in Pencil** (Directus book covers, podcast art): Pencil's G() text-to-image isn't enough for branded assets. Discovering the "G() with real source images + asset manifest" pattern early (via skill knowledge) prevents Phase 2 rework.

The brainstorm compressed what would've been 2–3 days of discovery during build into 3 hours of planning + research.

## Lessons Learned

**On design system architecture:**
- Code-as-truth (Tailwind → derived tokens) is simpler than hand-authored tokens + sync script. The script is now guardrail, not critical path.
- Separating "exploration tool" (Claude Design) from "contract tool" (Pencil) from "source of truth" (code) prevents decision paralysis later. Each tool knows its role.
- Pencil's Code→Design native support is *the* killer feature for this workflow. Without it, we'd need 5–7 days; with it, ~2–3 days. Worth prioritizing when available.

**On risk planning:**
- Listing "Pencil MCP drops every 15–20 ops" upfront allowed Phase 1–2 plan to include guardrails (small batches, frequent state check, main session only). Without that risk name, Phase 2 would've hit the drops and scrambled.
- Documenting "deferred scope" (tablet, Storybook, brand asset versioning) in writing prevents scope creep. We said "no" to tablet because we *knew* we were saying it upfront, not discovered it mid-Phase-2 as a "nice to have".

**On brainstorm-then-plan workflows:**
- Brainstorms that don't produce actionable decisions (deferred scope, risk mitigations, locked architectural choices) are just long chats. This one worked because the 3 hours generated:
  - 2 rejected approaches (manual Pencil, Pencil-only)
  - 1 chosen approach (code-first hybrid)
  - 5 explicit "no" decisions (tablet, Storybook, brand asset versioning, Pencil CLI CI/CD, multi-brand)
  - 8 unresolved Qs locked into follow-up plans or Phase-2 scope
  - 1 new skill knowledge pattern (dynamic content with real sources)

## Next Steps

**Immediate (ready to cook Phase 1):**
- [ ] `/ck:cook plans/260508-0839-design-system-extraction/phase-01-token-audit.md`
  - Read `tailwind.config.ts` + `src/app/globals.css`
  - Generate `assets/design-tokens.json` (W3C format)
  - Document deviations from spec in `$description` field
  - Estimated: 3h

**After Phase 1 cook complete:**
- [ ] `/ck:plan` Phase 2 (Pencil v1 build) — incorporate Code→Design native prompts + source-image asset pattern
- [ ] `/ck:plan` Phase 3 (Claude Design onboarding) — user-led with support for export validation
- [ ] Consider parallel Phase 4/5 after Phase 2 ships (tooling + playbook can run in parallel)

**Deferred (separate plans, post-Phase-1):**
- `260508-XXXX-brand-asset-system` — version control structure for logos/textures (mentioned in brainstorm §9)
- Tablet viewport support (Phase 2 deferred scope)
- Pencil CLI CI/CD (Phase 5 extension)
- Storybook integration (out of scope v1)

**Documentation updates needed:**
- Update `docs/design/README.md` to cross-link all Phase 1 outputs (Phase 5 task)
- Add Phase 1 output refs to `PROJECTS.md` or session archive

## Unresolved Questions

1. **Phase 2 scope — interaction states**: Hamburger menu open, podcast player active, checkout form filled — capture as separate frames in Pencil or defer to v1.1?
2. **Phase 2 design version tagging**: Should Pencil v1 = git tag `design-v1.0.0`? Or semantic version separate from code release?
3. **Pencil license verification**: Free tier coverage for Code→Design AI prompts — need to verify before starting Phase 2 (assumed but not confirmed)
4. **Tablet viewport decision gate**: Current plan says "skip tablet for v1, revisit post-Phase-2 if traffic shows usage". Should we set a specific review date, or monitor via analytics async?
5. **Claude Design export formats**: Phase 3 tests HTML, ZIP, and handoff bundle — which format becomes canonical for handoff archiving?

---
phase: 0
title: "Audit Execution (delegate to existing audit plan)"
status: completed
priority: P1
effort: "1-2h wall (delegated)"
dependencies: []
---

# Phase 0: Audit Execution

## Context Links

- Existing audit plan: `plans/260504-2119-website-uiux-audit/plan.md` (status=pending)
- Audit phase files: `phase-01-baseline-capture.md`, `phase-02-multi-agent-audit.md`, `phase-03-consolidation-fix-plan.md`
- Audit brainstorm: `plans/reports/brainstorm-260504-2119-website-uiux-audit.md`
- Output target: `plans/reports/audit-260504-2119-website-uiux/`

## Overview

Trigger và coordinate execution của existing audit plan `260504-2119-website-uiux-audit`. Plan đó đã chốt structure (Playwright baseline + 3 sub-agents parallel + consolidation). Em không re-plan — em chỉ run nó và harvest findings để inform Phase 1.

## Key Insights

- Audit plan đã được brainstorm chốt approach + 3 phase files đầy đủ. KHÔNG modify nội dung audit plan.
- Audit output JSON/markdown findings dùng làm input "audit overlap" cho Phase 1 (home).
- Audit có thể discover scope ngoài magical overhaul (transactional flow bugs, form a11y) — handle qua **separate fix queue**, không nhồi vào Phase 1.

## Requirements

### Functional
- Execute 3 phases of audit plan trong order: baseline-capture → multi-agent-audit → consolidation-fix-plan
- Output `findings-visual.md`, `findings-a11y.md`, `findings-perf.md`, `fix-plan.md`, `README.md`
- 16+ baseline screenshots organized
- Lighthouse JSON cho 3 priority pages (home, sach, dat-hang)
- Audit dummy order code recorded for cleanup

### Non-functional
- Wall time: ~65 min (per existing plan estimate) + 30 min coordination buffer
- Audit findings P0/P1 tagged để Phase 1 priority pickup
- Audit dummy order cleanup checklist (anh delete via Directus admin)

## Architecture

```
Em (main, coordinate)
   │
   ├─► Phase 0.1 (audit phase-01) — Em (main) Playwright baseline + Lighthouse
   │
   ├─► Phase 0.2 (audit phase-02) — Spawn 3 sub-agents parallel:
   │     ├─ ui-ux-designer (visual findings)
   │     ├─ code-reviewer (a11y findings)
   │     └─ debugger (perf findings)
   │
   ├─► Phase 0.3 (audit phase-03) — Em consolidate findings → fix-plan.md + README.md
   │
   └─► Phase 0.4 (NEW, integrate into overhaul) — Em filter findings:
         ├─ Home-related findings → Phase 1 input
         ├─ Sach-related → Phase 2 input
         ├─ Gioi-thieu/Podcast-related → Phase 3 input
         └─ Out-of-scope (transactional/backend/etc) → separate fix queue (parking lot)
```

## Related Code Files

### Read (no modify)
- `plans/260504-2119-website-uiux-audit/plan.md`
- `plans/260504-2119-website-uiux-audit/phase-01-baseline-capture.md`
- `plans/260504-2119-website-uiux-audit/phase-02-multi-agent-audit.md`
- `plans/260504-2119-website-uiux-audit/phase-03-consolidation-fix-plan.md`

### Create (audit output)
- `plans/reports/audit-260504-2119-website-uiux/README.md`
- `plans/reports/audit-260504-2119-website-uiux/screenshots/*.png` (16+)
- `plans/reports/audit-260504-2119-website-uiux/lighthouse/*.json` (3)
- `plans/reports/audit-260504-2119-website-uiux/findings-{visual,a11y,perf,competitor}.md`
- `plans/reports/audit-260504-2119-website-uiux/fix-plan.md`
- `plans/reports/audit-260504-2119-website-uiux/baseline-manifest.md`

### Create (overhaul integration)
- `plans/260506-2335-magical-uiux-overhaul/audit-integration-notes.md` — em filter findings → per-phase input + parking lot

### Modify
- `plans/260504-2119-website-uiux-audit/plan.md` — frontmatter add `blocks: [260506-2335-magical-uiux-overhaul]`, status flips → in-progress khi start, → completed khi xong
- `plans/260506-2335-magical-uiux-overhaul/plan.md` — Phase 0 status flips on start/complete

## Implementation Steps

1. **Pre-flight check** (5 min)
   - Verify Playwright works (Cloudflare bot block test)
   - Verify Lighthouse CLI installed
   - Verify Directus admin access cho dummy order cleanup
   - Update `plans/260504-2119-website-uiux-audit/plan.md` frontmatter:
     - `status: pending → in-progress`
     - Add `blocks: [260506-2335-magical-uiux-overhaul]`

2. **Execute audit Phase 1 — Baseline Capture** (~20 min)
   - Run as specified in `260504-2119-website-uiux-audit/phase-01-baseline-capture.md`
   - Capture 16+ screenshots (8 pages × 2 viewports)
   - Lighthouse 3 priority pages
   - Quick competitor skim (Nhã Nam, Tiki sách)
   - Dummy order với prefix `[AUDIT-DUMMY]`

3. **Execute audit Phase 2 — Multi-Agent Audit** (~30 min wall, parallel)
   - Spawn `ui-ux-designer` agent → findings-visual.md
   - Spawn `code-reviewer` agent → findings-a11y.md
   - Spawn `debugger` agent → findings-perf.md
   - Each gets baseline screenshots + Lighthouse JSON as context
   - Each writes to `plans/reports/audit-260504-2119-website-uiux/`

4. **Execute audit Phase 3 — Consolidation** (~15 min)
   - Em (main) consolidate 3 findings docs → unified `fix-plan.md`
   - Severity matrix (P0/P1/P2/P3 × visual/a11y/perf)
   - Quick wins bucket (high impact + low effort)
   - Write executive `README.md`
   - Update `plans/260504-2119-website-uiux-audit/plan.md` status → completed

5. **NEW: Audit-overhaul integration** (~15 min)
   - Em read `fix-plan.md` + 3 findings docs
   - Categorize findings per overhaul page:
     - Home findings → input to Phase 1 scope review
     - Sach findings → input to Phase 2
     - Gioi-thieu/Podcast → input to Phase 3
     - Cross-cutting (form a11y, focus management, etc.) → input to relevant Phase
     - Out-of-scope (transactional flows, backend, infra) → parking lot
   - Write `audit-integration-notes.md`:
     ```markdown
     # Audit findings → Overhaul phase routing
     
     ## Phase 1 Home — pickup these
     - [P0] [finding title] — file:line — fix recommendation
     - [P1] ...
     
     ## Phase 2 Sach — pickup these
     ...
     
     ## Phase 3 Gioi-thieu/Podcast — pickup these
     ...
     
     ## Parking lot (out of overhaul scope)
     - [P0/P1 only] — defer to separate `/ck:fix` session
     - List với severity + brief title
     ```
   - **Critical**: Anh review `audit-integration-notes.md` BEFORE start Phase 1. Audit findings có thể bump Phase 1 effort 6h → 10h.

6. **Audit dummy order cleanup** (~5 min)
   - Anh delete dummy order via Directus admin UI
   - Order code documented in audit README

## Todo List

- [ ] Update audit plan frontmatter (status=in-progress, blocks=overhaul)
- [ ] Pre-flight checks (Playwright, Lighthouse, Directus admin access)
- [ ] Run audit Phase 1 — Baseline Capture
- [ ] Run audit Phase 2 — Multi-Agent Audit (3 parallel sub-agents)
- [ ] Run audit Phase 3 — Consolidation & Fix Plan
- [ ] Filter findings → write `audit-integration-notes.md`
- [ ] Update audit plan status → completed
- [ ] Update overhaul plan Phase 0 status → completed
- [ ] Anh review audit-integration-notes + approve Phase 1 scope (potentially re-scoped)
- [ ] Anh delete dummy order via Directus

## Success Criteria

- [ ] Audit plan executes 3 phases successfully
- [ ] All audit deliverables present at `plans/reports/audit-260504-2119-website-uiux/`
- [ ] Findings categorized per overhaul phase qua `audit-integration-notes.md`
- [ ] Parking lot documented (out-of-scope findings)
- [ ] Phase 1 scope re-confirmed (potentially adjusted by audit P0/P1)
- [ ] Audit dummy order cleanup completed
- [ ] Both audit plan + overhaul plan frontmatter status correct

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cloudflare blocks Playwright | Med | High | Pre-flight test first; fallback to Chrome MCP if blocked |
| Sub-agents disagree on severity | Med | Low | Em consolidate là source of truth, conflict log trong appendix |
| Audit findings >> overhaul scope (anh muốn fix nhiều thứ) | High | Med | Stay disciplined: parking lot non-magical findings, hard scope gate |
| Audit findings <- overhaul scope (audit miss critical) | Low | Med | Em re-scout home page Phase 1 if findings sparse on home |
| Token blow-up trong sub-agents | Med | Low | Bounded prompts per agent, scoped file lists |
| Audit reveals critical bug → overhaul postpone | Low | High | Em surface ngay → anh decide: fix-bug-first hoặc parallel |

## Security Considerations

- Dummy order in production DB → must cleanup
- Playwright sessions không persist credentials
- No PII in screenshots (placeholder phone/name in dummy order)

## Next Steps

After Phase 0 completes:
1. Anh review `audit-integration-notes.md` (critical decision point)
2. Approve final Phase 1 scope (vanilla 6h vs re-scoped 10h)
3. Em start Phase 1 — Home Vertical Slice

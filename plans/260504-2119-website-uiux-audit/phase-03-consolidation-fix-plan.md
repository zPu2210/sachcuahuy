---
phase: 3
title: "Consolidation & Fix Plan"
status: pending
priority: P1
effort: "15 min"
dependencies: [1, 2]
---

# Phase 3: Consolidation & Fix Plan

## Overview

Em (main) merge 3 findings docs từ Phase 2 + competitor notes Phase 1 → 1 unified `fix-plan.md` (prioritized backlog) + `README.md` (executive summary cho anh đọc < 5 min).

## Requirements

### Functional
- Read 4 inputs: `findings-visual.md`, `findings-a11y.md`, `findings-perf.md`, `findings-competitor.md`
- De-duplicate overlapping findings (same issue spotted by 2+ agents)
- Build unified severity matrix (all findings flat-list, sortable)
- Build prioritized fix queue:
  - P0 first (must fix before any new feature)
  - Quick-wins next (high impact + low effort, mọi severity)
  - P1 batch (1-2 ngày sprint)
  - P2/P3 backlog
- Estimate effort per fix: S (< 30 min), M (30 min - 2h), L (> 2h)
- Estimate impact: high/med/low
- Write `README.md` executive: top 10 findings + quick wins + severity totals + recommended next actions

### Non-functional
- Wall time: ~15 min
- README readable < 5 min
- fix-plan.md actionable (anh có thể pick items rồi fire /ck:cook)
- No copy-paste fluff — em phải synthesize, không dump

## Architecture

```
Em (main, READ + WRITE)
   │
   ├─► Read findings-visual.md (Phase 2 output)
   ├─► Read findings-a11y.md (Phase 2 output)
   ├─► Read findings-perf.md (Phase 2 output)
   ├─► Read findings-competitor.md (Phase 1 output)
   │
   ├─► Synthesize: de-dup, severity matrix, prioritization
   │
   ├─► Write fix-plan.md (full backlog)
   └─► Write README.md (executive summary)
```

## Related Code Files

### Create
- `plans/reports/audit-260504-2119-website-uiux/fix-plan.md`
- `plans/reports/audit-260504-2119-website-uiux/README.md`

### Read
- `plans/reports/audit-260504-2119-website-uiux/findings-visual.md`
- `plans/reports/audit-260504-2119-website-uiux/findings-a11y.md`
- `plans/reports/audit-260504-2119-website-uiux/findings-perf.md`
- `plans/reports/audit-260504-2119-website-uiux/findings-competitor.md`
- `plans/reports/audit-260504-2119-website-uiux/baseline-manifest.md`

### Modify
- `plan.md` (this plan): mark all phases completed
- Mark this plan status → completed

## Implementation Steps

1. **Read all 4 findings docs** — em đọc full text từng file vào context. Tổng ~30-60K tokens.

2. **Build flat-list severity matrix** — em parse mỗi finding thành row:
   ```
   | # | Sev | Cat | Source | Page | Title | Effort | Impact |
   ```
   Source = visual/a11y/perf/competitor

3. **De-duplicate** — same issue by 2+ agents:
   - Example: "form labels missing" có thể visual + a11y cùng spot
   - Merge thành 1 row, attribute multi-source
   - Bump severity nếu đa-agent confirm

4. **Categorize fix queue** — em chia 4 buckets:
   - **🔥 P0 Critical** — fix ngay
   - **⚡ Quick Wins** — high impact + low effort (S), mọi severity
   - **📋 P1 Sprint** — 1-2 ngày sprint
   - **🗂 P2/P3 Backlog** — long-tail polish

5. **Write `fix-plan.md`** — structure:
   ```markdown
   # Fix Plan — sachcuahuy.com UI/UX Audit
   
   ## Severity Distribution
   | Sev | Count | Visual | A11y | Perf |
   |---|---|---|---|---|
   | P0 | N | x | y | z |
   ...
   
   ## 🔥 P0 Critical (Fix immediately)
   1. [Title] — file:line/page, screenshot, fix recommendation, effort S
   ...
   
   ## ⚡ Quick Wins (1-day batch — recommended next)
   1. [Title] — ...
   
   ## 📋 P1 Sprint (1-2 days)
   1. [Title] — ...
   
   ## 🗂 P2/P3 Backlog
   - List with brief title + severity + effort
   
   ## Cross-cutting Themes
   - Pattern observations across multiple findings
   - E.g., "Form a11y issues across all 3 forms — recommend shared FormField component"
   
   ## Suggested Cook Sessions
   - Cook 1: P0 fixes (~Xh)
   - Cook 2: Quick wins (~Xh)
   - Cook 3: P1 sprint (~Xh)
   ```

6. **Write `README.md`** — executive summary cho anh đọc 5 min:
   ```markdown
   # Audit Report — sachcuahuy.com UI/UX
   
   **Date:** 2026-05-04 21:19
   **Scope:** 8 pages × 2 viewports + Lighthouse 3 pages
   **Method:** Multi-agent parallel (ui-ux-designer + code-reviewer + debugger)
   
   ## TL;DR (1 paragraph)
   <2-3 sentences capturing health overall + top recommendation>
   
   ## Severity Totals
   | Sev | Count |
   |---|---|
   | P0 | N |
   | P1 | N |
   | P2 | N |
   | P3 | N |
   
   ## Top 10 Findings
   <Curated cross-concern, not just top P0>
   
   ## Lighthouse Scores
   <Quick table from findings-perf.md>
   
   ## Recommended Next Actions
   1. Anh review fix-plan.md
   2. Approve P0 batch → em /ck:cook P0 fixes
   3. Approve Quick Wins batch → em /ck:cook batch
   4. (Optional) Plan dark mode (P3 missing)
   
   ## File Index
   - findings-visual.md (N findings)
   - findings-a11y.md (N findings)
   - findings-perf.md (N findings)
   - findings-competitor.md (notes)
   - fix-plan.md (prioritized backlog)
   - screenshots/ (16+ PNGs)
   - lighthouse/ (3 JSONs)
   
   ## Dummy Order Cleanup
   - Order ID: <ID>
   - Token: <token>
   - Anh delete qua Directus admin UI
   
   ## Unresolved
   - <List anything em không cover được>
   ```

7. **Update plan.md status** — mark all 3 phases completed, plan status → completed.

8. **Cleanup** — verify all output files exist, no broken links trong README.

## Success Criteria

- [ ] `fix-plan.md` exists, có 4 buckets (P0/QuickWins/P1/Backlog)
- [ ] Severity distribution table populated
- [ ] De-duplication done (no obvious doubles)
- [ ] Effort estimates trên all P0/P1 items
- [ ] README.md readable < 5 min, có Top 10 + Lighthouse scores + Next Actions
- [ ] Cross-cutting themes identified (pattern observations)
- [ ] Suggested Cook sessions có wall time estimate
- [ ] Dummy order cleanup info trong README
- [ ] plan.md status → completed

## Risk Assessment

| Risk | Mitigation |
|---|---|
| 3 agents return drastically different volumes | Em normalize nhưng don't pad — better 30 quality findings hơn 100 fluffy |
| De-dup miss obvious overlaps | Em quét theo page + element keyword, nếu 2 findings same element + same page → merge candidate |
| Effort estimates rough | Em conservative (round up); anh có thể adjust khi pick batch |
| README dài quá → unreadable | Limit Top 10, executive section ≤ 1 page |
| Cross-cutting themes miss | Em dành 5 min cuối để re-read all findings, look for patterns |

## Output Final State

Sau Phase 3 complete, anh có thể:
1. Đọc `README.md` (5 min) → hiểu tổng quan
2. Đọc `fix-plan.md` (10 min) → pick batch fix
3. Mở screenshots theo reference khi cần visual context
4. Fire `/ck:cook` với specific fix batch (P0, Quick Wins, P1) trong session mới

## Notes

- Em (main) handle Phase 3, không spawn agent (synthesis cần holistic view)
- Token cost Phase 3: ~70K (read 4 files + write 2 files)
- Total plan token: ~30K (P1) + ~200K (P2 spread 3 agents) + ~70K (P3) = ~300K aggregate, ~100K main context

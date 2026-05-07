---
title: "Website UI/UX Audit — sachcuahuy.com"
status: completed
priority: P1
created: 2026-05-04
slug: website-uiux-audit
brainstorm: plans/reports/brainstorm-260504-2119-website-uiux-audit.md
output: plans/reports/audit-260504-2119-website-uiux/
mode: audit-only
blocks:
  - 260506-2335-magical-uiux-overhaul
relates_to:
  - 260502-2024-sachcuahuy-production-launch (parent — site đã launch)
phases:
  - phase-01-baseline-capture
  - phase-02-multi-agent-audit
  - phase-03-consolidation-fix-plan
---

# Plan: Website UI/UX Audit — sachcuahuy.com

## Goal

Audit toàn bộ production site sachcuahuy.com để identify UI/UX bugs + visual errors + a11y/perf issues. Output severity-ranked findings + fix plan để anh review và quyết fix queue.

## Approach

**Approach B: Multi-agent parallel + Playwright capture** (chốt qua brainstorm session 21:19)

```
Phase 1 (~20 min) → Phase 2 (~30 min wall, parallel) → Phase 3 (~15 min)
   ↓                          ↓                              ↓
Capture baseline      3 sub-agents parallel:          Em consolidate
+ Lighthouse          - ui-ux-designer (visual)       findings vào
+ dummy order         - code-reviewer (a11y)          fix-plan.md
+ competitor skim     - debugger (perf)               + README exec
```

## Phases

| # | Phase | Status | Effort | Owner |
|---|---|---|---|---|
| 1 | [Baseline Capture](phase-01-baseline-capture.md) | completed | ~20 min (~8 min actual) | em (main) |
| 2 | [Multi-Agent Audit](phase-02-multi-agent-audit.md) | completed | ~30 min wall (~9 min actual, parallel) | 3 sub-agents parallel |
| 3 | [Consolidation & Fix Plan](phase-03-consolidation-fix-plan.md) | completed | ~15 min (~10 min actual) | em (main) |

**Total wall time: ~65 min planned / ~30 min actual | Token budget: ~150K**

## Scope

### In Scope
- 8 pages × 2 viewports (mobile 375 + desktop 1280) = 16 baseline screenshots
- Visual + Layout, UX flow, Accessibility (WCAG AA), Performance (Core Web Vitals), Brand consistency
- Lighthouse local CLI (3 priority pages: home, sach, dat-hang)
- Lightweight competitor skim (Nhã Nam, Tiki sách) ~15 min
- Dummy order với prefix `[AUDIT-DUMMY]` để test verify success state
- Severity-ranked findings (P0-P3) + fix plan với effort estimate

### Out of Scope
- Apply code fixes (audit-only mode — anh review fix sau qua /ck:cook)
- Cross-browser test (chỉ Chromium qua Playwright)
- Real device test (chỉ DevTools emulation)
- Load test / stress test
- Backend Directus performance
- Implement dark mode (chỉ flag P3 missing)
- Deep competitor analysis

## Success Criteria

- [x] 16+ baseline screenshots captured, organized, named consistently (16 baseline + 6 interactive = 22 PNGs) — evidence: `screenshots/` dir with 22 files, naming pattern `{page}-{viewport}-{state}.png`
- [x] 3 findings docs (visual, a11y, perf) severity-ranked (28 visual + 18 a11y + 13 perf) — evidence: `findings-visual.md` line 2, `findings-a11y.md` line 2, `findings-perf.md` line 2
- [x] Top 10 P0/P1 findings có screenshot reference + fix recommendation (in README) — evidence: `README.md` "Top 10 Findings" table with Source column
- [x] fix-plan.md có effort (S/M/L) + impact (high/med/low) — evidence: `fix-plan.md` "Quick Wins" table cols 4-5, P0 section effort col
- [x] README executive summary đọc < 5 phút hiểu ngay — evidence: `README.md` "TL;DR" + "Lighthouse Scores" + "Top 10 Findings" sections
- [x] Quick-win section (high impact + low effort) — 12 QW items in fix-plan.md — evidence: `fix-plan.md` "Quick Wins" table rows QW-1 through QW-12

## Output Structure

```
plans/reports/audit-260504-2119-website-uiux/
├── README.md              # Executive summary, top 10, quick wins, severity matrix
├── screenshots/           # 16+ PNGs organized by page-viewport
├── lighthouse/            # JSON reports (home, sach, dat-hang)
├── findings-visual.md     # ui-ux-designer output
├── findings-a11y.md       # code-reviewer output
├── findings-perf.md       # debugger output
├── findings-competitor.md # benchmark notes
└── fix-plan.md            # Prioritized backlog với effort + impact
```

## Brand Baseline (reference cho all phases)

- **Colors:** primary navy `#1E2B4D`, accent gold `#C9A962`, secondary cream `#F8F6F3`
- **Fonts:** Inter (sans), Cormorant Garamond (serif), Dancing Script (script)
- **Lang:** vi-VN
- **Source:** `tailwind.config.ts` (chưa có brand-guidelines.md riêng)

## Severity Framework

| Sev | Definition | Fix urgency |
|---|---|---|
| **P0 Critical** | Phá conversion / a11y critical / broken | Ngay |
| **P1 High** | UX rõ tệ, perf dưới ngưỡng | 1-2 ngày |
| **P2 Medium** | Polish, brand consistency | Backlog |
| **P3 Low** | Nice-to-have (dark mode, microcopy, animation) | Optional |

## Risks

| Risk | Mitigation |
|---|---|
| Cloudflare bot block Playwright | Set realistic UA + viewport, fallback Chrome MCP |
| Test order pollute prod DB | Prefix `[AUDIT-DUMMY]`, anh xóa qua Directus sau |
| Sub-agents disagree | Em consolidate là source of truth, log conflict trong appendix |
| Vietnamese font render inconsistent | Screenshot 2 lần per viewport, verify diacritics |
| Token blow-up | Bounded prompts + scoped file lists per agent |

## Next Steps After Plan Approval

1. Anh review plan + 3 phase files
2. Em execute Phase 1 (Baseline Capture)
3. Spawn Phase 2 agents (parallel)
4. Em consolidate Phase 3
5. Anh review final report ở `plans/reports/audit-260504-2119-website-uiux/`
6. Anh quyết fix queue → em fix qua separate /ck:cook session

## Unresolved Questions

1. Cloudflare bot protection có block Playwright không? Em sẽ test trong Phase 1 → fallback nếu cần.
2. Dummy order cleanup window: bản ghi `[AUDIT]` để lại trong analytics có OK không?

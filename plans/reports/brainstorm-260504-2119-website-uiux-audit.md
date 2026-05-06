---
type: brainstorm
date: 2026-05-04 21:19
slug: website-uiux-audit
status: agreed
next: /ck:plan
---

# Brainstorm Summary — Website UI/UX Audit (sachcuahuy.com)

## Problem Statement

Anh muốn review + audit toàn bộ website sachcuahuy để tìm và fix UI/UX bugs + visual errors. Site đã launch (Phase 5 vừa xong: SEO, JSON-LD, sitemap, analytics, podcast). Cần health check toàn diện trước khi push thêm features hoặc marketing.

## Requirements (anh chốt)

| # | Requirement |
|---|---|
| R1 | Audit scope: Visual/Layout + UX flow + Accessibility + Performance + Brand consistency (full) |
| R2 | Environment: Production (sachcuahuy.com) |
| R3 | Devices: Mobile 375px (iPhone) + Desktop 1280px |
| R4 | Output: MD report + screenshots → anh review → em fix sau (audit-only mode) |
| R5 | Dark mode: flag P3 missing, không deep-audit |
| R6 | Test verify flow: tạo dummy order với prefix `[AUDIT]`, anh xóa sau |
| R7 | Lighthouse: local CLI từ máy anh |
| R8 | Benchmark: lightweight skim 1-2 competitor (Nhã Nam, Tiki sách), max 15min |
| R9 | Tool capture: Playwright (anh prefer over Chrome MCP) |

## Evaluated Approaches

### Approach A — Single-agent sequential
- Em tự đi từng page, lean & gọn
- Pros: Single source of truth, token thấp ~50K
- Cons: Sequential 1.5-2h, dễ bỏ sót khi mắt mỏi
- **Verdict:** Reject — full scope cần expertise đa chiều

### Approach B — Multi-agent parallel by concern (CHỌN)
- Em capture baseline → spawn 3 sub-agents: ui-ux-designer, code-reviewer, debugger
- Pros: Depth per concern, parallel ~45min wall, mỗi agent expertise riêng
- Cons: Token ~150K, em phải merge findings cẩn thận
- **Verdict:** ✅ Approved

### Approach C — Tool-driven (Lighthouse + axe focus)
- Heavy tool usage, em chỉ interpret
- Pros: Hard metrics, ít subjective
- Cons: Bỏ sót visual/UX bugs, taste, brand voice
- **Verdict:** Reject — pure metrics không cover full scope

## Final Solution

**Approach B + Playwright + Lighthouse local + Lightweight competitor benchmark**

### Phase Plan (3 phases)

```
Phase 1: Baseline Capture (~20 min, em làm)
  ├── Playwright screenshot 8 pages × 2 viewports = 16 PNGs
  ├── Capture interactive states (form errors, hover, modals)
  ├── Lighthouse 3 pages (home, sach, dat-hang)
  ├── POST dummy order [AUDIT] → get token → screenshot success state
  └── Skim 2 competitor sites for UX patterns

Phase 2: Multi-agent Audit (~30 min wall, parallel)
  ├── ui-ux-designer  → screenshots → findings-visual.md
  ├── code-reviewer   → src/ → findings-a11y.md
  └── debugger        → lighthouse JSON → findings-perf.md

Phase 3: Consolidation (~15 min, em làm)
  ├── Merge 3 findings → severity matrix
  ├── De-dup overlap
  ├── Build fix-plan.md (P0/P1/P2/P3 + effort estimate)
  └── README executive summary (top 10 + quick wins)
```

### Pages × Viewports Matrix

| Page | Mobile 375 | Desktop 1280 |
|---|---|---|
| `/` Home | ✓ | ✓ |
| `/sach` Listing | ✓ | ✓ |
| `/sach/[slug]` × 2 books | ✓ | ✓ |
| `/dat-hang` Order form | ✓ | ✓ |
| `/xac-nhan/[token]` (success + error) | ✓ | ✓ |
| `/podcast` Coming soon | ✓ | ✓ |
| `/gioi-thieu` About | ✓ | ✓ |
| `/404` Not found | ✓ | ✓ |

**Total: 16 baseline screenshots + interactive state captures**

### Severity Framework

| Sev | Definition | Fix urgency |
|---|---|---|
| P0 Critical | Phá conversion / a11y critical / broken | Ngay |
| P1 High | UX rõ tệ, perf dưới ngưỡng | 1-2 ngày |
| P2 Medium | Polish, brand consistency | Backlog |
| P3 Low | Nice-to-have (incl. dark mode) | Optional |

### Output Structure

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

## Implementation Considerations

### Brand Baseline (em sẽ refer)
- **Colors:** primary navy `#1E2B4D`, accent gold `#C9A962`, secondary cream `#F8F6F3`
- **Fonts:** Inter (sans), Cormorant Garamond (serif), Dancing Script (script)
- **Lang:** vi-VN
- **Source of truth:** `tailwind.config.ts` (chưa có brand-guidelines.md riêng)

### Test Data Strategy
- Dummy order POST `/api/orders` với `name: "[AUDIT-DUMMY] Test"`, `phone: "0900000000"`
- Capture token from response → audit `/xac-nhan/{token}` success state
- Anh sẽ xóa qua Directus admin sau khi audit xong

### Sub-agent Bounded Prompts
Mỗi agent nhận:
- Specific scope + file list (no full repo dump)
- Output path (findings-{type}.md)
- Severity framework
- Brand baseline reference
- Instruction: "Sacrifice grammar for concision"

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Test order pollute prod DB | Prefix `[AUDIT-DUMMY]` + anh xóa sau |
| Playwright headless render khác real | Sample 1-2 với `--headed` để verify |
| 3 sub-agents disagree | Em consolidate là source of truth, log conflict |
| Vietnamese font rendering | Screenshot 2 lần per viewport, verify diacritics |
| Token blow-up | Bounded prompts + scoped file lists + pre-screen dup |
| Site bị Cloudflare block headless Playwright | Set realistic UA + viewport, fallback to Chrome MCP nếu cần |

## Success Criteria

- ✅ 16+ baseline screenshots captured, named consistently
- ✅ 3 findings docs (visual, a11y, perf) severity-ranked
- ✅ Top 10 P0/P1 findings có screenshot reference + fix recommendation
- ✅ fix-plan.md có effort (S/M/L) + impact (high/med/low)
- ✅ README executive summary đọc < 5 phút hiểu ngay
- ✅ Quick-win section (high impact + low effort)

## Out of Scope

- ❌ Apply code fixes (audit-only)
- ❌ Cross-browser test (chỉ Chromium)
- ❌ Real device test (chỉ DevTools emulation)
- ❌ Load test / stress test
- ❌ Backend Directus performance audit
- ❌ Implementing dark mode (chỉ flag P3 missing)
- ❌ Deep competitor analysis (chỉ skim cho UX patterns)

## Next Steps

1. Fire `/ck:plan` với context này → tạo plan ở `plans/260504-2119-website-uiux-audit/` với 3 phase files
2. Anh review plan
3. Em execute Phase 1 (capture) → Phase 2 (3 agents parallel) → Phase 3 (consolidate)
4. Anh review final report → quyết fix queue
5. Em fix theo batch (separate session với /ck:cook)

## Unresolved Questions

1. **Cloudflare bot protection:** Production có Cloudflare front, có thể block Playwright headless. Em sẽ test trong Phase 1 → fallback options nếu bị block.
2. **Dummy order cleanup window:** Sau khi anh xóa qua Directus, có cần xóa tracking trong analytics không? Hay để 1 bản ghi `[AUDIT]` cũng OK?
3. **Competitor selection:** Em chọn Nhã Nam + Tiki sách section. Nếu anh có site khác muốn benchmark, flag trước Phase 1.

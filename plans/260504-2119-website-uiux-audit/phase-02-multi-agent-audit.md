---
phase: 2
title: "Multi-Agent Audit"
status: completed
priority: P1
effort: "30 min wall (parallel)"
dependencies: [1]
---

# Phase 2: Multi-Agent Audit (3 sub-agents parallel)

## Overview

Spawn 3 sub-agents PARALLEL với scoped, bounded prompts để audit 3 concerns khác nhau. Mỗi agent chạy in own context (200K each), output vào file riêng. Em (main) chỉ orchestrate, không tham gia audit.

## Requirements

### Functional
- Spawn 3 agents trong 1 message (parallel execution)
- Mỗi agent có scoped prompt: brand baseline + severity framework + output path + scope boundary
- Outputs:
  - `findings-visual.md` — visual + UX bugs
  - `findings-a11y.md` — WCAG violations + semantic issues
  - `findings-perf.md` — Core Web Vitals + bundle + image opt
- Mỗi finding có: severity (P0-P3), category, file/screenshot reference, root cause, fix recommendation

### Non-functional
- Wall time: ~30 min (parallel)
- Each agent token budget: ~50K input + ~10K output = 60K per agent
- Total: 3 × 60K = 180K but parallel context isolation
- No cross-agent communication
- Agents READ-ONLY (không edit code, không touch screenshots)

## Architecture

```
Em (main, 1 message với 3 Agent calls parallel)
   │
   ├─► Agent 1: ui-ux-designer
   │      Input: screenshots/*.png + brand baseline
   │      Output: findings-visual.md
   │      Scope: visual bugs, layout, spacing, brand drift, UX flow
   │
   ├─► Agent 2: code-reviewer
   │      Input: src/ + screenshots/ for context
   │      Output: findings-a11y.md
   │      Scope: WCAG AA, semantic HTML, ARIA, keyboard, focus, alt text
   │
   └─► Agent 3: debugger
          Input: lighthouse/*.json + prod URLs
          Output: findings-perf.md
          Scope: LCP/CLS/INP, bundle size, render-blocking, image opt
```

## Related Code Files

### Create (by sub-agents)
- `plans/reports/audit-260504-2119-website-uiux/findings-visual.md`
- `plans/reports/audit-260504-2119-website-uiux/findings-a11y.md`
- `plans/reports/audit-260504-2119-website-uiux/findings-perf.md`

### Read (by sub-agents)
- `plans/reports/audit-260504-2119-website-uiux/screenshots/` (all PNGs)
- `plans/reports/audit-260504-2119-website-uiux/lighthouse/*.json` (perf only)
- `tailwind.config.ts` (brand baseline)
- `src/app/`, `src/components/` (a11y agent only)
- `src/app/layout.tsx`, `src/app/globals.css` (a11y agent)

### Modify
- None (audit-only)

## Implementation Steps

### Step 1 — Pre-spawn validation

Em verify Phase 1 outputs đầy đủ:
- [ ] 16+ screenshots ở `screenshots/`
- [ ] 3 Lighthouse JSONs ở `lighthouse/`
- [ ] `baseline-manifest.md` exists
- [ ] `findings-competitor.md` exists (em viết Phase 1)

Nếu thiếu → fix Phase 1 trước khi spawn.

### Step 2 — Spawn 3 agents trong 1 message

Em invoke 3 Agent calls đồng thời (single message, multiple `Agent` tool blocks).

#### Agent 1: ui-ux-designer

```
Subagent type: ui-ux-designer
Description: Audit visual + UX bugs

Prompt:
You are auditing screenshots of sachcuahuy.com (Vietnamese book sales site).
Work context: /Users/pu/Documents/Playground/sachcuahuy
Reports: /Users/pu/Documents/Playground/sachcuahuy/plans/reports/audit-260504-2119-website-uiux/
Plans: /Users/pu/Documents/Playground/sachcuahuy/plans/

INPUTS to read:
- All PNG files in {reports}/screenshots/ (mobile 375 + desktop 1280)
- {reports}/baseline-manifest.md (file inventory)
- {reports}/findings-competitor.md (competitor UX patterns)

BRAND BASELINE (must reference):
- Colors: navy #1E2B4D, gold #C9A962, cream #F8F6F3
- Fonts: Inter (sans), Cormorant Garamond (serif), Dancing Script (script)
- Lang: vi-VN
- Source: tailwind.config.ts

SCOPE (your audit):
1. Visual bugs: overflow, broken layout, alignment, spacing inconsistency
2. Typography: hierarchy, line-height, readability, diacritic rendering
3. Color: contrast issues, brand color drift, hover/active states
4. Mobile responsiveness: touch targets, horizontal scroll, overlap
5. UX flow: home→sach→detail→dat-hang→xac-nhan friction points
6. CTA clarity: visibility above fold, action verbs, conversion path
7. Brand consistency: across pages, font usage, color application
8. Microcopy: tone, error messages, empty states

NOT YOUR SCOPE: a11y (other agent), performance (other agent), code quality.

SEVERITY:
- P0: Phá conversion / broken layout / unreadable
- P1: UX rõ tệ, friction cao
- P2: Polish, brand consistency
- P3: Nice-to-have

OUTPUT: Write to {reports}/findings-visual.md với structure:

## Top Findings (severity-ranked)

### [P0/P1/P2/P3] [Category] Title
- **Page:** /path
- **Viewport:** mobile/desktop/both
- **Screenshot:** screenshots/NN-page-viewport.png
- **Issue:** What's wrong
- **Why it matters:** Impact on user
- **Recommendation:** Specific fix
- **Effort:** S/M/L

(Repeat for each finding)

## Quick Wins (high impact + low effort)
- List 3-5

## Brand Consistency Notes
- Cross-page observations

REQUIREMENTS:
- Sacrifice grammar for concision
- Reference specific screenshot files
- Be brutal honest, không sugarcoat
- Min 15 findings, max 40 (focus quality over quantity)
- Status report: DONE | DONE_WITH_CONCERNS | BLOCKED at end
```

#### Agent 2: code-reviewer

```
Subagent type: code-reviewer
Description: Audit a11y + semantic HTML

Prompt:
You are auditing accessibility + semantic HTML of sachcuahuy.com source code.
Work context: /Users/pu/Documents/Playground/sachcuahuy
Reports: /Users/pu/Documents/Playground/sachcuahuy/plans/reports/audit-260504-2119-website-uiux/
Plans: /Users/pu/Documents/Playground/sachcuahuy/plans/

INPUTS to read:
- src/app/ (all .tsx files, especially layout.tsx, page.tsx)
- src/app/globals.css
- src/components/ (all .tsx files)
- tailwind.config.ts (color tokens for contrast check)
- {reports}/screenshots/ (visual reference for context)

SCOPE (your audit):
1. WCAG AA compliance:
   - Color contrast ≥ 4.5:1 normal text, 3:1 large text + UI
   - Focus indicators visible
   - Keyboard navigation reach all interactive
2. Semantic HTML:
   - Proper landmarks (header, main, nav, footer)
   - Heading hierarchy (h1 → h2 → h3, no skips)
   - Lists use ul/ol, not div
   - Form labels associated
3. ARIA:
   - Only when semantic HTML insufficient
   - aria-label, aria-labelledby, aria-describedby correct
   - role attributes accurate
4. Images:
   - Alt text descriptive (not "image")
   - Decorative images alt=""
   - Lazy loading sensible
5. Forms (`/dat-hang`):
   - Labels visible AND programmatically associated
   - Error messages announced (aria-live)
   - Required fields marked
   - Input types correct (tel, email)
6. Interactive elements:
   - Buttons vs links semantic
   - Touch targets ≥ 44×44px
   - Focus order logical

NOT YOUR SCOPE: visual taste (other agent), performance (other agent), backend logic.

SEVERITY:
- P0: Critical a11y violations (no keyboard access, contrast < 3:1, missing form labels)
- P1: Major (no focus indicator, missing alt, wrong heading order)
- P2: Best practice (could improve ARIA, label clarity)
- P3: Nice-to-have

OUTPUT: Write to {reports}/findings-a11y.md với structure:

## Top Findings (severity-ranked)

### [P0/P1/P2/P3] [Category] Title
- **File:** src/path/to/file.tsx:line
- **Page:** /path (where surfaces)
- **Issue:** What's wrong (with code snippet)
- **WCAG ref:** SC X.Y.Z
- **Recommendation:** Specific fix với code example
- **Effort:** S/M/L

(Repeat for each finding)

## Contrast Audit Table
| Element | FG | BG | Ratio | WCAG | Pass? |
|---|---|---|---|---|---|

## Quick Wins
- List 3-5

REQUIREMENTS:
- Sacrifice grammar for concision
- Reference exact file:line
- Cite WCAG SC numbers
- Min 10 findings, max 30
- Status report: DONE | DONE_WITH_CONCERNS | BLOCKED at end
```

#### Agent 3: debugger

```
Subagent type: debugger
Description: Audit performance + Core Web Vitals

Prompt:
You are auditing performance of sachcuahuy.com production.
Work context: /Users/pu/Documents/Playground/sachcuahuy
Reports: /Users/pu/Documents/Playground/sachcuahuy/plans/reports/audit-260504-2119-website-uiux/
Plans: /Users/pu/Documents/Playground/sachcuahuy/plans/

INPUTS:
- {reports}/lighthouse/home.json
- {reports}/lighthouse/sach.json
- {reports}/lighthouse/dat-hang.json
- src/app/layout.tsx (font loading strategy)
- src/lib/directus-assets.ts (image asset URLs)
- src/components/home/*.tsx (above-fold content)
- next.config.ts (image config)
- package.json (deps)

SCOPE (your audit):
1. Core Web Vitals:
   - LCP target < 2.5s (good), 4s (poor)
   - CLS target < 0.1
   - INP target < 200ms
2. Loading performance:
   - First Contentful Paint
   - Time to Interactive
   - Render-blocking resources
3. Asset optimization:
   - Image sizing, format (WebP/AVIF), lazy loading
   - Font loading (FOIT vs FOUT, font-display)
   - JS bundle size, code splitting
4. Network:
   - HTTP/2 usage, caching headers
   - CDN usage (Vercel + Directus assets)
   - Compression (gzip/brotli)
5. Next.js specific:
   - SSR vs SSG vs ISR usage
   - `next/image` proper use
   - `next/font` proper use
   - Server Components leveraged?
6. Third-party:
   - Vercel Analytics + Speed Insights overhead
   - External fonts (Google Fonts)

NOT YOUR SCOPE: visual (other agent), a11y (other agent), code style.

SEVERITY:
- P0: Lighthouse perf score < 50, LCP > 4s, CLS > 0.25
- P1: Score 50-89, LCP 2.5-4s, CLS 0.1-0.25
- P2: Score 90+ but room to improve
- P3: Micro-optimization

OUTPUT: Write to {reports}/findings-perf.md với structure:

## Lighthouse Scores Summary
| Page | Perf | A11y | BP | SEO | LCP | CLS | INP |
|---|---|---|---|---|---|---|---|

## Top Findings (severity-ranked)

### [P0/P1/P2/P3] [Category] Title
- **Page:** /path (which page affected)
- **Metric:** LCP/CLS/INP/Bundle/Image/etc.
- **Current:** value
- **Target:** value
- **Root cause:** technical reason
- **Recommendation:** Specific fix với code/config example
- **Effort:** S/M/L
- **Expected gain:** estimate

(Repeat for each finding)

## Bundle Analysis
- Top 5 largest assets
- Code-split opportunities

## Quick Wins
- List 3-5

REQUIREMENTS:
- Sacrifice grammar for concision
- Reference Lighthouse audit IDs
- Provide concrete fix recommendations với example
- Min 10 findings, max 25
- Status report: DONE | DONE_WITH_CONCERNS | BLOCKED at end
```

### Step 3 — Wait for all 3 agents complete

Em đợi 3 agents trả results. Kiểm tra:
- All 3 output files exist
- Each has proper structure (sections, frontmatter)
- Status reports = DONE (not BLOCKED)

Nếu agent trả BLOCKED hoặc NEEDS_CONTEXT → provide context → re-spawn that one agent only.

### Step 4 — Sanity check

Em quick scan 3 finding files:
- Total findings count: expect 35-95 across 3 agents
- No agent returned 0 findings (red flag — re-spawn nếu có)
- Severity distribution reasonable (không phải all P3)
- Cross-references work (file:line, screenshot paths exist)

## Success Criteria

- [x] 3 agent calls fired in single message (verified parallel via tool call inspection)
- [x] All 3 returned DONE status
- [x] `findings-visual.md` exists, ≥ 15 findings, severity-ranked (28 findings)
- [x] `findings-a11y.md` exists, ≥ 10 findings, WCAG cited (18 findings + contrast table + form audit)
- [x] `findings-perf.md` exists, ≥ 10 findings, metrics cited (13 findings + LCP element analysis)
- [x] No agent token timeout (all DONE)
- [x] Cross-references valid (file:line, screenshot paths)

Note: 3 agents returned findings inline + write-to-file requests. Em wrote 3 files manually from agent outputs (per agent fallback pattern).

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Agent timeout (50K+ input) | Bounded scope, em pre-screen file lists, screenshot count manageable |
| Agent miss-fire (returns code instead of audit) | Explicit "READ-ONLY, write only output file" trong prompt |
| 3 agents disagree on overlap | Em consolidate ở Phase 3, log conflict |
| Agent returns 0 findings | Re-spawn với "be more critical" hint |
| Image read fails (sub-agent can't view PNGs) | ui-ux-designer agent should support image read; verify in agent docs trước |

## Notes

- Critical: spawn 3 agents trong 1 message để parallel (multiple Agent tool blocks trong 1 response)
- Each agent has independent 200K context
- Em (main) chỉ pay token cost cho prompts + return summaries (~10K each = 30K total)
- Agent results visible chỉ ở final return, not during execution

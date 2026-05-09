# Brainstorm — Sách Của Huy: Design System Extraction → Claude Design → Pencil Pipeline

**Date:** 2026-05-08
**Branch:** `main` (production live)
**Status:** Approved approach, ready for `/ck:plan` (Phase 1)
**Stakeholder:** @pu (Phu Du Hung)

---

## 1. Problem Statement

Website `sachcuahuy.com` vừa deploy production. Cần thiết kế pipeline dài hạn để:
1. Extract design system hiện có (token + components) từ codebase live
2. Cho phép user dùng **Claude Design** (Anthropic Labs, ra mắt 17/4/2026) để explore & improve UI
3. Build Pencil UI mirror 1:1 site live làm visual contract + design archive
4. Setup hybrid maintenance loop để code/Pencil/Claude Design không drift theo thời gian

**Constraints:**
- Stack: Next.js 15.1 + React 19 + Tailwind 3 + Framer Motion + Directus CMS
- Design language hiện tại: navy/terracotta/cobalt + Cormorant/Inter/Dancing Script + watercolor/paper aesthetic
- Bilingual font requirement: Vietnamese diacritics
- Pencil MCP runs main session only, drops every 15-20 ops (per global rules)
- Claude Design beta: save errors, performance lag với large codebases

**Success criteria:**
- Single source of truth cho design tokens (file-based, machine-readable)
- 7 screens × 2 viewports trong Pencil khớp screenshot live site within ±2px
- Workflow doc rõ ràng để future contributor maintain được
- Không vendor lock với Claude Design (export local)

---

## 2. Research Summary

### Claude Design (Anthropic Labs)
- Auto extract design system từ codebase + design files trong onboarding
- Inputs: text, screenshots, code repo, design docs (DOCX/PPTX/XLSX)
- Outputs: ZIP, PDF, PPTX, Canva, **standalone HTML**, **handoff bundle to Claude Code**
- Iteration: chat (broad) + inline comments (component-level)
- Limitations: comment persistence bugs, save errors compact view, lag on large codebases
- **Implication**: vẫn cần local design system docs để feed Pencil + protect against vendor lock

### Pencil Code↔Design (NEW finding)
- **Native Code → Design support** qua MCP với AI prompts:
  - `"Recreate the Header from src/components/layout/header.tsx"`
  - `"Create Pencil variables from src/app/globals.css and tailwind.config.ts"`
  - `"Import design tokens from src/styles/tokens.css"`
- Yêu cầu: `.pen` file ở SAME workspace với code (AI thấy cả 2)
- Two-way sync built-in: import code → design changes → sync back to code
- Built-in icons: Material Symbols, Lucide (match repo's `lucide-react`), Feather, Phosphor
- **Pencil CLI** (`@pencil.dev/cli`) cho batch/CI ops, headless export PNG/JPEG/WEBP/PDF
- **Implication**: Phase 2 build tự động hóa được phần lớn, không phải build từng component thủ công

---

## 3. Approaches Evaluated

### A) Manual Pencil Build (rejected)
- Build từng frame thủ công bằng Pencil MCP `batch_design`
- Pros: full control
- Cons: chậm, fragile khi MCP drop, không tận dụng Code↔Design native
- ❌ Reject: tận dụng Pencil's native code import nhanh hơn 5x

### B) Pencil-Only (no Claude Design)
- Skip Claude Design layer, dùng Pencil MCP G() generate AI variations
- Pros: ít vendor dependency
- Cons: Pencil G() không mạnh = exploration limited; Claude Design thiết kế cho ideation
- ❌ Reject: user explicitly muốn dùng Claude Design

### C) Code-First + Claude Design Sandbox + Pencil Mirror (chosen ✅)
- Tokens code-as-truth (`design-tokens.json` từ Tailwind)
- Claude Design = exploration sandbox (không phải SoT)
- Pencil = visual contract + handoff archive (mirror code 1:1)
- Hybrid maintenance: code first cho tweaks, Pencil/Claude Design first cho new features
- ✅ Match user preferences (code-as-truth + 1:1 fidelity + hybrid maintenance)

---

## 4. Final Solution — 5 Phases

### Phase 1 — Design System Extraction (1-2 days)

**Output artifacts:**
- `docs/design-system.md` — tokens (colors, fonts, spacing, radii, shadows, motion), patterns (watercolor wash, paper texture, hand-drawn dividers, signature flourish)
- `docs/component-inventory.md` — component catalog với props/variants/usage
- `docs/screen-snapshots/{route}-{viewport}.png` — full-page captures (7 routes × 2 viewports = 14 PNGs)
- `assets/design-tokens.json` — machine-readable tokens (single source of truth)

**Method:**
- Audit `tailwind.config.ts` + `src/app/globals.css` + tất cả `src/components/**`
- Capture screenshots: Playwright/Chrome MCP từ live site `sachcuahuy.com`
- Generate `design-tokens.json` qua script đọc Tailwind config (W3C Design Tokens format optional)

**Routes to capture:** `/`, `/sach`, `/sach/[slug]` (1 sample), `/gioi-thieu`, `/podcast`, `/dat-hang`, `/xac-nhan`

### Phase 2 — Pencil v1 (1:1 Mirror) (2-3 days với Code→Design native)

**Output:** `designs/sachcuahuy.pen` ở workspace root (same level với `package.json`)

**Method:**
1. Tạo `.pen` file: `pencil --out designs/sachcuahuy.pen --prompt "Empty canvas, A3 landscape"` HOẶC desktop app
2. **Variables import**: prompt Pencil AI:
   ```
   Create Pencil variables from src/app/globals.css and tailwind.config.ts.
   Group by: colors (primary/secondary/accent/cobalt/cream/paper),
   fonts (Cormorant/Inter/Dancing Script), shadows (book), motion.
   ```
3. **Component recreation** (1 prompt per component):
   ```
   Recreate the Header component from src/components/layout/header.tsx as a reusable Pencil component.
   ```
   Repeat cho: Footer, HeroSection, AuthorSection, BooksSection, CTASection, FeaturesSection, BookCard, các UI primitives.
4. **Screen composition**: compose components thành 7 frames:
   - Home, /sach catalog, /sach detail, /gioi-thieu, /podcast, /dat-hang, /xac-nhan
   - Mỗi frame có 2 variants: desktop 1440 + mobile 375
   - Total: 14 screen frames + ~10 reusable components
5. **Verify against snapshots**: cho mỗi frame, `get_screenshot` từ Pencil so sánh với `docs/screen-snapshots/`. Sai >2px → fix.
6. **Export**: `export_nodes` PNG mỗi frame to `designs/exports/`

**Pencil MCP guardrails (mandatory):**
- Read PNG snapshot TRƯỚC khi build mỗi frame
- Max 15-20 ops/batch
- 1 G() per batch
- `get_screenshot` sau mỗi major section
- Main session only (subagent không dùng được Pencil MCP)
- Re-`open_document` sau bất kỳ MCP error nào

### Phase 3 — Claude Design Onboarding (1 day)

**Output artifacts:**
- Claude Design project link với GitHub repo `sachcuahuy`
- `docs/claude-design-workflow.md` — playbook khi nào dùng + export pipeline
- 1 export thử nghiệm: Home page → so sánh với live + Pencil v1

**Method:**
1. Tạo project trong Claude Design Labs (Pro/Max/Team subscription)
2. Connect GitHub repo → trigger auto design system extraction
3. Diff design system Claude Design extract vs `design-tokens.json` → document discrepancies
4. Test export pipeline: 1 page Home qua các format (HTML, ZIP, handoff bundle)
5. Document rules of engagement: khi nào explore via CD, khi nào skip

**Risk mitigation cho Claude Design beta bugs:**
- Save artifacts local mỗi session (không phụ thuộc cloud-only persistence)
- Snapshot prompts/comments vào `docs/claude-design-experiments/` cho audit trail

### Phase 4 — Hybrid Maintenance Playbook (0.5 day docs)

**Output:** `docs/design-maintenance-playbook.md`

**Change router:**

| Change type | Start at | Sync target | Cadence |
|---|---|---|---|
| Spacing/color tweak | Code | Pencil | Within 1 week |
| Bug fix UI | Code | Pencil | Next batch sync |
| New page/feature | Pencil first → CD explore → Code | All 3 | Same PR |
| Major redesign | CD explore → Pencil contract → Code | All 3 | Same PR |
| Token change | `design-tokens.json` first | Tailwind + Pencil vars | Mandatory same PR |

**Sync rituals:**
- Weekly: run `scripts/screenshot-diff.cjs` → flag drift
- Per PR with UI changes: checklist requires Pencil update or explicit "Pencil drift accepted, ticket #X"
- Monthly: run Pencil refresh batch nếu drift accumulated

### Phase 5 — Tooling & Validation (1 day)

**Scripts:**
- `scripts/sync-design-tokens.cjs` — đọc Tailwind config + globals.css → generate `assets/design-tokens.json` (W3C format)
- `scripts/screenshot-diff.cjs` — Playwright capture live + Pencil exports → diff PNG (pixelmatch), output report
- `scripts/pencil-refresh.cjs` (optional) — wrapper Pencil CLI batch refresh frames từ component changes

**CI hooks:**
- Pre-commit: `sync-design-tokens.cjs --check` (fail if Tailwind ≠ tokens.json)
- PR check (manual): visual diff comment if `screenshot-diff.cjs` exceeds threshold

**Documentation home:**
- `docs/design/README.md` — entrypoint cho all design docs
- Cross-links: design-system.md, component-inventory.md, claude-design-workflow.md, maintenance-playbook.md

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Pencil MCP drops mid Phase 2 | High | Medium | Small batches, frequent state check, export per frame |
| Claude Design save errors / lag | Medium | Medium | Local artifact backup, không cloud-only dependency |
| Token drift Tailwind ↔ Pencil ↔ CD | High | High | `design-tokens.json` SoT + sync script + pre-commit check |
| 1:1 fidelity miss >2px | Medium | Low | Mandatory screenshot diff, fix loop in Phase 2 |
| Vietnamese diacritics render lỗi Pencil | Low | High | Verify Cormorant + Inter glyph coverage upfront, fallback Noto Serif/Sans VN nếu cần |
| Pencil CLI auth complexity (CI) | Low | Low | Defer CI integration to Phase 5+, dùng interactive login Phase 1-3 |
| Claude Design vendor lock-in | Low | High | Export local mỗi session; rules of engagement giới hạn dependency |
| Plan scope creep (6→8+ routes) | Medium | Medium | Boundary: Phase 2 v1 = 7 routes, additional routes = v2 plan |

---

## 6. Success Metrics

- **Phase 1**: 100% routes captured + 100% components inventoried + tokens.json passes lint
- **Phase 2**: Pencil exports khớp live screenshots within ±2px on 80%+ frames
- **Phase 3**: Claude Design extract khớp `design-tokens.json` ≥90% (color/font/spacing accuracy)
- **Phase 4**: Maintenance playbook approved + 1 dry-run change passes through workflow
- **Phase 5**: Sync scripts pass on existing codebase + 1 successful diff alert simulated

---

## 7. Implementation Considerations

**Order dependencies:**
- Phase 1 → Phase 2 (Pencil cần tokens + snapshots)
- Phase 2 → Phase 3 (Claude Design diff cần baseline Pencil)
- Phase 3, 4, 5 có thể parallel sau Phase 2

**Estimated total effort:**
- Phase 1: 1-2 days
- Phase 2: 2-3 days (with Code→Design native)
- Phase 3: 1 day
- Phase 4: 0.5 day
- Phase 5: 1 day
- **Total upfront: ~6-7.5 days**, then ongoing maintenance ~1-2 hours/week

**Critical decisions locked:**
- Source of truth: code-as-truth (Tailwind → `design-tokens.json` → Pencil/CD consume)
- Viewports: desktop 1440 + mobile 375 (skip tablet for v1)
- Fidelity: 1:1 mirror live site (not redesign)
- Maintenance: hybrid by change type (per change router table)

**Deferred decisions (revisit after Phase 1):**
- Tablet viewport addition (review after live analytics show traffic share)
- Pencil CLI CI/CD integration (defer to v2)
- Storybook integration (out of scope for v1)
- Multi-brand support (out of scope, single brand only)

---

## 8. Next Steps

**Immediate next action:** `/ck:plan` cho Phase 1 (Design System Extraction)
- Plan dir: `plans/260508-0839-design-system-extraction/`
- Phase 1 break thành sub-tasks: token audit, component inventory, screenshot capture, tokens.json generation

**After Phase 1 cook complete:** `/ck:plan` Phase 2 (Pencil v1)
- Sequential 7 sub-phases (1 per route) hoặc parallel components batch + screen batch

**Parallel tracks (after Phase 2):**
- Track A: Phase 3 Claude Design onboarding (user-led)
- Track B: Phase 4 + 5 tooling + playbook (Claude-led)

---

## 9. Unresolved Questions

1. ~~**Pencil license**~~: free tier có cover Code→Design AI prompts không, hay cần paid? Cần verify trước Phase 2.
2. ~~**Claude Design subscription**~~: → ✅ **RESOLVED** (Q&A 2026-05-08): anh có Claude Max — Claude Design Labs accessible
3. ~~**Live site CDN cache**~~: → ✅ **RESOLVED** (Q&A 2026-05-08): mitigate via `?_snapshot=${Date.now()}` query string trong Phase 4 capture script (Next.js không match cache key có query string lạ → SSR fresh)
4. **Tablet viewport**: confirmed skip cho v1, revisit sau Q3 nếu traffic shows tablet usage
5. ~~**Brand asset versions**~~: → ✅ **RESOLVED** (Q&A 2026-05-08): defer to follow-up plan `260508-XXXX-brand-asset-system`. Proposed structure: `assets/brand/{logo,textures,illustrations,photography}/` với version suffix filename (`-v1`, `-v2`) + manifest README. Master files (Illustrator/Affinity) lưu cloud, repo track outputs SVG/PNG only.
6. ~~**Directus mock data trong Pencil**~~: → ✅ **RESOLVED** (Q&A 2026-05-08): use Pencil G() với real source images + asset path manifest. Pattern saved as Pencil skill knowledge `~/.claude/skills/pencil/knowledge/06-dynamic-content-with-real-sources.md`. Implementation thuộc Phase 2 (Pencil v1 build) khi có thực hiện.
7. **Mobile interaction states**: hamburger menu open, podcast player active, checkout form filled — capture as separate frames hay skip cho v1? Defer to Phase 2 planning
8. **Design version tagging**: Pencil v1 = git tag `design-v1.0.0`? Defer to Phase 2 closeout

## 10. Resolutions Log (Q&A Round 2026-05-08 09:09)

| # | Question | Answer | Action |
|---|---|---|---|
| 1 | Pencil docs cần fetch hết | Crawled toàn bộ 18 trang (12K words) → `docs/pencil-docs/` | Plus prompt template `docs/pencil-prompts/prompt-template-code-to-pencil.md` |
| 2 | Claude Design subscription | Claude Max active | Claude Design Labs ready cho Phase 3 |
| 3 | CDN cache stale | Sử dụng cache-bust query string `?_snapshot={timestamp}` | Phase 4 script implements |
| 4 | Brand assets versioning | Proposal accepted, defer to separate plan | New plan after Phase 1 cook |
| 5 | Directus mock data | Pencil G() với real source images + asset manifest tracking | Pattern saved to Pencil skill knowledge file 06 |

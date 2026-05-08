---
title: "Directus Page Editor Module"
description: "Vue 3 Directus extension providing page-based content editing UI for Huy"
status: complete
priority: P2
created: 2026-05-08
effort: "10h"
brainstorm: "../reports/brainstorm-260508-1328-directus-page-editor.md"
relatedPlan: "260504-1316-directus-vietnamese-cms"
---

# Directus Page Editor Module

## Overview

Build a custom Directus Module extension that replaces collection-based navigation with a page-based UI for Huy (non-tech content editor). Instead of navigating to `site_settings` or `books` collections, Huy sees tabs for "Trang Chủ", "Sách", "Giới Thiệu", "Cài Đặt" with only the relevant fields for each page.

**Context:**
- Brainstorm: `plans/reports/brainstorm-260508-1328-directus-page-editor.md`
- Content Map: `docs/content-map.md`
- Related: `260504-1316-directus-vietnamese-cms` (completed - Vietnamese labels)

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Setup Extension Dev Environment](./phase-01-setup-extension-dev-environment.md) | Complete | 2h |
| 2 | [Build Page Tabs UI](./phase-02-build-page-tabs-ui.md) | Complete | 2h |
| 3 | [Build Form Components](./phase-03-build-form-components.md) | Complete | 4h |
| 4 | [Deploy and Test](./phase-04-deploy-and-test.md) | Complete | 2h |

## Architecture

```
Directus Admin UI
├── Sidebar
│   ├── Content (default)
│   └── 📝 Quản Lý Nội Dung ← NEW MODULE
│
└── Module View (when clicked)
    ├── Tab Bar: [Trang Chủ] [Sách] [Giới Thiệu] [Cài Đặt]
    └── Form Panel (per tab)
        ├── Field groups with Vietnamese labels
        ├── Save button
        └── Success/error toast
```

## Technical Stack

- **Directus Extensions SDK** `@directus/extensions-sdk`
- **Vue 3** Composition API
- **Directus API** REST via `useApi()` composable
- **Target Directus**: v11.x (pinned)

## Dependencies

- Directus 11 running at `cms.sachcuahuy.com`
- SSH access to Contabo (`ssh goclaw`)
- Node.js 18+ on dev machine

## Success Criteria

- [ ] Module appears in Directus sidebar as "Quản Lý Nội Dung"
- [ ] Huy can edit hero tagline from Page Editor without touching raw collections
- [ ] Huy can add/edit books with cover image upload
- [ ] All UI labels in Vietnamese
- [ ] Page loads <2s
- [ ] Huy onboarding complete (can self-serve daily edits)

## Validation Log

### Session 1 — 2026-05-08

**Verification Results:**
- Tier: Standard (4 phases)
- Claims checked: 12
- Verified: 12 | Failed: 0 | Unverified: 0

**Decisions Confirmed:**

| Question | Decision | Rationale |
|----------|----------|-----------|
| Orders access in Page Editor | Keep separate | Page Editor = content only. Orders stay in raw Directus. |
| Rich text editor for author_bio | Directus WYSIWYG | Use built-in `v-wysiwyg`. Consistent, less code. |
| Preview site button | No | Keep simple. Huy can open site manually. |

**Scope Confirmed:**
- 4 tabs only: Trang Chủ, Sách, Giới Thiệu, Cài Đặt
- No Orders tab
- No preview iframe
- Use Directus built-in components where possible

### Whole-Plan Consistency Sweep
- Files reread: plan.md, phase-01, phase-02, phase-03, phase-04
- Decision deltas checked: 3
- Reconciled stale references: 0
- Unresolved contradictions: 0

**Status:** ✅ Ready for implementation

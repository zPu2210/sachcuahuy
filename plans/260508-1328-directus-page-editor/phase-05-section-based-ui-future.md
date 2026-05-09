# Phase 05 — Section-Based UI (Future / Deferred)

**Status:** Deferred (revisit after 1-2 weeks of real usage)
**Created:** 2026-05-09

## Context

Phase 02-04 shipped tab-based UI: 4 top-level tabs (Trang Chủ / Sách / Giới Thiệu / Cài Đặt), each tab = single form. Works, deployed, anh edit được nội dung qua admin.

User raised question: should UI be section-based instead (Notion-style blocks / accordion / scroll-spy with multiple sections per page)?

## Decision: Defer

Reasons:
- Tab-based đã work → no urgency
- Section-based = layout + state + possibly schema refactor → large change, không nên chồng lên debug bundling còn fresh
- Chưa có usage data: nếu mỗi tab 3-5 field thì tab vẫn ổn. Nếu 1 trang 10+ section (hero/features/testimonials/CTA…) thì section-based mới worth
- YAGNI — không design UI cho use case tưởng tượng

## Trigger to Revisit

Một trong các signal sau:
- Anh feel "scroll qua scroll lại trong 1 tab mệt"
- Muốn xem/edit nhiều section cùng lúc
- Tab content vượt 1 màn hình + có structural grouping rõ ràng (hero, features, testimonials…)
- Cần reorder section hoặc toggle visibility per-section

## Possible Approaches (when revisited)

1. **Accordion within tab** — minimal change, mỗi tab thành list collapsible sections. State giữ nguyên.
2. **Side nav + scroll-spy** — tab → page với sidebar liệt kê sections, click scroll. Notion-like.
3. **Block-based editor** — sections là rows trong Directus collection, drag-drop reorder. Schema change required.

Option 1 = easiest, Option 3 = most flexible but biggest lift.

## Unresolved Questions

- Page schema: hiện mỗi page = 1 row trong Directus collection (singleton-ish) hay nhiều rows = nhiều sections? → check khi revisit
- Có cần section visibility toggle / schedule không?
- Mobile preview pane có cần không?

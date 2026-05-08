# Brainstorm: Directus Page Editor for Huy

Date: 2026-05-08  
Status: Ready for planning

---

## Problem Statement

Huy (content editor) finds Directus hard to use:
- Too many fields overwhelming
- Hard to navigate between collections
- English/missing Vietnamese labels
- Unclear which fields affect which pages

User also wants to update tagline from "Tản văn nhẹ nhàng về Sài Gòn..." to "Hành trình đến với Miền Nam, tuổi trẻ và những khoảnh khắc đáng nhớ".

---

## Requirements

1. **Immediate**: Update `site_settings.hero_subtitle` in Directus
2. **Short-term**: Build custom Page Editor module for Huy

---

## Evaluated Approaches

| Approach | Effort | UX Quality | Maintenance |
|----------|--------|------------|-------------|
| A. Custom Vue Module | 10h | ★★★★★ | Medium |
| B. Edit Guide + Vietnamese | 3h | ★★★☆☆ | Low |
| C. Simplified Huy Role | 2h | ★★☆☆☆ | Low |
| D. External Next.js /admin | 8h | ★★★★☆ | Higher |

**Selected: Approach A** — Full custom Directus Module.

---

## Final Solution: Page Editor Module

### Concept

Replace collection-based navigation with page-based UI:

```
┌──────────────────────────────────────────────────────┐
│ 🏠 Quản Lý Nội Dung                                  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  [Trang Chủ] [Sách] [Giới Thiệu] [Cài Đặt]          │
│                                                       │
│  ▼ Trang Chủ                                         │
│  ┌────────────────────────────────────────────────┐  │
│  │ Tiêu đề Hero                                   │  │
│  │ ┌──────────────────────────────────────────┐   │  │
│  │ │ Miền Nam của Huy                         │   │  │
│  │ └──────────────────────────────────────────┘   │  │
│  │                                                │  │
│  │ Mô tả ngắn                                     │  │
│  │ ┌──────────────────────────────────────────┐   │  │
│  │ │ Hành trình đến với Miền Nam...           │   │  │
│  │ └──────────────────────────────────────────┘   │  │
│  │                                                │  │
│  │                    [💾 Lưu]                    │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Technical Stack

- **Directus Extensions SDK** (`@directus/extensions-sdk`)
- **Vue 3 + Composition API**
- **Directus REST API** for CRUD
- Deploy to `/opt/directus-sachcuahuy/extensions/modules/page-editor/`

### Page Groups (from content-map.md)

1. **Trang Chủ**: `hero_title`, `hero_subtitle`, `author_short_bio`, `author_image`
2. **Giới Thiệu**: `author_bio`, social links
3. **Sách**: All `books.*` with quick-edit for price/stock
4. **Cài Đặt**: Bank info, shipping config, contact

### Implementation Tasks

| Task | Hours |
|------|-------|
| Extension scaffold + dev setup | 2h |
| Page selector tabs UI | 2h |
| Form components (4 pages × 3-5 fields) | 4h |
| Vietnamese labels + validation | 1h |
| Deploy + test on Contabo | 1h |
| **Total** | **10h** |

---

## Trade-offs

### Pros
- Exactly matches Huy's mental model (pages, not entities)
- 100% Vietnamese UI
- Hides complexity entirely
- Professional, polished experience

### Cons
- Requires Vue knowledge
- Tied to Directus version (test on upgrades)
- Must update when schema changes
- More moving parts than raw Directus

---

## Success Criteria

- [ ] Huy can edit hero tagline without asking for help
- [ ] Huy can add a new book with price and image
- [ ] All labels in Vietnamese
- [ ] No access to raw collections needed for daily editing
- [ ] Page loads <2s on cms.sachcuahuy.com

---

## Risks

| Risk | Mitigation |
|------|------------|
| Directus upgrade breaks extension | Pin Directus version, test before upgrades |
| Schema changes break module | Keep content-map.md updated; module reads field names |
| Huy needs fields not exposed | Add to module as needed (design for extensibility) |

---

## Deliverables

1. **Content Map**: `/docs/content-map.md` ✅ Created
2. **Page Editor Module**: Vue extension in `/opt/directus-sachcuahuy/extensions/modules/page-editor/`
3. **Tagline Update**: Change `hero_subtitle` in Directus

---

## Next Steps

1. Update tagline in Directus (quick fix)
2. Create implementation plan for Page Editor module
3. Scaffold extension locally, test, deploy

---

## Unresolved Questions

- Should Huy have access to Orders tab for status updates? (Currently editor role can update order_status)
- Do we need a preview button that shows live site in iframe?
- Should rich text editor (author_bio) use Directus's WYSIWYG or custom?

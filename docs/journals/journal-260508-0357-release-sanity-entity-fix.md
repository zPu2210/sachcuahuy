# Journal: Release Sanity + Entity Decoder Fix

**Date:** 2026-05-08 03:37–04:00  
**Branch:** main  
**Commits:** `99b0b092` → `67c10f21` → `0241420f`

## Session Summary

Release sanity check for 21-commit magical UI/UX overhaul stack, followed by production smoke and two bug fixes discovered during verification.

## Key Events

### 1. Release Sanity (21 commits)
- All pre-push checks green: `git diff --check`, `npm run lint`, `npm run build`
- No legacy gold tokens in codebase (only historical comment)
- Pushed `a86c45e4..99b0b092` to origin/main

### 2. Production Smoke Test
- All 7 routes pass (/, /sach, /sach/mien-nam-cua-huy, /gioi-thieu, /podcast, /dat-hang, mobile menu)
- JSON-LD verified: Book schema on detail page, Person schema on /gioi-thieu
- Mobile menu toggle: opens on click, closes on Esc, aria-expanded tracks state

### 3. Lighthouse Audit
| Page | Perf | A11y | BP | SEO |
|------|------|------|-----|-----|
| `/` | 89 | 100 | 100 | 100 |
| `/sach/mien-nam-cua-huy` | 83 | 96 | 100 | 100 |

A11y 96% cause: `text-gray-500` on cream background = 4.48:1 (needs 4.5:1)

### 4. Fixes Applied

**Commit `67c10f21` — Contrast + Entity Decoder**
- `text-gray-500` → `text-gray-600` on book detail meta/labels
- Added Vietnamese named entities to htmlToParagraphs (oacute, agrave, etc.)
- Decode loop for double-encoded content from Directus

**Commit `0241420f` — Entity Decode Order + More Entities**
- Moved entity decode BEFORE tag strip to prevent `&lt;p&gt;` → `<p>` showing as raw text
- Added missing Vietnamese entities: ă/Ă, ơ/Ơ, ư/Ư, đ/Đ

## Manual Actions Pending

| Task | Location |
|------|----------|
| Update contact_email to `demtamsutronghuy@gmail.com` | Directus site_settings |
| Delete QA orders IDs 12-15 | Directus orders |

API token is scoped for order creation only — cannot perform admin operations.

## Technical Decisions

1. **Entity decode before tag strip** — Double-escaped HTML like `&lt;p&gt;` decodes to `<p>` which must be stripped. Decoding after strip would leave raw tags in output.

2. **Loop decode for multi-layer encoding** — Directus content has `&amp;oacute;` which needs two passes: `&amp;` → `&`, then `&oacute;` → `ó`.

3. **Partial named entity map** — Added common Vietnamese diacritics but not full HTML5 spec. Numeric entities cover edge cases. Acceptable trade-off vs importing a library.

## Verification

- Production Mô Tả Sách now renders Vietnamese correctly: "Nơi ấy có Mina và một mái nhà"
- Contrast fix brings book detail page to AA compliance

---

*Session: release sanity → production smoke → bug discovery → fix → verify → push*

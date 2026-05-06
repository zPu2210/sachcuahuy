---
type: audit-baseline-manifest
date: 2026-05-07 00:25 (Asia/Saigon)
phase: 1 (audit baseline capture)
---

# Baseline Capture Manifest

## Capture Setup

- **Tool:** Playwright 1.59 (chromium-1217 cached)
- **Site:** https://sachcuahuy.com (production)
- **Status:** No Cloudflare bot block, all pages 200 OK
- **Browser context:** Realistic UA, locale `vi-VN`, timezone `Asia/Ho_Chi_Minh`
- **Vietnamese diacritics:** Verified rendered correctly (sample: home hero "Sách Của Huy", "Trọng Huy", book titles "Miền Nam của Huy", "Góc Phần Tư")
- **Capture script:** `/tmp/playwright-audit-capture.mjs` + `/tmp/playwright-order-confirm-capture.mjs` (deleted after run)

## Screenshots — 16 baseline + 6 interactive = 22 total

### Baseline (`screenshots/`)

| # | File | Page | Viewport | Status |
|---|---|---|---|---|
| 01 | 01-home-mobile.png | / | 375×812 | 200 |
| 01 | 01-home-desktop.png | / | 1280×900 | 200 |
| 02 | 02-sach-listing-mobile.png | /sach | 375×812 | 200 |
| 02 | 02-sach-listing-desktop.png | /sach | 1280×900 | 200 |
| 03 | 03-sach-mien-nam-mobile.png | /sach/mien-nam-cua-huy | 375×812 | 200 |
| 03 | 03-sach-mien-nam-desktop.png | /sach/mien-nam-cua-huy | 1280×900 | 200 |
| 04 | 04-sach-goc-phan-tu-mobile.png | /sach/goc-phan-tu | 375×812 | 200 |
| 04 | 04-sach-goc-phan-tu-desktop.png | /sach/goc-phan-tu | 1280×900 | 200 |
| 05 | 05-dat-hang-mobile.png | /dat-hang | 375×812 | 200 |
| 05 | 05-dat-hang-desktop.png | /dat-hang | 1280×900 | 200 |
| 06 | 06-podcast-mobile.png | /podcast | 375×812 | 200 |
| 06 | 06-podcast-desktop.png | /podcast | 1280×900 | 200 |
| 07 | 07-gioi-thieu-mobile.png | /gioi-thieu | 375×812 | 200 |
| 07 | 07-gioi-thieu-desktop.png | /gioi-thieu | 1280×900 | 200 |
| 08 | 08-not-found-mobile.png | /non-existent-audit-test | 375×812 | 404 |
| 08 | 08-not-found-desktop.png | /non-existent-audit-test | 1280×900 | 404 |

### Interactive (`screenshots/interactive/`)

| # | File | State | Viewport |
|---|---|---|---|
| 01 | 01-dat-hang-validation-errors-desktop.png | Form submit empty → validation errors | 1280×900 |
| 02 | 02-dat-hang-validation-errors-mobile.png | Form submit empty → validation errors | 375×812 |
| 03 | 03-home-cta-hover-desktop.png | Home CTA hover | 1280×900 |
| 04 | 04-header-nav-hover-desktop.png | Header nav hover first link | 1280×900 |
| 05 | 05-xac-nhan-success-mobile.png | Order confirmation success state | 375×812 |
| 05 | 05-xac-nhan-success-desktop.png | Order confirmation success state | 1280×900 |

## Lighthouse — 3 priority pages (mobile, simulated)

Form factor: mobile, throttling: simulate 4G slow, headless Chrome

| Page | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | SI |
|---|---|---|---|---|---|---|---|---|---|
| / | **84** | 100 | 100 | 100 | 1.8s | **4.2s** | 0 | 30ms | 3.0s |
| /sach | **89** | 100 | 100 | 100 | 1.5s | **3.3s** | 0 | 200ms | 1.5s |
| /dat-hang | 92 | 100 | 100 | **58** | 1.5s | 3.0s | 0 | 30ms | 4.0s |

**Red flags:**
- Home **LCP 4.2s** = "Poor" tier (>4s threshold). Largest single perf issue.
- Home Perf **84** just dưới overhaul gate ≥85.
- /dat-hang SEO **58** — likely missing meta description / canonical / OG tags. Needs investigation.
- /sach TBT 200ms borderline (good ≤200ms boundary).
- Lighthouse a11y all 100 nhưng Lighthouse miss form labels semantics + ARIA detail — code-reviewer agent will dig deeper.

JSONs at `lighthouse/{home,sach,dat-hang}.json`.

## Dummy Order Cleanup ⚠️

**MUST DELETE manually qua Directus admin:**

- **Order code:** `SCH-260506-6774`
- **Order token:** `t458gvsbfeez2ztz`
- **Confirmation URL:** /xac-nhan/t458gvsbfeez2ztz
- **Customer name:** `[AUDIT-DUMMY] Test Audit`
- **Customer phone:** `0900000000`
- **Customer email:** `audit-dummy@test.local`
- **Item:** Góc Phần Tư × 1
- **Total:** 124,000 VND (99k book + 25k ship)

Anh delete ở Directus admin → Collections → orders → filter by `[AUDIT-DUMMY]` prefix.

## Capture Stats

- **Total wall time:** ~5 min (capture) + 2 min (Lighthouse 3 runs) + 1 min (order POST + confirm) = ~8 min
- **All captures:** 22/22 success, 0 failed
- **Script cleanup:** /tmp/playwright-*.mjs sẽ delete sau Phase 0 complete

## Outputs

```
plans/reports/audit-260504-2119-website-uiux/
├── screenshots/                # 16 baseline + interactive subdir
│   ├── 01-home-{mobile,desktop}.png
│   ├── 02-sach-listing-{mobile,desktop}.png
│   ├── ...
│   └── interactive/
│       ├── 01-dat-hang-validation-errors-{mobile,desktop}.png
│       ├── 03-home-cta-hover-desktop.png
│       ├── 04-header-nav-hover-desktop.png
│       └── 05-xac-nhan-success-{mobile,desktop}.png
├── lighthouse/
│   ├── home.json
│   ├── sach.json
│   └── dat-hang.json
├── baseline-manifest.md         # this file
└── findings-competitor.md       # competitor skim notes
```

## Unresolved (Phase 1)

- /dat-hang SEO 58 cần debug Phase 2 (debugger agent + code-reviewer agent split). Likely missing metadata.
- LCP 4.2s home root cause cần debugger agent identify.

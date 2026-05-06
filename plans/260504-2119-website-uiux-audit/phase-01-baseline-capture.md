---
phase: 1
title: "Baseline Capture"
status: pending
priority: P1
effort: "20 min"
dependencies: []
---

# Phase 1: Baseline Capture

## Overview

Capture full visual + perf baseline của production site sachcuahuy.com qua Playwright (8 pages × 2 viewports), Lighthouse (3 priority pages), dummy order test, và lightweight competitor skim. Output là dataset cho Phase 2 agents consume.

## Requirements

### Functional
- Screenshot 8 pages × 2 viewports (mobile 375 + desktop 1280) = 16 PNGs minimum
- Capture interactive states: form errors, hover, modals (5-8 extra screenshots)
- Run Lighthouse local CLI cho 3 URLs: `/`, `/sach`, `/dat-hang`
- POST dummy order với prefix `[AUDIT-DUMMY]` → capture token → screenshot `/xac-nhan/{token}` success state
- Skim 2 competitor sites (Nhã Nam, Tiki sách section) → note UX patterns

### Non-functional
- Wall time: ~20 min
- Realistic UA + viewport để né Cloudflare bot detection
- Vietnamese font diacritics render đúng (verify by re-screenshot 2 lần nếu cần)
- File naming consistent: `{NN}-{page}-{viewport}.png`

## Architecture

```
Em (main) ──┬─► Playwright headed/headless 1 sample
            │   ├─► Mobile 375 capture loop (8 pages)
            │   └─► Desktop 1280 capture loop (8 pages)
            │
            ├─► curl POST /api/orders → token
            │   └─► Playwright /xac-nhan/{token} success screenshot
            │
            ├─► Lighthouse CLI × 3 pages → JSON dump
            │
            └─► WebFetch competitor sites → note patterns
```

## Related Code Files

### Create
- `plans/reports/audit-260504-2119-website-uiux/screenshots/{16+ PNGs}`
- `plans/reports/audit-260504-2119-website-uiux/lighthouse/{home,sach,dat-hang}.json`
- `plans/reports/audit-260504-2119-website-uiux/baseline-manifest.md` (file list + dummy order info)
- Temp script: `/tmp/playwright-audit-capture.mjs` (capture loop)

### Read
- `tailwind.config.ts` (brand baseline reference)
- `src/app/layout.tsx` (metadata reference)
- `src/lib/site-config.ts` (URL config)
- `.env.local` (CMS URL nếu cần POST order)

### Modify
- None (audit-only)

### Delete (cleanup)
- `/tmp/playwright-audit-capture.mjs` sau khi xong

## Implementation Steps

1. **Setup capture script** — Write `/tmp/playwright-audit-capture.mjs` với:
   - Browser context: realistic UA `Mozilla/5.0 ... Chrome/124`, locale `vi-VN`
   - Mobile preset: viewport 375×812, device scale 2, isMobile true
   - Desktop preset: viewport 1280×900, device scale 1
   - For each page × viewport: navigate, wait networkidle, screenshot full-page

2. **Smoke test** — Chạy script với 1 page (`/`) trên 1 viewport để verify:
   - Cloudflare không block
   - Vietnamese font render đúng (check diacritic chars)
   - Screenshot quality OK
   - Nếu Cloudflare block → set extra headers, fallback Chrome MCP

3. **Full capture loop** — Chạy capture 8 pages × 2 viewports:
   - `/` Home
   - `/sach` Listing
   - `/sach/mien-nam-cua-huy` (book 1 detail)
   - `/sach/goc-phan-tu` (book 2 detail) — verify slug từ Directus
   - `/dat-hang` Order form
   - `/podcast` Coming soon
   - `/gioi-thieu` About
   - `/non-existent-page` 404 trigger

4. **Interactive state capture** — Manual via Playwright:
   - `/dat-hang` form: submit empty → capture validation errors
   - `/dat-hang` form: hover trên submit button (desktop)
   - Header: hover trên nav links (desktop)
   - Footer: hover trên links

5. **Dummy order test** — POST `/api/orders` với:
   ```json
   {
     "customer_name": "[AUDIT-DUMMY] Test Audit",
     "customer_phone": "0900000000",
     "customer_email": "audit-dummy@test.local",
     "shipping_address": "[AUDIT] Test Address",
     "items": [{"book_id": <first book id>, "quantity": 1}]
   }
   ```
   - Capture order_token từ response
   - Playwright navigate `/xac-nhan/{token}` → screenshot mobile + desktop
   - Note token + dummy order ID vào `baseline-manifest.md` để anh xóa sau

6. **Lighthouse CLI run** — Chạy 3 lần:
   ```bash
   npx lighthouse https://sachcuahuy.com/ \
     --output=json --output-path=lighthouse/home.json \
     --chrome-flags="--headless" --preset=desktop
   ```
   Tương tự cho `/sach` và `/dat-hang`. Lưu JSON.

7. **Competitor skim** — WebFetch:
   - `nhanam.vn` hoặc `nhanam.com.vn` (section sách văn học)
   - `tiki.vn/sach-truyen-tieng-viet` (section)
   - Note 5-10 UX patterns đáng học vào `findings-competitor.md` (em viết nhanh, không spawn agent)

8. **Manifest write** — `baseline-manifest.md` list all files + dummy order info + capture metadata.

9. **Cleanup** — Delete `/tmp/playwright-audit-capture.mjs`.

## Success Criteria

- [ ] 16+ baseline PNGs ở `screenshots/`, naming `NN-page-viewport.png`
- [ ] 5+ interactive state PNGs ở `screenshots/interactive/`
- [ ] 3 Lighthouse JSONs ở `lighthouse/`
- [ ] Dummy order created, token saved, success state screenshot captured (HOẶC documented why fallback dùng error state)
- [ ] `findings-competitor.md` có 5-10 UX patterns notes
- [ ] `baseline-manifest.md` list đầy đủ files + dummy order ID/token
- [ ] No Cloudflare 403 hoặc bot block error
- [ ] Vietnamese diacritics render đúng (verify visually)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Cloudflare block Playwright | Realistic UA + headers + locale, sample test trước, fallback Chrome MCP |
| Dummy order fail (API rejection) | Try 2 lần với data variations, fallback to error-state-only audit |
| Slug `/sach/[slug]` không khớp | Fetch `/api/books` hoặc Directus `/items/books?fields=slug` để get actual slug trước capture |
| Lighthouse CLI miss in PATH | `npx lighthouse` works without global install |
| Vietnamese font fallback (browser headless) | Set `--font-render-hinting=none` flag, verify diacritics |
| Network idle never resolved (long-poll) | Use `waitUntil: "load"` + 3s extra delay fallback |

## Notes

- Hooks: capture trước khi spawn Phase 2 agents — agents READ-ONLY trên screenshots
- Token budget Phase 1: ~30K (Playwright tool output verbose nhưng không vào main context)
- Anh có thể stop tại bất kỳ step nào nếu thấy capture không OK

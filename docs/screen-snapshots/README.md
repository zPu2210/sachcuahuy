# Screen Snapshots — sachcuahuy.com

Full-page production captures of all 7 routes at desktop (1440px) + mobile (iPhone 12 Pro) viewports.

## Captures

| Route | Desktop | Mobile |
|---|---|---|
| `/` | `home-desktop.png` | `home-mobile.png` |
| `/sach` | `sach-catalog-desktop.png` | `sach-catalog-mobile.png` |
| `/sach/mien-nam-cua-huy` | `sach-detail-desktop.png` | `sach-detail-mobile.png` |
| `/gioi-thieu` | `gioi-thieu-desktop.png` | `gioi-thieu-mobile.png` |
| `/podcast` | `podcast-desktop.png` | `podcast-mobile.png` |
| `/dat-hang?slug=mien-nam-cua-huy` | `dat-hang-desktop.png` | `dat-hang-mobile.png` |
| `/xac-nhan/invalid-token-snapshot` | `xac-nhan-desktop.png` | `xac-nhan-mobile.png` |

## Capture method

- **Source URL:** `https://sachcuahuy.com` (production)
- **Last captured:** 2026-05-11
- **Tool:** Playwright Chromium headless (`scripts/capture-snapshots.cjs`)
- **Viewports:**
  - Desktop: `1440 × 900` (full-page screenshots extend height)
  - Mobile: `iPhone 12 Pro` device descriptor (390 × 844, DPR 3)
- **CDN cache-bust:** `?_snapshot={timestamp}` query string forces SSR fresh
- **Animation freeze:** `animation-duration: 0` + `transition-duration: 0` injected before screenshot so `float`/`framer-motion` capture at a stable frame
- **Wait:** `networkidle` + 500ms settle

## Edge cases

- **`/sach/[slug]`** — captured `mien-nam-cua-huy` (most complete content available on production). Override via `SNAPSHOT_BOOK_SLUG=other-slug npm run capture:snapshots`.
- **`/xac-nhan/:token`** — token-gated. Captured the error/invalid-token state by visiting `/xac-nhan/invalid-token-snapshot`. Documents the error UI deterministically without needing a live order.
- **`/dat-hang`** — passes `?slug=mien-nam-cua-huy` to render the order form for that book; the route also accepts no slug (falls back to default).

## Re-capture

```bash
npm run capture:snapshots
```

Override base URL or book slug:

```bash
SNAPSHOT_BASE_URL=https://staging.sachcuahuy.com npm run capture:snapshots
SNAPSHOT_BOOK_SLUG=goc-phan-tu npm run capture:snapshots
```

## Vietnamese diacritic check

Visually inspect ≥3 PNGs (e.g. `home-desktop.png`, `gioi-thieu-desktop.png`, `sach-detail-desktop.png`) for clean diacritic rendering (`ă đ ê ô ơ ư` + tone marks). All three font families (Inter, Cormorant Garamond, Dancing Script) include the `vietnamese` subset — see `docs/design-system.md` → "Vietnamese diacritic coverage".

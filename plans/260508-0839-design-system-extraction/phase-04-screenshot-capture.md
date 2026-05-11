---
phase: 4
title: "Screenshot capture"
status: completed
priority: P2
effort: "2h"
dependencies: []
---

# Phase 4: Screenshot Capture

## Overview
Capture full-page screenshots of all 7 production routes at 2 viewports (desktop 1440 + mobile 375), output 14 PNGs to `docs/screen-snapshots/`. Verify CDN serves fresh content and Vietnamese diacritics render correctly. Independent of Phase 1-3 (no token/component dependency for capture itself).

## Requirements

**Functional:**
- Capture 14 full-page PNGs from `https://sachcuahuy.com` (production)
- Filenames: `{route-slug}-{viewport}.png` (e.g., `home-desktop.png`, `sach-mobile.png`, `gioi-thieu-desktop.png`)
- Cache-bust each request to avoid stale CDN
- Verify Vietnamese characters render (visual + automated grep of OCR or DOM text)
- For `/sach/[slug]`, pick 1 representative book (most complete content)

**Non-functional:**
- Reproducible: capture script committed under `scripts/capture-snapshots.cjs`
- PNG quality: lossless, full-page, no clipping
- Idempotent re-runs (overwrite existing PNGs)

## Architecture

**7 routes × 2 viewports = 14 PNGs:**

| Route | Slug | Notes |
|---|---|---|
| `/` | `home` | Hero, books, author, features, CTA |
| `/sach` | `sach-catalog` | Book grid |
| `/sach/[slug]` | `sach-detail` | Pick 1 book; record slug used in filename or note |
| `/gioi-thieu` | `gioi-thieu` | About page |
| `/podcast` | `podcast` | Podcast list |
| `/dat-hang` | `dat-hang` | Order form |
| `/xac-nhan` | `xac-nhan` | Confirmation page (may need test order to view; OR mock state) |

**Viewports:**
- Desktop: 1440 × auto (full page height)
- Mobile: 375 × auto (full page height, iPhone 12 Pro size)

**Capture tooling options (decide at phase start):**

| Option | Pros | Cons |
|---|---|---|
| Playwright | Programmatic, full-page native, CDN-friendly | Adds dev dependency (~250MB browsers) |
| Chrome MCP via Claude | No new dep, runs in current session | Manual orchestration, slower |
| Puppeteer | Lighter than Playwright | Same dep weight class |

**Recommendation:** Playwright (industry-standard, scriptable, future use for visual regression in Phase 5 of pipeline).

## Related Code Files

- **Read:**
  - `package.json` (check if Playwright already installed — likely not, but verify)
  - `next.config.ts` (any image CDN behavior?)
- **Create:**
  - `scripts/capture-snapshots.cjs` (Playwright script)
  - `docs/screen-snapshots/{route-slug}-{viewport}.png` × 14
  - `docs/screen-snapshots/README.md` (document capture date, source URL, sample book slug used for `/sach/[slug]`)
- **Modify:**
  - `package.json` (add `@playwright/test` as devDep, add npm script `capture:snapshots`)
  - `.gitignore` (add `playwright-report/`, `test-results/` if Playwright generates them)

## Implementation Steps

1. **Install Playwright**: `npm install --save-dev @playwright/test && npx playwright install chromium`
2. **Pick representative book** for `/sach/[slug]`: query Directus or browse `/sach` to identify book with full content (title, description, gallery, audio sample if any)
3. **Write `scripts/capture-snapshots.cjs`**:
   - Read routes from a const array
   - For each route × each viewport: launch headless Chromium, set viewport, navigate with `?_snapshot={timestamp}` to bypass CDN cache, wait for `networkidle`, screenshot full-page
   - Output to `docs/screen-snapshots/`
   - Reference snippet:
     ```js
     // scripts/capture-snapshots.cjs
     const { chromium, devices } = require('@playwright/test');
     const ROUTES = ['/', '/sach', '/sach/{book-slug}', '/gioi-thieu', '/podcast', '/dat-hang', '/xac-nhan/invalid-token'];
     const VIEWPORTS = [
       { name: 'desktop', width: 1440, height: 900 },
       { name: 'mobile', ...devices['iPhone 12 Pro'].viewport },
     ];
     const ts = Date.now();
     for (const route of ROUTES) {
       for (const vp of VIEWPORTS) {
         const ctx = await browser.newContext({ viewport: vp });
         const page = await ctx.newPage();
         // CDN cache-bust: query string forces SSR fresh
         await page.goto(`https://sachcuahuy.com${route}?_snapshot=${ts}`, { waitUntil: 'networkidle', timeout: 30000 });
         // Stop float animation for stable capture
         await page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0ms !important; transition-duration: 0ms !important; }' });
         await page.screenshot({ path: `docs/screen-snapshots/${slugify(route)}-${vp.name}.png`, fullPage: true });
       }
     }
     ```
4. **Add npm script**: `"capture:snapshots": "node scripts/capture-snapshots.cjs"`
5. **Run capture**: `npm run capture:snapshots` → verify 14 PNGs created
6. **Visual review**: open each PNG, confirm:
   - Vietnamese diacritics render correctly (no `□` boxes or `?`)
   - Layout intact (no broken images, no console error overlays)
   - Full-page captured (footer visible at bottom)
7. **Edge case `/xac-nhan`**: route may require valid order token. Document workaround:
   - Option A: navigate to error state (`/xac-nhan/invalid-token`) — captures empty/error UI
   - Option B: place test order, get token, capture, then capture stays valid
   - Option C: skip — mark in README.md as "captured separately when order flow reaches confirmation"
   - **Decide at phase start**; recommend Option A (deterministic, repeatable)
8. **Write `docs/screen-snapshots/README.md`** documenting:
   - Capture date
   - Source URL
   - Book slug used for `/sach/[slug]`
   - `/xac-nhan` capture method chosen
   - Re-capture command
9. **Commit PNGs** (large, but versioned — alternative is Git LFS, defer that decision)

## Success Criteria

- [ ] 14 PNG files exist in `docs/screen-snapshots/`
- [ ] Each PNG is full-page (footer visible, not cut)
- [ ] Vietnamese diacritics confirmed visually in ≥3 PNGs
- [ ] Filenames follow `{route-slug}-{viewport}.png` convention
- [ ] `scripts/capture-snapshots.cjs` is idempotent (re-run produces same results)
- [ ] `docs/screen-snapshots/README.md` documents capture method + edge cases
- [ ] `package.json` has `capture:snapshots` script
- [ ] Re-running capture produces ≤2px diff (network/animation jitter acceptable)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Playwright adds 250MB devDep | Acceptable — used for visual regression in Phase 5 of pipeline |
| Animations not settled at screenshot time | Wait `networkidle` + 500ms; disable animations via CSS injection if needed |
| `/xac-nhan` requires real order token | Option A (error state capture) — documented in README |
| Hero animation `float` mid-frame at capture | Inject `prefers-reduced-motion: reduce` via CSS or stop-animations script |
| CDN serves stale | Cache-bust query param; verify by checking response headers |
| Mobile viewport rendering edge cases | Use `iPhone 12 Pro` device descriptor for accurate UA + DPR |
| Image-heavy pages slow to load | Increase timeout to 30s, log slow loads |

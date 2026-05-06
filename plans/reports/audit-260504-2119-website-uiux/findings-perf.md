---
type: audit-findings-perf
agent: debugger
date: 2026-05-07 00:27 (Asia/Saigon)
scope: perf + Core Web Vitals (sachcuahuy.com baseline)
---

# Performance Audit Findings

## Summary
- Total findings: 13
- P0: 2 | P1: 6 | P2: 3 | P3: 2

## Lighthouse Scores Summary

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP | SI |
|---|---|---|---|---|---|---|---|---|---|
| / | **84** | 100 | 100 | 100 | **4.2s** | 0 | 30ms | 1.8s | 3.0s |
| /sach | **89** | 100 | 100 | 100 | **3.3s** | 0 | 200ms | 1.5s | 1.5s |
| /dat-hang | 92 | 100 | 100 | **58** | 3.0s | 0 | 30ms | 1.5s | 4.0s |

---

## LCP Element Analysis (home `/`)

**Element:** `<img class="object-cover">` — book cover `Miền Nam của Huy`
**Selector:** `div.relative > a.relative > div.relative > img.object-cover`
**DOM path:** `SECTION > DIV > DIV.grid > DIV.order-1 > DIV.relative > A.relative > DIV.relative > IMG`
**Bounding box (mobile):** 300×435px, top=216px

**Source URL pattern:**
```
/_next/image?url=https%3A%2F%2Fcms.sachcuahuy.com%2Fassets%2F16bb0c87-...&w=828&q=85
```
Served via Next.js image proxy from Directus CMS. WebP, 23KB, arrives at +317ms → +381ms.

**LCP Phase Breakdown (4,170ms total):**

| Phase | Duration | % | Analysis |
|---|---|---|---|
| TTFB | 638ms | 15% | Acceptable — SSR + Directus fetch |
| Load Delay | 171ms | 4% | Good — `priority` prop generates `<link rel=preload>` |
| Load Time | 161ms | 4% | Fast — 23KB over H2 |
| **Render Delay** | **3,204ms** | **77%** | **ROOT CAUSE** |

**Root cause:** Image bytes arrive at +381ms but browser waits until ~3,584ms to commit LCP paint. `hero-section.tsx` wraps the LCP `<Image>` in a `<Link>` with `style={{ transformStyle: "preserve-3d", perspective: "1000px" }}` — this creates a CSS 3D stacking context that defers compositor commit. Confirmed: Lighthouse mainthread shows Style & Layout 397ms + Script Eval 382ms = 779ms post-load blocking, but the primary culprit is the 3D stacking context preventing browser paint.

---

## Top Findings (severity-ranked)

### [P0] LCP — Render Delay 3,204ms (77% of LCP) on Home

- **Page:** /
- **Metric:** LCP
- **Current:** 4.2s — "Poor" (>4s threshold)
- **Target:** ≤2.5s ("Good")
- **Root cause:** `hero-section.tsx:149–181` — `<Link>` element wrapping the LCP cover image has `style={{ transformStyle: "preserve-3d", perspective: "1000px" }}`. CSS 3D compositing creates a stacking context that defers browser paint. The image IS tagged `priority={true}` (correct), arrives at +381ms (fast), but the compositor holds paint until 3.2s later.
- **Recommendation:** Move the 3D transform effect off the LCP image container. Keep hover effect but apply it to a sibling overlay, not the parent of the `<img>`:
  ```tsx
  // hero-section.tsx — remove from <Link>:
  // style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
  // Move perspective to a wrapper div that does NOT contain the <img fill> directly
  // Or use CSS class on :hover instead of inline preserve-3d
  ```
- **Effort:** S
- **Expected gain:** LCP -1,500–2,000ms → target ~2.2s
- **Lighthouse audit IDs:** `largest-contentful-paint`, `largest-contentful-paint-element`

### [P0] SEO — `/dat-hang` score 58 (blocked from indexing)

- **Page:** /dat-hang
- **Metric:** SEO score 58 — 2 failing audits
- **Root cause (confirmed):**
  1. `dat-hang/page.tsx:15`: `robots: { index: false, follow: false }` → renders `<meta name="robots" content="noindex, nofollow">` → Lighthouse `is-crawlable` fails
  2. `robots.ts:16`: `disallow: ["/dat-hang"]` → robots.txt line 3 also blocks crawlers → second source of `is-crawlable` failure
  3. No `alternates.canonical` on `/dat-hang` → Next.js inherits `layout.tsx` global canonical `/` → Lighthouse `canonical` fails: "Points to domain root instead of equivalent content"
- **Assessment:** `noindex` on `/dat-hang` is **intentional** (checkout page). SEO 58 is expected behavior, not a regression. The canonical mismatch is fixable with one line.
- **Recommendation:**
  ```tsx
  // src/app/dat-hang/page.tsx
  export const metadata: Metadata = {
    title: "Đặt Hàng",
    description: "Đặt mua sách văn học của Trọng Huy",
    robots: { index: false, follow: false },
    alternates: { canonical: "/dat-hang" }, // ADD THIS — fixes canonical audit
  };
  ```
  SEO score /dat-hang: 58 → ~75 (canonical passes; is-crawlable fails by design — acceptable)
- **Effort:** XS
- **Lighthouse audit IDs:** `is-crawlable`, `canonical`

### [P1] Unused JS — chunk `988` (40KB gzip, 90% unused) on all pages

- **Pages:** /, /sach (both load `988-10fc6ecfeed5ece0.js`)
- **Metric:** `unused-javascript`
- **Current:** 40KB gzip chunk (116KB raw), 35.9KB wasted (90%), savings ~150ms
- **Root cause:** Framer Motion v12.25.0 installed and in `dependencies`. Only 2 files use it: `src/components/ui/fade-in.tsx` (utility wrapper) and `src/components/podcast/coming-soon-hero.tsx` (podcast page only). **Neither is used in home or /sach** (confirmed: no Framer Motion import in `hero-section.tsx`, `books-section.tsx`, `author-section.tsx`, `features-section.tsx`, `cta-section.tsx`). Next.js bundles Framer Motion into the shared chunk regardless.
- **Recommendation:**
  ```tsx
  // Use dynamic import for animation components
  const FadeIn = dynamic(() => import('@/components/ui/fade-in').then(m => m.FadeIn), {
    ssr: false
  });
  // Or replace FadeIn entirely with CSS @keyframes + Intersection Observer
  ```
  Also: if `FadeIn` is not actually used anywhere on home/sach, verify nothing imports it from shared code, then ensure the dynamic import isolation works.
- **Effort:** M
- **Expected gain:** -35KB JS on home/sach, TBT improvement, Perf +2–4pts
- **Lighthouse audit IDs:** `unused-javascript`

### [P1] /sach Render-Blocking CSS — 620ms savings opportunity

- **Page:** /sach
- **Metric:** `render-blocking-resources`
- **Current:** Score 0, `fac7e91a84776ce3.css` (9KB) blocks render, Lighthouse reports 620ms overall savings. On home (`/`) same CSS scores 100 — /sach timing makes CSS more impactful.
- **Root cause:** CSS cascades to 3 font downloads immediately after parsing: Cormorant Garamond `8e9860b6...woff2` = **85.5KB** (largest single asset, longest chain link at 580ms). `next/font` default is `font-display: swap` — correct, but 3D CSS complexity on sach means the Style & Layout phase runs longer.
- **Recommendation:**
  ```ts
  // src/app/layout.tsx
  const dancing = Dancing_Script({
    subsets: ["latin", "vietnamese"],
    weight: ["400", "700"], // drop 500, 600
    variable: "--font-dancing",
    display: "optional", // decorative — don't block for it
  });
  const cormorant = Cormorant_Garamond({
    subsets: ["latin", "vietnamese"],
    weight: ["400", "700"], // drop 500, 600
    variable: "--font-cormorant",
    display: "optional",
  });
  ```
- **Effort:** S
- **Expected gain:** /sach LCP -300–500ms, font bytes -30–60KB
- **Lighthouse audit IDs:** `render-blocking-resources`, `font-display`, `critical-request-chains`

### [P1] Font Bundle — 295KB per page (6 woff2 files, critical chain 580ms)

- **Pages:** all
- **Current:** 295KB fonts/page: Inter (6 subset files: 42+8+38+11+11+49KB) + Cormorant Garamond (86KB) + Dancing Script (23+34KB). Longest critical chain = 85.5KB Cormorant Garamond file (580ms critical path).
- **Root cause:** `layout.tsx` loads Inter, Cormorant Garamond, Dancing Script — all with `subsets: ["latin", "vietnamese"]` and multiple weights. Vietnamese subset adds 30–40% to each font file.
- **Recommendation:**
  1. Reduce Cormorant to `weight: ["400", "700"]` (drop 500, 600)
  2. Reduce Dancing Script to `weight: ["400"]` (script font used decoratively, bold not needed)
  3. Audit Vietnamese subset necessity: the site is Vietnamese so keep it, but combine with `display: "optional"` for decorative fonts to break the cascade chain
- **Effort:** S
- **Expected gain:** -40–60KB font bytes, critical chain -200ms
- **Lighthouse audit IDs:** `critical-request-chains` (longestChain 580ms)

### [P1] /sach LCP Load Delay — 1,601ms (49% of 3.3s LCP)

- **Page:** /sach
- **Metric:** LCP load delay sub-phase
- **Current:** Load Delay 1,601ms — browser doesn't discover/start loading the LCP image until 1.6s after TTFB. Load Time itself is only 704ms. Render Delay 351ms.
- **Root cause:** The LCP element on `/sach` is the first `BookCard` cover image (`priority={featured}` where `featured = index === 0`). It's correct. But the image URL is built dynamically via `buildAssetUrlFromFile()` — no static `<link rel=preload>` in HTML head possible. Additionally, CSS at +316ms is render-blocking (620ms flagged), and `BooksSection > BookCard > Image` is 6 component layers deep — React must finish hydrating before the `img src` becomes visible to the browser's preload scanner.
- **Recommendation:**
  In `/sach/page.tsx`, emit a preload hint via the Vercel Edge using `headers()`:
  ```tsx
  // src/app/sach/page.tsx
  import { headers } from 'next/headers';
  // After fetching books:
  const firstCoverUrl = buildAssetUrlFromFile(books[0]?.cover_image, { width: 600, format: 'webp' });
  // Use Next.js unstable generateMetadata Link preload or:
  // Add to metadata.other to emit <link rel=preload as=image>
  ```
  Simpler interim: add `fetchPriority="high"` to the first BookCard's Image (Next.js passes this with `priority` but verify the proxied URL gets the hint).
- **Effort:** M
- **Expected gain:** /sach LCP -800–1,200ms
- **Lighthouse audit IDs:** `largest-contentful-paint-element`, `preload-lcp-image`

### [P1] External Texture — `transparenttextures.com` (no preconnect, 636ms cross-origin latency)

- **Pages:** / (`cta-section.tsx:13`), /sach (`book-card.tsx:54` — fallback state)
- **Current:** `background-image: url('https://www.transparenttextures.com/patterns/cubes.png')` (1,150B). Loaded at +410ms → +1046ms = 636ms. No preconnect. 116ms savings flagged by Lighthouse.
- **Root cause:** External texture directly in Tailwind `bg-[url(...)]` class. `www.transparenttextures.com` is a 3rd-party domain — requires DNS + TLS negotiation on first visit.
- **Recommendation (Option A — best):** Self-host texture:
  ```bash
  # Download to public/
  curl -o public/textures/cubes.png https://www.transparenttextures.com/patterns/cubes.png
  curl -o public/textures/leather.png https://www.transparenttextures.com/patterns/leather.png
  ```
  Then update classes: `bg-[url('/textures/cubes.png')]` (same domain, no DNS/TLS, forever-cached).
- **Effort:** XS
- **Expected gain:** -116ms LCP, 3rd-party dependency eliminated
- **Lighthouse audit IDs:** `uses-rel-preconnect`

### [P1] External Avatars — 3 Dicebear SVG requests (~500ms each, `<img>` not `next/image`)

- **Page:** / (`hero-section.tsx:127–135`)
- **Current:** 3 cross-origin requests to `api.dicebear.com`: seed=1 (2KB), seed=2 (2.6KB), seed=3 (2.2KB). Each +321ms → +454–497ms. Uses `// eslint-disable-next-line @next/next/no-img-element` to bypass Next.js `<img>` warning. No lazy loading (above fold).
- **Root cause:** Live 3rd-party API for decorative placeholder avatars. 3 cross-origin connections.
- **Recommendation:**
  ```bash
  # Generate once, save locally
  curl "https://api.dicebear.com/9.x/avataaars/svg?seed=1" -o public/avatars/avatar-1.svg
  # x3
  ```
  ```tsx
  // hero-section.tsx — replace <img> with next/image
  import Image from "next/image";
  <Image src={`/avatars/avatar-${i}.svg`} alt="" width={36} height={36} className="rounded-full" />
  ```
- **Effort:** XS
- **Expected gain:** 3 cross-origin connections eliminated, -500ms latency
- **Lighthouse audit IDs:** `uses-rel-preconnect` (dicebear.com is a 3rd-party origin)

### [P2] Framer Motion 116KB bundle unused 90% — all pages load it

- **Pages:** / and /sach
- **Current:** Chunk `988` (116KB raw, 40KB gzip): 90% unused = 104KB raw wasted. Framer Motion v12.25.0 in `dependencies` — bundled into shared vendor chunk.
- **Root cause:** `FadeIn` component (`framer-motion` import) is defined but NOT called in any home page section. `ComingSoonHero` (podcast page) does use it. Because Framer Motion is in `dependencies` and imported by any shared module, Next.js can't exclude it from pages that don't animate.
- **Recommendation:** Use `next/dynamic` with `{ ssr: false }` for `FadeIn`. Or: replace `FadeIn` with pure CSS animation (Tailwind `animate-fadeIn` + `@keyframes`) + Intersection Observer — zero runtime cost, better performance.
- **Effort:** M
- **Expected gain:** -35KB on home/sach, TBT -50ms
- **Lighthouse audit IDs:** `unused-javascript`, `bootup-time`

### [P2] `/dat-hang` Speed Index 4.0s — form hydration deferred

- **Page:** /dat-hang
- **Metric:** Speed Index 4.0s (worst SI of 3 pages despite best Perf 92)
- **Root cause:** `force-dynamic` SSR + `OrderForm` is a Client Component. Below-fold form content renders blank until React hydration completes client-side. FCP=1.5s (header/nav visible) but form content paints at ~4s.
- **Recommendation:**
  ```tsx
  // Add skeleton for form loading state
  <Suspense fallback={<OrderFormSkeleton />}>
    <OrderForm ... />
  </Suspense>
  ```
  `OrderFormSkeleton` renders static HTML (no JS) — browser paints it immediately, improving SI.
- **Effort:** M
- **Expected gain:** SI /dat-hang 4.0s → ~2.5s

### [P2] ISR revalidation — `revalidate = 300` may spike TTFB on stale

- **Pages:** /, /sach
- **Current:** TTFB 634–638ms (cache hit during Lighthouse). On revalidation (every 5 min), background fetch from Directus may cause next-request TTFB spike to 1–3s.
- **Recommendation:** Increase `revalidate` to 600s (10 min) for home — book store content rarely changes mid-session:
  ```ts
  export const revalidate = 600; // src/app/page.tsx
  ```
- **Effort:** XS
- **Expected gain:** 50% fewer Directus fetches, more consistent TTFB

### [P3] Home Perf 84 — 1pt below ≥85 overhaul gate

- The single LCP fix (P0 render delay) should bring home Perf to 88–92. No separate action needed beyond the P0 fix.

### [P3] `preload-lcp-image` audit returns N/A on home

- Lighthouse returns empty `{}` for `preload-lcp-image` audit on home. This is expected — `next/image` with `priority={true}` generates `<link rel=preload as=image>` in SSR output but the dynamic `/_next/image` proxy URL is not recognized by the Lighthouse static preload checker.
- **Action:** Verify the preload link exists: `curl -s https://sachcuahuy.com/ | grep 'rel="preload"'`. If absent from ISR-cached response, this is a bug.
- **Effort:** XS (verification)

---

## /dat-hang SEO Investigation (score 58)

**Two failing audits confirmed:**

| Audit | Score | Source |
|---|---|---|
| `is-crawlable` | 0 | `<meta name="robots" content="noindex, nofollow">` (from `dat-hang/page.tsx:15`) + `robots.txt` `Disallow: /dat-hang` (from `robots.ts:16`) |
| `canonical` | 0 | No `alternates.canonical` on `/dat-hang` → Next.js inherits layout global canonical `/` → Lighthouse: "Points to domain root instead of equivalent content page" |

**Verdict:** `noindex` + `disallow` are intentional for the checkout page. SEO 58 is expected. Fix canonical only to reach score ~75:
```tsx
// src/app/dat-hang/page.tsx — add one line
alternates: { canonical: "/dat-hang" },
```

---

## Bundle Analysis

**Top 5 JS chunks by raw size:**

| Chunk | Raw | Gzip | Unused % | Likely Content |
|---|---|---|---|---|
| `4bd1b696` | 173KB | 56KB | 35% | React + Next.js client runtime |
| `255-cb395327` | 172KB | 46KB | 41% | Next.js router + RSC runtime |
| `988-10fc6ecf` | **116KB** | 40KB | **90%** | **Framer Motion** (barely used) |
| `app/layout-85e7e45` | 13.5KB | 4.9KB | 9% | Layout component |
| `76adf.../script.js` | 12.6KB | 4.9KB | 53% | Umami analytics (proxied) |

**Total transfer by type (home):**
- Font: 295KB (48%)
- Script: 164KB (27%)
- Image: 109KB (18%)
- Fetch/Doc/CSS: 52KB (8%)
- **Total: 612KB**

**Code-split opportunities:**
1. Framer Motion → `next/dynamic` on podcast page only (-35KB on home/sach)
2. `@directus/sdk` — verify tree-shaking: only `createDirectus`, `rest`, `readItems` should be imported (not the full barrel)
3. `lucide-react` v0.469.0 — named imports are tree-shakeable; verify no barrel `import * as Icons` usage

---

## Quick Wins (high impact + low effort)

1. **Remove `preserve-3d`/`perspective` from hero `<Link>` wrapper** (S): Single code change in `hero-section.tsx`. Estimated LCP improvement -1,500ms. Highest ROI fix.
2. **Self-host 2 texture files from `transparenttextures.com`** (XS): Copy `cubes.png` and `leather.png` to `/public/textures/`. Eliminate 3rd-party dependency + 636ms latency.
3. **Replace 3 Dicebear avatar API calls with local SVGs** (XS): Save 3 files to `/public/avatars/`, use `next/image`. Eliminate 3 cross-origin connections.
4. **Add `alternates.canonical: "/dat-hang"`** (XS): One line. SEO score /dat-hang 58 → ~75.
5. **Reduce Cormorant + Dancing Script to 2 weights + `display: "optional"`** (S): 3 lines changed in `layout.tsx`. Font bytes -40KB, critical chain -200ms.

---

## Overhaul Compatibility Notes (watercolor/decorative overhaul planned)

- **LCP will worsen** if new watercolor PNG/WebP images are placed above the fold without `priority`. Ensure only the hero book cover carries `priority={true}`.
- **CLS risk** from animated SVG decorations that affect text flow. Use `min-height` CSS or `contain: layout` on decorative containers.
- **Font budget**: Already at 295KB. Any new display font for watercolor labels pushes over 400KB. Use `display: "optional"` for all new decorative fonts.
- **25–32 generated images**: Use `format: "avif"` in `buildAssetUrlFromFile` for all decorative/background images (Directus supports AVIF transforms). ~30% smaller than WebP.
- **Framer Motion**: If overhaul activates `FadeIn` on home, the 40KB chunk becomes justified — but still wrap with `ssr: false` to avoid hydration blocking paint.

---

**Status:** DONE
**Summary:** Home LCP 4.2s is dominated by 3,204ms Render Delay (77%) caused by CSS `preserve-3d`/`perspective` on the LCP image container — not slow image loading (image arrives at +381ms). /dat-hang SEO 58 is intentional `noindex` on checkout page, not a regression. Top 3 quick wins: remove 3D transform from hero wrapper, self-host texture assets, replace Dicebear API calls.

## Unresolved Questions

1. **Umami script source**: `76adf205dfb94d71/script.js` (proxied through sachcuahuy.com) not found in any `src/` file. Likely injected via Vercel project dashboard settings (script injection feature). Where is it configured? If via Vercel dashboard, it can't be moved to `next/script` strategy.

2. **Render Delay confirmation**: Lighthouse LCP phase data confirms 3.2s render delay and the `preserve-3d` wrapper is the strongest structural evidence. A Chrome DevTools Performance trace (paint → LCP marker timing) would definitively confirm vs. rule out hydration timing as co-contributor.

3. **Directus AVIF support**: `directus-assets.ts` always requests `format: "webp"`. Does `cms.sachcuahuy.com` support `format: "avif"`? Not tested.

4. **ISR cold-miss TTFB**: All 3 Lighthouse runs hit warm ISR cache (TTFB 638ms). Actual cold-miss TTFB (post-5min revalidation hitting Directus) unknown. Under real traffic spikes, could degrade LCP further.

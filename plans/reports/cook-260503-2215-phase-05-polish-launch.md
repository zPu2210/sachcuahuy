---
phase: 5
title: "Phase 5 — Polish & Launch (cook report)"
date: 2026-05-03
plan: plans/260502-2024-sachcuahuy-production-launch/phase-05-polish-launch.md
status: ship-ready (Vercel deploy + UAT pending)
---

# Phase 5 cook report

## TL;DR

Polish + SEO + analytics + sitemap + 404 + podcast placeholder shipped. `next build` green, lint clean (only 2 pre-existing warnings unrelated to this phase). All 11 routes serve 200/404 correctly under `next start`. Vercel env vars confirmed for Production + Preview. Code ready to push; T-1 smoke + UAT remain manual gates before public launch.

## What landed

### New files
- `src/app/podcast/page.tsx` — server page, metadata + canonical
- `src/components/podcast/coming-soon-hero.tsx` — Framer Motion hero, mic icon, dual CTA
- `src/app/sitemap.ts` — Next.js convention sitemap; static + Directus books, fallback if Directus down
- `src/app/robots.ts` — disallow `/api/`, `/dat-hang`, `/xac-nhan/`; sitemap link
- `src/components/seo/json-ld.tsx` — `JsonLdOrganization` + `JsonLdBook` schema components

### Modified
- `src/app/layout.tsx` — `metadataBase`, title template `%s | Sách Của Huy`, OG defaults, Twitter card, viewport with `themeColor`, `<Analytics />` + `<SpeedInsights />`, `<JsonLdOrganization>` (graceful fallback if Directus unreachable)
- `src/app/page.tsx` — `generateMetadata` reading `site_settings.hero_title/hero_subtitle` from Directus, canonical
- `src/app/sach/page.tsx` — canonical + OG
- `src/app/sach/[slug]/page.tsx` — `generateMetadata` with OG image (Directus transform 1200×630), canonical, twitter card; `<JsonLdBook>` injected; uses `seo_title`/`seo_description` if set
- `src/app/dat-hang/page.tsx` — `robots: { index: false, follow: false }`
- `src/app/xac-nhan/[token]/page.tsx` — title trimmed (template adds suffix automatically)
- `src/app/gioi-thieu/page.tsx` — canonical + OG profile type
- `src/app/not-found.tsx` — explicit metadata, larger viewport, link to /gioi-thieu
- `src/components/layout/header.tsx` — replaced broken `/blog` nav with `/podcast`; cart icon now points to `/sach` (was `/gio-hang` 404), removed unused cart counter badge
- `src/components/layout/footer.tsx` — accepts `settings` prop; dynamic email/phone/socials from `site_settings`; `/blog` swapped to `/podcast`; `mailto:` + `tel:` links
- `package.json` — `@vercel/analytics ^2.0.1`, `@vercel/speed-insights ^2.0.0`

## Verification

### Build & lint
- `npm run build` → ✅ compiled in 4.4s, 11 routes generated, 2 books prerendered
- `npm run lint` → 0 errors, 2 warnings (`ShieldCheck` unused in `features-section.tsx`, `useEffect` unused in `header.tsx` — both pre-existing, not Phase 5 scope)

### Route smoke (production build, port 3009)
| Route | Status | Notes |
|---|---|---|
| `/` | 200 | Hero + books + JSON-LD Organization |
| `/sach` | 200 | Catalog with 2 books |
| `/sach/mien-nam-cua-huy` | 200 | JSON-LD Book emitted, 179000 VND, InStock |
| `/sach/goc-phan-tu` | 200 | Same |
| `/gioi-thieu` | 200 | Author page |
| `/podcast` | 200 | Coming Soon hero |
| `/dat-hang` | 200 | `robots: noindex,nofollow` confirmed |
| `/robots.txt` | 200 | Disallow `/api/`, `/dat-hang`, `/xac-nhan/` |
| `/sitemap.xml` | 200 | 4 static + 2 books = 6 URLs |
| `/no-such-page` | 404 | Custom 404 with `noindex` |

### Metadata + JSON-LD spot check
- Home: `<title>Sách Của Huy</title>`, OG description from `site_settings.hero_subtitle`, `link rel=canonical`
- Book detail: title from `seo_title || title`, OG `type=article`, twitter card, `JsonLdBook` with price/availability/ISBN/publisher/datePublished
- Org JSON-LD on every page: name, url, logo, contactPoint with email
- `/dat-hang` + `/xac-nhan/`: `<meta name="robots" content="noindex, nofollow">` confirmed

### Vercel env vars (already set per `vercel env ls`)
- ✅ `DIRECTUS_URL` (Production + Preview)
- ✅ `DIRECTUS_API_ORDERS_TOKEN` (Production + Preview)
- ✅ `NEXT_PUBLIC_DIRECTUS_ASSETS_URL` (Production + Preview)
- ✅ `COOKIE_SECRET` (Production + Preview)
- ✅ `NEXT_PUBLIC_SITE_URL` (Production + Preview)

## Plan deltas / decisions

1. **OG image fallback only on book pages** — Phase 3 image upload deferred, so `book.cover_image` is currently `null` in Directus. `getOgImageUrl()` returns `null` and the OG image meta tag is omitted; layout default `/images/book-cover-front.png` covers global. Once Phase 3 uploads land, per-book OG kicks in automatically (Directus transform 1200×630 webp q80) — no further code change.
2. **Cart icon repurposed** — Header had a `/gio-hang` link that 404'd; removed the "0" counter badge and pointed the icon at `/sach`. Surgical fix to satisfy "no broken nav" success criterion without removing UI.
3. **Footer goes dynamic** — Passes `settings` from layout (server-side fetched once) instead of hardcoded contact info. Falls back to placeholder if Directus down. Social links only render if URL is present.
4. **Skipped from MVP per plan**:
   - Subscribe form on `/podcast` (Q open: Directus collection vs defer Phase 6) → kept Coming Soon static
   - On-demand `/api/og/[slug]` route → Directus transform handles MVP
   - `revalidatePath` webhook from Directus → ISR 5min is acceptable per plan
5. **No Lighthouse run yet** — local lab values lie compared to Vercel Edge. Will run against production deploy URL post-deploy (Phase 5 plan Step 8.1) and gate against targets there. If perf below 85 on prod, image classification work from Phase 3 upload will unblock the gain (current covers default to a single shared `/images/book-cover-front.png`).

## Risks / known gaps

- **Visual mobile QA not done in browser** — Chrome MCP wasn't connected; verified via curl + code review of Tailwind responsive classes. Existing pages (home/sach/dat-hang/xac-nhan) were already responsive in Phase 2; Phase 5 only added: podcast page (uses `text-4xl md:text-6xl lg:text-7xl`, `max-w-xl mx-auto`, no fixed widths) and 404 (centered + `min-h-[80vh]`). Recommend anh run a manual click-through after Vercel deploy.
- **Vercel Analytics + Speed Insights bundled but won't emit events outside Vercel** — packages no-op locally; activate when running on `*.vercel.app`. No additional dashboard config needed for the basic plan.
- **Public footer email leaks `pu.hungphu@gmail.com`** — comes from Directus `site_settings.contact_email` seeded in Phase 1. Same value also appears in JSON-LD Org `contactPoint.email`. If anh wants a brand inbox (e.g. `hello@sachcuahuy.com`) he can edit in Directus admin without code change.
- **`memo_format` field still vestigial** — Phase 2 hardened memo to `order_code` only; field unused but kept in schema.
- **OG image for sitemap canonical mismatch** — when `NEXT_PUBLIC_SITE_URL` differs from prod URL after domain swap, all canonicals shift. Plan calls for `sachcuahuy.vercel.app` MVP; future custom domain swap = single env var change.

## Files changed (Phase 5 scope only)

```
src/app/podcast/page.tsx                          (new)
src/app/sitemap.ts                                (new)
src/app/robots.ts                                 (new)
src/components/podcast/coming-soon-hero.tsx       (new)
src/components/seo/json-ld.tsx                    (new)
src/app/layout.tsx                                (modified)
src/app/page.tsx                                  (modified)
src/app/sach/page.tsx                             (modified)
src/app/sach/[slug]/page.tsx                      (modified)
src/app/gioi-thieu/page.tsx                       (modified)
src/app/dat-hang/page.tsx                         (modified)
src/app/xac-nhan/[token]/page.tsx                 (modified)
src/app/not-found.tsx                             (modified)
src/components/layout/header.tsx                  (modified)
src/components/layout/footer.tsx                  (modified)
package.json                                      (+2 deps)
package-lock.json                                 (auto)
```

## Next steps (manual / Phase 5 ship gate)

1. Commit + push the Phase 5 scoped diff to `main` (this report includes the file list).
2. Vercel auto-deploys on push → check build green.
3. Run Lighthouse mobile against production URL on `/`, `/sach/mien-nam-cua-huy`, `/dat-hang` — confirm Perf ≥85 / A11y ≥95 / SEO ≥95 / BP ≥95.
4. T-1 smoke test: place 1 test order on production → Zalo received <10s.
5. Anh + Huy UAT (Step 10 of phase plan).
6. After UAT pass → declare Phase 5 ship gate met, kick off 7-day observation window.

## Unresolved questions

- Should we move `pu.hungphu@gmail.com` in `site_settings.contact_email` to a brand inbox before public launch, or leave it as an MVP shortcut? (anh decision; one Directus edit, no code change.)
- Does anh want a real shopping cart Phase 6, or is the "buy now → checkout" single-product flow staying long-term? (Header cart icon pointing at `/sach` is a stopgap.)
- Custom domain `sachcuahuy.com` → swap `NEXT_PUBLIC_SITE_URL` + Vercel domain attach when ready (post-launch per plan).
- Once Phase 3 images upload, do we want per-book OG image or stick with shared default for cleaner social previews?

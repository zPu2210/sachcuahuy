---
phase: 5
title: "Polish & Launch"
status: pending
priority: P1
effort: "0.5d"
dependencies: [2, 3, 4]
---

# Phase 5: Polish & Launch

## Context Links

- **Plan overview:** [plan.md](./plan.md)
- **Brainstorm:** [brainstorm-260502-1601-website-ban-sach-architecture.md](../reports/brainstorm-260502-1601-website-ban-sach-architecture.md)
- **Phase 2:** [phase-02-frontend-integration.md](./phase-02-frontend-integration.md) — Frontend + API live
- **Phase 3:** [phase-03-image-processing.md](./phase-03-image-processing.md) — Images uploaded
- **Phase 4:** [phase-04-goclaw-zalo-integration.md](./phase-04-goclaw-zalo-integration.md) — Notifications wired
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci
- **Vercel Analytics:** https://vercel.com/docs/analytics

## Overview

Final polish trước public launch: podcast placeholder page, full SEO meta + Open Graph, mobile responsive QA (iPhone SE → iPhone Pro Max), Lighthouse mobile >85, accessibility (alt text, ARIA, contrast), `robots.txt` + `sitemap.xml`, prod Vercel deploy + DNS confirmation. End-to-end smoke test by anh + Huy.

## Requirements

### Functional
- `/podcast` page với "Sắp ra mắt" CTA + form đăng ký nhận thông báo (optional, store qua Directus pages content)
- SEO: title/description/OG image cho `/`, `/sach`, `/sach/[slug]`, `/gioi-thieu`, `/dat-hang`, `/podcast`, `/lien-he`
- `robots.txt` + `sitemap.xml` (dynamic từ Directus published books)
- Vercel Analytics enabled (Web Vitals)
- 404 page với navigation back
- Mobile breakpoints: 375px (iPhone SE), 390px (iPhone 14), 414px (iPhone Pro Max), 768px (iPad), 1280px (desktop)

### Non-functional
- Lighthouse mobile: Performance >85, Accessibility >95, SEO >95, Best Practices >95
- LCP <1.5s từ VN 4G (Vercel Analytics confirm)
- CLS <0.1
- All interactive elements keyboard accessible
- Color contrast WCAG AA (text 4.5:1, large 3:1)
- No console errors trong production build

## Architecture

```
Frontend Routes (final state)
├── /                      ← Hero + 2 books + author + CTA
├── /sach                  ← Catalog (2 books, ISR 5min)
├── /sach/[slug]           ← Detail (mien-nam-cua-huy, goc-phan-tu)
├── /gioi-thieu            ← About (CMS pages)
├── /lien-he               ← Contact (CMS pages)
├── /dat-hang              ← Order form
├── /xac-nhan/[token]      ← Order confirm + QR (opaque order_token, not order_code)
├── /podcast               ← Coming Soon placeholder ⭐ NEW
├── /robots.txt            ← Static
├── /sitemap.xml           ← Dynamic from Directus
└── /not-found             ← 404 page

SEO Layer
├── app/layout.tsx          ← global meta defaults + JSON-LD Organization
├── per-page metadata        ← Next.js generateMetadata
├── OG images                ← Directus transform 1200x630
└── /api/og/[slug]/route.ts ← optional dynamic OG (defer if time tight)
```

## Related Code Files

### Create
- `src/app/podcast/page.tsx` — Coming Soon page
- `src/app/sitemap.ts` — Next.js sitemap function
- `src/app/robots.ts` — Next.js robots function
- `src/components/podcast/coming-soon-hero.tsx` — placeholder UI
- `src/components/seo/json-ld-organization.tsx` — schema.org markup

### Modify
- `src/app/layout.tsx` — global metadata + Vercel Analytics + Web Vitals
- `src/app/page.tsx` — `generateMetadata` from site_settings
- `src/app/sach/page.tsx` — metadata + OG image
- `src/app/sach/[slug]/page.tsx` — `generateMetadata` per book
- `src/app/gioi-thieu/page.tsx` — metadata + content from Directus pages
- `src/app/dat-hang/page.tsx` — metadata + noindex (don't index checkout)
- `src/components/layout/header.tsx` — add `/podcast` link in nav
- `src/components/layout/footer.tsx` — add podcast link, contact info from site_settings
- `src/app/not-found.tsx` — improve 404 UX
- `package.json` — add `@vercel/analytics`
- `.env` — `NEXT_PUBLIC_SITE_URL=https://sachcuahuy.vercel.app`

### Delete
- `src/lib/data.ts` — remove if all consumers migrated to Directus (Phase 2 cleanup)
- `public/images/books/*.jpg` — remove if Directus images stable (defer 1 week post-launch as fallback)

## Implementation Steps

### 1. Podcast placeholder page

**1.1.** Write `src/app/podcast/page.tsx`:
```tsx
import { Metadata } from 'next';
import { ComingSoonHero } from '@/components/podcast/coming-soon-hero';

export const metadata: Metadata = {
  title: 'Podcast - Sách Của Huy',
  description: 'Podcast Sách Của Huy: những câu chuyện bên ly cà phê. Sắp ra mắt.',
};

export default function PodcastPage() {
  return <ComingSoonHero />;
}
```

**1.2.** Write `src/components/podcast/coming-soon-hero.tsx`:
- Hero với illustration (mic + sách)
- Headline: "Sắp Ra Mắt"
- Subtitle: "Podcast Sách Của Huy — Những câu chuyện bên ly cà phê"
- Email subscribe form (POST to Directus `pages.subscribers` collection — add field nếu cần, hoặc defer Phase 6)
- Decorative animation Framer Motion subtle

**1.3.** Add nav link trong `header.tsx` + `footer.tsx`.

### 2. SEO meta cho mỗi page

**2.1.** `app/layout.tsx` — global defaults:
```tsx
import { getSiteSettings } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
    title: { default: 'Sách Của Huy', template: '%s | Sách Của Huy' },
    description: s.hero_subtitle,
    openGraph: {
      type: 'website', locale: 'vi_VN',
      siteName: 'Sách Của Huy',
      images: ['/og-default.webp'],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}
```

**2.2.** Per-page `generateMetadata` cho book detail:
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const book = await getBookBySlug(params.slug);
  if (!book) return {};
  return {
    title: book.title,
    description: book.short_description,
    openGraph: {
      title: book.title,
      description: book.short_description,
      images: [`${process.env.NEXT_PUBLIC_DIRECTUS_ASSETS_URL}/assets/${book.cover_image.id}?width=1200&height=630&fit=cover&format=webp`],
    },
  };
}
```

**2.3.** `/dat-hang` + `/xac-nhan` → `robots: { index: false }`.

### 3. JSON-LD structured data

**3.1.** Write `src/components/seo/json-ld-organization.tsx`:
```tsx
export function JsonLdOrganization({ settings }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sách Của Huy',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    contactPoint: { '@type': 'ContactPoint', telephone: settings.contact_phone, contactType: 'sales' },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />;
}
```

**3.2.** Per-book `Product` schema (in `/sach/[slug]/page.tsx`):
```tsx
const productLd = {
  '@context': 'https://schema.org', '@type': 'Book',
  name: book.title, author: { '@type': 'Person', name: book.author },
  isbn: book.isbn, image: cover_url,
  offers: { '@type': 'Offer', price: book.price, priceCurrency: 'VND',
            availability: book.stock_status === 'in_stock' ? 'InStock' : 'OutOfStock' },
};
```

### 4. Sitemap + robots

**4.1.** `src/app/sitemap.ts`:
```ts
import { MetadataRoute } from 'next';
import { getBooks } from '@/lib/books';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const books = await getBooks();
  const staticUrls = ['/', '/sach', '/gioi-thieu', '/lien-he', '/podcast'].map(p => ({
    url: base + p, lastModified: new Date(), changeFrequency: 'weekly' as const,
  }));
  const bookUrls = books.map(b => ({
    url: `${base}/sach/${b.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8,
  }));
  return [...staticUrls, ...bookUrls];
}
```

**4.2.** `src/app/robots.ts`:
```ts
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dat-hang', '/xac-nhan/', '/api/'] }],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
```

### 5. Vercel Analytics + Web Vitals

**5.1.** `npm install @vercel/analytics @vercel/speed-insights`

**5.2.** `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**5.3.** Vercel dashboard → Project → Analytics → Enable.

### 6. Mobile responsive QA

**6.1.** Test devices (Chrome DevTools or real):
- iPhone SE (375x667)
- iPhone 14 (390x844)
- iPhone Pro Max (414x896)
- iPad Mini (768x1024)
- Desktop 1280px+

**6.2.** Pages to test each:
- `/` (hero, books grid, author section)
- `/sach` (grid → 1 col mobile, 2 col tablet)
- `/sach/[slug]` (gallery swipe, sticky CTA)
- `/dat-hang` (form fields, summary panel stacks below mobile)
- `/xac-nhan/[token]` (QR image scales, bank info readable; phone-last-4 gate works on mobile keyboard)
- `/podcast` (hero centered, no overflow)

**6.3.** Check:
- [ ] No horizontal scroll
- [ ] Tap targets ≥44x44 px
- [ ] Text readable without zoom
- [ ] Form inputs trigger correct keyboard (numeric for phone, email for email)
- [ ] Sticky header doesn't cover content
- [ ] Images scale, no overflow

**6.4.** Use `chrome-devtools` skill or Claude_in_Chrome MCP for screenshot comparison if available.

### 7. Accessibility audit

**7.1.** Lighthouse Accessibility audit local:
```bash
npm run build && npm start
# In Chrome: Lighthouse → Mobile → Accessibility only → run
# Target: >95
```

**7.2.** Manual checks:
- [ ] All `<img>` có alt text VI
- [ ] Form labels paired với inputs (no placeholder-only)
- [ ] Color contrast: text vs bg ≥4.5:1 (use Stark or Lighthouse)
- [ ] Focus visible cho all interactive elements (Tab navigation)
- [ ] Heading hierarchy đúng (h1 only 1 per page, no skip levels)
- [ ] Language attribute `<html lang="vi">`
- [ ] Skip-to-content link (optional MVP)

**7.3.** Activate `web-design-guidelines` skill nếu cần deep audit.

### 8. Lighthouse CI baseline

**8.1.** Run Lighthouse mobile cho 3 key pages:
```bash
npx lighthouse https://sachcuahuy.vercel.app --view --form-factor mobile
npx lighthouse https://sachcuahuy.vercel.app/sach/mien-nam-cua-huy --view --form-factor mobile
npx lighthouse https://sachcuahuy.vercel.app/dat-hang --view --form-factor mobile
```

**8.2.** Target scores (mobile):
- Performance >85
- Accessibility >95
- SEO >95
- Best Practices >95

**8.3.** If below target → optimize:
- Performance: image format/size (Phase 3 confirm), defer non-critical JS, Vercel Edge caching
- A11y: alt text, contrast, ARIA labels
- SEO: meta tags, structured data
- Best Practices: HTTPS, no console errors, modern image formats

### 9. Production deploy

**9.1.** Final code commit + push to `main` branch.
**9.2.** Vercel auto-deploys → verify build success in Vercel dashboard.
**9.3.** Verify Vercel env vars (Production):
- `DIRECTUS_URL`, `DIRECTUS_PUBLIC_TOKEN`, `DIRECTUS_ADMIN_TOKEN`, `NEXT_PUBLIC_SITE_URL`
**9.4.** Smoke test prod URL `https://sachcuahuy.vercel.app`:
- All pages render
- Order form works (test với throwaway phone)
- Confirmation page shows QR
- Zalo notification received (Phase 4 verify)

### 10. End-to-end UAT (anh + Huy)

**10.1. Anh test:**
- Place order khac slug khác, COD payment
- Login Directus → see order, mark paid
- Receive Zalo "đã xác nhận paid"
- Edit `Miền Nam của Huy` description → verify updates trên `/sach/mien-nam-cua-huy` after revalidate (5min ISR or trigger `revalidatePath` manually)

**10.2. Huy test (no help from anh):**
- Login Directus với editor creds
- Edit "Góc Phần Tư" description
- Upload thêm 1 ảnh gallery
- Verify public site reflects (after ISR)
- Cannot access site_settings (permission denied)
- Time tracked: target <30min for first task

**10.3.** Document any UX issues found → fix or log Phase 6.

### 11. Pre-launch checklist (Phase 5 ship gate)
- [ ] DNS confirmed `sachcuahuy.vercel.app` resolves (default Vercel)
- [ ] Vercel build green, deployment successful
- [ ] All env vars set Production tier (Directus URL, public + api-orders tokens, COOKIE_SECRET)
- [ ] Directus + Postgres backups verified (test restore từ latest snapshot)
- [ ] Phase 4 smoke test passes T-1 hour: 1 test order → Zalo received <10s
- [ ] Lighthouse scores meet targets
- [ ] Anh + Huy UAT pass
- [ ] Document `~/marketing-tasks/projects/goclaw-config/sachcuahuy-launch-runbook.md` (incident response, rollback steps)

**Note:** "Zalo channel healthy 24h" moved to post-launch observation gate (Section 13). Phase 5 cannot wait 24h to ship; instead Phase 5 ships once T-1 smoke test passes, then 7-day observation gate confirms stability.

### 13. Post-launch observation gate (7-day window)

After Phase 5 deploy, monitor for 7 days. **NOT a Phase 5 ship blocker** — Phase 5 ships first, observation runs in parallel.

**Daily checks (5min/day):**
- [ ] Day 1: 1 real test order end-to-end → Zalo noti within 10s; verify Directus `notification_status=sent`
- [ ] Day 1-7: Check `notification_status=failed` count daily — target zero
- [ ] Day 1-7: Zalo channel `connected` status (`curl /v1/channels/instances/<id>` mỗi sáng)
- [ ] Day 1-7: Vercel error rate <1% (Vercel Analytics)
- [ ] Day 1-7: Lighthouse scores stable (sample 1 page/day, no regression >5%)
- [ ] Day 1-7: First customer order received (Plan-level Definition of Done)

**Failure criteria (rollback or hot-fix):**
- 3+ failed notifications same day → investigate relay logs + GoClaw status
- Zalo channel disconnected >1h → re-pair runbook
- Vercel error rate >5% → rollback deploy
- Lighthouse Perf <70 → image/JS regression analysis

**End of 7-day gate:**
- All checks pass → declare launch successful, move to Phase 6 backlog
- Failures → document journal, plan remediation

### 12. Launch announcement (optional, defer post-Phase 5)
- Anh post on social: Zalo OA, Facebook, Instagram (manual or `/social` skill)
- Track first 24h orders + notification success rate
- Address top issues hot-fix style

## Todo Checklist

- [ ] Build podcast placeholder page (`/podcast`)
- [ ] Add `/podcast` link in nav + footer
- [ ] Implement global metadata trong layout.tsx
- [ ] Implement per-page generateMetadata (book detail, sach, gioi-thieu)
- [ ] Add JSON-LD Organization + Book schemas
- [ ] Build dynamic `sitemap.ts` + `robots.ts`
- [ ] Install + enable Vercel Analytics + Speed Insights
- [ ] Mobile QA pass (5 device widths × 7 pages)
- [ ] A11y audit (Lighthouse + manual)
- [ ] Lighthouse mobile scores: Perf>85, A11y>95, SEO>95
- [ ] Production Vercel env vars confirmed
- [ ] Production deploy successful
- [ ] Anh UAT test pass (order flow + admin edit)
- [ ] Huy UAT test pass (<30min unassisted edit task)
- [ ] Backups verified (Directus + Postgres + uploads)
- [ ] T-1 smoke test passes (1 test order → Zalo <10s)
- [ ] Launch runbook documented
- [ ] Schedule 7-day post-launch observation gate (Section 13)
- [ ] Optional: launch announcement

## Success Criteria (Phase 5 ship gate)

- [ ] Lighthouse mobile cho `/`, `/sach`, `/sach/[slug]`: Perf >85, A11y >95, SEO >95, BP >95
- [ ] All pages render no console error trong production build
- [ ] Mobile 375px → 414px no horizontal scroll, all CTA tappable
- [ ] OG image valid (test Facebook Debugger + Twitter Card Validator)
- [ ] Sitemap includes all 5 static pages + 2 book detail pages
- [ ] Anh complete order test end-to-end <3min
- [ ] Huy complete first edit task <30min unassisted
- [ ] T-1 smoke test: 1 test order → Zalo noti <10s

## Post-launch Observation Gate (7-day window)

- [ ] First real customer order received within 7 days (Plan-level DoD)
- [ ] Notification success rate >99% (Phase 4 retry queue)
- [ ] Zero PII leaks (no shipping_address in URL, logs)
- [ ] Zalo channel `connected` 7/7 days
- [ ] Vercel error rate <1%

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Lighthouse Perf <85 do image size | Medium | Medium | Phase 3 already optimized; Vercel Image component default optimization; defer JS code splitting if needed |
| Vercel build fail prod (env vars missing) | Medium | High | Pre-deploy env audit Step 11; rollback to previous deployment 1-click |
| Mobile UX break trên iPhone SE narrow viewport | Medium | Medium | QA Step 6 explicit; Tailwind mobile-first default catches most |
| Huy struggle Directus UI → onboarding fail | Medium | Medium | Field hints + helper text Phase 1; fallback screencast tutorial |
| ISR cache stale → Huy edit không hiện ngay | Low | Low | Document anh trigger `revalidatePath` qua admin nếu cần; webhook Phase 6 |
| OG image fail render social share | Medium | Low | Test Facebook Debugger; fallback static `/og-default.webp` |
| Zalo channel auth expire mid-launch | Low | High | Healthcheck Phase 6; manual re-pair runbook |
| Anh chưa quen response time của ISR (5min) | Medium | Low | Document expected behavior; add "Last updated" timestamp on book pages (Phase 6) |
| 404 sau launch (broken nav) | Low | Medium | Crawl test với `npx wget --spider --recursive`; manual click-through Step 11 |
| Search engines chưa index → no organic traffic | Expected | N/A | Submit Google Search Console post-launch; sitemap auto-discovered |

## Security

- **Headers:** Vercel default secure (HSTS, X-Frame-Options, CSP TBD post-launch)
- **HTTPS:** Vercel auto SSL on `*.vercel.app`
- **API rate limit:** Vercel default; consider Upstash post-launch nếu abuse
- **No PII in URLs:** `order_token` is opaque 16-char nanoid (~10^25 entropy), no PII leaked qua sitemap (only public books)
- **Robots disallow:** `/api/`, `/dat-hang`, `/xac-nhan/` (PII pages)
- **CSP:** defer post-launch (Phase 6) — implement strict policy after monitoring
- **`/xac-nhan/[token]` access:** v2 default — phone-last-4 gate (Phase 2) + per-order verify-attempt lock (Phase 1 schema, v2.1: 5 fails / 15min lock); per-IP rate-limit deferred to Phase 6 if abuse observed
- **Vercel env vars:** all sensitive in Vercel encrypted store, not in repo

## Next Steps

After Phase 5 launch:
- Monitor first 7 days metrics (orders, notification success, Lighthouse, errors)
- Address P0 issues hot-fix
- Plan Phase 6 backlog:
  - Customer accounts + login
  - Refund flow (Q6)
  - Email backup notification (Q8)
  - Cron 5p re-notify pending orders
  - Customer Zalo confirmation noti
  - Domain purchase + DNS migration
  - Podcast feature build-out
  - Real-time `revalidatePath` qua Directus webhook
  - CSP policy implementation
  - On-demand OG image generation `/api/og/[slug]`

## Unresolved Questions

- Subscribe form trong `/podcast` lưu đâu? Directus `subscribers` collection mới hay defer? → Recommend: defer Phase 6, Phase 5 chỉ show "Coming Soon" tĩnh.
- OG image dynamic generation cho mỗi sách → on-demand `/api/og/[slug]` (better) hay Directus transform 1200x630 (simpler)? → Recommend Directus transform MVP, on-demand Phase 6.
- Vercel domain purchase: `sachcuahuy.com` available? When buy? → Defer post-launch, Vercel free domain works MVP.
- Google Search Console + Bing Webmaster setup khi nào? → Recommend day 1 post-launch.
- "Last updated" timestamp UX cần thiết không? → Defer Phase 6 nếu Huy không complain.

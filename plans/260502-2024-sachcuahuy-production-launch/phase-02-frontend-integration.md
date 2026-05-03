---
phase: 2
title: "Frontend Integration"
status: pending
priority: P1
effort: "1.5d"
dependencies: [1]
---

# Phase 2: Frontend Integration

## Context Links

- **Plan overview:** [plan.md](./plan.md)
- **Brainstorm:** [brainstorm-260502-1601-website-ban-sach-architecture.md](../reports/brainstorm-260502-1601-website-ban-sach-architecture.md)
- **Phase 1:** [phase-01-directus-setup.md](./phase-01-directus-setup.md) — must be complete
- **Directus SDK docs:** https://docs.directus.io/guides/sdk/getting-started.html
- **VietQR.io API:** https://vietqr.io/danh-sach-api (image generation endpoint)
- **Next.js 15 ISR:** https://nextjs.org/docs/app/api-reference/functions/revalidatePath

## Overview

Replace hardcoded `src/lib/data.ts` với Directus SDK calls. Real `OrderForm` POST API. Generate VietQR for bank payment. Fix bank info (VPBank → VCB). Add "Góc Phần Tư". ISR 5min cho catalog pages.

## Requirements

### Functional
- All book/page/site_settings data từ Directus (no hardcoded)
- Order form POST `/api/orders` → Directus REST với **service-side token** (`DIRECTUS_API_ORDERS_TOKEN`, public role có 0 permission cho orders) → return `order_token` + bank info
- Confirmation URL `/xac-nhan/[order_token]` — opaque 16-char nanoid, NOT enumerable `order_code`
- Confirmation page requires phone last-4 digit verification để show full PII (address, phone, email)
- VietQR image render với amount + memo `{name} - {phone}`
- Bank info correct: VCB 0181003488345 - Nguyễn Trọng Huy
- Shipping logic: HCM/HN free, others 25k flat (from `site_settings`)
- 2 sách live trên `/`, `/sach`, `/sach/[slug]`
- Stock badge "Còn hàng" / "Hết hàng" UI based on `stock_status`
- Disable "Đặt hàng" button when `stock_status=out_of_stock`

### Non-functional
- ISR revalidate 300s cho `/sach`, `/sach/[slug]` (dynamic catalog)
- Order form submit p95 <2s end-to-end
- LCP `/` <1.5s từ VN 4G
- Type safety: Directus types generated từ schema
- Graceful degradation: nếu Directus down → show cached static OR friendly error

## Architecture

```
Vercel Edge (Next.js 15 SSR/ISR)
│
├── src/lib/directus.ts ──┐
│   - createDirectus()    │
│   - readItems(...)      │
│   - createItem(...)     │
│                         │ HTTPS REST
│                         ▼
│                    cms.sachcuahuy.com (Directus 11)
│
├── src/lib/site-config.ts (cached site_settings, ISR 1h)
├── src/lib/books.ts (catalog queries with revalidate 300s)
│
├── app/api/orders/route.ts (POST handler)
│   1. Validate input (Zod schema)
│   2. Calc total + shipping (from site_settings)
│   3. Generate order_code SCH-YYMMDD-NNNN
│   4. POST Directus /items/orders
│   5. Return { order_code, bank_qr_url, total, bank_info }
│
└── components/checkout/order-form.tsx
    - Real submit → /api/orders
    - Show bank QR (img src VietQR) on success
    - Show `order_code` (display only) + redirect to /xac-nhan/[order_token]
```

## Related Code Files

### Create
- `src/lib/directus.ts` — Directus SDK clients (`directus` public, `directusOrders` write)
- `src/lib/site-config.ts` — fetch + cache site_settings
- `src/lib/books.ts` — catalog queries (replace `data.ts` exports)
- `src/lib/order.ts` — order helpers (codes, tokens, shipping, memo, phone-last-4 verify)
- `src/lib/vietqr.ts` — VietQR URL builder
- `src/lib/types-directus.ts` — TS types for collections (manual or generated)
- `src/app/api/orders/route.ts` — POST endpoint (creates order + token)
- `src/app/api/orders/[token]/verify/route.ts` — POST phone-last-4 verify, sets cookie
- `src/app/xac-nhan/[token]/page.tsx` — confirmation page (token-based URL)
- `.env.local` — `DIRECTUS_URL`, `DIRECTUS_PUBLIC_TOKEN`, `DIRECTUS_API_ORDERS_TOKEN`, `COOKIE_SECRET`
- `.env.example` — template (commit-safe)

### Modify
- `src/lib/data.ts` — keep `formatPrice()`, `Book` type; remove hardcoded `books` array (or mark deprecated, switch consumers)
- `src/components/home/books-section.tsx` — async server component, fetch `getBooks()`
- `src/components/book/book-card.tsx` — pass `stock_status`, render badge
- `src/app/page.tsx` — async, fetch books + author from site_settings
- `src/app/sach/page.tsx` — `export const revalidate = 300`
- `src/app/sach/[slug]/page.tsx` — `generateStaticParams` từ Directus, ISR
- `src/app/dat-hang/page.tsx` — fetch site_settings cho shipping logic
- `src/components/checkout/order-form.tsx` — real fetch POST + show success state
- `next.config.ts` — add `cms.sachcuahuy.com` to `images.remotePatterns` (replace supabase entry)
- `package.json` — add `@directus/sdk`, `zod`
- `src/components/home/author-section.tsx` — fetch author from site_settings

### Delete
- N/A — keep `data.ts` for type definitions (mark legacy comments)

## Implementation Steps

### 1. Install dependencies
```bash
npm install @directus/sdk zod nanoid
```
- `nanoid` for opaque `order_token` generation (URL-safe, 16 chars = ~10^25 entropy)

### 2. Create Directus client
Write `src/lib/directus.ts`:
```ts
import { createDirectus, rest, staticToken } from '@directus/sdk';
import type { Schema } from './types-directus';

// Public client (read-only, catalog browsing — no token needed since public role has read perm)
export const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_PUBLIC_TOKEN!));

// Server-side client for writing orders (uses api-orders role token, server-only env)
export const directusOrders = createDirectus<Schema>(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_API_ORDERS_TOKEN!));
```
**Important:** `DIRECTUS_API_ORDERS_TOKEN` is server-only — never `NEXT_PUBLIC_*` prefix. Used only trong `app/api/orders/route.ts`.

### 3. Define TS types from schema
Write `src/lib/types-directus.ts` mirror Phase 1 collections:
```ts
export interface DirectusFile { id: string; filename_download: string; }
export interface Book {
  id: string; slug: string; title: string; subtitle?: string;
  author: string; description: string; short_description: string;
  price: number; compare_price?: number;
  stock_status: 'in_stock' | 'out_of_stock';
  cover_image: DirectusFile | string;
  gallery: DirectusFile[]; isbn: string; publisher: string;
  published_date: string; page_count: number;
  is_new: boolean; is_coming_soon: boolean;
  status: 'draft' | 'published' | 'archived';
}
// Order, Customer, SiteSettings, Page, PodcastEpisode similar...
export interface Schema {
  books: Book[]; orders: Order[]; customers: Customer[];
  site_settings: SiteSettings; pages: Page[]; podcast_episodes: PodcastEpisode[];
}
```

### 4. Books fetch helpers
Write `src/lib/books.ts`:
```ts
import { directus } from './directus';
import { readItems } from '@directus/sdk';

export async function getBooks() {
  return directus.request(readItems('books', {
    filter: { status: { _eq: 'published' } },
    sort: ['sort_order', '-is_new'],
    fields: ['*', 'cover_image.*', 'gallery.*'],
  }));
}

export async function getBookBySlug(slug: string) {
  const [book] = await directus.request(readItems('books', {
    filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
    limit: 1,
    fields: ['*', 'cover_image.*', 'gallery.*'],
  }));
  return book;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}
```

### 5. Site config helpers
Write `src/lib/site-config.ts`:
```ts
import { directus } from './directus';
import { readSingleton } from '@directus/sdk';

export async function getSiteSettings() {
  return directus.request(readSingleton('site_settings', {
    fields: ['*', 'author_image.*'],
  }));
}
```

### 6. Order helpers + VietQR
Write `src/lib/vietqr.ts`:
```ts
// VietQR.io image API: https://img.vietqr.io/image/{bank}-{account}-{template}.png?amount=&addInfo=&accountName=
export function buildVietQRUrl(p: {
  bank: string; account: string; amount: number;
  memo: string; accountName: string;
}) {
  const base = `https://img.vietqr.io/image/${p.bank.toLowerCase()}-${p.account}-compact2.png`;
  const qs = new URLSearchParams({
    amount: String(p.amount),
    addInfo: p.memo,
    accountName: p.accountName,
  });
  return `${base}?${qs}`;
}
```

Write `src/lib/order.ts`:
```ts
import { customAlphabet } from 'nanoid';

const ORDER_TOKEN_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // no I/L/O/0/1 ambiguity
const generateNanoid = customAlphabet(ORDER_TOKEN_ALPHABET, 16);

// Human-readable code for admin UI (acceptable enumerable in admin context)
export function generateOrderCode(): string {
  const d = new Date();
  const yymmdd = d.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SCH-${yymmdd}-${rand}`;
}

// Opaque token for public confirmation URL (~10^25 entropy, not enumerable)
export function generateOrderToken(): string {
  return generateNanoid();
}

export function calcShipping(city: string, settings: SiteSettings): number {
  const free = (settings.shipping_free_cities as string[]) || [];
  if (free.includes(city.toLowerCase())) return 0;
  return settings.shipping_flat_fee;
}

export function buildMemo(name: string, phone: string, format: string): string {
  return format.replace('{name}', name).replace('{phone}', phone);
}

// Phone last-4 verification helper (timing-safe compare)
export function verifyPhoneLast4(stored: string, provided: string): boolean {
  const a = stored.slice(-4);
  const b = provided.trim();
  if (a.length !== 4 || b.length !== 4) return false;
  let mismatch = 0;
  for (let i = 0; i < 4; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
```

### 7. POST /api/orders endpoint
Write `src/app/api/orders/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { directusOrders } from '@/lib/directus';
import { createItem, readItems } from '@directus/sdk';
import { getSiteSettings } from '@/lib/site-config';
import { getBookBySlug } from '@/lib/books';
import { generateOrderCode, generateOrderToken, calcShipping, buildMemo } from '@/lib/order';
import { buildVietQRUrl } from '@/lib/vietqr';

const OrderSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().regex(/^0[0-9]{9,10}$/),
  customer_email: z.string().email().optional().or(z.literal('')),
  shipping_city: z.string().min(1),
  shipping_district: z.string().min(1),
  shipping_address: z.string().min(5),
  note: z.string().max(500).optional(),
  payment_method: z.enum(['cod', 'bank']),
  items: z.array(z.object({
    slug: z.string(),
    qty: z.number().int().min(1).max(10),
  })).min(1),
});

async function generateUniqueToken(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const token = generateOrderToken();
    const existing = await directusOrders.request(readItems('orders', {
      filter: { order_token: { _eq: token } }, limit: 1, fields: ['id'],
    }));
    if (existing.length === 0) return token;
  }
  throw new Error('token_collision_max_retries');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrderSchema.parse(body);

    const settings = await getSiteSettings();

    // Resolve book prices server-side (anti price-tampering)
    const itemsResolved = await Promise.all(parsed.items.map(async (i) => {
      const book = await getBookBySlug(i.slug);
      if (!book || book.stock_status === 'out_of_stock') {
        throw new Error(`Sách ${i.slug} không khả dụng`);
      }
      return { book_id: book.id, slug: book.slug, title: book.title, qty: i.qty, price: book.price };
    }));

    const subtotal = itemsResolved.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping_fee = calcShipping(parsed.shipping_city, settings);
    const total = subtotal + shipping_fee;
    const order_code = generateOrderCode();
    const order_token = await generateUniqueToken();

    await directusOrders.request(createItem('orders', {
      order_code, order_token,
      customer_name: parsed.customer_name, customer_phone: parsed.customer_phone,
      customer_email: parsed.customer_email || null,
      shipping_city: parsed.shipping_city, shipping_district: parsed.shipping_district,
      shipping_address: parsed.shipping_address, note: parsed.note || null,
      items: itemsResolved, subtotal, shipping_fee, total,
      payment_method: parsed.payment_method, payment_status: 'pending', order_status: 'new',
      notification_status: 'pending',
    }));

    const memo = buildMemo(parsed.customer_name, parsed.customer_phone, settings.memo_format);
    const qr_url = parsed.payment_method === 'bank'
      ? buildVietQRUrl({
          bank: settings.bank_name, account: settings.bank_account,
          amount: total, memo, accountName: settings.bank_holder,
        })
      : null;

    // Return order_token (used in URL), order_code (for reference only — not URL key)
    return NextResponse.json({
      order_token, order_code, total, qr_url,
      confirmation_url: `/xac-nhan/${order_token}`,
      bank: parsed.payment_method === 'bank' ? {
        name: settings.bank_name, account: settings.bank_account,
        holder: settings.bank_holder, branch: settings.bank_branch, memo,
      } : null,
    });
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'invalid_input', issues: e.issues }, { status: 400 });
    console.error('order_error', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
```

### 8. Refactor `OrderForm` component
- Replace `await new Promise(setTimeout(...))` với real `fetch('/api/orders', { method: 'POST', body: JSON.stringify({...}) })`
- After success: redirect `router.push(response.confirmation_url)` (uses `order_token`, not `order_code`)
- Error handling: show inline error message
- Disable "Đặt hàng" button khi `stock_status=out_of_stock` (pass via prop)

### 9. Order confirmation page (PII-safe)

Write `src/app/xac-nhan/[token]/page.tsx`:
- Fetch order by `order_token` (server-side, `directusOrders` token)
- **Default view (no auth):** show only public-safe fields:
  - `order_code` (display only)
  - `items` (titles + qty + price)
  - `total`
  - `payment_method` + bank QR (if bank)
  - `order_status` pill, `payment_status` pill
  - Phone last-4 verification form (`<input maxlength="4" pattern="[0-9]{4}">`)
- **After phone last-4 verified (POST `/api/orders/[token]/verify`):**
  - Reveal full PII: `shipping_address`, full `customer_phone`, `customer_email`
  - Set short-lived signed cookie (`order-pii-{token}`, max-age 10min, httpOnly)

Write `src/app/api/orders/[token]/verify/route.ts`:
- Read `order_token` from URL, `phone_last_4` from body
- Fetch order via `directusOrders` (server token) — selects `customer_phone`, `verify_attempts`, `verify_locked_until`
- **Lock check (v2.1):** if `verify_locked_until > now()` → return 423 `locked_until=<ts>`, no compare attempted
- Use `verifyPhoneLast4` from `lib/order.ts` (timing-safe compare)
- **On match:** PATCH `orders` with `verify_attempts=0`, `verify_locked_until=null`, `verify_last_attempt_at=now()`; set signed cookie + return success
- **On mismatch:** PATCH `orders` with `verify_attempts=verify_attempts+1`, `verify_last_attempt_at=now()`. If new count ≥ 5 → also set `verify_locked_until=now()+15min`. Return 401.
- Per-order lock implements MVP brute-force defense (deferring per-IP rate limit to Phase 6 if abuse observed)

**Why this design:**
- Token alone insufficient to leak PII (lost link scenarios)
- Phone last-4 = something user knows
- Even guessing 4-digit phone = 0.01% per try, combined với token entropy = effectively safe
- `order_code` không bao giờ là URL key

### 10. Refactor server components
- `src/app/page.tsx`: `const books = await getBooks(); const settings = await getSiteSettings();`
- `src/app/sach/page.tsx`: `export const revalidate = 300; const books = await getBooks();`
- `src/app/sach/[slug]/page.tsx`:
  ```ts
  export async function generateStaticParams() {
    const books = await getBooks();
    return books.map(b => ({ slug: b.slug }));
  }
  export const revalidate = 300;
  ```
- `src/app/dat-hang/page.tsx`: `const settings = await getSiteSettings(); ... shipping = calcShipping(city, settings)`

### 11. Image config + Directus assets
- Update `next.config.ts` (resolve hostname from env at build time):
  ```ts
  const directusHost = new URL(process.env.DIRECTUS_URL!).hostname;
  // ...
  images: { remotePatterns: [{ protocol: 'https', hostname: directusHost }] }
  ```
- For client-side `<Image>` src, use `NEXT_PUBLIC_DIRECTUS_ASSETS_URL` (public env, set to `https://cms.sachcuahuy.com`):
  ```tsx
  <Image src={`${process.env.NEXT_PUBLIC_DIRECTUS_ASSETS_URL}/assets/${file.id}?width=800&format=webp`} />
  ```

### 12. Environment vars
`.env.local`:
```
DIRECTUS_URL=https://cms.sachcuahuy.com
DIRECTUS_PUBLIC_TOKEN=<public role token, read-only catalog>
DIRECTUS_API_ORDERS_TOKEN=<api-orders role token, server-only>
NEXT_PUBLIC_DIRECTUS_ASSETS_URL=https://cms.sachcuahuy.com   # client-side image src
NEXT_PUBLIC_SITE_URL=http://localhost:3000
COOKIE_SECRET=<openssl rand -hex 32, server-only — for signed PII cookie>
```
Vercel Production: same vars + `NEXT_PUBLIC_SITE_URL=https://sachcuahuy.vercel.app`
Vercel Preview: optional separate Directus instance OR share Production with read-only token.

**No `DIRECTUS_ADMIN_TOKEN`** in Vercel — admin tasks (image upload Phase 3) use ad-hoc tokens not committed.

### 13. Smoke test local
```bash
npm run dev
# 1. Open http://localhost:3000 → 2 books render từ Directus
# 2. /sach/mien-nam-cua-huy → detail page
# 3. /dat-hang → fill form → submit
# 4. Verify Directus admin → orders table có record mới (order_token populated)
# 5. /xac-nhan/<token> → public view (no PII, QR if bank)
# 6. Enter phone last-4 → reveal full address
# 7. Try wrong phone last-4 → 401, no PII leaked
# 8. Try /xac-nhan/<random-non-existent-token> → 404
```

### 14. Build check
```bash
npm run build
# Expect: no TS errors, ISR generation succeeds, bundle size <300KB initial JS
```

## Todo Checklist

- [ ] Install `@directus/sdk` + `zod` + `nanoid`
- [ ] Write `src/lib/directus.ts` (`directus` + `directusOrders` clients, no admin token)
- [ ] Define TS types in `src/lib/types-directus.ts` (include `order_token`, `notification_status`)
- [ ] Write `src/lib/books.ts` (replace `data.ts` exports)
- [ ] Write `src/lib/site-config.ts`
- [ ] Write `src/lib/vietqr.ts` + `src/lib/order.ts` (token gen + phone-last-4 timing-safe)
- [ ] Implement `POST /api/orders` with token generation + collision retry
- [ ] Implement `POST /api/orders/[token]/verify` (phone-last-4 gate + per-order lock: 5 fails / 15min lock)
- [ ] Refactor `OrderForm` real submit + redirect via `confirmation_url`
- [ ] Build `/xac-nhan/[token]/page.tsx` (PII-safe default, reveal after verify)
- [ ] Refactor `/`, `/sach`, `/sach/[slug]`, `/dat-hang` to use Directus
- [ ] Update `next.config.ts` images.remotePatterns to `cms.sachcuahuy.com`
- [ ] Add `.env.local` + Vercel env vars (no admin token)
- [ ] Update `books-section`, `book-card`, `author-section` for new data shape
- [ ] Add stock_status badge UI
- [ ] Disable order button when out_of_stock
- [ ] Test end-to-end local (form → DB → confirm page)
- [ ] Verify wrong phone last-4 returns 401 + no PII leak
- [ ] After 5 wrong phone-last-4 attempts: order locked 15min, returns 423
- [ ] After successful verify: `verify_attempts` resets to 0
- [ ] `npm run build` passes
- [ ] Vercel preview deploy succeeds

## Success Criteria

- [ ] Home page shows 2 sách từ Directus (no hardcoded)
- [ ] `/sach/goc-phan-tu` renders đúng (description từ Q2 manuscript)
- [ ] `/sach/mien-nam-cua-huy` renders đúng (giữ data cũ, từ Directus)
- [ ] Submit order → record xuất hiện trong Directus admin (with `order_token` populated)
- [ ] Confirmation URL is `/xac-nhan/<16-char-token>` (not `/xac-nhan/SCH-...`)
- [ ] Default confirmation view shows QR + items + total — **no PII** (address/phone hidden)
- [ ] After phone last-4 verify → full PII reveals
- [ ] Wrong phone last-4 → 401, no PII leaked, response time constant (timing-safe)
- [ ] Random token guess `/xac-nhan/aaaaaaaaaaaaaaaa` → 404
- [ ] HCM/HN order → ship 0đ; tỉnh khác → 25k
- [ ] Anonymous `POST /items/orders` directly → 403 (Phase 1 perm enforce)
- [ ] `npm run build` no errors, no warnings (TS strict)
- [ ] Vercel preview URL deploys + page loads <2s
- [ ] Stock badge "Hết hàng" hiển thị khi set qua Directus

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Directus API latency >500ms từ Vercel SG | Medium | Medium | Vercel Edge runtime + ISR cache; consider Vercel region SG |
| Client tampering với price (fake low price) | Medium | High | Server resolves price từ DB (Step 7), never trust client |
| Order submitted nhưng Directus down → user thấy success ảo | Low | High | Try/catch in API route, return 503 với friendly message |
| VietQR image API rate limit | Low | Medium | Cache QR URL (deterministic per order); fallback text bank info |
| TS schema drift sau khi Huy edit Directus | Medium | Medium | Run `npx directus types` periodically; CI lint Phase 5 |
| Hardcoded `data.ts` import vẫn còn somewhere | Medium | Low | Grep `from "@/lib/data"` sau refactor; remove all consumers |
| ISR stale cache khi anh thêm sách | Low | Low | `revalidate 300` đủ; manual `revalidatePath('/sach')` qua webhook (Phase 4) |
| Form bypass JS validation (curl) | High | Low | Zod server-side, regex phone, max length checks |

## Security

- **Server-side price resolution:** never trust `price` from client (fetch fresh từ DB)
- **Phone regex:** `/^0[0-9]{9,10}$/` (VN format), prevent injection
- **Zod validation:** strict schema, max lengths to prevent DoS
- **Admin token:** never expose client-side, only in `app/api/*` routes
- **CORS:** Directus already whitelist Vercel domain (Phase 1)
- **Rate limit:** Vercel Edge function default rate limit (consider Upstash if abuse — Phase 6)
- **PII handling:** `customer_phone`/`customer_email` only stored in Directus, never logged to Vercel logs (use structured logger filter)
- **CSRF:** Next.js App Router default = same-origin POST OK; no token needed for API route from same domain

## Next Steps

After Phase 2 complete:
- → Phase 3: Upload classified images to Directus, link via `cover_image`/`gallery`
- → Phase 4: Wire Directus Flow `orders.create` → GoClaw webhook → Zalo noti
- → Phase 5: SEO meta, podcast placeholder, mobile QA, Lighthouse

## Unresolved Questions

- ISR revalidate 300s OK hay cần on-demand `revalidatePath` qua Directus webhook? (Phase 4 sẽ wire if cần)
- Có cần manual fallback bank info text khi VietQR image fail? Currently có (Step 9), confirm UI
- Order code collision: `order_code` cosmetic only (admin rename if needed). `order_token` collision retry up to 5x (10^25 entropy → effectively zero risk)
- Phone last-4 brute force: 0.01% per try, combined với token entropy = 10^-29 effective. Rate-limit defer Phase 6 unless abuse observed
- Confirmation page session: 10min cookie OK? Hoặc fresh phone-verify mỗi lần page load (annoying but safer)? — Recommend 10min cookie cho UX
- Phase 6 follow-up: rate limit `/verify` endpoint (5 attempts / IP / 15min) qua Upstash Redis

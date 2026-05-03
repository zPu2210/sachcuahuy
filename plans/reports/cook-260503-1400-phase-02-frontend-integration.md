---
type: cook
date: 2026-05-03 14:00 (addendum 15:34)
phase: 2
slug: phase-02-frontend-integration
status: complete-with-fixes
plan: plans/260502-2024-sachcuahuy-production-launch/
---

> **Addendum 2026-05-03 15:34** — 3 follow-up fixes applied before commit (P1 privacy, lock-window reset, lint script). See bottom of file for details.

# Phase 2 Cook Report — Frontend Integration

## Summary

Next.js frontend wired to Directus 11. Hardcoded `data.ts` deleted; books/site_settings/pages now fetched server-side with ISR 5min. Order create POSTs server-side via `DIRECTUS_API_ORDERS_TOKEN` (server-only). Confirmation URL uses opaque 16-char nanoid `order_token`. PII (address/email/note/district/city) gated behind phone-last-4 verify with HMAC-signed cookie + per-order lock (5 fails / 15min).

`npm run build` clean. End-to-end smoke 9/9 pass against live Directus (cms.sachcuahuy.com).

## Verified Outcomes

| # | Item | Evidence |
|---|---|---|
| 1 | Directus reads work anon | `/`, `/sach`, `/sach/[slug]`, `/gioi-thieu` all 200; books rendered |
| 2 | `npm run build` clean | 8 routes, 2 SSG params (mien-nam-cua-huy, goc-phan-tu), ISR 5m |
| 3 | Zod validation | empty body → 400 with 7 issues |
| 4 | Order create COD | 200; total 99k for goc-phan-tu HCM (free ship); record in DB |
| 5 | Order create BANK | 200; total 383k = 179k×2 + 25k flat for Hai Phong; QR URL valid |
| 6 | VietQR URL | `https://img.vietqr.io/image/vcb-0181003488345-compact2.png?amount=…&addInfo=…&accountName=NGUYEN+TRONG+HUY` |
| 7 | Confirm page no-cookie | NO `shipping_address` in HTML or RSC payload; verify form rendered |
| 8 | Confirm page w/ cookie | Address visible after right phone-last-4 |
| 9 | Wrong phone-last-4 | 401 with attempts counter |
| 10 | Lock at 5 fails | 423 with `locked_until` ISO timestamp |
| 11 | Lock holds even on right answer | After lock: right answer → 423 (not 200) |
| 12 | Random token | `/xac-nhan/aaaaaaaaaaaaaaaa` → 404 |
| 13 | Anon `POST /items/orders` blocked | Phase 1 perm enforced (verified Phase 1 cook report) |

## File Manifest

### New
```
src/lib/types-directus.ts          # collection types
src/lib/directus.ts                # SDK clients (public + orders) + assets URL builder
src/lib/site-config.ts             # readSingleton site_settings
src/lib/books.ts                   # readItems books + formatPrice (replaces data.ts)
src/lib/order.ts                   # token gen, shipping, memo, phone-last-4 timing-safe, HMAC cookie
src/lib/vietqr.ts                  # VietQR.io URL builder
src/app/api/orders/route.ts        # POST: zod + price resolve + token retry + create order
src/app/api/orders/[token]/verify/route.ts   # POST: lock check + verify + cookie set + state PATCH
src/app/xac-nhan/[token]/page.tsx  # server component, conditional fetch (PII-safe vs full)
src/app/xac-nhan/[token]/verify-form.tsx     # client component for phone-last-4
.env.example                       # commit-safe template
.env.local                         # secrets (chmod 600, gitignored via *.local)
```

### Modified
```
src/components/checkout/order-form.tsx   # real fetch /api/orders + router.push
src/components/book/book-card.tsx        # Directus shape + stock_status badge + add-to-cart link
src/components/home/{hero,books,cta,author}-section.tsx   # accept props from server pages
src/app/page.tsx                         # async server, getBooks + getSiteSettings, ISR 300s
src/app/sach/page.tsx                    # ISR 300s + Directus
src/app/sach/[slug]/page.tsx             # generateStaticParams + ISR + stock badge + dat-hang link
src/app/dat-hang/page.tsx                # async, settings + book by ?slug=, pass to OrderForm
src/app/gioi-thieu/page.tsx              # author bio HTML from settings, fallback constants
next.config.ts                           # images.remotePatterns from DIRECTUS_URL hostname + img.vietqr.io + dicebear
package.json                             # +@directus/sdk +zod +nanoid; engines node>=22 <26
```

### Deleted
```
src/lib/data.ts                          # hardcoded books/authorInfo/getBookBySlug/formatPrice
                                          # (formatPrice moved to src/lib/books.ts)
```

## Plan Deviations

| Plan said | Actual | Reason |
|---|---|---|
| `DIRECTUS_PUBLIC_TOKEN` env var + `staticToken()` on public client | Anonymous client (no token) | Phase 1 grants public read perm; no token needed. Token would add useless auth header. |
| `Book` interface fields incl. `gallery: DirectusFile[]` | Removed `gallery` | Directus collection has no `gallery` field (only `cover_image`); will reconsider Phase 3 if multi-image needed. |
| `sort: ['sort_order', '-is_new']` query | `sort: ['sort_order', '-created_at']` | Directus default sort field is `sort_order` not `sort`; timestamp field is `created_at` not `date_created`. |
| `SiteSettings.author_name`, `author_title`, `author_full_bio`, `author_location` | Hardcoded constants in `page.tsx` + `gioi-thieu/page.tsx` | Schema actually has only `author_bio` (HTML), `author_short_bio`, `author_image`. `author_name`/`author_title`/`author_location` constants live in pages with `// TODO` to add to Directus if needed. |
| Single OrderForm with `items` UI | Single-book form, slug from `?slug=` query | MVP keeps simpler UX; cart/multi-item deferred (form still posts `items: [...]` so future scaling is mechanical). |
| Confirmation page fetches full order, conditional render | Conditional fetch (PUBLIC_FIELDS vs FULL_FIELDS) | RSC payload serializes the full prop tree even when JSX hides it — would leak PII in HTML source. Two-fetch pattern guarantees server never sends gated fields when unverified. |

## Critical Findings

### Bug found + fixed: RSC PII leak (P1)

Initial confirmation page implementation fetched the full order with `fields: ["*"]` and used JSX conditional render (`verified ? <PII /> : <VerifyForm />`). React Server Components serialize the entire server prop tree into the HTML's `__next_f` script tag for hydration — so `shipping_address`, `customer_email`, `note`, `shipping_district`, `shipping_city` all appeared in plain HTML even though the UI hid them.

**Fix:** Two-fetch pattern. Cookie check happens BEFORE the Directus call, and the field list is chosen based on `verified` status. Unverified responses fetch only `id, order_code, order_token, items, subtotal, shipping_fee, total, payment_method, payment_status, order_status, customer_name, customer_phone` — no shipping or contact data ever leaves the server.

`customer_name` + `customer_phone` are kept in the unverified set because they are encoded into the bank QR URL's `addInfo` param — by design, this is the "transfer memo" and is necessary for bank reconciliation. They appear in the QR image URL only; the rest of PII stays gated.

Verified: `grep -c "shipping_address"` against unverified HTML → 0; against verified HTML → 1 (with cookie).

### Schema differences from plan

Phase 2 plan was written before Phase 1 was deployed; it predicted some fields that turned out different in actual Directus schema. Updates:

- `site_settings` actually has `hero_title`, `hero_subtitle`, `social_facebook`, `social_instagram`, `social_zalo`, `contact_email`, `contact_phone`, `shipping_threshold` → none used in Phase 2 but typed for future phases.
- Books table has `seo_title`, `seo_description`, `created_at`, `updated_at` (not `date_created`/`date_updated`).
- `customer_email` regex: zod 4 `z.string().email()` works; tested via API.

## Pause Points Hit

1. ✅ **Pre-install** — confirmed npm + node 22-25, ran `npm install @directus/sdk zod nanoid`. User added `engines: ">=22 <26"`.
2. ⏸ **Pre-deploy** — DO NOT auto-deploy. Vercel env vars must be set manually in dashboard before pushing/triggering. Required:
   ```
   DIRECTUS_URL=https://cms.sachcuahuy.com
   DIRECTUS_API_ORDERS_TOKEN=<from credentials file>
   NEXT_PUBLIC_DIRECTUS_ASSETS_URL=https://cms.sachcuahuy.com
   COOKIE_SECRET=<openssl rand -hex 32, fresh per env>
   NEXT_PUBLIC_SITE_URL=https://sachcuahuy.vercel.app   # or production domain
   ```
3. ✅ **Pre-smoke** — `.env.local` populated from credentials file (chmod 600, gitignored).

## Test Orders Left in Directus

3 sandbox orders, anh can delete via admin UI:
- `SCH-260503-9130` ma5xv9yz8s4j4836 — COD HCM 99k, Test User
- `SCH-260503-5179` jzyq6fu3qxxvpdjj — BANK Hai Phong 383k, Test Bank (verify_attempts reset to 0)
- `SCH-260503-3272` 2smhgsqkjceenb3n — COD HCM 99k, Lock Test (verify_locked_until set to demonstrate lock)

## Pre-existing Issues (NOT introduced)

| Issue | Source | Severity | Action |
|---|---|---|---|
| `npm audit` reports next, picomatch, postcss vulns | Pre-existing transitives, not from new deps | medium | Defer; address in Phase 5 polish or separate dep-bump task |
| `.next/`, `.vercel/` not regenerated locally | Pre-existing build artifacts | low | Will rebuild on next CI/Vercel deploy |
| `AGENTS.md` (Codex variant) at root | Pre-existing untracked | low | Leave per session note (irrelevant for Claude work) |

## Suggested Commit Plan (scoped)

Per session policy ("don't bundle unrelated"). Stage explicitly — never `git add .`:

```bash
# Commit 1: deps + engines
git add package.json package-lock.json
git commit -m "chore(deps): add directus-sdk + zod + nanoid; pin node engines"

# Commit 2: lib layer
git add src/lib/types-directus.ts src/lib/directus.ts src/lib/site-config.ts \
        src/lib/books.ts src/lib/order.ts src/lib/vietqr.ts
git rm src/lib/data.ts
git commit -m "feat(lib): directus client + types + order helpers; remove data.ts"

# Commit 3: orders API
git add src/app/api/orders/route.ts src/app/api/orders/[token]/verify/route.ts
git commit -m "feat(api): orders create + phone-last-4 verify with lock policy"

# Commit 4: confirmation page
git add src/app/xac-nhan/
git commit -m "feat(confirm): /xac-nhan/[token] page with PII gate via signed cookie"

# Commit 5: order form
git add src/components/checkout/order-form.tsx
git commit -m "feat(checkout): order form posts to API + router redirect"

# Commit 6: pages + components refactor
git add src/app/page.tsx src/app/sach/ src/app/dat-hang/ src/app/gioi-thieu/ \
        src/components/home/ src/components/book/
git commit -m "refactor(pages): server fetch from directus + ISR + stock badge"

# Commit 7: config
git add next.config.ts .env.example
git commit -m "chore(config): images.remotePatterns from DIRECTUS_URL; add env example"
```

**DO NOT** stage: `.env.local`, `AGENTS.md`, `.agents/`, `scripts/__pycache__/`, plans/reports/* deletions (those are unrelated to Phase 2).

## Phase 3 Readiness

Phase 2 deliverables that Phase 3 will consume:
- `src/lib/directus.ts` `buildAssetUrl(fileId, {width, format})` ready for cover_image rendering once Phase 3 uploads files and sets `books.cover_image`.
- BookCard already detects `cover_image` (DirectusFile object) vs string URL fallback — no changes needed when Phase 3 lands.
- /sach/[slug] hero shows cover from Directus when `cover_image.id` populated.
- next.config.ts already whitelists Directus host for Image optimization.

Phase 3 work scope unchanged: classify Downloads/sachcuahuy/ images, upload via Directus admin or API, link to books.cover_image. Frontend will pick them up automatically on next ISR revalidate.

## Unresolved Questions

1. **Vercel Node version pinning** — current `engines: ">=22 <26"` will let Vercel pick latest in range (likely 22). Want to lock to specific minor (e.g. `~22.11`) for reproducibility?
2. **Hero section title rendering** — currently hardcoded `Miền Nam <br /> của Huy` for visual flair. When the next book becomes featured, hero needs manual update OR title-split logic. Defer until 2nd flagship?
3. **Author info source of truth** — name/title/location are hardcoded constants in `page.tsx` + `gioi-thieu/page.tsx`. Add fields to Directus `site_settings` (Phase 6 schema bump) or accept hardcoded as MVP-good-enough?
4. **Test orders cleanup** — leave 3 sandbox orders for anh to inspect, or auto-delete? Currently leaving — anh removes via admin UI.
5. **VietQR addInfo encodes phone in URL** — image URL itself contains `addInfo=Test+Bank+-+0987654321`. Even with `noindex`, anyone with the confirmation token can read the image URL → phone visible. Plan accepts this (token entropy is the gate). Confirm OK before launch.
6. **`shipping_threshold` field present in site_settings but unused** — schema has it, but order route uses `shipping_free_cities` + `shipping_flat_fee` instead. If anh wants threshold-based free shipping ("free above X đ"), need a Phase 5 schema-driven shipping rule.

---

## Addendum (2026-05-03 15:34) — Pre-commit Fixes

User requested 3 fixes before scoped commits. All applied + verified against `npm run build` and prod server smoke.

### Fix 1 — P1 confirmation-page privacy (TWO-LAYER fix)

**Layer A: QR memo no longer encodes PII.**

`buildMemo` extended to accept `MemoVars { name, phone, order_code }` and a `{order_code}` template placeholder. `site_settings.memo_format` in Directus updated from `"{name} - {phone}"` → `"{order_code}"` via admin token. Anh reconciles bank statements by `order_code` lookup in admin.

Smoke: QR URL is now `https://img.vietqr.io/image/vcb-…?addInfo=SCH-260503-1107` (no name/phone in URL).

**Layer B: RSC payload no longer ships name/phone in unverified state.**

Initial fix had a hidden bug: even with conditional fetch, name+phone were still in PUBLIC_FIELDS to support memo. Refactored:
- `SAFE_RENDER_FIELDS` (10 fields, NO PII) — JSX prop tree
- `SERVER_ONLY_FIELDS` (`customer_name`, `customer_phone`) — fetched server-side, used only for memo computation, never reach JSX
- `VERIFIED_EXTRA_FIELDS` (email, address, district, city, note) — only fetched after cookie verifies
- `toSafeRenderOrder()` projection drops PII from prop tree
- `isFullOrder()` type guard for `verified ? raw : toSafeRenderOrder(raw)` narrowing

**Prod smoke (post-fix, no cookie):**
| Check | Result |
|---|---|
| `customer_phone` in HTML | 0 ✓ |
| `customer_name` in HTML | 0 ✓ |
| `shipping_address` in HTML | 0 ✓ |
| `customer_email` in HTML | 0 ✓ |
| QR memo `SCH-260503-1107` visible | 1 ✓ |
| Verify form rendered | 1 ✓ |
| After valid verify cookie | full PII visible 1 ✓ |

**Important caveat:** Next.js **dev mode** (`npm run dev`) still leaks `customer_name`/`customer_phone` into the RSC debug payload via HMR/source-map machinery — this is dev-only and does NOT happen in `npm run build` + `npm start`. Always smoke-test against production build before declaring privacy clean.

### Fix 2 — Lock-window: reset attempts on lock expiry

**Before:** `verify_attempts` accumulated forever. After 5 fails + 15min wait, the very next wrong attempt counted as #6 → re-locked immediately (1-attempt window post-expiry).

**After:** When `verify_locked_until <= now`, baseAttempts resets to 0 before counting current attempt. Genuine users waiting out a lock get a fresh 5-attempt window. Also: route now ALWAYS overwrites `verify_locked_until` on a wrong attempt (clears stale expired-lock value when not re-locking) — keeps DB state consistent.

**Verified prod:**
- Pre-state: order id=6, attempts=5, lock at 2020-01-01 (expired)
- Wrong attempt → `{"error":"wrong_phone","attempts":1,"max":5}` ✓
- DB after: `{"verify_attempts":1,"verify_locked_until":null}` ✓

### Fix 3 — Lint script migration

`next lint` deprecated in Next 16. Migrated:
- Installed `eslint@^9` + `eslint-config-next@^15` + `@eslint/eslintrc` (devDependencies)
- Created `eslint.config.mjs` (flat config, FlatCompat → `next/core-web-vitals` + `next/typescript`)
- Ignores: `.next/**`, `node_modules/**`, `scripts/**`, `.vercel/**`, `.agents/**`, `.claude/**`, `next-env.d.ts`
- `package.json` `"lint": "eslint ."`

**Result:** 0 errors, 2 pre-existing warnings (unused imports in `features-section.tsx` + `header.tsx` — files NOT touched by Phase 2; per CLAUDE.md "surgical changes", left alone).

### Re-build / Re-smoke summary

- `npm run build` → ✓ clean (8 routes, 2 SSG params)
- `npm run lint` → 0 errors, 2 pre-existing warnings
- Prod smoke (against `npm start`):
  - Bank order create → token + order_code + total + QR with memo `SCH-…`
  - Confirmation page (no cookie) → ZERO PII fields in HTML payload
  - Phone-last-4 verify (right) → cookie set, PII reveals on refresh
  - Lock expiry reset → wrong attempt after expiry returns 1, not 6
  - Random/non-existent token → 404

### Updated commit plan

Same 7 commits, scope unchanged but now also includes:
- `eslint.config.mjs` → goes into commit 7 (config)
- `package.json` `lint` script change + new devDeps → folded into commit 1 (deps)
- New helpers in `lib/order.ts` (MemoVars, signed/PII helpers, lock constants) → already in commit 2


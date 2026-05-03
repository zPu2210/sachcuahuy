---
title: "sachcuahuy production launch — Phase 1-5"
created: 2026-05-02
revised: 2026-05-03 (Phase 2 complete; memo hardened to order_code-only)
status: in-progress
phase_1_completed: 2026-05-03
phase_1_report: plans/reports/cook-260503-1334-phase-01-directus-setup.md
phase_2_completed: 2026-05-03
phase_2_report: plans/reports/cook-260503-1400-phase-02-frontend-integration.md
priority: P1
total_effort: ~6 days
mode: hard
---

# Plan: sachcuahuy Production Launch

> **Phase 2 handoff (2026-05-03):** Frontend wired to Directus, ISR 5min, real /api/orders flow, /xac-nhan/[token] PII gate, lock-window reset on expiry, lint migrated to ESLint CLI. Code committed (8 commits + harden) and ready to push. Vercel env vars required before deploy. Phase 3 (image upload) parallel-safe. See [phase-02 report](../reports/cook-260503-1400-phase-02-frontend-integration.md).
>
> **Phase 1 handoff (2026-05-03):** Directus 11.17.4 live at https://cms.sachcuahuy.com — schema, seed data, roles, tokens, backup all verified. See [phase-01 report](../reports/cook-260503-1334-phase-01-directus-setup.md).

Migrate MVP Next.js website từ hardcoded data sang full production stack: Directus 11 CMS + Postgres trên Contabo + Vercel frontend + GoClaw/Zalo notification (via Python relay service). Ship 2 sách thật, end-to-end order flow real.

## v2.2 Patches (2026-05-03, post-Phase 2)

Phase 2 implementation revealed schema/policy refinements:

| # | Patch | Reason | Phase |
|---|---|---|---|
| 1 | **Bank QR memo hardcoded to `order_code`** — `bankMemo()` ignores `site_settings.memo_format`. {name}/{phone} placeholders are intentionally NOT supported. | `addInfo` query param leaks PII into public QR URL. Anh reconciles by `order_code` lookup in admin. `memo_format` field becomes vestigial (could be removed in Phase 1.5 schema cleanup). | 2 |
| 2 | **Unverified confirmation page never fetches PII** — `customer_name`, `customer_phone`, `customer_email`, `shipping_*`, `note` all gated behind cookie verify at the Directus query layer (defense in depth). | RSC payload would otherwise serialize fetched fields into `__next_f` script tag in HTML. | 2 |
| 3 | **Lock-window resets attempts on expiry** — when `verify_locked_until <= now`, baseAttempts resets to 0 before counting current attempt. Genuine users get fresh 5-attempt window after waiting out a lock. | Original spec re-locked on first wrong attempt post-expiry (1-attempt window). | 2 |
| 4 | **Lint migrated to ESLint CLI** — `eslint.config.mjs` flat config + `next/core-web-vitals` + `next/typescript`. `next lint` deprecated in Next 16. | Future-proofing; same lint behavior. | 2 |
| 5 | **`SiteSettings` schema differs from plan** — actual fields: `hero_title`, `hero_subtitle`, `author_bio`, `author_short_bio`, `author_image`, `social_*`, `contact_*`, `shipping_threshold`. Predicted `author_name`/`author_title`/`author_full_bio`/`author_location` do not exist. | Phase 2 plan was written before Phase 1 schema deployment. Hardcoded constants used for missing fields. | 2 (typed), 5 (consider schema bump) |
| 6 | **Books schema: `gallery` field does not exist; sort field is `sort_order`; timestamps are `created_at`/`updated_at`** | Discovered during Phase 2 build. Books have `cover_image` only (no gallery). | 2 (typed), 3 (uploads) |

## v2.1 Patches (2026-05-02 22:42)

Five tiny patches before /ck:cook. Verified externally: GoClaw WS `send {channel, to, message}` direction is correct (line 22662 goclaw-knowledge); Directus Run Script is sandboxed and cannot use node modules (https://docs.directus.io/app/flows/operations).

| # | Patch | Reason | Phase |
|---|---|---|---|
| 1 | Drop `require('crypto')` HMAC inside Directus Flow JS exec op; use static `X-Relay-Token` bearer header from Directus Webhook op (no JS) | Run Script sandbox blocks node modules; token in internal Docker network is acceptable threat model | 4 |
| 2 | Replace stale `/xac-nhan/[order_code]` text with `/xac-nhan/[token]` everywhere | v2 already added `order_token` field but stale prose remained | 2, 5 |
| 3 | Add verify-attempt lock fields to orders schema (`verify_attempts`, `verify_locked_until`, `verify_last_attempt_at`); enforce in `/api/orders/[token]/verify` (5 fails / 15min lock) | MVP brute-force defense for phone-last-4 gate; defense-in-depth on top of token entropy | 1, 2 |
| 4 | Add reconciliation worker to relay (poll Directus 60s for `notification_status=pending` older than 90s, enqueue + mark `queued`) | Catches missed Directus webhooks (relay down, network blip); v2 had no recovery path | 1 (enum), 4 (worker) |
| 5 | Replace hardcoded `cms.sachcuahuy.com` text with `<DIRECTUS_CMS_HOST>` placeholder + introduce `NEXT_PUBLIC_DIRECTUS_ASSETS_URL` env for client-side image src | Hostname not yet decided (Step 0 BLOCKER); make plan substitution-ready | 1, 2, 3, 5 |

## v2 Revisions (2026-05-02 21:35)

Following adversarial review (6 P1/P2 findings), plan revised:

| Finding | Fix | Phase |
|---|---|---|
| **P1** HTTP `/v1/chat/completions` không push Zalo | Replace với relay service (Python FastAPI) → GoClaw WS RPC `send` (verified line 22662 in goclaw-knowledge) | 4 (rewrite) |
| **P1** MCP CLI script không phải MCP server | Drop MCP from MVP; defer Phase 6 với FastMCP/SDK | 4 (cut scope) |
| **P1** `/xac-nhan/[order_code]` PII leak via enumerable code | Add `order_token` (16-char nanoid) + phone-last-4 verify gate | 1 (schema), 2 (URL+gate) |
| **P2** Anonymous orders:create unnecessary attack surface | Remove perm; use `api-orders` service role token server-side only | 1 (perm), 2 (token) |
| **P2** CMS URL `cms.sachcuahuy.com` unresolved/unstable | Step 0 BLOCKER: decide hostname before container boot | 1 (Step 0) |
| **P2** Directus Flow retry assumed not verified | Relay service owns explicit SQLite queue + 3-retry backoff (5s, 30s, 120s) | 4 (relay) |
| **Extra** "Zalo healthy 24h" Phase 5 ship blocker | Moved to 7-day post-launch observation gate | 5 (cleanup) |

## Context Links

- **Brainstorm (ground truth):** [brainstorm-260502-1601-website-ban-sach-architecture.md](../reports/brainstorm-260502-1601-website-ban-sach-architecture.md)
- **Phase 0 (done):** GoClaw upgrade v3.7.0 → v3.11.3 (Contabo, meow agent verified)
- **Source images:** `/Users/pu/Downloads/sachcuahuy/` (1 gocphantu.jpg + 19 z*.jpg = 20 files)
- **Codex models issue (out-of-scope):** `~/marketing-tasks/projects/goclaw-config/ISSUE-codex-models-deprecated-260502.md`

## Tech Stack (decided)

| Layer | Tech | Cost |
|---|---|---|
| Frontend hosting | Vercel free | $0 |
| Frontend framework | Next.js 15.1.5 + React 19 + Tailwind 3.4 + Framer Motion (existing) | $0 |
| Backend CMS | Directus 11 (Docker) | $0 |
| Database | Postgres 18 (existing `goclaw-postgres-1` container, share network `goclaw_default`) | $0 |
| Backend hosting | Contabo VPS 185.111.159.28 (existing) | $0 |
| QR thanh toán | VietQR.io image API | $0 |
| Notifications | GoClaw + Meow agent + Zalo Personal channel | $0 |
| Multi-tenant | GoClaw `X-GoClaw-User-Id: sachcuahuy` header | $0 |
| Domain | `sachcuahuy.com` (PAVietnam, NS at Cloudflare) — CMS `cms.sachcuahuy.com`, frontend stays `sachcuahuy.vercel.app` Phase 1 | ~$12/yr |

**Total: $0/mo**

## Phases

| Phase | Title | Effort | Status |
|---|---|---|---|
| 1 | Directus + Postgres Setup | 2d | ✅ completed 2026-05-03 |
| 2 | Frontend Integration | 1.5d | ✅ completed 2026-05-03 (8 commits + harden, awaiting push + Vercel env) |
| 3 | Image Processing & Upload | 0.5d | 🟡 prep complete 2026-05-03 (classify + WebP + scripts); upload+link deferred until admin token |
| 4 | GoClaw + Zalo Integration | 1.5d | pending |
| 5 | Polish & Launch | 0.5d | pending |

**Total: ~6 days work** (pessimistic, có buffer).

## Architecture Summary (v2)

```
┌──────────────────────────┐         ┌────────────────────────────────────┐
│   VERCEL (Edge - free)   │         │    CONTABO VPS (existing)         │
│                          │         │   185.111.159.28 (SG)             │
│  Next.js 15 SSR/ISR      │  HTTPS  │                                    │
│  - /sach catalog (ISR)   │◄───────►│  Directus 11 (cms.sachcuahuy.com)  │
│  - /api/orders POST      │  REST   │   ↕                                │
│    → api-orders token    │         │  Postgres 18 (existing)            │
│  - /xac-nhan/[token]     │         │   ↕ goclaw_default network         │
│    + phone-last-4 gate   │         │  Sachcuahuy Relay (FastAPI)        │
│  - VietQR generate       │         │   - SQLite retry queue             │
└──────────────────────────┘         │   - X-Relay-Token bearer verify    │
                                     │   - WS → GoClaw send RPC           │
                                     │   - Reconciliation worker (60s)    │
                                     │   ↕                                │
                                     │  GoClaw v3.11.3 (existing)         │
                                     │   user_id=sachcuahuy               │
                                     │   Zalo Personal channel            │
                                     └────────────────────────────────────┘

NOTIFICATION FLOW (v2.1):
Order create → Directus Flow (no JS) → POST relay/notify with X-Relay-Token →
  mark notification_status=queued → SQLite queue →
  sender worker WS connect → send {channel, to, message} → Zalo → anh
  (3 retries backoff 5s/30s/120s; status pending→queued→sent/retrying/failed)

  + Reconciliation worker (60s tick): GET Directus orders where
    notification_status=pending AND created_at < now-90s → enqueue + mark queued
    (catches missed webhooks from relay-down / network blip)
```

## Critical Decisions (resolved)

- **Bank:** VCB `0181003488345` - Nguyễn Trọng Huy - VCB Nam Sài Gòn - memo = `order_code` (hardened post-Phase 2; previous `"{Tên} - {sdt}"` design dropped — would leak PII into VietQR `addInfo` URL)
- **Sách mới:** "Góc Phần Tư – Nỗi buồn nuôi ta khôn lớn" 99k
- **Shipping:** Free HN + HCM, 25k tỉnh khác (flat)
- **Stock:** Manual update, UI chỉ show "Còn/Hết hàng" badge (không auto-decrement)
- **Customer:** Guest checkout only Phase 1
- **Notification:** Zalo Personal qua **relay service** (not direct chat completion); send RPC bypasses agent
- **Order URL:** opaque `order_token` (16-char nanoid) + phone-last-4 gate cho PII (not enumerable `order_code`)
- **Order create:** server-side `api-orders` token only (no anonymous Directus perm)
- **Admin:** Anh super-admin, Huy editor role; separate `relay-notifier` role least-privilege
- **Podcast:** Placeholder "Coming Soon" Phase 1
- **CMS hostname:** ✅ Resolved 2026-05-03 — `cms.sachcuahuy.com` (Cloudflare Tunnel; domain at PAVietnam, NS migrated to CF)

## Deferred to Phase 6 (cut from MVP)

- MCP query feature ("hôm nay đơn?", "sách hết hàng?") — needs proper FastMCP/SDK server
- Customer Zalo confirmation noti (paid → khách)
- Cron 5p auto-retry `notification_status=failed`
- Email backup notification (Q8)
- Rate-limit `/verify` endpoint (5 attempts/IP/15min)
- Real-time `revalidatePath` qua Directus webhook

## Phase Dependencies

```
Phase 1 (Directus setup)
   └─> Phase 2 (Frontend integration) — needs Directus API live + sample data
   └─> Phase 3 (Images) — parallel với Phase 2 (chỉ cần Directus API up)
       └─> Phase 4 (GoClaw integration) — needs Phase 1+2 done (Flows hook on order create)
           └─> Phase 5 (Polish + launch) — final polish trước public
```

**Critical path:** 1 → 2 → 4 → 5 (Phase 3 parallel với 2/4).

## Definition of Done

### Ship Gate (end of Phase 5, before public launch)

- [ ] Anh hoàn thành 1 đơn test end-to-end: form → DB → Zalo noti → mark paid (T-1 smoke test)
- [ ] Huy edit 1 sách (text + ảnh) qua Directus mà không cần anh hướng dẫn
- [ ] 2 sách (Miền Nam của Huy + Góc Phần Tư) hiển thị đúng trên home + /sach + /sach/[slug]
- [ ] Bank info đúng: VCB 0181003488345 - Nguyễn Trọng Huy - VCB Nam Sài Gòn
- [ ] QR VietQR generate chính xác với amount + memo
- [ ] Podcast page placeholder render OK với CTA "Sắp ra mắt"
- [ ] Mobile UX (375px-414px) không overflow/break layout
- [ ] Lighthouse mobile >85
- [ ] Vercel preview deploy thành công không lỗi build
- [ ] `/xac-nhan/<token>` URL không enumerable + phone-last-4 gate works
- [ ] Anonymous `POST /items/orders` → 403

### Post-launch Observation Gate (7 days)

- [ ] First real customer order received within 7 days
- [ ] Notification success rate >99%
- [ ] Zero PII leaks (logs, URLs, error responses)
- [ ] Zalo channel `connected` 7/7 days
- [ ] Vercel error rate <1%

## Risks (top-level)

| Risk | Phase | Impact | Mitigation |
|---|---|---|---|
| Contabo VPS down → admin/khách offline | All | High | Daily backup `/opt/goclaw/backup.sh` đã có; Vercel cache static giữ frontend live |
| Directus webhook fail → miss order | 4 | High | Relay-owned SQLite queue + 3-retry backoff (5s/30s/120s); reconciliation worker polls Directus every 60s for `notification_status=pending` >90s old; email backup noti deferred Phase 6 |
| Vercel free 100GB/mo | 5 | Low | Monitor; migrate sang Caddy reverse proxy nếu vượt |
| Huy unfamiliar Directus UI | 1, 5 | Medium | Field hints + helper text + screencast post-Phase 1 |
| Zalo Personal ban risk (Phase 4) | 4 | Medium | Use throwaway account hoặc số chính (defer Q1) |

## Out of Scope

- Login/customer accounts, order history (Phase 6+)
- Refund flow (Q6 — Phase 6 after data)
- Email backup notification (Q8 — Phase 6 if Zalo unstable)
- MCP query tool (Phase 6 với proper FastMCP server)
- Customer Zalo confirmation noti (Phase 6)
- Cron 5p auto-retry failed notifications (Phase 6)
- Auto stock decrement (decided manual)
- ~~Domain purchase decision deferred~~ ✅ Resolved 2026-05-03 — `sachcuahuy.com` bought at PAVietnam
- Codex models replacement (separate issue)
- Episodic summarizer warn loop (cosmetic, fix later)
- Rate-limit phone-last-4 verify endpoint (Phase 6 if abuse observed)

## Unresolved Questions (to confirm before specific phases)

- **Q1 (Phase 4 gate):** Zalo Personal — số chính hay throwaway? Cần answer trước khi pair channel.
- **Q4 (post-launch):** COD vs Bank ratio — đợi data thực để tune UI/CTA.
- **Q6 (Phase 6):** Refund flow.
- **Q8 (Phase 6):** Email backup notification.

## Next Steps

1. Confirm plan + start Phase 1 (Directus setup)
2. Trong Phase 4, confirm Q1 (Zalo number) trước khi wire pairing
3. Sau Phase 5 launch: monitor metrics + plan Phase 6 (account, refund, podcast feature)

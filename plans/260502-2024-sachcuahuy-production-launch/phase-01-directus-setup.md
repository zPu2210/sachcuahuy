---
phase: 1
title: "Directus + Postgres Setup"
status: completed
completed: 2026-05-03
priority: P1
effort: "2d (actual: ~3h end-to-end with blocker pause)"
dependencies: []
---

# Phase 1: Directus + Postgres Setup

## Context Links

- **Plan overview:** [plan.md](./plan.md)
- **Brainstorm:** [brainstorm-260502-1601-website-ban-sach-architecture.md](../reports/brainstorm-260502-1601-website-ban-sach-architecture.md)
- **Existing infra:** GoClaw `/opt/goclaw/` on Contabo (`ssh goclaw`); Postgres container `goclaw-postgres-1`, network `goclaw_default`
- **Directus 11 docs:** https://docs.directus.io/self-hosted/quickstart.html
- **Directus Flows:** https://docs.directus.io/app/flows.html

## Overview

Deploy Directus 11 trên Contabo, share Postgres `goclaw-postgres-1` (new DB `directus_sachcuahuy`), tạo 6 collections theo schema brainstorm, seed sample data 2 sách + site_settings, setup admin users (anh super-admin, Huy editor).

## Requirements

### Functional
- Directus admin UI accessible qua HTTPS subdomain (e.g. `cms.sachcuahuy.com` hoặc tạm `<contabo-ip>:8055` + Cloudflare Tunnel)
- 6 collections: `books`, `orders`, `customers`, `site_settings`, `pages`, `podcast_episodes`
- Sample data: 2 sách (Miền Nam của Huy, Góc Phần Tư), 1 site_settings record (bank info, shipping, hero)
- 2 admin users: anh (super_admin role), Huy (editor role — limited)
- Public read API permissions: `books`, `pages`, `site_settings` (anonymous)
- Public has **NO orders permissions** — all order writes via dedicated `api-orders` role token (server-side only, see Step 5)
- Backup script daily

### Non-functional
- Directus container memory <1GB
- Postgres không thay đổi GoClaw schema (separate DB)
- Boot time <30s
- Admin 2FA enforced
- HTTPS only (no plaintext admin login)

## Architecture

```
Contabo VPS (185.111.159.28)
├── goclaw_default network (existing Docker bridge)
│   ├── goclaw-postgres-1 (existing) — Postgres 16
│   │   ├── DB: goclaw (existing)
│   │   └── DB: directus_sachcuahuy (NEW — created Phase 1)
│   ├── goclaw-goclaw-1 (existing) — :18790
│   └── directus-sachcuahuy (NEW)
│       └── port 127.0.0.1:8055 → 8055
│       └── volume: /opt/directus-sachcuahuy/data → /directus/uploads
│
└── Cloudflare Tunnel (NEW) → directus-sachcuahuy:8055
    Domain: cms.sachcuahuy.com (or temp tunnel URL)
```

**Why share Postgres:** Save ~256MB RAM (no extra container), backup script đã cover, network isolation đủ qua DB-level grants.

## Related Code Files

### Create (server-side, Contabo)
- `/opt/directus-sachcuahuy/docker-compose.yml` — Directus 11 service
- `/opt/directus-sachcuahuy/.env` — DB creds, KEY/SECRET, admin email
- `/opt/directus-sachcuahuy/data/` — uploads volume
- `/opt/directus-sachcuahuy/extensions/` — placeholder cho Phase 4 hooks
- `/opt/directus-sachcuahuy/snapshot.yaml` — schema snapshot (version control)
- `/opt/directus-sachcuahuy/seed-data.sh` — seed script
- `/opt/directus-sachcuahuy/backup.sh` — daily pg_dump + uploads tar

### Modify (server-side)
- `/opt/goclaw/.env` — add `DIRECTUS_SACHCUAHUY_URL` env var (read by GoClaw flows Phase 4)

### Local repo (no code changes Phase 1)
- N/A — backend-only phase

## Implementation Steps

### 0. Decide CMS hostname (BLOCKER — must answer before container boot)

**RESOLVED 2026-05-03:** Option A — `<DIRECTUS_CMS_HOST>` = `cms.sachcuahuy.com`.
- Domain `sachcuahuy.com` purchased at PAVietnam 2026-05-03 (expires 2027-05-03).
- Original NS: `ns1/ns2.pavietnam.vn` + `nsbak.pavietnam.net`. **Action required user-side:** add zone `sachcuahuy.com` to Cloudflare and migrate NS to CF before Step 3 (Cloudflare Tunnel DNS route). Steps 1–2 proceed independently after zone migration confirmed.
- Tech contact email: pu.hungphu@gmail.com.

`cms.sachcuahuy.com` was placeholder. Domain not yet purchased. Pick stable hostname before Phase 1 boot — Cloudflare random `*.cfargotunnel.com` URLs change per tunnel, **not** acceptable cho production env vars.

**Options:**

| Option | Hostname | Pros | Cons |
|---|---|---|---|
| **A. Buy `sachcuahuy.com` now** | `cms.sachcuahuy.com` | Clean, future-proof, $10-15/yr | Need to buy + setup DNS now (10min) |
| **B. Subdomain on existing domain** | `cms-sachcuahuy.<your-domain>.com` | $0 if anh đã có domain | Shared zone, cleanup if migrate |
| **C. Cloudflare named tunnel + own domain** | Same as A or B | Free TLS, fast | Vẫn cần domain (A or B base) |
| **D. Buy throwaway domain** | `cms.honeyhuy.com` etc | $10/yr if `sachcuahuy.com` taken | Adds confusion |

**Recommend Option A** — buy `sachcuahuy.com` now. Frontend stays `sachcuahuy.vercel.app` (free), CMS gets `cms.sachcuahuy.com`. Domain registration ~$12/yr Cloudflare/Namecheap.

**Action:**
1. Anh choose option A/B/C/D → record decision
2. Reserve `<DIRECTUS_CMS_HOST>` placeholder used trong Steps 2-11 below
3. All `cms.sachcuahuy.com` references in this phase = `<DIRECTUS_CMS_HOST>` literal
4. If option B selected: confirm DNS zone access trước proceed

**DO NOT proceed to Step 1 until hostname decided + DNS provider login confirmed.**

### 1. Create Postgres DB + user
```bash
ssh goclaw
docker exec -it goclaw-postgres-1 psql -U postgres <<EOF
CREATE DATABASE directus_sachcuahuy;
CREATE USER directus_sachcuahuy WITH PASSWORD '<gen-32char>';
GRANT ALL PRIVILEGES ON DATABASE directus_sachcuahuy TO directus_sachcuahuy;
\c directus_sachcuahuy
GRANT ALL ON SCHEMA public TO directus_sachcuahuy;
EOF
```

### 2. Setup Directus container
- `mkdir -p /opt/directus-sachcuahuy/{data,extensions,snapshots}`
- Write `docker-compose.yml`:
  ```yaml
  services:
    directus:
      image: directus/directus:11
      container_name: directus-sachcuahuy
      restart: unless-stopped
      ports: ["127.0.0.1:8055:8055"]
      volumes:
        - ./data:/directus/uploads
        - ./extensions:/directus/extensions
        - ./snapshots:/directus/snapshots
      env_file: .env
      networks: [goclaw_default]
  networks:
    goclaw_default:
      external: true
  ```
- Generate `.env`:
  - `KEY` = `openssl rand -hex 32`
  - `SECRET` = `openssl rand -hex 32`
  - `DB_CLIENT=pg`, `DB_HOST=goclaw-postgres-1`, `DB_PORT=5432`, `DB_DATABASE=directus_sachcuahuy`, `DB_USER=directus_sachcuahuy`, `DB_PASSWORD=<gen>`
  - `ADMIN_EMAIL=pu.hungphu@gmail.com`, `ADMIN_PASSWORD=<gen-temp>`
  - `PUBLIC_URL=https://<DIRECTUS_CMS_HOST>` (or temp tunnel)
  - `CORS_ENABLED=true`, `CORS_ORIGIN=https://sachcuahuy.vercel.app,http://localhost:3000`
  - `FLOWS_ENV_ALLOW_LIST=RELAY_INGRESS_TOKEN` — required cho `{{$env.RELAY_INGRESS_TOKEN}}` access trong Flow webhook headers (Phase 4); `$env` disabled by default for security
  - `RELAY_INGRESS_TOKEN=<placeholder>` — actual value set Phase 4 step 5.2 when relay deployed
- `docker compose up -d` + verify `docker logs directus-sachcuahuy --tail 50`

### 3. Cloudflare Tunnel for HTTPS
- Login `cloudflared tunnel login` (one-time)
- `cloudflared tunnel create directus-sachcuahuy`
- DNS: `cloudflared tunnel route dns directus-sachcuahuy <DIRECTUS_CMS_HOST>` (or use temp `.cfargotunnel.com`)
- Config `/root/.cloudflared/config.yml`:
  ```yaml
  tunnel: <id>
  credentials-file: /root/.cloudflared/<id>.json
  ingress:
    - hostname: <DIRECTUS_CMS_HOST>
      service: http://localhost:8055
    - service: http_status:404
  ```
- Run `cloudflared tunnel run directus-sachcuahuy &` (or systemd service)
- Verify: `curl https://<DIRECTUS_CMS_HOST>/server/health` → `{"status":"ok"}`

### 4. Create collections (via Directus admin UI or schema apply)

**4.1. `books`** — primary content
- Fields: `id` (uuid pk), `slug` (string unique), `title` (string), `subtitle` (string nullable), `author` (string default "Trọng Huy"), `description` (rich text), `short_description` (text), `price` (integer), `compare_price` (integer nullable), `stock_status` (dropdown: `in_stock`/`out_of_stock`), `cover_image` (file m2o), `gallery` (m2m files), `isbn` (string), `publisher` (string), `published_date` (date), `page_count` (integer), `is_new` (boolean default false), `is_coming_soon` (boolean default false), `sort_order` (integer), `status` (dropdown: `draft`/`published`/`archived`), `seo_title` (string), `seo_description` (text), `created_at` (datetime auto), `updated_at` (datetime auto)
- Indexes: `slug` unique, `status` btree

**4.2. `orders`**
- Fields: `id` (uuid pk), `order_code` (string unique e.g. `SCH-260502-0001` — human-friendly cho admin), `order_token` (string unique 16-char nanoid — opaque URL token cho khách), `customer_name` (string), `customer_phone` (string), `customer_email` (string nullable), `shipping_city` (string), `shipping_district` (string), `shipping_address` (text), `note` (text nullable), `items` (json — `[{book_id, slug, title, qty, price}]`), `subtotal` (integer), `shipping_fee` (integer), `discount` (integer default 0), `total` (integer), `payment_method` (dropdown: `cod`/`bank`), `payment_status` (dropdown: `pending`/`paid`/`refunded`/`cancelled` default `pending`), `order_status` (dropdown: `new`/`confirmed`/`shipped`/`delivered`/`cancelled` default `new`), `notification_status` (dropdown: `pending`/`queued`/`sent`/`failed`/`retrying` default `pending` — `queued` added v2.1 for reconciliation worker), `verify_attempts` (integer default 0 — phone-last-4 brute-force counter), `verify_locked_until` (datetime nullable — lock expires at this time after N failed attempts), `verify_last_attempt_at` (datetime nullable), `paid_at` (datetime nullable), `customer_id` (m2o → customers nullable), `created_at` (auto), `updated_at` (auto)
- Indexes: `order_code` unique, `order_token` unique, `customer_phone` btree, `payment_status` btree, `notification_status` btree, `verify_locked_until` btree, `created_at` desc

**Verify-lock policy (v2.1):** phone-last-4 verify endpoint locks an order for 15 min after 5 failed attempts in 15 min window. Resets `verify_attempts=0` on successful verify. Reduces brute-force surface even though token entropy alone is sufficient — defense in depth.

**Why two identifiers:**
- `order_code` (`SCH-YYMMDD-NNNN`) — short, human-readable, anh/Huy dùng admin (acceptable enumerable trong admin UI)
- `order_token` (16-char nanoid, ~10^25 entropy) — used trong public URL `/xac-nhan/[token]`, prevents enumeration attack on PII

**4.3. `customers`** (auto-created from orders, dedup by phone)
- Fields: `id` (uuid pk), `phone` (string unique), `name` (string), `email` (string nullable), `total_orders` (integer default 0), `total_spent` (integer default 0), `last_order_at` (datetime), `created_at` (auto)
- Index: `phone` unique

**4.4. `site_settings`** (singleton — only 1 row)
- Fields: `id` (uuid pk, default 1 row), `bank_name` (string default "VCB"), `bank_account` (string), `bank_holder` (string), `bank_branch` (string), `memo_format` (string default "{name} - {phone}"), `shipping_free_cities` (json — `["hcm","hn"]`), `shipping_flat_fee` (integer default 25000), `shipping_threshold` (integer nullable), `hero_title` (string), `hero_subtitle` (text), `author_bio` (rich text), `author_short_bio` (text), `author_image` (file m2o), `social_facebook` (string), `social_instagram` (string), `social_zalo` (string), `contact_email` (string), `contact_phone` (string)
- Note: enforce singleton via Directus collection setting `singleton: true`

**4.5. `pages`** — CMS-driven static pages
- Fields: `id` (uuid pk), `slug` (string unique e.g. `gioi-thieu`), `title` (string), `content` (rich text), `seo_title`, `seo_description`, `status` (draft/published)

**4.6. `podcast_episodes`** (schema only Phase 1, hidden từ public API until Phase 6)
- Fields: `id` (uuid pk), `slug` (string unique), `title` (string), `description` (text), `audio_url` (string), `duration_seconds` (integer), `cover_image` (file), `published_at` (datetime), `episode_number` (integer), `season` (integer default 1), `status` (draft/published)

### 5. Configure permissions

**Decision (P2 fix):** Public role has **NO access to orders**. All order writes go through Vercel `/api/orders` route using a dedicated server-side service token. This eliminates anonymous spam attack surface + ensures server-side validation (price/shipping resolved server-side, never trust client).

- **Public role (anonymous, no auth):**
  - `books`: read where `status=published`
  - `pages`: read where `status=published`
  - `site_settings`: read (all fields safe — no tokens stored here)
  - `orders`: ❌ **no access** (public cannot create/read/update/delete)
  - `customers`, `podcast_episodes`: no access
- **`api-orders` role (NEW — dedicated server-side, used by Vercel):**
  - `orders`: create + read (own session writes) + update (`verify_attempts`, `verify_locked_until`, `verify_last_attempt_at` — verify endpoint writes these)
  - `customers`: create + read + update (for dedup logic)
  - `books`: read where `status=published` (price resolution)
  - `site_settings`: read
  - Use static token, server-side only (Vercel env `DIRECTUS_API_ORDERS_TOKEN`)
- **Editor role (Huy):**
  - `books`, `pages`, `podcast_episodes`: full CRUD
  - `orders`: read + update `order_status`/`payment_status` only
  - `site_settings`: no access (chỉ super-admin)
  - `customers`: read only
- **Super-admin (anh):** built-in, full access

**Token management (Step 11 below):**
- `DIRECTUS_PUBLIC_TOKEN` — public role static token (read-only catalog) used by Vercel client/server cho catalog reads
- `DIRECTUS_API_ORDERS_TOKEN` — `api-orders` role token, **server-side only**, never expose
- `DIRECTUS_RELAY_TOKEN` — separate role for Phase 4 relay service (read `orders` for reconciliation worker + write `orders.notification_status` only)
- Admin token for one-shot operations (image upload Phase 3) — generate ad-hoc, don't bake into env

### 6. Seed sample data

**books:**
- Miền Nam của Huy — copy từ `src/lib/data.ts` (price 179000, stock_status `in_stock`, isbn `978-604-464-000-0`, publisher `NXB Dân Trí & Thế Giới`, page_count 200, is_new true, status published)
- Góc Phần Tư – Nỗi buồn nuôi ta khôn lớn — price 99000, description từ brainstorm Q2 manuscript (full text), stock_status `in_stock`, status published, is_new true

**site_settings:**
- bank_name `VCB`, bank_account `0181003488345`, bank_holder `NGUYEN TRONG HUY`, bank_branch `VCB Nam Sài Gòn`, memo_format `{name} - {phone}`
- shipping_free_cities `["hcm","hn"]`, shipping_flat_fee 25000, shipping_threshold null
- author_bio + short_bio từ `data.ts` line 100-104

**pages:** `gioi-thieu` (copy từ `/gioi-thieu` page hiện tại), `lien-he` (placeholder)

### 7. Create admin users
- Anh: pu.hungphu@gmail.com, role super_admin, enable 2FA
- Huy: <huy email TBD>, role editor (created above), tạm pwd → reset trên login

### 8. Schema snapshot + version control
- `docker exec directus-sachcuahuy npx directus schema snapshot ./snapshots/baseline.yaml`
- Commit snapshot vào `/opt/directus-sachcuahuy/` git (separate repo or include in `goclaw-config`)

### 9. Backup script
- Write `/opt/directus-sachcuahuy/backup.sh`:
  ```bash
  #!/bin/bash
  set -e
  TS=$(date +%Y%m%d-%H%M%S)
  docker exec goclaw-postgres-1 pg_dump -U postgres directus_sachcuahuy | gzip > /backup/directus-sachcuahuy-$TS.sql.gz
  tar czf /backup/directus-sachcuahuy-uploads-$TS.tar.gz -C /opt/directus-sachcuahuy/data .
  find /backup -name "directus-sachcuahuy-*" -mtime +14 -delete
  ```
- Cron: `0 3 * * * /opt/directus-sachcuahuy/backup.sh`
- Test manual: `bash backup.sh && ls -lh /backup/directus-sachcuahuy-*`

### 10. Smoke test API
```bash
# From local machine
TOKEN=<read-only-token-from-directus>
curl https://<DIRECTUS_CMS_HOST>/items/books?fields=*,cover_image.* | jq
curl https://<DIRECTUS_CMS_HOST>/items/site_settings | jq
```
Expected: 2 books, 1 site_settings record, 200 OK.

### 11. Generate role tokens + update env files

**11.1.** Create roles + static tokens via Directus admin:
- Roles + permissions:
  - `api-orders` — `orders` create + read; `customers` create/read/update; `books` read published; `site_settings` read
  - `relay-notifier` — `orders` read fields (id, order_code, customer_name, customer_phone, shipping_*, items, total, payment_method, payment_status, notification_status, created_at) + update `notification_status` only. **Read needed cho both reconciliation worker AND `/notify` canonical fetch (relay never trusts Flow body).**
  - `editor` (already)
  - `super-admin` (built-in)
- For each role → Settings → Roles → User → Create user with `static_token` enabled
- Save tokens to `~/marketing-tasks/projects/goclaw-config/sachcuahuy-credentials.md` (1Password preferred)

**11.2.** Vercel env vars (set via dashboard, not committed):
```
DIRECTUS_URL=https://<DIRECTUS_CMS_HOST>
DIRECTUS_PUBLIC_TOKEN=<read-only token>
DIRECTUS_API_ORDERS_TOKEN=<api-orders role token>
NEXT_PUBLIC_SITE_URL=https://sachcuahuy.vercel.app
```

**11.3.** Contabo Phase 4 relay service env (defer apply until Phase 4):
```
DIRECTUS_URL=http://directus-sachcuahuy:8055   # internal Docker network
DIRECTUS_RELAY_TOKEN=<relay-notifier role token>
```

**11.4.** Document token TTL + rotation: rotate quarterly, document procedure in credentials doc.

## Todo Checklist

- [x] **Step 0 (BLOCKER):** Decide CMS hostname + DNS provider login confirmed
- [x] Create Postgres DB `directus_sachcuahuy` + user
- [x] Write `docker-compose.yml` + `.env` for Directus (use `<DIRECTUS_CMS_HOST>` decided)
- [x] Boot Directus container, verify health
- [x] Setup Cloudflare Tunnel HTTPS for chosen hostname
- [x] Create 6 collections (books, orders, customers, site_settings, pages, podcast_episodes)
- [x] Add `order_token` + `notification_status` (with `queued` enum) + verify-lock fields (`verify_attempts`, `verify_locked_until`, `verify_last_attempt_at`) to orders schema
- [x] Configure permissions: NO public orders create; create `api-orders` + `relay-notifier` roles
- [x] Grant `relay-notifier` role read access on `orders.id, order_code, customer_*, shipping_*, items, total, payment_method, notification_status, created_at` (needed by reconciliation worker — Phase 4)
- [x] Seed 2 books + site_settings + 2 pages
- [ ] Create admin users (anh + Huy) with 2FA
- [x] Schema snapshot to `snapshots/baseline.yaml`
- [x] Setup daily backup cron + test restore
- [x] Smoke test public API (no auth) + service token writes
- [x] Generate + securely store all 3 role tokens (public, api-orders, relay-notifier)
- [x] Set Vercel env vars (defer Vercel deploy → Phase 2)
- [x] Document admin URL + creds in `~/marketing-tasks/projects/goclaw-config/sachcuahuy-credentials.md`

## Success Criteria

- [x] CMS hostname decided + stable DNS resolved (Step 0)
- [x] `curl https://<DIRECTUS_CMS_HOST>/server/health` → `{"status":"ok"}`
- [x] Public anonymous: `GET /items/books?status=published` → 2 books JSON
- [x] Public anonymous: `POST /items/orders` → **403 forbidden** (anti-spam verified)
- [x] `api-orders` token: `POST /items/orders` succeeds
- [x] `orders` schema includes `order_token`, `notification_status` (enum incl. `queued`), `verify_attempts`, `verify_locked_until`, `verify_last_attempt_at` fields
- [x] Anh login admin → see all 6 collections + create/edit
- [ ] Huy login → cannot edit `site_settings`, can edit `books`/`pages`/`orders.status`
- [x] Backup file generated <60MB, restore-able
- [x] Container survives reboot (`reboot` Contabo, verify `docker ps` shows directus up)
- [x] Schema snapshot committed to version control

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Directus container conflict với GoClaw network | Low | Medium | Test trên staging port trước; rollback `docker compose down` |
| Postgres user permissions sai → Directus ko boot | Medium | High | Test connect bằng `psql` từ container trước boot Directus |
| Cloudflare Tunnel down → cms inaccessible | Low | Medium | Fallback: SSH tunnel `ssh -L 8055:localhost:8055 goclaw` cho admin emergency |
| Memory pressure (Contabo 12GB) | Low | Low | Monitor `docker stats`; Directus typical <500MB |
| Schema drift giữa local snapshot vs prod | Medium | Medium | Always `schema snapshot` sau migrations; CI check Phase 5+ |
| Anh quên 2FA backup codes | Medium | High | Print backup codes lưu `1Password`; super-admin recovery via DB direct |
| Forget to grant `pg_database.directus_sachcuahuy` permission | Medium | High | Step 1 explicit grant; verify với `psql -c "\du"` |

## Security

- **Auth:** Directus 2FA mandatory cho admin, JWT tokens 15min expiry
- **DB:** Separate user `directus_sachcuahuy` chỉ access DB của nó (no cross-DB)
- **Network:** Directus expose 127.0.0.1 only, Cloudflare Tunnel = TLS termination
- **Tokens:**
  - Public read-only token (anonymous → safe)
  - Admin token (server-only, in Vercel env vars Phase 2, never client-side)
  - Service token cho GoClaw (Phase 4, separate)
- **CORS:** Whitelist `vercel.app` + localhost only
- **Backup:** Encrypted at rest (Contabo disk), retention 14 days
- **HTTPS:** Cloudflare Tunnel = TLS auto, no plaintext

## Next Steps

After Phase 1 complete:
- → Phase 2: Frontend integration (Directus SDK consumes API)
- → Phase 3: Image upload (parallel với Phase 2)
- → Phase 4: GoClaw Flows hook on `orders.create` event

## Unresolved Questions

- ~~Subdomain choice~~ → **Resolved Step 0**: must decide before phase starts (recommend buy `sachcuahuy.com`)
- Editor role: Huy có cần access `customers` table không? Hiện default read-only; revisit sau khi Huy onboard
- Backup retention 14 days đủ không? GoClaw đang giữ 30 days — consistency hay tách?
- Should `relay-notifier` role be separate from `api-orders` role? Current plan: yes (least privilege — relay only writes `notification_status`, can't create orders)

---
type: cook
date: 2026-05-03 13:34
phase: 1
slug: phase-01-directus-setup
status: complete
plan: plans/260502-2024-sachcuahuy-production-launch/
---

# Phase 1 Cook Report — Directus + Postgres Setup

## Summary

Directus 11.17.4 deployed on Contabo, fronted by Cloudflare Tunnel at `https://cms.sachcuahuy.com`. Postgres DB `directus_sachcuahuy` shares container `goclaw-postgres-1` (PG 18.3). 6 collections with all v2.1 verify-lock + reconciliation fields. 4 roles, 2 service users with static tokens. Smoke 8/8 ✓.

2026-05-04 addendum: CMS editor metadata localized for Huy. Project default language `vi-VN`; Huy user `demtamsutronghuy@gmail.com` language `vi-VN`; collection/field/dropdown labels Vietnamese. API keys/field names/enum values unchanged. Anonymous `orders` remains 403.

End-to-end: ~3h work (incl. user pause at CMS hostname blocker + Cloudflare auth interactive flow).

## Verified Outcomes

| # | Item | Evidence |
|---|---|---|
| 0 | CMS hostname `cms.sachcuahuy.com` | `dig` returns CF NS; `https://cms.sachcuahuy.com/server/health` → 200 |
| 1 | Postgres DB `directus_sachcuahuy` (PG 18.3) | `psql -U directus_sachcuahuy -d directus_sachcuahuy` connects |
| 2 | Directus container healthy | `docker ps` Up; `/server/health` → `{"status":"ok"}` |
| 3 | Cloudflare named tunnel | systemd `cloudflared.service` active, 4 edge connections (Singapore POPs) |
| 4 | 6 collections + 89+ fields | `/collections` returns 6 user collections; orders has `order_token`, `notification_status` (enum incl. `queued`), `verify_attempts`, `verify_locked_until`, `verify_last_attempt_at` |
| 5 | 4 roles + permissions | public read books/pages/site_settings; api-orders full svc; relay-notifier `notification_status` only; editor for Huy |
| 6 | 2 books + site_settings + 2 pages | public GET `/items/books` returns 2; `/items/site_settings` returns bank `0181003488345` NGUYEN TRONG HUY |
| 7 | Anh super-admin (active) | `pu.hungphu@gmail.com`, 2FA `OFF` (anh manual TODO) |
| 8 | Schema snapshot | `/opt/directus-sachcuahuy/snapshots/baseline.yaml` (95KB) + local `scripts/directus-snapshots/baseline.yaml` |
| 9 | Daily backup cron | `0 3 * * * /opt/directus-sachcuahuy/backup.sh`, test run 25K DB + uploads tar in `/backup/` |
| 10 | Smoke 8/8 | health 200, books anon 200, settings anon 200, pages anon 200, orders POST anon **403**, customers GET anon **403**, podcast GET anon **403**, restart→200 |
| 11 | Service tokens working | `api-orders` POST orders → 200; `relay-notifier` PATCH `notification_status` → 200, PATCH `payment_status` → **403** (least privilege confirmed) |
| 12 | Vietnamese CMS metadata | `/server/info` default_language `vi-VN`; Huy user `vi-VN`; `books.stock_status` text `Còn hàng`, value `in_stock`; public books/pages/site_settings 200; anonymous orders POST **403** |

## Architecture (deployed)

```
Internet → Cloudflare edge (Singapore) → cloudflared systemd → localhost:8055 → Directus 11.17.4
                                                                                  ↓
                                                                              goclaw_default Docker network
                                                                                  ↓
                                                                              goclaw-postgres-1 (PG 18.3)
                                                                                  └── DB: directus_sachcuahuy (owner: directus_sachcuahuy)
```

## Deviations from Plan v2.1

| Plan said | Actual | Why |
|---|---|---|
| Postgres 16 | Postgres 18.3 | Existing GoClaw Postgres container is 18; Directus 11 supports PG 13-18 |
| `id` UUID PK on all collections | Integer auto-increment | Directus auto-creates integer `id` on `POST /collections`; manual override would require recreate. Functionally equivalent — PKs never exposed in URLs (we use `order_token` for that). FK relation `orders.customer_id` aligned to integer. |
| `ssh ... pg_dump -U postgres ...` | `pg_dump -U goclaw ...` | Postgres superuser is `goclaw` not `postgres` (existing GoClaw container env) |
| 1 credentials.md file | `.env.sachcuahuy-credentials` (secrets, gitignored) + `sachcuahuy-credentials.md` (operational pointers, NOT gitignored) | Separation of secret vs operational data; secrets safer. **⚠️ The .md is currently NOT in `.gitignore` of marketing-tasks repo — flag for anh to decide commit policy.** |
| Email `<huy email TBD>` for editor user | Deferred | Email not yet provided. Editor role + perms ready; user creation = 1 API call when anh provides email. |
| `ADMIN_PASSWORD` 2FA enabled | OFF (anh manual UI step) | Cannot enable via API — requires QR scan + auth code. Documented in credentials runbook. |

## File Manifest

### Contabo (`ssh goclaw`)

```
/opt/directus-sachcuahuy/
├── docker-compose.yml   (395B)
├── .env                 (chmod 600, secrets)
├── data/                (uploads, owned 1000:1000)
├── extensions/          (placeholder Phase 4)
├── snapshots/
│   └── baseline.yaml    (95KB, Directus 11.17.4)
└── backup.sh            (chmod +x)

/etc/systemd/system/cloudflared.service
/etc/cloudflared/config.yml
/root/.cloudflared/{cert.pem, d1c5121a-….json}

cron: 0 3 * * * /opt/directus-sachcuahuy/backup.sh
/backup/directus-sachcuahuy-20260503-082747.{sql.gz,uploads.tar.gz}
```

### Local repo (`/Users/pu/Documents/Playground/sachcuahuy/`)

```
scripts/
├── setup-directus-schema.py        (idempotent, creates 6 collections + relations)
├── setup-directus-permissions.py   (idempotent, creates 4 policies + 4 roles + perms)
├── seed-directus-data.py           (idempotent, seeds 2 books + site_settings + 2 pages)
└── directus-snapshots/baseline.yaml
```

### Secrets / runbook (outside repo)

```
~/marketing-tasks/projects/goclaw-config/
├── .env.sachcuahuy-credentials     (gitignored .env*, chmod 600 — all tokens, passwords, role/policy IDs)
└── sachcuahuy-credentials.md       (operational reference — NOT gitignored, NO secrets)
```

## Open Items (anh-side, non-blocking)

1. **Enable 2FA** on `pu.hungphu@gmail.com` super-admin via Directus UI. Save backup codes to 1Password. (~3 min)
2. **Huy onboarding:** user exists at `demtamsutronghuy@gmail.com`; send/reset password if needed, then manual UI smoke for editor permissions.
3. **Decide gitignore policy** for `~/marketing-tasks/projects/goclaw-config/sachcuahuy-credentials.md` (no secrets inside, but filename is "sensitive-adjacent").
4. **Backup to 1Password**: `.env.sachcuahuy-credentials` should be backed up to 1Password vault.

## Phase 2 Readiness

Phase 1 deliverables that Phase 2 will consume:
- `DIRECTUS_URL=https://cms.sachcuahuy.com` (Vercel env)
- `DIRECTUS_API_ORDERS_TOKEN` (Vercel env, server-side only — for `/api/orders` route)
- Public REST: `GET /items/books?filter[status][_eq]=published` works anon (200)
- Public REST: `GET /items/site_settings` returns full settings (200)
- Public REST: `GET /items/pages?filter[slug][_eq]=gioi-thieu` works anon (200)
- Anonymous `POST /items/orders` blocked (403) — Phase 2 frontend MUST use `DIRECTUS_API_ORDERS_TOKEN` server-side
- Schema includes all v2.1 fields needed for Phase 2 verify-lock + Phase 4 reconciliation

## Unresolved Questions

- **Q (deferred from plan):** Backup retention 14 days vs GoClaw's existing pattern (no fixed retention seen, but oldest backup is from Mar 31). 14d is plan default — ok unless anh wants longer.
- **Q (operational):** Should `.env.sachcuahuy-credentials` be encrypted at rest beyond chmod 600? Current threat model: workstation compromise. Mitigation deferred to anh's choice (1Password sync recommended).
- **Q (Phase 4 prep):** Verify `cloudflared` 1-tunnel limit (per host rule) is respected — 1 currently. If Phase 4 adds another tunnel for relay or anything, will need re-architect.

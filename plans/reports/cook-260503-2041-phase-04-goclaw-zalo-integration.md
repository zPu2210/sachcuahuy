---
type: cook
date: 2026-05-03 20:41
phase: 4
slug: phase-04-goclaw-zalo-integration
status: complete
plan: plans/260502-2024-sachcuahuy-production-launch/
plan_phase: phase-04-goclaw-zalo-integration.md
runbook: ~/marketing-tasks/projects/goclaw-config/sachcuahuy-relay-runbook.md
---

# Phase 4 Cook Report — GoClaw + Zalo Integration

## Summary

Notification relay live: Directus order events → Python FastAPI relay → GoClaw WS RPC `send` → meow-zalo channel → Zalo Personal → anh. End-to-end <8s for create, <1s for paid update. SQLite queue + retry backoff (5s/30s/120s × 3) + reconciliation worker (60s/90s) all verified. Resilience tests pass.

End-to-end: ~3h work (incl. blocker resolution + GoClaw send-RPC quirk diagnosis).

## Plan Deviations (verified vs v2.1)

| Plan v2.1 step | Reality | Resolution |
|---|---|---|
| Step 1: `POST /v1/users` to create GoClaw user `sachcuahuy` | Endpoint doesn't exist (`/v1/users` returns 404). `X-GoClaw-User-Id` header is implicit; only `tenants.users.add` RPC adds users to non-default tenants. | **Skipped.** Single-tenant Master scope; user_id passed at WS connect time. |
| Step 2: Pair NEW Zalo instance bound to sachcuahuy | Channel instances have no user_id ownership in API model (line 17263). Zalo Personal limit = 1 active session per phone. Re-pair would kill meow-zalo. | **A1: Reuse existing meow-zalo** (id `019d47b1-91a7-7932-8d28-be63aceef389`). |
| `send {channel: "zalo_personal"...}` per docs line 22662 | Returns `ok: true` falsely. Logs `WARN: unknown channel for outbound message`. **`channel` param = instance NAME, not type.** | **Use `channel: "meow-zalo"`** (the instance `name` field). Documented gotcha in `goclaw_send_rpc_channel_param.md` memory. |
| Flow body `{{$trigger.payload.id}}` for items.create | `payload` doesn't include id at create time. `keys[0]` template syntax also resolves to undefined. Directus 11 emits singular **`$trigger.key`** for create, plural `$trigger.keys[0]` for update. | Fixed in `setup-directus-flows.py`; Flow body uses `{{$trigger.key}}` for create, `{{$trigger.keys[0]}}` for update. |

## Verified Outcomes

| # | Item | Evidence |
|---|---|---|
| 1 | Relay container healthy | `curl http://127.0.0.1:9090/health` → `{"status":"ok"}` |
| 2 | Negative tests | 403 missing `X-Relay-Token`, 403 wrong token, 400 missing event_type/order_id, 404 bogus order_id (Directus 403 → relay 404 mapped) |
| 3 | E2E new order create | Order 10 `SCH-260503-FLOW3` (99k Góc Phần Tư BANK): API → Flow → relay queue → Zalo. `notification_status: pending → queued → sent` in <8s. Anh confirmed receipt. |
| 4 | E2E mark paid | PATCH order 10 `payment_status=paid`: Condition op true → Webhook → relay queue → Zalo confirm. <1s. |
| 5 | Reconciliation worker | First boot: 6 backlog Phase 1/2 test orders (`pending` for hours) recovered + sent within first 60s tick. Order 9 (FLOW2 with stale `undefined` body) also recovered after Flow fix. |
| 6 | SQLite queue persistence | Manual job `manual-persist-test` survived `docker compose restart relay`. State unchanged. |
| 7 | Retry backoff | GoClaw stopped → injected job → after 8s wait: `retry_count=2`, `next_attempt_at=T0+~36s` (matches BACKOFF[0]+BACKOFF[1] = 5+30s). Cleaned up before final retry; goclaw restored. |
| 8 | Token sync | `/opt/sachcuahuy-relay/.env` `RELAY_INGRESS_TOKEN` matches `/opt/directus-sachcuahuy/.env` value byte-for-byte. `FLOWS_ENV_ALLOW_LIST=RELAY_INGRESS_TOKEN` already in Directus env from Phase 1. |
| 9 | Multi-tenant scope | WS connect with `user_id=sachcuahuy` accepted (role=admin, tenant=Master). Logs do not mix with meow's `system` user_id. |
| 10 | Network isolation | Relay binds `127.0.0.1:9090` only; Directus → Relay via Docker DNS `sachcuahuy-relay:9090`. No public ingress for relay HTTP. |

## Architecture Deployed

```
Directus 11 (cms.sachcuahuy.com via Cloudflare Tunnel)
   ├─ Flow notify_new_order  (event: orders.items.create)
   │   └─ Webhook → http://sachcuahuy-relay:9090/notify
   │       Headers: X-Relay-Token: {{$env.RELAY_INGRESS_TOKEN}}
   │       Body: {"event_type":"order.created","order_id":"{{$trigger.key}}"}
   └─ Flow notify_paid       (event: orders.items.update + condition payment_status=paid)
       └─ Webhook (same URL/headers)
           Body: {"event_type":"order.paid","order_id":"{{$trigger.keys[0]}}"}
                                  ↓
sachcuahuy-relay (FastAPI, 127.0.0.1:9090, network goclaw_default)
   /notify:    verify X-Relay-Token (constant-time) → fetch canonical order
               from Directus → enqueue SQLite job → mark notification_status=queued
   sender_worker (2s tick):
               drain pending jobs → send_via_goclaw_ws → on success mark sent +
               PATCH Directus; on fail retry with BACKOFF=[5,30,120]; after 3 →
               mark failed
   reconciliation_worker (60s tick):
               GET orders where notification_status=pending AND
               created_at < now - 90s → enqueue with idempotent dedup → mark queued
                                  ↓
GoClaw v3.11.3 (ws://goclaw-goclaw-1:18790/ws)
   connect    {token, user_id: "sachcuahuy"}
   send       {channel: "meow-zalo", to: "3889487929250090246", message: <text>}
                                  ↓
meow-zalo channel instance (id 019d47b1-91a7-7932-8d28-be63aceef389)
   Zalo Personal session paired with anh's account; agent=meow; dm_policy=disabled
                                  ↓
                                Zalo → anh
```

## File Manifest

### Contabo (`ssh goclaw`)

```
/opt/sachcuahuy-relay/
├── docker-compose.yml      # FastAPI on 127.0.0.1:9090, on goclaw_default
├── Dockerfile              # python:3.12-slim
├── requirements.txt
├── .env                    # chmod 600, 9 vars
├── main.py                 # 158 LOC: FastAPI app + lifespan + workers
├── queue_db.py             # 106 LOC: SQLite ops + enqueue dedup
├── goclaw_ws.py            # 62 LOC: WS connect + send {channel: meow-zalo}
├── directus_client.py      # 72 LOC: fetch + patch + list_pending
├── zalo_formatter.py       # 50 LOC: VN message templates
├── data/queue.db           # SQLite (auto-created)
└── logs/                   # currently empty; Docker captures stdout

/opt/directus-sachcuahuy/.env   # added/updated RELAY_INGRESS_TOKEN value (synced)
                                # FLOWS_ENV_ALLOW_LIST=RELAY_INGRESS_TOKEN (Phase 1)
```

### Local repo (`/Users/pu/Documents/Playground/sachcuahuy/`)

```
scripts/setup-directus-flows.py   # NEW — idempotent Flows setup
                                  # creates notify_new_order + notify_paid
                                  # delete-then-create on re-run
```

### Runbook (outside repo)

```
~/marketing-tasks/projects/goclaw-config/sachcuahuy-relay-runbook.md
```

### Memory (cross-session)

```
~/.claude/projects/-Users-pu-Documents-Playground-sachcuahuy/memory/
├── sachcuahuy_zalo_uids.md
└── goclaw_send_rpc_channel_param.md
```

## Critical Findings (worth carrying to future GoClaw work)

1. **WS `send` RPC `channel` param = instance NAME, not type.** Wrong type returns `ok: true` falsely + logs `unknown channel for outbound message`. Always look up `name` via `GET /v1/channels/instances`.
2. **`send` RPC has no real ack.** Both outer `res.ok` and inner `payload.ok` return `true` even when the message is dropped. Verify delivery via Zalo app receipt or check goclaw logs for the warn pattern.
3. **Directus 11 trigger context is asymmetric:**
   - `items.create` → `$trigger.key` (singular)
   - `items.update` → `$trigger.keys` (plural array)
4. **Directus returns 403 (not 404) for non-existent items** as anti-enumeration. Relay's `fetch_order` treats both as `None`.
5. **Reconciliation worker fires on first boot** — it picked up 6 backlog test orders immediately, which counts as evidence the worker logic is correct but caused 6 unsolicited Zalo pings to anh. Future deployments: clean test data before deploying relay, or set `notification_status=manual` on test orders.

## Test Orders Created (cleanup advisory)

| ID | order_code | Purpose | notification_status |
|---|---|---|---|
| 2-7 | SCH-260503-* (Test User, Test Bank, etc.) | Phase 1+2 tests, recovered by reconciliation | sent |
| 8 | SCH-260503-FLOW1 | First Flow test (failed `undefined` template) | sent (recovered) |
| 9 | SCH-260503-FLOW2 | Second Flow test (failed `keys[0]` template) | sent (recovered) |
| 10 | SCH-260503-FLOW3 | E2E success — first to flow through cleanly | sent (paid) |

These can be deleted via Directus admin when convenient. None are real customer orders.

## Open Items (Phase 5 / Phase 6)

1. **Phase 5 ship gate** — anh hoàn thành 1 đơn test end-to-end via UI (form → DB → Zalo → mark paid). Already verified via direct API; UI test pending Phase 5 polish.
2. **Phase 6**: customer Zalo noti on paid (paid → khách Zalo); cron 5p auto-retry failed; email backup; MCP query tool.
3. **`updated_at` field** in orders auto-updates on every PATCH. Could lead to multiple `notify_paid` triggers if paid → unpaid → paid again. Not encountered yet; consider Condition op also checking `payment_status_old !== "paid"` if needed.

## Unresolved Questions

- Should test orders 2-9 be deleted now or kept for forensics? — defer to anh.
- Phase 6 may need a queue depth alarm if backlog > N — current queue is single-worker serial, fine for <100 orders/day.
- `paid_at` field exists in schema but is never set. Should `notify_paid` Flow also stamp `paid_at = now()`? — minor schema completeness, not blocking.

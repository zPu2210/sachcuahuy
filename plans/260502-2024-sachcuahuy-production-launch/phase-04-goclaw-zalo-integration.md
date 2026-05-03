---
phase: 4
title: "GoClaw + Zalo Integration"
status: pending
priority: P1
effort: "1.5d"
dependencies: [1, 2]
---

# Phase 4: GoClaw + Zalo Integration

## v2.1 Patch Notes (2026-05-02 22:42)

Two changes vs v2:

1. **Drop HMAC inside Directus Flow JS exec op.** Directus Run Script is sandboxed and cannot `require('crypto')` ([docs](https://docs.directus.io/app/flows/operations)). Replace with **static bearer token** sent via `X-Relay-Token` header from Directus Webhook op (built-in headers, no JS needed). Threat model still acceptable: relay binds `127.0.0.1` + Docker internal network only, no public ingress; rotate token quarterly.
2. **Add reconciliation worker.** Catches orders Directus created but webhook never reached relay (container down, network blip). Worker polls Directus every 60s for `notification_status=pending` rows older than 90s and enqueues them. Adds new enum value `queued` to `notification_status` (Phase 1 schema patch).

## Context Links

- **Plan overview:** [plan.md](./plan.md)
- **Brainstorm:** [brainstorm-260502-1601-website-ban-sach-architecture.md](../reports/brainstorm-260502-1601-website-ban-sach-architecture.md)
- **Phase 1:** [phase-01-directus-setup.md](./phase-01-directus-setup.md) — Directus + collections + roles live
- **Phase 2:** [phase-02-frontend-integration.md](./phase-02-frontend-integration.md) — orders create flow live
- **GoClaw rules:** `~/.claude/rules/goclaw-provider-setup-rules.md`
- **GoClaw docs cache:** `~/marketing-tasks/docs/goclaw-knowledge/llms-full.txt` (24K lines, refreshed Phase 0)
- **GoClaw RPC reference:** Section "## RPC Methods" line ~22660 — `send {channel, to, message}` is correct API for outbound

## Overview

Wire end-to-end notification: Directus order create → Flow webhook → **relay service (Python FastAPI on Contabo)** → GoClaw WebSocket RPC `send` → Zalo Personal channel → push to anh.

**Architecture revision (vs v1 plan):**
- HTTP `/v1/chat/completions` returns completion only, **does NOT route to channels** — wrong API for noti
- Correct API: WebSocket RPC `send` (line 22662 in goclaw-knowledge), takes `{channel, to, message}`
- Drop MCP query feature ("hôm nay đơn?") from MVP — defer Phase 6 với proper MCP server (FastMCP/SDK), not CLI script
- Relay service owns retry queue + static-token verify (HMAC dropped — Directus Run Script cannot `require('crypto')`, sandboxed per official docs)
- Relay also owns **reconciliation worker** — polls Directus every 60s for `notification_status=pending` orders older than 90s, enqueues them (catches missed webhooks)

## Requirements

### Functional
- New order trong Directus → push Zalo cho anh trong <10s với template:
  > 📦 Đơn mới #SCH-260502-1234
  > Nguyễn Văn A - 0912345678
  > Miền Nam của Huy x1 - 179k (COD)
  > HCM Q1, hẻm 123 Pasteur
- Mark order paid → push Zalo cho anh confirm:
  > ✅ Đã xác nhận paid #SCH-260502-1234
- Zalo Personal channel paired (Q1 confirmed: số chính hoặc throwaway)
- Multi-tenant: GoClaw user_id `sachcuahuy` separate context
- Retry queue: 3 attempts với exponential backoff (5s, 30s, 120s)
- After 3 failures: mark `notification_status=failed`, alert log

### Non-functional
- Notification latency p95 <10s (relay queue + WS connect overhead)
- Relay service memory <100MB
- Relay restart-safe (SQLite queue survives reboot)
- Static bearer token (`X-Relay-Token`) verifies Directus → relay (HMAC dropped — Directus Run Script sandboxed, no crypto module)
- Reconciliation worker: missed webhooks recovered within ≤2min (poll interval 60s, age threshold 90s)
- All webhook traffic stays trên Docker internal network `goclaw_default` (no public expose cho relay HTTP)

### Out of Scope (Phase 4) — defer Phase 6
- MCP query tool ("hôm nay đơn?", "sách hết hàng?") — needs proper MCP server build
- Customer Zalo confirmation noti (paid → khách)
- Cron 5p re-notify pending orders fallback

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ ORDER CREATE FLOW                                            │
│                                                               │
│ User → Vercel /api/orders → directusOrders.createItem(orders)│
│                                       │                       │
│                                       ▼                       │
│             Directus Flow "notify_new_order"                 │
│             trigger: items.create on orders                  │
│             ops (no JS exec — sandbox blocks `require`):    │
│               1. Read order data                              │
│               2. Webhook POST http://sachcuahuy-relay:9090/notify
│                  Headers: X-Relay-Token: $env.RELAY_INGRESS_TOKEN
│                  Body: { event_type: "order.created",        │
│                          order: <full order JSON> }          │
│                                       │                       │
│                                       ▼                       │
│             Relay service (FastAPI, port 127.0.0.1:9090)     │
│             ┌─────────────────────────────────────────────┐  │
│             │ POST /notify                                │  │
│             │   1. Verify X-Relay-Token (static bearer)   │  │
│             │   2. Mark order notification_status=queued  │  │
│             │   3. Push job to SQLite queue               │  │
│             │   4. Return 202 Accepted                    │  │
│             │                                             │  │
│             │ Sender worker (asyncio loop, 2s tick)       │  │
│             │   Loop:                                      │  │
│             │     - SELECT pending where next_attempt <= now │
│             │     - For each: open WS to GoClaw, send,    │  │
│             │       on success → status=sent + PATCH Directus │
│             │       on fail → retry_count++, backoff      │  │
│             │       on retry_count==3 → status=failed     │  │
│             │                                             │  │
│             │ Reconciliation worker (60s tick)            │  │
│             │   GET Directus /items/orders                │  │
│             │     filter: notification_status=pending     │  │
│             │     filter: created_at < now - 90s          │  │
│             │   For each: enqueue job + mark queued       │  │
│             │   (catches missed webhooks)                 │  │
│             └─────────────────────────────────────────────┘  │
│                                       │                       │
│                                       ▼ WebSocket RPC          │
│             GoClaw ws://goclaw-goclaw-1:18790/ws             │
│             (internal Docker network goclaw_default)          │
│             Method: send                                      │
│             Params: { channel: "zalo_personal",               │
│                       to: "<anh-zalo-uid>",                  │
│                       message: "📦 Đơn mới..." }             │
│                                       │                       │
│                                       ▼                       │
│             Zalo Personal API → anh's Zalo                    │
└─────────────────────────────────────────────────────────────┘

PAID FLOW: Same architecture, different trigger + message template.
```

## Related Code Files

### Create (Contabo, server-side)
- `/opt/sachcuahuy-relay/` — relay service directory
- `/opt/sachcuahuy-relay/docker-compose.yml` — FastAPI container
- `/opt/sachcuahuy-relay/Dockerfile` — Python 3.12 + FastAPI + websockets
- `/opt/sachcuahuy-relay/main.py` — relay app + worker
- `/opt/sachcuahuy-relay/zalo_formatter.py` — order → Zalo message templates
- `/opt/sachcuahuy-relay/data/queue.db` — SQLite queue (auto-created)
- `/opt/sachcuahuy-relay/.env` — secrets (RELAY_INGRESS_TOKEN, GoClaw token, Directus relay token, Zalo UID)
- `/opt/sachcuahuy-relay/requirements.txt` — `fastapi`, `uvicorn`, `httpx`, `websockets`, `python-dotenv`

### Modify (Contabo)
- GoClaw user `sachcuahuy` — created via Dashboard or API
- Zalo Personal channel instance — paired (decision Q1)
- `/opt/goclaw/.env` — verify already has `GOCLAW_GATEWAY_TOKEN`

### Modify (Directus, runtime)
- Flow 1: `notify_new_order` (event `orders.items.create`)
- Flow 2: `notify_paid` (event `orders.items.update` filter `payment_status=paid`)

### Modify (local repo) — none, Phase 4 backend-only

## Implementation Steps

### 0. Confirm Q1 (Zalo Personal account choice) — BLOCKER

Anh decide trước proceed:
- **Option A:** Số chính → less friction, but ban risk khi Zalo flag spam
- **Option B:** Throwaway số mới → safer, need register new Zalo account, but harder cho khách quen

Recommend **A trước** — ban risk thấp với volume MVP (<10 noti/day, anh chỉ là receiver). Nếu Zalo flag → migrate B.

Document decision: `~/marketing-tasks/projects/goclaw-config/sachcuahuy-zalo-decision.md`

**Do NOT proceed Phase 4 if Q1 unanswered.**

### 1. Create GoClaw user `sachcuahuy`
```bash
ssh goclaw
TOKEN=$(grep GOCLAW_GATEWAY_TOKEN /opt/goclaw/.env | cut -d= -f2)

# Via API:
curl -X POST http://localhost:18790/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"sachcuahuy","name":"Sách Của Huy","metadata":{"project":"sachcuahuy-website"}}'

# Or via Dashboard: Users → Create User → ID: sachcuahuy
```

Verify: `curl -H "Authorization: Bearer $TOKEN" http://localhost:18790/v1/users/sachcuahuy | jq`

### 2. Pair Zalo Personal channel cho user `sachcuahuy`

**2.1.** Create instance via Dashboard:
- Channels → Create Instance
- Type: `zalo_personal`
- Name: `sachcuahuy/zalo-anh`
- Owner User: `sachcuahuy`
- **Agent: required field per GoClaw API** (line 17263 of llms-full.txt: "Required fields: `name`, `channel_type`, `agent_id`"). Use existing `meow` agent as owner/router.

**Why an agent is needed even cho noti-only flow:**
- Channel instance routes inbound + outbound through an agent (architectural requirement)
- Relay's `send` RPC pushes outbound directly via gateway, bypassing agent logic — agent never invoked cho push
- BUT khách lỡ reply Zalo → message routes to `meow` agent (sachcuahuy user_id context). Acceptable: meow trả lời generic "Đơn của bạn đang được xử lý..." (or stays silent if `dm_policy=disabled`)
- Set instance `dm_policy: "disabled"` để block inbound entirely if want zero conversational surface in Phase 4 (defer to Phase 6 customer noti work)

**Decision Phase 4:** `agent_id` = meow's UUID + `dm_policy: "disabled"` (no inbound). Defer customer reply UX to Phase 6.

**2.2.** Scan QR with Zalo app (số đã quyết Q1)

**2.3.** Approve pairing via Dashboard or WebSocket:
```bash
# WebSocket pairing approval if needed
echo '{"type":"req","id":"1","method":"connect","params":{"token":"'"$TOKEN"'","user_id":"sachcuahuy"}}' \
  | websocat ws://localhost:18790/ws
echo '{"type":"req","id":"2","method":"device.pair.approve","params":{"code":"<code>"}}' \
  | websocat ws://localhost:18790/ws
```

**2.4.** Save:
- `instance_id` (UUID returned)
- Anh's Zalo `uid` (existing `635886391735490863` từ goclaw owner — confirm reuse OR new pair)

**2.5.** Verify status `connected`:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:18790/v1/channels/instances/<id> | jq '.status'
# Expect: "connected"
```

### 3. Build relay service

**3.1.** Setup directory:
```bash
mkdir -p /opt/sachcuahuy-relay/{data,logs}
cd /opt/sachcuahuy-relay
```

**3.2.** Write `requirements.txt`:
```
fastapi==0.115.*
uvicorn[standard]==0.32.*
httpx==0.27.*
websockets==13.*
python-dotenv==1.0.*
```

**3.3.** Write `Dockerfile`:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9090"]
```

**3.4.** Write `docker-compose.yml`:
```yaml
services:
  relay:
    build: .
    container_name: sachcuahuy-relay
    restart: unless-stopped
    ports: ["127.0.0.1:9090:9090"]
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    env_file: .env
    networks: [goclaw_default]
networks:
  goclaw_default:
    external: true
```

**3.5.** Write `.env` (per Q1 decision + Phase 1 tokens):
```
RELAY_INGRESS_TOKEN=<openssl rand -hex 32>     # static bearer, shared with Directus Flow
GOCLAW_WS_URL=ws://goclaw-goclaw-1:18790/ws
GOCLAW_GATEWAY_TOKEN=<same as /opt/goclaw/.env>
GOCLAW_USER_ID=sachcuahuy
ZALO_INSTANCE_ID=<from step 2.4>
ANH_ZALO_UID=<635886391735490863 OR new>
DIRECTUS_URL=http://directus-sachcuahuy:8055
DIRECTUS_RELAY_TOKEN=<from Phase 1 step 11.1>
RECONCILE_POLL_SECONDS=60                       # reconciliation worker tick
RECONCILE_AGE_THRESHOLD_SECONDS=90              # only re-enqueue orders older than this
LOG_LEVEL=INFO
```

**3.6.** Write `zalo_formatter.py`:
```python
"""Format order data into Zalo message templates."""

def format_new_order(order: dict) -> str:
    items = ', '.join(f"{i['title']} x{i['qty']}" for i in order['items'])
    total_vnd = f"{order['total']:,}".replace(',', '.')
    return (
        f"📦 Đơn mới #{order['order_code']}\n"
        f"{order['customer_name']} - {order['customer_phone']}\n"
        f"{items}\n"
        f"Tổng: {total_vnd}đ ({order['payment_method'].upper()})\n"
        f"{order['shipping_city'].upper()}, {order['shipping_district']}\n"
        f"{order['shipping_address']}"
    )

def format_paid(order: dict) -> str:
    total_vnd = f"{order['total']:,}".replace(',', '.')
    return (
        f"✅ Đã xác nhận paid #{order['order_code']}\n"
        f"Khách: {order['customer_name']}\n"
        f"Tổng: {total_vnd}đ"
    )
```

**3.7.** Write `main.py` (core relay app + workers):
```python
"""Sachcuahuy notification relay: Directus webhook → GoClaw WS → Zalo."""
import asyncio, hmac as _hmac, json, logging, os, sqlite3, time, uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
import httpx, websockets
from zalo_formatter import format_new_order, format_paid

logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
log = logging.getLogger('relay')

# Static bearer token shared with Directus Flow (Run Script is sandboxed — no HMAC option)
INGRESS_TOKEN = os.environ['RELAY_INGRESS_TOKEN']
GOCLAW_WS = os.environ['GOCLAW_WS_URL']
GOCLAW_TOKEN = os.environ['GOCLAW_GATEWAY_TOKEN']
USER_ID = os.environ['GOCLAW_USER_ID']
ZALO_INSTANCE = os.environ['ZALO_INSTANCE_ID']
ANH_UID = os.environ['ANH_ZALO_UID']
DIRECTUS = os.environ['DIRECTUS_URL']
RELAY_TOKEN = os.environ['DIRECTUS_RELAY_TOKEN']
RECONCILE_POLL = int(os.getenv('RECONCILE_POLL_SECONDS', '60'))
RECONCILE_AGE = int(os.getenv('RECONCILE_AGE_THRESHOLD_SECONDS', '90'))

DB_PATH = '/app/data/queue.db'
BACKOFF = [5, 30, 120]  # seconds; 3 retries total

def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute("""CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      event_type TEXT,
      order_id TEXT,
      order_code TEXT,
      message TEXT,
      retry_count INTEGER DEFAULT 0,
      next_attempt_at INTEGER,
      status TEXT DEFAULT 'pending',
      created_at INTEGER,
      updated_at INTEGER,
      last_error TEXT
    )""")
    db.execute("CREATE INDEX IF NOT EXISTS idx_jobs_pending ON jobs(status, next_attempt_at)")
    db.commit()
    db.close()

def verify_ingress_token(provided: str) -> bool:
    """Constant-time compare static bearer token from X-Relay-Token header."""
    if not provided: return False
    return _hmac.compare_digest(INGRESS_TOKEN, provided)

async def send_via_goclaw_ws(message: str) -> tuple[bool, str]:
    """Open WS, connect, send, close. Returns (ok, error_msg)."""
    try:
        async with websockets.connect(GOCLAW_WS, ping_interval=30, ping_timeout=10) as ws:
            await ws.send(json.dumps({
                "type": "req", "id": "c1", "method": "connect",
                "params": {"token": GOCLAW_TOKEN, "user_id": USER_ID},
            }))
            connect_resp = json.loads(await asyncio.wait_for(ws.recv(), 10))
            if not connect_resp.get('ok'):
                return False, f"connect failed: {connect_resp}"

            await ws.send(json.dumps({
                "type": "req", "id": "s1", "method": "send",
                "params": {"channel": "zalo_personal", "to": ANH_UID, "message": message},
            }))
            send_resp = json.loads(await asyncio.wait_for(ws.recv(), 15))
            if not send_resp.get('ok'):
                return False, f"send failed: {send_resp}"
            return True, ""
    except Exception as e:
        return False, f"ws error: {type(e).__name__}: {e}"

async def patch_directus_status(order_id: str, status: str):
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.patch(
            f"{DIRECTUS}/items/orders/{order_id}",
            headers={"Authorization": f"Bearer {RELAY_TOKEN}"},
            json={"notification_status": status},
        )
        if not r.is_success:
            log.warning("directus patch failed: %s %s", r.status_code, r.text[:200])

def fetch_pending_jobs(db: sqlite3.Connection, now: int, limit: int = 5) -> list:
    rows = db.execute(
        "SELECT id, event_type, order_id, order_code, message, retry_count "
        "FROM jobs WHERE status='pending' AND next_attempt_at <= ? "
        "ORDER BY next_attempt_at ASC LIMIT ?",
        (now, limit),
    ).fetchall()
    return rows

async def process_job(db: sqlite3.Connection, job):
    job_id, event_type, order_id, order_code, message, retry_count = job
    log.info("processing job=%s event=%s code=%s retry=%d", job_id, event_type, order_code, retry_count)
    ok, err = await send_via_goclaw_ws(message)
    now = int(time.time())
    if ok:
        db.execute("UPDATE jobs SET status='sent', updated_at=? WHERE id=?", (now, job_id))
        db.commit()
        await patch_directus_status(order_id, 'sent')
        log.info("sent job=%s", job_id)
    else:
        # BACKOFF=[5,30,120] — 3 retries; new_retry counts THIS attempt's retry number (1-indexed)
        new_retry = retry_count + 1
        if new_retry > len(BACKOFF):
            db.execute("UPDATE jobs SET status='failed', updated_at=?, last_error=? WHERE id=?",
                       (now, err[:500], job_id))
            db.commit()
            await patch_directus_status(order_id, 'failed')
            log.error("failed job=%s after %d retries: %s", job_id, retry_count, err)
        else:
            backoff_seconds = BACKOFF[new_retry - 1]   # retry 1 → 5s, retry 2 → 30s, retry 3 → 120s
            next_at = now + backoff_seconds
            db.execute(
                "UPDATE jobs SET retry_count=?, next_attempt_at=?, last_error=?, updated_at=? WHERE id=?",
                (new_retry, next_at, err[:500], now, job_id),
            )
            db.commit()
            await patch_directus_status(order_id, 'retrying')
            log.warning("retry job=%s attempt=%d in %ds: %s", job_id, new_retry, backoff_seconds, err)

async def sender_worker():
    """Drain SQLite queue → send via GoClaw WS → update Directus."""
    while True:
        try:
            db = sqlite3.connect(DB_PATH)
            jobs = fetch_pending_jobs(db, int(time.time()))
            for job in jobs:
                await process_job(db, job)
            db.close()
        except Exception as e:
            log.exception("sender_worker loop error: %s", e)
        await asyncio.sleep(2)

def enqueue_order_job(order: dict, event_type: str) -> str | None:
    """Insert job into SQLite queue. Returns job_id, or None if order already queued recently."""
    job_id = str(uuid.uuid4())
    now = int(time.time())
    if event_type == 'order.created':
        message = format_new_order(order)
    elif event_type == 'order.paid':
        message = format_paid(order)
    else:
        return None
    db = sqlite3.connect(DB_PATH)
    # Idempotency: skip if same order_id already has a non-terminal job in last 5min
    existing = db.execute(
        "SELECT id FROM jobs WHERE order_id=? AND status IN ('pending','retrying','sent') "
        "AND created_at > ? LIMIT 1",
        (order['id'], now - 300),
    ).fetchone()
    if existing:
        db.close()
        return None
    db.execute(
        "INSERT INTO jobs (id, event_type, order_id, order_code, message, "
        "retry_count, next_attempt_at, status, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, 0, ?, 'pending', ?, ?)",
        (job_id, event_type, order['id'], order.get('order_code', ''), message, now, now, now),
    )
    db.commit()
    db.close()
    return job_id

async def reconciliation_worker():
    """Poll Directus for orders with notification_status=pending older than threshold.
    These are missed-webhook orders (Directus created them but webhook never reached us).
    Enqueue + mark queued so sender_worker picks up."""
    while True:
        try:
            cutoff_iso = time.strftime(
                '%Y-%m-%dT%H:%M:%SZ',
                time.gmtime(time.time() - RECONCILE_AGE),
            )
            async with httpx.AsyncClient(timeout=10) as c:
                r = await c.get(
                    f"{DIRECTUS}/items/orders",
                    headers={"Authorization": f"Bearer {RELAY_TOKEN}"},
                    params={
                        "filter[notification_status][_eq]": "pending",
                        "filter[created_at][_lt]": cutoff_iso,
                        "fields": "id,order_code,customer_name,customer_phone,"
                                  "shipping_city,shipping_district,shipping_address,"
                                  "items,total,payment_method,payment_status",
                        "limit": 50,
                    },
                )
            if r.is_success:
                missed = r.json().get('data', [])
                for order in missed:
                    job_id = enqueue_order_job(order, 'order.created')
                    if job_id:
                        await patch_directus_status(order['id'], 'queued')
                        log.warning("reconciled missed order id=%s code=%s job=%s",
                                    order['id'], order.get('order_code'), job_id)
            else:
                log.warning("reconcile fetch failed: %s %s", r.status_code, r.text[:200])
        except Exception as e:
            log.exception("reconciliation_worker error: %s", e)
        await asyncio.sleep(RECONCILE_POLL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    sender_task = asyncio.create_task(sender_worker())
    recon_task = asyncio.create_task(reconciliation_worker())
    log.info("workers started: sender + reconciliation (poll=%ds, age=%ds)",
             RECONCILE_POLL, RECONCILE_AGE)
    yield
    sender_task.cancel()
    recon_task.cancel()

app = FastAPI(lifespan=lifespan)

@app.get('/health')
async def health():
    return {"status": "ok"}

async def fetch_order_from_directus(order_id: str) -> dict | None:
    """Fetch canonical order record from Directus. Source of truth — never trust Flow body."""
    fields = ('id,order_code,customer_name,customer_phone,shipping_city,shipping_district,'
              'shipping_address,items,total,payment_method,payment_status,notification_status,created_at')
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(
            f"{DIRECTUS}/items/orders/{order_id}",
            headers={"Authorization": f"Bearer {RELAY_TOKEN}"},
            params={"fields": fields},
        )
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return r.json().get('data')

@app.post('/notify')
async def notify(req: Request):
    # Static bearer token verify (HMAC dropped — Directus Run Script sandboxed)
    if not verify_ingress_token(req.headers.get('X-Relay-Token', '')):
        raise HTTPException(403, 'invalid relay token')

    try:
        payload = await req.json()
    except Exception:
        raise HTTPException(400, 'invalid json')

    event_type = payload.get('event_type')
    order_id = payload.get('order_id')
    if not event_type or not order_id:
        raise HTTPException(400, 'missing event_type or order_id')
    if event_type not in ('order.created', 'order.paid'):
        raise HTTPException(400, f'unknown event_type: {event_type}')

    # Fetch canonical order from Directus (anti-spoofing + keeps PII out of Flow body/logs)
    order = await fetch_order_from_directus(order_id)
    if not order:
        log.warning("order not found order_id=%s", order_id)
        raise HTTPException(404, 'order not found')

    job_id = enqueue_order_job(order, event_type)
    if not job_id:
        # Idempotency hit (already queued in last 5min) — return 200 not 202
        log.info("dedup hit event=%s code=%s", event_type, order.get('order_code'))
        return {"queued": False, "reason": "duplicate_recent"}

    # Mark Directus immediately so reconciliation worker doesn't double-enqueue
    await patch_directus_status(order['id'], 'queued')
    log.info("queued job=%s event=%s code=%s", job_id, event_type, order.get('order_code'))
    return {"queued": True, "job_id": job_id}
```

**Why fetch from Directus instead of trusting Flow body:**
- Flow logs would otherwise contain full PII (`customer_phone`, `shipping_address`) for every order — Directus retains Flow execution logs by default, expanding PII surface area
- Spoofing defense: even if `RELAY_INGRESS_TOKEN` leaks, attacker can't inject fake order data — they'd need a real Directus order_id, which the relay re-validates
- Canonical source: if admin edits order between Flow trigger and relay processing, latest data is sent
- Trade-off: 1 extra HTTP call (~50ms over Docker network); acceptable vs. PII exposure

**3.8.** Boot relay:
```bash
cd /opt/sachcuahuy-relay
docker compose up -d --build
docker logs sachcuahuy-relay --tail 30
# Expect: "worker started" + uvicorn listening on 0.0.0.0:9090
```

**3.9.** Smoke test relay health:
```bash
curl http://127.0.0.1:9090/health
# {"status":"ok"}
```

**3.10.** Test static-token verify works (negative test):
```bash
# Without token header
curl -X POST http://127.0.0.1:9090/notify -H "Content-Type: application/json" -d '{}'
# Expect: 403 invalid relay token

# With wrong token
curl -X POST http://127.0.0.1:9090/notify \
  -H "Content-Type: application/json" \
  -H "X-Relay-Token: deadbeef" \
  -d '{}'
# Expect: 403 invalid relay token
```

### 4. Test relay → GoClaw → Zalo end-to-end (manual)

Pre-requisite: a real order record in Directus to test against (relay fetches canonical, `test-uuid-1` won't work).

```bash
# Step 1: Create real test order via api-orders token (Phase 1 issued)
DIRECTUS_TOKEN=<api-orders token>
ORDER_RESPONSE=$(curl -s -X POST https://cms.sachcuahuy.com/items/orders \
  -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_code":"SCH-260502-TEST1","order_token":"testtoken12345abc",
    "customer_name":"Test User","customer_phone":"0912345678",
    "shipping_city":"hcm","shipping_district":"Q1","shipping_address":"123 Test",
    "items":[{"slug":"mien-nam-cua-huy","title":"Miền Nam của Huy","qty":1,"price":179000}],
    "subtotal":179000,"shipping_fee":0,"total":179000,
    "payment_method":"cod","payment_status":"pending","order_status":"new","notification_status":"pending"
  }')
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r .data.id)

# Step 2: Trigger relay /notify with order_id (mimics what Directus Flow will send)
RELAY_TOKEN=$(grep RELAY_INGRESS_TOKEN /opt/sachcuahuy-relay/.env | cut -d= -f2)
curl -X POST http://127.0.0.1:9090/notify \
  -H "Content-Type: application/json" \
  -H "X-Relay-Token: $RELAY_TOKEN" \
  -d "{\"event_type\":\"order.created\",\"order_id\":\"$ORDER_ID\"}"
# Expect: {"queued":true,"job_id":"<uuid>"}
# Within 5-10s: anh receives Zalo message
# Verify logs: docker logs sachcuahuy-relay --tail 20
# Verify Directus: order.notification_status=sent (relay fetched + sent + patched)

# Step 3: Negative test — bogus order_id should 404
curl -X POST http://127.0.0.1:9090/notify \
  -H "Content-Type: application/json" \
  -H "X-Relay-Token: $RELAY_TOKEN" \
  -d '{"event_type":"order.created","order_id":"00000000-0000-0000-0000-000000000000"}'
# Expect: 404 order not found
```

### 5. Create Directus Flow 1: `notify_new_order`

**v2.1 simplification:** No JS exec op needed. Directus Webhook op supports custom headers natively → static `X-Relay-Token` from env. (Run Script is sandboxed; cannot `require('crypto')` per [Directus Flows docs](https://docs.directus.io/app/flows/operations).)

**5.1.** Directus admin → Settings → Flows → Create Flow:
- **Name:** `Notify new order`
- **Trigger:** Event Hook → `orders.items.create` → action: `Non-blocking`
- **Operations:**
  1. **Webhook POST** (op: `request-url`):
     - Method: `POST`
     - URL: `http://sachcuahuy-relay:9090/notify` (Docker internal hostname)
     - Headers:
       ```
       Content-Type: application/json
       X-Relay-Token: {{$env.RELAY_INGRESS_TOKEN}}
       ```
     - Body (raw JSON — **only order_id, no PII**):
       ```json
       {
         "event_type": "order.created",
         "order_id": "{{$trigger.payload.id}}"
       }
       ```

**Why no `read-data` op + only `order_id` in body:**
- Keeps PII (phone, address) out of Directus Flow execution logs (logs retained by default)
- Relay re-fetches canonical order from Directus using its own token → single source of truth
- Smaller webhook body → less data through Flow operation logs
- Spoof-resistant: even if relay token leaks, attacker needs valid `order_id` (UUID) which is non-enumerable

**5.2.** Add `RELAY_INGRESS_TOKEN` to Directus container env + allowlist `$env` access:
```bash
# /opt/directus-sachcuahuy/.env
RELAY_INGRESS_TOKEN=<same as /opt/sachcuahuy-relay/.env RELAY_INGRESS_TOKEN>
FLOWS_ENV_ALLOW_LIST=RELAY_INGRESS_TOKEN
```
**Why `FLOWS_ENV_ALLOW_LIST`:** Per Directus config docs, `$env.{VAR}` in Flow operations is **disabled by default** for security. Must explicitly allowlist each env var. Without this, `{{$env.RELAY_INGRESS_TOKEN}}` resolves to empty string → relay rejects with 401, silent webhook failure.

Then `docker compose up -d --force-recreate` Directus to pick up env changes.

**Verify allowlist works** (after recreate):
- Create test Flow with single Webhook op → URL: `http://httpbin.org/headers`, Header: `X-Test: {{$env.RELAY_INGRESS_TOKEN}}`
- Trigger manually → check response shows token value, not empty

**5.3.** Directus must be on same Docker network `goclaw_default` to resolve `sachcuahuy-relay` hostname (already configured Phase 1 step 2).

**5.4.** Test: create order via API:
```bash
TOKEN=<api-orders token from Phase 1>
curl -X POST https://cms.sachcuahuy.com/items/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_code":"SCH-260502-TEST1","order_token":"testtoken12345abc",
    "customer_name":"Flow Test","customer_phone":"0912345678",
    "shipping_city":"hcm","shipping_district":"Q1","shipping_address":"123 Test",
    "items":[{"slug":"mien-nam-cua-huy","title":"Miền Nam của Huy","qty":1,"price":179000}],
    "subtotal":179000,"shipping_fee":0,"total":179000,
    "payment_method":"cod","payment_status":"pending","order_status":"new","notification_status":"pending"
  }'
# Expect within 10s: anh nhận Zalo + order.notification_status=sent
```

### 6. Create Directus Flow 2: `notify_paid`

**6.1.** Same pattern as Flow 1, trigger: `orders.items.update`
**6.2.** Filter: only proceed if `payment_status` changed to `paid`:
- Use Condition op trước Webhook: `$trigger.payload.payment_status === 'paid'`
**6.3.** Body (same minimal pattern as Flow 1 — order_id only, relay fetches canonical):
```json
{
  "event_type": "order.paid",
  "order_id": "{{$trigger.keys[0]}}"
}
```
Note: update events use `$trigger.keys` array (multiple records can update at once). For singleton update, use `keys[0]`.
**6.4.** Test: anh login admin → mark test order paid → expect Zalo confirmation

### 7. Resilience tests

**7.1. Worker survives reboot:**
```bash
docker exec sachcuahuy-relay sqlite3 /app/data/queue.db "INSERT INTO jobs VALUES('manual-1','order.created','x','SCH-...','test',0,$(date +%s),'pending',$(date +%s),$(date +%s),NULL)"
docker compose restart relay
docker logs sachcuahuy-relay --tail 20
# Expect: worker resumes, processes the manually inserted job
```

**7.2. GoClaw down → retry backoff:**
```bash
# Stop GoClaw
docker stop goclaw-goclaw-1
# Trigger order via Directus → relay queues
sleep 200  # wait for 3 retries (5s, 30s, 120s = 155s + buffer)
# Verify: order.notification_status=failed, last_error logged
docker exec sachcuahuy-relay sqlite3 /app/data/queue.db "SELECT id, status, retry_count, last_error FROM jobs;"
# Restart GoClaw
docker start goclaw-goclaw-1
# Manual re-queue (Phase 6 will automate via cron):
docker exec sachcuahuy-relay sqlite3 /app/data/queue.db \
  "UPDATE jobs SET status='pending', retry_count=0, next_attempt_at=$(date +%s) WHERE status='failed';"
```

**7.3. Static-token mismatch → reject:**
```bash
curl -X POST http://127.0.0.1:9090/notify \
  -H "X-Relay-Token: wrong-token-deadbeef" \
  -d '{"event_type":"order.created","order_id":"00000000-0000-0000-0000-000000000000"}'
# Expect: 403 invalid relay token (rejected before order_id even validated)
```

**7.4. Reconciliation worker recovery (missed webhook simulation):**
```bash
# Simulate missed webhook: stop relay, create order via Directus API, restart relay
docker stop sachcuahuy-relay
TOKEN=<api-orders token from Phase 1>
curl -X POST https://cms.sachcuahuy.com/items/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_code":"SCH-260502-RECON1","order_token":"recontoken123abcd",
    "customer_name":"Reconcile Test","customer_phone":"0912345678",
    "shipping_city":"hcm","shipping_district":"Q1","shipping_address":"123 Recon",
    "items":[{"slug":"mien-nam-cua-huy","title":"Miền Nam của Huy","qty":1,"price":179000}],
    "subtotal":179000,"shipping_fee":0,"total":179000,
    "payment_method":"cod","payment_status":"pending","order_status":"new","notification_status":"pending"
  }'
# Wait > RECONCILE_AGE_THRESHOLD_SECONDS (90s default)
sleep 100
docker start sachcuahuy-relay
# Within RECONCILE_POLL_SECONDS (60s default): reconciliation worker picks up
# Expect log: "reconciled missed order id=... code=SCH-260502-RECON1"
# Verify: order.notification_status transitions pending → queued → sent
```

### 8. Documentation
- `~/marketing-tasks/projects/goclaw-config/sachcuahuy-relay-runbook.md`:
  - Architecture diagram (sender + reconciliation workers)
  - Env vars reference (incl. `RELAY_INGRESS_TOKEN`, `RECONCILE_POLL_SECONDS`, `RECONCILE_AGE_THRESHOLD_SECONDS`)
  - Common ops: re-queue failed jobs, check queue depth, rotate `RELAY_INGRESS_TOKEN`, force reconciliation
  - Rollback: `docker compose down`, disable Directus Flows
- Snapshot Flow definitions: Directus admin → Flows → Export YAML → save to runbook

## Todo Checklist

- [ ] **Step 0 (BLOCKER):** Confirm Q1 Zalo Personal account choice
- [ ] Create GoClaw user `sachcuahuy`
- [ ] Pair Zalo Personal channel; save instance_id + anh's uid
- [ ] Verify channel status `connected`
- [ ] Build relay service skeleton (`/opt/sachcuahuy-relay/`)
- [ ] Write `requirements.txt`, `Dockerfile`, `docker-compose.yml`, `.env`
- [ ] Write `zalo_formatter.py` + `main.py`
- [ ] Boot relay container, verify health endpoint
- [ ] Test static-token verify (negative test rejects missing/wrong `X-Relay-Token`)
- [ ] Manual relay test: curl `/notify` with valid `X-Relay-Token` → anh receives Zalo
- [ ] Add `RELAY_INGRESS_TOKEN` to Directus env, recreate container
- [ ] Create Directus Flow `notify_new_order` (read → webhook with `X-Relay-Token` header — no JS exec op)
- [ ] Create Directus Flow `notify_paid` (with filter condition)
- [ ] End-to-end test: order via Directus API → Zalo received <10s
- [ ] End-to-end test: mark paid → Zalo confirmation
- [ ] Resilience test: relay restart preserves queue
- [ ] Resilience test: GoClaw down → 3 retries → status=failed
- [ ] Resilience test: relay token mismatch → 403
- [ ] Resilience test: missed-webhook recovery (stop relay → create order → restart → reconciliation worker enqueues within ≤2min)
- [ ] Verify reconciliation worker honors idempotency (no double-enqueue for already-queued orders)
- [ ] Document runbook in `goclaw-config` repo (incl. token rotation procedure)
- [ ] Export Flow YAML for version control

## Success Criteria

- [ ] New order trong Directus → anh nhận Zalo trong <10s với template đúng
- [ ] Mark paid → anh nhận confirmation Zalo
- [ ] `notification_status` field reflects pending/queued/sent/retrying/failed accurately
- [ ] Relay queue persists across container restart (SQLite verified)
- [ ] Relay token mismatch returns 403; valid `X-Relay-Token` accepted
- [ ] After 3 GoClaw failures: `notification_status=failed`, error logged
- [ ] Reconciliation worker recovers missed-webhook orders within ≤2min (poll 60s + age 90s)
- [ ] No double-send: order with `notification_status≠pending` skipped by reconciliation
- [ ] Multi-tenant verified: events show `user_id=sachcuahuy` in GoClaw logs (no leak to other users)
- [ ] Docker network isolation: relay HTTP not reachable từ public internet (only `127.0.0.1:9090` + internal `goclaw_default`)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Zalo Personal ban (số chính) | Medium | High | Q1 decide; monitor first 7 days; throwaway fallback |
| Relay container crashloop | Low | High | Healthcheck endpoint + Docker `restart: unless-stopped`; logs to `/opt/sachcuahuy-relay/logs/` |
| WS connect race với GoClaw boot | Low | Medium | Worker retries every 2s; backoff handles transient failures |
| `RELAY_INGRESS_TOKEN` leak | Low | High | Token in `.env` only, never in logs; rotate quarterly; relay only reachable via internal Docker network so leak alone insufficient to forge requests |
| Reconciliation worker thrash (over-poll Directus) | Low | Low | Tunable `RECONCILE_POLL_SECONDS` (default 60); idempotency check via `notification_status` enum prevents double-send |
| Directus → relay Docker DNS resolution fail | Medium | High | Verify same network `goclaw_default`; fallback hostname `192.168.x.x` if needed |
| GoClaw v3.11.3 `send` RPC breaking change | Low | High | Phase 0 already verified meow chat working; smoke test step 4 catches early |
| SQLite queue corruption | Low | Medium | Daily backup `data/queue.db`; on corrupt → drop + restart (acceptable, lost <1day jobs) |
| Anh's Zalo phone changed → channel dead | Low | High | Healthcheck script Phase 6 alert; manual re-pair runbook documented |
| Worker concurrent send to same Zalo session | Low | Low | Single worker, jobs sequential; serial processing acceptable cho <100 orders/day |
| Directus Flow webhook timeout (default 5s) | Medium | Medium | Relay returns 202 fast (queue insert <50ms); actual send async |
| Relay private endpoint exposed accidentally | Low | High | Bind `127.0.0.1:9090` only; verify `nmap` from outside Contabo |

## Security

- **Auth chain:** Vercel API → Directus (`api-orders` token) → Flow webhook (`X-Relay-Token` static bearer) → Relay (verifies token, constant-time compare) → GoClaw WS (gateway token + user_id) → Zalo
- **Secrets:**
  - `RELAY_INGRESS_TOKEN` — static bearer shared between Directus + Relay only (replaces v2 HMAC; Directus Run Script is sandboxed, no `require('crypto')`)
  - `GOCLAW_GATEWAY_TOKEN` — shared with GoClaw container
  - `DIRECTUS_RELAY_TOKEN` — least-privilege, read `orders` (for reconciliation) + write `notification_status` only
  - All in `.env`, never in code/git
- **Network:** Relay binds `127.0.0.1:9090` (no public expose); Directus → Relay qua Docker internal DNS `sachcuahuy-relay:9090`. Reconciliation worker uses Docker-internal `directus-sachcuahuy:8055`.
- **Token compare:** `hmac.compare_digest(INGRESS_TOKEN, provided)` — constant-time even though no HMAC; module reused for the helper
- **Multi-tenant:** GoClaw `X-GoClaw-User-Id` enforced; verify isolation via test (no cross-user leak)
- **Logging:** order details in relay logs (PII trade-off vs debug); rotate logs `/opt/sachcuahuy-relay/logs/` daily, retain 7 days
- **Token rotation:** GoClaw gateway token quarterly; Directus tokens annual

## Next Steps

After Phase 4 complete:
- → Phase 5: Polish + launch (notification gate moved to post-launch observation)
- Post-launch monitoring (7 days):
  - Notification success rate >99%
  - p95 latency <10s
  - Zero PII leaks in logs
- Phase 6 backlog:
  - Customer Zalo confirmation noti (paid → khách Zalo nếu đã pair)
  - Cron 5p job to auto-retry `notification_status=failed` (currently manual)
  - MCP query feature ("hôm nay đơn?", "sách hết hàng?") — proper FastMCP server
  - Email backup notification (Q8) — when Zalo down, send email via Resend
  - Healthcheck script for Zalo channel auth expiry → alert anh

## Unresolved Questions

- **Q1 (BLOCKER):** Zalo Personal số chính hay throwaway? Confirm trước Step 0
- Relay worker single-threaded OK cho MVP (<100 orders/day); when to scale to multi-worker? — defer monitoring data
- ~~Directus Flow JS exec op có hỗ trợ `require('crypto')` v11?~~ → **Resolved v2.1**: NO. Run Script sandboxed per [docs](https://docs.directus.io/app/flows/operations). v2.1 uses static `X-Relay-Token` header (Webhook op native, no JS).
- GoClaw `send` RPC có rate limit không? — defer monitoring; queue serial processing handles inherently
- `RELAY_INGRESS_TOKEN` rotation: how to coordinate Directus + Relay swap without missing notifications? — runbook step (set both old+new accepted in relay temporarily, swap Directus env, drop old after 5min)
- Reconciliation worker poll/age tunables (60s / 90s default) — observe first week, adjust if false-positive enqueues observed

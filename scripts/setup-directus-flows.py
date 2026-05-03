#!/usr/bin/env python3
"""Idempotent setup for Directus Flows that notify the relay on order events.

Creates / updates two flows:

- `notify_new_order` — fires on `orders.items.create`, posts
  `{"event_type":"order.created","order_id":<id>}` to the relay with
  `X-Relay-Token` from `$env.RELAY_INGRESS_TOKEN`.
- `notify_paid` — fires on `orders.items.update`; a Condition op short-circuits
  the flow unless `payload.payment_status === "paid"`. Then posts
  `{"event_type":"order.paid","order_id":<key>}`.

Webhook URL targets the Docker-internal relay hostname `sachcuahuy-relay:9090`
(both Directus and relay live on the `goclaw_default` network).

Re-running the script is safe: it deletes any flow with the same name first
(operations are nested children and cascade-delete) before re-creating.

Env vars required:
  DIRECTUS_URL      e.g. https://cms.sachcuahuy.com
  ADMIN_TOKEN       static admin token (preferred; works with 2FA/OAuth setups)
                    OR
  ADMIN_EMAIL       email/password fallback (fails when 2FA is enabled —
  ADMIN_PASSWORD    Directus rejects /auth/login without OTP)

If both are set, ADMIN_TOKEN wins. The token must belong to a user with
admin policy (it manages /flows + /operations).
"""
import json
import os
import sys
import urllib.error
import urllib.request

URL = os.environ["DIRECTUS_URL"].rstrip("/")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "").strip()
EMAIL = os.environ.get("ADMIN_EMAIL", "")
PWD = os.environ.get("ADMIN_PASSWORD", "")

UA = "sachcuahuy-bootstrap/1.0 (Directus flows setup)"
RELAY_URL = "http://sachcuahuy-relay:9090/notify"


def req(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(URL + path, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    r.add_header("User-Agent", UA)
    r.add_header("Accept", "application/json")
    if token:
        r.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw.decode("utf-8", "replace")}


def auth() -> str:
    """Return an admin bearer token. ADMIN_TOKEN takes precedence; fall
    back to ADMIN_EMAIL/ADMIN_PASSWORD only if no token is provided.
    Email/password login fails on 2FA-enabled accounts — prefer a token."""
    if ADMIN_TOKEN:
        return ADMIN_TOKEN
    if not EMAIL or not PWD:
        sys.exit(
            "no auth: set ADMIN_TOKEN, or both ADMIN_EMAIL + ADMIN_PASSWORD"
        )
    code, b = req("POST", "/auth/login", body={"email": EMAIL, "password": PWD})
    if code != 200:
        sys.exit(f"login failed: {code} {b} (use ADMIN_TOKEN if 2FA is on)")
    return b["data"]["access_token"]


def find_flow_by_name(token: str, name: str) -> dict | None:
    code, b = req(
        "GET",
        f"/flows?filter[name][_eq]={name}&fields=id,name,status,operations.id",
        token=token,
    )
    if code != 200:
        sys.exit(f"flows list failed: {code} {b}")
    items = b.get("data") or []
    return items[0] if items else None


def delete_flow(token: str, flow_id: str):
    """Delete the flow; cascade removes nested operations."""
    code, b = req("DELETE", f"/flows/{flow_id}", token=token)
    if code not in (200, 204):
        sys.exit(f"delete flow {flow_id} failed: {code} {b}")


def create_flow(token: str, flow: dict) -> str:
    code, b = req("POST", "/flows", token=token, body=flow)
    if code not in (200, 201):
        sys.exit(f"create flow failed: {code} {b}")
    return b["data"]["id"]


def create_op(token: str, op: dict) -> str:
    code, b = req("POST", "/operations", token=token, body=op)
    if code not in (200, 201):
        sys.exit(f"create op failed: {code} {b}")
    return b["data"]["id"]


def link_first_op(token: str, flow_id: str, op_id: str):
    code, b = req(
        "PATCH",
        f"/flows/{flow_id}",
        token=token,
        body={"operation": op_id},
    )
    if code != 200:
        sys.exit(f"link first op failed: {code} {b}")


def link_resolve(token: str, op_id: str, resolve_op_id: str):
    """Set the `resolve` (success-branch) successor of an op."""
    code, b = req(
        "PATCH",
        f"/operations/{op_id}",
        token=token,
        body={"resolve": resolve_op_id},
    )
    if code != 200:
        sys.exit(f"link resolve failed: {code} {b}")


def webhook_op(name: str, key: str, body_template: dict, position: tuple) -> dict:
    return {
        "name": name,
        "key": key,
        "type": "request",
        "position_x": position[0],
        "position_y": position[1],
        "options": {
            "method": "POST",
            "url": RELAY_URL,
            "headers": [
                {"header": "Content-Type", "value": "application/json"},
                {"header": "X-Relay-Token", "value": "{{$env.RELAY_INGRESS_TOKEN}}"},
            ],
            "body": json.dumps(body_template),
        },
    }


def upsert_new_order_flow(token: str):
    """Recreate `notify_new_order` flow from scratch (idempotent via delete-first)."""
    existing = find_flow_by_name(token, "notify_new_order")
    if existing:
        print(f"  found existing flow id={existing['id']}, deleting for clean re-create")
        delete_flow(token, existing["id"])

    flow_id = create_flow(
        token,
        {
            "name": "notify_new_order",
            "icon": "notifications_active",
            "color": "#3399FF",
            "description": "Phase 4: POST to sachcuahuy-relay on new order; relay sends Zalo via meow-zalo channel",
            "status": "active",
            "trigger": "event",
            "accountability": "all",
            "options": {
                "type": "action",
                "scope": ["items.create"],
                "collections": ["orders"],
            },
        },
    )
    print(f"  created flow id={flow_id}")

    op_id = create_op(
        token,
        {
            **webhook_op(
                "Webhook to relay",
                "webhook_relay",
                # Directus 11 emits singular `key` for items.create (one row per event);
                # `keys` (plural) is only present for items.update batch hooks.
                {"event_type": "order.created", "order_id": "{{$trigger.key}}"},
                (19, 1),
            ),
            "flow": flow_id,
        },
    )
    print(f"  created webhook op id={op_id}")
    link_first_op(token, flow_id, op_id)
    print("  linked op as flow's first operation")


def upsert_paid_flow(token: str):
    """Recreate `notify_paid` flow: Condition op → Webhook op only when payment_status='paid'."""
    existing = find_flow_by_name(token, "notify_paid")
    if existing:
        print(f"  found existing flow id={existing['id']}, deleting for clean re-create")
        delete_flow(token, existing["id"])

    flow_id = create_flow(
        token,
        {
            "name": "notify_paid",
            "icon": "verified",
            "color": "#2ECC71",
            "description": "Phase 4: POST to relay only when payment_status transitions to 'paid'",
            "status": "active",
            "trigger": "event",
            "accountability": "all",
            "options": {
                "type": "action",
                "scope": ["items.update"],
                "collections": ["orders"],
            },
        },
    )
    print(f"  created flow id={flow_id}")

    cond_op_id = create_op(
        token,
        {
            "name": "Only if paid",
            "key": "cond_paid",
            "type": "condition",
            "position_x": 19,
            "position_y": 1,
            "options": {
                "filter": {
                    "$trigger": {
                        "payload": {"payment_status": {"_eq": "paid"}},
                    },
                },
            },
            "flow": flow_id,
        },
    )
    print(f"  created condition op id={cond_op_id}")

    webhook_id = create_op(
        token,
        {
            **webhook_op(
                "Webhook to relay",
                "webhook_relay",
                {"event_type": "order.paid", "order_id": "{{$trigger.keys[0]}}"},
                (37, 1),
            ),
            "flow": flow_id,
        },
    )
    print(f"  created webhook op id={webhook_id}")

    link_first_op(token, flow_id, cond_op_id)
    link_resolve(token, cond_op_id, webhook_id)
    print("  wired condition.resolve -> webhook")


def main():
    print("Authenticating: " + ("ADMIN_TOKEN" if ADMIN_TOKEN else f"login {EMAIL}"))
    token = auth()
    print("Setting up flow: notify_new_order")
    upsert_new_order_flow(token)
    print("Setting up flow: notify_paid")
    upsert_paid_flow(token)
    print("Done. Verify in Directus admin UI -> Settings -> Flows.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Configure Directus roles + policies + permissions for sachcuahuy.

Idempotent: skips existing roles/policies/permissions.
Run AFTER setup-directus-schema.py.

Env vars required:
  DIRECTUS_URL
  ADMIN_EMAIL
  ADMIN_PASSWORD
"""
import json
import os
import sys
import urllib.error
import urllib.request

URL = os.environ["DIRECTUS_URL"].rstrip("/")
EMAIL = os.environ["ADMIN_EMAIL"]
PWD = os.environ["ADMIN_PASSWORD"]
UA = "sachcuahuy-bootstrap/1.0 (Directus permissions setup)"


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


def login():
    code, b = req("POST", "/auth/login", body={"email": EMAIL, "password": PWD})
    if code != 200:
        sys.exit(f"login failed: {code} {b}")
    return b["data"]["access_token"]


# --- helpers ---

def find_policy(t, name):
    code, b = req("GET", f'/policies?filter[name][_eq]={urllib.request.quote(name)}', token=t)
    if code != 200:
        return None
    items = b.get("data", [])
    return items[0] if items else None


def find_role(t, name):
    code, b = req("GET", f'/roles?filter[name][_eq]={urllib.request.quote(name)}', token=t)
    if code != 200:
        return None
    items = b.get("data", [])
    return items[0] if items else None


def ensure_policy(t, name, *, app_access=False, admin_access=False, description=""):
    found = find_policy(t, name)
    if found:
        print(f"  [skip] policy exists: {name} ({found['id']})")
        return found["id"]
    code, b = req("POST", "/policies", token=t,
                  body={"name": name, "app_access": app_access, "admin_access": admin_access,
                        "description": description, "icon": "policy"})
    if code not in (200, 204):
        sys.exit(f"  [FAIL] create policy {name}: {code} {b}")
    pid = b["data"]["id"]
    print(f"  [ok]   created policy: {name} ({pid})")
    return pid


def ensure_role(t, name, *, description=""):
    found = find_role(t, name)
    if found:
        print(f"  [skip] role exists: {name} ({found['id']})")
        return found["id"]
    code, b = req("POST", "/roles", token=t, body={"name": name, "description": description, "icon": "supervised_user_circle"})
    if code not in (200, 204):
        sys.exit(f"  [FAIL] create role {name}: {code} {b}")
    rid = b["data"]["id"]
    print(f"  [ok]   created role: {name} ({rid})")
    return rid


def ensure_role_policy_link(t, role_id, policy_id):
    # Check existing /access entries
    code, b = req("GET", f'/access?filter[role][_eq]={role_id}&filter[policy][_eq]={policy_id}', token=t)
    if code == 200 and b.get("data"):
        print(f"  [skip] role-policy link exists: {role_id} -> {policy_id}")
        return
    code, b = req("POST", "/access", token=t, body={"role": role_id, "policy": policy_id, "sort": 1})
    if code not in (200, 204):
        sys.exit(f"  [FAIL] link role {role_id} -> policy {policy_id}: {code} {b}")
    print(f"  [ok]   linked role -> policy: {role_id} -> {policy_id}")


def perm_exists(t, policy_id, collection, action):
    code, b = req("GET",
                  f'/permissions?filter[policy][_eq]={policy_id}'
                  f'&filter[collection][_eq]={collection}'
                  f'&filter[action][_eq]={action}',
                  token=t)
    if code != 200:
        return False
    return bool(b.get("data"))


def create_perm(t, policy_id, collection, action, *, permissions=None, fields=None, validation=None, presets=None):
    if perm_exists(t, policy_id, collection, action):
        print(f"  [skip] perm exists: policy={policy_id[:8]} {collection}.{action}")
        return
    body = {
        "policy": policy_id,
        "collection": collection,
        "action": action,
        "permissions": permissions or {},
        "fields": fields if fields is not None else ["*"],
        "validation": validation or {},
        "presets": presets,
    }
    code, b = req("POST", "/permissions", token=t, body=body)
    if code not in (200, 204):
        sys.exit(f"  [FAIL] create perm {collection}.{action}: {code} {b}")
    print(f"  [ok]   perm: policy={policy_id[:8]} {collection}.{action}")


# --- definitions ---

PUBLISHED_ONLY = {"_and": [{"status": {"_eq": "published"}}]}

# api-orders allowed update fields on orders (per plan: verify-lock state only)
ORDERS_VERIFY_FIELDS = ["verify_attempts", "verify_locked_until", "verify_last_attempt_at"]

# relay-notifier allowed read fields on orders (per plan)
RELAY_READ_FIELDS = [
    "id", "order_code", "customer_name", "customer_phone",
    "shipping_city", "shipping_district", "shipping_address",
    "items", "total", "payment_method", "payment_status",
    "notification_status", "created_at",
]


def main():
    t = login()
    print("login: ok\n")

    # ---- Public policy: extend with our reads ----
    print("== public policy ==")
    pub = find_policy(t, "$t:public_label")
    if not pub:
        sys.exit("public policy not found — Directus initialization issue?")
    pub_id = pub["id"]
    print(f"  using public policy: {pub_id}")
    create_perm(t, pub_id, "books", "read", permissions=PUBLISHED_ONLY)
    create_perm(t, pub_id, "pages", "read", permissions=PUBLISHED_ONLY)
    create_perm(t, pub_id, "site_settings", "read")
    print()

    # ---- api-orders ----
    print("== api-orders ==")
    api_pol = ensure_policy(t, "api-orders",
                            description="Server-side token: orders/customers writes, books/site_settings reads")
    api_role = ensure_role(t, "api-orders", description="Server-side API for Vercel /api/orders")
    ensure_role_policy_link(t, api_role, api_pol)
    create_perm(t, api_pol, "orders", "create")
    create_perm(t, api_pol, "orders", "read")
    create_perm(t, api_pol, "orders", "update", fields=ORDERS_VERIFY_FIELDS)
    create_perm(t, api_pol, "customers", "create")
    create_perm(t, api_pol, "customers", "read")
    create_perm(t, api_pol, "customers", "update")
    create_perm(t, api_pol, "books", "read", permissions=PUBLISHED_ONLY)
    create_perm(t, api_pol, "site_settings", "read")
    print()

    # ---- relay-notifier ----
    print("== relay-notifier ==")
    relay_pol = ensure_policy(t, "relay-notifier",
                              description="Phase 4 relay: read orders, update notification_status only")
    relay_role = ensure_role(t, "relay-notifier", description="Notification relay service")
    ensure_role_policy_link(t, relay_role, relay_pol)
    create_perm(t, relay_pol, "orders", "read", fields=RELAY_READ_FIELDS)
    create_perm(t, relay_pol, "orders", "update", fields=["notification_status"])
    print()

    # ---- editor (Huy) ----
    print("== editor ==")
    ed_pol = ensure_policy(t, "editor",
                           app_access=True,
                           description="Content editor: books/pages/podcast CRUD, orders status update")
    ed_role = ensure_role(t, "editor", description="Content editor (Huy)")
    ensure_role_policy_link(t, ed_role, ed_pol)
    for col in ("books", "pages", "podcast_episodes"):
        for action in ("create", "read", "update", "delete"):
            create_perm(t, ed_pol, col, action)
    create_perm(t, ed_pol, "orders", "read")
    create_perm(t, ed_pol, "orders", "update", fields=["order_status", "payment_status", "paid_at"])
    create_perm(t, ed_pol, "customers", "read")
    # site_settings: no perm = blocked
    print()

    print("DONE.")
    print()
    print("Role IDs (for static token user creation in Step 11):")
    print(f"  api-orders     role={api_role}     policy={api_pol}")
    print(f"  relay-notifier role={relay_role}   policy={relay_pol}")
    print(f"  editor         role={ed_role}       policy={ed_pol}")


if __name__ == "__main__":
    main()

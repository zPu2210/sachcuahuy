#!/usr/bin/env python3
"""
Bootstrap Directus schema for sachcuahuy.
Idempotent: safe to re-run; skips existing collections/fields.

Env vars required:
  DIRECTUS_URL      e.g. https://cms.sachcuahuy.com
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


UA = "sachcuahuy-bootstrap/1.0 (Directus schema setup)"


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


def collection_exists(t, name):
    code, _ = req("GET", f"/collections/{name}", token=t)
    return code == 200


def field_exists(t, col, field):
    code, _ = req("GET", f"/fields/{col}/{field}", token=t)
    return code == 200


def create_collection(t, payload):
    name = payload["collection"]
    if collection_exists(t, name):
        print(f"  [skip] collection exists: {name}")
        return
    code, b = req("POST", "/collections", token=t, body=payload)
    if code not in (200, 204):
        sys.exit(f"  [FAIL] create coll {name}: {code} {b}")
    print(f"  [ok]   created collection: {name}")


def create_field(t, col, payload):
    fname = payload["field"]
    if field_exists(t, col, fname):
        print(f"  [skip] field exists: {col}.{fname}")
        return
    code, b = req("POST", f"/fields/{col}", token=t, body=payload)
    if code not in (200, 204):
        sys.exit(f"  [FAIL] create field {col}.{fname}: {code} {b}")
    print(f"  [ok]   created field: {col}.{fname}")


# ---------- Field builders ----------

def f_uuid_pk():
    return {
        "field": "id",
        "type": "uuid",
        "meta": {"hidden": True, "readonly": True, "interface": "input", "special": ["uuid"]},
        "schema": {"is_primary_key": True, "has_auto_increment": False},
    }


def f_string(field, *, unique=False, default=None, required=False, note=None, max_length=None):
    schema = {"is_nullable": not required}
    if unique:
        schema["is_unique"] = True
    if default is not None:
        schema["default_value"] = default
    if max_length:
        schema["max_length"] = max_length
    meta = {"interface": "input"}
    if required:
        meta["required"] = True
    if note:
        meta["note"] = note
    return {"field": field, "type": "string", "meta": meta, "schema": schema}


def f_text(field, *, required=False, note=None):
    schema = {"is_nullable": not required}
    meta = {"interface": "input-multiline"}
    if required:
        meta["required"] = True
    if note:
        meta["note"] = note
    return {"field": field, "type": "text", "meta": meta, "schema": schema}


def f_richtext(field, *, required=False):
    schema = {"is_nullable": not required}
    meta = {"interface": "input-rich-text-html"}
    if required:
        meta["required"] = True
    return {"field": field, "type": "text", "meta": meta, "schema": schema}


def f_int(field, *, default=None, required=False, note=None):
    schema = {"is_nullable": not required}
    if default is not None:
        schema["default_value"] = default
    meta = {"interface": "input"}
    if required:
        meta["required"] = True
    if note:
        meta["note"] = note
    return {"field": field, "type": "integer", "meta": meta, "schema": schema}


def f_bool(field, *, default=False):
    return {
        "field": field,
        "type": "boolean",
        "meta": {"interface": "boolean"},
        "schema": {"default_value": default, "is_nullable": False},
    }


def f_date(field):
    return {"field": field, "type": "date", "meta": {"interface": "datetime"}, "schema": {"is_nullable": True}}


def f_datetime(field):
    return {"field": field, "type": "timestamp", "meta": {"interface": "datetime"}, "schema": {"is_nullable": True}}


def f_dt_created():
    return {
        "field": "created_at",
        "type": "timestamp",
        "meta": {"interface": "datetime", "readonly": True, "hidden": True, "special": ["date-created"]},
        "schema": {},
    }


def f_dt_updated():
    return {
        "field": "updated_at",
        "type": "timestamp",
        "meta": {"interface": "datetime", "readonly": True, "hidden": True, "special": ["date-updated"]},
        "schema": {},
    }


def f_dropdown(field, choices, default=None, required=False, note=None):
    schema = {"is_nullable": not required}
    if default is not None:
        schema["default_value"] = default
    meta = {
        "interface": "select-dropdown",
        "options": {"choices": [{"text": c.replace("_", " ").title(), "value": c} for c in choices]},
    }
    if required:
        meta["required"] = True
    if note:
        meta["note"] = note
    return {"field": field, "type": "string", "meta": meta, "schema": schema}


def f_json(field, *, default=None):
    schema = {"is_nullable": True}
    if default is not None:
        schema["default_value"] = default
    return {
        "field": field,
        "type": "json",
        "meta": {"interface": "input-code", "options": {"language": "json"}},
        "schema": schema,
    }


def f_file_m2o(field):
    return {
        "field": field,
        "type": "uuid",
        "meta": {"interface": "file-image", "display": "image", "special": ["file"]},
        "schema": {"is_nullable": True},
    }


# ---------- Schema ----------

# Built-in `status` field uses default Directus interface

PAYMENT_STATUS = ["pending", "paid", "refunded", "cancelled"]
ORDER_STATUS = ["new", "confirmed", "shipped", "delivered", "cancelled"]
NOTIF_STATUS = ["pending", "queued", "sent", "failed", "retrying"]
PUBLISH_STATUS = ["draft", "published", "archived"]


COLLECTIONS = [
    {
        "collection": "books",
        "meta": {
            "icon": "menu_book",
            "note": "Catalog of books for sale",
            "sort_field": "sort_order",
            "archive_field": "status",
            "archive_value": "archived",
            "unarchive_value": "draft",
        },
        "schema": {"name": "books"},
        "fields": [
            f_uuid_pk(),
            f_string("slug", unique=True, required=True, note="URL-safe slug, e.g. mien-nam-cua-huy"),
            f_string("title", required=True),
            f_string("subtitle"),
            f_string("author", default="Trọng Huy"),
            f_richtext("description"),
            f_text("short_description", note="Brief excerpt for listing cards"),
            f_int("price", required=True, note="VND"),
            f_int("compare_price", note="Original/strike-through price (optional)"),
            f_dropdown("stock_status", ["in_stock", "out_of_stock"], default="in_stock", required=True),
            f_file_m2o("cover_image"),
            f_string("isbn"),
            f_string("publisher"),
            f_date("published_date"),
            f_int("page_count"),
            f_bool("is_new", default=False),
            f_bool("is_coming_soon", default=False),
            f_int("sort_order", default=0),
            f_dropdown("status", PUBLISH_STATUS, default="draft", required=True),
            f_string("seo_title"),
            f_text("seo_description"),
            f_dt_created(),
            f_dt_updated(),
        ],
    },
    {
        "collection": "customers",
        "meta": {"icon": "person", "note": "Auto-created from orders, dedup by phone"},
        "schema": {"name": "customers"},
        "fields": [
            f_uuid_pk(),
            f_string("phone", unique=True, required=True),
            f_string("name", required=True),
            f_string("email"),
            f_int("total_orders", default=0),
            f_int("total_spent", default=0, note="VND"),
            f_datetime("last_order_at"),
            f_dt_created(),
        ],
    },
    {
        "collection": "orders",
        "meta": {
            "icon": "shopping_bag",
            "note": "Customer orders",
            "sort_field": "created_at",
            "archive_field": "order_status",
            "archive_value": "cancelled",
            "unarchive_value": "new",
        },
        "schema": {"name": "orders"},
        "fields": [
            f_uuid_pk(),
            f_string("order_code", unique=True, required=True, note="Human-friendly code SCH-YYMMDD-NNNN"),
            f_string("order_token", unique=True, required=True, note="Opaque 16-char nanoid for /xac-nhan/[token]"),
            f_string("customer_name", required=True),
            f_string("customer_phone", required=True),
            f_string("customer_email"),
            f_string("shipping_city", required=True),
            f_string("shipping_district"),
            f_text("shipping_address", required=True),
            f_text("note"),
            f_json("items", default=[]),
            f_int("subtotal", required=True),
            f_int("shipping_fee", default=0),
            f_int("discount", default=0),
            f_int("total", required=True),
            f_dropdown("payment_method", ["cod", "bank"], required=True),
            f_dropdown("payment_status", PAYMENT_STATUS, default="pending", required=True),
            f_dropdown("order_status", ORDER_STATUS, default="new", required=True),
            f_dropdown("notification_status", NOTIF_STATUS, default="pending", required=True,
                       note="Set to 'queued' when relay accepts; 'sent' on success; 'failed' after 3 retries"),
            f_int("verify_attempts", default=0, note="Phone-last-4 brute-force counter"),
            f_datetime("verify_locked_until"),
            f_datetime("verify_last_attempt_at"),
            f_datetime("paid_at"),
            f_dt_created(),
            f_dt_updated(),
        ],
    },
    {
        "collection": "site_settings",
        "meta": {"icon": "settings", "singleton": True, "note": "Global site settings (one row only)"},
        "schema": {"name": "site_settings"},
        "fields": [
            f_uuid_pk(),
            f_string("bank_name", default="VCB"),
            f_string("bank_account"),
            f_string("bank_holder"),
            f_string("bank_branch"),
            f_string("memo_format", default="{name} - {phone}"),
            f_json("shipping_free_cities", default=["hcm", "hn"]),
            f_int("shipping_flat_fee", default=25000),
            f_int("shipping_threshold"),
            f_string("hero_title"),
            f_text("hero_subtitle"),
            f_richtext("author_bio"),
            f_text("author_short_bio"),
            f_file_m2o("author_image"),
            f_string("social_facebook"),
            f_string("social_instagram"),
            f_string("social_zalo"),
            f_string("contact_email"),
            f_string("contact_phone"),
        ],
    },
    {
        "collection": "pages",
        "meta": {"icon": "article", "note": "CMS-driven static pages"},
        "schema": {"name": "pages"},
        "fields": [
            f_uuid_pk(),
            f_string("slug", unique=True, required=True),
            f_string("title", required=True),
            f_richtext("content"),
            f_string("seo_title"),
            f_text("seo_description"),
            f_dropdown("status", ["draft", "published"], default="draft", required=True),
        ],
    },
    {
        "collection": "podcast_episodes",
        "meta": {"icon": "podcasts", "note": "Phase 6 — schema only, hidden from public until launch"},
        "schema": {"name": "podcast_episodes"},
        "fields": [
            f_uuid_pk(),
            f_string("slug", unique=True, required=True),
            f_string("title", required=True),
            f_text("description"),
            f_string("audio_url"),
            f_int("duration_seconds"),
            f_file_m2o("cover_image"),
            f_datetime("published_at"),
            f_int("episode_number"),
            f_int("season", default=1),
            f_dropdown("status", ["draft", "published"], default="draft", required=True),
        ],
    },
]


# Relations to create after fields. Directus auto-creates file-link relations
# for `special: ["file"]` fields, but cross-collection M2O needs explicit relation.

RELATIONS = [
    # orders.customer_id -> customers.id (M2O). PK type is integer (Directus default).
    {
        "collection": "orders",
        "field": "customer_id",
        "field_def": {
            "field": "customer_id",
            "type": "integer",
            "meta": {"interface": "select-dropdown-m2o", "display": "related-values",
                     "display_options": {"template": "{{name}} ({{phone}})"}, "special": ["m2o"]},
            "schema": {"is_nullable": True},
        },
        "relation": {
            "collection": "orders",
            "field": "customer_id",
            "related_collection": "customers",
            "schema": {"on_delete": "SET NULL"},
            "meta": {"sort_field": None},
        },
    },
]


def setup_relation(t, rel):
    col, field = rel["collection"], rel["field"]
    if not field_exists(t, col, field):
        # field+relation in one go via /fields endpoint with relation embedded? simpler: create field, then relation.
        create_field(t, col, rel["field_def"])
    # check if relation already exists
    code, body = req("GET", f"/relations/{col}/{field}", token=t)
    if code == 200:
        print(f"  [skip] relation exists: {col}.{field}")
        return
    code, b = req("POST", "/relations", token=t, body=rel["relation"])
    if code not in (200, 204):
        sys.exit(f"  [FAIL] create relation {col}.{field}: {code} {b}")
    print(f"  [ok]   created relation: {col}.{field} -> {rel['relation']['related_collection']}")


# Singleton row creation
def ensure_singleton(t, col):
    code, b = req("GET", f"/items/{col}", token=t)
    if code == 200 and b.get("data"):
        print(f"  [skip] singleton row exists: {col}")
        return
    code, b = req("POST", f"/items/{col}", token=t, body={})
    if code not in (200, 204):
        # singleton may need to be initialized via direct read after schema apply; tolerate 400 if already created server-side
        print(f"  [warn] singleton init {col}: {code} {b}")
        return
    print(f"  [ok]   initialized singleton row: {col}")


def main():
    print(f"Directus: {URL}")
    print(f"Admin:    {EMAIL}")
    print()
    token = login()
    print("login: ok")
    print()
    # 1) Collections + fields
    for c in COLLECTIONS:
        payload = {"collection": c["collection"], "meta": c["meta"], "schema": c["schema"]}
        print(f"== {c['collection']} ==")
        create_collection(token, payload)
        for fld in c["fields"]:
            create_field(token, c["collection"], fld)
        print()
    # 2) Relations
    print("== relations ==")
    for rel in RELATIONS:
        setup_relation(token, rel)
    print()
    # 3) Singleton init
    print("== singleton init ==")
    ensure_singleton(token, "site_settings")
    print()
    print("DONE.")


if __name__ == "__main__":
    main()

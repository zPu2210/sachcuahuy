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
import urllib.parse
import urllib.request

URL = os.environ["DIRECTUS_URL"].rstrip("/")
EMAIL = os.environ["ADMIN_EMAIL"]
PWD = os.environ["ADMIN_PASSWORD"]
DEFAULT_LANGUAGE = "vi-VN"
HUY_EMAIL = os.environ.get("HUY_EMAIL", "").strip()
FORCE_ADMIN_VI = os.environ.get("FORCE_ADMIN_VI") == "1"


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


def expect_ok(code, body, action):
    if code not in (200, 201, 204):
        sys.exit(f"  [FAIL] {action}: {code} {body}")


def get_data(method, path, token, action):
    code, body = req(method, path, token=token)
    expect_ok(code, body, action)
    return body.get("data") or {}


def get_collection(t, collection):
    return get_data("GET", f"/collections/{collection}", t, f"read collection {collection}")


def get_field(t, collection, field):
    return get_data("GET", f"/fields/{collection}/{field}", t, f"read field {collection}.{field}")


COLLECTION_META_KEYS = {
    "icon", "color", "note", "display_template", "hidden", "singleton",
    "translations", "archive_field", "archive_app_filter", "archive_value",
    "unarchive_value", "sort_field", "accountability",
    "item_duplication_fields", "sort", "group", "collapse", "versioning",
}

FIELD_META_KEYS = {
    "special", "interface", "options", "display", "display_options",
    "readonly", "hidden", "sort", "width", "translations", "note",
    "required", "group", "validation", "validation_message", "conditions",
}


def extract_meta(item, keys):
    meta = item.get("meta")
    if isinstance(meta, dict):
        source = meta
    else:
        source = {key: item[key] for key in keys if key in item}
    return {
        key: json.loads(json.dumps(value))
        for key, value in source.items()
        if key not in {"id", "collection", "field"}
    }


def deep_merge_meta(current, patch):
    merged = json.loads(json.dumps(current or {}))
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = deep_merge_meta(merged[key], value)
        else:
            merged[key] = json.loads(json.dumps(value))
    return merged


def vi_translation(label, current=None):
    translations = []
    for item in current or []:
        if not isinstance(item, dict):
            continue
        if item.get("language") != DEFAULT_LANGUAGE:
            translations.append(dict(item))
    translations.append({"language": DEFAULT_LANGUAGE, "translation": label})
    return translations


def assert_choice_values_unchanged(current_choices, next_choices, field_name):
    current_values = [choice.get("value") for choice in current_choices]
    next_values = [choice.get("value") for choice in next_choices]
    if current_values != next_values:
        sys.exit(
            "  [FAIL] dropdown values changed for "
            f"{field_name}: {current_values} -> {next_values}"
        )


def translate_choices(current_choices, labels, field_name):
    next_choices = []
    for choice in current_choices:
        value = choice.get("value")
        updated = dict(choice)
        if value in labels:
            updated["text"] = labels[value]
        next_choices.append(updated)
    assert_choice_values_unchanged(current_choices, next_choices, field_name)
    return next_choices


def patch_collection_meta(t, collection):
    label = COLLECTION_TRANSLATIONS.get(collection)
    note = COLLECTION_NOTES_VI.get(collection)
    if not label and not note:
        return
    current = get_collection(t, collection)
    current_meta = extract_meta(current, COLLECTION_META_KEYS)
    patch = {}
    if label:
        patch["translations"] = vi_translation(label, current_meta.get("translations"))
    if note:
        patch["note"] = note
    merged = deep_merge_meta(current_meta, patch)
    if merged == current_meta:
        print(f"  [skip] collection meta already Vietnamese: {collection}")
        return
    code, body = req("PATCH", f"/collections/{collection}", token=t, body={"meta": merged})
    expect_ok(code, body, f"patch collection meta {collection}")
    print(f"  [patch] collection meta: {collection}")


def patch_field_meta(t, collection, field, fallback_meta=None):
    field_key = f"{collection}.{field}"
    label = FIELD_TRANSLATIONS.get(field_key)
    note = FIELD_NOTES_VI.get(field_key)
    dropdown_labels = DROPDOWN_LABELS.get(field_key)
    if not label and not note and not dropdown_labels:
        return
    current = get_field(t, collection, field)
    current_meta = extract_meta(current, FIELD_META_KEYS)
    patch = {}
    if label:
        patch["translations"] = vi_translation(label, current_meta.get("translations"))
    if note:
        patch["note"] = note
    if dropdown_labels:
        current_options = current_meta.get("options") or {}
        current_choices = current_options.get("choices")
        if not current_choices and fallback_meta:
            current_choices = (fallback_meta.get("options") or {}).get("choices")
        if not current_choices:
            sys.exit(f"  [FAIL] missing dropdown choices for {field_key}")
        next_choices = translate_choices(current_choices, dropdown_labels, field_key)
        patch["options"] = {"choices": next_choices}
    merged = deep_merge_meta(current_meta, patch)
    if merged == current_meta:
        print(f"  [skip] field meta already Vietnamese: {field_key}")
        return
    code, body = req("PATCH", f"/fields/{collection}/{field}", token=t, body={"meta": merged})
    expect_ok(code, body, f"patch field meta {field_key}")
    print(f"  [patch] field meta: {field_key}")


def patch_settings_language(t):
    code, body = req("PATCH", "/settings", token=t, body={"default_language": DEFAULT_LANGUAGE})
    expect_ok(code, body, "patch settings default language")
    print(f"  [patch] settings default_language: {DEFAULT_LANGUAGE}")


def find_user_by_email(t, email):
    query = urllib.parse.urlencode({
        "filter[email][_eq]": email,
        "fields": "id,email,language",
        "limit": "1",
    })
    code, body = req("GET", f"/users?{query}", token=t)
    expect_ok(code, body, f"find user {email}")
    users = body.get("data") or []
    return users[0] if users else None


def patch_user_language_by_email(t, email, *, required=False):
    if not email:
        return
    user = find_user_by_email(t, email)
    if not user:
        msg = f"  [warn] user not found for language patch: {email}"
        if required:
            sys.exit(msg)
        print(msg)
        return
    if user.get("language") == DEFAULT_LANGUAGE:
        print(f"  [skip] user language already {DEFAULT_LANGUAGE}: {email}")
        return
    code, body = req("PATCH", f"/users/{user['id']}", token=t, body={"language": DEFAULT_LANGUAGE})
    expect_ok(code, body, f"patch user language {email}")
    print(f"  [patch] user language: {email} -> {DEFAULT_LANGUAGE}")


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


def f_dropdown(field, choices, default=None, required=False, note=None, labels=None):
    schema = {"is_nullable": not required}
    if default is not None:
        schema["default_value"] = default
    labels = labels or {}
    meta = {
        "interface": "select-dropdown",
        "options": {
            "choices": [
                {"text": labels.get(c, c.replace("_", " ").title()), "value": c}
                for c in choices
            ]
        },
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

DROPDOWN_LABELS = {
    "books.stock_status": {
        "in_stock": "Còn hàng",
        "out_of_stock": "Hết hàng",
    },
    "books.status": {
        "draft": "Bản nháp",
        "published": "Đã xuất bản",
        "archived": "Đã lưu trữ",
    },
    "orders.payment_method": {
        "cod": "Thanh toán khi nhận hàng",
        "bank": "Chuyển khoản ngân hàng",
    },
    "orders.payment_status": {
        "pending": "Chờ thanh toán",
        "paid": "Đã thanh toán",
        "refunded": "Đã hoàn tiền",
        "cancelled": "Đã hủy",
    },
    "orders.order_status": {
        "new": "Đơn mới",
        "confirmed": "Đã xác nhận",
        "shipped": "Đang giao",
        "delivered": "Đã giao",
        "cancelled": "Đã hủy",
    },
    "orders.notification_status": {
        "pending": "Chờ gửi",
        "queued": "Đang xếp hàng",
        "sent": "Đã gửi",
        "failed": "Gửi lỗi",
        "retrying": "Đang gửi lại",
    },
    "pages.status": {
        "draft": "Bản nháp",
        "published": "Đã xuất bản",
    },
    "podcast_episodes.status": {
        "draft": "Bản nháp",
        "published": "Đã xuất bản",
    },
}

COLLECTION_TRANSLATIONS = {
    "books": "Sách",
    "customers": "Khách hàng",
    "orders": "Đơn hàng",
    "site_settings": "Cài đặt website",
    "pages": "Trang nội dung",
    "podcast_episodes": "Tập podcast",
}

COLLECTION_NOTES_VI = {
    "books": "Danh mục sách đang bán",
    "customers": "Khách hàng tự tạo từ đơn, chống trùng theo số điện thoại",
    "orders": "Đơn hàng của khách",
    "site_settings": "Cài đặt chung của website (chỉ một bản ghi)",
    "pages": "Các trang tĩnh quản lý trong CMS",
    "podcast_episodes": "Lược đồ tập podcast; chưa hiển thị công khai đến khi ra mắt",
}

FIELD_TRANSLATIONS = {
    "books.id": "ID",
    "books.slug": "Đường dẫn",
    "books.title": "Tiêu đề",
    "books.subtitle": "Phụ đề",
    "books.author": "Tác giả",
    "books.description": "Mô tả",
    "books.short_description": "Mô tả ngắn",
    "books.price": "Giá bán",
    "books.compare_price": "Giá gốc",
    "books.stock_status": "Tình trạng kho",
    "books.cover_image": "Ảnh bìa",
    "books.isbn": "ISBN",
    "books.publisher": "Nhà xuất bản",
    "books.published_date": "Ngày xuất bản",
    "books.page_count": "Số trang",
    "books.is_new": "Sách mới",
    "books.is_coming_soon": "Sắp phát hành",
    "books.sort_order": "Thứ tự sắp xếp",
    "books.status": "Trạng thái xuất bản",
    "books.seo_title": "Tiêu đề SEO",
    "books.seo_description": "Mô tả SEO",
    "books.created_at": "Ngày tạo",
    "books.updated_at": "Ngày cập nhật",
    "customers.id": "ID",
    "customers.phone": "Số điện thoại",
    "customers.name": "Tên khách hàng",
    "customers.email": "Email",
    "customers.total_orders": "Tổng đơn",
    "customers.total_spent": "Tổng chi tiêu",
    "customers.last_order_at": "Lần đặt gần nhất",
    "customers.created_at": "Ngày tạo",
    "orders.id": "ID",
    "orders.order_code": "Mã đơn hàng",
    "orders.order_token": "Mã xác nhận",
    "orders.customer_name": "Tên khách hàng",
    "orders.customer_phone": "Số điện thoại",
    "orders.customer_email": "Email khách",
    "orders.shipping_city": "Tỉnh/thành giao hàng",
    "orders.shipping_district": "Quận/huyện",
    "orders.shipping_address": "Địa chỉ giao hàng",
    "orders.note": "Ghi chú",
    "orders.items": "Sản phẩm trong đơn",
    "orders.subtotal": "Tạm tính",
    "orders.shipping_fee": "Phí vận chuyển",
    "orders.discount": "Giảm giá",
    "orders.total": "Tổng thanh toán",
    "orders.payment_method": "Phương thức thanh toán",
    "orders.payment_status": "Thanh toán",
    "orders.order_status": "Trạng thái đơn",
    "orders.notification_status": "Thông báo Zalo",
    "orders.verify_attempts": "Số lần xác minh",
    "orders.verify_locked_until": "Khóa xác minh đến",
    "orders.verify_last_attempt_at": "Lần xác minh gần nhất",
    "orders.paid_at": "Ngày thanh toán",
    "orders.created_at": "Ngày tạo",
    "orders.updated_at": "Ngày cập nhật",
    "orders.customer_id": "Khách hàng",
    "site_settings.id": "ID",
    "site_settings.bank_name": "Tên ngân hàng",
    "site_settings.bank_account": "Số tài khoản",
    "site_settings.bank_holder": "Chủ tài khoản",
    "site_settings.bank_branch": "Chi nhánh ngân hàng",
    "site_settings.memo_format": "Mẫu nội dung chuyển khoản",
    "site_settings.shipping_free_cities": "Thành phố miễn phí giao hàng",
    "site_settings.shipping_flat_fee": "Phí giao hàng cố định",
    "site_settings.shipping_threshold": "Ngưỡng miễn phí giao hàng",
    "site_settings.hero_title": "Tiêu đề trang chủ",
    "site_settings.hero_subtitle": "Phụ đề trang chủ",
    "site_settings.author_bio": "Tiểu sử tác giả",
    "site_settings.author_short_bio": "Giới thiệu ngắn tác giả",
    "site_settings.author_image": "Ảnh tác giả",
    "site_settings.social_facebook": "Facebook",
    "site_settings.social_instagram": "Instagram",
    "site_settings.social_zalo": "Zalo",
    "site_settings.contact_email": "Email liên hệ",
    "site_settings.contact_phone": "Số điện thoại liên hệ",
    "pages.id": "ID",
    "pages.slug": "Đường dẫn",
    "pages.title": "Tiêu đề",
    "pages.content": "Nội dung",
    "pages.seo_title": "Tiêu đề SEO",
    "pages.seo_description": "Mô tả SEO",
    "pages.status": "Trạng thái xuất bản",
    "podcast_episodes.id": "ID",
    "podcast_episodes.slug": "Đường dẫn",
    "podcast_episodes.title": "Tiêu đề",
    "podcast_episodes.description": "Mô tả",
    "podcast_episodes.audio_url": "Đường dẫn audio",
    "podcast_episodes.duration_seconds": "Thời lượng (giây)",
    "podcast_episodes.cover_image": "Ảnh bìa",
    "podcast_episodes.published_at": "Ngày phát hành",
    "podcast_episodes.episode_number": "Số tập",
    "podcast_episodes.season": "Mùa",
    "podcast_episodes.status": "Trạng thái xuất bản",
}

FIELD_NOTES_VI = {
    "books.slug": "Đường dẫn URL, ví dụ mien-nam-cua-huy",
    "books.short_description": "Mô tả ngắn hiển thị trên thẻ danh sách",
    "books.price": "Giá VND",
    "books.compare_price": "Giá gốc/gạch ngang (nếu có)",
    "customers.total_spent": "Tổng tiền VND",
    "orders.order_code": "Mã dễ đọc dạng SCH-YYMMDD-NNNN",
    "orders.order_token": "Mã 16 ký tự dùng cho /xac-nhan/[token]",
    "orders.notification_status": (
        "Đặt thành queued khi relay nhận; sent khi gửi thành công; "
        "failed sau 3 lần thử"
    ),
    "orders.verify_attempts": "Số lần thử 4 số cuối điện thoại",
}


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
            f_dropdown(
                "stock_status",
                ["in_stock", "out_of_stock"],
                default="in_stock",
                required=True,
                labels=DROPDOWN_LABELS["books.stock_status"],
            ),
            f_file_m2o("cover_image"),
            f_string("isbn"),
            f_string("publisher"),
            f_date("published_date"),
            f_int("page_count"),
            f_bool("is_new", default=False),
            f_bool("is_coming_soon", default=False),
            f_int("sort_order", default=0),
            f_dropdown(
                "status",
                PUBLISH_STATUS,
                default="draft",
                required=True,
                labels=DROPDOWN_LABELS["books.status"],
            ),
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
            f_dropdown(
                "payment_method",
                ["cod", "bank"],
                required=True,
                labels=DROPDOWN_LABELS["orders.payment_method"],
            ),
            f_dropdown(
                "payment_status",
                PAYMENT_STATUS,
                default="pending",
                required=True,
                labels=DROPDOWN_LABELS["orders.payment_status"],
            ),
            f_dropdown(
                "order_status",
                ORDER_STATUS,
                default="new",
                required=True,
                labels=DROPDOWN_LABELS["orders.order_status"],
            ),
            f_dropdown(
                "notification_status",
                NOTIF_STATUS,
                default="pending",
                required=True,
                note="Set to 'queued' when relay accepts; 'sent' on success; 'failed' after 3 retries",
                labels=DROPDOWN_LABELS["orders.notification_status"],
            ),
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
            f_dropdown(
                "status",
                ["draft", "published"],
                default="draft",
                required=True,
                labels=DROPDOWN_LABELS["pages.status"],
            ),
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
            f_dropdown(
                "status",
                ["draft", "published"],
                default="draft",
                required=True,
                labels=DROPDOWN_LABELS["podcast_episodes.status"],
            ),
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
        patch_collection_meta(token, c["collection"])
        for fld in c["fields"]:
            create_field(token, c["collection"], fld)
            patch_field_meta(token, c["collection"], fld["field"], fld.get("meta"))
        print()
    # 2) Relations
    print("== relations ==")
    for rel in RELATIONS:
        setup_relation(token, rel)
        patch_field_meta(
            token,
            rel["collection"],
            rel["field"],
            rel["field_def"].get("meta"),
        )
    print()
    # 3) Singleton init
    print("== singleton init ==")
    ensure_singleton(token, "site_settings")
    print()
    # 4) Vietnamese CMS defaults and user preference.
    print("== Vietnamese CMS metadata ==")
    patch_settings_language(token)
    if HUY_EMAIL:
        patch_user_language_by_email(token, HUY_EMAIL)
    else:
        print("  [warn] HUY_EMAIL not set; skipped Huy user language patch")
    if FORCE_ADMIN_VI:
        patch_user_language_by_email(token, EMAIL, required=True)
    print()
    print("DONE.")


if __name__ == "__main__":
    main()

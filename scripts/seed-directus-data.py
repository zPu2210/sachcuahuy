#!/usr/bin/env python3
"""
Seed Directus with initial sachcuahuy content:
  - 2 books (Miền Nam của Huy, Góc Phần Tư)
  - site_settings (bank + shipping + hero + author bio)
  - 2 pages (gioi-thieu, lien-he)

Idempotent: skips existing slugs / settings already populated.
Run AFTER setup-directus-permissions.py.

Cover images uploaded in Phase 3.
"""
import json
import os
import sys
import urllib.error
import urllib.request

URL = os.environ["DIRECTUS_URL"].rstrip("/")
EMAIL = os.environ["ADMIN_EMAIL"]
PWD = os.environ["ADMIN_PASSWORD"]
UA = "sachcuahuy-bootstrap/1.0 (Directus seed)"


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


def find_by_field(t, collection, field, value):
    code, b = req("GET",
                  f"/items/{collection}?filter[{field}][_eq]={urllib.request.quote(str(value))}&limit=1",
                  token=t)
    if code != 200:
        return None
    items = b.get("data", [])
    return items[0] if items else None


def create_item(t, collection, payload, *, key_field=None):
    if key_field:
        existing = find_by_field(t, collection, key_field, payload[key_field])
        if existing:
            print(f"  [skip] {collection}.{key_field}={payload[key_field]!r} exists (id={existing['id']})")
            return existing["id"]
    code, b = req("POST", f"/items/{collection}", token=t, body=payload)
    if code not in (200, 204):
        sys.exit(f"  [FAIL] create {collection}: {code} {b}")
    new_id = b["data"]["id"]
    print(f"  [ok]   {collection}: {payload.get(key_field, new_id)} (id={new_id})")
    return new_id


def patch_singleton(t, collection, payload):
    # site_settings is a singleton — Directus auto-creates row; PATCH updates it
    code, b = req("PATCH", f"/items/{collection}", token=t, body=payload)
    if code not in (200, 204):
        sys.exit(f"  [FAIL] patch singleton {collection}: {code} {b}")
    print(f"  [ok]   patched singleton: {collection}")


# ---- content ----

MIEN_NAM_DESCRIPTION = """<p><em>"Nơi ấy có Mina và một mái nhà"</em></p>
<p><strong>Miền Nam của Huy</strong> là tập tản văn ghi lại những kỷ niệm, những mảnh ghép cuộc sống của tác giả tại Sài Gòn. Cùng với chú chó Mina - người bạn đồng hành trung thành, những câu chuyện nhỏ được kể lại với giọng văn nhẹ nhàng, đầy hoài niệm.</p>
<p>Cuốn sách mang đến cho độc giả những khoảnh khắc bình dị nhưng đáng nhớ trong cuộc sống - từ những buổi sáng thức dậy bên Mina, những chuyến đi dạo qua các con hẻm Sài Gòn, đến những suy tư về quê hương và tuổi trẻ.</p>
<ul>
  <li>Bìa cứng, illustration độc đáo</li>
  <li>34 chương, ~200 trang</li>
  <li>Phù hợp cho người yêu văn học đương đại</li>
</ul>
"""

GOC_PHAN_TU_DESCRIPTION = """<p><em>"Bạn chắc đã nghe đến góc phần tư cái bánh, góc phần tư căn nhà — vậy đã bao giờ bạn nghĩ đến góc phần tư cuộc đời?"</em></p>
<p><strong>Góc Phần Tư – Nỗi buồn nuôi ta khôn lớn</strong> là cuốn sách cho tôi liên tưởng và bất giác nghĩ rằng: <em>"góc phần tư đó cũng giống như một phần của bức tranh, muốn vẽ gì lên đó là quyền của mỗi người."</em></p>
<p>Đó là góc phần tư đầu tiên của cuộc đời, là những tháng năm của tuổi trẻ, là những ước mơ, hoài bão, tình yêu, cố gắng theo đuổi, là sự mơ hồ, chênh vênh, là những thứ không định nghĩa được.</p>
<p>Dù mỗi chúng ta có một cuộc sống riêng nhưng tuổi trẻ của tất cả vẫn sẽ có cái khung chung — ở đó là những vị ngọt bùi, cay đắng mà chỉ tuổi trẻ mới nếm được, là sự bắt đầu của nhiều thứ.</p>
"""

GOC_PHAN_TU_SHORT = ('"Bạn đã bao giờ nghĩ đến góc phần tư cuộc đời?" — Tản văn về tuổi trẻ, '
                     'những vị ngọt bùi cay đắng và sự bắt đầu của nhiều thứ.')

GIOI_THIEU_HTML = """<h2>Về Tác Giả</h2>
<p><em>"Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn."</em></p>
<p>Trọng Huy là phát thanh viên radio và Voice Talent Quảng Cáo tại Việt Nam. Bên cạnh công việc giọng nói, anh còn là một người viết với những tản văn nhẹ nhàng về cuộc sống đời thường.</p>
<p>Với giọng văn thân mật, gần gũi như đang kể chuyện bên tách cà phê, những câu chuyện của Trọng Huy thường xoay quanh Sài Gòn, chú chó Mina, và những khoảnh khắc bình dị nhưng đáng nhớ trong cuộc sống.</p>
<p>Anh tin rằng mỗi ngày đều có những điều nhỏ bé đáng được ghi lại, những khoảnh khắc tưởng chừng bình thường nhưng lại chứa đựng cả một bầu trời ký ức và cảm xúc.</p>
<h3>Hành trình</h3>
<ul>
  <li><strong>Sinh ra</strong> — Phú Thọ. Nơi bắt đầu câu chuyện.</li>
  <li><strong>Lớn lên</strong> — Hà Nội. Những năm tháng tuổi thơ.</li>
  <li><strong>Lập nghiệp</strong> — Sài Gòn. Chọn thành phố này làm nhà.</li>
  <li><strong>Hiện tại</strong> — Viết sách, ghi lại những câu chuyện nhỏ.</li>
</ul>
"""

LIEN_HE_HTML = """<h2>Liên hệ</h2>
<p>Mọi liên hệ đặt sách, hỗ trợ đơn hàng hay câu hỏi về tác giả, vui lòng gửi qua các kênh sau:</p>
<ul>
  <li>Email: <a href="mailto:pu.hungphu@gmail.com">pu.hungphu@gmail.com</a></li>
  <li>Zalo: cập nhật sau</li>
  <li>Facebook: cập nhật sau</li>
</ul>
<p>Em sẽ phản hồi trong vòng 24 giờ.</p>
"""

AUTHOR_BIO_HTML = """<p>Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn.</p>
<p>Phát thanh viên radio — Voice Talent Quảng Cáo. Bên cạnh công việc giọng nói, anh còn là một người viết với những tản văn nhẹ nhàng về cuộc sống đời thường.</p>
"""

AUTHOR_SHORT_BIO = ("Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn. "
                    "Phát thanh viên radio — Voice Talent Quảng Cáo.")


BOOKS = [
    {
        "slug": "mien-nam-cua-huy",
        "title": "Miền Nam của Huy",
        "subtitle": "Nơi ấy có Mina và một mái nhà",
        "author": "Trọng Huy",
        "description": MIEN_NAM_DESCRIPTION,
        "short_description": ("Tập tản văn ghi lại những kỷ niệm, những mảnh ghép cuộc sống tại Sài Gòn. "
                              "Cùng với chú chó Mina - người bạn đồng hành trung thành."),
        "price": 179000,
        "stock_status": "in_stock",
        "isbn": "978-604-464-000-0",
        "publisher": "NXB Dân Trí & Thế Giới",
        "published_date": "2026-01-01",
        "page_count": 200,
        "is_new": True,
        "is_coming_soon": False,
        "sort_order": 1,
        "status": "published",
        "seo_title": "Miền Nam của Huy — Tản văn của Trọng Huy",
        "seo_description": ("Tập tản văn về Sài Gòn, chú chó Mina và những khoảnh khắc bình dị. "
                            "Đặt mua trực tiếp từ tác giả Trọng Huy."),
    },
    {
        "slug": "goc-phan-tu",
        "title": "Góc Phần Tư",
        "subtitle": "Nỗi buồn nuôi ta khôn lớn",
        "author": "Trọng Huy",
        "description": GOC_PHAN_TU_DESCRIPTION,
        "short_description": GOC_PHAN_TU_SHORT,
        "price": 99000,
        "stock_status": "in_stock",
        "isbn": "",
        "publisher": "",
        "published_date": "2026-01-01",
        "page_count": 0,
        "is_new": True,
        "is_coming_soon": False,
        "sort_order": 2,
        "status": "published",
        "seo_title": "Góc Phần Tư — Nỗi buồn nuôi ta khôn lớn — Trọng Huy",
        "seo_description": ("Tản văn về tuổi trẻ, ước mơ, hoài bão và sự chênh vênh. "
                            "Đặt mua trực tiếp từ tác giả."),
    },
]

PAGES = [
    {
        "slug": "gioi-thieu",
        "title": "Về Tác Giả",
        "content": GIOI_THIEU_HTML,
        "seo_title": "Về Tác Giả Trọng Huy — Sách Của Huy",
        "seo_description": ("Trọng Huy — phát thanh viên, voice talent, tác giả tản văn. "
                            "Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn."),
        "status": "published",
    },
    {
        "slug": "lien-he",
        "title": "Liên hệ",
        "content": LIEN_HE_HTML,
        "seo_title": "Liên hệ — Sách Của Huy",
        "seo_description": "Liên hệ đặt sách, hỗ trợ đơn hàng — Sách Của Huy.",
        "status": "published",
    },
]

SITE_SETTINGS = {
    "bank_name": "VCB",
    "bank_account": "0181003488345",
    "bank_holder": "NGUYEN TRONG HUY",
    "bank_branch": "VCB Nam Sài Gòn",
    "memo_format": "{name} - {phone}",
    "shipping_free_cities": ["hcm", "hn"],
    "shipping_flat_fee": 25000,
    "shipping_threshold": None,
    "hero_title": "Sách Của Huy",
    "hero_subtitle": ("Tản văn nhẹ nhàng về Sài Gòn, tuổi trẻ và những khoảnh khắc đáng nhớ — "
                      "viết bởi Trọng Huy."),
    "author_bio": AUTHOR_BIO_HTML,
    "author_short_bio": AUTHOR_SHORT_BIO,
    "social_facebook": "",
    "social_instagram": "",
    "social_zalo": "",
    "contact_email": "pu.hungphu@gmail.com",
    "contact_phone": "",
}


def main():
    t = login()
    print("login: ok\n")

    print("== books ==")
    for b in BOOKS:
        create_item(t, "books", b, key_field="slug")
    print()

    print("== pages ==")
    for p in PAGES:
        create_item(t, "pages", p, key_field="slug")
    print()

    print("== site_settings (singleton) ==")
    patch_singleton(t, "site_settings", SITE_SETTINGS)
    print()

    print("DONE.")


if __name__ == "__main__":
    main()

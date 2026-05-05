---
phase: 3
created: 2026-05-03
status: completed
uploaded: 2026-05-05
---

# Phase 3 — Image Classification & Final Mapping

Source: `/Users/pu/Downloads/sachcuahuy/` (1 `gocphantu.jpg` + 19 `z*.jpg` = 20 files, 6.9MB total).

Per v2.2 reality check: `books.gallery` field does not exist. Only `books.cover_image` + `site_settings.author_image`. So Phase 3 = **3 uploads only** (no gallery).

## Final Picks (anh confirmed)

| Slot | Source File | WebP Output | Size | Alt Text (VI) |
|---|---|---|---|---|
| `books[mien-nam-cua-huy].cover_image` | `z7770338796353_b75ad4276bc994caa5c47907f90b3f12.jpg` | `mien-nam-cua-huy-cover.webp` | 76KB | Bìa sách Miền Nam của Huy với chân dung tác giả Trọng Huy trên nền xanh indigo |
| `books[goc-phan-tu].cover_image` | `gocphantu.jpg` | `goc-phan-tu-cover.webp` | 132KB | Bìa sách Góc Phần Tư - Nỗi buồn nuôi ta khôn lớn của tác giả Trọng Huy |
| `site_settings.author_image` | `z7770348137829_4cef55a3e52dc4bb1b47c7611dfb7403.jpg` | `author-trong-huy.webp` | 80KB | Chân dung tác giả Trọng Huy với chồng sách - phong cách hài hước, gần gũi |

**Total optimized:** 288KB (vs 412KB originals → ~30% reduction; well under 200KB LCP target after Directus `?width=800&format=webp` transform).

**WebP files location:** `/tmp/sachcuahuy-optimized/`

## Full AI Classification (20 files)

Classified via `gemini-2.5-flash` vision (parallel xargs -P4, ~70s total).

| File | AI Description | Type | Confidence | Selected? |
|---|---|---|---|---|
| `gocphantu.jpg` | Nhiều cuốn "Góc Phần Tư" trên bàn cùng ly nước | product-goc-phan-tu | high | ✅ cover GPT |
| `z7770338768353_*.jpg` | Sản phẩm "Miền Nam của Huy" bìa trước+sau | product-mien-nam | high | — |
| `z7770338770902_*.jpg` | Đứng trước tường xanh, ôm chồng sách | author-portrait | high | — alt |
| `z7770338787495_*.jpg` | Đeo tai nghe trong studio, sách phía sau | author-portrait | high | — alt |
| `z7770338796353_*.jpg` | Bìa sách Miền Nam của Huy với hình tác giả | cover-mien-nam | high | ✅ cover MN |
| `z7770338805231_*.jpg` | Sách + lịch 2026 + hộp giấy nền xanh | product-mien-nam | high | — |
| `z7770348120854_*.jpg` | Cắn chồng sách trước nền xanh, denim | author-portrait | high | — alt |
| `z7770348130475_*.jpg` | Sách trên tảng đá thiên nhiên | product-mien-nam | high | — |
| `z7770348137829_*.jpg` | Cắn chồng sách, áo cream + scarf, nền xanh | author-portrait | high | ✅ author |
| `z7770348144896_*.jpg` | Nhiều sách trên cỏ + hoa trắng vàng | product-mien-nam | high | — |
| `z7770348152182_*.jpg` | Chồng sách xếp + rời trên bàn | product-mien-nam | high | — |
| `z7770348161047_*.jpg` | Sách trên thân cây, cỏ, hoa tím | product-mien-nam | high | — |
| `z7770348166614_*.jpg` | Sách trên thảm cỏ + hoa | product-mien-nam | high | — |
| `z7770348393503_*.jpg` | Nhiều sách "Miền Nam của Huy" | product-mien-nam | high | — |
| `z7770348402549_*.jpg` | Sách màu xanh trên bàn | product-mien-nam | high | — |
| `z7770348409458_*.jpg` | Sản phẩm sách Miền Nam của Huy | product-mien-nam | high | — |
| `z7770348417437_*.jpg` | Sách trên mặt phẳng nền mờ | product-mien-nam | high | — |
| `z7770348423820_*.jpg` | Sách trên bàn nền xanh tự nhiên | product-mien-nam | high | — |
| `z7770348431709_*.jpg` | Sách trên bàn, cây xanh phía sau | product-mien-nam | high | — |
| `z7770348441402_*.jpg` | Sách xếp trên bàn, cây xanh nền | product-mien-nam | high | — |

**Bucket totals:**
- `cover-mien-nam`: 1 (used)
- `product-goc-phan-tu`: 1 (used as cover; only candidate)
- `author-portrait`: 4 (1 used + 3 alternates)
- `product-mien-nam`: 14 (none used — gallery field doesn't exist; pool kept for future)

## Optimization Command Used

```bash
cwebp -q 80 -resize 1600 0 -metadata none -m 6 <input>.jpg -o <output>.webp
```

- `-q 80` quality (visually lossless for photos)
- `-resize 1600 0` width 1600, auto height
- `-metadata none` strips EXIF (privacy, security)
- `-m 6` slowest/best compression

## Upload Script (ready, awaiting token)

`/tmp/sachcuahuy-classify/upload-and-link.sh` — accepts `ADMIN_TOKEN` env var, then:
1. Verify token with `GET /items/books`
2. Create folder `sachcuahuy-launch` (or reuse)
3. Upload 3 WebP via `POST /files` (multipart, with title + description)
4. PATCH `books/1.cover_image`, `books/2.cover_image`, `site_settings.author_image`
5. Verify public asset URL `assets/{id}?width=800&format=webp`
6. Save IDs to `/tmp/sachcuahuy-classify/file-ids.txt`

**Run when anh provides admin token:**
```bash
ADMIN_TOKEN="<paste>" /tmp/sachcuahuy-classify/upload-and-link.sh
```

## File IDs

```
MIENNAM_COVER=16bb0c87-da8d-4901-ad83-a733804adbc6
GOCPHANTU_COVER=140cfb53-bd47-49e7-980f-d743008e03e6
AUTHOR_PORTRAIT=15cbe426-c136-4350-90c6-2acd0afc4f91
FOLDER=4493f9ff-0069-4cea-b4eb-4bc9cbb8e491
```

## Public URLs

Frontend will fetch via:
```
https://cms.sachcuahuy.com/assets/{id}?width=800&format=webp&fit=cover
```

Verified HTTP 200 from public `/assets/*` after adding public `directus_files.read` permission.

## Gallery Handling (deferred)

`books.gallery` field intentionally absent in v2.2 schema. Plan options if needed later (Phase 6+):
1. Add Directus m2m `books_files` junction → schema bump
2. Or use single `cover_image` only (current minimal MVP — sufficient for launch)

The 14 `product-mien-nam` images remain in source folder for future use (gallery, blog, social, og:image variants).

## Source Integrity

Source `/Users/pu/Downloads/sachcuahuy/` left intact — 0 file deletions/renames.

Optimized `/tmp/sachcuahuy-optimized/` is staging only. Originals are the source of truth.

## Unresolved Questions

- Có cần re-shoot Góc Phần Tư cover (current image có car visible trong bg)? → Defer; current acceptable cho MVP.
- Có cần upload product shots làm gallery sau khi schema thêm m2m field? → Phase 6 decision.
- Watermark anti-copy? → Defer post-launch nếu có copy issue.

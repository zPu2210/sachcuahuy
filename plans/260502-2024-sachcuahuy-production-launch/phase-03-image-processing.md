---
phase: 3
title: "Image Processing & Upload"
status: pending
priority: P2
effort: "0.5d"
dependencies: [1]
---

# Phase 3: Image Processing & Upload

## Context Links

- **Plan overview:** [plan.md](./plan.md)
- **Brainstorm:** [brainstorm-260502-1601-website-ban-sach-architecture.md](../reports/brainstorm-260502-1601-website-ban-sach-architecture.md)
- **Phase 1:** [phase-01-directus-setup.md](./phase-01-directus-setup.md) — Directus must be live
- **Phase 2:** [phase-02-frontend-integration.md](./phase-02-frontend-integration.md) — `cover_image`/`gallery` consumed
- **Source folder:** `/Users/pu/Downloads/sachcuahuy/` (1 `gocphantu.jpg` + 19 `z*.jpg`)
- **ai-multimodal skill:** ~/.claude/skills/ai-multimodal/ (Gemini vision for image classification)
- **ImageMagick / cwebp:** macOS `brew install webp imagemagick`

## Overview

Phân loại 20 ảnh source thành buckets (cover/gallery/author/misc), AI-describe từng ảnh để pick canonical cover, optimize WebP @80 quality, upload Directus Files API, link `books.cover_image` + `books.gallery` cho 2 sách. Author photo → `site_settings.author_image`.

**Parallel với Phase 2** — chỉ cần Directus API live (Phase 1 done).

## Requirements

### Functional
- Mỗi sách (Miền Nam của Huy + Góc Phần Tư) có 1 cover + 3-5 gallery images
- Author có 1 photo trong `site_settings.author_image`
- Tất cả images lưu Directus Files (DB managed), accessible qua `/assets/{id}`
- WebP format, max 1600px width, quality 80
- Original files preserved trong `/Users/pu/Downloads/sachcuahuy/` (không xóa)

### Non-functional
- Total upload size < 5MB (acceptable cho 12GB Contabo)
- Image transform on-the-fly via Directus (`?width=800&format=webp`)
- LCP image (cover trên homepage) < 200KB after transform
- Alt text bilingual VI primary

## Architecture

```
/Users/pu/Downloads/sachcuahuy/
├── gocphantu.jpg              ← Phase 3 step 1: rename, mark as Góc Phần Tư cover candidate
└── z*.jpg (19 files)          ← Phase 3 step 1: AI classify

         │
         ▼ ai-multimodal skill (Gemini vision)
         │
    Buckets:
    ├── miennam-cover        → 1 file selected
    ├── miennam-gallery      → 3-5 files
    ├── gocphantu-cover      → gocphantu.jpg primary
    ├── gocphantu-gallery    → 0-3 files (if any z*.jpg fits)
    ├── author               → 1 file (Trọng Huy portrait)
    └── unused/discarded     → rest (saved with notes, not uploaded)

         │
         ▼ optimize: cwebp -q 80 -resize 1600 0
         │
    /tmp/sachcuahuy-optimized/
    ├── miennam-cover.webp
    ├── miennam-gallery-{1..5}.webp
    ├── gocphantu-cover.webp
    └── ...

         │
         ▼ upload Directus /files
         │
    Directus DB:
    ├── files: 8-12 records
    ├── books[mien-nam].cover_image_id  → file id
    ├── books[mien-nam].gallery (m2m)   → file ids
    ├── books[goc-phan-tu].cover_image_id
    ├── books[goc-phan-tu].gallery
    └── site_settings.author_image_id
```

## Related Code Files

### Create
- `scripts/classify-images.sh` — script orchestration (calls ai-multimodal + cwebp + curl upload)
- `scripts/upload-to-directus.sh` — bulk upload với curl multipart
- `plans/260502-2024-sachcuahuy-production-launch/image-classification.md` — manual classification log (anh confirm từng ảnh)

### Modify (Directus, runtime)
- Records in Directus `books` table — set `cover_image`, populate `gallery` (m2m)
- Record in `site_settings` — set `author_image`

### Modify (local repo, optional)
- `public/images/books/*.jpg` — keep Phase 1 fallback (or delete sau khi confirm Directus images stable)

## Implementation Steps

### 1. Pre-classification AI describe (anh review + confirm)

**1.1.** Activate `ai-multimodal` skill.

**1.2.** For each of 20 files in `/Users/pu/Downloads/sachcuahuy/`:
```
gemini-1.5-pro vision → describe content + suggest bucket
```
Output `image-classification.md`:
```
| File | AI Description | Suggested Bucket | Confirmed |
|---|---|---|---|
| gocphantu.jpg | Bìa sách "Góc Phần Tư – Nỗi buồn nuôi ta khôn lớn" với layout abstract... | gocphantu-cover | ✓ |
| z7770338768353_*.jpg | Ảnh tác giả ngồi với chú chó Mina trong sân vườn... | author OR miennam-gallery | ? |
| ... | ... | ... | ? |
```

**1.3.** Show table → anh confirm/override từng row → mark "Confirmed ✓"

**1.4.** Final assignment:
- 1 cover Góc Phần Tư
- 1 cover Miền Nam của Huy (pick best)
- 3-5 gallery Miền Nam của Huy
- 0-3 gallery Góc Phần Tư (likely fewer)
- 1 author photo
- Rest → `unused/` (don't upload, keep source)

### 2. Optimize images

**2.1.** Install tools (one-time):
```bash
brew install webp imagemagick
```

**2.2.** Create staging dir + convert:
```bash
mkdir -p /tmp/sachcuahuy-optimized
cd /Users/pu/Downloads/sachcuahuy

# Per assignment, e.g.:
cwebp -q 80 -resize 1600 0 gocphantu.jpg -o /tmp/sachcuahuy-optimized/gocphantu-cover.webp
cwebp -q 80 -resize 1600 0 z7770338768353_*.jpg -o /tmp/sachcuahuy-optimized/author-trong-huy.webp
# ... loop for selected files
```

**2.3.** Verify size reduction:
```bash
du -h /Users/pu/Downloads/sachcuahuy/*.jpg | tail -1   # original total
du -h /tmp/sachcuahuy-optimized/*.webp | tail -1       # optimized total
# Expect ~70-85% reduction
```

**2.4.** Visual sanity check: open each `.webp` (Preview.app) → confirm not artifacted.

### 3. Upload to Directus Files API

**3.1.** Get admin token (from Phase 1 `.env` or generate dedicated for upload):
```bash
TOKEN=$(curl -s -X POST https://<DIRECTUS_CMS_HOST>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pu.hungphu@gmail.com","password":"<pwd>"}' | jq -r .data.access_token)
```

**3.2.** Upload each file (returns file ID):
```bash
upload_file() {
  local path="$1" title="$2"
  curl -s -X POST https://<DIRECTUS_CMS_HOST>/files \
    -H "Authorization: Bearer $TOKEN" \
    -F "title=$title" \
    -F "file=@$path" | jq -r .data.id
}

MIENNAM_COVER_ID=$(upload_file /tmp/sachcuahuy-optimized/miennam-cover.webp "Bìa Miền Nam của Huy")
GOCPHANTU_COVER_ID=$(upload_file /tmp/sachcuahuy-optimized/gocphantu-cover.webp "Bìa Góc Phần Tư")
AUTHOR_ID=$(upload_file /tmp/sachcuahuy-optimized/author-trong-huy.webp "Tác giả Trọng Huy")
# ... gallery files similarly
```

Save IDs trong `image-classification.md` cho audit.

### 4. Link images to records

**4.1.** Update books cover (PATCH):
```bash
curl -X PATCH https://<DIRECTUS_CMS_HOST>/items/books/<miennam-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"cover_image\":\"$MIENNAM_COVER_ID\"}"
```

**4.2.** Link gallery (m2m relation, depends on Directus junction table):
```bash
# Directus auto-generates junction `books_files`
curl -X POST https://<DIRECTUS_CMS_HOST>/items/books_files \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"books_id\":\"<miennam-id>\",\"directus_files_id\":\"$GALLERY_1_ID\"}"
# Repeat per gallery image
```

Or simpler: do via Directus admin UI drag-drop (faster for 8-12 files).

**4.3.** Update site_settings author_image:
```bash
curl -X PATCH https://<DIRECTUS_CMS_HOST>/items/site_settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"author_image\":\"$AUTHOR_ID\"}"
```

### 5. Add alt text + folder organization

**5.1.** In Directus admin → Files → for each upload:
- Set `description` (alt text VI): e.g. "Bìa sách Miền Nam của Huy với chú chó Mina"
- Move to folder `sachcuahuy-launch` (create new folder for grouping)

**5.2.** Verify access từ public URL:
```bash
curl -I "https://<DIRECTUS_CMS_HOST>/assets/$MIENNAM_COVER_ID?width=800&format=webp"
# Expect 200 OK, Content-Type: image/webp
```

### 6. Frontend smoke test

**6.1.** Restart dev: `npm run dev`

**6.2.** Open `/`, `/sach`, `/sach/mien-nam-cua-huy`, `/sach/goc-phan-tu`:
- Cover hiển thị đúng (no broken img)
- Gallery thumbnails OK trên detail page
- Author photo trên `/gioi-thieu`

**6.3.** Lighthouse check (`/`): LCP image <200KB.

### 7. Cleanup
- Keep `/Users/pu/Downloads/sachcuahuy/` original (don't delete)
- Delete `/tmp/sachcuahuy-optimized/` after verify Directus stable
- Document final mapping trong `image-classification.md`

## Todo Checklist

- [ ] AI-classify 20 ảnh qua ai-multimodal skill (Gemini vision)
- [ ] Anh confirm classification table per row
- [ ] Install `webp` + `imagemagick` tools (if missing)
- [ ] Convert selected images → WebP @q80, max 1600px width
- [ ] Verify size reduction + visual quality
- [ ] Upload to Directus Files (cover, gallery, author)
- [ ] Link `books.cover_image` cho 2 sách
- [ ] Link `books.gallery` (m2m) cho 2 sách
- [ ] Link `site_settings.author_image`
- [ ] Add alt text VI cho mỗi file
- [ ] Move files into Directus folder `sachcuahuy-launch`
- [ ] Verify public asset URL accessible
- [ ] Frontend smoke test (no broken images)
- [ ] Document final mapping trong `image-classification.md`

## Success Criteria

- [ ] 2 sách có cover + ≥3 gallery images mỗi sách
- [ ] Author có 1 photo trong site_settings
- [ ] All images <300KB sau Directus transform `?width=800&format=webp`
- [ ] Frontend `/`, `/sach/[slug]`, `/gioi-thieu` render no broken images
- [ ] LCP image trên home <200KB transferred
- [ ] Alt text VI có cho tất cả uploads (a11y)
- [ ] Source folder `/Users/pu/Downloads/sachcuahuy/` intact (không bị xóa)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI miscategorize ảnh (gọi nhầm gallery thành author) | Medium | Low | Anh review confirm bước 1.3 trước upload |
| WebP quality artifact ở q80 | Low | Medium | Visual check 2.4; rerun với q90 nếu thấy degraded |
| Upload fail do Directus storage limit | Low | High | Total <5MB, Directus default ≥10GB; check `df -h` Contabo trước |
| Junction table m2m insert sai | Medium | Low | Use Directus admin UI drag-drop (Step 4.2 alternative) |
| Token expired khi upload bulk | Medium | Low | Use static service token thay vì login token (longer TTL) |
| Alt text quên VI → a11y fail | Medium | Low | Step 5.1 explicit; Lighthouse check Phase 5 |
| Original `gocphantu.jpg` không phải bìa thật → cần re-shoot | Low | High | Anh confirm bước 1.3; nếu cần ảnh better → block phase, request from Huy |

## Security

- **Upload only authenticated:** static admin token (server-side use only, không expose Vercel env)
- **No EXIF leak:** `cwebp` strips metadata by default (verify with `exiftool optimized.webp`)
- **File type validation:** Directus enforces MIME on upload
- **No PII in filenames:** use generic names (`miennam-cover.webp`, not `IMG_personal_xyz.jpg`)
- **Public asset URLs:** safe (read-only, no admin auth required for `/assets/*`)
- **Storage:** Directus Files local disk Contabo (encrypted at rest by VPS)

## Next Steps

After Phase 3 complete:
- → Phase 4: Wire Directus Flows (image-related events not relevant; orders flow là chính)
- → Phase 5: Lighthouse audit (image perf), SEO meta with og:image

## Unresolved Questions

- Ảnh tác giả có sẵn trong 20 file chưa? Nếu không → request anh chụp/cung cấp (delay Phase 3 hoặc accept placeholder).
- Cover Miền Nam của Huy hiện đã có trong `public/images/books/mien-nam-cua-huy.jpg` — keep as-is (re-upload qua Directus) hay dùng ảnh từ 20 file mới? Anh confirm.
- Có cần generate og:image variant 1200x630 cho social share? → Defer Phase 5 (auto via Directus transform).
- Watermark ảnh (chống copy)? → Defer post-launch nếu thấy issue.

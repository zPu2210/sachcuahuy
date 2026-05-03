---
phase: 3
date: 2026-05-03
type: cook (prep complete; upload deferred)
plan: plans/260502-2024-sachcuahuy-production-launch/phase-03-image-processing.md
classification: plans/260502-2024-sachcuahuy-production-launch/image-classification.md
---

# Phase 3 Cook Report — Image Prep (Upload Deferred)

## Status

🟡 **Prep complete, upload deferred.** Classification + WebP optimization + idempotent upload script all ready. Upload + linking blocked on admin token (anh prefers paste-on-demand vs storing in env).

When token arrives:
```bash
ADMIN_TOKEN="<paste>" bash /tmp/sachcuahuy-classify/upload-and-link.sh
# (or scripts/upload-images-to-directus.sh in repo)
```
Expected runtime: <30s end-to-end (3 uploads + 3 PATCH + folder + verify).

## What Was Done

### 1. AI classification of 20 source images (verified)

- Tool: `gemini-2.5-flash` vision via `gemini` CLI (not Python script — faster, no venv).
- Method: `xargs -P4` parallel, ~70s total wall-time for 20 images.
- Output: `/tmp/sachcuahuy-classify/raw-classifications.txt` (4288 bytes).
- Schema enforced via prompt: `DESC: …`, `TYPE: <enum>`, `CONFIDENCE: <enum>`.
- Result buckets:
  - `cover-mien-nam`: 1
  - `product-goc-phan-tu`: 1
  - `author-portrait`: 4
  - `product-mien-nam`: 14
- All 20 classified with confidence=high.

### 2. Visual confirmation (Read tool)

Loaded top candidates inline as images, confirmed AI's labels matched ground truth:
- Miền Nam cover (`z7770338796353`) — actual painted cover artwork with Trọng Huy + lettering.
- Góc Phần Tư cover (`gocphantu.jpg`) — book stack on bàn (wider context, car visible bg; only candidate).
- Author portraits 4 alternates compared. Anh picked `z7770348137829` (cream shirt biting books).

### 3. WebP optimization

```bash
cwebp -q 80 -resize 1600 0 -metadata none -m 6 <input>.jpg -o <output>.webp
```

| Original | Original Size | WebP Output | WebP Size | Reduction |
|---|---|---|---|---|
| `z7770338796353_*.jpg` | 144KB | `mien-nam-cua-huy-cover.webp` | 76KB | 47% |
| `gocphantu.jpg` | 168KB | `goc-phan-tu-cover.webp` | 132KB | 21% |
| `z7770348137829_*.jpg` | 100KB | `author-trong-huy.webp` | 80KB | 20% |
| **Total** | **412KB** | | **288KB** | **30%** |

Visual sanity-check: read each WebP via Read tool — no visible artifacts, sharp text, accurate colors. EXIF stripped via `-metadata none` (privacy).

After Directus transform (`?width=800&format=webp`) sizes will drop further; LCP cover well under 200KB target.

### 4. Reality check vs plan (v2.2 confirmed)

- ✅ `books.cover_image` exists (UUID, links to directus_files)
- ❌ `books.gallery` does NOT exist — confirmed via `GET /items/books?fields=*`
- ✅ `site_settings.author_image` exists

**Implication:** Phase 3 simplified from 8-12 uploads (gallery × 2 books + cover × 2 + author) to **3 uploads only** (2 covers + author). 14 product-mien-nam shots stay in source folder for future Phase 6 if schema bumps to add m2m gallery.

### 5. Upload script (idempotent, ready)

Path: `scripts/upload-images-to-directus.sh` (committed to repo) and `/tmp/sachcuahuy-classify/upload-and-link.sh` (local copy).

Flow:
1. Verify token via read book list
2. Find or create folder `sachcuahuy-launch` (idempotent)
3. POST 3 files (multipart, with title + alt-text description + folder)
4. PATCH `/items/books/1.cover_image`, `/items/books/2.cover_image`, `/items/site_settings.author_image`
5. HEAD-check public asset URL `/assets/{id}?width=800&format=webp` for 200 OK
6. Persist file IDs to `/tmp/sachcuahuy-classify/file-ids.txt`

All curl with `-sf` (fail on HTTP error) + `set -euo pipefail` → bash exits if any step fails (no silent half-state).

### 6. Auth probe (informational)

Tested existing `DIRECTUS_API_ORDERS_TOKEN`:
- `GET /items/books` → 200 OK ✅ (read-only on books)
- `GET /items/site_settings` → 200 OK ✅
- `POST /files` → 403 FORBIDDEN ✅ (correctly scoped to orders only)
- `PATCH /items/books/1` → 403 FORBIDDEN ✅

Confirms Phase 1 least-privilege role design is intact. Need separate admin token for files write + book updates.

### 7. Documentation

- `plans/260502-2024-sachcuahuy-production-launch/image-classification.md` — full mapping table, picks, alt text, alt candidates, deferred-gallery note
- `plans/260502-2024-sachcuahuy-production-launch/phase-03-image-processing.md` — status updated to in-progress; checklist ticked through prep; deferred items grouped
- `plans/260502-2024-sachcuahuy-production-launch/plan.md` — Phase 3 row marked 🟡 prep complete; upload+link deferred

## What Was NOT Done (Deferred)

| Task | Reason | Unblock |
|---|---|---|
| Upload 3 WebP to Directus Files | Admin token not available (anh login via GitHub OAuth, no email/pwd) | Anh paste static admin token from User Profile → Token field |
| Link 2 books `cover_image` | Same | Same |
| Link `site_settings.author_image` | Same | Same |
| Folder `sachcuahuy-launch` create | Same | Same |
| Frontend smoke test (visual covers on `/`, `/sach/[slug]`, `/gioi-thieu`) | No images uploaded yet | Run after upload + wait ISR 5min revalidate |
| Lighthouse LCP check | Same | Same |

## Frontend Wiring Status (no code change in Phase 3)

Phase 2 already wired:
- `lib/directus.ts` → `getDirectusImageUrl(file_id, opts)` builds `/assets/{id}?width=...&format=webp`
- `BookCard`, `BookDetail`, `AboutPage`, `Hero` components consume `cover_image` / `author_image` UUID fields
- `next.config.ts` `images.remotePatterns` includes `cms.sachcuahuy.com` (from `DIRECTUS_URL` env)
- ISR revalidate = 300s on book pages — covers will appear within 5 min after upload+link
- Author photo same path on `/gioi-thieu`

No frontend code changes needed for Phase 3. Upload + link is data-only.

## Files Changed (Phase 3 only — explicit stage list)

```
plans/260502-2024-sachcuahuy-production-launch/phase-03-image-processing.md  (status, checklist)
plans/260502-2024-sachcuahuy-production-launch/image-classification.md        (NEW)
plans/260502-2024-sachcuahuy-production-launch/plan.md                        (Phase 3 row)
plans/reports/cook-260503-1944-phase-03-image-prep.md                         (NEW — this file)
scripts/classify-image-with-gemini.sh                                          (NEW)
scripts/upload-images-to-directus.sh                                           (NEW)
```

Working tree has unrelated noise (deleted old plans from prior project). Will use explicit `git add <path>` not `git add .`.

## Verification

- ✅ 20 source images intact in `/Users/pu/Downloads/sachcuahuy/` (no deletes/renames)
- ✅ 3 WebP files in `/tmp/sachcuahuy-optimized/` (288KB total, all <200KB each)
- ✅ Upload script `set -euo pipefail` + `curl -sf` — fails fast, no silent half-state
- ✅ Script idempotent on folder (find or create)
- ✅ EXIF stripped (`cwebp -metadata none`) — no PII leak
- ⏳ Upload, linking, frontend smoke — pending token

## Risks Realized vs Mitigated

| Risk (from phase-03 plan) | Status |
|---|---|
| AI miscategorize images | ✅ Mitigated — anh visual review before pick |
| WebP quality artifact at q80 | ✅ Verified inline — no artifacts |
| Token expired during bulk upload | ✅ Avoided — script uses static token, not session login |
| `gocphantu.jpg` not real cover | ⚠️ Partial — has car bg; acceptable for MVP, can re-shoot post-launch if needed |
| No real author photo in 20 files | ✅ Resolved — 4 candidates found, anh picked best |
| Junction m2m table for gallery | ✅ N/A — `books.gallery` field doesn't exist (v2.2 confirmed) |

## Next Steps

1. Anh paste static admin token → run `scripts/upload-images-to-directus.sh ADMIN_TOKEN=…` → ~30s
2. Verify covers render on `/`, `/sach/mien-nam-cua-huy`, `/sach/goc-phan-tu`, `/gioi-thieu`
3. Wait 5min ISR revalidate (or hit `/api/revalidate` if added Phase 6)
4. Mark Phase 3 fully complete; move to Phase 4 (GoClaw + Zalo relay)
5. Anh revoke admin token after Phase 3 done

## Unresolved Questions

- Cover Góc Phần Tư hiện có car visible trong bg. Có cần re-shoot trước launch hay accept cho MVP? → Tentatively accept; defer to anh post-launch decision.
- Có cần generate `og:image` 1200×630 variant cho social share? → Defer Phase 5 (Directus transform on-the-fly).
- 14 unused product-mien-nam shots — store in Directus folder `unused/` cho future hay leave in source? → Leave in source (no Directus storage cost).

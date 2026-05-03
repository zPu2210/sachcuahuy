#!/bin/bash
# Phase 3: upload 3 WebP files to Directus, link to books + site_settings
# Usage: ADMIN_TOKEN=<token> ./upload-and-link.sh
set -euo pipefail

: "${ADMIN_TOKEN:?ADMIN_TOKEN env var required}"
BASE="https://cms.sachcuahuy.com"
OUT="/tmp/sachcuahuy-classify"
OPT="/tmp/sachcuahuy-optimized"

# 1. Sanity: confirm token works as admin
echo "==> Verify admin token (read books)"
curl -sf -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/items/books?fields=id,slug,cover_image" | jq .

# 2. (Optional) Create folder for grouping
echo "==> Create/find folder 'sachcuahuy-launch'"
FOLDER_ID=$(curl -sf -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE/folders?filter[name][_eq]=sachcuahuy-launch&fields=id" | jq -r '.data[0].id // empty')
if [ -z "$FOLDER_ID" ]; then
  FOLDER_ID=$(curl -sf -X POST "$BASE/folders" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"sachcuahuy-launch"}' | jq -r '.data.id')
  echo "   created folder: $FOLDER_ID"
else
  echo "   reusing folder: $FOLDER_ID"
fi

upload() {
  local path="$1" title="$2" desc="$3"
  local id
  id=$(curl -sf -X POST "$BASE/files" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -F "title=$title" \
    -F "description=$desc" \
    -F "folder=$FOLDER_ID" \
    -F "file=@$path" | jq -r '.data.id')
  echo "$id"
}

echo "==> Upload Mien Nam cover"
MIENNAM_ID=$(upload "$OPT/mien-nam-cua-huy-cover.webp" \
  "Bìa Miền Nam của Huy" \
  "Bìa sách Miền Nam của Huy với chân dung tác giả Trọng Huy trên nền xanh indigo")
echo "   file id: $MIENNAM_ID"

echo "==> Upload Goc Phan Tu cover"
GOCPHANTU_ID=$(upload "$OPT/goc-phan-tu-cover.webp" \
  "Bìa Góc Phần Tư" \
  "Bìa sách Góc Phần Tư - Nỗi buồn nuôi ta khôn lớn của tác giả Trọng Huy")
echo "   file id: $GOCPHANTU_ID"

echo "==> Upload author portrait"
AUTHOR_ID=$(upload "$OPT/author-trong-huy.webp" \
  "Tác giả Trọng Huy" \
  "Chân dung tác giả Trọng Huy với chồng sách - phong cách hài hước, gần gũi")
echo "   file id: $AUTHOR_ID"

echo "==> Link Mien Nam cover_image"
curl -sf -X PATCH "$BASE/items/books/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"cover_image\":\"$MIENNAM_ID\"}" | jq '{id:.data.id,cover_image:.data.cover_image,slug:.data.slug}'

echo "==> Link Goc Phan Tu cover_image"
curl -sf -X PATCH "$BASE/items/books/2" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"cover_image\":\"$GOCPHANTU_ID\"}" | jq '{id:.data.id,cover_image:.data.cover_image,slug:.data.slug}'

echo "==> Link site_settings.author_image"
curl -sf -X PATCH "$BASE/items/site_settings" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"author_image\":\"$AUTHOR_ID\"}" | jq '{id:.data.id,author_image:.data.author_image}'

echo "==> Verify public asset access"
for id in "$MIENNAM_ID" "$GOCPHANTU_ID" "$AUTHOR_ID"; do
  echo "   $id:"
  curl -sI "$BASE/assets/$id?width=800&format=webp" | grep -E "HTTP|Content-Type|Content-Length"
done

echo "==> Save IDs to mapping doc"
cat > "$OUT/file-ids.txt" <<EOF
MIENNAM_COVER=$MIENNAM_ID
GOCPHANTU_COVER=$GOCPHANTU_ID
AUTHOR_PORTRAIT=$AUTHOR_ID
FOLDER=$FOLDER_ID
EOF
cat "$OUT/file-ids.txt"

echo ""
echo "DONE. File IDs saved to $OUT/file-ids.txt"

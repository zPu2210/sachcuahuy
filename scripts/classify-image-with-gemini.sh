#!/bin/bash
# Classify a single image with gemini
# Usage: ./classify-one.sh <filename>
set -e
SRC="/Users/pu/Downloads/sachcuahuy"
OUT="/tmp/sachcuahuy-classify"
f="$1"
mkdir -p "$OUT"
cd "$SRC"

prompt='Bạn là người phân loại ảnh cho website bán sách của tác giả Trọng Huy.

Ngữ cảnh: Trọng Huy là tác giả 2 cuốn sách "Miền Nam của Huy" và "Góc Phần Tư". Anh có nuôi chó tên Mina. Ảnh có thể là: bìa sách, ảnh tác giả (chân dung/đời thường), ảnh chú chó Mina, ảnh sản phẩm sách (chụp sách trên bàn/cảnh đời thường), ảnh khác.

Trả lời CHÍNH XÁC theo format sau (không thêm markdown):
DESC: <mô tả 1 câu tiếng Việt <30 chữ về nội dung ảnh>
TYPE: <chọn 1 trong: cover-mien-nam | cover-goc-phan-tu | author-portrait | product-mien-nam | product-goc-phan-tu | dog-mina | other>
CONFIDENCE: <high|medium|low>'

result=$(echo "$prompt" | gemini -y -m gemini-2.5-flash -p "@$f" 2>&1 | grep -E '^(DESC|TYPE|CONFIDENCE):' | head -3)
echo "FILE: $f"
echo "$result"
echo "---"

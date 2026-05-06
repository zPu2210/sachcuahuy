---
type: audit-findings
agent: main (em, Phase 1)
date: 2026-05-07 00:25 (Asia/Saigon)
sources:
  - https://nhanam.vn (Nhã Nam — high-volume Vietnamese literary publisher)
scope: Competitor UX patterns, lightweight skim, ~10 min
---

# Competitor Skim — sachcuahuy.com vs Vietnamese Literary Sites

## Method

Lightweight WebFetch skim, ~10 min. Goal: identify 5-10 UX patterns đáng học cho sachcuahuy. KHÔNG deep audit.

## Site 1: Nhã Nam (nhanam.vn)

**Profile:** Major Vietnamese literary publisher, ~2,700 SKUs, multi-genre.

### Patterns đáng học

1. **Hero CTA prominent + book cover bay vào** — bigger banner imagery với clear "Mua ngay" button. sachcuahuy hero hiện có Cormorant heading nhưng book cover side bị plain navy block (placeholder?), CTA "Đặt Hàng Ngay" OK nhưng visual weight yếu hơn.

2. **Discount visualization rõ ràng** — `-25%`, original price strikethrough, discounted price bold đỏ. Vietnamese consumers respond mạnh tới transparent savings. sachcuahuy chưa có discount mechanic — worth considering cho ra mắt + pre-order.

3. **Social proof via numbered ranking** — "Top 10 sách bán chạy", "Sách được yêu thích". Tận dụng popularity signals. sachcuahuy chỉ có 2 SKUs nên không applicable, nhưng "Tác giả cuốn sách" voice có thể leverage.

4. **Multi-tier category nav** — Hư cấu / Phi hư cấu × subcategories. sachcuahuy 2 sách → flat nav OK, nhưng cần future-proof khi có thêm SKUs/voice products.

5. **Persistent top utility** — phone, cart counter, login fixed. sachcuahuy header đã có cart-like icon nhưng không có phone — Vietnamese ecommerce lề hỏi nhiều, hotline visible builds trust.

6. **Cultural hub positioning** — "Tin Nhã Nam", "Tọa đàm" sections — bookstore = cultural hub, không chỉ retailer. sachcuahuy có /podcast (đang Coming Soon) nhưng /gioi-thieu chưa exploit Trọng Huy voice talent angle đủ mạnh.

7. **Multi-channel social footer** — Zalo + TikTok + Instagram + YouTube direct. sachcuahuy footer chưa thấy social links — Vietnamese audiences expect integrated social commerce.

## Site 2: Tiki Sách (skipped, dùng Nhã Nam thay thế)

Tiki = ecommerce general → patterns chỉ marketplace UX. Không relevant cho author-led literary site như sachcuahuy. Nhã Nam 1-source đủ depth.

## Top 5 Patterns Recommended cho Magical Overhaul

| # | Pattern | Phase 1+ relevance | Effort |
|---|---|---|---|
| 1 | Hero book cover treatment (replace plain navy block với watercolor scene + cover) | Phase 1 home | M |
| 2 | Author-as-cultural-hub framing (/gioi-thieu, /podcast cross-link) | Phase 3 | S |
| 3 | Hotline/contact visible header (trust signal) | Phase 1 home + global header | S |
| 4 | Social channels footer (Zalo, TikTok, IG) | Phase 1 home + global footer | S |
| 5 | Pre-order discount badge cho "Miền Nam Của Huy" (mới ra) | Phase 1 home + Phase 2 detail | M (need Directus field) |

## Anti-patterns Tránh

- Nhã Nam dùng heavy red/orange discount banners → KHÔNG match magical/poetic vibe của sachcuahuy. Discount nếu apply nên dùng ink/cobalt accent thay vì commerce-red.
- Nhã Nam 15+ category levels → over-engineered cho 2 SKUs. KHÔNG copy.

## Unresolved

- Tiki sách section skipped — nếu cần marketplace patterns sau (cart abandonment, recommended items), worth deep-skim Phase 4.
- Discount mechanic implementation = scope creep. Document only, không add Phase 1.

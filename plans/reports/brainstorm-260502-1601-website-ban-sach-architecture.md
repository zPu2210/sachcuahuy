---
type: brainstorm
date: 2026-05-02 16:01
slug: website-ban-sach-architecture
project: sachcuahuy
status: approved
---

# Brainstorm: Website Sách Của Huy — Production Launch Architecture

## Problem Statement

Website Next.js bán sách hiện tại (`sachcuahuy`) ở MVP state với:
- Hardcoded data trong `src/lib/data.ts` (3 sách, 1 thật + 2 placeholder)
- Order form **fake** — chỉ simulate, không lưu DB, không gửi email/notify
- Bank info hardcoded sai (VPBank 123456789 — placeholder)
- Không CMS, không admin panel, không tracking đơn

**Mục tiêu user:**
1. Hoàn thiện + launch ASAP
2. Real bank transfer + COD payment (VCB 0181003488345 - Nguyễn Trọng Huy)
3. Add sách mới "Góc Phần Tư" 99k
4. Phân loại 20 ảnh từ `/Users/pu/Downloads/sachcuahuy` cho 2 sách
5. Podcast section placeholder (build feature ở phase 2)
6. CMS cho non-tech admin (anh + Huy)
7. Free / open-source preferred
8. Tích hợp với GoClaw + Meow agent đã có sẵn trên Contabo VPS

## Evaluated Approaches

### A. Light (Git-based, no DB)
- TinaCMS + Markdown + Resend email + Google Sheet
- Stack đơn giản, ship 1-2 ngày, $0/mo
- **Loại** vì user đã chốt Neon/DB và có plan podcast

### B. Medium (Headless CMS + DB) ✅ CHỌN
- Directus 11 + Postgres trên Contabo + Next.js Vercel
- Tận dụng VPS Contabo đã có (chung GoClaw)
- API REST/GraphQL cho GoClaw query
- Admin UI mature cho non-tech (Huy)
- Ship 5-7 ngày

### C. Heavy (Payload all-in-one)
- Payload CMS 3 trong Next.js + Postgres
- 1 codebase, type-safe
- **Loại** vì khó host trên Vercel free khi tách Postgres + cần tự code GoClaw hooks

## Final Solution: Medium Architecture

### Tech Stack

| Layer | Tech | Cost |
|---|---|---|
| Frontend hosting | Vercel free | $0 |
| Frontend framework | Next.js 15 (giữ nguyên) | $0 |
| Backend CMS | Directus 11 (Docker) | $0 |
| Database | Postgres 16 (Docker, share network với GoClaw) | $0 |
| Backend hosting | Contabo VPS (đã có) | $0 (đã trả) |
| QR thanh toán | VietQR.io image API | $0 |
| Notifications | GoClaw + Zalo Personal channel (đã có) | $0 |
| AI agent | Meow (shared, multi-tenant qua user_id) | $0 |
| Domain | sachcuahuy.vercel.app (mua domain sau) | $0 |

**Total: $0/mo** (chưa count Contabo đã trả).

### Architecture Diagram

```
┌──────────────────────────┐         ┌─────────────────────────────┐
│   VERCEL (Edge - free)   │         │    CONTABO VPS (đã có)     │
│                          │         │   185.111.159.28 (SG)      │
│  ┌────────────────────┐  │         │                             │
│  │  Next.js 15 SSR    │  │  HTTPS  │   ┌──────────────────────┐  │
│  │  - Frontend ISR    │◄─┼─────────┼──►│  Directus 11         │  │
│  │  - Order form API  │  │  REST   │   │  (cms.sachcuahuy)    │  │
│  │  - VietQR generate │  │         │   └────────┬─────────────┘  │
│  └────────────────────┘  │         │            │                │
│                          │         │            ▼                │
└──────────────────────────┘         │   ┌──────────────────────┐  │
                                     │   │  Postgres 16         │  │
                                     │   │  + DB sachcuahuy     │  │
                                     │   └──────────────────────┘  │
                                     │                             │
                                     │   ┌──────────────────────┐  │
                                     │   │  GoClaw + Meow       │  │
                                     │   │  user_id=sachcuahuy  │  │
                                     │   │  Zalo Personal noti  │  │
                                     │   └──────────────────────┘  │
                                     │            ▲                │
                                     │            │ Directus Flow  │
                                     │            │ (order webhook)│
                                     └─────────────────────────────┘
```

### Data Flow

**1. Khách đặt hàng:**
```
Form → Vercel API → POST Directus /items/orders
→ Directus Flow "new_order" trigger
→ POST webhook GoClaw /v1/agents/meow/messages
   với header X-GoClaw-User-Id: sachcuahuy
→ Meow agent → push Zalo cho anh:
   "📦 Đơn mới #SCH-2605021601: Nguyễn Văn A - Miền Nam của Huy x1 - 179k - 091..."
```

**2. Anh confirm payment:**
```
Login Directus admin → Orders → filter "pending"
→ Cross-check VCB app → click "Mark as Paid"
→ Directus Flow → Meow → Zalo cho khách qua bot:
   "✅ Đã nhận thanh toán đơn #SCH-..., cảm ơn anh/chị!"
```

**3. Auto post sách mới (future):**
```
Anh thêm sách trong Directus → status=published
→ Flow → Meow agent → tạo bài (Gemini) → đăng Zalo channel
```

**4. Tracking đơn (anh chat Meow):**
```
Anh: "Hôm nay có mấy đơn?"
→ Meow MCP tool query Directus
→ "Hôm nay 5 đơn: 3 paid (3.5tr), 2 pending (490k)"
```

### Database Schema (Directus Collections)

- `books` — slug, title, author, description, price, cover, gallery, isbn, publisher, status
- `orders` — order_code, customer info, items JSON, totals, payment_method, payment_status, order_status, timestamps
- `customers` — auto-created từ orders, dedup theo phone, total_orders/total_spent
- `site_settings` — singleton: bank info, shipping fees, hero text, author bio
- `pages` — CMS-driven static pages (gioi-thieu, lien-he)
- `podcast_episodes` — schema sẵn cho phase 2 (chưa expose UI)

### Multi-tenant Strategy (GoClaw)

- Shared GoClaw instance, không tạo container mới
- Tạo `user_id = "sachcuahuy"` trong GoClaw
- Tất cả webhook + chat từ project này dùng header `X-GoClaw-User-Id: sachcuahuy`
- Meow agent share, nhưng conversation/context tách biệt theo user_id
- Tiết kiệm RAM Contabo (~512MB)

### Admin Access

- Anh: super admin (full access Directus)
- Huy: editor role (sửa content + xem orders, không sửa settings)

## Implementation Phases (preview)

| Phase | Task | Time |
|---|---|---|
| **Phase 0** (tách task riêng) | Update GoClaw + fetch llms-full.txt + research changes | 2-3h |
| Phase 1 | Setup Directus + Postgres trên Contabo, tạo collections, sample data, admin users | 2 ngày |
| Phase 2 | Frontend integration: Directus SDK, ISR, real OrderForm, VietQR, bank info update, thêm "Góc Phần Tư" | 1.5 ngày |
| Phase 3 | Phân loại + optimize 20 ảnh (dùng ai-multimodal), upload lên Directus Files | 0.5 ngày |
| Phase 4 | GoClaw integration: Directus Flows, Meow MCP tools, Zalo webhook, end-to-end test | 1.5 ngày |
| Phase 5 | Podcast placeholder page, polish UI/UX, SEO meta, mobile responsive, accessibility | 0.5 ngày |

**Total Plan chính: ~6 ngày work** (pessimistic, có buffer).

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Contabo VPS down → admin không vào được | High | Backup script daily (`/opt/goclaw/backup.sh` đã có) → restore nhanh; Vercel frontend cache static → khách vẫn xem được |
| Directus webhook fail → anh miss order | High | Directus Flows có retry; backup: cron 5p check pending orders → re-notify; secondary email noti (Resend) |
| Vercel free tier limits (100GB bandwidth/mo) | Low | Monitor; nếu vượt → migrate frontend sang Contabo (Caddy reverse proxy) |
| GoClaw update break Meow | Medium | Phase 0 tách task riêng để safe-test trước; rollback plan: docker compose snapshot trước update |
| Admin (Huy) không quen Directus UI | Medium | Tạo screencast tutorial sau Phase 1; setup field hints + helper text trong collections |
| 1 sách hết hàng nhưng khách vẫn đặt | Medium | Trigger stock decrement ở Directus Flow; UI block button khi stock=0 |
| QR VietQR API down | Low | Fallback: hiển thị text bank info; cache QR static cho amount phổ biến |

## Security Considerations

- Directus admin: 2FA bắt buộc (built-in)
- API permissions: anonymous chỉ đọc `books`, `pages`, `site_settings` (public); orders chỉ create + read own (theo phone hash)
- Contabo SSH: key auth only (đã setup), no password
- Vercel env vars: `DIRECTUS_URL`, `DIRECTUS_TOKEN` (read-only public token), `DIRECTUS_ADMIN_TOKEN` (server-only)
- Webhook signature: Directus → GoClaw dùng HMAC để verify origin
- Customer data: phone/address chỉ admin xem được, không expose API public

## Success Metrics

| Metric | Target | How to measure |
|---|---|---|
| Time to first real order | <7 ngày sau approve | First record trong `orders` table |
| Admin onboarding (Huy edit content) | <30 phút without help | Time anh demo tới Huy thực hiện được task đầu tiên |
| Order notification latency | <5s từ form submit → Zalo | Directus Flow logs + Zalo timestamp |
| Mobile Lighthouse score | >90 (performance, accessibility, SEO) | Lighthouse CI |
| Page load time (homepage) | <1.5s LCP từ VN 4G | Vercel Analytics + WebVitals |
| Order completion rate | >40% form starts → submit | Vercel Analytics events |

## Validation Criteria (Definition of Done)

- [ ] Anh hoàn thành 1 đơn test end-to-end: form → DB → Zalo noti → mark paid → khách nhận confirm
- [ ] Huy edit 1 sách (text + ảnh) qua Directus mà không cần anh hướng dẫn
- [ ] 2 sách (Miền Nam của Huy + Góc Phần Tư) hiển thị đúng trên home + /sach + /sach/[slug]
- [ ] Bank info đúng: VCB 0181003488345 - Nguyễn Trọng Huy - VCB Nam Sài Gòn
- [ ] QR VietQR generate chính xác với amount + memo "Tên - SDT - sách"
- [ ] Podcast page placeholder render OK với CTA "Sắp ra mắt"
- [ ] Mobile UX (375px-414px) không bị overflow/break layout
- [ ] Lighthouse mobile >85
- [ ] Vercel preview deploy thành công không lỗi build

## Next Steps & Dependencies

1. **NOW**: User approve brainstorm này → em invoke `/ck:plan` cho Plan chính (Phase 1-5)
2. **Parallel task riêng**: Update GoClaw + fetch docs (Phase 0) — em sẽ làm sau khi anh confirm thời điểm
3. **User input cần thiết** trong implementation phase:
   - Phân loại từng ảnh trong `/Users/pu/Downloads/sachcuahuy` (em show từng ảnh + đoán → anh confirm)
   - Mô tả chi tiết "Góc Phần Tư" (current data trống)
   - Bio + ảnh tác giả Trọng Huy chi tiết hơn (current placeholder)
   - Domain quyết định mua khi nào (sachcuahuy.com / honeyhuy.com / sach.tronghuy.com?)

## Resolved Answers (2026-05-02 PM session)

| Q | Resolution |
|---|---|
| Q2 — Góc Phần Tư mô tả | **Anh cấp manuscript:** "Bạn chắc đã nghe đến góc phần tư cái bánh, góc phần tư căn nhà vậy đã bao giờ bạn nghĩ đến góc phần tư cuộc đời? *Góc Phần Tư – Nỗi buồn nuôi ta khôn lớn* — Cuốn sách cho tôi liên tưởng và bất giác nghĩ rằng: 'góc phần tư đó cũng giống như một phần của bức tranh, muốn vẽ gì lên đó là quyền của mỗi người. Đó là góc phần tư đầu tiên của cuộc đời, là những tháng năm của tuổi trẻ, là những ước mơ, hoài bão, tình yêu, cố gắng theo đuổi, là sự mơ hồ, chênh vênh, là những thứ không định nghĩa được. Dù mỗi chúng ta có một cuộc sống riêng nhưng tuổi trẻ của tất cả vẫn sẽ có cái khung chung, ở đó là những vị ngọt bùi, cay đắng mà chỉ tuổi trẻ mới nếm được, là sự bắt đầu của nhiều thứ.'" — dùng làm full description, trích đoạn ngắn cho card. |
| Q3 — Shipping fee | **Free ship tại HN + HCM**, các tỉnh khác giữ 25k flat (cập nhật từ "free >300k" cũ). |
| Q5 — Stock auto-decrement | **Không** — anh manual update stock trong Directus. Chỉ cần show "Còn hàng" / "Hết hàng" badge UI. |
| Q7 — Customer accounts | **Đúng — guest checkout only ở Phase 1.** Không build login/account history. |

## Still Open (defer)

- **Q1** Zalo Personal pairing — confirm số chính hay throwaway (kiểm tra Phase 4 trước khi wire webhook).
- **Q4** COD vs Bank ratio — không quan trọng ở MVP, đánh giá sau khi có data thực.
- **Q6** Refund flow — Phase 2+ (chỉ cần status change cho MVP).
- **Q8** Email backup noti — Phase 2+ (Zalo only ở MVP, monitor failure rate).

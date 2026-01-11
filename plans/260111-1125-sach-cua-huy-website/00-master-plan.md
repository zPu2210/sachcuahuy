# Master Plan: Website Sách Của Huy

**Project:** sachcuahuy
**Author:** Trọng Huy
**Created:** 2026-01-11
**Status:** Planning

---

## Part 1: Business Plan

### 1.1 Tài Sản Hiện Có

| Asset | Details |
|-------|---------|
| **Sách xuất bản** | 2+ đầu sách |
| **Sách mới** | "Miền Nam của Huy" |
| **Inventory** | 1,000 cuốn (đã in) |
| **Chi phí in** | 40-50K/cuốn |
| **Giá bán** | 179K/cuốn |
| **NXB** | Dân Trí & Thế Giới |
| **Brand Assets** | Bìa sách đẹp, illustration style độc đáo |

### 1.2 Phân Tích Tài Chính

```
┌─────────────────────────────────────────────────────────┐
│                    UNIT ECONOMICS                        │
├─────────────────────────────────────────────────────────┤
│  Giá bán:                           179,000 VND         │
│  Chi phí in:                        -50,000 VND         │
│  Chi phí ship (seller bears):       -25,000 VND (avg)   │
│  Chi phí đóng gói:                   -5,000 VND         │
│  Payment fee (Sepay ~0%):                 -0 VND        │
│  ─────────────────────────────────────────────────────  │
│  GROSS PROFIT/CUỐN:                  99,000 VND (55%)   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  REVENUE PROJECTION                      │
├─────────────────────────────────────────────────────────┤
│  Inventory:            1,000 cuốn                       │
│  Revenue potential:    179,000,000 VND (~$7,160)        │
│  Gross profit:         99,000,000 VND (~$3,960)         │
│  Break-even monthly:   ~20 cuốn (cover hosting/domain)  │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Chi Phí Vận Hành

| Item | Monthly Cost | Notes |
|------|--------------|-------|
| **Hosting (Vercel)** | 0 VND | Free tier |
| **Database (Supabase)** | 0 VND | Free tier |
| **Domain** | ~25K VND | ~300K/năm |
| **Sepay** | 0 VND | 500 transactions FREE/month |
| **Total Fixed** | **~25K VND/tháng** | Gần như FREE! |

### 1.4 Sepay Integration Benefits

```
┌─────────────────────────────────────────────────────────┐
│                    SEPAY CAPABILITIES                    │
├─────────────────────────────────────────────────────────┤
│  ✅ QR Code Payment - Khách scan để chuyển khoản        │
│  ✅ Webhook Real-time - Auto confirm đơn khi nhận tiền  │
│  ✅ 500 FREE transactions/month (VPBank)                │
│  ✅ Virtual Account - Mỗi đơn có số TK riêng            │
│  ✅ Bank Support - 30+ ngân hàng VN                     │
│  ✅ Telegram/App notification                            │
│  ✅ API Documentation tại developer.sepay.vn            │
└─────────────────────────────────────────────────────────┘
```

**Workflow với Sepay:**
```
Khách đặt hàng → Hệ thống tạo QR code (Sepay)
                        ↓
Khách scan QR → Chuyển khoản đúng số tiền
                        ↓
Sepay detect (10s) → Webhook gửi về server
                        ↓
Server auto update order status = "Đã thanh toán"
                        ↓
Anh nhận notification → Đóng gói & ship
```

### 1.5 Payment Options Strategy

| Method | Phase 1 | Phase 2 | Notes |
|--------|---------|---------|-------|
| **COD** | ✅ | ✅ | Luôn cần, trust factor cao |
| **Chuyển khoản manual** | ✅ | ❌ | Thay bằng Sepay |
| **Sepay QR** | ❌ | ✅ | Auto-confirm |
| **MoMo/ZaloPay** | ❌ | Optional | Nếu demand cao |

### 1.6 Go-To-Market Strategy

**Phase 1: Soft Launch (Week 1-2)**
- Launch website với form đặt hàng
- Test với friends & family
- Thu thập feedback

**Phase 2: Marketing Push (Week 3-4)**
- Facebook Ads targeting độc giả văn học
- Collab với book reviewers
- Post về quá trình viết sách

**Phase 3: Scale (Month 2+)**
- SEO content (blog về writing, sách)
- TikTok nếu có bandwidth
- Email marketing cho returning customers

---

## Part 2: Implementation Plan

### 2.1 Tech Stack Final

```
┌─────────────────────────────────────────────────────────┐
│                      TECH STACK                          │
├─────────────────────────────────────────────────────────┤
│  Frontend     │ Next.js 14 (App Router) + TypeScript    │
│  Styling      │ Tailwind CSS + shadcn/ui                │
│  Database     │ Supabase (PostgreSQL)                   │
│  Auth         │ Supabase Auth (Phase 2)                 │
│  Storage      │ Supabase Storage (images)               │
│  Payment      │ Sepay.vn (Phase 2)                      │
│  Forms        │ Tally.so hoặc native form               │
│  CMS/Blog     │ MDX (markdown trong repo)               │
│  Hosting      │ Vercel                                  │
│  Analytics    │ Vercel Analytics (free)                 │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Database Schema (Supabase)

```sql
-- Products (Sách)
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT DEFAULT 'Trọng Huy',
  description TEXT,
  price INTEGER NOT NULL, -- VND
  compare_price INTEGER, -- Giá gốc (nếu giảm giá)
  stock INTEGER DEFAULT 0,
  cover_image TEXT,
  images TEXT[], -- Gallery
  isbn TEXT,
  publisher TEXT,
  published_date DATE,
  page_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- SCH-20260111-001
  status TEXT DEFAULT 'pending', -- pending, paid, shipping, delivered, cancelled

  -- Customer info
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT,
  shipping_note TEXT,

  -- Payment
  payment_method TEXT DEFAULT 'cod', -- cod, bank_transfer, sepay
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid
  sepay_transaction_id TEXT,

  -- Amounts
  subtotal INTEGER NOT NULL,
  shipping_fee INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- Price at time of order
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts (optional, có thể dùng MDX thay)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Project Structure

```
sachcuahuy/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── sach/
│   │   ├── page.tsx              # Book listing
│   │   └── [slug]/
│   │       └── page.tsx          # Book detail
│   ├── dat-hang/
│   │   └── page.tsx              # Checkout/Order form
│   ├── xac-nhan/
│   │   └── page.tsx              # Order confirmation
│   ├── blog/
│   │   ├── page.tsx              # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx          # Blog post
│   ├── gioi-thieu/
│   │   └── page.tsx              # About author
│   └── api/
│       ├── orders/
│       │   └── route.ts          # Create order API
│       └── webhooks/
│           └── sepay/
│               └── route.ts      # Sepay webhook
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   ├── home/
│   │   ├── hero-section.tsx
│   │   ├── featured-books.tsx
│   │   └── author-intro.tsx
│   ├── book/
│   │   ├── book-card.tsx
│   │   ├── book-detail.tsx
│   │   └── book-gallery.tsx
│   └── checkout/
│       ├── order-form.tsx
│       ├── cart-summary.tsx
│       └── payment-options.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── sepay/
│   │   └── client.ts
│   └── utils.ts
├── content/                      # MDX blog posts
│   └── posts/
│       └── *.mdx
├── public/
│   ├── images/
│   │   ├── books/
│   │   └── author/
│   └── fonts/
├── styles/
│   └── globals.css
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

### 2.4 Phase Breakdown

#### Phase 1: Foundation (Days 1-5)

| Task | Priority | Est. |
|------|----------|------|
| Setup Next.js project | P0 | 1h |
| Configure Tailwind + shadcn/ui | P0 | 1h |
| Setup Supabase project | P0 | 1h |
| Create database schema | P0 | 2h |
| Design system (colors, fonts, components) | P0 | 3h |
| Build Header + Footer | P0 | 2h |
| Build Homepage | P0 | 4h |
| Build Book Detail page | P0 | 3h |
| Build Order Form (basic) | P0 | 4h |
| Deploy to Vercel | P0 | 1h |

**Phase 1 Deliverable:** Website live với form đặt hàng, manual order processing

#### Phase 2: E-commerce Core (Days 6-10)

| Task | Priority | Est. |
|------|----------|------|
| Shopping cart (localStorage) | P1 | 3h |
| Order API + database | P1 | 3h |
| Order confirmation page | P1 | 2h |
| Admin: view orders (simple) | P1 | 4h |
| Sepay integration | P1 | 4h |
| Payment QR generation | P1 | 2h |
| Webhook handler | P1 | 3h |
| Email notifications (optional) | P2 | 3h |

**Phase 2 Deliverable:** Full checkout flow với Sepay QR payment

#### Phase 3: Content & SEO (Days 11-14)

| Task | Priority | Est. |
|------|----------|------|
| About Author page | P1 | 2h |
| Blog system (MDX) | P1 | 3h |
| SEO meta tags | P1 | 2h |
| Sitemap generation | P1 | 1h |
| Open Graph images | P2 | 2h |
| Analytics setup | P2 | 1h |

**Phase 3 Deliverable:** SEO-ready website với blog

### 2.5 API Endpoints

```
POST   /api/orders           - Tạo đơn hàng mới
GET    /api/orders/[id]      - Xem chi tiết đơn hàng
POST   /api/webhooks/sepay   - Nhận webhook từ Sepay

# Admin (Phase 2)
GET    /api/admin/orders     - List all orders
PATCH  /api/admin/orders/[id] - Update order status
```

### 2.6 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sepay (Phase 2)
SEPAY_API_KEY=
SEPAY_MERCHANT_ID=
SEPAY_WEBHOOK_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=https://sachcuahuy.com
NEXT_PUBLIC_SITE_NAME=Sách Của Huy

# Optional
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

## Part 3: UI/UX Design Brief

### 3.1 Design Direction

**Extracted from Book Cover:**
```
Primary Color:    #1E2B4D (Deep Navy Blue)
Secondary:        #FFFFFF (White)
Accent:           #D4A574 (Warm Gold/Brown)
Background:       #F8F6F3 (Warm Off-White)

Typography:
- Headings: Serif font (elegance, literary feel)
- Body: Sans-serif (readability)
- Accent: Handwritten/Script (personality, matching book style)

Style Keywords:
- Minimalist
- Artistic
- Nostalgic
- Personal
- Literary
- Hand-drawn elements
```

### 3.2 Key Pages to Design

1. **Homepage**
   - Hero with book showcase
   - Author introduction
   - Featured books
   - CTA to order

2. **Book Detail**
   - Large book images (gallery)
   - Book info (price, description, specs)
   - Add to cart / Order now
   - Related books

3. **Checkout**
   - Order summary
   - Customer form
   - Payment options (COD/QR)
   - Confirmation

4. **About Author**
   - Author photo & bio
   - Writing journey
   - Social links

### 3.3 Design Requirements

- Mobile-first responsive
- Vietnamese text optimized
- Fast loading (images optimized)
- Accessible (WCAG 2.1 AA)
- Consistent with book's artistic style

---

## Part 4: Success Metrics

### 4.1 Launch Metrics (Month 1)

| Metric | Target |
|--------|--------|
| Website uptime | 99.9% |
| Page load speed | < 3s |
| Orders received | 50+ |
| Conversion rate | 2-3% |

### 4.2 Growth Metrics (Month 2-3)

| Metric | Target |
|--------|--------|
| Monthly orders | 100+ |
| Returning customers | 10% |
| Average order value | 200K+ |
| SEO traffic | 500+ visits/month |

---

## Part 5: Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low traffic | High | Invest in marketing, SEO |
| Shipping damage | Medium | Quality packaging, insurance |
| Payment issues | Medium | Always offer COD as backup |
| Tech issues | Low | Vercel reliability, Supabase backup |

---

## Appendix: File References

- Research report: `plans/reports/brainstorm-260111-website-ban-sach-trong-huy.md`
- UI/UX designs: `plans/260111-1125-sach-cua-huy-website/designs/`
- Implementation code: Project root

---

*Plan created by ClaudeKit | Ready for review*

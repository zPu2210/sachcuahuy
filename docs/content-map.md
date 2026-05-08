# Content Map — Sách Của Huy

Last updated: 2026-05-08

This document maps every website page to its CMS source fields. Use this as the spec for the Directus Page Editor module.

---

## Page Summary

| Page | Route | Primary CMS Source |
|------|-------|-------------------|
| Trang Chủ | `/` | `site_settings` + `books` |
| Giới Thiệu | `/gioi-thieu` | `site_settings` + `books` |
| Tất Cả Sách | `/sach` | `books` |
| Chi Tiết Sách | `/sach/[slug]` | `books` (single) |
| Đặt Hàng | `/dat-hang` | `books` + `site_settings` |
| Xác Nhận Đơn | `/xac-nhan/[token]` | `orders` + `site_settings` |
| Podcast | `/podcast` | Static (coming soon) |

---

## 🏠 Trang Chủ (`/`)

### Hero Section
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Tiêu đề | `site_settings.hero_title` | Tiêu đề Hero |
| Mô tả | `site_settings.hero_subtitle` | Mô tả ngắn Hero |
| Sách nổi bật | `books` where `is_new=true` | Sách mới nhất |

### Author Section
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Tiểu sử ngắn | `site_settings.author_short_bio` | Tiểu sử ngắn |
| Ảnh tác giả | `site_settings.author_image` | Ảnh đại diện |

### Features Section (Shipping Info)
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Thành phố miễn ship | `site_settings.shipping_free_cities` | TP miễn phí ship |
| Phí ship | `site_settings.shipping_flat_fee` | Phí ship cố định |
| Ngưỡng miễn phí | `site_settings.shipping_threshold` | Đơn tối thiểu miễn ship |

### Books Section
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Danh sách sách | `books` (all published) | Tất cả sách |

---

## 👤 Giới Thiệu (`/gioi-thieu`)

### Hero
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Ảnh tác giả | `site_settings.author_image` | Ảnh đại diện |

### Bio Section
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Quote | `site_settings.author_short_bio` | Tiểu sử ngắn |
| Tiểu sử đầy đủ | `site_settings.author_bio` | Tiểu sử chi tiết (HTML) |

### Social Links
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Facebook | `site_settings.social_facebook` | Link Facebook |
| Instagram | `site_settings.social_instagram` | Link Instagram |
| Zalo | `site_settings.social_zalo` | Link/SĐT Zalo |

### Books Grid
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Sách đã xuất bản | `books` where `is_coming_soon=false` | Sách đã ra mắt |

---

## 📚 Tất Cả Sách (`/sach`)

| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Danh sách | `books` (all published) | Tất cả sách |

---

## 📖 Chi Tiết Sách (`/sach/[slug]`)

| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Tiêu đề | `books.title` | Tên sách |
| Phụ đề | `books.subtitle` | Phụ đề |
| Tác giả | `books.author` | Tác giả |
| Mô tả | `books.description` | Mô tả chi tiết (HTML) |
| Mô tả ngắn | `books.short_description` | Mô tả ngắn |
| Giá | `books.price` | Giá bán |
| Giá gốc | `books.compare_price` | Giá gốc (nếu giảm) |
| Trạng thái kho | `books.stock_status` | Tình trạng |
| Ảnh bìa | `books.cover_image` | Ảnh bìa |
| Bộ sưu tập ảnh | `books.gallery` | Thư viện ảnh |
| ISBN | `books.isbn` | Mã ISBN |
| NXB | `books.publisher` | Nhà xuất bản |
| Ngày xuất bản | `books.published_date` | Ngày phát hành |
| Số trang | `books.page_count` | Số trang |
| Sách mới | `books.is_new` | Đánh dấu mới |
| Sắp ra mắt | `books.is_coming_soon` | Sắp ra mắt |
| SEO Title | `books.seo_title` | Tiêu đề SEO |
| SEO Desc | `books.seo_description` | Mô tả SEO |

---

## 🛒 Đặt Hàng (`/dat-hang`)

### Book Info
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Sách đặt mua | `books` (from `?slug=`) | Sách được chọn |

### Bank Info (from site_settings)
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Tên ngân hàng | `site_settings.bank_name` | Ngân hàng |
| Số tài khoản | `site_settings.bank_account` | STK |
| Chủ tài khoản | `site_settings.bank_holder` | Chủ TK |
| Chi nhánh | `site_settings.bank_branch` | Chi nhánh |

### Shipping Config
| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| TP miễn ship | `site_settings.shipping_free_cities` | TP miễn phí ship |
| Phí ship | `site_settings.shipping_flat_fee` | Phí ship |

---

## ✅ Xác Nhận Đơn (`/xac-nhan/[token]`)

| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Thông tin đơn | `orders` (by token) | Chi tiết đơn hàng |
| Thông tin bank | `site_settings.bank_*` | Thông tin chuyển khoản |

---

## 🎙️ Podcast (`/podcast`)

Currently static "Coming Soon" page. Future:

| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Danh sách tập | `podcast_episodes` | Các tập Podcast |

---

## Global (Layout/Footer)

| Field | CMS Path | Vietnamese Label |
|-------|----------|------------------|
| Email liên hệ | `site_settings.contact_email` | Email |
| SĐT liên hệ | `site_settings.contact_phone` | Số điện thoại |
| Facebook | `site_settings.social_facebook` | Facebook |
| Instagram | `site_settings.social_instagram` | Instagram |
| Zalo | `site_settings.social_zalo` | Zalo |

---

## Page Editor Module Scope

The Directus Page Editor should expose these grouped views:

### 1. Trang Chủ
- `hero_title`, `hero_subtitle`
- `author_short_bio`, `author_image`

### 2. Giới Thiệu
- `author_bio` (rich text)
- `author_short_bio`
- `author_image`
- `social_facebook`, `social_instagram`, `social_zalo`

### 3. Sách (list + detail)
- All `books.*` fields
- Quick edit: title, price, stock_status, is_new

### 4. Cài Đặt Vận Chuyển & Thanh Toán
- `bank_name`, `bank_account`, `bank_holder`, `bank_branch`
- `shipping_free_cities`, `shipping_flat_fee`, `shipping_threshold`

### 5. Liên Hệ
- `contact_email`, `contact_phone`
- Social links

---

## Notes for Huy

**Để sửa nội dung trang chủ:**
1. Vào CMS → Site Settings
2. Tìm "Tiêu đề Hero" và "Mô tả Hero"
3. Sửa → Lưu

**Để thêm sách mới:**
1. Vào CMS → Books → Tạo mới
2. Điền đầy đủ: Tên, Giá, Mô tả, Ảnh bìa
3. Đánh dấu "Sách mới" nếu muốn hiện ở Hero
4. Chọn Trạng thái = "Đã xuất bản"
5. Lưu

**Để sửa thông tin chuyển khoản:**
1. Vào CMS → Site Settings
2. Tìm phần "Ngân hàng" (bank_*)
3. Sửa → Lưu

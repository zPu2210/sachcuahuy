---
type: audit-findings-a11y
agent: code-reviewer
date: 2026-05-07 00:25 (Asia/Saigon)
scope: WCAG AA + semantic HTML (sachcuahuy.com baseline)
---

# A11y + Semantic HTML Audit Findings

## Summary
- Total findings: 18
- P0: 4 | P1: 7 | P2: 5 | P3: 2

Lighthouse a11y = 100 trên 3 trang nhưng Lighthouse miss: visible-text contrast trên gradient/glass overlays, form error announcement semantics, multiple-`<nav>` discrimination, custom radio non-disabled state semantics, mobile menu focus trap, decorative icon labelling.

---

## Top Findings (severity-ranked)

### [P0] Contrast: Gold Accent on Cream/White — Brand Token Violation Persists in 3 Spots

- **File:** `tailwind.config.ts:23` (`accent: #C9A962`); used 30+ places
- **Page:** `/sach/[slug]`, `/xac-nhan/[token]`, `/podcast`
- **Issue:** Gold `#C9A962` on cream `#F8F6F3` ratio ≈ 2.4:1 → fails AA normal text (4.5:1). Anh đã đổi `text-accent → text-[#7A6125]` cho ~6 spot prices/labels (home, dat-hang, books-section, author-section), nhưng còn raw `text-accent` ở:
  - `src/app/sach/[slug]/page.tsx:162` price `<span className="text-3xl font-serif font-semibold text-accent">`
  - `src/app/xac-nhan/[token]/page.tsx:246,306` total amount `<span className="text-lg text-accent">`
  - `src/components/podcast/coming-soon-hero.tsx:29,42` "Sắp Ra Mắt" badge + italic title `text-accent` on `bg-[#FDFBF7]`
- **WCAG ref:** SC 1.4.3 Contrast (Minimum) — Level AA
- **Recommendation:** Apply darkened gold `#7A6125` (ratio ≈4.6:1, đã chuẩn hoá ở các chỗ khác):
  ```tsx
  // sach/[slug]/page.tsx:162
  <span className="text-3xl font-serif font-semibold text-[#7A6125]">
    {formatPrice(book.price)}
  </span>
  ```
  Or redefine token: add `accent-text: #7A6125` in `tailwind.config.ts` for text-only usage (keep current `accent` for backgrounds/icons).
- **Effort:** S

### [P0] Form Validation Errors Not Announced — `/dat-hang` Inline Field Errors Missing

- **File:** `src/components/checkout/order-form.tsx:106-225` (inputs); error state at `:300-307`
- **Page:** `/dat-hang`
- **Issue:** Form-level error correctly wired via `role="alert"` (line 302) ✓. Field-level errors rely entirely on HTML5 native validation popup (per screenshot `interactive/01-dat-hang-validation-errors-desktop.png` — browser tooltip "Please fill out this field"). Missing:
  1. `aria-invalid` toggling per field
  2. `aria-describedby` linking to inline error
  3. No inline error text rendered (tooltip dismisses on focus → screen-reader users miss)
  4. `aria-required` not set (only `required` HTML attr)
  5. Asterisk `<span className="text-red-500">*</span>` reads as "asterisk" — no sr-only "(bắt buộc)"
- **WCAG ref:** SC 3.3.1 Error Identification, SC 3.3.3 Error Suggestion, SC 4.1.3 Status Messages
- **Recommendation:**
  ```tsx
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  <input
    id="customer-name" name="name" required
    aria-required="true"
    aria-invalid={!!fieldErrors.name}
    aria-describedby={fieldErrors.name ? "customer-name-error" : undefined}
    ...
  />
  {fieldErrors.name && (
    <p id="customer-name-error" role="alert" className="mt-1 text-sm text-red-600">
      {fieldErrors.name}
    </p>
  )}
  // label asterisk:
  <label>Họ và tên <span aria-hidden="true" className="text-red-500">*</span><span className="sr-only">(bắt buộc)</span></label>
  ```
- **Effort:** M

### [P0] Missing Skip Link — Keyboard Users Tab Through Header Every Page

- **File:** `src/app/layout.tsx:97-109`
- **Page:** all
- **Issue:** No skip-to-main-content link. Header has logo + 3 nav links + cart + Mua Sách CTA = 5-7 tab stops every page before content. Critical for keyboard-only and SR users.
- **WCAG ref:** SC 2.4.1 Bypass Blocks — Level A
- **Recommendation:**
  ```tsx
  // layout.tsx body, before <Header />
  <a href="#main-content"
     className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded">
    Bỏ qua đến nội dung chính
  </a>
  <Header />
  <main id="main-content">{children}</main>
  ```
- **Effort:** S

### [P0] Decorative Step Numbers Inside `<h2>` — Read as Heading Text

- **File:** `src/components/checkout/order-form.tsx:99-102,155-158,230-233`
- **Page:** `/dat-hang`
- **Issue:** `<span className="w-8 h-8 bg-primary text-white rounded-full ...">1</span>` adjacent to heading text is read as part of heading → "1 Thông Tin Người Nhận". Acceptable for sequence cue, BUT carries no programmatic step semantics; combined with no `aria-current` for in-progress step, AT users cannot track form progress.
- **WCAG ref:** SC 1.3.1 Info and Relationships
- **Recommendation:**
  ```tsx
  <h2 className="font-serif text-xl ...">
    <span aria-hidden="true" className="w-8 h-8 bg-primary text-white rounded-full ...">1</span>
    <span className="sr-only">Bước 1:</span>
    Thông Tin Người Nhận
  </h2>
  ```
- **Effort:** S

### [P1] Multiple `<nav>` Landmarks Without Distinguishing `aria-label`

- **File:** `src/components/layout/header.tsx:51,111`; `src/app/dat-hang/page.tsx:49`; `src/app/sach/page.tsx:27`; `src/app/sach/[slug]/page.tsx:90`
- **Page:** all (multi-nav pages)
- **Issue:** `/sach/[slug]` exposes 3 `<nav>` (header desktop, mobile overlay, breadcrumb). Without `aria-label`, AT users hear "navigation, navigation, navigation" — cannot distinguish.
- **WCAG ref:** SC 1.3.1, SC 2.4.6 Headings and Labels
- **Recommendation:**
  ```tsx
  <nav aria-label="Chính" className="hidden md:flex ...">          // header desktop
  <nav aria-label="Di động" ...>                                    // header mobile
  <nav aria-label="Đường dẫn" className="flex items-center ...">    // breadcrumbs
  ```
- **Effort:** S

### [P1] Mobile Menu Toggle — Missing `aria-expanded`, `aria-controls`, Esc, Focus Mgmt

- **File:** `src/components/layout/header.tsx:90-100`, overlay at `:104-142`
- **Page:** all (mobile)
- **Issue:** Burger button toggles overlay but lacks:
  1. `aria-expanded={isMenuOpen}` — SR users no state cue
  2. `aria-controls="mobile-nav"`
  3. No Esc key handler — once open, can't dismiss without mouse
  4. No focus trap — focus stays on burger after open, must Tab through entire DOM to reach menu items
- **WCAG ref:** SC 4.1.2 Name, Role, Value; SC 2.1.2 No Keyboard Trap (inverse — entry not provided)
- **Recommendation:**
  ```tsx
  <button
    aria-expanded={isMenuOpen}
    aria-controls="mobile-nav"
    aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
    onClick={() => setIsMenuOpen(!isMenuOpen)}
  >

  <div id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu di động" ...>

  // Esc handler:
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);
  ```
- **Effort:** M

### [P1] Out-of-Stock CTA — `aria-disabled` Link Pattern Functionally Broken

- **File:** `src/app/sach/[slug]/page.tsx:185-197`; same anti-pattern in `src/components/book/book-card.tsx:31,121` (coming-soon)
- **Page:** `/sach/[slug]` for OOS, book cards for coming-soon
- **Issue:** `<Link href="#" aria-disabled className="...pointer-events-none">`:
  1. `aria-disabled` on `<a>` does NOT prevent activation — Enter still triggers `href="#"` jump-to-top
  2. `pointer-events-none` blocks mouse only
  3. Link role announces "link, Hết hàng" without disabled state in older AT
  4. Should be `<button disabled>` for non-action state
- **WCAG ref:** SC 4.1.2 Name, Role, Value; SC 2.1.1 Keyboard
- **Recommendation:**
  ```tsx
  {isOutOfStock ? (
    <button type="button" disabled aria-disabled="true"
      className="btn flex-1 justify-center btn-outline opacity-50 cursor-not-allowed">
      Hết hàng
    </button>
  ) : (
    <Link href={`/dat-hang?slug=${book.slug}`} className="btn btn-primary flex-1 justify-center">
      Mua Ngay
    </Link>
  )}
  ```
- **Effort:** S

### [P1] White-Opacity Text on Dark Navy CTA — Sub-AA in Footnote

- **File:** `src/components/home/cta-section.tsx:33,49,60`; `src/app/gioi-thieu/page.tsx:77`
- **Page:** `/`, `/gioi-thieu`
- **Issue:** On `bg-[#1E2B4D]`:
  - `text-white/70` ≈ 8:1 ✓
  - `text-white/50` ≈ 5.6:1 ✓ borderline
  - `text-white/40` ≈ 4.4:1 ✗ **fails AA normal**
  - "* Miễn phí giao hàng cho 100 đơn đầu tiên" (cta-section.tsx:60) is `text-white/40` — legally important footnote
- **WCAG ref:** SC 1.4.3 Contrast (Minimum)
- **Recommendation:** Bump to `text-white/70`:
  ```tsx
  <p className="mt-8 text-white/70 text-sm">
    * Miễn phí giao hàng cho 100 đơn đầu tiên
  </p>
  ```
- **Effort:** S

### [P1] Book Card — `<h2>` Causes Heading Rank Conflicts

- **File:** `src/components/book/book-card.tsx:122`
- **Page:** `/`, `/sach`, `/sach/[slug]` (related), `/gioi-thieu`
- **Issue:** `BookCard` emits `<h2>` for book title. On `/sach/[slug]`:
  - h1 book.title
  - h2 "Mô Tả Sách"
  - h2 "Sách Khác Của Tác Giả"
  - h2 (3 sibling, one per related card) — three sibling h2s under section h2 inappropriate

  Should be h3 nested under section h2.
- **WCAG ref:** SC 1.3.1, SC 2.4.6
- **Recommendation:**
  ```tsx
  interface BookCardProps {
    book: Book;
    featured?: boolean;
    headingLevel?: 2 | 3;  // 2 only on /sach top-level grid
  }
  export function BookCard({ book, featured, headingLevel = 3 }: BookCardProps) {
    const Heading = `h${headingLevel}` as const;
    return ( ... <Heading className="font-serif text-xl font-bold ...">{book.title}</Heading> );
  }
  ```
- **Effort:** S

### [P1] Generic `alt="avatar"` on Hero Social-Proof Avatars

- **File:** `src/components/home/hero-section.tsx:128-133`
- **Page:** `/`
- **Issue:** Three dicebear avatars use `alt="avatar"` — generic, repeated. They are decorative (synthetic SVGs backing "100+ độc giả" claim). SR announces "image avatar, image avatar, image avatar" before substantive sentence.
- **WCAG ref:** SC 1.1.1 Non-text Content
- **Recommendation:**
  ```tsx
  <div aria-hidden="true" className="flex -space-x-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="w-10 h-10 ...">
        <img src={...} alt="" width={36} height={36} />
      </div>
    ))}
  </div>
  ```
- **Effort:** S

### [P1] Decorative Lucide Icons Not Marked `aria-hidden`

- **Files:**
  - `src/components/layout/footer.tsx:27,84,95,105` (Book, Mail, Phone, MapPin)
  - `src/app/sach/[slug]/page.tsx:201,205,209` (Truck, CreditCard, Package)
  - `src/app/gioi-thieu/page.tsx:97,102,109` (MapPin, BookOpen, Mic)
  - `src/components/home/cta-section.tsx:20,47` (Sparkles, ArrowRight)
  - `src/components/home/features-section.tsx:65` (feature.icon)
  - Many more (~20 occurrences)
- **Issue:** Lucide icons render `<svg>` without title/desc → SR may announce raw or skip inconsistently. When paired with adjacent text label (e.g., "Email: ..."), icon is decorative — should be `aria-hidden="true"`. `order-form.tsx:257` correctly marks `<Info aria-hidden />` — pattern not applied elsewhere.
- **WCAG ref:** SC 1.1.1, SC 1.3.1
- **Recommendation:**
  ```tsx
  <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
  <Truck className="w-5 h-5 text-accent" aria-hidden="true" />
  ```
- **Effort:** M (~20 spots)

### [P2] Footer Heading Hierarchy Without Top-Level Footer Heading

- **File:** `src/components/layout/footer.tsx:41,80,113`
- **Page:** all
- **Issue:** Footer has three `<h2>` for "Liên Kết", "Liên Hệ", "Mạng Xã Hội" without a top-level footer heading — outline reader sees flat sibling group with no parent. Brand mark line 28 is `<span>` not heading.
- **WCAG ref:** SC 1.3.1 (advisory)
- **Recommendation:** Acceptable to leave (footer landmark provides scope), or add `<h2 className="sr-only">Chân trang</h2>` and demote section headings to h3.
- **Effort:** S

### [P2] Payment Method Radio — `checked readOnly` Single-Option Confusing for AT

- **File:** `src/components/checkout/order-form.tsx:239-247`
- **Page:** `/dat-hang`
- **Issue:** Single radio rendered `checked readOnly` (no other options). AT hears "radio button, checked, Đặt trước qua chuyển khoản" → user attempts Space toggle → silently fails. Also `aria-label` (line 240) duplicates visible text label nearby (line 250) → potential double-read.
- **WCAG ref:** SC 4.1.2; SC 3.3.2
- **Recommendation:**
  ```tsx
  // Option A: replace radio (no choice anyway)
  <div className="p-4 border border-primary bg-primary/5 rounded-xl">
    <input type="hidden" name="payment" value="bank" />
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="mt-1 w-4 h-4 rounded-full bg-primary"></span>
      ...
    </div>
  </div>
  // Option B: keep but drop redundant aria-label
  ```
- **Effort:** S

### [P2] Tooltip Info Icon Uses `title` Attribute Only

- **File:** `src/components/checkout/order-form.tsx:253-258`
- **Page:** `/dat-hang`
- **Issue:** `<span title="Bạn có thể chuyển khoản ngay..."><Info aria-hidden /></span>` — `title` unreliable: keyboard users can't trigger, mobile users can't see, some AT skip. Critical info gated behind hover-only.
- **WCAG ref:** SC 1.3.1; SC 1.4.13 Content on Hover or Focus
- **Recommendation:** Inline visible explanation already exists below at `:260` — make icon redundant or wrap in real button + `aria-describedby`:
  ```tsx
  <button type="button" aria-label="Thông tin về chuyển khoản"
    aria-describedby="payment-bank-info" className="inline-flex">
    <Info className="w-4 h-4 text-accent" aria-hidden="true" />
  </button>
  // existing <p> at :260 → add id="payment-bank-info"
  ```
- **Effort:** S

### [P2] Touch Target — Header Cart Icon 36×36 Below 44×44 Best Practice

- **File:** `src/components/layout/header.tsx:77-83`
- **Page:** all (mobile)
- **Issue:** Cart link `p-2` (8px) + 20px icon = 36×36px. Passes WCAG AA 2.5.8 (≥24×24) but fails AAA / mobile best practice ≥44×44.
- **WCAG ref:** SC 2.5.8 Target Size — Level AA passes; SC 2.5.5 (AAA) fails
- **Recommendation:**
  ```tsx
  <Link href="/sach" className="relative p-3 ... rounded-full">  // p-3 → 12px, total 44px
    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
  </Link>
  ```
- **Effort:** S

### [P2] Order Summary Sidebar — Should Be `<aside>` Landmark

- **File:** `src/app/dat-hang/page.tsx:81-141`
- **Page:** `/dat-hang`
- **Issue:** Sidebar `<div className="lg:col-span-1">` with order summary should be `<aside>` for landmark structure (complementary content alongside main form).
- **WCAG ref:** SC 1.3.1
- **Recommendation:**
  ```tsx
  <aside aria-labelledby="order-summary-heading" className="lg:col-span-1">
    <div className="bg-white ...">
      <h2 id="order-summary-heading">Đơn Hàng Của Bạn</h2>
      ...
    </div>
  </aside>
  ```
- **Effort:** S

### [P3] Mixed-Language Content Not Marked

- **File:** `src/components/layout/header.tsx:46` "Writer & Storyteller"; `src/components/home/cta-section.tsx:36` "bookmarks"; `src/app/gioi-thieu/page.tsx` "Voice Talent"
- **Page:** all (header tagline), `/`, `/gioi-thieu`
- **Issue:** Page is `lang="vi"` but contains English phrases. Vietnamese SR mispronounces.
- **WCAG ref:** SC 3.1.2 Language of Parts — Level AA
- **Recommendation:**
  ```tsx
  <span lang="en" className="text-[10px] tracking-widest text-gray-600 uppercase">
    Writer & Storyteller
  </span>
  ```
- **Effort:** S

### [P3] Submit Spinner SVG Missing `<title>` for Loading Announcement

- **File:** `src/components/checkout/order-form.tsx:325-344`
- **Page:** `/dat-hang`
- **Issue:** Spinner SVG has no `<title>` or `aria-label` — but parent `<button>` text changes to "Đang xử lý..." which is announced ✓. SVG could explicitly be `aria-hidden="true"` to prevent any double-read.
- **WCAG ref:** SC 4.1.3 Status Messages
- **Recommendation:**
  ```tsx
  <svg aria-hidden="true" className="animate-spin h-5 w-5" ...>
  ```
- **Effort:** S

---

## Contrast Audit Table

| Element | FG | BG | Ratio | WCAG AA Required | Pass? |
|---|---|---|---|---|---|
| Body text default | `#1E2B4D` (text-primary) | `#F8F6F3` (bg-cream) | 9.1:1 | ≥4.5:1 (normal) | ✓ AAA |
| Hero price `text-accent` (sach/[slug]:162) | `#C9A962` | `#FFFFFF` (white card) | 2.4:1 | ≥4.5:1 | ✗ FAIL |
| Hero price `text-[#7A6125]` (dat-hang:100) | `#7A6125` | `#FFFFFF` | 4.6:1 | ≥4.5:1 | ✓ AA |
| CTA footnote `text-white/40` (cta-section:60) | rgba(255,255,255,0.4) | `#1E2B4D` | ~4.4:1 | ≥4.5:1 | ✗ FAIL |
| CTA body `text-white/70` (cta-section:33) | rgba(255,255,255,0.7) | `#1E2B4D` | ~8.0:1 | ≥4.5:1 | ✓ AA |
| Author title `text-white/70` (gioi-thieu:77) | rgba(255,255,255,0.7) | `#1E2B4D` | ~8.0:1 | ≥4.5:1 | ✓ AA |
| Placeholder `placeholder:text-gray-400` (globals.css:87) | `#9CA3AF` | `#FFFFFF` | 2.85:1 | ≥4.5:1 | ✗ FAIL |
| Breadcrumb `text-gray-500` (sach:27) | `#6B7280` | `#FFFFFF` | 4.6:1 | ≥4.5:1 | ✓ AA tight |
| Footer link `text-gray-600 text-sm` | `#4B5563` | `#FFFFFF` | 7.6:1 | ≥4.5:1 | ✓ AAA |
| OOS dot `bg-gray-400` (sach/[slug]:175) | `#9CA3AF` | `#FFFFFF` | 2.85:1 | ≥3:1 (UI) | ✗ FAIL UI |
| Coming-soon "Sắp Ra Mắt" `text-accent` (coming-soon-hero:29) | `#C9A962` | `bg-accent/10` ≈ `#FAF6EC` | ~2.4:1 | ≥4.5:1 | ✗ FAIL |
| Out-of-stock badge white-on-gray-700 | `#FFFFFF` | `#374151` | 11:1 | ≥4.5:1 | ✓ AAA |
| `xac-nhan` total `text-accent` (xac-nhan:246,306) | `#C9A962` | `#FFFFFF` (card) | 2.4:1 | ≥4.5:1 | ✗ FAIL |
| Header nav inactive `text-gray-600` (header:60) | `#4B5563` | white-blur | 7.6:1 | ≥4.5:1 | ✓ AAA |
| Form label `text-gray-700` | `#374151` | `#FFFFFF` | 9.7:1 | ≥4.5:1 | ✓ AAA |

---

## Form Audit (`/dat-hang` `OrderForm`)

| Field | Visible Label | `<label htmlFor>` | aria-required | aria-invalid | aria-describedby | Inline Error | Notes |
|---|---|---|---|---|---|---|---|
| name | "Họ và tên *" | ✓ `customer-name` | ✗ | ✗ | ✗ | ✗ | Asterisk read literally |
| phone | "Số điện thoại *" | ✓ `customer-phone` | ✗ | ✗ | ✗ | ✗ | `pattern` validates, error native-only |
| email | "Email" | ✓ `customer-email` | n/a | ✗ | ✗ | ✗ | Optional |
| city select | "Tỉnh/Thành phố *" | ✓ `shipping-city` | ✗ | ✗ | helper text NOT linked | ✗ | `cityFreeNote` `<p>` orphan |
| district | "Quận/Huyện *" | ✓ `shipping-district` | ✗ | ✗ | ✗ | ✗ | |
| address | "Địa chỉ chi tiết *" | ✓ `shipping-address` | ✗ | ✗ | ✗ | ✗ | `minLength={5}` |
| note | "Ghi chú" | ✓ `order-note` | n/a | ✗ | ✗ | ✗ | Optional textarea |
| payment radio | "Đặt trước..." | ✗ uses `aria-label` (redundant) | n/a | n/a | n/a | n/a | `checked readOnly` confusing — see P2 |
| Submit "Đặt Hàng" | n/a | n/a | n/a | n/a | n/a | n/a | Spinner SVG missing aria-hidden |
| Form-level error | (post-submit) | n/a | n/a | n/a | n/a | ✓ `role="alert"` (line 302) | **Wired correctly** |
| OOS banner | (when disabled) | n/a | n/a | n/a | n/a | ✓ `role="alert"` (line 311) | **Wired correctly** |

**`/xac-nhan/[token]` `VerifyForm`:**

| Field | Label | htmlFor | aria-* | Inline Error | Notes |
|---|---|---|---|---|---|
| phone_last_4 | "4 số cuối SĐT" | ✓ | ✗ aria-invalid, ✗ describedby | ✓ `<p role="alert">` (line 87) | Best implementation in repo — error linked via `role="alert"`; missing aria-invalid + describedby for re-announce |

---

## Quick Wins (high impact + low effort)

1. **Add skip link** in `layout.tsx` body — 5 min fix, bypasses ALL keyboard users wasting tab stops on every navigation. (P0)
2. **Replace `text-accent` raw → `text-[#7A6125]`** for prices and key text — 4 spots remain (sach/[slug]:162, xac-nhan:246,306, coming-soon-hero:29,42). (P0)
3. **Add `aria-hidden="true"` to decorative Lucide icons** — global pattern fix, ~20 occurrences. (P1)
4. **Add `aria-label` to each `<nav>`** ("Chính", "Đường dẫn", "Di động") — disambiguates landmarks. (P1)
5. **Bump `text-white/40` → `text-white/70`** in CTA section footnote (cta-section:60) — single line. (P1)
6. **Bump cart icon padding** `p-2` → `p-3` (header:80) — hits 44×44 target. (P2)

---

## Cross-Cutting Themes

1. **Form a11y is 70% there but missing field-level wiring everywhere.** Both forms (`OrderForm`, `VerifyForm`) correctly use `role="alert"` for form-level errors. Neither uses `aria-invalid`, `aria-describedby` per field. Recommend creating a shared `FormField` component (label + input + error wired automatically) — `/dat-hang` repeats the pattern 7×.

2. **Brand token `text-accent` overused where contrast fails.** Anh đã chuẩn hoá `text-[#7A6125]` cho ~6 spots, nhưng còn raw `text-accent` ở 4-5 spots. Either centralize: redefine `accent` token to `#7A6125`, OR add new `accent-text` token explicitly for foreground use. Avoid raw hex like `text-[#7A6125]` scattered in components — promote to `text-accent-text` token.

3. **Decorative SVG icons systematically un-marked.** Inconsistent: only `Info` icon (order-form:257) and `404` heading (not-found:16) have `aria-hidden`. Apply globally — codify "decorative-icon-default-aria-hidden" as a Tailwind/component pattern.

4. **No `:focus-visible` styles beyond `.btn-primary` and `.input`.** `globals.css:65,87` defines focus styles only for those 2 component classes. Plain `<a>`, breadcrumb links, footer links rely on browser default outline. Add global `:focus-visible` style:
   ```css
   @layer base {
     :focus-visible {
       @apply outline-2 outline-offset-2 outline-primary;
     }
   }
   ```

5. **Multi-step form lacks programmatic progress.** "1/2/3" circles visual-only, no `aria-current`. Acceptable for 3-step linear, but on validation failure no auto-focus to first invalid field. Consider:
   ```tsx
   onSubmit={(e) => {
     if (!form.checkValidity()) {
       form.querySelector(":invalid")?.focus();
     }
   }}
   ```

6. **Heading semantic rank fragile.** `BookCard` always emits `<h2>` causing rank conflicts when card sits inside `<h2>` section. Cleanest fix: parameterize heading level prop.

---

**Status:** DONE
**Summary:** 18 a11y findings (4 P0, 7 P1, 5 P2, 2 P3). Top issues: missing skip link, gold-on-cream contrast persisting in 4-5 spots (xac-nhan total, sach/[slug] price, coming-soon hero), form field-level ARIA gaps (aria-invalid/describedby missing despite form-level role="alert" wired correctly), decorative-icon labelling inconsistency, mobile menu missing aria-expanded + Esc handler. Repo's a11y baseline solid (Lighthouse 100, semantic landmarks present, html lang="vi" set, role="alert" used for form errors) — main gaps are field-level form semantics and contrast hot spots.

## Unresolved Questions
- For OOS book CTA: should disabled `<button>` replace `<Link>` (current `aria-disabled` link broken on Enter), or hide CTA and surface "Hết hàng" as primary status text only?
- Is dicebear avatar usage approved as social-proof element, or placeholder data slated for replacement? If decorative → `alt=""`; if real testimonials → replace with real avatars.
- Color token redefinition (`accent` → `#7A6125`) vs. component-level overrides (`text-[#7A6125]`) — depends on brand-guidelines.md alignment (out of audit scope).
- Should `BookCard` heading level parameterize globally, or should `/sach` listing page wrap each card in section heading h3 wrapper?

# Design System: Sách Của Huy

## 1. Design Philosophy

**Core Concept:** "Literary Nostalgia"
- Minimalist but warm
- Artistic & hand-crafted feel
- Editorial quality
- Personal & intimate

**Inspiration:** Book cover "Miền Nam của Huy"
- Hand-drawn illustrations (white line art on navy)
- Nostalgic, personal storytelling
- Vietnamese literary aesthetic

---

## 2. Color Palette

### Primary Colors

```css
:root {
  /* Primary - Deep Navy (from book cover) */
  --color-primary: #1E2B4D;
  --color-primary-light: #2D3F66;
  --color-primary-dark: #141D36;

  /* Secondary - Cream/Off-White */
  --color-secondary: #F8F6F3;
  --color-secondary-dark: #EDE9E3;

  /* Accent - Warm Gold */
  --color-accent: #C9A962;
  --color-accent-light: #D4B875;
  --color-accent-dark: #B89A52;

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-black: #0F172A;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-400: #94A3B8;
  --color-gray-600: #475569;
  --color-gray-800: #1E293B;
}
```

### Tailwind Config

```javascript
// tailwind.config.ts
const colors = {
  primary: {
    DEFAULT: '#1E2B4D',
    light: '#2D3F66',
    dark: '#141D36',
  },
  secondary: {
    DEFAULT: '#F8F6F3',
    dark: '#EDE9E3',
  },
  accent: {
    DEFAULT: '#C9A962',
    light: '#D4B875',
    dark: '#B89A52',
  },
  cream: '#F8F6F3',
  navy: '#1E2B4D',
  gold: '#C9A962',
}
```

### Color Usage

| Element | Color | Notes |
|---------|-------|-------|
| Background | `secondary` (#F8F6F3) | Warm cream, not cold white |
| Primary Text | `gray-800` (#1E293B) | High contrast |
| Secondary Text | `gray-600` (#475569) | Muted |
| Headers | `primary` (#1E2B4D) | Deep navy |
| Accent/CTA | `accent` (#C9A962) | Warm gold |
| Buttons Primary | `primary` | Navy background |
| Buttons Secondary | `accent` | Gold background |
| Cards | `white` | Clean cards on cream bg |
| Borders | `gray-200` | Subtle |

---

## 3. Typography

### Font Stack

**Heading:** Cormorant Garamond (Serif)
- Elegant, literary, editorial
- Weights: 400, 500, 600, 700

**Body:** Inter (Sans-serif)
- Clean, readable, modern
- Vietnamese support excellent
- Weights: 300, 400, 500, 600

**Accent/Script:** Dancing Script (Cursive)
- For signatures, special elements
- Matches hand-drawn aesthetic

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Dancing+Script:wght@400;500;600&display=swap');
```

### Tailwind Config

```javascript
fontFamily: {
  serif: ['Cormorant Garamond', 'Georgia', 'serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
  script: ['Dancing Script', 'cursive'],
}
```

### Typography Scale

```css
/* Headings - Cormorant Garamond */
.text-display { font-size: 4rem; line-height: 1.1; font-weight: 600; }
.text-h1 { font-size: 3rem; line-height: 1.2; font-weight: 600; }
.text-h2 { font-size: 2.25rem; line-height: 1.3; font-weight: 600; }
.text-h3 { font-size: 1.5rem; line-height: 1.4; font-weight: 500; }
.text-h4 { font-size: 1.25rem; line-height: 1.5; font-weight: 500; }

/* Body - Inter */
.text-body { font-size: 1rem; line-height: 1.7; }
.text-body-sm { font-size: 0.875rem; line-height: 1.6; }
.text-caption { font-size: 0.75rem; line-height: 1.5; }
```

---

## 4. Spacing System

Using 4px base unit (Tailwind default):

```
4px  = 1   (p-1)
8px  = 2   (p-2)
12px = 3   (p-3)
16px = 4   (p-4)
20px = 5   (p-5)
24px = 6   (p-6)
32px = 8   (p-8)
40px = 10  (p-10)
48px = 12  (p-12)
64px = 16  (p-16)
80px = 20  (p-20)
96px = 24  (p-24)
```

### Section Spacing

- Page padding: `px-4 md:px-8 lg:px-16`
- Section gap: `py-16 md:py-24`
- Content max-width: `max-w-6xl mx-auto`

---

## 5. Components

### Buttons

```html
<!-- Primary Button -->
<button class="
  bg-primary text-white
  px-6 py-3
  font-sans font-medium
  rounded-lg
  transition-all duration-200 ease-out
  hover:bg-primary-light hover:shadow-lg
  focus:ring-2 focus:ring-primary/50 focus:outline-none
  cursor-pointer
">
  Đặt Hàng Ngay
</button>

<!-- Secondary Button (Gold) -->
<button class="
  bg-accent text-primary
  px-6 py-3
  font-sans font-medium
  rounded-lg
  transition-all duration-200 ease-out
  hover:bg-accent-light hover:shadow-lg
  cursor-pointer
">
  Xem Chi Tiết
</button>

<!-- Outline Button -->
<button class="
  border-2 border-primary text-primary
  px-6 py-3
  font-sans font-medium
  rounded-lg
  transition-all duration-200 ease-out
  hover:bg-primary hover:text-white
  cursor-pointer
">
  Tìm Hiểu Thêm
</button>
```

### Cards

```html
<!-- Book Card -->
<div class="
  bg-white
  rounded-2xl
  overflow-hidden
  shadow-sm
  border border-gray-100
  transition-all duration-300 ease-out
  hover:shadow-xl hover:-translate-y-1
  cursor-pointer
  group
">
  <div class="aspect-[3/4] relative overflow-hidden">
    <img class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
  </div>
  <div class="p-6">
    <h3 class="font-serif text-h4 text-primary">Book Title</h3>
    <p class="text-gray-600 mt-2">Author</p>
    <p class="text-accent font-semibold mt-3">179,000đ</p>
  </div>
</div>
```

### Input Fields

```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">
    Họ và tên
  </label>
  <input
    type="text"
    class="
      w-full px-4 py-3
      border border-gray-200 rounded-lg
      bg-white
      text-gray-800
      placeholder:text-gray-400
      transition-all duration-200
      focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
    "
    placeholder="Nguyễn Văn A"
  />
</div>
```

---

## 6. Layout Patterns

### Header/Navigation

```
┌─────────────────────────────────────────────────────────┐
│  Logo          Sách | Giới thiệu | Blog     [Giỏ hàng]  │
└─────────────────────────────────────────────────────────┘

- Sticky on scroll
- Backdrop blur
- Mobile: Hamburger menu
```

### Hero Section

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     "Sách Của Huy"              [Book Image]           │
│      Tagline text                                       │
│                                                         │
│      [CTA Button]                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

- Split layout (text left, image right)
- On mobile: stacked (image top, text bottom)
```

### Book Detail

```
┌─────────────────────────────────────────────────────────┐
│   [Image Gallery]        │   Title                      │
│   [Thumbnails]           │   Author                     │
│                          │   Price                      │
│                          │   Description                │
│                          │   [Quantity] [Add to Cart]   │
│                          │   [Buy Now]                  │
└─────────────────────────────────────────────────────────┘
```

### Footer

```
┌─────────────────────────────────────────────────────────┐
│  Logo            Quick Links    Contact    Social       │
│  Tagline         - Sách         Email      FB IG TT    │
│                  - Blog         Phone                   │
│                  - About        Address                 │
├─────────────────────────────────────────────────────────┤
│  © 2026 Sách Của Huy. All rights reserved.             │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Iconography

### Icon Set: Lucide Icons

```bash
npm install lucide-react
```

Common icons needed:
- `ShoppingCart` - Cart
- `Menu` - Mobile menu
- `X` - Close
- `ChevronRight` - Arrows
- `Book` - Books
- `User` - Account
- `Mail` - Email
- `Phone` - Phone
- `MapPin` - Address
- `Truck` - Shipping
- `CreditCard` - Payment
- `Check` - Success

### Icon Sizing

```
sm: w-4 h-4 (16px)
md: w-5 h-5 (20px)
lg: w-6 h-6 (24px)
xl: w-8 h-8 (32px)
```

---

## 8. Animation Guidelines

### Transitions

```css
/* Default transition */
.transition-default {
  transition: all 200ms ease-out;
}

/* Slower for large elements */
.transition-slow {
  transition: all 300ms ease-out;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

### Hover Effects

- Buttons: Color shift + subtle shadow
- Cards: Lift (-translate-y-1) + shadow increase
- Links: Color shift (navy → gold)
- Images: Subtle scale (1.05)

### Page Transitions

- Fade in on load: opacity 0 → 1
- Stagger children: 50ms delay between items
- Scroll reveal: fade + slide up

---

## 9. Responsive Breakpoints

```javascript
// Tailwind default breakpoints
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Mobile-first approach

```html
<!-- Example: Grid columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 10. Shadows

```javascript
boxShadow: {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 12px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 24px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 40px -8px rgb(0 0 0 / 0.15)',
  'book': '8px 8px 24px -4px rgb(0 0 0 / 0.2)', // For book covers
}
```

---

## 11. Special Elements

### Hand-drawn Border Effect

```css
/* SVG filter for hand-drawn look */
.hand-drawn {
  filter: url(#rough-edge);
}

/* Or use border-image with SVG pattern */
.hand-drawn-border {
  border: 2px solid transparent;
  border-image: url('/images/hand-drawn-border.svg') 2;
}
```

### Decorative Illustrations

- Use white line art SVGs from book cover style
- Place as decorative elements (corners, dividers)
- Subtle opacity (0.1-0.3) on background

---

## 12. Image Guidelines

### Aspect Ratios

- Book covers: 3:4 (portrait)
- Hero images: 16:9 or 4:3
- Author photo: 1:1 (circle crop)
- Blog thumbnails: 16:9

### Image Quality

- Book covers: High quality, no compression artifacts
- Use WebP format with fallback
- Lazy loading for below-fold images
- Blur placeholder for loading state

---

## Summary: Design Token Quick Reference

| Token | Value |
|-------|-------|
| **Primary** | #1E2B4D (Navy) |
| **Accent** | #C9A962 (Gold) |
| **Background** | #F8F6F3 (Cream) |
| **Text** | #1E293B |
| **Heading Font** | Cormorant Garamond |
| **Body Font** | Inter |
| **Border Radius** | 8px (sm), 12px (md), 16px (lg) |
| **Transition** | 200ms ease-out |
| **Max Width** | 1152px (max-w-6xl) |

---

*Design System v1.0 | Sách Của Huy | January 2026*

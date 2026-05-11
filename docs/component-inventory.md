# Component Inventory — sachcuahuy.com

> Catalog of reusable React components under `src/components/**`. Sibling doc: [`design-system.md`](./design-system.md) (tokens + patterns).
> Last audited: 2026-05-11. Generated from source by reading every `.tsx` file. Re-audit when `src/components/**` changes.

## Contents

- **Layout** — [Header](#header), [Footer](#footer)
- **Home sections** — [HeroSection](#herosection), [BooksSection](#bookssection), [AuthorSection](#authorsection), [FeaturesSection](#featuressection), [CTASection](#ctasection)
- **UI primitives** — [FadeIn](#fadein), [WatercolorWash](#watercolorwash), [PaperTexture](#papertexture), [HandDrawnDivider](#handdrawndivider), [SignatureFlourish](#signatureflourish)
- **Book** — [BookCard](#bookcard)
- **Checkout** — [OrderForm](#orderform)
- **Podcast** — [ComingSoonHero](#comingsoonhero)
- **SEO** — [JsonLdOrganization, JsonLdBook, JsonLdPerson](#json-ld)

Total: 16 components across 7 domains. Atomic primitives + composites both included.

---

## Layout

### Header

- **File:** `src/components/layout/header.tsx`
- **Type:** composite (client `"use client"`)
- **Props:**
  ```ts
  interface HeaderProps {
    cartCount?: number;
  }
  ```
- **Dependencies (internal):** none
- **Dependencies (external):** `next/link`, `next/navigation` (`usePathname`), `lucide-react` (`ShoppingCart`, `Menu`, `X`, `Book`), `clsx`, `react`
- **Used in:** `src/app/layout.tsx`
- **States/variants:** scrolled vs at-top (background blur), mobile menu open/closed (focus-trap + body-scroll-lock + Tab cycling)
- **Tokens used:** [`paper`](./design-system.md#color), [`primary`](./design-system.md#color), [`accent`](./design-system.md#color), [`fontFamily.serif`](./design-system.md#typography)
- **Notes:** Sticky `top-0 z-50`. Active link uses animated underline pseudo-element. Mobile overlay is fullscreen `bg-paper/95 backdrop-blur-xl`. Cart icon currently routes to `/sach` until a real cart context exists.

### Footer

- **File:** `src/components/layout/footer.tsx`
- **Type:** composite (server component — no `"use client"`)
- **Props:**
  ```ts
  interface FooterProps {
    settings: SiteSettings | null;
  }
  ```
- **Dependencies (internal):** none
- **Dependencies (external):** `next/link`, `lucide-react` (`Book`, `Mail`, `Phone`, `MapPin`), inline social SVGs
- **Used in:** `src/app/layout.tsx`
- **Variants:** 3-col layout when no socials, 4-col when ≥1 social provided. Falls back to `FALLBACK_EMAIL`/`FALLBACK_PHONE` when `settings` null.
- **Tokens used:** [`primary`](./design-system.md#color), [`accent`](./design-system.md#color), [`fontFamily.serif`](./design-system.md#typography)

---

## Home sections

### HeroSection

- **File:** `src/components/home/hero-section.tsx`
- **Type:** composite (server component)
- **Props:**
  ```ts
  interface HeroSectionProps {
    featuredBook: Book;
    title?: string | null;
    subtitle?: string | null;
  }
  ```
- **Dependencies (internal):** none directly (renders book cover image)
- **Dependencies (external):** `next/image`, `next/link`, `lucide-react` (`ArrowRight`, `Sparkles`), `@/lib/utils` (`formatPrice`)
- **Used in:** `src/app/page.tsx`
- **Variants:** mobile-first stacked layout vs desktop side-by-side. Title auto-split (last 2 words become accent span via `splitTitle()`).
- **Tokens used:** [`paper`](./design-system.md#color), [`accent`](./design-system.md#color), [`motion.float`](./design-system.md#motion) (book floating animation)
- **Notes:** Uses `/images/book-floating.webp` as hero asset. `min-h-[90vh]` on desktop only.

### BooksSection

- **File:** `src/components/home/books-section.tsx`
- **Type:** composite
- **Props:**
  ```ts
  interface BooksSectionProps {
    books: Book[];
  }
  ```
- **Dependencies (internal):** [BookCard](#bookcard), [HandDrawnDivider](#handdrawndivider) (note: dataset of section, not in JSX flow)
- **Dependencies (external):** `next/link`, `lucide-react` (`ArrowRight`)
- **Used in:** `src/app/page.tsx`
- **Variants:** empty state (`<p>Chưa có sách nào.</p>`) when `books.length === 0`
- **Tokens used:** [`accent.dark`](./design-system.md#color), [`primary`](./design-system.md#color), [`fontFamily.serif`](./design-system.md#typography)
- **Notes:** Inline SVG wave divider directly in JSX (200×18 viewBox) — separate from `HandDrawnDivider` primitive.

### AuthorSection

- **File:** `src/components/home/author-section.tsx`
- **Type:** composite
- **Props:**
  ```ts
  interface AuthorSectionProps {
    name: string;
    title: string;
    shortBio: string;
    imageUrl?: string | null;
  }
  ```
- **Dependencies (internal):** [PaperTexture](#papertexture), [SignatureFlourish](#signatureflourish), [WatercolorWash](#watercolorwash) (×2)
- **Dependencies (external):** `next/image`, `next/link`, `lucide-react` (`ChevronRight`, `Feather`)
- **Used in:** `src/app/page.tsx`
- **Variants:** with portrait image vs initials fallback (computes last-2 initials)
- **Tokens used:** [`paper`](./design-system.md#color), [`accent`](./design-system.md#color), [`cobalt`](./design-system.md#color)

### FeaturesSection

- **File:** `src/components/home/features-section.tsx`
- **Type:** atomic (no internal component deps)
- **Props:**
  ```ts
  interface FeaturesSectionProps {
    shippingFreeCities: string[];
    shippingFlatFee: number;
    shippingThreshold?: number | null;
  }
  ```
- **Dependencies (internal):** none
- **Dependencies (external):** `lucide-react` (`Truck`, `Package`, `CreditCard`), `@/lib/utils`
- **Used in:** `src/app/page.tsx`
- **Variants:** shipping description switches between threshold / free-cities / flat-fee modes
- **Notes:** Static features list with one dynamic shipping description.

### CTASection

- **File:** `src/components/home/cta-section.tsx`
- **Type:** composite
- **Props:**
  ```ts
  interface CTASectionProps {
    featuredBook: Book;
  }
  ```
- **Dependencies (internal):** [PaperTexture](#papertexture)
- **Dependencies (external):** `next/link`, `lucide-react` (`ArrowRight`, `Sparkles`)
- **Used in:** `src/app/page.tsx`
- **Tokens used:** `.watercolor-wash-sunset` ([Patterns](./design-system.md#pattern-watercolor-wash)), [`accent`](./design-system.md#color), [`cobalt`](./design-system.md#color), [`fontFamily.script`](./design-system.md#typography) (book title italic)

---

## UI primitives

### FadeIn

- **File:** `src/components/ui/fade-in.tsx`
- **Type:** atomic (client `"use client"`)
- **Props:**
  ```ts
  interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    className?: string;
    fullWidth?: boolean;
  }
  ```
- **Dependencies (external):** `framer-motion` (`motion`, `useInView`), `react` (`useRef`)
- **Used in:** (audit — grep finds no consumers as of 2026-05-11; primitive available for future authoring)
- **Notes:** Triggers once on enter via `useInView({ once: true, margin: "-40px" })`. Custom easing `[0.21, 0.47, 0.32, 0.98]`, duration `0.7s`.

### WatercolorWash

See [Patterns → Watercolor wash](./design-system.md#pattern-watercolor-wash) for full visual + usage docs.

- **File:** `src/components/ui/watercolor-wash.tsx`
- **Type:** atomic
- **Props:** `{ color: "cobalt" | "terracotta" | "sunset"; className?: string }`

### PaperTexture

See [Patterns → Paper texture](./design-system.md#pattern-paper-texture).

- **File:** `src/components/ui/paper-texture.tsx`
- **Type:** atomic
- **Props:** `{ className?: string }`

### HandDrawnDivider

See [Patterns → Hand-drawn divider](./design-system.md#pattern-hand-drawn-divider).

- **File:** `src/components/ui/hand-drawn-divider.tsx`
- **Type:** atomic
- **Props:** `{ variant?: "wave" | "sparkle" | "leaf" | "dots"; width?: number; className?: string }`

### SignatureFlourish

See [Patterns → Signature flourish](./design-system.md#pattern-signature-flourish).

- **File:** `src/components/ui/signature-flourish.tsx`
- **Type:** atomic
- **Props:** `{ className?: string }`

---

## Book

### BookCard

- **File:** `src/components/book/book-card.tsx`
- **Type:** composite (server-renderable)
- **Props:**
  ```ts
  interface BookCardProps {
    book: Book;
    featured?: boolean;
    headingLevel?: 2 | 3;
  }
  ```
- **Dependencies (internal):** none
- **Dependencies (external):** `next/image`, `next/link`, `lucide-react` (`ShoppingCart`, `Eye`, `Book as BookIcon`), `clsx`, `@/lib/directus-assets`, `@/lib/utils`
- **Used in:** `src/app/sach/page.tsx`, `src/components/home/books-section.tsx`
- **States/variants:**
  - Coming soon (`is_coming_soon`) → grey placeholder, no link, no actions
  - Out of stock (`stock_status === "out_of_stock"`) → badge + suppressed cart action
  - New (`is_new`) → "Mới" badge
  - No cover image → fallback `bg-primary` panel with author + script title
- **Tokens used:** [`secondary.dark`](./design-system.md#color), [`primary`](./design-system.md#color), [`accent.dark`](./design-system.md#color), `radius.2xl` ([Radius](./design-system.md#radius)), [`motion.card`](./design-system.md#motion)
- **Notes:** Heading level prop allows `<h2>` or `<h3>` for semantic page hierarchy (`<h3>` when nested under section heading on home).

---

## Checkout

### OrderForm

- **File:** `src/components/checkout/order-form.tsx`
- **Type:** composite (client `"use client"`)
- **Props:**
  ```ts
  interface OrderFormProps {
    bookSlug: string;
    qty: number;
    bankInfo: {
      name: string;
      account: string;
      holder: string;
      branch: string | null;
    };
    shippingFreeCities: string[];
    disabled?: boolean;
  }
  ```
- **Dependencies (internal):** none
- **Dependencies (external):** `react` (`useState`), `next/navigation` (`useRouter`), `lucide-react` (`Info`), `clsx`
- **Used in:** `src/app/dat-hang/page.tsx`
- **States/variants:** validating, submitting, error states; disabled overlay when book sold out; Vietnamese validation messages per field
- **Tokens used:** [`primary`](./design-system.md#color), [`accent`](./design-system.md#color), [`secondary`](./design-system.md#color), `.btn`/`.input`/`.card` utility classes
- **Notes:** Three numbered steps (Customer / Shipping / Payment). Posts to `/api/orders`. Phone pattern `0[0-9]{9,10}`. City select has fixed values `hcm/hn/dn/other`.

---

## Podcast

### ComingSoonHero

- **File:** `src/components/podcast/coming-soon-hero.tsx`
- **Type:** composite (client `"use client"` for `framer-motion`)
- **Props:** none
- **Dependencies (internal):** [WatercolorWash](#watercolorwash), [PaperTexture](#papertexture), [HandDrawnDivider](#handdrawndivider)
- **Dependencies (external):** `next/link`, `lucide-react` (`Mic`, `Sparkles`, `ArrowLeft`), `framer-motion` (`motion`)
- **Used in:** `src/app/podcast/page.tsx`
- **Tokens used:** [`paper`](./design-system.md#color), [`accent`](./design-system.md#color), [`navy`](./design-system.md#color), [`ink`](./design-system.md#color), [`fontFamily.serif`](./design-system.md#typography), [`fontFamily.script`](./design-system.md#typography)

---

## SEO

### JSON-LD

- **File:** `src/components/seo/json-ld.tsx`
- **Type:** atomic (server, dangerouslySetInnerHTML) — three exports in one file:
  - `JsonLdOrganization({ settings: SiteSettings })`
  - `JsonLdBook({ book: Book; coverUrl: string | null })`
  - `JsonLdPerson({ ...author fields })`
- **Dependencies:** none beyond types
- **Used in:**
  - `src/app/layout.tsx` (Organization)
  - `src/app/sach/[slug]/page.tsx` (Book)
  - `src/app/gioi-thieu/page.tsx` (Person)
- **Notes:** Outputs `<script type="application/ld+json">` blocks. Reads `NEXT_PUBLIC_SITE_URL` for canonical URL; falls back to `sachcuahuy.vercel.app`. Not visual — included for completeness.

---

## Audit Notes

- **Untyped components:** none. All have explicit TS interfaces.
- **Dynamic imports:** none detected.
- **FadeIn consumers:** zero as of audit — primitive available but not currently composed into pages. Confirm with `grep -rn "<FadeIn" src/` before deletion.
- **Heading-level prop pattern:** `BookCard` uses `headingLevel` for semantic nesting; replicate elsewhere if a component appears at multiple page depths.

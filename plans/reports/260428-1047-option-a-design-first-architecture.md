---
type: brainstorm-report
date: 260428-1047
project: sachcuahuy
status: approved-for-design-planning
scope: option-a-design-first
---

# Option A Design-First Architecture

## Summary

Approved direction: **Next.js + Payload CMS + SePay + GoClaw Ops Assistant**.

Hard rule: **design first, implementation later**. No backend/CMS/AI implementation until UI system, public website, admin/CMS, checkout states, and GoClaw assistant UX are mapped in design.

Core opinion: build a polished commerce + content system, not a generic marketplace. Owner should edit safely through structured CMS fields, not free-form page builder.

## Current State

| Area | Current | Gap |
|---|---|---|
| Website | Next.js static MVP | Needs real product/order/content model |
| Product data | Hardcoded in `src/lib/data.ts` | Needs CMS source of truth |
| Checkout | Simulated client submit | Needs order API + payment status |
| Payment | COD/manual bank UI only | Needs SePay QR/webhook later |
| Admin | None | Needs owner-friendly CMS/admin |
| Audio/podcast | None | Needs product type + player + gated delivery |
| GoClaw | Existing marketing hub nearby | Needs scoped assistant for website ops |

## Final Architecture Choice

### Chosen

**Option A: Next.js + Payload CMS + SePay + GoClaw**

Why:
- One custom product/content model for books, audio, podcast, bundles.
- Admin panel can be owner-friendly without building everything from zero.
- Better long-term control than Shopify/Haravan/Sapo.
- GoClaw can operate against project docs/API with narrow permissions.

### Rejected For Now

| Option | Why not now |
|---|---|
| Supabase + custom admin | Fast backend, but admin UX becomes custom work. Owner non-tech risk. |
| Shopify/Haravan/Sapo | Fast commerce, but less control for literary/audio/content system and GoClaw workflows. |
| Fully custom CMS | Overkill. Higher maintenance. YAGNI violation. |
| Public chatbot first | Risky, low business value before order/content ops stable. |

## Product Scope

### Product Types

| Type | Purpose | MVP Treatment |
|---|---|---|
| Book | Physical hardcover/books | Primary product |
| Audio book | Paid audio version | Product with preview + gated full audio |
| Podcast episode | Free or paid episode | Start as content/product hybrid |
| Bundle | Book + audio / book set | Phase 2 after order core |
| Preorder | Upcoming book/audio | Phase 2 if launch campaign needs it |

### Commerce Statuses

| Entity | Statuses |
|---|---|
| Order | draft, pending_payment, paid, processing, shipped, delivered, cancelled, refunded |
| Payment | unpaid, awaiting_transfer, paid, failed, refunded |
| Fulfillment | unfulfilled, packing, shipped, delivered, returned |
| Product | draft, active, hidden, sold_out, coming_soon |

## Design-First Workflow

### Step 1: Claude Design Tokens

Deliverables:
- Brand moodboard direction.
- Token system.
- Component style rules.
- Motion/accessibility rules.
- Admin and public UI visual relationship.

Token groups:
- Color primitives.
- Semantic colors.
- Typography scale.
- Spacing scale.
- Radius.
- Shadow/elevation.
- Borders.
- Motion duration/easing.
- Form states.
- Commerce status colors.

Design direction:
- Literary nostalgia.
- Warm editorial commerce.
- Deep navy / cream / warm gold already good base.
- Avoid generic SaaS admin look; admin can be calm, editorial, operational.

### Step 2: Pencil Component Board

Create first in Pencil before full screens.

Required components:
- Button variants.
- Text input, textarea, select, checkbox, radio.
- Product card: book/audio/podcast/bundle.
- Price block.
- Status badge.
- Quantity stepper.
- Checkout stepper.
- Cart item.
- Payment method card.
- Audio player: compact/full.
- Media upload tile.
- Table/list row.
- Filter/search bar.
- Modal/sheet.
- Toast/alert.
- Admin sidebar/topbar.
- Empty state.
- Loading/skeleton.

### Step 3: Pencil Public Website Frames

Minimum frames:

| ID | Screen | Notes |
|---|---|---|
| P01 | Home | Hero, featured book, audio preview, author, CTA |
| P02 | Books listing | Filters optional; keep simple |
| P03 | Book detail | Gallery, buy area, description, related products |
| P04 | Audio/podcast listing | Product/content hybrid discovery |
| P05 | Audio/podcast detail | Preview player, purchase CTA, transcript/notes |
| P06 | Blog/journal listing | Author content/SEO |
| P07 | Article detail | Editorial typography |
| P08 | Cart | Item list, totals, coupon placeholder |
| P09 | Checkout | Customer, shipping, payment |
| P10 | Payment pending | QR/manual bank instructions |
| P11 | Payment success | Order number, next steps |
| P12 | Payment failed/cancelled | Recovery path |
| P13 | About author | Bio, voice talent, Mina/story |
| P14 | FAQ/contact/policies | Trust + support |
| P15 | 404 | Brand-safe fallback |

Mobile examples:
- Home mobile.
- Product detail mobile.
- Checkout mobile.

### Step 4: Pencil Admin/CMS Frames

Minimum frames:

| ID | Screen | Notes |
|---|---|---|
| A01 | Login | Simple, secure, brand-aligned |
| A02 | Dashboard | Sales, orders, content tasks, assistant entry |
| A03 | Products list | Books/audio/podcast/bundles tabs |
| A04 | Product editor | Shared fields + type-specific panels |
| A05 | Orders list | Status filters, search, bulk light actions |
| A06 | Order detail | Customer, items, payment, shipping timeline |
| A07 | Media/audio library | Upload, preview, metadata |
| A08 | Blog/pages list | Content management |
| A09 | Page/section editor | Structured homepage sections |
| A10 | Site settings | Contact, shipping, bank, social, SEO defaults |
| A11 | Users/roles | Owner/editor/fulfillment/goclaw-service |
| A12 | GoClaw assistant panel | Draft actions + approval model |

Admin mobile:
- Not full mobile-first. Tablet/desktop primary.
- Mobile only for quick order checks if needed later.

## CMS UX Rules

### Use Structured Sections, Not Free Page Builder

Owner edits:
- Text.
- Images.
- Products shown.
- Section order.
- Section visibility.
- CTA links.

Owner should not edit:
- Arbitrary layout grids.
- Raw CSS.
- Unbounded HTML.
- Payment/security settings without guardrails.

### Homepage Sections

| Section | Editable Fields |
|---|---|
| Hero | eyebrow, title, subtitle, featured product, CTA, image |
| Featured book | product select, copy override |
| Featured audio | audio select, preview text |
| Author | bio, image, social links |
| Testimonials | quote cards |
| Journal/blog | selected posts |
| CTA | title, body, CTA |
| Footer | contact, socials, legal links |

## GoClaw UX + Permissions

### Assistant Placement

Start as **internal admin assistant**, not public chatbot.

Entry points:
- Admin dashboard panel.
- Product editor side panel.
- Blog/page editor side panel.
- Orders dashboard summary.

### Phase 1 Capabilities: Read/Draft Only

Allowed:
- Summarize orders.
- Suggest product copy.
- Draft blog posts.
- Draft SEO metadata.
- Review pages for missing content.
- Generate launch checklist.
- Answer owner questions from docs.

Denied:
- Publish directly.
- Change price.
- Refund/cancel orders.
- Access secrets.
- Modify payment settings.
- Delete products/orders/media.

### Phase 2 Capabilities: Approval-Based Writes

Allowed only after owner confirms:
- Update product description.
- Update SEO metadata.
- Create draft page/blog post.
- Reorder homepage sections.

### GoClaw Workspace

Use:
- `/Users/pu/marketing-tasks/projects/sachcuahuy`

GoClaw should read:
- Website docs.
- Marketing docs.
- Product/content snapshots.
- Analytics summaries.

GoClaw should not directly own:
- Production DB credentials.
- Payment secrets.
- Unscoped filesystem writes.

## Design Handoff Requirements

Before implementation, each designed screen must have:
- Pencil frame ID.
- Screenshot export.
- Layout snapshot.
- Component list.
- Copy source.
- Interaction notes.
- Empty/error/loading states if business-critical.
- Responsive behavior notes.
- Required data fields/API needs.

## Implementation Order After Design Approval

1. Token sync: Pencil/Claude Design → Tailwind/CSS variables.
2. Payload CMS setup.
3. Product/content collections.
4. Public website reads from CMS.
5. Order API + checkout real submit.
6. Admin order workflow.
7. SePay QR + webhook.
8. Audio/podcast product flow.
9. GoClaw read-only assistant.
10. GoClaw draft + approval workflows.

## Success Metrics

### Design Success

- Owner can understand admin screens without developer explanation.
- Checkout flow clear in under 60 seconds.
- Product detail supports physical + audio without duplicated UI mess.
- Admin does not look like generic SaaS template.
- Component board covers 80%+ of screens.

### Business Success

- Owner can create/edit product without code.
- Real order captured with payment status.
- Audio product can be sold/delivered safely.
- GoClaw reduces owner ops burden, not create production risk.

### Technical Success

- Product/content schema maps cleanly from designs.
- No free-form page builder complexity in MVP.
- Payment webhook idempotent.
- GoClaw permissions narrow.
- Design-to-code handoff has no guessing.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Over-designing every tiny state | Delays launch | Design screen system + critical states only |
| Admin too flexible | Owner breaks site | Structured sections, guarded fields |
| GoClaw writes too early | Production risk | Read/draft first, approval writes later |
| Audio delivery piracy | Revenue leakage | MVP gated access, watermark later |
| Payment webhook duplicate | Bad order state | Idempotency by transaction/order refs |
| Payload too heavy | Dev/deploy complexity | Keep collections minimal first |

## References

- Payload Admin docs: https://payloadcms.com/docs/admin/overview
- Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
- Shopify Storefront API docs: https://shopify.dev/docs/api/storefront/latest
- SePay QR/webhook docs: https://developer.sepay.vn/en/sepay-webhooks/tao-qr-va-form-thanh-toan
- Local GoClaw docs: `/Users/pu/marketing-tasks/docs/goclaw-knowledge/llms-full.txt`

## Next Steps

1. Create UI design inventory + Pencil frame checklist.
2. Create design-token brief for Claude Design.
3. Create Pencil file structure and component-board spec.
4. After visual approval, create detailed implementation plan.

## Unresolved Questions

- Final domain/brand name: `Sách Của Huy`, `Trọng Huy Books`, or other?
- Audio delivery: streaming only, download, or both?
- Payment launch: COD/manual bank first, or SePay in first production release?
- Admin language: Vietnamese only, or Vietnamese + English labels?

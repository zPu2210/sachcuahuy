---
type: audit-findings-visual
agent: ui-ux-designer
date: 2026-05-07 00:25 (Asia/Saigon)
scope: visual + UX (sachcuahuy.com baseline audit)
---

# Visual + UX Audit Findings

## Summary
- Total findings: 28
- P0: 3 | P1: 11 | P2: 9 | P3: 5

## Top Findings (severity-ranked)

### [P0] Content — Raw HTML tags rendered as visible text trong book description
- **Page:** /sach/mien-nam-cua-huy, /sach/goc-phan-tu (cả 2 sách)
- **Viewport:** both
- **Screenshot:** screenshots/03-sach-mien-nam-desktop.png, screenshots/04-sach-goc-phan-tu-desktop.png, screenshots/03-sach-mien-nam-mobile.png, screenshots/04-sach-goc-phan-tu-mobile.png
- **Issue:** "Mô Tả Sách" section literally renders `&lt;p&gt;`, `&lt;strong&gt;`, `&lt;br&gt;`, `&lt;/p&gt;` tags as plain text. Description đọc thành "<p>Nội dung mô tả... <br><br><strong>Miền Nam của Huy</strong>..." — broken HTML output.
- **Why it matters:** Đây là trang detail = primary conversion page. User đọc gibberish HTML markup → mất trust ngay → không buy. Single largest credibility kill trên site.
- **Recommendation:** Fix Directus rich-text rendering. Either render HTML safely (dangerouslySetInnerHTML với sanitizer) hoặc strip tags + render as plain text. Verify với both sách trước ship.
- **Effort:** S

### [P0] Hero — Book cover side là plain navy block, không có hình bìa
- **Page:** /
- **Viewport:** desktop primary, mobile less critical
- **Screenshot:** screenshots/01-home-desktop.png (right column), screenshots/01-home-mobile.png (top section)
- **Issue:** Right half của hero desktop là solid navy rectangle với subtle corner highlight — looks như image failed to load hoặc placeholder chưa replace. Mobile có same block ở top before content.
- **Why it matters:** Hero = first impression. 50% viewport là empty navy block → user nghĩ site broken hoặc unfinished. CTA "Đặt Hàng Ngay" nằm bên trái nhưng eye anchor bên phải bị void → conversion drop.
- **Recommendation:** Hoặc (a) load actual book cover render với shadow/rotation (Phase 1 magical overhaul sẽ replace anyway), (b) tạm thời swap thành 1 trong 2 cover images đã có (Miền Nam của Huy `/images/book-cover-*`). Dù plan overhaul → fix trong baseline trước để không lose conversions trong intervening period.
- **Effort:** S (temporary), M (proper render)

### [P0] Form — Validation errors không hiển thị inline messages
- **Page:** /dat-hang
- **Viewport:** both
- **Screenshot:** screenshots/interactive/01-dat-hang-validation-errors-desktop.png, screenshots/interactive/02-dat-hang-validation-errors-mobile.png
- **Issue:** Sau khi submit empty form, screenshot trông y hệt initial state — không có red text dưới fields, không có error summary banner, không có aria-live announcement visible. Chỉ có focus ring trên field đầu tiên.
- **Why it matters:** User submit → page nhìn không có gì xảy ra → user nghĩ form broken hoặc submit thành công → repeat-submit hoặc bounce. Form validation invisible = form broken UX.
- **Recommendation:** (1) Inline error text dưới mỗi required field bằng đỏ + icon. (2) Error summary box ở top form list missing fields với anchor links. (3) Live announce errors với aria-live="polite". (4) Scroll-to-first-error on submit. Vietnamese microcopy: "Vui lòng nhập họ và tên", "Số điện thoại không hợp lệ".
- **Effort:** M

### [P1] Footer — "Sẽ cập nhật sau" placeholder text trong production
- **Page:** all pages
- **Viewport:** both
- **Screenshot:** screenshots/01-home-mobile.png (bottom), screenshots/02-sach-listing-desktop.png (footer)
- **Issue:** Footer "Mạng Xã Hội" column literally show "Sẽ cập nhật sau." — placeholder copy chưa replace. Visible trên TẤT CẢ pages.
- **Why it matters:** Production site với placeholder text = unprofessional + signals abandoned project. Vietnamese book buyers expect Zalo/FB hotline → no social = no trust → no order.
- **Recommendation:** Either (a) thêm Zalo + FB + IG links thực sự (per competitor finding), hoặc (b) ẩn cả Mạng Xã Hội column tạm thời until ready. Không bao giờ ship "Sẽ cập nhật sau".
- **Effort:** S (hide column), S-M (add real links)

### [P1] Order — Mobile flow: submit button ở giữa payment block và order summary
- **Page:** /dat-hang
- **Viewport:** mobile
- **Screenshot:** screenshots/05-dat-hang-mobile.png
- **Issue:** Mobile vertical order: form → payment radio → "Đặt Hàng" submit button → order summary "Đơn Hàng Của Bạn" với total 224.000đ. User submit before seeing total họ đang pay.
- **Why it matters:** Vietnamese ecommerce convention = always show total + summary trước khi click submit. User không trust forms họ click without seeing final amount.
- **Recommendation:** Reorder mobile: Order summary (sticky/collapsible top) → form → payment → submit cuối. Desktop đã đúng (right rail). Hoặc show floating bar bottom với total + CTA.
- **Effort:** M

### [P1] Hero — CTA hover state không có visual feedback
- **Page:** /
- **Viewport:** desktop
- **Screenshot:** screenshots/interactive/03-home-cta-hover-desktop.png vs screenshots/01-home-desktop.png
- **Issue:** Hover screenshot và default screenshot trông identical. "Đặt Hàng Ngay" navy button không change color/shadow/scale on hover.
- **Why it matters:** No hover feedback → users không sure button clickable. Reduces perceived responsiveness, accessibility issue cho keyboard nav.
- **Recommendation:** Hover: lighten 5-8% (e.g., navy → primary-light #2D3F66 đã có trong tokens), subtle scale(1.02) hoặc box-shadow lift. Apply globally.
- **Effort:** S

### [P1] Header — Nav "Tác Giả" hover state looks disabled, không có active indicator
- **Page:** /
- **Viewport:** desktop
- **Screenshot:** screenshots/interactive/04-header-nav-hover-desktop.png
- **Issue:** Hover screenshot show nav links với "Tác Giả" appears slightly different (potential hover) nhưng contrast minimal — vừa nhìn tưởng disabled.
- **Why it matters:** Confusing affordance. Users không biết link đang hovered hay disabled.
- **Recommendation:** Hover: animated underline 0→100% width + accent gold #C9A962 color shift. Active: persistent underline + bolder weight.
- **Effort:** S

### [P1] Hero — Repeated identical CTA blocks ăn brand impact
- **Page:** /
- **Viewport:** both
- **Screenshot:** screenshots/01-home-desktop.png (top hero + bottom band)
- **Issue:** Top hero "Đặt Hàng Ngay" navy CTA. Bottom band ("Sở hữu cuốn sách Miền Nam của Huy ngay hôm nay") có IDENTICAL navy "Đặt Hàng Ngay" + "Xem Thêm Tác Phẩm". Same styling.
- **Why it matters:** Repetition không tệ per se, NHƯNG identical styling = lazy. Bottom section có cơ hội differentiate (urgency, social proof, gift framing) đang bị wasted.
- **Recommendation:** Bottom CTA giữ wording nhưng thêm context: "Còn 50 cuốn", testimonial quote, gift bundle. Visual: keep navy nhưng add accent gold border-glow.
- **Effort:** S

### [P1] Detail — Trust signals nhỏ + không tận dụng
- **Page:** /sach/mien-nam-cua-huy, /sach/goc-phan-tu
- **Viewport:** desktop
- **Screenshot:** screenshots/03-sach-mien-nam-desktop.png (right column under price)
- **Issue:** Three trust strip lines: "Miễn phí HCM/HN, tỉnh khác: 25.000đ", "Đặt trước qua chuyển khoản, mã QR sẵn", "Đang giao toàn quốc" — tiny grey text, low visual weight.
- **Why it matters:** Vietnamese book buyers care intensely về shipping cost. Burying nó tiny grey = missed reassurance.
- **Recommendation:** Format thành 3 icon-row trust badges với accent gold icons + bolder navy text. Add "COD available" if applicable. Move above CTA, not below.
- **Effort:** S-M

### [P1] Mobile — Header touch targets < 44px ambiguous
- **Page:** all (mobile)
- **Viewport:** mobile
- **Screenshot:** screenshots/01-home-mobile.png, screenshots/05-dat-hang-mobile.png
- **Issue:** Mobile header có logo + cart icon + hamburger ba target ngay top. Cart icon visually compact (~28-32px estimate).
- **Why it matters:** 44×44 px touch target minimum (Apple HIG, WCAG). User mis-taps.
- **Recommendation:** Audit measurements: cart button ≥44×44, hamburger ≥44×44, increase tap padding without changing icon size. Add cart counter badge khi có items.
- **Effort:** S

### [P1] Detail — Mobile CTA sticky không có
- **Page:** /sach/mien-nam-cua-huy, /sach/goc-phan-tu
- **Viewport:** mobile
- **Screenshot:** screenshots/03-sach-mien-nam-mobile.png
- **Issue:** Mobile detail page is long (description + meta + related books). User scroll xuống đọc → "Mua Ngay" button scroll out of view. No sticky bottom CTA bar.
- **Why it matters:** Industry standard cho mobile commerce: sticky bottom CTA với price + buy button. Without it, drop-off lớn.
- **Recommendation:** Sticky bottom bar fixed (mobile only): price (199.000đ) on left + "Mua Ngay" navy button on right. Translucent background blur.
- **Effort:** M

### [P1] Author page — Hero solid navy block với tiny avatar = visually empty
- **Page:** /gioi-thieu
- **Viewport:** desktop
- **Screenshot:** screenshots/07-gioi-thieu-desktop.png
- **Issue:** Top 30% viewport là solid navy block với chỉ small circular avatar of Trọng Huy + "Tác giả · Voice Talent" tag. Massive negative space.
- **Why it matters:** Trọng Huy = the brand. Author page should reinforce voice/storytelling identity. Plain navy block làm page feel like template chưa fill.
- **Recommendation:** (Phase 1 overhaul sẽ help). Tạm thời: avatar bigger (180-240px), thêm signature/handwritten name overlay, thêm 1-2 line tagline lớn. Reduce solid color block.
- **Effort:** M

### [P1] Listing — Card "Mới" badge tiny + low contrast
- **Page:** /sach
- **Viewport:** both
- **Screenshot:** screenshots/02-sach-listing-mobile.png, screenshots/02-sach-listing-desktop.png
- **Issue:** Both cards có small "Mới" tag ở top-left corner — tiny font, near-invisible cream-on-cream contrast.
- **Why it matters:** "Mới" = key marketing signal cho new release. Invisible badge = missed opportunity.
- **Recommendation:** Larger badge (12-14px text), accent gold background với navy text, white border. Apply consistently tới home featured cards too.
- **Effort:** S

### [P2] Confirm — "Xác Minh" button on confirmation page looks disabled
- **Page:** /xac-nhan/[token]
- **Viewport:** both
- **Screenshot:** screenshots/interactive/05-xac-nhan-success-desktop.png, screenshots/interactive/05-xac-nhan-success-mobile.png
- **Issue:** "4 số cuối SĐT" verification box → "Xác Minh" button rendered grey/disabled style by default.
- **Why it matters:** User input 4 digits expecting button enable; default grey state ambiguous — user maybe nhập đúng nhưng button không change.
- **Recommendation:** If button validates on input, default disabled grey OK NHƯNG must transition tới navy primary state visibly when 4 digits entered.
- **Effort:** S

### [P2] Brand — Two serif fonts on hero create hierarchy blur
- **Page:** /
- **Viewport:** both
- **Screenshot:** screenshots/01-home-desktop.png
- **Issue:** Hero "Sách" (Cormorant serif) + "Của Huy" (Dancing Script gold cursive) wins. NHƯNG sub-line "Tản văn của giả..." also Cormorant italic + paragraph below cũng serif → 3 serif weights/styles in 4 lines.
- **Why it matters:** Heading combination Cormorant + Dancing là intentional → đẹp. NHƯNG italic sub-line + paragraph cũng serif → reader can't distinguish hierarchy.
- **Recommendation:** Sub-line nên switch sang Inter sans-serif italic hoặc regular. Reserve Cormorant cho true heading levels.
- **Effort:** S

### [P2] Detail — "Còn hàng" availability badge subtle
- **Page:** /sach/mien-nam-cua-huy, /sach/goc-phan-tu
- **Viewport:** both
- **Screenshot:** screenshots/03-sach-mien-nam-desktop.png
- **Issue:** "✓ Còn hàng" appears as small gold-ish text under price.
- **Why it matters:** "Còn hàng" = critical purchase trigger. Combine với scarcity ("Còn 50 cuốn") it converts.
- **Recommendation:** Larger green dot + bolder "Còn hàng" + add stock count. If pre-order: "Đặt trước · Giao 15.06" framed urgency.
- **Effort:** S

### [P2] Detail — Meta strip cramped, awkward rhythm
- **Page:** /sach/mien-nam-cua-huy
- **Viewport:** desktop
- **Screenshot:** screenshots/03-sach-mien-nam-desktop.png
- **Issue:** "Số trang | Ngày xuất bản | NXB | Mã sách" strip với labels above values. Visual rhythm awkward — values larger than labels create top-heavy feeling.
- **Why it matters:** Reader scanning quickly forces re-read.
- **Recommendation:** Definition-list layout: label small grey above OR 2-column grid. Format date "17 tháng 2, 2020" Vietnamese style.
- **Effort:** S

### [P2] Listing — Page header subhead overruns 2 lines, line-height tight
- **Page:** /sach
- **Viewport:** both
- **Screenshot:** screenshots/02-sach-listing-mobile.png, screenshots/02-sach-listing-desktop.png
- **Issue:** "Khám phá các tác phẩm văn học của Trọng Huy — những câu chuyện nhỏ được kể với giọng văn nhẹ nhàng, đầy hoài niệm." 2-3 lines, dense.
- **Why it matters:** Reader bounces.
- **Recommendation:** Tighten copy to 1 line, hoặc split với line break for poetic effect.
- **Effort:** S

### [P2] Order — Email field không asterisk + không "(tuỳ chọn)" label
- **Page:** /dat-hang
- **Viewport:** both
- **Screenshot:** screenshots/05-dat-hang-mobile.png
- **Issue:** "Họ và tên *", "Số điện thoại *" có asterisk red. "Email" không asterisk, không "(tuỳ chọn)" — ambiguous.
- **Why it matters:** Vietnamese forms convention: required = asterisk, optional = "(tuỳ chọn)". Ambiguous → user fills email even when don't want (privacy concern).
- **Recommendation:** Add "(tuỳ chọn)" hoặc "Không bắt buộc" suffix label.
- **Effort:** XS

### [P2] Podcast — Page là single-card landing với tiny content footprint
- **Page:** /podcast
- **Viewport:** both
- **Screenshot:** screenshots/06-podcast-desktop.png, screenshots/06-podcast-mobile.png
- **Issue:** Entire page = small card với mic icon + "Sắp Ra Mắt" tag + 2 sentence description + 2 CTAs. Massive empty space xung quanh.
- **Why it matters:** Coming-soon page shouldn't feel empty. Opportunity build anticipation.
- **Recommendation:** Add 3-4 sections: concept blurb, format preview, topics list, email signup "Báo tôi khi ra tập đầu". Phase 1 overhaul sẽ handle với watercolor mic illustration.
- **Effort:** M

### [P2] 404 — Brand-light, opportunity for personality
- **Page:** /non-existent
- **Viewport:** both
- **Screenshot:** screenshots/08-not-found-mobile.png, screenshots/08-not-found-desktop.png
- **Issue:** "404 / Không tìm thấy trang" + 2 buttons. Generic, không có brand voice (literary, poetic) reinforcement.
- **Why it matters:** 404 = unexpected moment. Brand-y 404 = memorable.
- **Recommendation:** Literary microcopy: "Trang này như cuốn sách mất bìa — câu chuyện đã phiêu bạt nơi khác." Watercolor doodle (Phase 1).
- **Effort:** S

### [P2] Pricing — "199.000đ" formatting inconsistent across pages
- **Page:** all SKU instances
- **Viewport:** both
- **Screenshot:** screenshots/01-home-desktop.png, screenshots/02-sach-listing-desktop.png, screenshots/03-sach-mien-nam-desktop.png, screenshots/interactive/03-home-cta-hover-desktop.png
- **Issue:** Home shows "199,000đ" (comma) một số nơi, "199.000đ" (dot) nơi khác. Confirm "124.000đ" (dot). Inconsistent.
- **Why it matters:** Vietnamese convention = dot separator. Inconsistency = sloppy.
- **Recommendation:** Lock formatter: always dot thousands + đ suffix attached. Single util `formatVND(199000) → "199.000đ"`. Audit cả invoice/confirm/email.
- **Effort:** S

### [P2] Order summary — "Phí ship (ước tính)" italics + grey small
- **Page:** /dat-hang
- **Viewport:** both
- **Screenshot:** screenshots/05-dat-hang-desktop.png
- **Issue:** "Phí ship tỉnh xác sau khi chọn tỉnh/thành. Miễn phí: HCM, HN" rendered as 2-line tiny grey.
- **Why it matters:** Critical info (shipping logic) buried in fine print = user surprises later → cancels.
- **Recommendation:** Surface as inline tooltip/info icon next to "Phí ship" label, expand on hover/tap. Or "(?)" tooltip với rate table modal.
- **Effort:** S

### [P3] Author — "Tin thêm thân ở kênh trình..." sentence truncates oddly
- **Page:** /gioi-thieu
- **Viewport:** mobile
- **Screenshot:** screenshots/07-gioi-thieu-mobile.png
- **Issue:** Body copy reads "Tin thêm thân ở kênh trình ..." — ambiguous Vietnamese. Maybe meant "Tin tưởng thân quen ở kênh truyền thông" hoặc full sentence chưa chỉnh.
- **Why it matters:** Brand voice should be polished. Awkward Vietnamese signals draft copy.
- **Recommendation:** Rewrite line. Confirm với Trọng Huy intent.
- **Effort:** XS

### [P3] Footer — "Liên Hệ" missing phone number / Zalo
- **Page:** all
- **Viewport:** both
- **Screenshot:** all footer
- **Issue:** "Liên Hệ" column shows email + city only. No phone number, no Zalo link.
- **Why it matters:** Vietnamese book buyers prefer Zalo direct DM trước khi order. Email-only = friction.
- **Recommendation:** Add Zalo deep link `https://zalo.me/[number]` icon + phone number. Or "Chat Zalo" CTA inline.
- **Effort:** S

### [P3] Header — Cart icon trong header but no counter when items present
- **Page:** all
- **Viewport:** both
- **Screenshot:** all header
- **Issue:** Cart icon static; if items added, no badge to show count. Single-SKU flow currently bypasses cart, cart icon may be vestigial.
- **Why it matters:** Two paths: keep cart? → add badge feedback. Remove cart? → simplify header.
- **Recommendation:** Decide: keep cart? → add badge (red dot + number). Remove cart? → simplify header to just "Mua Sách" CTA.
- **Effort:** S (decision + minor UI)

### [P3] Hero — "100+ Đã đọc" social proof bottom of mobile hero feels disconnected
- **Page:** /
- **Viewport:** mobile
- **Screenshot:** screenshots/01-home-mobile.png (very bottom of hero, before featured)
- **Issue:** Tiny avatar row "100+ Đã đọc" mới ra mắt — small, easy miss, separated từ hero CTA.
- **Why it matters:** Social proof = conversion lever. Buried = wasted.
- **Recommendation:** Move social proof closer to CTA: directly under "Đặt Hàng Ngay" button. Avatar row + "Đã đọc 100+ độc giả" with consistent visual weight.
- **Effort:** S

### [P3] Detail — "Sách Khác Của Tác Giả" only shows 1 other book, padding feels off
- **Page:** /sach/mien-nam-cua-huy, /sach/goc-phan-tu
- **Viewport:** desktop
- **Screenshot:** screenshots/03-sach-mien-nam-desktop.png, screenshots/04-sach-goc-phan-tu-desktop.png
- **Issue:** Section centers single card alone, large empty space right side. Awkward solo card on full-width section.
- **Why it matters:** Visual emptiness signals incompleteness. With only 2 SKUs, this section will always have 1 item.
- **Recommendation:** Constrain section width tới ~600px max khi 1 item, OR add filler: author quote, podcast tease card. Multi-purpose related-content slot.
- **Effort:** S

---

## Quick Wins (high impact + low effort)

1. **Fix raw HTML rendering trong description** (P0 #1) — single biggest credibility kill, 1 day fix.
2. **Replace navy hero block với book cover** (P0 #2) — temporary swap to existing `/images/book-cover-front.png` until Phase 1 watercolor lands.
3. **Add inline form validation messages** (P0 #3) — required for trustable order flow.
4. **Hide "Sẽ cập nhật sau" footer placeholder** (P1 #4) — 5-min CSS toggle, removes amateur signal.
5. **Lock VND price formatter** (P2 #20) — single util applies everywhere, fixes dot/comma drift.

---

## Brand Consistency Notes

- **Color drift:** Navy + cream + gold consistent across pages. Gold accent usage subtle but consistent. NO drift detected — palette discipline OK trên baseline.
- **Typography drift:** Cormorant serif used consistently for H1-H2. Inter for body. Dancing Script chỉ on hero word "Của Huy" — disciplined. Concern: italic Cormorant overused on subheads blurs hierarchy nhưng không cross-page inconsistent.
- **Header/Footer parity:** Header simple + identical across all pages. Footer identical (good). Mobile header collapses to hamburger correctly.
- **CTA language drift:** "Đặt Hàng Ngay" / "Mua Ngay" / "Mua Sách" / "Đặt Hàng" = 4 different verbs. Standardize: "Mua Ngay" cho immediate purchase, "Đặt Hàng" cho form CTA, "Mua Sách" cho header generic.
- **Hero treatments cross-page:** Home, /gioi-thieu, /podcast all use solid navy color blocks → feels like template default chưa customized. Phase 1 watercolor overhaul should address comprehensively.

---

## Cross-Page Patterns

- **Empty hero blocks:** Home book cover side, /gioi-thieu top band, /podcast page-wide → systemic "solid navy block as placeholder" pattern. Phase 1 overhaul will fix.
- **Trust signals minimal:** Shipping policy buried, no return policy visible, no payment security badges, no Zalo support. Vietnamese ecommerce expects trust scaffolding heavy.
- **Microcopy thin:** Form labels functional but không warm; success/error states sparse; loading/skeleton states unclear. Brand voice (literary, warm, poetic) underused outside hero.
- **No social proof in commerce path:** Hero has "100+" tiny mention. Detail has none. Listing none. Confirmation none. Reviews/quotes from real readers would lift conversion significantly.
- **Mobile information density:** Mobile screens consistently put summary/total below the fold of action. Mobile-first ordering needs explicit pass.

---

## Notes for Magical Overhaul

Phase 1+ (navy + terracotta repaint với watercolor scenes) likely auto-solves OR needs explicit attention:

- **Auto-solved by overhaul:** Hero plain navy block (P0 #2), /gioi-thieu hero solid block (P1), /podcast empty page (P2), 404 generic (P2), solid navy hero treatments cross-page.
- **Needs explicit attention even after overhaul:** Raw HTML in descriptions (P0 #1) là data/render bug, không paint-fix. Form validation invisibility (P0 #3) là logic. Footer placeholder text (P1) cần real social URLs. Mobile order summary placement (P1) là layout/IA decision. Sticky mobile CTA on detail (P1) là interaction pattern. VND formatter consistency (P2) là code-level. Repeated CTA differentiation (P1) cần copy + visual hierarchy.
- **Risks during overhaul:** Color repaint may break gold accent contrast on cream — re-audit all small badges (Mới, Còn hàng, "Sắp Ra Mắt") in new palette. Watercolor scenes may push text contrast issues if overlay text on hand-drawn backgrounds — plan text-on-image layering carefully.
- **Opportunity:** Magical overhaul là chance to standardize CTA language ("Mua Ngay" vs "Đặt Hàng Ngay") + fix hero hierarchy (Cormorant + Dancing Script discipline) cùng lúc.
- **Carry-forward:** Trust signal redesign (P1) phải coordinate với new palette — terracotta/cobalt accents thay vì current gold subtle.

---

**Status:** DONE
**Summary:** 28 findings logged (3 P0 critical, 11 P1, 9 P2, 5 P3). Top three P0s — raw HTML in book descriptions, plain navy hero block, invisible form validation — are conversion-killers cần fix bất kể magical overhaul; rest spans cross-page polish where Phase 1 watercolor repaint sẽ absorb many but not all.

## Unresolved Questions
- Does Directus rich-text field have a sanitizer config option, or is fix purely client-render side?
- Cart icon: kept for future multi-SKU expansion, or vestigial and should be removed?
- Hero "100+ Đã đọc" — real number or aspirational placeholder? If placeholder, may need to be hidden until truthful.
- Phase 1 scope: does it include re-translation/copy polish, or just visual repaint? Several copy-level fixes (P3 author page line, microcopy warmth) should be flagged into the right phase.

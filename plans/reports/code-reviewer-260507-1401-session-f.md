---
type: code-review
date: 2026-05-07 14:10 (Asia/Saigon)
session: F (a11y/form cleanup parking-lot)
branch: main (uncommitted)
reviewer: code-reviewer
scope: 7 files (1 new, 6 modified)
---

# Session F review — a11y/form cleanup

Independent review per request. Severity ladder: P0 must-fix, P1 should-fix, P2 nice, P3 later.

Bottom line: no P0 blockers. Two P1s in the focus trap (cleanup focus return on navigation; forward-tab from outside trap), one P1 in sanitizer (duplicate `rel` attribute), several P2/P3 polish items. Form validation is sound, sanitizer threat model is OK for trusted CMS.

---

## P0 — must fix before commit

None.

---

## P1 — should fix

### P1-1. header.tsx: focus return after link click navigates away

**File:** `src/components/layout/header.tsx:64-68`

Cleanup runs `toggle?.focus()` unconditionally on every `isMenuOpen` change. Click a mobile-nav link → `setIsMenuOpen(false)` → cleanup fires → after route transition, focus jumps back to the hamburger button on the new page. User expected focus on the new page's content/h1, not the menu button they just left.

Fix sketch: only return focus when close was triggered by Escape or the toggle, not by link activation. Track close source via a `closeReasonRef`, or simply skip focus return if `document.activeElement` is no longer inside `nav` at cleanup time:

```ts
return () => {
  document.removeEventListener("keydown", handleKey);
  document.body.style.overflow = previousOverflow;
  // Only restore focus if menu was closed without a navigation (focus still on a nav link → user pressed Esc/X)
  if (nav?.contains(document.activeElement)) toggle?.focus();
};
```

Caveat: the `Link` click changes `pathname` which causes header to re-render; `activeElement` may already have shifted. Verify in browser before committing the heuristic.

### P1-2. header.tsx: focus can escape forward out of trap

**File:** `src/components/layout/header.tsx:43-61`

The trap handles two cases:
- shift+Tab AND (`active === first` OR active outside nav) → wrap to last.
- non-shift Tab AND `active === last` → wrap to first.

Forward Tab from anywhere **outside** the nav (e.g. focus accidentally landed on body via re-render or user clicked the backdrop area where pointer-events are auto in open state) is NOT trapped. Result: focus moves forward into hidden DOM (page content behind overlay).

Fix sketch:

```ts
if (!e.shiftKey && (active === last || !nav.contains(active))) {
  e.preventDefault();
  first.focus();
}
```

Mirror the shift branch's `!nav.contains(active)` clause.

### P1-3. sanitize-html.ts: duplicate `rel` attribute on `<a target="_blank">`

**File:** `src/lib/sanitize-html.ts:83-85`

If author writes `<a href="x" target="_blank" rel="author">`, output is `<a href="..." target="_blank" rel="author" rel="noopener noreferrer">`. Two `rel` attrs = malformed HTML. Browsers last-wins on the spec-compliant side, but HTML validators flag it and some assistive tools may pick the first.

Fix: strip any existing `rel` from `attrParts` before appending the noopener pair, OR merge tokens.

```ts
if (tag === "a" && attrParts.some((p) => p.startsWith('target="'))) {
  const idx = attrParts.findIndex((p) => p.startsWith('rel="'));
  if (idx >= 0) attrParts.splice(idx, 1);
  attrParts.push('rel="noopener noreferrer"');
}
```

---

## P2 — nice to have

### P2-1. order-form.tsx: radio "payment" leaks into `fieldErrors` keyspace if ever unchecked

**File:** `src/components/checkout/order-form.tsx:97-113`

`validateAll` iterates `form.elements`. The payment radio has `name="payment"` which is **not** in `FieldName`. The `as FieldName` cast bypasses TS. Today `defaultChecked` ensures `validity.valid === true` so the if-branch is skipped. But: if a future change removes `defaultChecked` or adds another payment option without `checked`, `next["payment"]` will be written and persist in state. `renderError("payment")` is never called so it's invisible, but `fieldErrors["payment"]` would block `Object.keys(next).length === 0` from being true → submit silently fails with no visible error, no focused field (`querySelector('[aria-invalid="true"]')` won't match because no field carries `payment` aria binding).

Fix: explicitly skip non-FieldName fields:

```ts
const ALLOWED: ReadonlySet<FieldName> = new Set(["name","phone","email","city","district","address","note"]);
if (!ALLOWED.has(name)) return;
```

Also remove the unused `FieldElement` type alias at line 175 (only used inside `fieldProps`).

### P2-2. order-form.tsx: textarea `note` validates with `fieldProps` despite being optional

**File:** `src/components/checkout/order-form.tsx:344-353`

`note` has no `required`, no `pattern`, just `maxLength={500}`. Wiring `onInvalid`/`onBlur` handlers + `aria-invalid` for an always-valid field is dead weight, but harmless. Could simplify by spreading `fieldProps` only on validated fields. P3 if you don't care.

### P2-3. sanitize-html.ts: nested same-tag closer leaks through

**File:** `src/lib/sanitize-html.ts:48-51`

Input `<style>a<style>b</style>c</style>` → first regex (lazy) consumes `<style>a<style>b</style>` and leaves `c</style>`. Output contains literal `c</style>`. Walker pass at line 61 then matches `</style>` and (since `style` not in ALLOWED) returns `""`. Net: closer is dropped. Actually safe.

But: `<svg><script>x</script></svg>` → script regex grabs `<script>x</script>` → leaves `<svg></svg>`. Walker drops both `<svg>` and `</svg>`. Safe.

Verified by tracing — leaving as P3 note for completeness.

### P2-4. sanitize-html.ts: HTML entity bypass on `<a href>`

**File:** `src/lib/sanitize-html.ts:36-42`

`<a href="javascript&#58;alert(1)">` passes `isSafeUrl` because `&#58;` isn't decoded. Browser decodes at parse time → executes JS.

Threat model says trusted CMS author so defense-in-depth only. Note for follow-up: decode HTML entities in URL values before the safe-URL check, or restrict to a positive allow-list (`http:`, `https:`, `mailto:`, `tel:`, relative `/`, fragment `#`).

### P2-5. order-form.tsx: validation message leak for radio

`vietnameseValidationMessage` reads `FIELD_LABELS[field.name as FieldName] ?? "Trường này"`. For the radio (name="payment") it returns "Trường này chưa hợp lệ." — generic Vietnamese label, won't appear today (radio has `defaultChecked`) but if it ever does it's confusing. Tied to P2-1 fix.

### P2-6. dat-hang/page.tsx: `<aside>` is fine, no change needed

The order summary is a sidebar widget that complements the main checkout task — `<aside>` is acceptable per WCAG/ARIA practice. `<section aria-labelledby>` would also work and may be more semantically accurate (the sidebar IS the order, not tangential to it). Not a regression. Either is defensible. No action needed.

---

## P3 — later

### P3-1. header.tsx: focus trap regenerates `items` array on each Tab keypress

`handleKey` rebuilds `Array.from(nav.querySelectorAll(...))` every keystroke. Cheap (3 links + 1 button) but if the menu grows, prefer caching the list captured at effect setup, with an option to invalidate when DOM mutates. Premature opt; skip.

### P3-2. order-form.tsx: `vietnameseValidationMessage` doesn't cover `rangeUnderflow` / `rangeOverflow` / `stepMismatch`

No numeric/date inputs in the form today. Don't preemptively add cases.

### P3-3. sanitize-html.ts: missing tag (e.g. `<scr<script>ipt>`) — known broken pattern

Browsers don't render `<scr<script>ipt>` as script anyway; the inner `<script>` IS matched and stripped. Verified mentally.

### P3-4. verify-form.tsx: `aria-describedby` clearing is correct

When `error` flips to `null`, the `<p id>` unmounts and `aria-describedby` becomes undefined in the same React render. SR sees consistent state. No race. Implementation is right.

### P3-5. book-card.tsx: `aria-label="${title} — sắp ra mắt"` reads naturally

Vietnamese SR will read "Sách Của Huy — sắp ra mắt" or similar. The visible "Sắp ra mắt" inside the `<div role="img">` is hidden from SR (children of role=img with aria-label are not announced). Slight visual/SR redundancy but no a11y regression vs the old `<Link href="#">`. No change.

---

## Cross-cutting observations

### Body scroll lock restore
`previousOverflow` is captured at effect entry and restored on cleanup. If user opens menu while another modal already locks scroll (`overflow:hidden`), `previousOverflow === "hidden"` is preserved on close. ✓

If the component unmounts while menu open (route change, etc.), cleanup runs and restores `previousOverflow`. ✓

### Order form trust path
- `noValidate` means browser native UI suppressed; React owns errors. ✓
- `validateAll` on submit catches everything. Submit button NOT disabled by validity → user can attempt submit, gets validation. Good, not a P0.
- Server-side enforcement still via `/api/orders` (out of session scope, not reviewed here).
- `payload.customer_phone.replace(/\s+/g, "")` strips internal whitespace before send. `pattern="0[0-9]{9,10}"` doesn't allow spaces, so this is belt-and-suspenders. Fine.

### XSS surface area
The new sanitizer only renders into `<div dangerouslySetInnerHTML>` at `gioi-thieu/page.tsx:93`. No other `dangerouslySetInnerHTML` callers I can see. Single sink, reasonable defense.

```bash
$ grep -rn dangerouslySetInnerHTML src/
src/app/gioi-thieu/page.tsx:93:  dangerouslySetInnerHTML={{ __html: bioHtml }}
```

(Spot-checked. Other rich-text fields like book descriptions at `/sach/[slug]` should also be sanitized — out of session scope per anh's constraints, but worth a Session G ticket.)

---

## Positive observations

- Form a11y rewrite is clean: `noValidate` + per-field state + `aria-invalid` + `role="alert"` is the textbook pattern. Vietnamese error mapping per `validity` flag is the right level of abstraction.
- Step-number `<span>` aria-hidden fix (audit P0-6) is exact: SR now reads "Thông Tin Người Nhận" instead of "1 Thông Tin Người Nhận". Small win, big polish.
- Removing dead `<a href="#">điều khoản dịch vụ</a>` rather than scaffolding a fake T&C page is correct YAGNI.
- BookCard coming-soon path drops the `href="#"` antipattern cleanly. `<div role="img" aria-label>` is the right substitute for a non-interactive cover.
- Sanitizer threat model is documented in source comment — future maintainers won't accidentally trust this for untrusted input.
- Mobile menu hardening covers Escape, Tab/Shift-Tab, body scroll, focus return, aria-hidden, and tabIndex — comprehensive.
- verify-form a11y wiring is minimal and correct.

---

## Metrics

- Files changed: 7 (1 new lib, 1 new test/integration in CMS settings consumer, 5 components/pages)
- Lines reviewed: ~750
- Build/lint: skipped per anh's instruction (already clean)
- New deps: 0 (sanitizer is dep-free per design)
- A11y improvements: 6 distinct (mobile-menu trap, BookCard non-link cover, form errors, step-number SR, aside labelledby, OTP aria-describedby)
- Regressions found: 0 (all P1/P2 are pre-existing-style edge cases or polish, not regressions)

---

## Recommended actions (in priority order)

1. **P1-1** Fix focus-return-on-navigation in header cleanup (~10 LOC)
2. **P1-2** Trap forward Tab from outside nav (~3 LOC)
3. **P1-3** Strip duplicate `rel` before appending noopener (~5 LOC)
4. **P2-1** Add FieldName allow-list guard in `validateAll` (~3 LOC)
5. **P2-4** Note for Session G: HTML-entity decode in `isSafeUrl` (defense-in-depth follow-up)

Total estimated fix wall: 15–25 minutes for P1s, P2-1 included.

---

## Unresolved questions

- **Q1.** Should mobile-menu close-via-link-click move focus to the page's `<main>` or `<h1>`, or just leave focus where the browser puts it after `router.push`? Need anh's call on UX preference. Default Next.js behavior is body/html, which is also imperfect — neither is "correct".
- **Q2.** `gioi-thieu` is the only `dangerouslySetInnerHTML` sink today, but Directus settings may grow more rich-text fields (book descriptions, podcast notes). Should sanitizer be applied at the data-fetch layer (`getSiteSettings`, `getBookBySlug`) rather than at render layer, so callers can't forget? Architectural call — not blocking Session F.
- **Q3.** `<aside>` vs `<section>` for order summary: keep as `<aside>` (current) or switch to `<section aria-labelledby>`? Not a regression either way; comes down to anh's semantic preference.
- **Q4.** Does the mobile-menu focus trap need to handle dynamically-added focusables (e.g. async-loaded auth-status link)? Today nav links are static. If user cart status badge becomes interactive in future, the trap rebuilds items on each Tab so it'd handle it — but the initial `focusables[0]?.focus()` snapshot is stale. Not relevant now; flag if cart becomes a dropdown.

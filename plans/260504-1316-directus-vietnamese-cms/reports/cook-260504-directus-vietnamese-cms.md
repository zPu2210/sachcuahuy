---
type: cook
date: 2026-05-04
slug: directus-vietnamese-cms
status: complete
plan: plans/260504-1316-directus-vietnamese-cms/
---

# Cook Report — Directus Vietnamese CMS

## Summary

Directus CMS now defaults to Vietnamese for editor UX. Huy account language set to `vi-VN`. Existing schema setup script now patches Vietnamese collection labels, field labels/notes, and dropdown display text idempotently.

This CMS metadata patch did not change Directus API keys, collection names, field names, enum values, roles, policies, or permissions.

Note: current worktree has a separate pre-existing checkout diff making `/api/orders` bank-only (`payment_method: "bank"`). That API route change is outside this Vietnamese CMS plan and not part of this patch.

## What Changed

- Updated `scripts/setup-directus-schema.py` directly.
- Added `DEFAULT_LANGUAGE=vi-VN`, `HUY_EMAIL`, optional `FORCE_ADMIN_VI`.
- Added Vietnamese metadata maps for 6 collections and all schema fields.
- Added live read → deep merge → PATCH for collection/field `meta`.
- Added dropdown guard: `choices[].value` must match before dropdown PATCH.
- Refreshed `scripts/directus-snapshots/baseline.yaml`.

## Live Evidence

| Check | Result |
|---|---|
| Env source | Admin email/password from `/opt/directus-sachcuahuy/.env`; patch URL `http://127.0.0.1:8055`; public verify URL `https://cms.sachcuahuy.com` |
| Pre-patch metadata shape | `/collections/books`, `/fields/books/stock_status`, `/fields/orders/order_status` all returned nested `meta` object |
| Settings | `/server/info` → `project.default_language: vi-VN` |
| Huy user | `demtamsutronghuy@gmail.com` → `language: vi-VN` |
| Admin user | `pu.hungphu@gmail.com` → `language: null` (not force-patched) |
| Collection metadata | `books`, `orders`, `customers`, `site_settings`, `pages`, `podcast_episodes` have `vi-VN` translations |
| Dropdown guard | `books.stock_status` text `Còn hàng`, value still `in_stock`; order/payment/page values unchanged |
| Public reads | `books` 200, `pages` 200, `site_settings` 200 |
| Anonymous orders | `POST /items/orders` 403 |
| Static checks | `python3 -m py_compile scripts/setup-directus-schema.py` passed |
| App checks | `npm run lint` passed; `npm run build` passed |

## Handoff

Huy logs in at `https://cms.sachcuahuy.com`. CMS should appear Vietnamese. Huy can work in `books`, `pages`, `podcast_episodes`, and order status/payment fields per existing editor permissions.

`site_settings` remains admin-only unless explicitly changed. Do not change permissions as part of language work.

## Unresolved Questions

- Huy password/reset link and manual login smoke still need human confirmation.
- Keep `site_settings` blocked for Huy? Current recommendation: yes.

---
phase: 2
title: "Live CMS Patch And Verification"
status: completed
priority: P1
filesToModify:
  - scripts/directus-snapshots/baseline.yaml
---

# Phase 2: Live CMS Patch And Verification

## Context Links

- Plan: [plan.md](./plan.md)
- Script from Phase 1: `scripts/setup-directus-schema.py`
- Directus CMS: `https://cms.sachcuahuy.com`

## Overview

Run the patched script against live Directus using existing admin env vars. Verify language/metadata changed and public/API behavior remains intact.

## Requirements

- Use existing admin auth flow: `DIRECTUS_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Include `HUY_EMAIL=demtamsutronghuy@gmail.com`.
- Do not set `FORCE_ADMIN_VI`; admin account language remains user preference/project default.
- Do not expose credentials in terminal output, files, or report.
- Take/update schema snapshot after successful patch.

## Implementation Steps

1. Confirm Directus health:
   ```bash
   curl -sS https://cms.sachcuahuy.com/server/health
   ```
2. Confirm current state:
   ```bash
   curl -sS https://cms.sachcuahuy.com/server/info
   ```
3. Read representative current metadata before full patch:
   - `GET /collections/books`
   - `GET /fields/books/stock_status`
   - `GET /fields/orders/order_status`
4. Run script with env vars from secure source.
5. Verify settings:
   - `project.default_language == "vi-VN"`.
6. Verify user language:
   - Huy user `language == "vi-VN"` when email exists.
7. Verify collection metadata:
   - `books`, `orders`, `customers`, `site_settings`, `pages`, `podcast_episodes`.
8. Verify representative field metadata:
   - `books.title`
   - `books.stock_status`
   - `orders.order_status`
   - `orders.payment_status`
   - `orders.notification_status`
   - `pages.status`
9. Verify dropdown values unchanged:
   - Example: `books.stock_status` choices text `Còn hàng`, value `in_stock`.
10. Smoke public API:
   - `GET /items/books?filter[status][_eq]=published`
   - `GET /items/site_settings`
   - anonymous `POST /items/orders` remains 403.
11. Generate new Directus schema snapshot and update `scripts/directus-snapshots/baseline.yaml`.
12. Run app validation:
   ```bash
   npm run build
   ```

## Todo List

- [x] Health check CMS.
- [x] Read representative metadata shape before full patch.
- [x] Run metadata patch with env vars.
- [x] Verify settings language.
- [x] Verify Huy user language.
- [x] Verify collection translations.
- [x] Verify field/dropdown metadata.
- [x] Verify public API + anonymous order block.
- [x] Refresh Directus snapshot.
- [x] Run `npm run build`.

## Success Criteria

- Live CMS editor-facing metadata is Vietnamese.
- API keys and enum values unchanged.
- Build passes.
- No permission regression.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Live CMS patch partial failure | Script exits on hard failures; rerun idempotently |
| Directus metadata shape differs from assumption | Read representative metadata before patch; use live shape for merge |
| Huy user missing | Warn, do not fail metadata patch |
| Snapshot drift noisy | Review snapshot diff before final |
| Public API regression | Smoke test immediately after patch |

## Security Considerations

- Use secure env source.
- No secrets in command history if avoid inline passwords.
- Do not print tokens/passwords.

## Next Steps

Completed. Proceeded to Phase 3 after live verification passed.

## Unresolved Questions

- Admin env source resolved: `/opt/directus-sachcuahuy/.env` on the Directus VPS. No secrets stored in repo.

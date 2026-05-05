---
type: brainstorm
date: 2026-05-04 13:13
slug: directus-vietnamese-cms-review
status: approved-for-planning
project: sachcuahuy
---

# Directus Vietnamese CMS Review

## Summary

Anh Huy needs Directus CMS default Vietnamese and editor-facing schema in Vietnamese. Best path: Vietnamese Data Studio plus Vietnamese labels/notes/dropdown text, while preserving technical collection keys, field keys, and enum values used by Next.js/API/order flow.

Current deployed CMS says `default_language: "en-US"` via `/server/info`. Local Directus snapshot shows collection/field `translations: null` and dropdown labels like `Draft`, `Published`, `In Stock`, `Out Of Stock`. So this is real gap, not preference polish.

README required by workflow but root `README.md` missing. Context taken from `AGENTS.md`, Directus scripts, Phase 1 plan/cook report, deployed health/info endpoints, and official Directus docs.

## Requirements

- Directus interface defaults to Vietnamese.
- Huy's CMS account uses Vietnamese.
- Collection names are understandable in Vietnamese.
- Field labels/notes are understandable in Vietnamese.
- Dropdown options display Vietnamese labels.
- No breaking changes to frontend, API, permissions, flows, order relay.

## Reviewed Facts

| Area | Finding | Impact |
|---|---|---|
| Directus app language | `default_language` currently `en-US` | Must patch settings to `vi-VN` |
| User language | Existing users can override project default | Must patch Huy user explicitly; optional patch admin user |
| Collection names | All user collection translations null | Need collection metadata translations |
| Field labels | All field translations null | Need field metadata translations |
| Dropdown text | Generated from enum keys by `.title()` | Editor sees English-ish labels |
| API stability | Frontend uses keys like `stock_status`, `published`, `in_stock` | Must not rename keys/values |
| Existing script | `create_field()` skips existing fields | Need patch path for live CMS metadata |

## Approaches

### A. Language Only

Patch `directus_settings.default_language=vi-VN` and user `language=vi-VN`.

Pros:
- Fastest.
- Low risk.

Cons:
- Huy still sees technical schema labels.
- Dropdown labels still confusing.
- Does not meet approved requirement.

Verdict: reject, too shallow.

### B. Vietnamese Metadata Layer

Patch settings/user language, collection translations, field translations/notes, dropdown text. Keep DB/API keys and enum values unchanged.

Pros:
- Meets need.
- Low regression risk.
- Directus-supported path.
- Re-runnable if written idempotently.

Cons:
- Need careful mapping for 80+ fields.
- Need verify live metadata after patch.

Verdict: recommended.

### C. Full Multilingual Content Model

Add `languages`, translation junction collections, localized content API.

Pros:
- Supports future English/Vietnamese public website.

Cons:
- Overkill now.
- More schema/API/frontend work.
- Higher risk before launch.

Verdict: reject for this request.

## Recommended Design

Implement Approach B.

Keep all technical identifiers unchanged:

- Collections stay `books`, `orders`, `customers`, `site_settings`, `pages`, `podcast_episodes`.
- Fields stay `stock_status`, `payment_status`, `order_status`, etc.
- Enum values stay `in_stock`, `published`, `pending`, `bank`, etc.

Patch only Data Studio-facing metadata:

- Project default language: `vi-VN`.
- Huy user language: `vi-VN`.
- Collection translations:
  - `books` -> `Sách`
  - `orders` -> `Đơn hàng`
  - `customers` -> `Khách hàng`
  - `site_settings` -> `Cấu hình website`
  - `pages` -> `Trang nội dung`
  - `podcast_episodes` -> `Tập podcast`
- Field translations and Vietnamese notes.
- Select-dropdown `choices[].text` in Vietnamese.
- Optional: improve display templates and field ordering for editor usability.

## Implementation Considerations

- Update existing `scripts/setup-directus-schema.py` directly, not create enhanced/new script.
- Add helper metadata maps:
  - `COLLECTION_I18N`
  - `FIELD_I18N`
  - `CHOICE_LABELS`
- Add patch helpers:
  - `patch_settings(default_language="vi-VN")`
  - `patch_user_language(email, "vi-VN")`
  - `patch_collection_meta(collection, meta_patch)`
  - `patch_field_meta(collection, field, meta_patch)`
- Change builder functions to accept `label`, `note`, `choices` labels where useful.
- Preserve current idempotent create behavior, but add idempotent metadata patch after create/skip.
- Do not patch schema/default values unless explicitly needed.
- Do not patch permissions.
- Do not touch seeded content unless labels reveal actual content issue.

## Key Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Accidentally rename enum values | High | Patch only `choices[].text`, never `value` |
| Existing fields skipped, no live change | High | Add explicit PATCH calls for existing metadata |
| User default not applied to existing Huy account | Medium | Patch user `language` by email |
| Bad Vietnamese label creates operational ambiguity | Medium | Review labels by workflow: catalog, order, customer, site settings |
| Directus API shape differences for metadata | Medium | First dry-run/read current object, then patch minimal `meta` |
| Admin token exposure | High | Use env vars only; never write secrets into report or repo |

## Validation

- `GET /server/info` shows `project.default_language = "vi-VN"`.
- Huy user `language = "vi-VN"` after patch.
- `GET /collections/{collection}` shows `translations` for `vi-VN`.
- `GET /fields/{collection}/{field}` shows `translations` for `vi-VN`.
- Dropdown metadata shows Vietnamese `choices[].text`, unchanged `choices[].value`.
- Public reads still work:
  - `/items/books?filter[status][_eq]=published`
  - `/items/site_settings`
- Anonymous `POST /items/orders` remains 403.
- `npm run build` passes.

## References

- Directus Project Settings: https://docs.directus.io/user-guide/settings/project-settings
- Directus Collections guide: https://docs.directus.io/app/data-model/collections
- Directus Collections API: https://directus.io/docs/api/collections
- Directus Fields API: https://directus.io/docs/api/fields
- Directus Users API: https://directus.io/docs/api/users
- Directus available languages: https://raw.githubusercontent.com/directus/directus/main/app/src/lang/available-languages.yaml

## Next Steps

1. Create focused implementation plan for Vietnamese CMS metadata patch.
2. Implement metadata patch in existing Directus setup script.
3. Run against live CMS with admin env vars.
4. Verify metadata and public API behavior.
5. Update Phase 1 docs/changelog if implementation changes operational runbook.

## Unresolved Questions

- Huy email still needed if account not yet created.
- Should admin account `pu.hungphu@gmail.com` also be forced to `vi-VN`, or only project default plus Huy?
- Should `site_settings` remain hidden from Huy per existing permission, even if translated?

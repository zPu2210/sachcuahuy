---
type: predict
date: 2026-05-04 13:25
slug: directus-vietnamese-cms
verdict: GO_WITH_CAUTION
plan: plans/260504-1316-directus-vietnamese-cms/
---

# Prediction Report: Directus Vietnamese CMS

## Verdict: CAUTION

Proceed, but tighten metadata patch mechanics before touching live CMS. The architecture is sound: Vietnamese Data Studio + metadata layer, no API/schema contract change. Main risks are not conceptual; they are execution details around Directus metadata shape, read/merge/write behavior, and live verification.

## Agreements

- Keep collection names, field names, and enum values unchanged.
- Patch only editor-facing metadata plus project/user language.
- Existing script must patch live metadata; create-only logic is insufficient.
- Verify through Directus metadata reads and public API smoke tests.
- `site_settings` should remain admin-only for Huy unless separately approved.

## Persona Findings

| Persona | View |
|---|---|
| Architect | Fits current Directus architecture. Metadata layer avoids new i18n content model and keeps frontend stable. |
| Security | Safe if admin creds remain env-only and permissions are untouched. Biggest security risk is accidental permission/schema drift, not language itself. |
| Performance | 80+ metadata PATCH calls are fine for a one-off/admin script. Avoid overengineering batching. |
| UX | Strong win for Huy. Labels must be workflow-based, not literal field-name translations. |
| Devil's Advocate | The plan is right, but exact Directus metadata property shape may differ (`translation` vs `translations`, field translation arrays, options merge semantics). Must introspect live objects before patch. |

## Conflicts & Resolutions

| Topic | Architect | Security | Performance | UX | Devil's Advocate | Resolution |
|---|---|---|---|---|---|---|
| Patch in existing schema script | Good source of truth | OK if no secrets logged | Fine | Invisible to Huy | Could make script too broad | Keep in existing script, but isolate helpers and add clear patch section |
| Metadata merge method | PATCH minimal | Avoid unexpected overwrite | Minimal calls | Preserve UI options | Nested PATCH may replace meta/options | Read current meta, deep-merge locally, PATCH merged meta |
| User language | Patch Huy | Needs exact user by email | One lookup | Needed | Huy user may not exist | Warn if `HUY_EMAIL` missing/not found; do not fail whole patch |
| Admin language | Optional | Low risk | No impact | Maybe helpful for anh | Could annoy admin preference | Default: project `vi-VN`; force admin only with explicit env flag |
| Dropdown label mapping | Must preserve values | Critical | No impact | Critical UX | Easy to mistranslate states | Add static choice map and assert all values unchanged before live run |
| Snapshot update | Documents truth | No secrets | Fine | No impact | Snapshot diff may be noisy | Refresh after verified patch; review diff before final |

## Risk Summary

| Risk | Severity | Mitigation |
|---|---:|---|
| Enum values accidentally changed | High | Add assertion comparing old/new `choices[].value`; fail before PATCH if mismatch |
| Metadata PATCH overwrites existing field options | High | Read field first, merge nested `meta.options`, then PATCH merged object |
| Wrong Directus translation property shape | Medium | Use live GET response as source of truth; verify with representative fields before broad patch |
| Huy still sees English due user override | Medium | Patch Huy user language by email; warn if missing |
| Labels are Vietnamese but operationally unclear | Medium | Use workflow labels: `Trạng thái đơn`, `Thanh toán`, `Thông báo Zalo`, not literal machine translation |
| Admin credentials leak | High | Env-only; never inline password/token in shell commands or reports |
| Site settings permission accidentally changed | High | Do not call permissions script; include permissions smoke test |
| Partial live patch | Medium | Idempotent script, clear logs, rerun safe |

## Required Plan Adjustments

1. Add acceptance gate in Phase 1: read live/current field metadata shape before deciding patch payload shape.
2. Add read-merge-write rule for field `meta`, especially `options.choices`.
3. Add enum-value preservation assertion before any dropdown PATCH.
4. Add sample verification for both collection and field translations before patching all fields, or at least immediately after first collection.
5. Make Huy user patch non-blocking unless user explicitly provides email and requires it as ship blocker.
6. Keep admin language opt-in via env flag, not default forced.

## GO Conditions

- `python3 -m py_compile scripts/setup-directus-schema.py` passes.
- Static review confirms only settings/user language and collection/field `meta` are patched.
- Script prints no secrets.
- Dry/current metadata read confirms accepted property names/shape.
- Live smoke after patch confirms:
  - `/server/info` default language `vi-VN`
  - dropdown text Vietnamese, values unchanged
  - public catalog reads still 200
  - anonymous orders remain 403
  - `npm run build` passes

## Sources

- Directus Settings API: https://directus.io/docs/api/settings
- Directus Collections API: https://directus.io/docs/api/collections
- Directus Fields API: https://directus.io/docs/api/fields
- Directus Users API: https://directus.io/docs/api/users
- Directus collection naming translations guide: https://directus.io/docs/guides/data-model/collections
- Directus translation strings/user language guide: https://directus.io/docs/guides/content/translations

## Unresolved Questions

- Admin env source for implementation run.

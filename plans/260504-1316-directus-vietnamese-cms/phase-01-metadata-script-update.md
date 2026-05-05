---
phase: 1
title: "Metadata Script Update"
status: completed
priority: P1
filesToModify:
  - scripts/setup-directus-schema.py
---

# Phase 1: Metadata Script Update

## Context Links

- Plan: [plan.md](./plan.md)
- Brainstorm: [brainstorm report](../reports/brainstorm-260504-1313-directus-vietnamese-cms-review.md)
- Current script: `scripts/setup-directus-schema.py`
- Current snapshot: `scripts/directus-snapshots/baseline.yaml`

## Overview

Update existing Directus setup script so it can patch editor-facing Vietnamese metadata on both new and already-existing CMS fields. This phase does not execute against production yet.

## Requirements

- Add Vietnamese labels for collections, fields, notes, and dropdown display text.
- Keep collection keys, field keys, enum values, schema defaults, and permissions unchanged.
- Make script idempotent: safe to re-run.
- Patch existing Directus metadata, not only newly-created fields.
- Read current Directus collection/field metadata and deep-merge locally before PATCH.
- Assert dropdown `choices[].value` stays identical before patching labels.
- Keep implementation concise; split only if file becomes hard to maintain.

## Architecture

```
setup-directus-schema.py
├── creates missing collections/fields
├── patches collection meta translations/notes
├── patches field meta translations/notes/options
├── patches project default_language=vi-VN
└── optionally patches user language by env email
```

## Implementation Steps

1. Add constants:
   - `DEFAULT_LANGUAGE = "vi-VN"`
   - `HUY_EMAIL = os.environ.get("HUY_EMAIL", "").strip()`; implementation run value: `demtamsutronghuy@gmail.com`
   - optional `FORCE_ADMIN_VI = os.environ.get("FORCE_ADMIN_VI") == "1"`; do not set for this run
2. Add metadata maps:
   - `COLLECTION_TRANSLATIONS`
   - `FIELD_TRANSLATIONS`
   - `FIELD_NOTES_VI`
   - `DROPDOWN_LABELS`
3. Add helpers:
   - `vi_translation(label)` returns Directus translation array format.
   - `deep_merge_meta(current, patch)` preserves existing `interface`, `options`, `special`, display settings.
   - `assert_choice_values_unchanged(current_choices, next_choices)`.
   - `get_collection(token, collection)` and `get_field(token, collection, field)` for live metadata shape.
   - `patch_settings_language(token)`.
   - `patch_user_language_by_email(token, email)`.
   - `patch_collection_meta(token, collection, meta)`.
   - `patch_field_meta(token, collection, field, meta)`.
4. Update `f_dropdown()` to accept Vietnamese label map while preserving each `choice.value`.
5. After each collection create/skip, read collection, merge metadata, then patch collection metadata.
6. After each field create/skip, read field, merge metadata, assert dropdown values, then patch field metadata.
7. Keep all API requests minimal PATCH payloads.
8. Add clear console output for `[patch]`, `[skip]`, `[warn]`.

## Todo List

- [x] Add Vietnamese metadata maps.
- [x] Add patch request helpers.
- [x] Add live metadata read + deep-merge helpers.
- [x] Add dropdown value preservation assertion.
- [x] Patch settings `default_language`.
- [x] Patch user language by email.
- [x] Patch collection translations and notes.
- [x] Patch field translations, notes, and dropdown labels.
- [x] Verify script syntax.

## Success Criteria

- Script compiles with `python3 -m py_compile scripts/setup-directus-schema.py`.
- Static review confirms no enum `value` changes.
- Static review confirms field `meta.options` is merged, not overwritten.
- Script remains safe when fields already exist.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Accidentally mutate schema | PATCH only `meta` and settings/user language |
| Dropdown values changed | Preserve `value`, patch only `text` |
| Nested metadata overwritten | Read current object, deep-merge patch, then PATCH merged meta |
| Field skips prevent patch | Patch metadata after create/skip |
| Secrets leak | Read admin creds from env only |

## Security Considerations

- Do not log admin password/token.
- Do not write secrets to repo.
- Do not modify role/policy permissions in this phase.

## Next Steps

Completed. Proceeded to Phase 2 after script syntax and static review passed.

## Unresolved Questions

- None for this phase.

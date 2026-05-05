---
title: "Directus Vietnamese CMS"
created: 2026-05-04 13:16
status: completed
priority: P1
mode: fast
relatedPlan: plans/260502-2024-sachcuahuy-production-launch/
brainstorm: plans/reports/brainstorm-260504-1313-directus-vietnamese-cms-review.md
predict: plans/260504-1316-directus-vietnamese-cms/reports/predict-260504-1325-directus-vietnamese-cms.md
---

# Plan: Directus Vietnamese CMS

## Overview

Make Directus CMS usable for anh Huy in Vietnamese: Data Studio default language, user language, collection labels, field labels/notes, dropdown labels. Preserve all technical keys/values used by Next.js, Directus API, permissions, and order relay.

Root `README.md` missing; context from `AGENTS.md`, Directus scripts, Phase 1 plan/report, deployed `/server/info`, and official Directus docs.

## Phases

| Phase | Status | File | Purpose |
|---|---|---|---|
| 1 | Completed | [phase-01-metadata-script-update.md](./phase-01-metadata-script-update.md) | Update existing schema script with idempotent Vietnamese metadata patching |
| 2 | Completed | [phase-02-live-cms-patch-and-verification.md](./phase-02-live-cms-patch-and-verification.md) | Run patch against live Directus and verify no API regression |
| 3 | Completed | [phase-03-docs-and-handoff.md](./phase-03-docs-and-handoff.md) | Document operational changes and Huy onboarding notes |

## Dependencies

- Directus 11 live at `https://cms.sachcuahuy.com`.
- Admin credentials/token available through existing secret flow, not stored in repo.
- Huy email for language patch: `demtamsutronghuy@gmail.com`.
- Do not force admin account language to `vi-VN`; project default is enough.

## Non-Negotiables

- Do not rename collections.
- Do not rename fields.
- Do not change enum `value`.
- Do not weaken permissions.
- Do not create a parallel/enhanced script.
- Use existing `scripts/setup-directus-schema.py` as source of truth.

## Success Criteria

- [x] `/server/info` shows `project.default_language = "vi-VN"`.
- [x] Huy user language is `vi-VN` when email is known.
- [x] Collection/field translations present for `vi-VN`.
- [x] Dropdown text Vietnamese, values unchanged.
- [x] Script reads current Directus metadata shape and deep-merges `meta` before PATCH.
- [x] Script asserts dropdown `choices[].value` unchanged before any live dropdown PATCH.
- [x] Anonymous `orders` access still blocked.
- [x] Public `books`, `pages`, `site_settings` reads still work.
- [x] `npm run build` passes.

## References

- Brainstorm: `plans/reports/brainstorm-260504-1313-directus-vietnamese-cms-review.md`
- Phase 1 Directus: `plans/260502-2024-sachcuahuy-production-launch/phase-01-directus-setup.md`
- Phase 1 cook report: `plans/reports/cook-260503-1334-phase-01-directus-setup.md`
- Prediction report: `plans/260504-1316-directus-vietnamese-cms/reports/predict-260504-1325-directus-vietnamese-cms.md`
- Cook report: `plans/260504-1316-directus-vietnamese-cms/reports/cook-260504-directus-vietnamese-cms.md`
- Directus Project Settings: https://docs.directus.io/user-guide/settings/project-settings
- Directus Collections API: https://directus.io/docs/api/collections
- Directus Fields API: https://directus.io/docs/api/fields
- Directus Users API: https://directus.io/docs/api/users

## Open Questions

- Keep `site_settings` blocked for Huy? Recommendation: yes.
- Huy password/reset link and manual login smoke still need human confirmation.

## Code Review Summary

### Scope
- Files requested: `scripts/setup-directus-schema.py`, `scripts/directus-snapshots/baseline.yaml`, plan/report docs.
- Scout-expanded file: `scripts/setup-directus-permissions.py` because current diff touches permission grants.
- Focus: Directus Vietnamese CMS safety/regression review.
- Scout findings: enum consumers depend on values, not labels; one permissions diff outside requested files weakens relay role access.

### Re-review Update

2026-05-04 re-review: permission concern resolved. The relay `books`/`site_settings` read grants were removed, and `git diff -- scripts/setup-directus-permissions.py` is now empty. No permission weakening remains in this patch.

### Findings

#### Resolved
- `scripts/setup-directus-permissions.py:209-210` grants `relay-notifier` new read access to `books` and `site_settings`. This is outside the Vietnamese metadata goal and violates the acceptance criterion "Must NOT weaken permissions." `site_settings` includes bank/contact fields, so a relay token now has broader read scope if this script is run.
  - Fixed: relay read grants and constants removed from current diff.

### Requested Files Assessment
- No blocking issues found in `scripts/setup-directus-schema.py`.
- No non-meta snapshot drift found in `scripts/directus-snapshots/baseline.yaml`.
- Dropdown enum values unchanged in both script constants and snapshot:
  - `books.stock_status`: `in_stock`, `out_of_stock`
  - `books.status`: `draft`, `published`, `archived`
  - `orders.payment_method`: `cod`, `bank`
  - `orders.payment_status`: `pending`, `paid`, `refunded`, `cancelled`
  - `orders.order_status`: `new`, `confirmed`, `shipped`, `delivered`, `cancelled`
  - `orders.notification_status`: `pending`, `queued`, `sent`, `failed`, `retrying`
  - page/podcast status: `draft`, `published`

### Checklist
- Concurrency: no shared mutable runtime state introduced in schema script.
- Error boundaries: CLI hard failures propagate with non-zero exit; live patch helper exits on non-2xx metadata/settings/user PATCH.
- API contracts: collection/field keys and enum values preserved.
- Backwards compatibility: snapshot non-meta content unchanged.
- Input validation: user email query URL-encoded; external env still trusted as operator input.
- Auth/authz: requested files do not modify permissions; scout-expanded permissions file does.
- N+1/query efficiency: metadata patch uses bounded per-field Directus requests; acceptable for setup script.
- Data leaks: no passwords/tokens written; report includes operational emails already present in plan.

### Verification Run
- `python3 -m py_compile scripts/setup-directus-schema.py` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Static AST compare: status constants unchanged.
- Static YAML compare: snapshot with all `meta` stripped is unchanged.

### Residual Risks
- I did not rerun live Directus verification because admin credentials were not available in this review session; I relied on the provided live evidence for `/server/info`, public reads, and anonymous orders 403.
- `FORCE_ADMIN_VI=1` remains an explicit escape hatch; verification shows it was unset for the live run.

### Unresolved Questions
- Is the relay-notifier permission expansion intentional for a separate Meow sync task? If yes, it needs separate approval and review; it should not ship as part of this Vietnamese CMS patch.

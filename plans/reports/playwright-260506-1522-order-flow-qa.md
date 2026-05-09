# Playwright Order Flow QA — 260506-1522

## Summary

- Target: `https://sachcuahuy.com`
- Browsers: Chromium + WebKit
- Result: 18/18 passed
- Production order flow stable across desktop, mobile viewport, validation, duplicate-submit, and recoverable server-error scenarios.

## Commands

```bash
REUSE_HCM_TOKEN=674cvrh9bvxfjyvp REUSE_HCM_CODE=SCH-260506-4874 \
REUSE_HN_TOKEN=7ssfccd7nqv7vxkz REUSE_HN_CODE=SCH-260506-5848 \
REUSE_MOBILE_TOKEN=7af94x295kepq2w6 REUSE_MOBILE_CODE=SCH-260506-7004 \
BASE_URL=https://sachcuahuy.com NODE_PATH="$(npm root -g)" \
npx playwright test --config=/tmp/sachcuahuy-playwright.config.ts

REUSE_HCM_TOKEN=674cvrh9bvxfjyvp REUSE_HCM_CODE=SCH-260506-4874 \
REUSE_HN_TOKEN=7ssfccd7nqv7vxkz REUSE_HN_CODE=SCH-260506-5848 \
REUSE_MOBILE_TOKEN=7af94x295kepq2w6 REUSE_MOBILE_CODE=SCH-260506-7004 \
BASE_URL=https://sachcuahuy.com NODE_PATH="$(npm root -g)" \
npx playwright test --config=/tmp/sachcuahuy-playwright.config.ts --browser=webkit
```

## Scenarios

| # | Scenario | Chromium | WebKit |
|---|---|---|---|
| 1 | Desktop HCM, email, confirmation verify | Pass | Pass |
| 2 | Desktop Hanoi, no email, confirmation verify | Pass | Pass |
| 3 | Mobile other province, paid shipping, confirmation verify | Pass | Pass |
| 4 | Invalid phone blocked before API submit | Pass | Pass |
| 5 | Invalid email blocked before API submit | Pass | Pass |
| 6 | Required fields blocked before API submit | Pass | Pass |
| 7 | Double submit sends one order request | Pass | Pass |
| 8 | Server 500 shows recoverable message | Pass | Pass |
| 9 | `qty=0` and `qty=11` clamp to 1 and 10 | Pass | Pass |

## Test Orders

Delete these QA orders from Directus after review:

- `SCH-260506-4874` — HCM, `199.000đ`, token `674cvrh9bvxfjyvp`
- `SCH-260506-5848` — Hanoi, `99.000đ`, token `7ssfccd7nqv7vxkz`
- `SCH-260506-7004` — other province, `224.000đ`, token `7af94x295kepq2w6`

Earlier debug order also exists:

- `SCH-260506-4510` — debug smoke order

## Evidence

- JSON report: `/tmp/sachcuahuy-playwright-artifacts/order-flow-report.json`
- Desktop screenshot: `/tmp/sachcuahuy-playwright-artifacts/hcm-confirmed.png`
- Mobile screenshot: `/tmp/sachcuahuy-playwright-artifacts/mobile-other-confirmed.png`

## Notes

- Initial harness failures were Playwright strict locator issues and expected Next.js RSC aborts, not app failures.
- Mobile confirmation input was retested with user-like interaction: scroll, tap, type digits. Chromium and WebKit passed.
- Wrong last-4 verification returns expected 401; final correct verification returns 200 and reveals delivery info.

## Unresolved Questions

- Should QA/test orders be deleted now or kept for Huy/admin inspection?

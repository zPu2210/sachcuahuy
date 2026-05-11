/**
 * Capture full-page screenshots of all production routes at desktop + mobile viewports.
 * Output: docs/screen-snapshots/{route-slug}-{viewport}.png
 *
 * Usage: npm run capture:snapshots
 * Re-runs are idempotent (overwrite).
 */
const { chromium, devices } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.SNAPSHOT_BASE_URL || "https://sachcuahuy.com";
const BOOK_SLUG = process.env.SNAPSHOT_BOOK_SLUG || "mien-nam-cua-huy";
const OUT_DIR = path.resolve(__dirname, "..", "docs", "screen-snapshots");

const ROUTES = [
  { slug: "home", path: "/" },
  { slug: "sach-catalog", path: "/sach" },
  { slug: "sach-detail", path: `/sach/${BOOK_SLUG}` },
  { slug: "gioi-thieu", path: "/gioi-thieu" },
  { slug: "podcast", path: "/podcast" },
  { slug: "dat-hang", path: `/dat-hang?slug=${BOOK_SLUG}` },
  { slug: "xac-nhan", path: "/xac-nhan/invalid-token-snapshot" },
];

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", ...devices["iPhone 12 Pro"] },
];

const ANIM_KILL_CSS = `
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
    transition-delay: 0ms !important;
  }
`;

async function capture() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const ts = Date.now();
  const results = [];

  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: vp.viewport,
        userAgent: vp.userAgent,
        deviceScaleFactor: vp.deviceScaleFactor || 1,
        isMobile: vp.isMobile || false,
        hasTouch: vp.hasTouch || false,
      });
      const page = await ctx.newPage();
      const sep = route.path.includes("?") ? "&" : "?";
      const url = `${BASE_URL}${route.path}${sep}_snapshot=${ts}`;
      const file = path.join(OUT_DIR, `${route.slug}-${vp.name}.png`);
      const start = Date.now();
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        await page.addStyleTag({ content: ANIM_KILL_CSS });
        await page.waitForTimeout(500);
        await page.screenshot({ path: file, fullPage: true });
        const ms = Date.now() - start;
        const size = fs.statSync(file).size;
        console.log(`[OK]   ${route.slug}-${vp.name}  ${ms}ms  ${(size / 1024).toFixed(0)}KB`);
        results.push({ route: route.slug, vp: vp.name, ok: true });
      } catch (err) {
        console.error(`[FAIL] ${route.slug}-${vp.name}  ${err.message}`);
        results.push({ route: route.slug, vp: vp.name, ok: false, error: err.message });
      } finally {
        await ctx.close();
      }
    }
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} captures succeeded`);
  if (failed.length > 0) process.exit(1);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});

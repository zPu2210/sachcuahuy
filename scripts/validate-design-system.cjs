/**
 * Validate the design system artifacts produced by the
 * 260508-0839-design-system-extraction plan.
 *
 * Checks:
 *   1. assets/design-tokens.json parses + has required top-level categories
 *   2. Every leaf token has $value and $type
 *   3. Markdown link integrity for design-system.md, component-inventory.md,
 *      docs/design/README.md (relative paths only)
 *   4. Vietnamese glyph check passes (scripts/check-vietnamese-glyphs.cjs)
 *   5. Component count ≥ 10 in component-inventory.md (### headings)
 *   6. Pattern count == 4 in design-system.md (### Pattern: headings)
 *   7. All 14 expected screenshot PNGs exist
 *
 * Exit codes: 0 pass, 1 any failure.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const TOKENS = path.join(ROOT, "assets", "design-tokens.json");
const DS_MD = path.join(ROOT, "docs", "design-system.md");
const CI_MD = path.join(ROOT, "docs", "component-inventory.md");
const INDEX_MD = path.join(ROOT, "docs", "design", "README.md");
const SNAPS = path.join(ROOT, "docs", "screen-snapshots");

const REQUIRED_CATEGORIES = ["color", "fontFamily", "shadow", "motion"];
const EXPECTED_SNAPSHOTS = [
  "home-desktop.png", "home-mobile.png",
  "sach-catalog-desktop.png", "sach-catalog-mobile.png",
  "sach-detail-desktop.png", "sach-detail-mobile.png",
  "gioi-thieu-desktop.png", "gioi-thieu-mobile.png",
  "podcast-desktop.png", "podcast-mobile.png",
  "dat-hang-desktop.png", "dat-hang-mobile.png",
  "xac-nhan-desktop.png", "xac-nhan-mobile.png",
];

const results = [];
function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail });
    console.log(`[PASS] ${name}${detail ? "  " + detail : ""}`);
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
    console.error(`[FAIL] ${name}  ${e.message}`);
  }
}

function walkTokens(node, pathParts, leaves) {
  if (node && typeof node === "object" && "$value" in node) {
    leaves.push({ path: pathParts.join("."), node });
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      walkTokens(v, [...pathParts, k], leaves);
    }
  }
}

check("design-tokens.json parses", () => {
  JSON.parse(fs.readFileSync(TOKENS, "utf8"));
  return "ok";
});

check("design-tokens.json has required categories", () => {
  const json = JSON.parse(fs.readFileSync(TOKENS, "utf8"));
  const missing = REQUIRED_CATEGORIES.filter((k) => !(k in json));
  if (missing.length) throw new Error(`missing: ${missing.join(", ")}`);
  return `categories present: ${REQUIRED_CATEGORIES.join(", ")}`;
});

check("every leaf token has $value and $type", () => {
  const json = JSON.parse(fs.readFileSync(TOKENS, "utf8"));
  const leaves = [];
  walkTokens(json, [], leaves);
  const bad = leaves.filter(
    (l) => !("$value" in l.node) || !("$type" in l.node),
  );
  if (bad.length) {
    throw new Error(
      `${bad.length} leaf(s) missing $value/$type: ${bad.slice(0, 3).map((b) => b.path).join(", ")}${bad.length > 3 ? "..." : ""}`,
    );
  }
  return `${leaves.length} leaves valid`;
});

function checkLinks(mdPath, label) {
  const text = fs.readFileSync(mdPath, "utf8");
  const dir = path.dirname(mdPath);
  // Match [text](path) — exclude images (handled separately) is not needed
  // since same syntax. Strip the ![ prefix marker by keeping all matches.
  const linkRe = /\]\(([^)]+)\)/g;
  const broken = [];
  let m;
  while ((m = linkRe.exec(text))) {
    let target = m[1].trim();
    // Skip URLs and pure anchors
    if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
    // Strip trailing anchor
    target = target.split("#")[0];
    if (!target) continue;
    const abs = path.resolve(dir, target);
    if (!fs.existsSync(abs)) broken.push(target);
  }
  if (broken.length) {
    throw new Error(`${broken.length} broken link(s) in ${label}: ${broken.slice(0, 5).join(", ")}`);
  }
  return `${label}: all relative links resolve`;
}

check("design-system.md links", () => checkLinks(DS_MD, "design-system.md"));
check("component-inventory.md links", () =>
  checkLinks(CI_MD, "component-inventory.md"),
);

check("Vietnamese glyph script passes", () => {
  execFileSync("node", [path.join(ROOT, "scripts", "check-vietnamese-glyphs.cjs")], {
    stdio: "pipe",
  });
  return "exit 0";
});

check("component-inventory.md ≥10 components", () => {
  const text = fs.readFileSync(CI_MD, "utf8");
  // ### headings under domain sections — count h3s
  const count = (text.match(/^### /gm) || []).length;
  if (count < 10) throw new Error(`only ${count} h3 entries`);
  return `${count} h3 entries`;
});

check("design-system.md has exactly 4 patterns", () => {
  const text = fs.readFileSync(DS_MD, "utf8");
  const count = (text.match(/^### Pattern: /gm) || []).length;
  if (count !== 4) throw new Error(`found ${count} pattern entries`);
  return `4 patterns`;
});

check("all 14 snapshot PNGs exist", () => {
  const missing = EXPECTED_SNAPSHOTS.filter(
    (f) => !fs.existsSync(path.join(SNAPS, f)),
  );
  if (missing.length) throw new Error(`missing: ${missing.join(", ")}`);
  return `14/14 PNGs present`;
});

check("docs/design/README.md exists", () => {
  if (!fs.existsSync(INDEX_MD)) throw new Error("file not found");
  return "exists";
});

check("docs/design/README.md links", () => checkLinks(INDEX_MD, "design/README.md"));

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed`,
);
if (failed.length) process.exit(1);

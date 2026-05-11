#!/usr/bin/env node
/**
 * Vietnamese glyph coverage check.
 *
 * Strategy: site uses next/font/google with `subsets: ["latin", "vietnamese"]`
 * for all three families (Inter, Cormorant Garamond, Dancing Script). Google
 * Fonts serves Vietnamese-subset WOFF2 files only when that subset is declared.
 *
 * This script verifies the declaration is present in src/app/layout.tsx for
 * every font import — that is the production-relevant gate. If the subset
 * disappears in a future edit, Vietnamese diacritics fall back to system
 * fonts and the check fails loudly.
 *
 * Exit 0 = all fonts declare `vietnamese` subset.
 * Exit 1 = at least one font is missing the subset; prints the offender.
 */
const fs = require("fs");
const path = require("path");

const LAYOUT = path.resolve(__dirname, "..", "src/app/layout.tsx");
const FONTS = ["Inter", "Cormorant_Garamond", "Dancing_Script"];

const REQUIRED_GLYPHS = "ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ";

function main() {
  if (!fs.existsSync(LAYOUT)) {
    console.error(`[FAIL] layout file not found: ${LAYOUT}`);
    process.exit(1);
  }
  const src = fs.readFileSync(LAYOUT, "utf8");
  const failures = [];

  for (const fam of FONTS) {
    // Match: <Family>({ ... subsets: [..."vietnamese"...] ... })
    const re = new RegExp(`${fam}\\s*\\(\\s*\\{[\\s\\S]*?subsets\\s*:\\s*\\[([^\\]]+)\\]`, "m");
    const m = src.match(re);
    if (!m) {
      failures.push(`${fam}: import or subsets array not found`);
      continue;
    }
    if (!/["']vietnamese["']/.test(m[1])) {
      failures.push(`${fam}: subsets array missing "vietnamese" → diacritics will fall back`);
    }
  }

  console.log(`Required diacritic glyphs (${REQUIRED_GLYPHS.length} chars): ${REQUIRED_GLYPHS}`);
  console.log("");

  if (failures.length) {
    console.error("[FAIL] Vietnamese glyph coverage gap:");
    failures.forEach((f) => console.error(`  - ${f}`));
    console.error("\nFix: add `vietnamese` to the subsets array in src/app/layout.tsx for the listed font(s).");
    process.exit(1);
  }

  console.log("[PASS] All fonts declare `vietnamese` subset in src/app/layout.tsx:");
  FONTS.forEach((f) => console.log(`  - ${f}: ok`));
  console.log("\nVisual confirmation still recommended via screenshots (Phase 4).");
  process.exit(0);
}

main();

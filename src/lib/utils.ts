import { type ClassValue, clsx } from "clsx";

// Simple cn utility without tailwind-merge for now
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format price to Vietnamese format
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `SCH-${dateStr}-${random}`;
}

// Convert Directus rich-text (HTML string) to plain-text paragraphs.
// Preserves paragraph breaks from <p>/<br>, strips other tags, decodes named
// + numeric (decimal/hex) HTML entities. Inline formatting is dropped.
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  // Vietnamese/Latin diacritics (HTML5 named entities)
  aacute: "á", agrave: "à", atilde: "ã", acirc: "â", abreve: "ă",
  eacute: "é", egrave: "è", ecirc: "ê",
  iacute: "í", igrave: "ì",
  oacute: "ó", ograve: "ò", otilde: "õ", ocirc: "ô", ohorn: "ơ",
  uacute: "ú", ugrave: "ù", uhorn: "ư",
  yacute: "ý",
  dstrok: "đ", Dstrok: "Đ",
  Aacute: "Á", Agrave: "À", Atilde: "Ã", Acirc: "Â", Abreve: "Ă",
  Eacute: "É", Egrave: "È", Ecirc: "Ê",
  Iacute: "Í", Igrave: "Ì",
  Oacute: "Ó", Ograve: "Ò", Otilde: "Õ", Ocirc: "Ô", Ohorn: "Ơ",
  Uacute: "Ú", Ugrave: "Ù", Uhorn: "Ư",
  Yacute: "Ý",
};

function decodeCodePoint(code: number, fallback: string): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return fallback;
  try {
    return String.fromCodePoint(code);
  } catch {
    return fallback;
  }
}

export function htmlToParagraphs(html: string): string[] {
  if (!html) return [];

  // Decode entities FIRST in loop to handle double-encoding (e.g., &amp;oacute;)
  let text = html;
  let prev = "";
  while (prev !== text) {
    prev = text;
    text = text
      .replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
        decodeCodePoint(parseInt(hex, 16), match),
      )
      .replace(/&#(\d+);/g, (match, dec) =>
        decodeCodePoint(Number(dec), match),
      )
      .replace(/&([a-zA-Z]+);/g, (match, name) =>
        Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name)
          ? NAMED_ENTITIES[name]
          : match,
      );
  }

  // THEN strip tags (handles double-escaped &lt;p&gt; becoming <p> after decode)
  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");

  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

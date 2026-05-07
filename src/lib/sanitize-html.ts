// Minimal allow-list HTML sanitizer for Directus rich-text fields.
// Threat model: trusted CMS author content, defense-in-depth only.
// For untrusted user input, use a vetted library like sanitize-html or DOMPurify.

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "code",
  "pre",
  "hr",
]);

const ALLOWED_ATTRS_BY_TAG: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
};

const URL_ATTRS = new Set(["href", "src"]);

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
    return false;
  }
  return true;
}

export function sanitizeHtml(input: string): string {
  if (!input) return "";

  // Strip dangerous block elements (script/style/iframe/object/embed/form) including content.
  let cleaned = input.replace(
    /<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)[^>]*>[\s\S]*?<\/\1>/gi,
    "",
  );
  // Self-closing variants of the same tags (e.g. <link>, <meta>, <iframe />).
  cleaned = cleaned.replace(
    /<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)[^>]*\/?>/gi,
    "",
  );
  // Strip HTML comments (could hide conditional IE attacks).
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // Walk tags, drop disallowed ones and unsafe attributes.
  return cleaned.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    const isClosing = match.startsWith("</");
    if (isClosing) return `</${tag}>`;

    const allowedAttrs = ALLOWED_ATTRS_BY_TAG[tag];
    if (!allowedAttrs) return `<${tag}>`;

    const attrParts: string[] = [];
    const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const name = attrMatch[1].toLowerCase();
      if (name.startsWith("on")) continue;
      if (!allowedAttrs.has(name)) continue;
      const value = attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? "";
      if (URL_ATTRS.has(name) && !isSafeUrl(value)) continue;
      const escaped = value.replace(/"/g, "&quot;");
      attrParts.push(`${name}="${escaped}"`);
    }

    // Force rel="noopener noreferrer" on links opening a new tab. Drop any
    // author-supplied rel first to avoid duplicate attributes.
    if (tag === "a" && attrParts.some((p) => p.startsWith('target="'))) {
      const filtered = attrParts.filter((p) => !p.startsWith('rel="'));
      filtered.push('rel="noopener noreferrer"');
      return `<${tag} ${filtered.join(" ")}>`;
    }

    return attrParts.length > 0 ? `<${tag} ${attrParts.join(" ")}>` : `<${tag}>`;
  });
}

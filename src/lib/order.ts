import crypto from "node:crypto";
import { customAlphabet } from "nanoid";
import type { SiteSettings } from "./types-directus";

// Token alphabet: no I/L/O/0/1 to avoid visual ambiguity. 16 chars = ~10^25 entropy.
const ORDER_TOKEN_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const generateNanoid = customAlphabet(ORDER_TOKEN_ALPHABET, 16);

// Human-readable code for admin UI; not used in URLs.
export function generateOrderCode(): string {
  const d = new Date();
  const yymmdd = d.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SCH-${yymmdd}-${rand}`;
}

// Opaque token for public confirmation URL.
export function generateOrderToken(): string {
  return generateNanoid();
}

export function isValidOrderToken(token: string): boolean {
  if (!token || token.length !== 16) return false;
  const re = new RegExp(`^[${ORDER_TOKEN_ALPHABET}]{16}$`);
  return re.test(token);
}

export function calcShipping(city: string, settings: SiteSettings): number {
  const free = settings.shipping_free_cities ?? [];
  if (free.includes(city.toLowerCase())) return 0;
  return settings.shipping_flat_fee;
}

// Bank QR memo is always the order_code — no template substitution.
// {name}/{phone} placeholders in `site_settings.memo_format` are intentionally
// ignored: they would leak PII into the public QR URL (`addInfo` query param).
// Anh reconciles bank statements by order_code lookup in admin.
export function bankMemo(orderCode: string): string {
  return orderCode;
}

// Timing-safe compare of phone last-4 digits.
export function verifyPhoneLast4(stored: string, provided: string): boolean {
  const a = stored.slice(-4);
  const b = provided.trim();
  if (a.length !== 4 || b.length !== 4) return false;
  let mismatch = 0;
  for (let i = 0; i < 4; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

// HMAC sign + verify for short-lived PII reveal cookie.
function getCookieSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("COOKIE_SECRET must be set (>=32 chars)");
  }
  return secret;
}

export function signPiiCookie(token: string): string {
  return crypto
    .createHmac("sha256", getCookieSecret())
    .update(token)
    .digest("hex");
}

export function verifyPiiCookie(token: string, signature: string): boolean {
  if (!signature) return false;
  let expected: string;
  try {
    expected = signPiiCookie(token);
  } catch {
    return false;
  }
  if (expected.length !== signature.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}

export const PII_COOKIE_MAX_AGE_SECONDS = 600; // 10 min
export const VERIFY_LOCK_THRESHOLD = 5;
export const VERIFY_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 min

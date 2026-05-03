import { createDirectus, rest, staticToken } from "@directus/sdk";
import type { Schema } from "./types-directus";

const directusUrl = process.env.DIRECTUS_URL;
if (!directusUrl) {
  throw new Error("DIRECTUS_URL is not set");
}

// Public client — anonymous reads (Phase 1 grants public read on books, pages, site_settings).
export const directus = createDirectus<Schema>(directusUrl).with(rest());

// Server-only client for orders (uses api-orders role token; never expose to browser).
export const directusOrders = createDirectus<Schema>(directusUrl)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_API_ORDERS_TOKEN ?? ""));

// Public asset URL for client-side <Image> src (set in NEXT_PUBLIC_DIRECTUS_ASSETS_URL).
export const directusAssetsUrl =
  process.env.NEXT_PUBLIC_DIRECTUS_ASSETS_URL ?? directusUrl;

export function buildAssetUrl(
  fileId: string,
  params?: { width?: number; height?: number; format?: string; quality?: number },
): string {
  const qs = new URLSearchParams();
  if (params?.width) qs.set("width", String(params.width));
  if (params?.height) qs.set("height", String(params.height));
  if (params?.format) qs.set("format", params.format);
  if (params?.quality) qs.set("quality", String(params.quality));
  const qsStr = qs.toString();
  return `${directusAssetsUrl}/assets/${fileId}${qsStr ? `?${qsStr}` : ""}`;
}

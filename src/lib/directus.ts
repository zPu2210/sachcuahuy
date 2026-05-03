import "server-only";
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

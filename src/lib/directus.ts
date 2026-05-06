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

export function assertDirectusOrdersConfigured(): void {
  if (!process.env.DIRECTUS_API_ORDERS_TOKEN?.trim()) {
    throw new Error("DIRECTUS_API_ORDERS_TOKEN is not set");
  }
}

export function directusErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== "object") return String(error);

  const directusError = error as {
    message?: unknown;
    errors?: Array<{
      message?: unknown;
      extensions?: { code?: unknown; reason?: unknown };
    }>;
  };
  const messages = [
    typeof directusError.message === "string" ? directusError.message : null,
    ...(directusError.errors ?? []).flatMap((item) => [
      typeof item.message === "string" ? item.message : null,
      typeof item.extensions?.code === "string" ? item.extensions.code : null,
      typeof item.extensions?.reason === "string" ? item.extensions.reason : null,
    ]),
  ].filter(Boolean);

  return messages.length > 0 ? messages.join(" | ") : "unknown_directus_error";
}

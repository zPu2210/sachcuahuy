import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readItems } from "@directus/sdk";
import { z } from "zod";
import { directus } from "@/lib/directus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_CONTENT_PATHS = [
  "/",
  "/sach",
  "/gioi-thieu",
  "/podcast",
  "/sitemap.xml",
];
const ALLOWED_STATIC_PATHS = new Set([...PUBLIC_CONTENT_PATHS, "/dat-hang"]);
const SUPPORTED_COLLECTIONS = new Set(["books", "site_settings"]);

const PayloadSchema = z
  .object({
    collection: z.string().optional(),
    key: z.union([z.string(), z.number()]).optional(),
    keys: z.array(z.union([z.string(), z.number()])).optional(),
    slug: z.string().optional(),
    slugs: z.array(z.string()).optional(),
    paths: z.array(z.string()).optional(),
  })
  .passthrough();

type RevalidatePayload = z.infer<typeof PayloadSchema>;

function timingSafeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function getProvidedSecret(req: NextRequest): string {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length).trim();
  return req.headers.get("x-revalidate-secret") ?? "";
}

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || expected.length < 16) return false;
  const provided = getProvidedSecret(req);
  if (!provided) return false;
  return timingSafeEqual(provided, expected);
}

function normalizePath(path: string): string | null {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.includes("://")) return null;
  const normalized = trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
  if (ALLOWED_STATIC_PATHS.has(normalized)) return normalized;
  return null;
}

function normalizeSlug(slug: string): string | null {
  const trimmed = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed || trimmed.includes("..") || trimmed.includes("/")) return null;
  return trimmed;
}

function payloadKeys(payload: RevalidatePayload): Array<string | number> {
  if (payload.keys?.length) return payload.keys;
  return payload.key == null ? [] : [payload.key];
}

async function resolveBookSlugs(
  payload: RevalidatePayload,
): Promise<string[]> {
  const explicit = [payload.slug, ...(payload.slugs ?? [])]
    .filter((slug): slug is string => Boolean(slug))
    .map(normalizeSlug)
    .filter((slug): slug is string => Boolean(slug));

  if (explicit.length > 0 || payload.collection !== "books") {
    return explicit;
  }

  const keys = payloadKeys(payload);
  if (keys.length === 0) return [];
  const ids = keys
    .map((key) => Number(key))
    .filter((key) => Number.isInteger(key) && key > 0);
  if (ids.length === 0) return [];

  try {
    const books = (await directus.request(
      readItems("books", {
        filter: { id: { _in: ids } },
        fields: ["slug"],
        limit: ids.length,
      }),
    )) as Array<{ slug?: string | null }>;

    return books
      .map((book) => (book.slug ? normalizeSlug(book.slug) : null))
      .filter((slug): slug is string => Boolean(slug));
  } catch {
    return [];
  }
}

async function pathsForPayload(payload: RevalidatePayload): Promise<string[]> {
  const paths = new Set<string>();

  for (const path of payload.paths ?? []) {
    const normalized = normalizePath(path);
    if (normalized) paths.add(normalized);
  }

  const collection = payload.collection;
  if (!collection || collection === "site_settings") {
    PUBLIC_CONTENT_PATHS.forEach((path) => paths.add(path));
  }

  if (collection === "books") {
    ["/", "/sach", "/gioi-thieu", "/dat-hang", "/sitemap.xml"].forEach((path) =>
      paths.add(path),
    );
  }

  for (const slug of await resolveBookSlugs(payload)) {
    paths.add(`/sach/${slug}`);
  }

  return [...paths];
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const raw =
    req.method === "GET"
      ? Object.fromEntries(req.nextUrl.searchParams.entries())
      : await req.json().catch(() => null);
  if (!raw) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = PayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const collection = parsed.data.collection;
  if (!collection) {
    return NextResponse.json(
      { error: "collection_required" },
      { status: 400 },
    );
  }
  if (!SUPPORTED_COLLECTIONS.has(collection)) {
    return NextResponse.json(
      { error: "unsupported_collection" },
      { status: 400 },
    );
  }

  const paths = await pathsForPayload(parsed.data);
  const typedPaths: Array<{ path: string; type: "page" | "layout" }> = [];
  if (!collection || collection === "site_settings") {
    typedPaths.push({ path: "/", type: "layout" });
  }
  if (collection === "books") {
    typedPaths.push({ path: "/sach/[slug]", type: "page" });
  }

  if (paths.length === 0) {
    return NextResponse.json({ error: "no_paths_resolved" }, { status: 400 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }
  for (const target of typedPaths) {
    revalidatePath(target.path, target.type);
  }

  return NextResponse.json(
    { ok: true, revalidated: { paths, typedPaths } },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}

import { readItems } from "@directus/sdk";
import { directus } from "./directus";
import type { Book } from "./types-directus";

const FIELDS = [
  "*",
  "cover_image.id",
  "cover_image.filename_download",
  "cover_image.width",
  "cover_image.height",
];

export async function getBooks(): Promise<Book[]> {
  const result = await directus.request(
    readItems("books", {
      filter: { status: { _eq: "published" } },
      sort: ["sort_order", "-created_at"],
      fields: FIELDS,
    }),
  );
  return result as unknown as Book[];
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const result = await directus.request(
    readItems("books", {
      filter: { slug: { _eq: slug }, status: { _eq: "published" } },
      limit: 1,
      fields: FIELDS,
    }),
  );
  const books = result as unknown as Book[];
  return books[0] ?? null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

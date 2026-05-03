import type { MetadataRoute } from "next";
import { getBooks } from "@/lib/books";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sachcuahuy.vercel.app"
  ).replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/sach`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/gioi-thieu`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/podcast`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  let bookEntries: MetadataRoute.Sitemap = [];
  try {
    const books = await getBooks();
    bookEntries = books
      .filter((b) => !b.is_coming_soon)
      .map((b) => ({
        url: `${base}/sach/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));
  } catch {
    // Directus unreachable at build/request time → return static-only sitemap.
  }

  return [...staticEntries, ...bookEntries];
}

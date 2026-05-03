import "server-only";
import { readSingleton } from "@directus/sdk";
import { directus } from "./directus";
import type { SiteSettings } from "./types-directus";

export async function getSiteSettings(): Promise<SiteSettings> {
  const result = await directus.request(
    readSingleton("site_settings", {
      fields: ["*", "author_image.id", "author_image.filename_download"],
    }),
  );
  return result as unknown as SiteSettings;
}

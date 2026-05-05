import type { DirectusFile } from "./types-directus";

const directusAssetsUrl =
  process.env.NEXT_PUBLIC_DIRECTUS_ASSETS_URL ?? "https://cms.sachcuahuy.com";

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

export function buildAssetUrlFromFile(
  file: DirectusFile | string | null | undefined,
  params?: { width?: number; height?: number; format?: string; quality?: number },
): string | null {
  if (!file) return null;
  if (typeof file === "string") return buildAssetUrl(file, params);
  return file.id ? buildAssetUrl(file.id, params) : null;
}

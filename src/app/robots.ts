import type { MetadataRoute } from "next";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sachcuahuy.vercel.app"
  ).replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dat-hang", "/xac-nhan/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

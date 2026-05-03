import type { NextConfig } from "next";

const directusUrl = process.env.DIRECTUS_URL;
const directusHost = directusUrl ? new URL(directusUrl).hostname : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(directusHost
        ? [
            {
              protocol: "https" as const,
              hostname: directusHost,
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "img.vietqr.io",
      },
      {
        protocol: "https" as const,
        hostname: "api.dicebear.com",
      },
    ],
  },
};

export default nextConfig;

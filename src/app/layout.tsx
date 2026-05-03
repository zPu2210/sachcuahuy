import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Dancing_Script } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLdOrganization } from "@/components/seo/json-ld";
import { getSiteSettings } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const dancing = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-dancing",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sachcuahuy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sách Của Huy - Tác phẩm văn học của Trọng Huy",
    template: "%s | Sách Của Huy",
  },
  description:
    "Sách văn học bìa cứng của tác giả Trọng Huy. Miền Nam của Huy, Góc Phần Tư — những câu chuyện nhỏ kể bằng giọng văn nhẹ nhàng.",
  keywords: [
    "sách",
    "văn học",
    "Trọng Huy",
    "Miền Nam của Huy",
    "Góc Phần Tư",
    "tản văn",
  ],
  authors: [{ name: "Trọng Huy" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Sách Của Huy",
    title: "Sách Của Huy",
    description: "Tác phẩm văn học của Trọng Huy",
    url: SITE_URL,
    images: [
      {
        url: "/images/book-cover-front.png",
        width: 1200,
        height: 630,
        alt: "Sách Của Huy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sách Của Huy",
    description: "Tác phẩm văn học của Trọng Huy",
    images: ["/images/book-cover-front.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E2B4D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    settings = await getSiteSettings();
  } catch {
    // Directus down at request time → render layout without org schema.
  }

  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${cormorant.variable} ${dancing.variable} font-sans`}
      >
        {settings && <JsonLdOrganization settings={settings} />}
        <Header />
        <main>{children}</main>
        <Footer settings={settings} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

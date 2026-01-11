import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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

export const metadata: Metadata = {
  title: "Sách Của Huy - Tác phẩm văn học của Trọng Huy",
  description:
    "Sách văn học bìa cứng của tác giả Trọng Huy. Miền Nam của Huy - Nơi ấy có Mina và một mái nhà.",
  keywords: ["sách", "văn học", "Trọng Huy", "Miền Nam của Huy", "tản văn"],
  authors: [{ name: "Trọng Huy" }],
  openGraph: {
    title: "Sách Của Huy",
    description: "Tác phẩm văn học của Trọng Huy",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${cormorant.variable} ${dancing.variable} font-sans`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

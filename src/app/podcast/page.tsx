import type { Metadata } from "next";
import { ComingSoonHero } from "@/components/podcast/coming-soon-hero";

export const metadata: Metadata = {
  title: "Podcast - Sắp Ra Mắt",
  description:
    "Podcast Sách Của Huy: những câu chuyện bên ly cà phê. Sắp ra mắt.",
  openGraph: {
    title: "Podcast Sách Của Huy",
    description: "Những câu chuyện bên ly cà phê. Sắp ra mắt.",
    type: "website",
  },
};

export default function PodcastPage() {
  return <ComingSoonHero />;
}

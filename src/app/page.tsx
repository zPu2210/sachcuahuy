import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { AuthorSection } from "@/components/home/author-section";
import { BooksSection } from "@/components/home/books-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CTASection } from "@/components/home/cta-section";
import { buildAssetUrlFromFile } from "@/lib/directus-assets";
import { getBooks } from "@/lib/books";
import { getSiteSettings } from "@/lib/site-config";

export const revalidate = 300;

const AUTHOR_NAME = "Trọng Huy";
const AUTHOR_TITLE = "Tác giả • Voice Talent";
const AUTHOR_FALLBACK_BIO =
  "Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn. Phát thanh viên radio — Voice Talent Quảng Cáo.";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const s = await getSiteSettings();
    const description =
      s.hero_subtitle ||
      "Tác phẩm văn học của Trọng Huy. Miền Nam của Huy, Góc Phần Tư.";
    return {
      title: { absolute: s.hero_title || "Sách Của Huy" },
      description,
      openGraph: {
        title: s.hero_title || "Sách Của Huy",
        description,
        type: "website",
      },
      alternates: { canonical: "/" },
    };
  } catch {
    return { alternates: { canonical: "/" } };
  }
}

export default async function HomePage() {
  const [books, settings] = await Promise.all([getBooks(), getSiteSettings()]);

  const featured = books.find((b) => b.is_new) ?? books[0];
  const authorImageUrl = buildAssetUrlFromFile(settings.author_image, {
    width: 480,
    height: 480,
    format: "webp",
    quality: 85,
  });

  return (
    <>
      {featured && (
        <HeroSection
          featuredBook={featured}
          title={settings.hero_title}
          subtitle={settings.hero_subtitle}
        />
      )}
      <AuthorSection
        name={AUTHOR_NAME}
        title={AUTHOR_TITLE}
        shortBio={settings.author_short_bio || AUTHOR_FALLBACK_BIO}
        imageUrl={authorImageUrl}
      />
      <BooksSection books={books} />
      <FeaturesSection
        shippingFreeCities={settings.shipping_free_cities}
        shippingFlatFee={settings.shipping_flat_fee}
        shippingThreshold={settings.shipping_threshold}
      />
      {featured && <CTASection featuredBook={featured} />}
    </>
  );
}

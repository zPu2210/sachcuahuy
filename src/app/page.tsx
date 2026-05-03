import { HeroSection } from "@/components/home/hero-section";
import { AuthorSection } from "@/components/home/author-section";
import { BooksSection } from "@/components/home/books-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CTASection } from "@/components/home/cta-section";
import { getBooks } from "@/lib/books";
import { getSiteSettings } from "@/lib/site-config";

export const revalidate = 300;

const AUTHOR_NAME = "Trọng Huy";
const AUTHOR_TITLE = "Tác giả • Voice Talent";
const AUTHOR_FALLBACK_BIO =
  "Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn. Phát thanh viên radio — Voice Talent Quảng Cáo.";

export default async function HomePage() {
  const [books, settings] = await Promise.all([getBooks(), getSiteSettings()]);

  const featured = books.find((b) => b.is_new) ?? books[0];

  return (
    <>
      {featured && <HeroSection featuredBook={featured} />}
      <AuthorSection
        name={AUTHOR_NAME}
        title={AUTHOR_TITLE}
        shortBio={settings.author_short_bio || AUTHOR_FALLBACK_BIO}
      />
      <BooksSection books={books} />
      <FeaturesSection />
      {featured && <CTASection featuredBook={featured} />}
    </>
  );
}
